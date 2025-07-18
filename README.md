# CODER Frontend

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm, yarn, pnpm, or bun package manager
- Backend server running on `http://localhost:5000`

### Installation & Running

1. Install dependencies:
```bash
npm i
```

2. Start the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

3. Open [https://coder.cmpt.sfu.ca](https://coder.cmpt.sfu.ca) in your browser *(if the frontend was launched from server)*

## Pages Overview

### Main Pages

- **`/` (Home)** - Landing page with login
- **`/contests`** - Browse all available contests (active and closed)
- **`/contest/[cid]`** - Specific contest page showing problems, progress, and submissions *(also scores which is in development)*
- **`/contest/[cid]/problems/[pid]`** - Individual problem page with code editor and submission interface *(needs polish)*
- **`/user/[userid]`** - User profile showing statistics, achievements, and recent activity
- **`/user/[userid]/create`** - Contest/problem creation interface *(available only for staff)* 

## API Routes

### Authentication
- **`GET /api/login?ticket=<ticket>`** - Handle SSO login with CAS ticket

### Contests
- **`GET /api/contests`** - Fetch all contests and open contests
- **`GET /api/contest/[cid]`** - Get contest details, problems, and user progress
- **`POST /api/contests/create`** - Create new contest *(needs implementation)* ⚠️

### Problems
- **`GET /api/problems`** - Fetch all problems
- **`POST /api/problems`** - Create new problem *(everything other than code atm)* ⚠️
- **`GET /api/contest/[cid]/problem/[pid]`** - Get problem details and description
- **`POST /api/contest/[cid]/problem/[pid]`** - Submit solution for judging *(problems with connecting to judge server)* ⚠️

### Users & Scoring
- **`GET /api/user/[userid]`** - Get user profile and statistics
- **`GET /api/scoreboard/[cid]`** - Get contest leaderboard *(needs implementation)* 🧠@GooseMooz actively working on it

## Development Notes

- All API routes proxy requests to backend server at `localhost:5000`
- Authentication handled via session cookies

## Backend Dependencies

The frontend expects a backend server running on `http://localhost:5000` with the following endpoints:
- `/i/info` - Contest information
- `/s/contest/*` - Contest-related operations
- `/s/problem/*` - Problem details and submissions
- `/user/*` - User profiles and data
- `/problems` - Problem management

## TODOS:

- Contest leaderboard API connection
- Real-time contest leaderboards page *(working on it)*
- User profile
- User statistics API connection
- Contest/Problem creation
- Real-time updates for submission status with WebSockets
- File upload support for code submissions
