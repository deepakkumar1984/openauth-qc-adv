// Custom OAuth implementation compatible with Cloudflare Workers
import { Env, User } from './types';

export interface OAuthProvider {
  name: string;
  authUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  scopes: string[];
  clientId: string;
  clientSecret: string;
}

export class OAuthManager {
  private providers: Map<string, OAuthProvider> = new Map();
  private env: Env;

  constructor(env: Env) {
    this.env = env;
    this.setupProviders();
  }

  private setupProviders() {
    // Google OAuth
    this.providers.set('google', {
      name: 'google',
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
      scopes: ['email', 'profile'],
      clientId: this.env.GOOGLE_CLIENT_ID || '',
      clientSecret: this.env.GOOGLE_CLIENT_SECRET || '',
    });

    // Facebook OAuth
    this.providers.set('facebook', {
      name: 'facebook',
      authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
      tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
      userInfoUrl: 'https://graph.facebook.com/me?fields=id,name,email',
      scopes: ['email', 'public_profile'],
      clientId: this.env.FACEBOOK_CLIENT_ID || '',
      clientSecret: this.env.FACEBOOK_CLIENT_SECRET || '',
    });

    // GitHub OAuth
    this.providers.set('github', {
      name: 'github',
      authUrl: 'https://github.com/login/oauth/authorize',
      tokenUrl: 'https://github.com/login/oauth/access_token',
      userInfoUrl: 'https://api.github.com/user',
      scopes: ['user:email', 'read:user'],
      clientId: this.env.GITHUB_CLIENT_ID || '',
      clientSecret: this.env.GITHUB_CLIENT_SECRET || '',
    });
  }

  async generateAuthUrl(providerName: string, redirectUri: string): Promise<string> {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Unknown provider: ${providerName}`);
    }

    // Generate state parameter for CSRF protection
    const state = await this.generateState();
    
    // Store state in KV for verification
    await this.env.OAUTH_KV.put(`state:${state}`, JSON.stringify({
      provider: providerName,
      redirectUri,
      timestamp: Date.now(),
    }), { expirationTtl: 600 }); // 10 minutes

    const params = new URLSearchParams({
      client_id: provider.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: provider.scopes.join(' '),
      state,
    });

    return `${provider.authUrl}?${params.toString()}`;
  }

  async handleCallback(
    providerName: string,
    code: string,
    state: string,
    redirectUri: string
  ): Promise<User> {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Unknown provider: ${providerName}`);
    }

    // Verify state parameter
    const stateData = await this.env.OAUTH_KV.get(`state:${state}`, 'json') as any;
    if (!stateData || stateData.provider !== providerName) {
      throw new Error('Invalid state parameter');
    }

    // Delete used state
    await this.env.OAUTH_KV.delete(`state:${state}`);

    // Exchange code for access token
    const tokenResponse = await fetch(provider.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        client_id: provider.clientId,
        client_secret: provider.clientSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(`Token exchange failed: ${errorText}`);
    }

    const tokenData = await tokenResponse.json() as any;
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      throw new Error('No access token received');
    }

    // Fetch user info
    const userInfo = await this.fetchUserInfo(provider, accessToken);
    
    // Create or get user from database
    return await this.createOrGetUser(userInfo, providerName);
  }

  private async fetchUserInfo(provider: OAuthProvider, accessToken: string): Promise<any> {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
    };

    const response = await fetch(provider.userInfoUrl, { headers });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user info: ${response.statusText}`);
    }

    const userInfo = await response.json() as any;

    // For GitHub, we need to fetch email separately if not public
    if (provider.name === 'github' && !userInfo.email) {
      const emailResponse = await fetch('https://api.github.com/user/emails', { headers });
      if (emailResponse.ok) {
        const emails = await emailResponse.json() as any[];
        const primaryEmail = emails.find((email: any) => email.primary)?.email;
        if (primaryEmail) {
          userInfo.email = primaryEmail;
        }
      }
    }

    return userInfo;
  }

  private async createOrGetUser(userInfo: any, provider: string): Promise<User> {
    let email: string;
    let username: string;

    // Extract email and username based on provider
    switch (provider) {
      case 'google':
        email = userInfo.email;
        username = userInfo.name || userInfo.email.split('@')[0];
        break;
      case 'facebook':
        email = userInfo.email;
        username = userInfo.name || userInfo.email.split('@')[0];
        break;
      case 'github':
        email = userInfo.email;
        username = userInfo.login;
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }

    if (!email) {
      throw new Error('No email provided by OAuth provider');
    }

    // Look up existing user
    let user = await this.env.DB.prepare(
      'SELECT id, email, username FROM Users WHERE email = ?1 AND auth_provider = ?2'
    ).bind(email, provider).first<User | null>();

    if (!user) {
      // Create new user
      const newUserResult = await this.env.DB.prepare(
        `INSERT INTO Users (email, username, auth_provider, created_at, updated_at) 
         VALUES (?1, ?2, ?3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
         RETURNING id, email, username`
      ).bind(email, username, provider).first<User | null>();

      if (!newUserResult) {
        throw new Error('Failed to create user');
      }
      user = newUserResult;
    }

    return user;
  }

  private async generateState(): Promise<string> {
    // Generate cryptographically secure random state
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
}
