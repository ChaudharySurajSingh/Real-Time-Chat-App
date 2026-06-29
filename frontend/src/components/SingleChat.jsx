import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { getSender, getSenderFull } from "../config/ChatLogics";
import apiClient from "../config/apiClient";
import { ChatState } from "../Context/ChatProvider";
import { notify } from "../utils/toast";
import Icon from "./Icon";
import ProfileModal from "./miscellaneous/ProfileModal";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import ScrollableChat from "./ScrollableChat";
import "./styles.css";

let socket;
let selectedChatCompare;
const MESSAGE_LIMIT = 50;
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || undefined;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const { selectedChat, setSelectedChat, user, setNotification } = ChatState();
  const selectedUser =
    selectedChat && !selectedChat.isGroupChat
      ? getSenderFull(user, selectedChat.users)
      : null;
  const remainingCharacters = MESSAGE_LIMIT - newMessage.length;
  const isMessageTooLong = remainingCharacters < 0;

  const fetchMessages = async () => {
    if (!selectedChat || !user?.token || !socket) return;

    try {
      setLoading(true);
      const { data } = await apiClient.get(`/api/message/${selectedChat._id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setMessages(data);
      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      notify({
        title: "Error occurred",
        description: "Failed to load the messages",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (event) => {
    event.preventDefault();

    if (!newMessage.trim() || !socket || isMessageTooLong) {
      return;
    }

    socket.emit("stop typing", selectedChat._id);
    setTyping(false);
    clearTimeout(typingTimeoutRef.current);
    try {
      const message = newMessage.trim();
      setNewMessage("");
      const { data } = await apiClient.post(
        "/api/message",
        { content: message, chatId: selectedChat._id },
        {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      socket.emit("new message", data);
      setMessages((currentMessages) => [...currentMessages, data]);
    } catch (error) {
      notify({
        title: "Error occurred",
        description: "Failed to send the message",
        status: "error",
      });
    }
  };

  useEffect(() => {
    if (!user) return undefined;

    socket = io(SOCKET_URL);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    return () => {
      clearTimeout(typingTimeoutRef.current);
      socket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    setIsTyping(false);
    setTyping(false);
    clearTimeout(typingTimeoutRef.current);
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat, socketConnected, user?.token]);

  useEffect(() => {
    if (!socket || !socketConnected) return;

    const handleMessageReceived = (newMessageReceived) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageReceived.chat._id
      ) {
        setNotification((currentNotifications) => {
          if (currentNotifications.some((item) => item._id === newMessageReceived._id)) {
            return currentNotifications;
          }

          return [newMessageReceived, ...currentNotifications];
        });
        setFetchAgain((currentFetchAgain) => !currentFetchAgain);
      } else {
        setMessages((currentMessages) => [...currentMessages, newMessageReceived]);
      }
    };

    socket.on("message received", handleMessageReceived);
    return () => {
      socket.off("message received", handleMessageReceived);
    };
  }, [setFetchAgain, setNotification, socketConnected]);

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected || !selectedChat) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop typing", selectedChat._id);
      setTyping(false);
    }, 1800);
  };

  if (!selectedChat) {
    return (
      <div className="empty-chat">
        <h2>Select a chat</h2>
      </div>
    );
  }

  return (
    <>
      <header className="single-chat-header">
        <button className="icon-button mobile-only" onClick={() => setSelectedChat("")} type="button">
          <Icon name="back" />
          Back
        </button>
        <h2>
          {!selectedChat.isGroupChat
            ? getSender(user, selectedChat.users)
            : selectedChat.chatName.toUpperCase()}
        </h2>
        {!selectedChat.isGroupChat ? (
          <ProfileModal user={selectedUser} />
        ) : (
          <UpdateGroupChatModal
            fetchMessages={fetchMessages}
            fetchAgain={fetchAgain}
            setFetchAgain={setFetchAgain}
          />
        )}
      </header>
      <section className="message-panel">
        {loading ? (
          <div className="spinner" />
        ) : (
          <div className="messages">
            <ScrollableChat messages={messages} />
          </div>
        )}
        {isTyping && (
          <div
            className="typing-indicator chat-typing"
            aria-label="Other user is typing"
            aria-live="polite"
          >
            <span />
            <span />
            <span />
            <span />
          </div>
        )}
        <form className="message-composer" onSubmit={sendMessage}>
          <div className="input-with-action">
            <input
              placeholder="Message"
              value={newMessage}
              onChange={typingHandler}
              aria-label="Message"
              maxLength={MESSAGE_LIMIT}
            />
            <span
              className={
                isMessageTooLong ? "composer-counter over-limit" : "composer-counter"
              }
            >
              {remainingCharacters}
            </span>
            <button
              className="send-button"
              type="submit"
              aria-label="Send message"
              title="Send message"
              disabled={!newMessage.trim() || isMessageTooLong}
            >
              <Icon name="send" />
            </button>
          </div>
        </form>
      </section>
    </>
  );
};

export default SingleChat;
