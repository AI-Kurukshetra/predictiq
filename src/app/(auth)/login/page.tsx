import Link from "next/link";
import { Activity, Shield, TrendingUp } from "lucide-react";
import { loginAction } from "@/lib/actions/auth";

type LoginPageProps = {
  searchParams?:
    | { error?: string; message?: string }
    | Promise<{ error?: string; message?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await Promise.resolve(searchParams);
  const error = params?.error;
  const message = params?.message;

  return (
    <main className="flex min-h-screen bg-white">
      <section className="hidden w-1/2 lg:flex" style={{ background: "radial-gradient(circle at 30% 40%, #132D4F 0%, #0B2340 70%)" }}>
        <div className="flex w-full flex-col justify-between px-12 py-14 xl:px-16">
          <div className="flex h-full flex-col justify-center">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="PredictIQ" width={64} height={64} />
              <h1 className="text-5xl font-bold tracking-tight text-white">PredictIQ</h1>
            </div>
            <p className="mt-4 text-xl text-[#8C95A6]">AI-Powered Predictive Maintenance</p>
            <ul className="mt-10 space-y-5">
              <li className="flex items-center gap-3 text-[#8C95A6]">
                <Activity className="h-5 w-5 text-[#3B82F6]" />
                <span>Real-time equipment monitoring</span>
              </li>
              <li className="flex items-center gap-3 text-[#8C95A6]">
                <Shield className="h-5 w-5 text-[#3B82F6]" />
                <span>Predict failures 12+ days ahead</span>
              </li>
              <li className="flex items-center gap-3 text-[#8C95A6]">
                <TrendingUp className="h-5 w-5 text-[#3B82F6]" />
                <span>Reduce downtime by 40%</span>
              </li>
            </ul>
          </div>
          <p className="text-sm text-[#8C95A6]/60">Trusted by 170+ manufacturers</p>
        </div>
      </section>

      <section className="flex w-full items-center justify-center bg-white px-4 py-10 sm:px-6 lg:w-1/2 lg:px-10">
        <div className="w-full max-w-md p-2 sm:p-6">
          <h2 className="text-2xl font-bold text-[#1A2332]">Welcome back</h2>
          <p className="mt-2 text-sm text-[#5A6578]">Sign in to your account</p>

          {error ? (
            <div className="mt-4 rounded-lg border border-[#FEE2E2] bg-[#FEE2E2] px-3 py-2 text-sm text-[#991B1B]">
              {error}
            </div>
          ) : null}

          {message ? (
            <div className="mt-4 rounded-lg border border-[#DCFCE7] bg-[#DCFCE7] px-3 py-2 text-sm text-[#166534]">
              {message}
            </div>
          ) : null}

          <form action={loginAction} className="mt-6 space-y-5">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[#1A2332]">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full rounded-lg border border-[#E8ECF1] px-3 py-3 text-[#1A2332] shadow-sm outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 focus:shadow-md"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-[#1A2332]">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full rounded-lg border border-[#E8ECF1] px-3 py-3 text-[#1A2332] shadow-sm outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 focus:shadow-md"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-[#3B82F6] px-4 py-3 font-semibold text-white transition-colors hover:bg-[#2563EB]"
            >
              Sign In
            </button>
          </form>

          <div className="my-6 border-t border-[#E8ECF1]" />

          <p className="text-center text-sm text-[#5A6578]">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-[#3B82F6] hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
