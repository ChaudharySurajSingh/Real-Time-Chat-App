const UserBadgeItem = ({ user, handleFunction, admin }) => {
  const isAdmin = admin && (admin._id || admin) === user._id;

  return (
    <button className="user-badge" onClick={handleFunction} type="button">
      <span>{user.name}</span>
      {isAdmin && <small>Admin</small>}
      <b aria-hidden="true">×</b>
    </button>
  );
};

export default UserBadgeItem;
