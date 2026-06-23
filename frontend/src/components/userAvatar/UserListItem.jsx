import Avatar from "../Avatar";

const UserListItem = ({ user, handleFunction }) => {
  return (
    <button className="user-list-item" onClick={handleFunction} type="button">
      <Avatar user={user} />
      <span>
        <strong>{user.name}</strong>
        <small>
          <b>Email: </b>
          {user.email}
        </small>
      </span>
    </button>
  );
};

export default UserListItem;
