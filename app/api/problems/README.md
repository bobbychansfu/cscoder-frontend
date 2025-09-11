# Problems API Route

## Workflow
**GET** `/api/problems`
1. Forwards request to backend `/problems` endpoint
2. Returns all available problems for contest creation *(available only for staff)*

**POST** `/api/problems`

⚠️ Creating problems isn't possible ATM
1. Receives problem data
2. Maps frontend fields to backend format (`problemName` → `name`)
3. Forwards to backend `/problems` endpoint
4. Returns creation result

## ⚠️ Watch Out For
- **Field Mapping**: Frontend uses different field names than backend (I'll try to change it later for better development experience)
- **No Validation**: No client-side validation/sanitization of problem data
- **Code Storage**: Backend handles solution code storage and validation

  *(specifically judge backend server that actually tests the code, not the backend that handles requests/auth/etc. That's why it's not working ATM)*