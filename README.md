# Alumni Influencer Platform

A full-stack web application for managing alumni visibility through a competitive bidding system. Built with **Express.js** (backend) and **React** (frontend).

## Architecture Overview

```
apps/
├── backend/          # Express.js + TypeScript + Prisma
│   ├── src/
│   │   ├── routes/           # API endpoints (MVC Controllers)
│   │   ├── middleware/       # Auth, error handling, API key validation
│   │   ├── lib/              # Services and utilities
│   │   ├── jobs/             # Scheduled tasks (winner selection)
│   │   └── types/            # TypeScript definitions
│   ├── prisma/               # ORM schema and migrations
│   └── package.json
│
└── frontend/         # React + TypeScript + Vite
    ├── src/
    │   ├── pages/            # Route pages
    │   ├── components/       # Reusable components
    │   ├── services/         # API clients
    │   └── types/            # TypeScript definitions
    └── package.json
```

## Tech Stack

**Backend:**
- Framework: Express.js 5
- Language: TypeScript
- Database: SQLite + Prisma ORM
- Authentication: Express-session (server-side)
- Security: Helmet, CORS, rate-limiting, bcryptjs
- Scheduled Jobs: node-cron
- API Docs: Swagger/OpenAPI

**Frontend:**
- Framework: React 18
- Language: TypeScript
- Build Tool: Vite
- HTTP Client: Fetch API

## Features

### 1. Authentication System
- User registration with email verification
- Secure login with bcrypt (12 rounds)
- Session-based authentication
- Password reset flow
- Email sending via SMTP (configured via `.env`)

### 2. Profile Management
- User profiles with bio, LinkedIn URL, profile image
- Career history: degrees, certifications, licenses, courses, employment
- Profile visibility for alumni directory

### 3. Bidding System
- Daily bidding slot for featured "Alumni Spotlight"
- Winning bid selected at 6 PM automatically
- Monthly appearance limits (3 base, 4 with event bonus)
- Real-time bid updates and cancellations

### 4. Public API
- Bearer token authentication via API keys
- Endpoint: `GET /api/v1/alumni/today` — returns featured alumni
- Usage logging and statistics tracking

### 5. Developer Dashboard
- Self-service API key management
- Generate, revoke, view usage stats per key
- Last 100 API requests logged per key

### 6. API Documentation
- Swagger/OpenAPI UI at `/api-docs`
- Full endpoint documentation with request/response schemas
- Try-it-out functionality

## Environment Setup

### Prerequisites
- Node.js 18+ and npm
- SQLite (included with Prisma)

### Installation

```bash
# Clone and install dependencies
cd apps/backend && npm install
cd ../frontend && npm install
```

### Configuration

Create `.env` file in `apps/backend/`:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL="file:./dev.db"

# Session
SESSION_SECRET="your-secret-key-here"

# Email (SMTP)
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password
SMTP_FROM=noreply@alumni-platform.local

# Frontend
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Allowed email domain for registration
ALLOWED_EMAIL_DOMAIN=iit.ac.lk

# Bidding configuration
BIDDING_TIMEZONE=Asia/Colombo
BIDDING_TEST_OFFSET_MINUTES=3  # For testing, comment out in production

# API Configuration
API_KEY_PREFIX=ak_
```

## Running the Application

### Backend
```bash
cd apps/backend

# Development (with auto-reload)
npm run dev

# Production build and run
npm run build
npm start
```

Backend runs on `http://localhost:3000`

### Frontend
```bash
cd apps/frontend

# Development (with Vite dev server)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

Frontend runs on `http://localhost:5173`

### Database Setup

```bash
cd apps/backend

# Create/reset database
npx prisma migrate dev

# View database in browser
npx prisma studio
```

## API Endpoints

### Authentication
- `POST /auth/register` — Register new user
- `GET /auth/verify-email?token=...` — Verify email
- `POST /auth/login` — Login
- `GET /auth/session` — Get current user
- `POST /auth/logout` — Logout
- `POST /auth/forgot-password` — Request password reset
- `POST /auth/reset-password` — Reset password

### Profile
- `GET /profile` — Get current user's profile
- `POST /profile` — Create profile
- `PATCH /profile` — Update profile

