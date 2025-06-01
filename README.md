# Quantum Adventure - Interactive Quantum Computing Learning Platform

An engaging, gamified web application that teaches quantum computing concepts through interactive visualizations, hands-on exercises, and a compelling narrative. Built for deployment on Cloudflare with D1 database and comprehensive authentication.

## Features

- **Interactive Learning Modules**: 8 comprehensive sections covering quantum computing fundamentals
- **Multiple Authentication Methods**: Email/password registration + OAuth (Google, Facebook, GitHub)
- **Real-time Visualizations**: Qubit visualizers, quantum gate applications, circuit builders
- **Gamification**: Achievement system, progress tracking, and interactive quizzes
- **Cloudflare Deployment Ready**: Optimized for Cloudflare Workers and D1 database

## Quick Start

### Prerequisites

- Node.js (v18 or later)
- A Cloudflare account
- Git

### Development Setup

1. **Clone and Install**:
   ```bash
   git clone <your-repo-url>
   cd quantum-adventure
   npm install
   ```

2. **Set up Environment**:
   ```bash
   cp .env.local.example .env.local
   # Add your Gemini API key to .env.local
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

   Visit `http://localhost:5173` to see the frontend.

## Cloudflare Deployment

### 1. Authentication and Database Setup

```bash
# Login to Cloudflare
npx wrangler login

# Create D1 database
npm run db:create
```

Copy the database ID from the output and update `wrangler.toml`:
```toml
[[d1_databases]]
database_id = "your-actual-database-id"
```

### 2. Initialize Database

```bash
# Create tables
npm run db:migrate

# Populate with course content
npm run db:populate
```

### 3. Configure Secrets

```bash
# Required: JWT secret for session management
npx wrangler secret put JWT_SECRET

# Optional: OAuth providers
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET
npx wrangler secret put FACEBOOK_CLIENT_ID
npx wrangler secret put FACEBOOK_CLIENT_SECRET
npx wrangler secret put GITHUB_CLIENT_ID
npx wrangler secret put GITHUB_CLIENT_SECRET
```

### 4. OAuth Provider Setup

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select project → Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add redirect URI: `https://your-domain.com/api/auth/google/callback`

#### Facebook OAuth
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create app → Add Facebook Login
3. Add redirect URI: `https://your-domain.com/api/auth/facebook/callback`

#### GitHub OAuth
1. GitHub Settings → Developer settings → OAuth Apps
2. Create OAuth App
3. Set callback URL: `https://your-domain.com/api/auth/github/callback`

### 5. Deploy

```bash
npm run deploy
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run wrangler:dev` - Start Cloudflare Workers development server
- `npm run deploy` - Build and deploy to Cloudflare
- `npm run db:create` - Create D1 database
- `npm run db:migrate` - Apply database schema (local)
- `npm run db:migrate:prod` - Apply database schema (production)
- `npm run db:populate` - Populate with course content (local)
- `npm run db:populate:prod` - Populate with course content (production)

## Authentication Features

### Email/Password Authentication
- User registration with username, email, and password
- Secure password hashing using bcryptjs
- Session management with HTTP-only cookies

### OAuth Authentication
- Google, Facebook, and GitHub OAuth integration
- Automatic user profile creation
- Secure token handling

### API Endpoints

- `POST /api/auth/local/register` - Email/password registration
- `POST /api/auth/local/login` - Email/password login
- `GET /api/auth/{provider}/login` - OAuth login initiation
- `GET /api/auth/{provider}/callback` - OAuth callback handling
- `GET /api/auth/me` - Get current user session
- `POST /api/auth/logout` - Logout and clear session

## Architecture

### Frontend
- **React 19** with TypeScript
- **Vite** for build tooling
- **React Router** for navigation
- **Tailwind CSS** for styling (quantum-themed)

### Backend
- **Cloudflare Workers** for serverless API
- **D1 Database** for user data and progress
- **OpenAuth** for OAuth integration
- **bcryptjs** for password security

### Database Schema
- **Users**: Authentication and profile data
- **Courses**: Learning content organization
- **CourseSections**: Main learning modules
- **LearningUnits**: Individual concepts and activities
- **UserProgress**: Progress tracking per user
- **Achievements**: Gamification system

## Development Workflow

1. **Frontend Development**: Use `npm run dev` for hot-reload development
2. **Backend Testing**: Use `npm run wrangler:dev` for local Workers testing
3. **Database Changes**: Modify `schema.sql` and run migrations
4. **Content Updates**: Edit `src/constants.tsx` and regenerate `data-populate.sql`

## Troubleshooting

### Common Issues

1. **Database connection errors**: Verify database ID in `wrangler.toml`
2. **OAuth callback errors**: Check redirect URIs in provider settings
3. **Secret not found**: Use `npx wrangler secret list` to verify
4. **CORS issues**: Ensure `APP_BASE_URL` matches your domain

### Debugging

```bash
# View real-time logs
npx wrangler tail

# Check database content
npx wrangler d1 execute quantum-adventure-db --command="SELECT * FROM Users LIMIT 5;"

# List secrets
npx wrangler secret list
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly (both frontend and authentication)
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

For issues or questions, please open a GitHub issue.
