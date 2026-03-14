import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
      <div className="mb-6 flex items-center gap-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[#3B82F6]" />
        <span className="text-xl font-bold text-[#0B2340]">PredictIQ</span>
      </div>
      <p className="text-8xl font-bold text-[#E8ECF1]">404</p>
      <h1 className="mt-4 text-2xl font-bold text-[#1A2332]">Page not found</h1>
      <p className="mt-2 text-[#5A6578]">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 rounded-lg bg-[#3B82F6] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#2563EB]"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
