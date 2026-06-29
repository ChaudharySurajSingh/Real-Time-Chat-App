const getInitial = (name = "") => {
  const trimmedName = name.trim();
  return trimmedName ? trimmedName[0].toUpperCase() : "?";
};

const UserInitial = ({ user, size = "small", className = "", title }) => {
  const name = user?.name || "User";
  const classes = ["user-initial", size, className].filter(Boolean).join(" ");

  return (
    <span className={classes} title={title || name}>
      {getInitial(name)}
    </span>
  );
};

export default UserInitial;
