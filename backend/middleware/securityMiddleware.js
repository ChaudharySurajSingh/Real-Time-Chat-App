const WINDOW_MS = 60 * 1000;
const buckets = new Map();

const normalizeOrigin = (origin) => {
  if (!origin) return "";

  try {
    return new URL(origin).origin;
  } catch {
    return "";
  }
};

export const getAllowedOrigins = () =>
  (process.env.CLIENT_URL || "http://localhost:3000")
    .split(",")
    .map((origin) => normalizeOrigin(origin.trim()))
    .filter(Boolean);

const getAllowedOriginPatterns = () =>
  (process.env.CLIENT_URL_PATTERNS || "")
    .split(",")
    .map((pattern) => pattern.trim())
    .filter(Boolean)
    .map((pattern) => {
      try {
        return new RegExp(pattern);
      } catch {
        console.warn(`Ignoring invalid CLIENT_URL_PATTERNS entry: ${pattern}`);
        return null;
      }
    })
    .filter(Boolean);

const isOriginAllowed = (origin) => {
  const normalizedOrigin = normalizeOrigin(origin);

  if (!normalizedOrigin) return true;
  if (process.env.NODE_ENV !== "production") return true;
  if (getAllowedOrigins().includes(normalizedOrigin)) return true;

  return getAllowedOriginPatterns().some((pattern) =>
    pattern.test(normalizedOrigin),
  );
};

const getClientIp = (req) => {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (typeof forwardedFor === "string" && forwardedFor.trim()) {
    return forwardedFor.split(",")[0].trim();
  }

  return req.socket?.remoteAddress || "unknown";
};

export const securityHeaders = (req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), geolocation=(), microphone=()");

  if (req.path.startsWith("/api")) {
    res.setHeader("Cache-Control", "no-store");
  }

  next();
};

export const corsMiddleware = (req, res, next) => {
  const origin = req.headers.origin;

  res.header("Vary", "Origin");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  );

  if (!isOriginAllowed(origin)) {
    return res.status(403).json({ message: "Origin is not allowed" });
  }

  res.header("Access-Control-Allow-Origin", origin || "*");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
};

export const createRateLimit = ({ max = 120, windowMs = WINDOW_MS, scope }) => {
  return (req, res, next) => {
    const now = Date.now();
    const key = `${scope}:${getClientIp(req)}`;
    const current = buckets.get(key);

    if (!current || current.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    current.count += 1;

    if (current.count > max) {
      const retryAfter = Math.ceil((current.resetAt - now) / 1000);
      res.setHeader("Retry-After", String(retryAfter));
      return res.status(429).json({
        message: "Too many requests. Please try again shortly.",
      });
    }

    next();
  };
};
