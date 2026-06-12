#!/usr/bin/env bash
# Test the local resume-server end-to-end.
#
# Usage:
#   scripts/test-resume-api.sh                       # uses a built-in sample JD
#   scripts/test-resume-api.sh "Paste JD here..."    # inline JD
#   scripts/test-resume-api.sh path/to/jd.txt        # JD from file
#
# Env:
#   RESUME_SERVER_URL   default http://localhost:8000
#   RESUME_API_KEY      optional; sent as X-API-Key if set
#   OUTPUT              default out.docx
#
# Exit codes: 0 ok, 1 bad input, 2 server unreachable, 3 non-200, 4 not a docx.

set -euo pipefail

URL="${RESUME_SERVER_URL:-http://localhost:8000}"
OUT="${OUTPUT:-out.docx}"
API_KEY="${RESUME_API_KEY:-}"

DEFAULT_JD='We are hiring a Senior Full-Stack Engineer comfortable with TypeScript, Next.js, Python, and AWS. You will own an LLM-powered product feature end-to-end: prompt design, evaluation, server APIs, and the React UI. Bonus: experience with FastAPI, S3, and Gemini.'

# --- Resolve JD ---
if [[ $# -ge 1 ]]; then
  if [[ -f "$1" ]]; then
    JD="$(cat "$1")"
  else
    JD="$1"
  fi
else
  JD="$DEFAULT_JD"
fi

if [[ -z "${JD// }" ]]; then
  echo "error: job description is empty" >&2
  exit 1
fi

echo "[1/3] Health check → $URL/health"
if ! curl -fsS --max-time 5 "$URL/health" >/dev/null; then
  echo "error: server not reachable at $URL — start it with:" >&2
  echo "       cd resume-server && uvicorn main:app --reload --timeout-keep-alive 120" >&2
  exit 2
fi
echo "      ok"

echo "[2/3] POST $URL/generate (JD: ${#JD} chars)"
TMP_BODY="$(mktemp)"
trap 'rm -f "$TMP_BODY"' EXIT

# Build JSON safely with python (no escaping headaches).
python3 -c "import json,sys; print(json.dumps({'jobDescription': sys.argv[1]}))" "$JD" > "$TMP_BODY"

HTTP_CODE="$(
  curl -sS -o "$OUT" -w "%{http_code}" \
    --max-time 300 \
    -X POST "$URL/generate" \
    -H "Content-Type: application/json" \
    ${API_KEY:+-H "X-API-Key: $API_KEY"} \
    --data-binary @"$TMP_BODY"
)"

if [[ "$HTTP_CODE" != "200" ]]; then
  echo "error: server returned HTTP $HTTP_CODE" >&2
  echo "--- response body ---" >&2
  cat "$OUT" >&2 || true
  echo >&2
  rm -f "$OUT"
  exit 3
fi

echo "[3/3] Verify output is a .docx"
# A real .docx starts with the ZIP magic bytes "PK\x03\x04".
MAGIC="$(head -c 4 "$OUT" | xxd -p)"
if [[ "$MAGIC" != "504b0304" ]]; then
  echo "error: $OUT is not a valid .docx (magic=$MAGIC)" >&2
  exit 4
fi

SIZE="$(wc -c < "$OUT" | tr -d ' ')"
echo "      ok — wrote $OUT ($SIZE bytes)"
echo
echo "Open it: open \"$OUT\""
