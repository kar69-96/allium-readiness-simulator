import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#FAF8F4] flex flex-col items-center justify-center px-4 text-center gap-6">
      <div className="w-16 h-16 rounded-2xl bg-[#E9D5FF] flex items-center justify-center">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M16 10v8M16 21v1" stroke="#B66AD1" strokeWidth="2" strokeLinecap="round" />
          <circle cx="16" cy="16" r="13" stroke="#B66AD1" strokeWidth="2" />
        </svg>
      </div>
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Page not found</h1>
        <p className="text-[#6B7280] text-sm mt-2 max-w-sm">
          The page you&apos;re looking for doesn&apos;t exist. If you had a report link, it may have expired.
        </p>
      </div>
      <Link
        href="/"
        className="px-6 py-3 rounded-xl bg-[#B66AD1] hover:bg-purple-600 text-white font-semibold transition-colors"
      >
        Back to simulator
      </Link>
    </main>
  );
}
