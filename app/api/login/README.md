# Login API Route

## Workflow
**GET** `/api/login`
1. Extracts CAS ticket from query parameters
2. Forwards ticket to backend authentication endpoint
3. Handles cookie passthrough for session management
4. Returns authentication result

## ⚠️ Watch Out For
- **Hardcoded Backend URL**: Uses `localhost:5000` - needs environment configuration
- **Cookie Handling**: Critical for maintaining user sessions