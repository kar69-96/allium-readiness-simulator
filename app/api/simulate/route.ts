import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { assembleCompanyInput } from "@/lib/pipeline";
import { generateReport } from "@/lib/claude";
import { storeReport, cacheByDomain, getByDomain, getReport } from "@/lib/storage";
import { submitLead } from "@/lib/leads";

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY?.trim()) {
    return NextResponse.json(
      {
        error:
          "Simulator is not configured: set ANTHROPIC_API_KEY in .env.local (or .env) and restart the dev server.",
      },
      { status: 503 }
    );
  }

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

  try {
    // Check domain cache
    const domainKey = companyName.toLowerCase().replace(/\s+/g, "-");
    const cachedSlug = await getByDomain(domainKey);
    if (cachedSlug) {
      const cached = await getReport(cachedSlug);
      if (cached) {
        return NextResponse.json({ slug: cachedSlug, report: cached, cached: true });
      }
    }

    const companyInput = await assembleCompanyInput(companyName);

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

    await Promise.all([
      storeReport(slug, report).catch((e) => console.error("Report storage failed:", e)),
      cacheByDomain(domainKey, slug).catch((e) => console.error("Domain cache failed:", e)),
    ]);

    submitLead(slug, report).catch((e) => console.error("Leads webhook failed:", e));

    return NextResponse.json({ slug, report });
  } catch (err) {
    console.error("POST /api/simulate failed:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again in a moment." },
      { status: 500 }
    );
  }
}
