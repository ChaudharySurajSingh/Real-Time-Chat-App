import { ChatState } from "../Context/ChatProvider";
import SingleChat from "./SingleChat";

const Chatbox = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat } = ChatState();

  return (
    <section className={selectedChat ? "chatbox active" : "chatbox"}>
      <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
    </section>
  );
};

export default Chatbox;
