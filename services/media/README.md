# Payload CMS Media API Documentation

This service provides a Payload CMS-based media management API for the UJL Framework. It handles image uploads, metadata management, and provides a RESTful API for media assets.

---

## Base URL

```
http://localhost:3000/api
```

## Installation

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ and pnpm

### Setup

1. **Set variables in the .env file**

Create a `.env` file in the `services/media` directory:

```env
DATABASE_URI=postgres://postgres:<password>@postgres:5432/ujl-media
PAYLOAD_SECRET=<your-secret-key>
POSTGRES_PASSWORD=<your-password>
POSTGRES_USER=postgres
POSTGRES_DB=payload
```

**Security Notes:**
- Generate a strong `PAYLOAD_SECRET` (at least 32 characters)
- Use a strong database password
- Never commit the `.env` file to version control

### 2. Generate Schemas

```
pnpm dlx payload generate:db-schema

pnpm run generate:types
```

### 3. Start Payload Server and Postgres DB

```
# start all (Development)
docker-compose up

# In background
docker-compose up -d

# Postgres only
docker-compose up postgres -d

# Logs
docker-compose logs -f payload
```

Wait until "ready" is displayed in the logs (starting for the first time might take a while because of installing packages)

### 4. Create first user for API Key

1.  Go to `localhost:3000/admin` and create your first user (admin). This user will also be linked to the API Key.
2.  Navigate to the collection 'Users' and select the user you just created.
3.  Check the checkbox 'Enable API Key' and click save
4.  Copy the generated API Key for use in client applications

**Using the API Key:**

```typescript
const collectionName = 'users';
const YOUR_API_KEY = 'your-api-key-here'; // API Key from user
const response = await fetch('http://localhost:3000/api/media', {
  headers: {
    Authorization: `${collectionName} API-Key ${YOUR_API_KEY}`,
  },
});
```

**Integration with UJL Crafter:**

To use this media service with the UJL Crafter, configure the API key in the Crafter's environment:

1. Navigate to `packages/crafter/env/`
2. Create or edit `.env.local`:
   ```env
   PUBLIC_MEDIA_API_KEY=your-api-key-here
   ```
3. Configure the UJLC document to use backend storage:
   ```json
   {
     "ujlc": {
       "meta": {
         "media_library": {
           "storage": "backend",
           "endpoint": "http://localhost:3000/api"
         }
       }
     }
   }
   ```

For detailed setup instructions, see [Media Library Setup Guide](../../packages/crafter/MEDIA_LIBRARY_SETUP.md).

### Storage Adapters

Payload offers additional storage adapters to handle file uploads. These adapters allow you to store files in different locations, such as Amazon S3, Vercel Blob Storage, Google Cloud Storage, and more.

https://payloadcms.com/docs/upload/storage-adapters

## Media Endpoints

### 1. Get all Media

```bash
GET /api/media
```

**Query Parameters:**

- `depth` - How deep relations are loaded (default: 0)
- `locale` - Language version (`de`, `en`, `all`)
- `limit` - Number of results (default: 10)
- `page` - Page number (default: 1)
- `where` - Filter object (see below)
- `sort` - Sorting (e.g., `createdAt`, `-createdAt`)

**Examples:**

```bash
# First 20 Media
GET /api/media?limit=20

# German Version
GET /api/media?locale=de

# filter by author
GET /api/media?where[author][equals]=Max%20Mustermann

# sort by creation date (newest first)
GET /api/media?sort=-createdAt

# Combined
GET /api/media?locale=de&limit=10&sort=-createdAt&where[license][equals]=cc-by-4.0
```

**Response:**

```json
{
  "docs": [
    {
      "id": "67890abcdef12345",
      "title": "Mein Bild",
      "alt": "Alt-Text",
      "description": "Beschreibung",
      "author": "Max Mustermann",
      "license": "cc-by-4.0",
      "sourceLink": "https://example.com",
      "tags": [
        { "tag": "natur", "id": "tag1" },
        { "tag": "landschaft", "id": "tag2" }
      ],
      "filename": "bild.jpg",
      "mimeType": "image/jpeg",
      "filesize": 245670,
      "width": 3000,
      "height": 2000,
      "focalX": 50,
      "focalY": 50,
      "sizes": {
        "thumbnail": {
          "url": "/media/bild-400x300.webp",
          "width": 400,
          "height": 300,
          "mimeType": "image/webp",
          "filesize": 8500,
          "filename": "bild-400x300.webp"
        },
        "small": {
          "url": "/media/bild-500x333.webp",
          "width": 500,
          "height": 333,
          "mimeType": "image/webp",
          "filesize": 12340,
          "filename": "bild-500x333.webp"
        },
        "medium": {
          "url": "/media/bild-750x500.webp",
          "width": 750,
          "height": 500,
          "mimeType": "image/webp",
          "filesize": 25600,
          "filename": "bild-750x500.webp"
        },
        "large": {
          "url": "/media/bild-1000x667.webp",
          "width": 1000,
          "height": 667,
          "mimeType": "image/webp",
          "filesize": 42000,
          "filename": "bild-1000x667.webp"
        },
        "xlarge": {
          "url": "/media/bild-1920x1280.webp",
          "width": 1920,
          "height": 1280,
          "mimeType": "image/webp",
          "filesize": 95000,
          "filename": "bild-1920x1280.webp"
        }
      },
      "url": "/media/bild.jpg",
      "createdAt": "2025-10-01T10:30:00.000Z",
      "updatedAt": "2025-10-01T10:35:00.000Z"
    }
  ],
  "totalDocs": 42,
  "limit": 10,
  "totalPages": 5,
  "page": 1,
  "pagingCounter": 1,
  "hasPrevPage": false,
  "hasNextPage": true,
  "prevPage": null,
  "nextPage": 2
}
```

