# SanDesh

A simple real-time chat app built with React, Vite, Express, MongoDB, and Socket.IO.

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

The backend uses Express with Socket.IO, so it needs a long-running Node server. Host it on a service that supports WebSockets, such as Render, Railway, Fly.io, or a VPS. Set these backend environment variables on that host:

```bash
NODE_ENV=production
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_secret
CLIENT_URL=https://your-vercel-app.vercel.app
GUEST_EMAIL=guest@example.com
GUEST_NAME=Guest User
GUEST_PASSWORD=your_guest_password
```

For Vercel preview deployments, add each preview URL to `CLIENT_URL` as a comma-separated value, or use the production Vercel domain for final testing.

## Notes

- Guest login creates a guest user automatically if it does not exist.
- Profile picture functionality was removed because it depended on cloud uploads.
