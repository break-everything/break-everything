import { NextRequest, NextResponse } from "next/server";
import {
  createToolRequest,
  getPendingToolRequests,
  getAllToolRequests,
} from "@/server/db";
import { isAuthenticated } from "@/server/auth";
import { rateLimiters } from "@/server/rate-limit";
import { jsonServerError } from "@/server/api-response";
import { readJsonObjectBody } from "@/server/parse-json-body";
import { isAllowedHttpUrl } from "@/server/validation";

export async function GET(request: NextRequest) {
  const blocked = rateLimiters.publicRead(request);
  if (blocked) return blocked;

  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const requests = await getAllToolRequests();
  return NextResponse.json({ requests });
}

export async function POST(request: NextRequest) {
  const blocked = rateLimiters.requestSubmit(request);
  if (blocked) return blocked;

  const parsed = await readJsonObjectBody(request);
  if (!parsed.ok) return parsed.response;
  const body = parsed.body;

  const toolName = String(body.tool_name ?? "").trim();
  const description = String(body.description ?? "").trim();
  if (!toolName || !description) {
    return NextResponse.json(
      { error: "Tool name and description are required" },
      { status: 400 }
    );
  }

  if (toolName.length > 100 || description.length > 1000) {
    return NextResponse.json(
      { error: "Tool name or description is too long" },
      { status: 400 }
    );
  }

  const submittedByRaw = String(body.submitted_by ?? "").trim();
  const submittedBy = submittedByRaw || undefined;
  if (submittedBy && submittedBy.length > 200) {
    return NextResponse.json({ error: "submitted_by is too long" }, { status: 400 });
  }

  const linkRaw = String(body.link ?? "").trim();
  const link = linkRaw || undefined;
  if (link && !isAllowedHttpUrl(link)) {
    return NextResponse.json(
      { error: "link must be a valid http(s) URL" },
      { status: 400 }
    );
  }

  try {
    await createToolRequest({
      tool_name: toolName,
      description,
      submitted_by: submittedBy,
      link,
    });

    const pendingCount = (await getPendingToolRequests()).length;
    return NextResponse.json({ success: true, pendingCount }, { status: 201 });
  } catch (err: unknown) {
    return jsonServerError(err);
  }
}
