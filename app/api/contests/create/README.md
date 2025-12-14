# Contest Creation API Route

## Workflow
**POST** `/api/contests/create`
1. Receives contest data: `contestName`, `contestDescription`, `problemIds`
2. Maps frontend field names to backend format
3. Forwards POST request to backend `/contests` endpoint
4. Returns creation result

## ⚠️ Watch Out For
- **Field Mapping**: Frontend uses `contestName` → backend expects `name` *(might be confusing)*
- **Problem IDs Array**: Ensure `problemIds` is properly formatted array
- **No Validation**: No client-side validation of required fields *(sanitization/etc.)*