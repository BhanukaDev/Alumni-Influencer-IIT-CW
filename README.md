# Alumni Influencer Platform

Built for the 6COSC022W Advanced Server-Side coursework. Part 1 is the alumni-facing platform — profiles, bidding, API key management. Part 2 adds a university analytics dashboard that talks to the same backend through scoped bearer tokens.

## Architecture

```
apps/
├── backend/                 # Express.js + TypeScript + Prisma (port 3000)
│   ├── src/
│   │   ├── routes/           # auth, profile, bidding, developer, public, analytics
│   │   ├── middleware/      # requireAuth, requireApiKey, requirePermission, errorHandler
│   │   ├── lib/              # prisma client, email, token generation, swagger
│   │   ├── jobs/             # node-cron winner selection job
│   │   └── types/            # express session + request extensions
│   └── prisma/
│       ├── schema.prisma
│       ├── migrations/
│       └── seed.ts           # demo data
│
├── frontend/                # Alumni app — React + Vite (port 5173)
│   └── src/
│       ├── pages/            # Register, Login, Profile, Bidding, Developer
│       └── services/         # API clients (session-based auth)
│
└── analytics-dashboard/      # University dashboard — React + Vite (port 5174)
    └── src/
        ├── pages/            # Login, Register, Dashboard, Charts, Alumni
        └── services/         # auth (session) + analytics (API key)
```

The two frontends are separate apps with different auth mechanisms. The alumni app uses session cookies. The analytics dashboard gets a scoped API key on first login, stores it in `localStorage`, and uses it for all analytics requests.

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 18+ |
| Backend framework | Express.js 5 + TypeScript |
| ORM | Prisma 7 (SQLite adapter) |
| Database | SQLite via better-sqlite3 |
| Session store | better-sqlite3-session-store |
| Password hashing | bcryptjs (12 rounds) |
| Input validation | Zod |
| Security headers | Helmet |
| Scheduled jobs | node-cron |
| API docs | swagger-jsdoc + swagger-ui-express |
| Frontend | React 18 + TypeScript + Vite |
| Charts | Chart.js + react-chartjs-2 |

## Setup

### 1. Install dependencies

```bash
cd apps/backend && npm install
cd ../frontend && npm install
cd ../analytics-dashboard && npm install
```

### 2. Configure environment

```bash
cp apps/backend/.env.example apps/backend/.env
```

Fill in the values — at minimum `SESSION_SECRET`, `EMAIL_*`, and `DATABASE_URL`. See the comments in `.env.example` for what each variable does.

### 3. Set up the database

```bash
cd apps/backend
npx prisma migrate dev
```

### 4. Seed demo data

```bash
cd apps/backend
npm run seed
```

Creates 18 verified alumni accounts and 1 developer account. All use password `Password123!`. Useful for demoing the analytics charts without manually entering data.

### 5. Start everything

```bash
# Terminal 1
cd apps/backend && npm run dev

# Terminal 2
cd apps/frontend && npm run dev

# Terminal 3
cd apps/analytics-dashboard && npm run dev
```

| App | URL |
|---|---|
| Backend API | http://localhost:3000 |
| Alumni platform | http://localhost:5173 |
| Analytics dashboard | http://localhost:5174 |
| Swagger docs | http://localhost:3000/api-docs |

## Environment Variables

All in `apps/backend/.env`. See `.env.example` for inline descriptions.

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | SQLite path, e.g. `file:./dev.db` |
| `PORT` | No | Defaults to `3000` |
| `NODE_ENV` | No | `development` or `production` |
| `SESSION_SECRET` | Yes | Random 32+ character string for session cookie signing |
| `ALLOWED_ORIGINS` | Yes | Comma-separated allowed CORS origins |
| `ALLOWED_EMAIL_DOMAIN` | Yes | Domain enforced on registration, e.g. `iit.ac.lk` |
| `FRONTEND_URL` | Yes | Base URL used in verification and reset emails |
| `BIDDING_TIMEZONE` | Yes | IANA timezone for the winner selection cron, e.g. `Asia/Colombo` |
| `BIDDING_TEST_OFFSET_MINUTES` | No | Run a test winner selection N minutes after server start (dev only) |
| `EMAIL_FROM` | Yes | From address for outbound emails |
| `EMAIL_HOST` | Yes | SMTP host |
| `EMAIL_PORT` | Yes | SMTP port (587 for TLS) |
| `EMAIL_USER` | Yes | SMTP username |
| `EMAIL_PASS` | Yes | SMTP password |

## Database Schema

Defined in `apps/backend/prisma/schema.prisma`. The schema is in third normal form — no transitive dependencies between non-key attributes.

### Core models

| Model | Notes |
|---|---|
| `User` | Stores hashed password, email verification token, password reset token. |
| `Profile` | 1-to-1 with User. Includes `programme`, `graduationYear`, `industrySector` for analytics. |
| `Degree` | Many-to-1 with Profile. |
| `Certification` | Many-to-1 with Profile. Powers the skills gap chart. |
| `Course` | Many-to-1 with Profile. Powers the top tools chart. |
| `Licence` | Many-to-1 with Profile. |
| `Employment` | Many-to-1 with Profile. Company, role, start/end date. |

### Bidding models

| Model | Notes |
|---|---|
| `Bid` | Daily bid for the featured slot. Status: PENDING / WON / LOST. |
| `AppearanceRecord` | Monthly win count per user. Enforces the 3-per-month limit. |

### API key models

| Model | Notes |
|---|---|
| `ApiKey` | Stores a SHA-256 hash of the raw key plus a `permissions` JSON array. The raw key is never stored. |
| `ApiKeyUsageLog` | One row per authenticated request: endpoint, method, timestamp. |

## API Endpoints

### Authentication — `/auth`

