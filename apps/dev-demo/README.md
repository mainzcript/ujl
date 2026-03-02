# UJL Dev Demo

Minimal integration demo for the UJL Crafter – a visual editor for UJL documents.

This app is a **SvelteKit** application that demonstrates how to embed the Crafter with two library storage modes:

- **Inline** (default): Library stored as Base64 directly in the document
- **Backend**: Library stored on a Payload CMS server (`services/library`). The API key stays server-side; the frontend receives short-lived tokens via `/api/library-token`.

## Quick Start (Inline Mode)

The simplest way to run the demo – no additional setup required:

```bash
# From the repository root
pnpm install
pnpm --filter @ujl-framework/dev-demo dev
```

This starts the Crafter at [http://localhost:5174](http://localhost:5174) with inline library storage.

## Backend Mode Setup

To use persistent library storage via the Library service:

### Step 1: Configure the Library Service

```bash
cd services/library
cp .env.example .env
```

Open `.env` and set at least `PAYLOAD_SECRET`, `POSTGRES_PASSWORD`, and `DATABASE_URL`.

### Step 2: Start the Library Service

```bash
cd services/library
pnpm run dev
```

PostgreSQL (Docker) and Payload CMS run at [http://localhost:3000](http://localhost:3000).

### Step 3: Create an Admin User and API Key

1. Open [http://localhost:3000/admin](http://localhost:3000/admin), create the first user (admin).
2. In **Users** → your user, enable **API Key** and save. Copy the key.

### Step 4: Configure dev-demo environment

```bash
cd apps/dev-demo
cp .env.example .env
```

Edit `.env`:

```bash
LIBRARY_STORAGE=backend
LIBRARY_URL=http://localhost:3000
LIBRARY_API_KEY=your-copied-api-key
```

The SvelteKit route `/api/library-token` uses `LIBRARY_API_KEY` to return a token to the frontend (no token URL config needed).

### Step 5: Start the demo

```bash
pnpm --filter @ujl-framework/dev-demo dev
```

Images uploaded in the Crafter are stored in the Library.

## Project Structure

```
apps/dev-demo/
├── src/
│   ├── app.html
│   ├── app.d.ts
│   ├── routes/
│   │   ├── +layout.svelte      # Fonts, global styles
│   │   ├── +layout.server.ts   # Library config from env
│   │   ├── +page.svelte        # Crafter mount
│   │   └── api/
│   │       └── library-token/
│   │           └── +server.ts   # Token endpoint (uses LIBRARY_API_KEY)
│   └── lib/
│       └── modules/
│           └── testimonial.ts  # Example custom module
├── .env.example
├── package.json
├── svelte.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Configuration

| Variable          | Default  | Description                                               |
| ----------------- | -------- | --------------------------------------------------------- |
| `LIBRARY_STORAGE` | `inline` | Library storage mode: `inline` or `backend`               |
| `LIBRARY_URL`     | –        | Library base URL (e.g. `http://localhost:3000`)           |
| `LIBRARY_API_KEY` | –        | API key from Library admin (server-only, for token route) |

All variables are server-only (no `VITE_` prefix). The token endpoint is fixed at `/api/library-token`.

## Debugging

The Crafter instance is exposed on `window.crafter`:

```javascript
window.crafter.getDocument();
window.crafter.getTheme();
window.crafter.getMode();
```

## Troubleshooting

### Backend mode shows inline or error

Set `LIBRARY_STORAGE=backend`, `LIBRARY_URL`, and `LIBRARY_API_KEY` in `.env`. Restart the dev server.

### "Image backend connection error"

1. Is `services/library` running? (`pnpm run dev`)
2. Is `LIBRARY_URL` correct?
3. Does `/api/library-token` return `{ token: "..." }`? (Check Network tab.)

The Library service must accept `Authorization: Bearer <token>`. If it only supports API-Key headers, the token route may need to pass the key as the token until the Library adds Bearer support.

### CORS

The Library has open CORS by default. Use the full URL (e.g. `http://localhost:3000`) for `LIBRARY_URL`.

## Fonts

Fonts used by the Crafter UI are imported in `src/routes/+layout.svelte`. When integrating the Crafter elsewhere, import the same fonts as needed.

## Related Documentation

- [UJL Crafter](../../packages/crafter/README.md) – Visual editor component
- [UJL Library](../../services/library/README.md) – Backend service for asset management
- [UJL Framework](../../README.md) – Project overview
