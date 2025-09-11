# Contests API Route

## Workflow
**GET** `/api/contests`
1. Forwards cookie authentication to backend `/i/info` endpoint
2. Retrieves contests
3. Returns contest data

## ⚠️ Watch Out For
- **Backend Endpoint**: Uses `/i/info` instead of `/contests` *(backend server doesn't have /contests endpoint which might be a little confusing)*
- **Data Structure**: Returns both `contests` and `contestsOpen` arrays