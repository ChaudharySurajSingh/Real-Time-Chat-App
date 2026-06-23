export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export const validatePassword = (password) => {
  if (password.length < 6) {
    return "Password must be at least 6 characters.";
  }

  return "";
};

export const requiredMessage = (label) => `${label} is required.`;
