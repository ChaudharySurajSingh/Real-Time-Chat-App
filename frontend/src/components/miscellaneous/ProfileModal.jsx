import { useState } from "react";
import Avatar from "../Avatar";
import Icon from "../Icon";

const ProfileModal = ({ user, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {children ? (
        <span className="profile-modal-trigger" onClick={() => setIsOpen(true)}>
          {children}
        </span>
      ) : (
        <button className="icon-button" onClick={() => setIsOpen(true)} type="button">
          <Icon name="eye" />
          View
        </button>
      )}
      {isOpen && (
        <div className="modal-backdrop" role="presentation" onClick={() => setIsOpen(false)}>
          <div
            className="modal profile-modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="profile-content">
              <Avatar user={user} size="large" />
              <h2>{user.name}</h2>
              <span className="profile-email">{user.email}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileModal;
