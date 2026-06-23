const getInitial = (name = "") => {
  const trimmedName = name.trim();
  return trimmedName ? trimmedName[0].toUpperCase() : "?";
};

const Avatar = ({ user, size = "small", className = "", title }) => {
  const name = user?.name || "User";
  const classes = ["avatar", size, className].filter(Boolean).join(" ");

  return (
    <span className={`${classes} avatar-fallback`} title={title || name}>
      {getInitial(name)}
    </span>
  );
};

export default Avatar;
