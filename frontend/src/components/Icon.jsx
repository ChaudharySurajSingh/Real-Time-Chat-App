const Icon = ({ name }) => {
  const common = {
    "aria-hidden": "true",
    className: "ui-icon",
    fill: "none",
    height: "18",
    viewBox: "0 0 24 24",
    width: "18",
  };

  const line = {
    stroke: "currentColor",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: "2",
  };

  switch (name) {
    case "back":
      return (
        <svg {...common}>
          <path {...line} d="M15 18l-6-6 6-6" />
        </svg>
      );
    case "bell":
      return (
        <svg {...common}>
          <path {...line} d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path {...line} d="M10 21h4" />
        </svg>
      );
    case "chevronDown":
      return (
        <svg {...common}>
          <path {...line} d="M6 9l6 6 6-6" />
        </svg>
      );
    case "close":
      return (
        <svg {...common}>
          <path {...line} d="M6 6l12 12" />
          <path {...line} d="M18 6L6 18" />
        </svg>
      );
    case "eye":
      return (
        <svg {...common}>
          <path {...line} d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
          <circle {...line} cx="12" cy="12" r="3" />
        </svg>
      );
    case "eyeOff":
      return (
        <svg {...common}>
          <path {...line} d="M3 3l18 18" />
          <path {...line} d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
          <path {...line} d="M9.9 4.3A10.6 10.6 0 0 1 12 4c6 0 10 8 10 8a18.4 18.4 0 0 1-3.1 4.4" />
          <path {...line} d="M6.6 6.6C3.8 8.5 2 12 2 12s4 8 10 8a10.8 10.8 0 0 0 4.2-.9" />
        </svg>
      );
    case "guest":
    case "user":
      return (
        <svg {...common}>
          <circle {...line} cx="12" cy="8" r="4" />
          <path {...line} d="M4 21a8 8 0 0 1 16 0" />
        </svg>
      );
    case "logout":
      return (
        <svg {...common}>
          <path {...line} d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path {...line} d="M16 17l5-5-5-5" />
          <path {...line} d="M21 12H9" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle {...line} cx="10.5" cy="10.5" r="6.5" />
          <path {...line} d="M16 16l5 5" />
        </svg>
      );
    case "send":
      return (
        <svg {...common}>
          <path {...line} d="M22 2L11 13" />
          <path {...line} d="M22 2l-7 20-4-9-9-4 20-7z" />
        </svg>
      );
    default:
      return null;
  }
};

export default Icon;
