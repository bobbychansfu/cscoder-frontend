# API Routes

## Overview
Next.js API routes that act as a proxy layer between the frontend and the Node.js backend server (port 5000).

## Workflow
All routes follow the same workflow:
1. Extract cookies from request headers for authentication
2. Forward requests to backend server (`http://localhost:5000`)
3. Handle errors and transform responses as needed
4. Return JSON responses to frontend

## ⚠️ Important Notes
- **Hardcoded Backend URL**: All routes use `localhost:5000` - update for proper deployment
- **Cookie Forwarding**: Essential for maintaining user sessions with backend
- **Error Handling**: Not very consistent error handling in different files
- **No Input Validation**: Routes pass data directly to backend without validation/sanitization (might be a big security problem)