import Typesense from 'typesense';
import { ENV } from './env';

// Admin client — for indexing (server-side API routes only, never import in browser components)
export const typesenseAdmin = new Typesense.Client({
  nodes: [{ host: ENV.TYPESENSE_HOST, port: ENV.TYPESENSE_PORT, protocol: ENV.TYPESENSE_PROTOCOL }],
  apiKey: ENV.TYPESENSE_ADMIN_KEY,
  connectionTimeoutSeconds: 5,
});

// Search-only client — safe for frontend use (read-only API key)
export const typesenseSearch = new Typesense.Client({
  nodes: [{ host: ENV.TYPESENSE_HOST, port: ENV.TYPESENSE_PORT, protocol: ENV.TYPESENSE_PROTOCOL }],
  apiKey: ENV.TYPESENSE_SEARCH_KEY,
  connectionTimeoutSeconds: 5,
});
