#!/usr/bin/env bash
set -e

echo "=== 1. REJECTED UPLOAD (INVALID FILE TYPE) ==="
curl -s -w "\nHTTP_STATUS:%{http_code}\n" -X POST http://localhost:3000/api/compliance/photo/upload \
  -F "file=@package.json;type=application/json"

echo -e "\n=== 2. VALID PHOTO UPLOAD ==="
UPLOAD_RESP=$(curl -s -X POST http://localhost:3000/api/compliance/photo/upload \
  -F "file=@scripts/test-scaffold.jpg;type=image/jpeg")
echo "$UPLOAD_RESP"

STORAGE_PATH=$(node -e "console.log(JSON.parse(process.argv[1]).storagePath)" "$UPLOAD_RESP")
UPLOAD_ID=$(node -e "console.log(JSON.parse(process.argv[1]).uploadId)" "$UPLOAD_RESP")
echo "Extracted storagePath: $STORAGE_PATH"
echo "Extracted uploadId: $UPLOAD_ID"

echo -e "\n=== 3. PHOTO COMPLIANCE ANALYSIS ==="
ANALYZE_RESP=$(curl -s -X POST http://localhost:3000/api/compliance/photo/analyze \
  -H "Content-Type: application/json" \
  -d "{\"storagePath\":\"$STORAGE_PATH\",\"question\":\"Does this scaffold tie-in setup appear to meet OSHA 1926.451 requirements?\"}")
echo "$ANALYZE_RESP"

echo -e "\n=== 4. SAVE PHOTO ANSWER TO WORKSPACE ==="
SAVE_RESP=$(curl -s -w "\nHTTP_STATUS:%{http_code}\n" -X POST http://localhost:3000/api/compliance/save \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"photo_compliance_answer\",\"question\":\"Does this scaffold tie-in setup appear to meet OSHA 1926.451 requirements?\",\"answer\":\"Based on what is visible in the photo, this appears to meet OSHA 1926.451(c)(1)...\",\"citedStandards\":[\"OSHA 1926.451(c)(1)\"],\"tradeContext\":\"Scaffolding Specialty\",\"stateContext\":\"TX\",\"modelUsed\":\"claude-3-5-sonnet-20241022\",\"sourceThreadId\":\"$UPLOAD_ID\",\"storagePath\":\"$STORAGE_PATH\"}")
echo "$SAVE_RESP"

echo -e "\n=== 5. RETRIEVE SAVED ITEMS WITH STORAGE PATH ==="
curl -s "http://localhost:3000/api/compliance/saved?userId=usr_owner_default&type=photo_compliance_answer" | node -e '
let data = "";
process.stdin.on("data", c => data += c);
process.stdin.on("end", () => {
  const json = JSON.parse(data);
  console.log("Count:", json.count);
  console.log("Latest item type:", json.items[0]?.type);
  console.log("Attached storagePath:", json.items[0]?.storagePath);
  console.log("Item citedStandards:", json.items[0]?.citedStandards);
});
'

echo -e "\n=== 6. ASK AVORRIA (TEXT COMPLIANCE Q&A) ==="
curl -s -w "\nHTTP_STATUS:%{http_code}\n" -X POST http://localhost:3000/api/compliance/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"What fall protection is required when working at 6 feet on a construction site?"}'
