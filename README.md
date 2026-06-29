# SanDesh

SanDesh is a resume-ready MERN chat demo built with React, Vite, Express, MongoDB, JWT auth, and Socket.IO. It includes guest access so recruiters can try the app without creating a personal account.

## Live Demo

- Frontend: https://sandesh-chat-e8wif3m23-chaudharysurajsinghs-projects.vercel.app
- API health: https://backend-sand-ten-14.vercel.app/api/health

## Highlights

- Guest login for recruiter-friendly demos
- JWT authentication with server-side password hashing
- Protected chat, message, and user-search routes
- MongoDB Atlas compatible persistence
- Vercel Hobby compatible frontend and API deployment
- Production CORS allowlist, security headers, request limits, and sanitized errors

## Security Notes

- Passwords are hashed with bcrypt before storage.
- JWT secrets are required and must be at least 32 characters in production.
- API responses include security headers such as `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and a restrictive `Permissions-Policy`.
- Production CORS only allows configured frontend origins and optional explicit URL patterns.
- Auth and API routes include lightweight request throttling suitable for a free demo deployment.
- Server errors are sanitized in production so stack traces are not exposed.

This is a portfolio demo, not a banking-grade security system. Do not commit real `.env` files or production secrets.

## Project Structure

```text
SanDesh/
|-- backend/
|   |-- config/
|   |-- controllers/
|   |-- middleware/
|   |-- models/
|   |-- routes/
|   |-- .env
|   |-- .env.example
|   `-- server.js
|-- frontend/
|   |-- assets/
|   |-- public/
|   |-- src/
|   |-- index.html
|   |-- package.json
|   |-- package-lock.json
|   `-- vite.config.js
|-- package.json
|-- package-lock.json
`-- README.md
```

## Local Setup

Install dependencies:

```bash
npm install --prefix backend
npm install --prefix frontend
```

Create `backend/.env` from `backend/.env.example` and add your Mongo URI and JWT secret.

Run backend:

```bash
npm run dev --prefix backend
```

Run frontend in another terminal:

```bash
npm run dev --prefix frontend
```

Backend runs on `http://localhost:5000`.
Frontend runs on `http://localhost:3000`.

## Deploying the Frontend on Vercel

1. Import this repository in Vercel.
2. Set the Vercel project root directory to `frontend`.
3. Add these Vercel environment variables:

```bash
VITE_API_URL=https://your-backend-host.example.com
VITE_SOCKET_URL=https://your-backend-host.example.com
```

`VITE_SOCKET_URL` can be omitted when it is the same as `VITE_API_URL`.

Vercel will run the frontend build:

```bash
npm ci
npm run build
```

and publish `dist`. SPA routing is handled by the rewrite in `frontend/vercel.json`.

## Deploying the Backend

The REST API can run on Vercel Hobby through `backend/api/index.js`. Persistent Socket.IO realtime needs a long-running Node host such as Render, Railway, Fly.io, or a VPS. For a free recruiter demo, REST auth, guest login, chats, and messages can run on Vercel serverless.

Set these backend environment variables on the API host:

```bash
NODE_ENV=production
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_random_32_plus_character_secret
CLIENT_URL=https://your-vercel-app.vercel.app
CLIENT_URL_PATTERNS=^https://your-project-[a-z0-9]+-your-scope\.vercel\.app$
GUEST_EMAIL=guest@example.com
GUEST_NAME=Guest User
GUEST_PASSWORD=your_random_demo_password
```

For Vercel preview deployments, add each preview URL to `CLIENT_URL` as a comma-separated value, or use the production Vercel domain for final testing.

## Free Deployment Checklist

1. Use MongoDB Atlas free tier for the database.
2. Deploy `backend/` to Vercel Hobby for REST API demo mode.
3. Deploy `frontend/` to Vercel Hobby.
4. Set `VITE_API_URL` in the frontend project to the backend API URL.
5. Set `CLIENT_URL` in the backend project to the frontend URL.
6. Use a generated 32+ character `JWT_SECRET`.
7. Confirm `/api/health` returns `{"status":"ok","database":"connected"}`.
8. Confirm guest login works from the live frontend.

## Notes

- Guest login creates a guest user automatically if it does not exist.
- Profile picture functionality was removed because it depended on cloud uploads.
