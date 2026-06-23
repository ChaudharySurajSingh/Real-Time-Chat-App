import { useEffect, useState } from "react";

const toastIcon = {
  success: "OK",
  error: "!",
  warning: "!",
  info: "i",
};

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const addToast = (event) => {
      const toast = event.detail;
      setToasts((current) => [...current, toast]);

      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== toast.id));
      }, 3200);
    };

    window.addEventListener("app-toast", addToast);
    return () => window.removeEventListener("app-toast", addToast);
  }, []);

  return (
    <div className="toast-region" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div className={`toast toast-${toast.status}`} key={toast.id}>
          <span className="toast-icon">{toastIcon[toast.status] || "i"}</span>
          <span>
            <strong>{toast.title}</strong>
            {toast.description && <small>{toast.description}</small>}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
