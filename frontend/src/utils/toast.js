export const notify = ({ title, description, status = "info" }) => {
  window.dispatchEvent(
    new CustomEvent("app-toast", {
      detail: {
        id: crypto.randomUUID(),
        title,
        description,
        status,
      },
    })
  );
};
