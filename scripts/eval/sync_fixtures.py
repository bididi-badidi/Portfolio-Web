from __future__ import annotations

import json
import os
import sys
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[2]
load_dotenv(ROOT / ".env.local", override=False)
load_dotenv(ROOT / ".env", override=False)

FIXTURES_DIR = ROOT / ".ai" / "eval" / "fixtures" / "knowledge"

_FIXTURES: list[tuple[str, str]] = [
    ("knowledge.json", "knowledge.json"),
    ("master_data.json", "master_resume.json"),
]

_DUMMY_VALUES = {"", "dummy-key-id", "dummy-secret", "dummy-bucket", "dummy"}


def _env(name: str) -> str:
    return os.getenv(name, "")


def credentials_available() -> bool:
    return not any(
        _env(var) in _DUMMY_VALUES
        for var in ("AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_BUCKET_NAME")
    )


def _download(client: object, bucket: str, s3_key: str, dest: Path) -> None:
    print(
        f"sync_fixtures: downloading s3://{bucket}/{s3_key} → {dest}",
        file=sys.stderr,
        flush=True,
    )
    response = client.get_object(Bucket=bucket, Key=s3_key)  # type: ignore[attr-defined]
    raw = response["Body"].read().decode("utf-8")
    parsed = json.loads(raw)
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(json.dumps(parsed, indent=2, ensure_ascii=False), encoding="utf-8")
    print(
        f"sync_fixtures: wrote {len(raw)} bytes to {dest}",
        file=sys.stderr,
        flush=True,
    )


def sync_fixtures() -> None:
    if not credentials_available():
        print(
            "sync_fixtures: AWS credentials not set — using existing fixtures.",
            file=sys.stderr,
        )
        return

    import boto3

    client = boto3.client(
        "s3",
        region_name=_env("AWS_REGION") or "us-east-1",
        aws_access_key_id=_env("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=_env("AWS_SECRET_ACCESS_KEY"),
    )
    bucket = _env("AWS_BUCKET_NAME")

    for s3_key, filename in _FIXTURES:
        _download(client, bucket, s3_key, FIXTURES_DIR / filename)


if __name__ == "__main__":
    sync_fixtures()
