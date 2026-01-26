# UJL Dev Demo

Minimal integration demo for the UJL Crafter – a visual editor for UJL documents.

This app demonstrates how to embed the UJL Crafter into a vanilla TypeScript application with two library storage modes:

- **Inline** (default): Library stored as Base64 directly in the document
- **Backend**: Library stored on a Payload CMS server (`services/library`)

## Quick Start (Inline Mode)

The simplest way to run the demo – no additional setup required:

```bash
# From the repository root
pnpm install
pnpm --filter @ujl-framework/dev-demo dev
```

This starts the Crafter at [http://localhost:5174](http://localhost:5174) with inline library storage.

## Backend Mode Setup

To use persistent library storage via the Library service, follow these steps:

### Step 1: Configure the Library Service

```bash
# In a separate terminal
cd services/library
cp .env.example .env
```

Open `.env` and set at least `PAYLOAD_SECRET`, `POSTGRES_PASSWORD`, and `DATABASE_URL`.

### Step 2: Start the Library Service

```bash
# In a separate terminal
cd services/library
pnpm run dev
```

This starts:

- PostgreSQL database (via Docker)
- Payload CMS server at [http://localhost:3000](http://localhost:3000)

### Step 3: Create an Admin User

1. Open [http://localhost:3000/admin](http://localhost:3000/admin)
2. Fill in the registration form (first user becomes admin), you can use any email - it will not be verified.
3. Click "Create Account"

### Step 4: Enable API Key

1. In the Admin UI, go to **Users** in the sidebar
2. Click on your user
3. Scroll down to **Enable API Key**
4. Toggle it on
5. Click **Save**
6. **Copy the generated API Key** (you'll need it in the next step)

### Step 5: Configure Environment

```bash
# In apps/dev-demo directory
cp .env.example .env
```

Edit `.env`:

```bash
VITE_LIBRARY_STORAGE=backend
VITE_BACKEND_URL=http://localhost:3000
VITE_BACKEND_API_KEY=your-api-key-here  # Paste the key from Step 3
```

### Step 6: Start the Demo

```bash
pnpm --filter @ujl-framework/dev-demo dev
```

Now when you upload images in the Crafter, they'll be stored in the Library.

## Project Structure

```
apps/dev-demo/
├── src/
│   └── main.ts          # Crafter initialization with ENV config
├── index.html           # Minimal HTML shell
├── .env.example         # Environment configuration template
├── .prettierrc          # Prettier configuration
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md            # This file
```

## Configuration

| Variable               | Default  | Description                                      |
| ---------------------- | -------- | ------------------------------------------------ |
| `VITE_LIBRARY_STORAGE` | `inline` | Library storage mode: `inline` or `backend`      |
| `VITE_BACKEND_URL`     | –        | Library base URL (e.g., `http://localhost:3000`) |
| `VITE_BACKEND_API_KEY` | –        | API key for Library authentication               |

## Debugging

The Crafter instance is exposed globally for debugging:

```javascript
// In browser console
window.crafter.getDocument(); // Get current document
window.crafter.getTheme(); // Get current theme
window.crafter.getMode(); // Get editor mode ('editor' or 'designer')
```

## Troubleshooting

### "Backend mode requires VITE_BACKEND_URL"

You set `VITE_LIBRARY_STORAGE=backend` but didn't configure the URL. Either:

- Set `VITE_BACKEND_URL` in your `.env` file, or
- Change `VITE_LIBRARY_STORAGE` back to `inline`

### "Image backend connection error"

The Library service is not running or not reachable. Check:

1. Is `services/library` running? (`pnpm run dev`)
2. Is the endpoint correct? (default: `http://localhost:3000/api`)
3. Is the API key valid?

### CORS Errors

The Library has open CORS by default. If you still see CORS errors:

1. Check that you're using `http://localhost:3000/api` (not just `/api`)
2. Restart the Library service

## Fonts

This demo includes all fonts used by the Crafter UI (via Fontsource). They are imported in `main.ts` and required for proper font rendering in the Designer Mode.

If you're integrating the Crafter into your own app, you'll need to import these fonts yourself – see `main.ts` for the list.

## Related Documentation

- [UJL Crafter](../../packages/crafter/README.md) – Visual editor component
- [UJL Library](../../services/library/README.md) – Backend service for asset management
- [UJL Framework](../../README.md) – Project overview
