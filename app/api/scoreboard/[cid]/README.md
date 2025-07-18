# Scoreboard API Route

## Workflow
**GET** `/api/scoreboard/[cid]`
1. Forwards contest ID to backend `/main/scoreboard/[cid]` endpoint
2. Returns contest leaderboard and ranking data

## ⚠️ Watch Out For
- **Performance**: Large contests may have slow scoreboard loading *(I would like to add Redis for caching)*