import { useEffect, useRef } from "react";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";
import Avatar from "./Avatar";

const ScrollableChat = ({ messages }) => {
  const { selectedChat, user } = ChatState();
  const bottomRef = useRef(null);
  const shouldShowSenderAvatars = Boolean(selectedChat?.isGroupChat);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="scrollable-feed">
      {messages?.map((m, i) => {
        const isOwnMessage = m.sender._id === user._id;
        const showAvatar =
          shouldShowSenderAvatars &&
          (isSameSender(messages, m, i, user._id) ||
            isLastMessage(messages, i, user._id));
        const messageStyle = {
          marginLeft: isSameSenderMargin(messages, m, i, user._id),
          marginTop: isSameUser(messages, m, i, user._id) ? 4 : 10,
        };

        return (
          <div className={isOwnMessage ? "message-row mine" : "message-row"} key={m._id}>
            {showAvatar && (
              <Avatar user={m.sender} className="message-avatar" />
            )}
            <div className="message-wrap" style={messageStyle}>
              <span className={isOwnMessage ? "message mine" : "message"}>
                {m.content}
              </span>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
};

export default ScrollableChat;
