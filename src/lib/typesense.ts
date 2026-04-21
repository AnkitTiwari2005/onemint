import Typesense from 'typesense';
import { ENV } from './env';

// Admin client — for indexing (server-side only)
export const typesenseClient = new Typesense.Client({
  nodes: [{ host: ENV.TYPESENSE_HOST, port: ENV.TYPESENSE_PORT, protocol: ENV.TYPESENSE_PROTOCOL }],
  apiKey: ENV.TYPESENSE_ADMIN_API_KEY,
  connectionTimeoutSeconds: 5,
});

// Search-only client — safe for frontend
export const typesenseSearchClient = new Typesense.Client({
  nodes: [{ host: ENV.TYPESENSE_HOST, port: ENV.TYPESENSE_PORT, protocol: ENV.TYPESENSE_PROTOCOL }],
  apiKey: ENV.TYPESENSE_SEARCH_API_KEY,
  connectionTimeoutSeconds: 5,
});
