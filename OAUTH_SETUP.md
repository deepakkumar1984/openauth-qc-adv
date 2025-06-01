# OAuth Provider Setup Guide

This guide explains how to set up OAuth authentication with Google, Facebook, and GitHub for your Quantum Adventure application.

## Overview

The application uses OpenAuth to provide OAuth authentication with multiple providers. Each provider requires you to create an OAuth application and obtain client credentials.

## Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create OAuth 2.0 client credentials
5. Add authorized redirect URIs:
   - For development: `http://localhost:8787/auth/oauth/google/callback`
   - For production: `https://your-domain.com/auth/oauth/google/callback`

Set the following environment variables:
```bash
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Facebook OAuth Setup

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or use an existing one
3. Add "Facebook Login" product
4. Configure OAuth redirect URIs:
   - For development: `http://localhost:8787/auth/oauth/facebook/callback`
   - For production: `https://your-domain.com/auth/oauth/facebook/callback`

Set the following environment variables:
```bash
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret
```

## GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth app
3. Set the authorization callback URL:
   - For development: `http://localhost:8787/auth/oauth/github/callback`
   - For production: `https://your-domain.com/auth/oauth/github/callback`

Set the following environment variables:
```bash
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

## Cloudflare Workers Configuration

### Development (wrangler.toml)

Add the OAuth credentials to your `wrangler.toml` file:

```toml
[vars]
GOOGLE_CLIENT_ID = "your-google-client-id"
GOOGLE_CLIENT_SECRET = "your-google-client-secret"
FACEBOOK_CLIENT_ID = "your-facebook-client-id"
FACEBOOK_CLIENT_SECRET = "your-facebook-client-secret"
GITHUB_CLIENT_ID = "your-github-client-id"
GITHUB_CLIENT_SECRET = "your-github-client-secret"
```

### Production (Cloudflare Dashboard)

For production, use Cloudflare secrets instead of plain text variables:

```bash
# Set secrets using Wrangler CLI
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET
wrangler secret put FACEBOOK_CLIENT_ID
wrangler secret put FACEBOOK_CLIENT_SECRET
wrangler secret put GITHUB_CLIENT_ID
wrangler secret put GITHUB_CLIENT_SECRET
```

## KV Namespace Setup

OpenAuth requires a KV namespace for storing OAuth state. Create one:

```bash
# Create KV namespace
wrangler kv:namespace create "oauth_kv_namespace"
wrangler kv:namespace create "oauth_kv_namespace" --preview

# Update the IDs in wrangler.toml with the returned values
```

## Testing OAuth Flow

1. Start the development server: `npm run wrangler:dev`
2. Visit `http://localhost:8787/login`
3. Click on any OAuth provider button
4. Complete the OAuth flow
5. You should be redirected back to the application dashboard

## Troubleshooting

### Common Issues

1. **Redirect URI mismatch**: Ensure the callback URLs in your OAuth apps match exactly
2. **Invalid client credentials**: Double-check your client IDs and secrets
3. **KV namespace not found**: Make sure the KV namespace is created and properly configured
4. **CORS issues**: Ensure your OAuth apps allow the correct origins

### Error Messages

The application provides detailed error messages for OAuth failures:
- `oauth_denied`: User cancelled the OAuth flow
- `oauth_exchange_failed`: Failed to exchange authorization code for tokens
- `oauth_verify_failed`: Failed to verify the access token
- `user_not_found`: User account not found after OAuth authentication

### Debug Mode

Check the Cloudflare Workers logs for detailed error information:

```bash
wrangler tail
```

## Security Considerations

1. Never commit OAuth secrets to version control
2. Use different OAuth apps for development and production
3. Regularly rotate OAuth secrets
4. Monitor OAuth usage in provider dashboards
5. Implement rate limiting for OAuth endpoints

## Additional Resources

- [OpenAuth Documentation](https://openauth.js.org/docs/)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Facebook OAuth Documentation](https://developers.facebook.com/docs/facebook-login/)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
