# SnugglePaws

<video controls width="720">
  <source src="attached_assets/snugglepaws.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

SnugglePaws is a marketplace application connecting pet seekers, providers (breeders/sellers), and shelters. The project contains a TypeScript + React frontend (Vite) and an Express-based backend with demo in-memory storage and Stripe integration for payments.

## Quick Highlights
- Full-stack TypeScript project using Vite + React for the client and Express for the API.
- Local demo storage: `server/storage.ts` contains an in-memory `MemStorage` seeded with sample users, pets, favorites and messages.
- Stripe payment integration required: server expects `STRIPE_SECRET_KEY` (see Environment).
- Dev server runs on port `5000` and serves both API and client in development.

## Tech Stack
- Frontend: React, TypeScript, Vite, Tailwind CSS
- Backend: Node.js, Express, TypeScript
- Database/ORM: Drizzle tooling included (project includes `drizzle.config.ts` and `drizzle-kit` scripts)
- Payments: Stripe
- Auth: `passport-local` with session-based auth (demo session store)
- Misc: Zod for validation, TanStack Query, Radix UI components

## Files & Structure (important files)
- `client/` — React app (Vite) with components, pages, hooks and UI primitives
- `server/` — Express server with `index.ts`, `routes.ts`, `storage.ts` and `vite.ts` support
- `shared/` — shared `schema.ts` types used by both client and server
- `drizzle.config.ts` — Drizzle configuration (DB migrations/schema tooling)
- `package.json` — scripts and dependencies

Key scripts (from `package.json`)
- `npm run dev` — runs the backend in development (`tsx server/index.ts`).
- `npm run start:frontend` — runs the Vite frontend locally.
- Run both in separate terminals for a local dev experience: first `npm run dev`, then `npm run start:frontend`.
- `npm run build` — builds the frontend and bundles the server to `dist/`.
- `npm run start` — runs the production bundle from `dist/index.js`.
- `npm run db:push` — runs `drizzle-kit push` (DB migrations / push schema).

## Environment
Create a `.env` file at the project root for local development. The server uses `dotenv` and expects at least:
- `STRIPE_SECRET_KEY` — **required** at runtime (server will throw if missing).
- `SESSION_SECRET` — optional (defaults to `snugglepaws-secret` in demo).

Other environment variables may be required if you wire a real database or change the demo storage.

## Running Locally
Prerequisites: Node 18+ and a package manager (npm/yarn/pnpm).

1. Install dependencies

```bash
npm install
```

2. Start the backend (dev) — runs the Express server

```bash
npm run dev
```

3. Start the frontend (in a second terminal)

```bash
npm run start:frontend
```

4. Open the app in your browser at `http://localhost:5000` (server serves client & API in development).

## Notes on Storage & Data
- The default server storage is an in-memory `MemStorage` (demo/testing). Data is ephemeral and seeded with sample users and pets in `server/storage.ts`.
- The presence of `drizzle.config.ts` and `drizzle-kit` scripts means you can wire a real DB and migrate schemas; the repo currently runs without a DB by default.

## Payments
- Stripe is integrated in `server/routes.ts`. The server checks `STRIPE_SECRET_KEY` on startup. Use Stripe test keys for local testing.

## How to Add the Video
Place your `snugglepaws.mp4` file into `attached_assets/` (the project root already has an `attached_assets/` folder). The README includes a video placeholder just below the title; after you upload `attached_assets/snugglepaws.mp4` I can update the README to embed it or add a playable link.

Example embed you can add later (Markdown):

```md
<video controls width="720">
  <source src="attached_assets/snugglepaws.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>
```

## Tests & Type Checking
- `npm run check` — runs TypeScript type checks (`tsc`).

## Production Build
- `npm run build` — builds frontend and bundles server to `dist/`.
- `npm run start` — run the production bundle. The server will serve the compiled frontend in production mode.

## Contribution & Next Steps
- If you want persistent storage, connect a Postgres (or other) DB and implement a storage adapter (replace `MemStorage`) and run `drizzle-kit` migrations.
- Add CI, tests, and end-to-end flows for purchase and messaging.
- Harden authentication (hash passwords instead of plain-text used in the demo seed).

## License
MIT

---
If you want, I can now embed your uploaded video and/or add a short README screenshot or demo GIF. Tell me which format you prefer and I will update the file.