### Bidding
- `GET /bidding/slot` — Get current bid slot info
- `POST /bidding` — Place a bid
- `PATCH /bidding/:id` — Update existing bid
- `DELETE /bidding/:id` — Cancel bid

### Developer API
- `POST /developer/keys` — Create API key
- `GET /developer/keys` — List user's API keys
- `GET /developer/keys/:id/stats` — View usage stats
- `DELETE /developer/keys/:id` — Revoke key

### Public API (Bearer token required)
- `GET /api/v1/alumni/today` — Get featured alumnus (today + tomorrow)

## Database Schema

**Key Tables:**
- `User` — Alumni users
- `Profile` — User profile data
- `Bid` — Daily bids for featured slot
- `ApiKey` — Developer API keys
- `ApiKeyUsageLog` — API call tracking

See [apps/backend/prisma/schema.prisma](apps/backend/prisma/schema.prisma) for full schema.

## Security Features

- ✅ Password hashing with bcryptjs (12 rounds)
- ✅ HTTPS-ready with Helmet
- ✅ CORS protection
- ✅ Rate limiting (1000 req/15 min per IP)
- ✅ Session security (httpOnly, sameSite=strict)
- ✅ API key hashing (SHA-256)
- ✅ Email validation (@iit.ac.lk domain)
- ✅ Password complexity requirements

## Automatic Scheduled Tasks

- **Winner Selection:** Runs daily at 6 PM (Asia/Colombo timezone)
  - Selects highest bidder for each day's feature slot
  - Updates appearance records

## Swagger/OpenAPI Documentation

Visit `http://localhost:3000/api-docs` to explore:
- All available endpoints
- Request/response schemas
- Try-it-out interface
- Authentication requirements

## Project Goals & Completion Status

| Goal | Feature | Status |
|------|---------|--------|
| 1 | Authentication system | ✅ Complete |
| 2 | Profile management | ✅ Complete |
| 3 | Bidding system | ✅ Complete |
| 4 | Winner selection | ✅ Complete |
| 5 | User dashboard | ✅ Complete |
| 6 | Winner display on home page | ✅ Complete |
| 7 | Public API for alumni | ✅ Complete |
| 8 | User nav with identity | ✅ Complete |
| 9 | Backend status indicator | ✅ Complete |
| 10 | API key management | ✅ Complete |
| 11 | Developer dashboard | ✅ Complete |
| 12 | Public API gating with bearer tokens | ✅ Complete |
| 13 | Swagger API documentation | ✅ Complete |
| 14 | Security hardening | 🟡 Partial |
| 15 | README & architecture docs | ✅ Complete |

**Overall Completion:** ~75%

## Development Workflow

### 1. Make Changes
```bash
# Edit source files (auto-compiled via TypeScript)
```

### 2. Test Locally
```bash
# Backend: http://localhost:3000
# Frontend: http://localhost:5173
# Swagger Docs: http://localhost:3000/api-docs
```

### 3. Build for Production
```bash
cd apps/backend && npm run build
cd apps/frontend && npm run build
```

### 4. Database Migrations
```bash
# After schema changes
cd apps/backend
npx prisma migrate dev --name description_of_change
```

## Troubleshooting

### Backend won't start
- Check PORT 3000 is available
- Verify DATABASE_URL is correct
- Run `npx prisma migrate dev` to set up database

### Frontend can't connect to backend
- Ensure backend is running on port 3000
- Check CORS_ORIGINS in `.env` includes frontend URL
- Check browser DevTools Network tab for CORS errors

### Email not sending
- Verify SMTP credentials in `.env`
- Check SMTP port (usually 587 for TLS)
- Enable "Less secure apps" if using Gmail

### API key issues
- Ensure key is formatted as `Bearer ak_xxx` in requests
- Check key hasn't been revoked in `/developer`
- Verify request includes proper Authorization header

## Testing with Postman

1. **Create API Key:**
   - POST `http://localhost:3000/developer/keys`
   - Add Cookie: `sid=<your_session_id>`
   - Body: `{ "label": "test" }`

2. **Use Key to Call Public API:**
   - GET `http://localhost:3000/api/v1/alumni/today`
   - Header: `Authorization: Bearer <raw_key_from_step_1>`

## License

Coursework project for IIT.

## Support

For issues or questions, refer to the Swagger API documentation at `/api-docs` or check the code comments in the source files.
