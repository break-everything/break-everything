import { NextRequest, NextResponse } from "next/server";
import { getAllTools, createTool } from "@/server/db";
import { isAuthenticated } from "@/server/auth";
import { rateLimiters } from "@/server/rate-limit";
import { jsonServerError } from "@/server/api-response";
import { isAllowedHttpUrl, isValidToolSlug, parseToolKind } from "@/server/validation";

export async function GET(request: NextRequest) {
  const blocked = rateLimiters.publicRead(request);
  if (blocked) return blocked;

  const tools = await getAllTools();
  return NextResponse.json({ tools });
}

export async function POST(request: NextRequest) {
  const blocked = rateLimiters.adminWrite(request);
  if (blocked) return blocked;

  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const required = ["name", "slug", "description", "short_description", "category", "github_url"];
  for (const field of required) {
    if (!body[field]) {
      return NextResponse.json(
        { error: `Missing required field: ${field}` },
        { status: 400 }
      );
    }
  }

  let toolKind: "download" | "web" = "download";
  if (body.tool_kind != null && String(body.tool_kind).trim() !== "") {
    const parsed = parseToolKind(body.tool_kind);
    if (!parsed) {
      return NextResponse.json(
        { error: "tool_kind must be \"download\" or \"web\"" },
        { status: 400 }
      );
    }
    toolKind = parsed;
  }

  const downloadUrl = String(body.download_url ?? "").trim();
  const webUrl = String(body.web_url ?? "").trim();

  if (toolKind === "download" && !isAllowedHttpUrl(downloadUrl)) {
    return NextResponse.json(
      { error: "download_url must be a valid http(s) URL for download tools" },
      { status: 400 }
    );
  }
  if (toolKind === "web" && !isAllowedHttpUrl(webUrl)) {
    return NextResponse.json(
      { error: "web_url must be a valid http(s) URL for web apps" },
      { status: 400 }
    );
  }

  if (!isValidToolSlug(String(body.slug))) {
    return NextResponse.json(
      { error: "Invalid slug: use lowercase letters, numbers, and hyphens only" },
      { status: 400 }
    );
  }

  if (!isAllowedHttpUrl(String(body.github_url))) {
    return NextResponse.json(
      { error: "github_url must be a valid http(s) URL" },
      { status: 400 }
    );
  }

  try {
    const result = await createTool({
      name: body.name,
      slug: body.slug,
      description: body.description,
      short_description: body.short_description,
      category: body.category,
      icon: body.icon || "🔧",
      tool_kind: toolKind,
      download_url: toolKind === "download" ? downloadUrl : "",
      web_url: toolKind === "web" ? webUrl : "",
      github_url: body.github_url,
      platform: body.platform || "windows",
      sha256_hash: body.sha256_hash || null,
      safety_score: body.safety_score ?? 100,
      last_scan_date: body.last_scan_date || null,
    });
    return NextResponse.json({ success: true, id: Number(result.lastInsertRowid) }, { status: 201 });
  } catch (err: unknown) {
    return jsonServerError(err);
  }
}
