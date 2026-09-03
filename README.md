# SkillSwap

SkillSwap is a React frontend with an Express and MongoDB authentication API.

## Run locally

1. Copy `.env.example` to `.env` and set `MONGODB_URI` and `JWT_SECRET`. Do not use a `VITE_` prefix for these backend variables.
2. Install packages with `npm install`.
3. In one terminal, start the API: `npm run server`.
4. In a second terminal, start the frontend: `npm run dev`.

The frontend must use `VITE_API_BASE_URL=http://localhost:4000`. A successful signup stores the user in the MongoDB `users` collection with a bcrypt-hashed password; login validates that password and returns a 7-day JWT.

## Admin panel & skill moderation

Log in as the account listed in `ADMIN_EMAIL`/`ADMIN_EMAILS` and open `/admin`.

- **`/admin`** — dashboard: total users, pending/approved/rejected skills, departments.
- **`/admin/users`** — members grouped by department (derived from their most
  recently *approved* taught skill, never from what they want to learn).
  Each card has View (opens their public profile) and Delete.
- **`/admin/skills`** — moderation queue: user, skill, description, AI
  recommendation/category/reason/confidence, plus Approve / Reject / Delete.
  Only an admin decision publishes or rejects a skill — the AI only advises.

**Flow:** a member submits a skill on `/add-skills` → the server retrieves
relevant chunks from a knowledge base (`server/knowledgeBase.js`) with a
real TF-IDF/cosine-similarity retriever (`server/rag.js`, no static/fake
context) → the retrieved context plus the skill are sent to Groq
(`openai/gpt-oss-120b`, `server/skillReview.js`) for a recommendation →
the skill is stored as `pending` regardless of the AI's verdict → an admin
makes the final approve/reject call in `/admin/skills`. Only `approved`
skills are ever returned by the public `/api/skills`, `/api/departments`,
and `/api/users/:id/profile` endpoints.

Requires `GROQ_API_KEY` in the backend `.env` (already present in this
project). The skill-review pipeline always tries `openai/gpt-oss-120b`
first, independent of the `GROQ_MODEL` env var used by the existing AI
chat feature.

## Admin role, user IDs, and bans

- **Admin role** is never read from a stored field. `server/authMiddleware.js`
  computes it fresh on every signup, login, and authenticated request from
  `ADMIN_EMAIL`/`ADMIN_EMAILS` in `.env`. No signup can ever grant itself
  admin, and changing `ADMIN_EMAILS` takes effect immediately on the next
  request — no stale token or DB row can keep someone admin (or lock them
  out) after that.
- **Sequential user IDs** (`#1`, `#2`, ...) are assigned atomically at
  signup via `server/models/Counter.js` and shown on every user card in
  `/admin/users`. Deleting a user never frees their number for reuse.
  Existing accounts are backfilled once at server startup, oldest first.
- **Bans**: an admin can ban/unban from `/admin/users` (card button) or the
  user detail modal. A banned account cannot log in, and if it's already
  logged in it is force-logged-out — every authenticated backend request
  re-checks ban status (`server/authMiddleware.js`), and the frontend
  polls `/api/auth/me` every 15s while logged in to catch an idle banned
  session promptly.
- **Clicking a user** in `/admin/users` opens a detail modal
  (`AdminUserDetailModal.jsx`) showing every skill they've submitted, its
  status, and — separately — what they want to *learn* in return, pulled
  from `GET /api/admin/users/:id`.

## AI chat history

"Clear chat" in the floating widget now calls `DELETE /api/ai/conversation`,
which empties the conversation's `messages` array in MongoDB. Previously it
only cleared the on-screen state, so the same history reappeared on the next
login — that's fixed.

## Existing Vite notes

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
