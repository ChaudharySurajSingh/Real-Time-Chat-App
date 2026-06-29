import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../config/apiClient";
import { getSender } from "../../config/ChatLogics";
import { ChatState } from "../../Context/ChatProvider";
import { notify } from "../../utils/toast";
import ChatLoading from "../ChatLoading";
import Icon from "../Icon";
import UserInitial from "../UserInitial";
import UserListItem from "../user/UserListItem";
import ProfileModal from "./ProfileModal";

function SideDrawer() {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  const {
    setSelectedChat,
    user,
    notification,
    setNotification,
    chats,
    setChats,
  } = ChatState();

  const navigate = useNavigate();
  const canSearch = Boolean(search.trim()) && !loading;
  const notificationGroups = notification.reduce((groups, notif) => {
    const chatId = notif.chat?._id;

    if (!chatId) return groups;

    if (!groups[chatId]) {
      groups[chatId] = {
        chat: notif.chat,
        latest: notif,
        count: 0,
      };
    }
    groups[chatId].count += 1;
    groups[chatId].latest = notif;
    return groups;
  }, {});
  const notificationItems = Object.values(notificationGroups);

  useEffect(() => {
    const closeDropdowns = (event) => {
      const clickedNotification = notificationRef.current?.contains(event.target);
      const clickedProfile = profileRef.current?.contains(event.target);

      if (!clickedNotification) {
        setIsNotificationOpen(false);
      }

      if (!clickedProfile) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", closeDropdowns);
    return () => document.removeEventListener("mousedown", closeDropdowns);
  }, []);

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  const handleSearch = async () => {
    const searchText = search.trim();

    if (!searchText) {
      notify({ title: "Please enter something in search", status: "warning" });
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

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const { data } = await apiClient.post(
        "/api/chat",
        { userId },
        {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (!(chats || []).find((c) => c._id === data._id)) {
        setChats([data, ...(chats || [])]);
      }
      setSelectedChat(data);
      setIsSearchOpen(false);
    } catch (error) {
      notify({
        title: "Error fetching the chat",
        description: error.message,
        status: "error",
      });
    } finally {
      setLoadingChat(false);
    }
  };

  return (
    <>
      <header className="topbar">
        <button className="ghost-button" onClick={() => setIsSearchOpen(true)} type="button">
          <Icon name="search" />
          Search
        </button>
        <h1>SanDesh</h1>
        <div className="topbar-actions">
          <div className="dropdown" ref={notificationRef}>
            <button
              className="icon-button"
              aria-label="Notifications"
              onClick={() => {
                setIsNotificationOpen(!isNotificationOpen);
                setIsMenuOpen(false);
              }}
              type="button"
            >
              {notification.length > 0 && (
                <span className="notification-badge">{notification.length}</span>
              )}
              <Icon name="bell" />
            </button>
            {isNotificationOpen && (
              <div className="dropdown-menu notification-menu">
                <div className="notification-menu-title">Notifications</div>
                {!notificationItems.length && (
                  <span className="notification-empty">No new messages</span>
                )}
                {notificationItems.map((item) => (
                  <button
                    className="notification-item"
                    key={item.chat._id}
                    onClick={() => {
                      setSelectedChat(item.chat);
                      setNotification(notification.filter((n) => n.chat?._id !== item.chat._id));
                      setIsNotificationOpen(false);
                    }}
                    type="button"
                  >
                    <UserInitial user={item.latest.sender} />
                    <span>
                      <strong>
                        {item.chat.isGroupChat
                          ? item.chat.chatName
                          : getSender(user, item.chat.users)}
                      </strong>
                      <small>
                        {item.count > 1
                          ? `${item.count} new messages`
                          : item.latest.content}
                      </small>
                    </span>
                    {item.count > 1 && <b>{item.count}</b>}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="dropdown" ref={profileRef}>
            <button
              className="profile-trigger profile-chip"
              onClick={() => {
                setIsMenuOpen(!isMenuOpen);
                setIsNotificationOpen(false);
              }}
              type="button"
            >
              <UserInitial user={user} />
              <span className="profile-chip-text">{user.name}</span>
              <Icon name="chevronDown" />
            </button>
            {isMenuOpen && (
              <div className="dropdown-menu profile-menu right">
                <div className="profile-menu-header">
                  <UserInitial user={user} />
                  <span>
                    <strong>{user.name}</strong>
                    <small>{user.email}</small>
                  </span>
                </div>
                <ProfileModal user={user}>
                  <button className="menu-action" type="button">
                    <Icon name="user" />
                    My Profile
                  </button>
                </ProfileModal>
                <button className="menu-action logout-action" onClick={logoutHandler} type="button">
                  <Icon name="logout" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {isSearchOpen && (
        <div className="drawer-backdrop" onClick={() => setIsSearchOpen(false)} role="presentation">
          <aside className="drawer" onClick={(e) => e.stopPropagation()}>
            <header>
              <h2>Search Users</h2>
              <button
                className="modal-close"
                aria-label="Close search"
                onClick={() => setIsSearchOpen(false)}
                type="button"
              >
                <Icon name="close" />
              </button>
            </header>
            <div className="input-with-action">
              <input
                placeholder="Search by name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button onClick={handleSearch} type="button" disabled={!canSearch}>
                <Icon name="search" />
                Go
              </button>
            </div>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((result) => (
                <UserListItem
                  key={result._id}
                  user={result}
                  handleFunction={() => accessChat(result._id)}
                />
              ))
            )}
            {loadingChat && <div className="inline-loading">Opening chat...</div>}
          </aside>
        </div>
      )}
    </>
  );
}

export default SideDrawer;
