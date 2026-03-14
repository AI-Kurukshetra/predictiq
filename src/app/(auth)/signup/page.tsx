import Link from "next/link";
import { signupAction } from "@/lib/actions/auth";

type SignupPageProps = {
  searchParams?:
    | { error?: string; message?: string }
    | Promise<{ error?: string; message?: string }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await Promise.resolve(searchParams);
  const error = params?.error;
  const message = params?.message;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F6FA] px-4 py-10">
      <section className="w-full max-w-md rounded-xl border border-[#E8ECF1] bg-white p-6 shadow-lg sm:p-8">
        <div className="flex flex-col items-center text-center">
          <img src="/logo.svg" alt="PredictIQ" width={48} height={48} />
          <p className="mt-3 text-2xl font-bold text-[#0B2340]">PredictIQ</p>
          <h1 className="mt-2 text-xl font-semibold text-[#1A2332]">Create your account</h1>
        </div>

        {error ? (
          <div className="mt-4 rounded-lg border border-[#F0E4E8] bg-[#F0E4E8] px-3 py-2 text-sm text-[#6B1D3A]">{error}</div>
        ) : null}

        {message ? (
          <div className="mt-4 rounded-lg border border-[#E6F5F0] bg-[#E6F5F0] px-3 py-2 text-sm text-[#0A5E52]">{message}</div>
        ) : null}

        <form action={signupAction} className="mt-6 space-y-5">
          <div>
            <label htmlFor="full_name" className="mb-1.5 block text-sm font-medium text-[#1A2332]">Full Name</label>
            <input id="full_name" name="full_name" type="text" required className="w-full rounded-lg border border-[#E8ECF1] px-3 py-3 text-[#1A2332] shadow-sm outline-none transition focus:border-[#0D8070] focus:ring-2 focus:ring-[#0D8070]/20" />
          </div>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[#1A2332]">Email</label>
            <input id="email" name="email" type="email" required className="w-full rounded-lg border border-[#E8ECF1] px-3 py-3 text-[#1A2332] shadow-sm outline-none transition focus:border-[#0D8070] focus:ring-2 focus:ring-[#0D8070]/20" />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-[#1A2332]">Password</label>
            <input id="password" name="password" type="password" minLength={6} required className="w-full rounded-lg border border-[#E8ECF1] px-3 py-3 text-[#1A2332] shadow-sm outline-none transition focus:border-[#0D8070] focus:ring-2 focus:ring-[#0D8070]/20" />
          </div>
          <button type="submit" className="w-full rounded-lg bg-[#E07A5F] px-4 py-3 font-semibold text-white transition-colors hover:bg-[#C4654D]">Create Account</button>
        </form>

        <div className="my-6 border-t border-[#E8ECF1]" />
        <p className="text-center text-sm text-[#5A6578]">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-[#0D8070] hover:underline">Sign in</Link>
        </p>
      </section>
    </main>
  );
}
