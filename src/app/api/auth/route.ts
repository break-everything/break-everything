import { NextRequest, NextResponse } from "next/server";
import { login, logout, isAuthenticated } from "@/server/auth";
import { readJsonObjectBody } from "@/server/parse-json-body";
import { rateLimiters } from "@/server/rate-limit";

export async function GET(request: NextRequest) {
  const blocked = rateLimiters.publicRead(request);
  if (blocked) return blocked;

  const authed = await isAuthenticated();
  return NextResponse.json({ authenticated: authed });
}

export async function POST(request: NextRequest) {
  const blocked = rateLimiters.auth(request);
  if (blocked) return blocked;

  const parsed = await readJsonObjectBody(request);
  if (!parsed.ok) return parsed.response;

  const password = parsed.body.password;
  if (password == null || String(password).trim() === "") {
    return NextResponse.json({ error: "Password required" }, { status: 400 });
  }

  const success = await login(String(password));
  if (!success) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE() {
  await logout();
  return NextResponse.json({ success: true });
}