---

### 2. Get single media

```bash
GET /api/media/:id
```

**Query Parameters:**

- `locale` - Language (`de`, `en`, `all`)
- `depth` - depth of relation

**Example:**

```bash
GET /api/media/67890abcdef12345?locale=de
```

**Response:**

```json
{
  "id": "67890abcdef12345",
  "title": "Mein Bild",
  "alt": "Alt-Text",
  "description": "Beschreibung",
  "author": "Max Mustermann",
  "license": "cc-by-4.0",
  "sourceLink": "https://example.com",
  "tags": [
    { "tag": "natur", "id": "tag1" }
  ],
  "filename": "bild.jpg",
  "mimeType": "image/jpeg",
  "filesize": 245670,
  "width": 3000,
  "height": 2000,
  "focalX": 65,
  "focalY": 45,
  "sizes": { ... },
  "url": "/media/bild.jpg",
  "createdAt": "2025-10-01T10:30:00.000Z",
  "updatedAt": "2025-10-01T10:35:00.000Z"
}
```

---

### 3. Create Media (single and multiple)

```bash
POST /api/media
Content-Type: multipart/form-data
Authorization: users API-Key YOUR_API_KEY
```

**Form-Data fields:**

| Field         | Type        | Required | Description                         |
| ------------- | ----------- | -------- | ----------------------------------- |
| `file`        | File        | ✅       | Image                               |
| `title`       | String      | ✅       | Title of the picture                |
| `alt`         | String      | ❌       | Alt-Text                            |
| `description` | String      | ❌       | Description                         |
| `author`      | String      | ❌       | Author                              |
| `license`     | String      | ❌       | Licence (e.g. cc0, cc-by-4.0, etc.) |
| `sourceLink`  | String      | ❌       | Source Link                         |
| `tags`        | JSON String | ❌       | Array of tags                       |
| `focalX`      | Number      | ❌       | Focal point X (0-100)               |
| `focalY`      | Number      | ❌       | Focal point Y (0-100)               |

**Example with TypeScript/Fetch:**

```javascript
const formData = new FormData()
formData.append('file', fileInput.files[0])
formData.append('title', 'Mein tolles Bild')
formData.append('alt', 'Beschreibung des Bildes')
formData.append('description', 'Eine ausführliche Beschreibung')
formData.append('author', 'Max Mustermann')
formData.append('license', 'cc-by-4.0')
formData.append('sourceLink', 'https://example.com')
formData.append('tags', JSON.stringify([{ tag: 'natur' }, { tag: 'landschaft' }]))
formData.append('focalX', '65')
formData.append('focalY', '45')

let collectionName = 'users'
let YOUR_API_KEY = 'YOUR_API_KEY'
const response = await fetch('http://localhost:3000/api/media', {
  method: 'POST',
  headers: {
    Authorization: `${collectionName} API-Key ${YOUR_API_KEY}`,
  },
  body: formData,
})

const data = await response.json()
console.log(data)
```

**Response:**

```json
{
  "message": "Media created successfully.",
  "doc": {
    "id": "67890abcdef12345",
    "title": "Mein tolles Bild",
    "alt": "Beschreibung des Bildes",
    "description": "Eine ausführliche Beschreibung",
    "author": "Max Mustermann",
    "license": "cc-by-4.0",
    "sourceLink": "https://example.com",
    "tags": [
      { "tag": "natur", "id": "tag1" },
      { "tag": "landschaft", "id": "tag2" }
    ],
    "filename": "bild.jpg",
    "mimeType": "image/jpeg",
    "filesize": 245670,
    "width": 3000,
    "height": 2000,
    "focalX": 65,
    "focalY": 45,
    "sizes": { ... },
    "url": "/media/bild.jpg",
    "createdAt": "2025-10-01T10:30:00.000Z",
    "updatedAt": "2025-10-01T10:30:00.000Z"
  }
}
```

