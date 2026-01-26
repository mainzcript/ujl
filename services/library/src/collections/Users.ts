import type { CollectionConfig } from 'payload'

/**
 * Users collection for UJL Library
 *
 * Manages authentication and API key access for the Library service.
 * API keys are used by the Crafter and other UJL applications to authenticate.
 */
export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: {
    // Enable API key generation for programmatic access
    useAPIKey: true,
  },
  fields: [],
}
