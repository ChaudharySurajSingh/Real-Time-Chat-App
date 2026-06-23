const ChatLoading = () => {
  return (
    <div className="loading-stack">
      {Array.from({ length: 12 }).map((_, index) => (
        <div className="skeleton-row" key={index} />
      ))}
    </div>
  );
};

export default ChatLoading;
