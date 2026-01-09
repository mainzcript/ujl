# Media Library Setup Guide

## Overview

The UJL Crafter supports two storage modes for the Media Library:

1. **Inline Storage** (default) - Media stored as Base64 in UJLC documents
2. **Backend Storage** - Media stored on a Payload CMS server

## Backend Storage Setup

### Prerequisites

- A running Payload CMS instance with the Media collection configured
- API access enabled in Payload CMS

### Step 1: Get Your API Key

1. Open your Payload CMS admin panel
2. Navigate to **User Settings** > **API Keys**
3. Create a new API key or copy an existing one
4. Note down the API key value

### Step 2: Configure Environment Variables

1. Copy the example environment file:

   ```bash
   cd packages/crafter/env
   cp .env.example .env.local
   ```

2. Edit `env/.env.local` and add your API key:
   ```env
   PUBLIC_MEDIA_API_KEY=your-actual-api-key-here
   ```

**Important:** The `.env.local` file must be in the `packages/crafter/env/` directory, not in `packages/crafter/` root, because of the Vite configuration (`envDir: './env'`).

### Step 3: Configure Your UJLC Document

Update the `meta.media_library` field in your UJLC document:

```json
{
	"ujlc": {
		"meta": {
			"title": "My Document",
			"media_library": {
				"storage": "backend",
				"endpoint": "http://localhost:3000/api"
			}
		},
		"media": {},
		"root": []
	}
}
```

**Important Notes:**

- The `endpoint` should point to your Payload CMS API endpoint (usually `/api`)
- The API key is **NOT** stored in the document for security reasons
- The API key is read from the `PUBLIC_MEDIA_API_KEY` environment variable

### Step 4: Restart the Development Server

After configuring the environment variables, restart your dev server:

```bash
pnpm run dev
```

## Security Best Practices

### ✅ DO:

- Store API keys in `env/.env.local` (gitignored)
- Use different API keys for development and production
- Rotate API keys regularly
- Use read-only API keys when possible

### ❌ DON'T:

- Commit API keys to version control
- Store API keys in UJLC documents
- Share API keys in team chats or documentation
- Use production API keys in development

## Troubleshooting

### "PUBLIC_MEDIA_API_KEY not found" Warning

If you see this warning in the console:

1. Verify `.env.local` exists in `packages/crafter/env/`
2. Check that the variable name is exactly `PUBLIC_MEDIA_API_KEY`
3. Ensure there are no spaces around the `=` sign
4. Restart the dev server after adding the variable

### 401 Unauthorized Errors

If media operations fail with 401 errors:

1. Verify the API key is correct in `env/.env.local`
2. Check that the API key has the required permissions in Payload CMS
3. Ensure the `endpoint` URL is correct in your UJLC document

### Media Not Loading

If media items don't display:

1. Check the browser console for network errors
2. Verify the Payload CMS server is running
3. Ensure the media collection is properly configured in Payload CMS

## Migration from Inline to Backend Storage

To migrate from inline storage to backend storage:

1. Set up the backend storage as described above
2. Update your document's `meta.media_library.storage` to `"backend"`
3. Re-upload your media files through the Media Library UI
4. The old inline media entries can be removed from the document

**Note:** There is no automatic migration tool for now. You will need to manually re-upload media files.

## Environment Variables Reference

| Variable               | Required                  | Description                            |
| ---------------------- | ------------------------- | -------------------------------------- |
| `PUBLIC_MEDIA_API_KEY` | Yes (for backend storage) | Payload CMS API key for authentication |

## Additional Resources

- [Payload CMS API Documentation](https://payloadcms.com/docs/rest-api/overview)
- [Payload CMS Authentication](https://payloadcms.com/docs/authentication/overview)
