import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { assembleCompanyInput } from "@/lib/pipeline";
import { generateReport } from "@/lib/claude";
import { storeReport, cacheByDomain, getByDomain, getReport } from "@/lib/storage";
import { submitLead } from "@/lib/hubspot";

export async function POST(req: NextRequest) {
  let body: { company_name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const companyName = body.company_name?.trim();
  if (!companyName) {
    return NextResponse.json({ error: "company_name is required" }, { status: 400 });
  }

  // Check domain cache
  const domainKey = companyName.toLowerCase().replace(/\s+/g, "-");
  const cachedSlug = await getByDomain(domainKey);
  if (cachedSlug) {
    const cached = await getReport(cachedSlug);
    if (cached) {
      return NextResponse.json({ slug: cachedSlug, report: cached, cached: true });
    }
  }

  // Assemble company data from public sources
  const companyInput = await assembleCompanyInput(companyName);

  // Generate report via Claude
  let report;
  try {
    report = await generateReport(companyInput);
  } catch (err) {
    console.error("Report generation failed:", err);
    return NextResponse.json(
      { error: "Report generation failed. Try a different company name." },
      { status: 500 }
    );
  }

  const slug = nanoid(10);

  // Store and cache (non-blocking failures acceptable)
  await Promise.all([
    storeReport(slug, report).catch((e) => console.error("KV store failed:", e)),
    cacheByDomain(domainKey, slug).catch((e) => console.error("KV cache failed:", e)),
  ]);

  // Fire HubSpot lead — fire-and-forget
  submitLead(slug, report).catch((e) => console.error("HubSpot submit failed:", e));

  return NextResponse.json({ slug, report });
}
