# @ujl-framework/library

The **UJL Library** is the asset management backend for the UJL Framework. It provides a self-hosted service for managing images, with planned support for fonts and documents in future releases.

When you use the [UJL Crafter](../../packages/crafter/README.md) in "backend storage" mode, uploaded images are stored and served through this service instead of being embedded as Base64 in the document. This keeps your `.ujlc.json` files lightweight and enables features like automatic image resizing, WebP conversion, and centralized media management across multiple documents.

The Library is built on [Payload CMS 3.0](https://payloadcms.com/) with PostgreSQL as the database. It runs as a Docker container and exposes a REST API that the Crafter (and other UJL applications) can consume.

## Why a Separate Service?

The UJL Framework separates content from design – and the Library extends this principle to assets. Instead of coupling media files directly into your content documents, the Library acts as a central repository:

- **Reusability**: Use the same image across multiple documents without duplication
- **Performance**: Automatic resizing generates optimized variants (thumbnail, small, medium, large, xlarge)
- **Localization**: Store localized metadata (alt text, descriptions) for each image
- **Consistency**: All images are converted to WebP format with consistent quality settings

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 22+ and pnpm 10+

### Setup

1. **Copy and configure environment file**

   ```bash
   cp .env.example .env
   ```

   Open `.env` and configure:

   | Variable | Required | Description |
   |----------|----------|-------------|
   | `PAYLOAD_SECRET` | Yes | Min. 32 characters. Generate with `openssl rand -hex 32` |
   | `POSTGRES_PASSWORD` | Yes | Password for PostgreSQL database |

   Example:
   ```env
   PAYLOAD_SECRET=your-generated-secret-at-least-32-chars
   POSTGRES_PASSWORD=mysecretpw
   ```

   > **Note:** The database URL is automatically derived from `POSTGRES_PASSWORD` in `docker-compose.yml` – you don't need to set it manually.

2. **Start the services**

   ```bash
   docker-compose up
   ```

   On first start, this will install dependencies and initialize the database. Wait until you see "ready" in the logs – this may take a few minutes.

3. **Create your admin user**

   Open http://localhost:3000/admin in your browser. Payload will prompt you to create the first user. This user has full access to the admin panel and can manage all content.

4. **Enable API Key for Crafter integration**

   The Crafter authenticates via API Key. To generate one:
   
   - In the admin panel, go to the **Users** collection
   - Select the user you just created
   - Check **Enable API Key** and click **Save**
   - Copy the generated API key – you'll need it when configuring the Crafter

## Integration with UJL Crafter

Once the Library is running, you can configure the Crafter to use it for media storage:

```typescript
import { UJLCrafter } from '@ujl-framework/crafter';

const crafter = new UJLCrafter({
  target: '#editor-container',
  document: myDocument,
  theme: myTheme,
  mediaLibrary: {
    storage: 'backend',
    endpoint: 'http://localhost:3000/api',
    apiKey: 'your-api-key-here'
  }
});
```

When configured this way, images uploaded through the Crafter's media library will be sent to the Library service. The Crafter stores only a reference (the image ID and URL) in the document, not the image data itself.

## API Reference

The Library exposes a REST API at `http://localhost:3000/api`. All endpoints follow Payload CMS conventions.

### Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/media` | No | List images with pagination |
| GET | `/media/:id` | No | Get a single image by ID |
| POST | `/media` | Yes | Upload a new image |
| PATCH | `/media/:id` | Yes | Update image metadata |
| DELETE | `/media/:id` | Yes | Delete an image |

> **Note:** The collection is currently named `media` for compatibility with the existing Crafter implementation. This will be renamed to `images` in a future update.

### Authentication

For write operations (POST, PATCH, DELETE), include the API key in the Authorization header:

```
Authorization: users API-Key YOUR_API_KEY
```

### Query Parameters

The GET endpoints support Payload's query syntax:

| Parameter | Description | Example |
|-----------|-------------|---------|
| `locale` | Return content in a specific language | `?locale=de` |
| `limit` | Number of results per page (default: 10) | `?limit=50` |
| `page` | Page number for pagination | `?page=2` |
| `sort` | Sort by field, prefix with `-` for descending | `?sort=-createdAt` |
| `where` | Filter results | `?where[alt][exists]=true` |

For the full query syntax, see the [Payload CMS documentation](https://payloadcms.com/docs/queries/overview).

## Localization

The Library supports multilingual content out of the box. Eight languages are pre-configured:

| Code | Language |
|------|----------|
| `en` | English (default) |
| `de` | Deutsch |
| `fr` | Français |
| `es` | Español |
| `it` | Italiano |
| `nl` | Nederlands |
| `pl` | Polski |
| `pt` | Português |

Localized fields (like `alt` text and `description`) can have different values for each language. When querying the API, use the `locale` parameter to get content in a specific language, or `locale=all` to get all translations at once.

To change the default language for the admin panel, set `PAYLOAD_DEFAULT_LOCALE` in your `.env` file.

**Important:** The list of available locales is defined at build time. Adding or removing languages requires code changes and a database migration. The pre-configured languages cover most European use cases – if you need additional languages, you'll need to modify `payload.config.ts`.

## Security & CORS

The Library is designed as a **self-hosted service**. By default, CORS is open (`*`) to allow any frontend application to access the API.

### API Authentication

Write operations (upload, update, delete) require an API key:

```
Authorization: users API-Key YOUR_API_KEY
```

Read operations are public by design – the Library serves images that are meant to be displayed on websites.

### Restricting CORS (optional)

If you need to restrict which origins can access the API, set the `CORS_ALLOWED_ORIGINS` environment variable:

```env
CORS_ALLOWED_ORIGINS=https://crafter.example.com,https://admin.example.com
```

When not set, all origins are allowed.

## Development

### Running with Docker (recommended)

```bash
docker-compose up
```

This starts both the Payload application and PostgreSQL database. The application is available at http://localhost:3000.

### Running locally (without Docker)

If you prefer to run without Docker, you'll need a local PostgreSQL instance:

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

When running without Docker, you must set `DATABASE_URL` manually in your `.env`:

```env
PAYLOAD_SECRET=your-generated-secret
DATABASE_URL=postgres://postgres:yourpassword@localhost:5432/library
```

### Useful commands

```bash
# Regenerate TypeScript types after schema changes
pnpm run generate:types

# Run integration and E2E tests
pnpm test

# Build for production
pnpm build
```

## Related Documentation

- [UJL Framework Overview](../../README.md)
- [UJL Crafter Documentation](../../packages/crafter/README.md)
- [Payload CMS Documentation](https://payloadcms.com/docs)
