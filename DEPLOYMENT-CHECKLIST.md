# Quantum Adventure - Deployment Checklist

Use this checklist to ensure a successful deployment of the Quantum Adventure application to Cloudflare.

## Pre-Deployment Checklist

### 1. Prerequisites
- [ ] Cloudflare account created
- [ ] Node.js installed (v18+)
- [ ] Git repository set up
- [ ] Local development environment working

### 2. Local Setup
- [ ] Dependencies installed (`npm install`)
- [ ] Environment variables configured
- [ ] Local development server working (`npm run dev`)
- [ ] No TypeScript errors or build issues

### 3. Authentication Providers (Optional)
- [ ] Google OAuth app created (if using)
- [ ] Facebook OAuth app created (if using)
- [ ] GitHub OAuth app created (if using)
- [ ] Client IDs and secrets obtained

## Deployment Steps

### Step 1: Cloudflare Authentication
```bash
npx wrangler login
```
- [ ] Successfully authenticated with Cloudflare
- [ ] Verified account has Workers and D1 access

### Step 2: Database Setup
```bash
npm run db:create
```
- [ ] D1 database created successfully
- [ ] Database ID copied from output
- [ ] `wrangler.toml` updated with correct database ID

### Step 3: Database Schema
```bash
npm run db:migrate
```
- [ ] Schema applied successfully
- [ ] No errors in table creation

### Step 4: Database Population
```bash
npm run db:populate
```
- [ ] Course content inserted successfully
- [ ] Sample achievements created

### Step 5: Secrets Configuration
```bash
# Required
npx wrangler secret put JWT_SECRET
```
- [ ] JWT_SECRET set (generate a strong random string)

```bash
# Optional OAuth secrets (if using)
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET
npx wrangler secret put FACEBOOK_CLIENT_ID
npx wrangler secret put FACEBOOK_CLIENT_SECRET
npx wrangler secret put GITHUB_CLIENT_ID
npx wrangler secret put GITHUB_CLIENT_SECRET
```
- [ ] Required OAuth secrets configured
- [ ] Verified with `npx wrangler secret list`

### Step 6: Configuration Update
Update `wrangler.toml`:
- [ ] Database ID updated
- [ ] Domain name updated in routes section
- [ ] APP_BASE_URL updated for production environment

### Step 7: OAuth Callback URLs
For each OAuth provider being used:
- [ ] Google: Added `https://your-domain.com/api/auth/google/callback`
- [ ] Facebook: Added `https://your-domain.com/api/auth/facebook/callback`
- [ ] GitHub: Added `https://your-domain.com/api/auth/github/callback`

### Step 8: Deploy
```bash
npm run deploy
```
- [ ] Build completed successfully
- [ ] Worker deployed successfully
- [ ] No deployment errors

## Post-Deployment Verification

### 1. Basic Functionality
- [ ] Frontend loads at your domain
- [ ] Login page accessible
- [ ] Registration page accessible
- [ ] No JavaScript errors in browser console

### 2. Authentication Testing
- [ ] Email/password registration works
- [ ] Email/password login works
- [ ] Google OAuth works (if configured)
- [ ] Facebook OAuth works (if configured)
- [ ] GitHub OAuth works (if configured)
- [ ] Logout functionality works
- [ ] Protected routes redirect to login when not authenticated

### 3. Database Verification
```bash
npx wrangler d1 execute quantum-adventure-db --command="SELECT COUNT(*) FROM Users;"
npx wrangler d1 execute quantum-adventure-db --command="SELECT COUNT(*) FROM CourseSections;"
npx wrangler d1 execute quantum-adventure-db --command="SELECT COUNT(*) FROM LearningUnits;"
```
- [ ] Database is accessible
- [ ] Course content is present
- [ ] User creation works

### 4. Application Features
- [ ] User can access main application after login
- [ ] Course modules load correctly
- [ ] Interactive elements work
- [ ] Progress tracking functions

## Production Setup

### 1. Custom Domain (Optional)
- [ ] Custom domain configured in Cloudflare
- [ ] SSL certificate active
- [ ] Routes updated in `wrangler.toml`

### 2. Production Database
```bash
npm run db:migrate:prod
npm run db:populate:prod
```
- [ ] Production database schema applied
- [ ] Production course content populated

### 3. Monitoring
- [ ] Cloudflare Analytics enabled
- [ ] Error tracking configured
- [ ] Performance monitoring active

## Troubleshooting

### Common Issues and Solutions

1. **"Database not found" error**
   - [ ] Verify database ID in `wrangler.toml` matches the created database
   - [ ] Ensure database was created in the same Cloudflare account

2. **OAuth callback errors**
   - [ ] Check redirect URIs exactly match in provider settings
   - [ ] Ensure URLs use HTTPS in production
   - [ ] Verify client IDs and secrets are correct

3. **"Secret not found" errors**
   - [ ] Use `npx wrangler secret list` to verify secrets exist
   - [ ] Re-add any missing secrets
   - [ ] Ensure secret names match exactly in code

4. **CORS errors**
   - [ ] Verify APP_BASE_URL environment variable
   - [ ] Check domain configuration
   - [ ] Ensure authentication endpoints are accessible

5. **Build/deployment failures**
   - [ ] Run `npm run build` locally to check for errors
   - [ ] Verify all TypeScript errors are resolved
   - [ ] Check Wrangler CLI version is up to date

### Debug Commands

```bash
# View live logs
npx wrangler tail

# Test database connection
npx wrangler d1 execute quantum-adventure-db --command="SELECT 1;"

# List all secrets
npx wrangler secret list

# Check deployment status
npx wrangler deployments list
```

## Success Criteria

Your deployment is successful when:
- [ ] Users can register and log in with email/password
- [ ] OAuth authentication works (if configured)
- [ ] Users can access the main application
- [ ] Course content loads and displays correctly
- [ ] Interactive quantum visualizations work
- [ ] User progress is saved to the database
- [ ] No critical errors in production logs

## Next Steps After Deployment

1. **Content Enhancement**: Add more learning modules and interactive exercises
2. **Analytics**: Set up user behavior tracking
3. **Performance**: Monitor and optimize load times
4. **Security**: Regular security audits and updates
5. **Features**: Implement additional gamification elements
6. **Community**: Add user forums or discussion features

---

**Note**: Keep this checklist handy for future deployments and updates. Each checkbox should be verified during the deployment process.
