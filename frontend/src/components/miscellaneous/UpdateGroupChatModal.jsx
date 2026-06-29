import { useState } from "react";
import apiClient from "../../config/apiClient";
import { ChatState } from "../../Context/ChatProvider";
import { notify } from "../../utils/toast";
import Icon from "../Icon";
import UserBadgeItem from "../user/UserBadgeItem";
import UserListItem from "../user/UserListItem";

const UpdateGroupChatModal = ({ fetchMessages, fetchAgain, setFetchAgain }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [groupChatName, setGroupChatName] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameLoading, setRenameLoading] = useState(false);
  const { selectedChat, setSelectedChat, user } = ChatState();
  const canRename = Boolean(groupChatName.trim()) && !renameLoading;

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

  const handleRename = async () => {
    if (!groupChatName.trim()) return;

    try {
      setRenameLoading(true);
      const { data } = await apiClient.put(
        "/api/chat/rename",
        { chatId: selectedChat._id, chatName: groupChatName.trim() },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setGroupChatName("");
    } catch (error) {
      notify({
        title: "Error occurred",
        description: error.response?.data?.message || "Unable to rename group",
        status: "error",
      });
    } finally {
      setRenameLoading(false);
    }
  };

  const handleAddUser = async (userToAdd) => {
    if (selectedChat.users.find((u) => u._id === userToAdd._id)) {
      notify({ title: "User already in group", status: "error" });
      return;
    }
    if (selectedChat.groupAdmin._id !== user._id) {
      notify({ title: "Only admins can add someone", status: "error" });
      return;
    }

    try {
      setLoading(true);
      const { data } = await apiClient.put(
        "/api/chat/groupadd",
        { chatId: selectedChat._id, userId: userToAdd._id },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
    } catch (error) {
      notify({
        title: "Error occurred",
        description: error.response?.data?.message || "Unable to add user",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (userToRemove) => {
    if (selectedChat.groupAdmin._id !== user._id && userToRemove._id !== user._id) {
      notify({ title: "Only admins can remove someone", status: "error" });
      return;
    }

    try {
      setLoading(true);
      const { data } = await apiClient.put(
        "/api/chat/groupremove",
        { chatId: selectedChat._id, userId: userToRemove._id },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      userToRemove._id === user._id ? setSelectedChat() : setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      fetchMessages();
    } catch (error) {
      notify({
        title: "Error occurred",
        description: error.response?.data?.message || "Unable to remove user",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className="icon-button" onClick={() => setIsOpen(true)} type="button">
        <Icon name="eye" />
        View
      </button>
      {isOpen && (
        <div className="modal-backdrop" role="presentation" onClick={() => setIsOpen(false)}>
          <div
            className="modal group-modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              aria-label="Close"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              <Icon name="close" />
            </button>
            <header className="group-modal-header">
              <h2>{selectedChat.chatName}</h2>
              <p>Manage group name and members.</p>
            </header>
            <div className="badge-row member-row">
              {selectedChat.users.map((chatUser) => (
                <UserBadgeItem
                  key={chatUser._id}
                  user={chatUser}
                  admin={selectedChat.groupAdmin}
                  handleFunction={() => handleRemove(chatUser)}
                />
              ))}
            </div>
            <div className="form-stack">
              <label className="field">
                <span>Group name</span>
                <div className="input-with-action">
                  <input
                    placeholder="New group name"
                    value={groupChatName}
                    onChange={(e) => setGroupChatName(e.target.value)}
                  />
                  <button onClick={handleRename} disabled={!canRename} type="button">
                    {renameLoading ? "Saving..." : "Save"}
                  </button>
                </div>
              </label>
              <label className="field">
                <span>Add members</span>
                <input placeholder="Search name or email" onChange={(e) => handleSearch(e.target.value)} />
              </label>
              <div className="modal-list">
                {loading ? (
                  <div className="inline-loading">Loading...</div>
                ) : (
                  searchResult.map((result) => (
                    <UserListItem
                      key={result._id}
                      user={result}
                      handleFunction={() => handleAddUser(result)}
                    />
                  ))
                )}
              </div>
            </div>
            <footer className="modal-footer">
              <button className="danger-button" onClick={() => handleRemove(user)} type="button">
                Leave Group
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
};

export default UpdateGroupChatModal;
