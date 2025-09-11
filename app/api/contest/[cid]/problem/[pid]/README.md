# Problem Detail & Submission API Route

## Workflow
**GET** `/api/contest/[cid]/problem/[pid]`
1. Fetches problem details from backend `/s/problem/[cid]/[pid]`
2. Transforms response structure for frontend consumption
3. Returns problem data including HTML description and downloads

**POST** `/api/contest/[cid]/problem/[pid]`
1. Receives code submission with `code` and `language`
2. Maps `code` → `textcode` for backend compatibility
3. Submits to backend `/s/submit/[cid]/[pid]`
4. Returns submission result

## ⚠️ Watch Out For
- **Field Mapping**: `code` becomes `textcode` in POST requests
- **Data Transformation**: Heavy restructuring of backend response
- **No Code Validation**: No checks for code content or language compatibility *(again, no sanitization)*