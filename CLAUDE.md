# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

Two independent npm packages, no root package.json or workspace tooling. Run every command from inside the relevant directory.

- `frontend/` — React 19 + TypeScript + Vite + SCSS SPA
- `nest-backend/` — NestJS API (ESM, `"type": "module"`), Prisma 7 on Neon PostgreSQL, Google Gemini via `@google/genai`

## Commands

### nest-backend
```bash
npm run start:dev          # API in watch mode (needs nest-backend/.env, see .env.example)
npm run build              # prisma generate && nest build
npm run lint               # oxlint --type-aware src/ test/
npm run format             # prettier
npm test                   # vitest run (all *.spec.ts)
npx vitest run src/chat/chat.service.spec.ts          # single test file
npx vitest run src/chat/chat.service.spec.ts -t "name" # single test by name
npm run test:e2e           # *.e2e-spec.ts via vitest.config.e2e.ts
npx prisma migrate deploy  # apply checked-in migrations (prisma7.config.ts loads .env)
npx prisma generate        # regenerate client into src/generated/prisma
```

### frontend
```bash
npm run dev     # Vite dev server (http://localhost:5173)
npm run build   # tsc -b && vite build — this is the type-check
npm run lint    # oxlint
```
The frontend has no test suite.

## Architecture

### Auth flow
Auth is entirely handled by **Neon Auth** (`@neondatabase/auth`); the backend has no user table or login endpoints.
- Frontend: `src/auth.ts` creates the auth client; `useAuth` drives `App.tsx` (auth form vs. `Home`). All API calls go through `src/api/authFetch.ts`, which attaches the Neon session token as `Authorization: Bearer`.
- Backend: `src/auth/auth.guard.ts` verifies the JWT against `NEON_AUTH_JWKS_URL` with `jose` and sets `request.user = { id, email }`. `ChatController` is guarded at class level.
- Neon Auth tables live in the `neon_auth` schema of the same database. `Chat.userId` is a plain string with **no foreign key** to `neon_auth."user"`. `UnverifiedUsersCleanupService` runs raw SQL daily against `neon_auth` and must explicitly skip users that own chats.

### Data access / ownership
- Every chat query filters by both `id` and `userId` (`findFirst`/`updateMany`/`deleteMany` with `{ id, userId }`) — keep this pattern for any new chat-scoped operation. Another user's chat yields `NotFoundException`, not 403.
- Prisma 7 with the `prisma-client` generator outputs to `nest-backend/src/generated/prisma` (checked in). Import from `../generated/prisma/client.js`, not `@prisma/client`. `PrismaService` uses the `@prisma/adapter-pg` driver adapter. After editing `schema.prisma`, create a migration and regenerate.
- Backend uses ESM with NodeNext-style resolution: relative imports must use `.js` extensions.

### Chat generation and stop
- `POST /chats/:id/messages` sends the last 30 messages (trimmed to start at a USER message) plus the new text to Gemini, then saves the user + model messages and `lastMessageAt` in one transaction. The response is not streamed; the frontend fakes typing (`useChatGeneration.startTypingAnimation`).
- Stop is coordinated by a client-generated `requestId` (UUID). `ChatService` keeps an in-memory `Map<userId:chatId:requestId, AbortController>`. A stop that arrives before its message request is remembered for 60s so the message request starts already aborted. When aborted, only the user message is saved and the endpoint returns `{ response: null }`.
- The frontend deliberately does **not** abort the HTTP request on stop (the server needs it to persist the user message); it only drops it from `requestsRef` and ignores the result. Because the state is in-memory, stop only works with a single backend instance.
- Title generation only overwrites the default `"New Chat"` title (conditional `updateMany`), so a rename during generation wins. The frontend applies the same check.

### Other backend conventions
- Global `ValidationPipe({ whitelist: true, transform: true })`; request bodies are class-validator DTOs in `src/chat/dto/`.
- Rate limiting: `CustomThrottlerGuard` (10 req / 60s, tracked by user id) is applied per-route on create/title/message/stop, not globally. It returns a 429 JSON body with `retryAfter`, which the frontend surfaces via `ApiError`.
- Pinned chats: max 5, enforced in a transaction in `updateChat`; list ordering is `pinnedAt desc nulls last, lastMessageAt desc`.
- `GET /chats` returns chats without messages (plus `hasUserMessages`); messages are lazy-loaded per chat via `GET /chats/:id/messages`.

### Frontend state
- No router or state library. `useChats` owns the chat list; `useChatGeneration` handles in-flight requests and typing animation per chat; the active chat id is persisted in `localStorage` (`utils/chatStorage.ts`). `utils/mapChat.ts` converts API shapes to `types/Chat.ts`.
- Assistant messages render through `components/markdown/Markdown.tsx` (react-markdown + GFM, KaTeX math, highlight.js, sanitized).

### Tests
Backend unit tests use Vitest with globals (`vi`, `describe`) and `@nestjs/testing`; `PrismaService` and `ConfigService` are replaced with plain mock objects, and the Gemini client is stubbed on the service instance.

## Git workflow
- You are authorized to commit and push without asking whenever a logical unit of work is complete (a feature, fix, or refactor that builds and passes lint/tests in the affected package). Don't wait until the end of a long session; don't commit half-finished or broken work.
- Use Conventional Commits, matching existing history: `feat:`, `fix:`, `style:`, `chore(deps):`, `refactor:`, `test:`, `docs:` with a short imperative summary.
- Keep commits focused: stage only the files belonging to that change (`git add <paths>`, not `git add -A`), and leave unrelated uncommitted changes alone.
- Before committing, run `npm run lint` (and `npm test` for nest-backend, `npm run build` for frontend) in each package you touched.
- Push to the current branch's upstream. Never force-push, rewrite published history, or skip hooks.

## Environment
- Backend `.env`: `GEMINI_API_KEY`, `GEMINI_MODEL`, `PORT` (3001), `FRONTEND_URL` (CORS origin), `DATABASE_URL`, `NEON_AUTH_URL`, `NEON_AUTH_JWKS_URL`.
- Frontend `.env`: `VITE_API_URL`, `VITE_NEON_AUTH_URL` (must match backend `NEON_AUTH_URL`).
