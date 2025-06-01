# Quantum Adventure - Cloudflare Deployment Guide

This guide will help you deploy the Quantum Adventure application to Cloudflare using Workers and D1 database.

## Prerequisites

1. A Cloudflare account
2. Node.js installed locally
3. Wrangler CLI (already included in dev dependencies)

## Step-by-Step Deployment

### 1. Initial Setup

First, authenticate with Cloudflare:
```bash
npx wrangler login
```

### 2. Create D1 Database

Create the D1 database:
```bash
npm run db:create
```

This will output a database ID. Copy this ID and update the `wrangler.toml` file:
```toml
[[d1_databases]]
binding = "DB"
database_name = "quantum-adventure-db"
database_id = "your-actual-database-id-here"  # Replace with the generated ID
```

### 3. Initialize Database Schema

Run the database migration to create tables:
```bash
npm run db:migrate
```

For production deployment:
```bash
npm run db:migrate:prod
```

### 4. Configure Environment Variables and Secrets

Set up the required secrets using Wrangler:

```bash
# JWT Secret for session management
npx wrangler secret put JWT_SECRET

# Google OAuth (optional)
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET

# Facebook OAuth (optional)
npx wrangler secret put FACEBOOK_CLIENT_ID
npx wrangler secret put FACEBOOK_CLIENT_SECRET

# GitHub OAuth (optional)
npx wrangler secret put GITHUB_CLIENT_ID
npx wrangler secret put GITHUB_CLIENT_SECRET
```

### 5. Update Domain Configuration

Update the `wrangler.toml` file with your actual domain:

```toml
[env.production.vars]
APP_BASE_URL = "https://your-actual-domain.pages.dev"

[[routes]]
pattern = "/api/auth/*"
zone_name = "your-actual-domain.com"
```

### 6. OAuth Provider Setup

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `https://your-domain.com/api/auth/google/callback`

#### Facebook OAuth
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Add redirect URI: `https://your-domain.com/api/auth/facebook/callback`

#### GitHub OAuth
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create new OAuth App
3. Set Authorization callback URL: `https://your-domain.com/api/auth/github/callback`

### 7. Deploy to Cloudflare

Deploy the application:
```bash
npm run deploy
```

### 8. Set up Cloudflare Pages (for frontend)

1. Go to Cloudflare Dashboard > Pages
2. Connect your GitHub repository
3. Set build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
4. Add environment variables if needed

## Development Workflow

### Local Development

1. Start the frontend development server:
```bash
npm run dev
```

2. In another terminal, start the Wrangler development server:
```bash
npm run wrangler:dev
```

### Testing Authentication

1. **Email/Password Registration**: Visit `/register` to create an account
2. **Email/Password Login**: Visit `/login` and use email/password form
3. **OAuth Login**: Click on Google/Facebook/GitHub buttons on login page
4. **Logout**: Use the logout functionality in your app

### Database Management

- **Local development**: Use `npm run db:migrate` to apply schema changes
- **Production**: Use `npm run db:migrate:prod` to apply schema changes to production

## Troubleshooting

### Common Issues

1. **Database ID not found**: Make sure you've updated `wrangler.toml` with the correct database ID from step 2

2. **OAuth callback errors**: Ensure redirect URIs in OAuth provider settings match your domain exactly

3. **CORS issues**: The auth worker is configured to handle CORS, but make sure your domain is correct in `APP_BASE_URL`

4. **Secret not found**: Verify all required secrets are set using `npx wrangler secret list`

### Debugging

1. Check Wrangler logs:
```bash
npx wrangler tail
```

2. View D1 database content:
```bash
npx wrangler d1 execute quantum-adventure-db --command="SELECT * FROM Users LIMIT 10;"
```

## Next Steps

After successful deployment:

1. **Populate Course Data**: Create a script to populate the D1 database with course content from `src/constants.tsx`

2. **Add Protected API Routes**: Create additional Workers functions for course data, user progress, etc.

3. **Implement User Dashboard**: Add protected routes and user interface for course progress

4. **Set up Monitoring**: Use Cloudflare Analytics to monitor application performance

## Security Considerations

1. **Secrets Management**: Never commit secrets to version control
2. **HTTPS Only**: Ensure all OAuth redirects use HTTPS in production
3. **JWT Expiration**: The current setup uses secure HTTP-only cookies with appropriate expiration
4. **Password Security**: bcryptjs is used for secure password hashing

## Support

If you encounter issues during deployment, check:
1. Cloudflare Dashboard logs
2. Wrangler CLI output
3. Browser developer console for frontend errors
