import { NextRequest, NextResponse } from "next/server";
import { getReport } from "@/lib/storage";
import { submitEmail } from "@/lib/hubspot";

export async function POST(req: NextRequest) {
  let body: { email?: string; slug?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { email, slug } = body;
  if (!email || !slug) {
    return NextResponse.json({ error: "email and slug are required" }, { status: 400 });
  }

  const report = await getReport(slug);
  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  await submitEmail(email, slug, report).catch((e) =>
    console.error("Email capture HubSpot submit failed:", e)
  );

  return NextResponse.json({ ok: true });
}
