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

## Setup

Install dependencies:

```bash
npm install
npm install --prefix frontend
```

Create `backend/.env` from `backend/.env.example` and add your Mongo URI and JWT secret.

Run backend:

```bash
npm run dev
```

Run frontend in another terminal:

```bash
npm run client
```

Backend runs on `http://localhost:5000`.
Frontend runs on `http://localhost:3000`.

## Notes

- Guest login creates a guest user automatically if it does not exist.
- Profile pictur functionality removed because of dependency on cloud
