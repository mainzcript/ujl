import { postgresAdapter } from '@payloadcms/db-postgres'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// CORS: Open by default for self-hosted deployments.
// Restrict via CORS_ALLOWED_ORIGINS env var if needed (comma-separated URLs).
const cors = process.env.CORS_ALLOWED_ORIGINS
  ? process.env.CORS_ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
  : '*'

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  cors,
  collections: [Users, Media],
  // Localization: Pre-configured for common European languages
  // Add/remove locales requires migration + rebuild
  localization: {
    locales: [
      { code: 'en', label: 'English' },
      { code: 'de', label: 'Deutsch' },
      { code: 'fr', label: 'Français' },
      { code: 'es', label: 'Español' },
      { code: 'it', label: 'Italiano' },
      { code: 'nl', label: 'Nederlands' },
      { code: 'pl', label: 'Polski' },
      { code: 'pt', label: 'Português' },
    ],
    defaultLocale: process.env.PAYLOAD_DEFAULT_LOCALE || 'en',
    fallback: true,
  },
  secret: (() => {
    const secret = process.env.PAYLOAD_SECRET
    if (!secret) {
      throw new Error('PAYLOAD_SECRET environment variable is required')
    }
    return secret
  })(),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: (() => {
        const url = process.env.DATABASE_URL
        if (!url) {
          throw new Error('DATABASE_URL environment variable is required')
        }
        return url
      })(),
    },
    // Production: Use migrations, Dev: Auto-sync schema
    push: process.env.NODE_ENV !== 'production',
    migrationDir: './src/migrations',
  }),
  sharp,
  plugins: [],
})
