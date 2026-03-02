/**
 * Bearer token authentication for the Library API.
 *
 * Implemented as a Payload auth strategy (see auth/bearerTokenStrategy.ts)
 * and registered on the Users collection. When a request sends
 * Authorization: Bearer <token>, the strategy looks up the token in
 * access_tokens (valid, not expired) and sets req.user to the associated user.
 *
 * This file exists for documentation; the actual logic lives in
 * auth/bearerTokenStrategy.ts and is registered in collections/Users.ts.
 */

export { bearerTokenStrategy } from "../auth/bearerTokenStrategy";
