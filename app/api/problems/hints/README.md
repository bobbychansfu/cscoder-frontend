# Hints API Route

## Workflow

**GET** `/api/problems/hints?computing_id=&pid=`
1. Forwards request to backend `/hints` endpoint
2. Returns all hints for a given problem with `pid` from user with ID `computing_id`

**POST** `/api/problems/hints`
1. Forwards request to backend `/request_hint` endpoint 
2. If successful, an AI-generated hint with either the next line(s) of code needed to continue + explanation, or highlighting any errors in the code
will eventually be returned via a websocket in the problem page.
