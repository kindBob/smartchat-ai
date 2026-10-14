# SmartChat AI

SmartChat AI is a full-stack chat application that lets users have conversations with Google Gemini, organize chat history, and return to saved chats across sessions. It pairs a React and TypeScript frontend with a NestJS API, Neon Auth, and PostgreSQL.

## Features

- Email sign-up and sign-in with email verification, powered by Neon Auth
- Private chat histories stored in PostgreSQL
- Create, rename, and delete conversations
- Gemini-generated responses and concise chat titles
- Stop an in-progress response and retry after a failed request
- Markdown rendering for assistant messages, including code highlighting and math
- Responsive chat interface with a typing indicator
- Per-user chat access checks and API throttling

## Tech stack

| Area | Technologies |
| --- | --- |
| Frontend | React, TypeScript, Vite, SCSS, Lucide React |
| Authentication | Neon Auth (`@neondatabase/auth`) |
| Backend | NestJS, TypeScript, Google GenAI SDK |
| Database | Neon PostgreSQL, Prisma, `@prisma/adapter-pg` |

## Architecture

```text
React + TypeScript frontend
  ├── Neon Auth (email authentication)
  └── Authenticated REST requests
          │
          ▼
NestJS API ───── Google Gemini API
    │
    └────────── Neon PostgreSQL (Prisma)
```

The frontend obtains a Neon Auth session token and sends it as a Bearer token to the API. The API validates tokens against Neon Auth's JWKS endpoint, scopes chat operations to the authenticated user, and stores chats and messages in PostgreSQL.

## Prerequisites

- Node.js and npm
- A Google Gemini API key
- A Neon PostgreSQL database and Neon Auth configuration

## Getting started

### 1. Clone the repository

```bash
git clone https://github.com/kindBob/smartchat-ai.git
cd smartchat-ai
```

### 2. Configure the backend

Create `nest-backend/.env` using `nest-backend/.env.example` as a reference:

```env
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-3.5-flash-lite
PORT=3001
FRONTEND_URL=http://localhost:5173
DATABASE_URL=your-neon-pooled-connection-string
DATABASE_URL_UNPOOLED=your-neon-direct-connection-string
NEON_BRANCH=production
NEON_AUTH_URL=your-neon-auth-url
NEON_AUTH_JWKS_URL=your-neon-auth-jwks-url
```

`GEMINI_API_KEY`, `GEMINI_MODEL`, `PORT`, `FRONTEND_URL`, `DATABASE_URL`, `NEON_AUTH_URL`, and `NEON_AUTH_JWKS_URL` are read by the running application. Prisma's configuration reads `DATABASE_URL` for database migrations. The example also includes `DATABASE_URL_UNPOOLED` and `NEON_BRANCH` for Neon tooling.

### 3. Configure the frontend

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3001
VITE_NEON_AUTH_URL=your-neon-auth-url
```

Use the same Neon Auth URL for `VITE_NEON_AUTH_URL` and the backend's `NEON_AUTH_URL`. Configure Neon Auth for the application and its email verification flow before signing up.

### 4. Install dependencies and prepare the database

```bash
cd frontend
npm install

cd ../nest-backend
npm install
npx prisma migrate deploy
```

The migration command creates the tables from the checked-in Prisma migrations. Run it from `nest-backend`, where `prisma7.config.ts` loads the backend `.env` file.

### 5. Start the application

In one terminal, start the API:

```bash
cd nest-backend
npm run start:dev
```

In another terminal, start the frontend:

```bash
cd frontend
npm run dev
```

Open the local Vite URL printed in the frontend terminal (by default, `http://localhost:5173`). The backend listens on the configured `PORT` (by default, `3001`) and allows requests from the configured `FRONTEND_URL`.

## Useful commands

Run these from the relevant package directory:

| Directory | Command | Purpose |
| --- | --- | --- |
| `frontend` | `npm run dev` | Start the Vite development server |
| `frontend` | `npm run build` | Type-check and build the frontend |
| `frontend` | `npm run lint` | Lint frontend source |
| `nest-backend` | `npm run start:dev` | Start the NestJS API in watch mode |
| `nest-backend` | `npm run build` | Generate the Prisma client and build the API |

## API overview

All routes require a valid Neon Auth Bearer token.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/chat` | List the current user's chats and messages |
| `POST` | `/chat/create` | Create a chat |
| `PATCH` | `/chat/:id` | Rename a chat |
| `DELETE` | `/chat/:id` | Delete a chat and its messages |
| `POST` | `/chat/title` | Generate and save a chat title |
| `POST` | `/chat` | Generate an assistant response |

The response-generation route is limited to 10 requests per 60 seconds. Requests are validated, and the API's CORS origin is set by `FRONTEND_URL`.

## Project structure

```text
frontend/       React application and Vite configuration
nest-backend/   NestJS API, Prisma schema, and database migrations
```
