import { useState } from "react";
import apiClient from "../../config/apiClient";
import { ChatState } from "../../Context/ChatProvider";
import { notify } from "../../utils/toast";
import Icon from "../Icon";
import UserBadgeItem from "../userAvatar/UserBadgeItem";
import UserListItem from "../userAvatar/UserListItem";

const GroupChatModal = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { user, chats, setChats } = ChatState();
  const groupNameError = !groupChatName.trim() ? "Group name is required." : "";
  const selectedUsersError =
    selectedUsers.length < 2 ? "Add at least 2 users to create a group." : "";
  const canCreateGroup = !groupNameError && !selectedUsersError;

  const closeModal = () => setIsOpen(false);

  const handleGroup = (userToAdd) => {
    if (selectedUsers.find((selected) => selected._id === userToAdd._id)) {
      notify({ title: "User already added", status: "warning" });
      return;
    }
    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  const handleSearch = async (query) => {
    const searchText = query.trim();

    if (!searchText) {
      setSearchResult([]);
      return;
    }

    try {
      setLoading(true);
      const { data } = await apiClient.get(`/api/user?search=${encodeURIComponent(searchText)}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setSearchResult(data);
    } catch (error) {
      notify({
        title: "Error occurred",
        description: "Failed to load the search results",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitted(true);

    if (!canCreateGroup) {
      return;
    }

    try {
      const { data } = await apiClient.post(
        "/api/chat/group",
        {
          name: groupChatName.trim(),
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setChats([data, ...(chats || [])]);
      closeModal();
      notify({ title: "New group chat created", status: "success" });
    } catch (error) {
      notify({
        title: "Failed to create the chat",
        description: error.response?.data?.message || "Please try again",
        status: "error",
      });
    }
  };

  return (
    <>
      <span onClick={() => setIsOpen(true)}>{children}</span>
      {isOpen && (
        <div className="modal-backdrop" role="presentation" onClick={closeModal}>
          <div
            className="modal group-modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close" aria-label="Close" onClick={closeModal} type="button">
              <Icon name="close" />
            </button>
            <header className="group-modal-header">
              <h2>Create Group</h2>
              <p>Add at least two people and choose a clean group name.</p>
            </header>
            <div className="form-stack">
              <label className="field">
                <span>Group name</span>
                <input
                  placeholder="Weekend plan"
                  value={groupChatName}
                  onChange={(e) => setGroupChatName(e.target.value)}
                />
              </label>
              {submitted && groupNameError && (
                <small className="field-error">{groupNameError}</small>
              )}
              <label className="field">
                <span>Members</span>
                <input
                  placeholder="Search name or email"
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </label>
              <div className="badge-row">
                {selectedUsers.map((selectedUser) => (
                  <UserBadgeItem
                    key={selectedUser._id}
                    user={selectedUser}
                    handleFunction={() =>
                      setSelectedUsers(selectedUsers.filter((u) => u._id !== selectedUser._id))
                    }
                  />
                ))}
              </div>
              <div className="modal-list">
                {loading ? (
                  <div className="inline-loading">Loading...</div>
                ) : (
                  searchResult.slice(0, 4).map((result) => (
                    <UserListItem
                      key={result._id}
                      user={result}
                      handleFunction={() => handleGroup(result)}
                    />
                  ))
                )}
              </div>
              {submitted && selectedUsersError && (
                <small className="field-error">{selectedUsersError}</small>
              )}
            </div>
            <footer className="modal-footer">
              <button
                className="primary-button"
                onClick={handleSubmit}
                type="button"
                disabled={!canCreateGroup}
              >
                Create Chat
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
};

export default GroupChatModal;
