import Typesense from 'typesense';
import { ENV } from './env';

// Admin client — for indexing (server-side only, never ship to browser)
export const typesenseAdmin = new Typesense.Client({
  nodes: [{ host: ENV.TYPESENSE_HOST, port: ENV.TYPESENSE_PORT, protocol: ENV.TYPESENSE_PROTOCOL }],
  apiKey: ENV.TYPESENSE_ADMIN_KEY,
  connectionTimeoutSeconds: 5,
});

// Also export as old name for compatibility
export const typesenseClient = typesenseAdmin;

// Search-only client — safe for frontend
export const typesenseSearch = new Typesense.Client({
  nodes: [{ host: ENV.TYPESENSE_HOST, port: ENV.TYPESENSE_PORT, protocol: ENV.TYPESENSE_PROTOCOL }],
  apiKey: ENV.TYPESENSE_SEARCH_KEY,
  connectionTimeoutSeconds: 5,
});

// Also export as old name for compatibility
export const typesenseSearchClient = typesenseSearch;
