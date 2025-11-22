# Hints API Route

## Workflow
**POST** `/api/problems/hints`
1. Forwards request to backend `/request_hint` endpoint 
2. Returns a generated AI hint with either the next line(s) of code needed to continue + explanation, or highlighting any errors in the code
