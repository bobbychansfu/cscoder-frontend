# Contest Detail API Route

## Workflow
**GET** `/api/contest/[cid]`
1. **Auto-registers** user to contest via POST to `/s/contest/register/[cid]`
2. **Enters contest** via GET to `/s/entercontest/[cid]`
3. **Fetches contest data** from `/s/contest/[cid]`
4. **Gets contest info** from `/s/closed/[cid]`
5. Combines all data into single response *(bulky but I think it's the only way)*

## ⚠️ Watch Out For
- **Multiple API Calls**: Makes 4+ backend requests per frontend request, don't get confused!!!
- **Auto-Registration**: Automatically registers user - no user consent *(don't think users need to do that though (not sure))*
- **Error Handling**: Continues execution even if some requests fail
- **Submission Loop**: Fetches submissions for each problem individually