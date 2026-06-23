import { useEffect, useState } from "react";
import { getSender } from "../config/ChatLogics";
import apiClient from "../config/apiClient";
import { ChatState } from "../Context/ChatProvider";
import { notify } from "../utils/toast";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./miscellaneous/GroupChatModal";

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();
  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();

  const fetchChats = async () => {
    if (!user?.token) return;

    try {
      const { data } = await apiClient.get("/api/chat", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setChats(data);
    } catch (error) {
      notify({
        title: "Error occurred",
        description: "Failed to load the chats",
        status: "error",
      });
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
  }, [fetchAgain, user]);

  return (
    <aside className={selectedChat ? "my-chats hidden-mobile" : "my-chats"}>
      <header className="panel-header">
        <h2>My Chats</h2>
        <GroupChatModal>
          <button className="secondary-button compact" type="button">
            New Group
          </button>
        </GroupChatModal>
      </header>
      <div className="chat-list">
        {chats ? (
          chats.map((chat) => (
            <div
              className={
                selectedChat?._id === chat._id ? "chat-list-row active" : "chat-list-row"
              }
              key={chat._id}
            >
              <button
                className="chat-list-item"
                onClick={() => setSelectedChat(chat)}
                type="button"
              >
                <strong>
                  {!chat.isGroupChat ? getSender(loggedUser, chat.users) : chat.chatName}
                </strong>
                {chat.latestMessage && (
                  <small>
                    <b>{chat.latestMessage.sender.name}: </b>
                    {chat.latestMessage.content.length > 50
                      ? `${chat.latestMessage.content.substring(0, 51)}...`
                      : chat.latestMessage.content}
                  </small>
                )}
              </button>
            </div>
          ))
        ) : (
          <ChatLoading />
        )}
      </div>
    </aside>
  );
};

export default MyChats;