---

### 4. Update single media (Metadata only)

```bash
PATCH /api/media/:id
PATCH /api/media/:id?locale=de # for localization 'de'
Content-Type: application/json
Authorization: users API-Key YOUR_API_KEY
```

**Request Body (JSON):**

```json
{
  "title": "Geänderter Titel",
  "description": "Neue Beschreibung",
  "author": "Neuer Autor",
  "license": "cc0",
  "sourceLink": "https://neue-quelle.com",
  "tags": [{ "tag": "berge" }, { "tag": "winter" }],
  "focalX": 70,
  "focalY": 30
}
```

**Response:**

```json
{
  "message": "Media updated successfully.",
  "doc": {
    "id": "67890abcdef12345",
    "title": "Geänderter Titel",
    "focalX": 70,
    "focalY": 30,
    ...
  }
}
```

---

### 5. Delete single Media

```bash
DELETE /api/media/:id
Authorization: users API-Key YOUR_API_KEY
```

**Response:**

```json
{
  "id": "67890abcdef12345",
  "message": "Media deleted successfully."
}
```

---

## Filter-Syntax (WHERE)

Payload uses a flexible query-syntax for filtering:

### Equals

```bash
GET /api/media?where[author][equals]=Max%20Mustermann
GET /api/media?where[license][equals]=cc-by-4.0
```

### Not equals

```bash
GET /api/media?where[license][not_equals]=copyright
```

### Contains (case-sensitive)

```bash
GET /api/media?where[title][contains]=Landschaft
```

### Like (case-insensitive)

```bash
GET /api/media?where[title][like]=landschaft
```

### Array

```bash
GET /api/media?where[license][in][0]=cc0&where[license][in][1]=cc-by-4.0
```

### Exists / Not Exists

```bash
GET /api/media?where[author][exists]=true
GET /api/media?where[sourceLink][exists]=false
```

### Greater/Less

```bash
GET /api/media?where[filesize][greater_than]=1000000
GET /api/media?where[width][less_than]=2000
```

### AND-Concat (multiple filter)

```bash
GET /api/media?where[author][equals]=Max&where[license][equals]=cc-by-4.0
```

### OR-Concat

```bash
GET /api/media?where[or][0][license][equals]=cc0&where[or][1][license][equals]=cc-by-4.0
```

---

## Localization (i18n)

The Media collection has `localized: true` for some fields.

### Get specific language

```bash
GET /api/media?locale=de
GET /api/media/67890abcdef12345?locale=en
```

### Get all languages

```bash
GET /api/media?locale=all
```

**Response `locale=all`:**

```json
{
  "id": "67890abcdef12345",
  "title": {
    "de": "Mein Bild",
    "en": "My Image"
  },
  "alt": {
    "de": "Alt-Text auf Deutsch",
    "en": "Alt text in English"
  },
  "description": {
    "de": "Beschreibung",
    "en": "Description"
  },
  ...
}
```

---

## Use FocalPoint

The focal point is saved as `focalX` and `focalY` (0-100).

### Frontend usage

**CSS with object-position:**

```css
.image {
  width: 100%;
  height: 300px;
  object-fit: cover;
  object-position: 65% 45%; /* focalX focalY */
}
```

**with background-position:**

```css
.background {
  background-image: url('/media/bild.jpg');
  background-size: cover;
  background-position: 65% 45%;
}
```

---

## Error Responses

### 400 Bad Request

```json
{
  "errors": [
    {
      "message": "The following field is required: title",
      "field": "title"
    }
  ]
}
```

### 401 Unauthorized

```json
{
  "errors": [
    {
      "message": "You are not allowed to perform this action."
    }
  ]
}
```

### 404 Not Found

```json
{
  "errors": [
    {
      "message": "The requested resource was not found."
    }
  ]
}
```

### 413 File Too Large

```json
{
  "errors": [
    {
      "message": "File size exceeds maximum allowed size."
    }
  ]
}
```

---

## Sorting

```bash
# Ascending
GET /api/media?sort=title
GET /api/media?sort=createdAt

# Descending (with minus)
GET /api/media?sort=-createdAt
GET /api/media?sort=-filesize

# Multiple fields
GET /api/media?sort=-createdAt,title
```

---

## Pagination

```bash
# Page 2, 20 entries per page
GET /api/media?page=2&limit=20

# All entries (Caution with large datasets!)
GET /api/media?limit=0
```

---

## Semantic Search (TODO)

With the pgvector extension, embeddings can be stored in the Postgres database for images. https://github.com/pgvector/pgvector

```
// Media.ts
{
  name: 'embedding',
  type: 'json', // or 'text'
  admin: {
    hidden: true, // Hide in admin
  },
  // Store the array here: [0.123, 0.456, ...]
}
```
