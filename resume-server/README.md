# Resume Generation API

FastAPI service that turns a job description into a tailored `.docx` resume.

## Setup

```bash
cd resume-server
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Fill in `.env`:

```bash
GEMINI_API_KEY=...
GEMINI_MODEL_RESUME=gemini-2.0-flash
GEMINI_MODEL_REVIEWER=gemini-2.0-flash
AWS_REGION=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_BUCKET_NAME=...
RESUME_API_KEY=...
ALLOWED_ORIGINS=http://localhost:3000
```

`RESUME_API_KEY` is required by default. For local-only unauthenticated testing, set `DEV_MODE=1`.

## Run

```bash
python main.py
```

Equivalent explicit command:

```bash
uvicorn main:app --reload --timeout-keep-alive 120
```

The API listens on `http://localhost:8000`.

## Health Check

```bash
curl http://localhost:8000/health
```

## Generate Resume

```bash
curl -X POST http://localhost:8000/generate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $RESUME_API_KEY" \
  --data '{"jobDescription":"We need a full-stack engineer with TypeScript, Next.js, Python, AWS, and LLM experience."}' \
  --output out.docx
```

## CORS Probe

```bash
curl -X OPTIONS http://localhost:8000/generate \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -i
```
