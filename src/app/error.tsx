"use client";

import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
      <h1 className="text-2xl font-bold text-[#1A2332]">Something went wrong</h1>
      <div className="mt-4 max-w-lg rounded-lg bg-[#F5F6FA] p-4 text-left">
        <p className="text-sm text-[#5A6578]">{error.message}</p>
      </div>
      <div className="mt-6 flex gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-[#E07A5F] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#C4654D]"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="rounded-lg border border-[#E8ECF1] px-6 py-3 text-sm font-medium text-[#5A6578] transition hover:bg-[#F9FAFB]"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
