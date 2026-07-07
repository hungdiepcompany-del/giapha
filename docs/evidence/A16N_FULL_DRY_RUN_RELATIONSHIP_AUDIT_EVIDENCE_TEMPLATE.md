# A-16N Full Dry-run Relationship Audit Evidence Template

## Purpose

This template records owner-provided full dry-run relationship evidence for
audited session `2af4bfb6-a20e-453e-9804-1b8c0afbdd68`.

Do not run official import from this template. Do not call POST
`/official-import`. Do not paste secrets, cookies, tokens, real Excel files, or
service-role values.

## Save Full Dry-run Preview JSON

GET/read-only endpoint:

```powershell
curl.exe "https://web-gia-pha.hungdiepcompany.workers.dev/api/admin/import-sessions/2af4bfb6-a20e-453e-9804-1b8c0afbdd68/dry-run-preview" -o ".tmp\a16n-dry-run-preview.json"
```

If `curl.exe` is not authenticated and returns a guarded/public/unauthorized
result, copy the JSON from an authenticated owner/admin browser session instead
and save it locally as `.tmp\a16n-dry-run-preview.json`.

## Run Offline Audit

```powershell
npm run audit:a16n-full-dry-run-relationships -- .tmp\a16n-dry-run-preview.json --markdown .tmp\a16n-full-relationship-audit-report.md
```

The audit script reads only the local JSON file. It does not call production
APIs, Supabase, RPC, SQL, or official import. This remains a no import/no POST
evidence step.

## Paste Back To AI

Paste the summary JSON fields:

```json
{
  "sessionId": "",
  "totalPeople": 0,
  "totalRelationships": 0,
  "passClearCount": 0,
  "suspiciousCount": 0,
  "roleGenderMismatchCount": 0,
  "missingPersonLookupCount": 0,
  "ambiguousCount": 0,
  "weakConfidenceCount": 0,
  "directionSuspectedCount": 0,
  "unknownCount": 0,
  "officialImportOpen": false,
  "canProceedToOfficialImport": false,
  "recommendation": ""
}
```

Also paste any high-severity rows from the generated markdown report. Keep
official import locked until a later explicit phase decides the fix or owner
acceptance path.
