import { NextRequest, NextResponse } from "next/server";
import { envServer } from "@/app/env/server";
import { getErrorMessage } from "@/app/utils/handleReport";

export const runtime = "nodejs";
export const maxDuration = 60;

const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const RESUME_SERVER_TIMEOUT_MS = 60_000;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<{ jobDescription: string }>;
    const jobDescription = body.jobDescription?.trim();

    if (!jobDescription) {
      return NextResponse.json({ error: "jobDescription is required" }, { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), RESUME_SERVER_TIMEOUT_MS);

    try {
      const response = await fetch(`${envServer.RESUME_SERVER_URL}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": envServer.RESUME_API_KEY,
        },
        body: JSON.stringify({ jobDescription }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const details = await response.text();
        return NextResponse.json({ error: details || "Resume server request failed" }, { status: response.status });
      }

      if (!response.body) {
        return NextResponse.json({ error: "Resume server returned an empty response" }, { status: 502 });
      }

      return new NextResponse(response.body, {
        status: response.status,
        headers: {
          "Content-Type": response.headers.get("Content-Type") || DOCX_MIME,
          "Content-Disposition":
            response.headers.get("Content-Disposition") || 'attachment; filename="zishenchan-resume.docx"',
          "Cache-Control": "no-store",
        },
      });
    } finally {
      clearTimeout(timeout);
    }
  } catch (err) {
    const message =
      err instanceof DOMException && err.name === "AbortError" ? "Resume generation timed out" : getErrorMessage(err);

    console.error(`resume API error: ${message}`);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
