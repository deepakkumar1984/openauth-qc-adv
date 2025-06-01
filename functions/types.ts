// Shared types for the API modules

export interface Env {
  DB: D1Database;
  OAUTH_KV: KVNamespace;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  FACEBOOK_CLIENT_ID: string;
  FACEBOOK_CLIENT_SECRET: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  JWT_SECRET?: string;
  APP_BASE_URL?: string; 
}

export interface User {
  id: number;
  email: string;
  username: string;
  auth_provider?: string; 
}

export interface OAuthUserInfo {
  id: string;
  email: string;
  name?: string;
  username?: string;
  avatar_url?: string;
  provider: string;
}

// OpenAuth subjects configuration removed (no longer using external OAuth library)
// We now handle OAuth flows manually using native Web APIs

export const JWT_COOKIE_NAME = 'qa_session';
export const JWT_EXPIRATION = '24h';
