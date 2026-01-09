# UJL Services - Backend Services for the UJL Framework

This folder contains all backend services for UJL. The exact structure will be defined according to requirements - possibly a single comprehensive service or multiple specialized services for various aspects such as media subsystem, LLM integration, CMS, etc.

> IMPORTANT: Services have to be added to the [changeset config](../.changeset/config.json) file to be versioned and published with changesets.


## Media Library

UJL includes a flexible media management system that supports two storage modes:

- **Inline Storage** (default) - Media stored as Base64 within UJLC documents
- **Backend Storage** - Media stored on a Payload CMS server with references in documents

The media library is integrated into the UJL Crafter and provides:
- Visual media browser and uploader
- Support for metadata (title, alt text, description, author, license)
- Multiple image sizes and focal point support
- Seamless switching between storage modes

**Key Components:**
- [packages/core](../packages/core/README.md) - Media library data structures and ImageField
- [packages/crafter](../packages/crafter/README.md) - Media library UI components
- [services/media](./media/README.md) - Payload CMS-based backend API

**Setup:**
See the [Media Library Setup Guide](../packages/crafter/MEDIA_LIBRARY_SETUP.md) for detailed configuration instructions.
