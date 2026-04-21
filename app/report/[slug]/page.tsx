import { getReport } from "@/lib/storage";
import ReportClientPage from "./ReportClientPage";

export default async function ReportPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const report = await getReport(slug);

  return <ReportClientPage slug={slug} initialReport={report} />;
}