| Method | Path | Description |
|---|---|---|
| POST | `/auth/register` | Register with a university email. Sends a verification email. |
| GET | `/auth/verify-email?token=` | Verify the email address. |
| POST | `/auth/login` | Login. Creates a server-side session. |
| GET | `/auth/session` | Returns current session info. |
| POST | `/auth/logout` | Destroys the session. |
| POST | `/auth/forgot-password` | Sends a password reset email. |
| POST | `/auth/reset-password` | Resets the password with a valid token. |

### Profile — `/profile` (session auth)

| Method | Path | Description |
|---|---|---|
| GET | `/profile` | Get own full profile. |
| POST | `/profile` | Create profile. |
| PATCH | `/profile` | Update bio, LinkedIn, programme, graduation year, industry sector. |
| POST | `/profile/image` | Update profile image URL. |
| GET | `/profile/completion` | Completion percentage and missing sections. |
| POST/PATCH/DELETE | `/profile/degrees/:id` | CRUD for degrees. |
| POST/PATCH/DELETE | `/profile/certifications/:id` | CRUD for certifications. |
| POST/PATCH/DELETE | `/profile/licences/:id` | CRUD for licences. |
| POST/PATCH/DELETE | `/profile/courses/:id` | CRUD for courses. |
| POST/PATCH/DELETE | `/profile/employments/:id` | CRUD for employment records. |

### Bidding — `/bidding` (session auth)

| Method | Path | Description |
|---|---|---|
| GET | `/bidding/slot` | View tomorrow's open slot. |
| POST | `/bidding` | Place a blind bid. |
| PATCH | `/bidding/:id` | Increase own bid. Decreases are rejected. |
| DELETE | `/bidding/:id` | Cancel own bid. |
| GET | `/bidding/status` | Win/lose status for the current window. |
| GET | `/bidding/history` | Past bids. |
| GET | `/bidding/monthly-limit` | Remaining slots this month. |

### Developer API keys — `/developer` (session auth)

| Method | Path | Description |
|---|---|---|
| POST | `/developer/keys` | Generate a new API key with a permissions array. |
| GET | `/developer/keys` | List own keys. |
| GET | `/developer/keys/:id/stats` | Usage stats and last 100 request logs. |
| DELETE | `/developer/keys/:id` | Revoke a key. |

### Public API — `/api/v1` (bearer token)

| Method | Path | Permission | Description |
|---|---|---|---|
| GET | `/api/v1/alumni/today` | `read:alumni_of_day` | Today's and tomorrow's featured alumnus. |

### Analytics API — `/api/v1/analytics` (bearer token)

| Method | Path | Permission | Description |
|---|---|---|---|
| GET | `/api/v1/analytics/overview` | `read:analytics` | Total counts: alumni, certifications, courses, employments. |
| GET | `/api/v1/analytics/skills-gap` | `read:analytics` | Top certifications acquired post-graduation, grouped by name. |
| GET | `/api/v1/analytics/top-courses` | `read:analytics` | Most completed courses. |
| GET | `/api/v1/analytics/employment-by-sector` | `read:analytics` | Alumni grouped by industry sector. |
| GET | `/api/v1/analytics/employment-by-role` | `read:analytics` | Alumni grouped by job title. |
| GET | `/api/v1/analytics/certifications-over-time` | `read:analytics` | Certification volume by month. |
| GET | `/api/v1/analytics/alumni-by-programme` | `read:analytics` | Alumni grouped by degree programme. |
| GET | `/api/v1/analytics/alumni-by-graduation-year` | `read:analytics` | Alumni grouped by graduation year. |
| GET | `/api/v1/analytics/alumni` | `read:alumni` | Full alumni list. Accepts `?programme=`, `?graduationYear=`, `?industrySector=` filters. |

## API Key Scoping

API keys carry a `permissions` array. Hitting an endpoint without the required permission returns `403 Forbidden`. Keys are SHA-256 hashed before storage — the raw key is shown once on creation.

| Client | Permissions | Blocked from |
|---|---|---|
| University Analytics Dashboard | `read:alumni`, `read:analytics` | `/api/v1/alumni/today` |
| Mobile AR App | `read:alumni_of_day` | All analytics endpoints |

## Security

| Feature | Implementation |
|---|---|
| Password hashing | bcryptjs, 12 salt rounds |
| Token generation | `crypto.randomBytes(32)`, hex-encoded, single-use with expiry |
| API key storage | SHA-256 hash only |
| Permission enforcement | `requirePermission()` middleware, per endpoint |
| Input validation | Zod schemas on every route |
| Security headers | Helmet |
| CORS | Restricted to `ALLOWED_ORIGINS` |
| Rate limiting | 1000 requests per 15 minutes per IP |
| Session cookies | `httpOnly`, `sameSite: strict`, `secure` in production |
| Email domain check | Registration blocked unless email matches `ALLOWED_EMAIL_DOMAIN` |

## Scheduled Jobs

Defined in `src/jobs/biddingJobs.ts`. Runs daily at 18:00 in the configured timezone.

- Picks the highest bid for each upcoming day's slot
- Marks the winner `WON`, everyone else `LOST`
- Increments the winner's monthly appearance count
- Enforces the 3-per-month limit (4 with event bonus)

In development, a second job fires 3 minutes after startup so winner selection can be tested without waiting until 6 PM.

## Demo Accounts

After `npm run seed`:

| Email | Password | Role |
|---|---|---|
| `admin@iit.ac.lk` | `Password123!` | Developer |
| `ashan.perera@iit.ac.lk` | `Password123!` | Alumni |
| `dilini.fernando@iit.ac.lk` | `Password123!` | Alumni |
| *(16 more alumni — see `prisma/seed.ts`)* | `Password123!` | Alumni |
