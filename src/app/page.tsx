"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/* ─── Logo SVG inline ─── */
function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill="#0B2340" />
      <circle cx="20" cy="20" r="9" stroke="#0D8070" strokeWidth="1.5" />
      <line x1="20" y1="8" x2="20" y2="11" stroke="#0D8070" strokeWidth="2" strokeLinecap="round" />
      <line x1="20" y1="29" x2="20" y2="32" stroke="#0D8070" strokeWidth="2" strokeLinecap="round" />
      <line x1="8" y1="20" x2="11" y2="20" stroke="#0D8070" strokeWidth="2" strokeLinecap="round" />
      <line x1="29" y1="20" x2="32" y2="20" stroke="#0D8070" strokeWidth="2" strokeLinecap="round" />
      <line x1="11.5" y1="11.5" x2="13.5" y2="13.5" stroke="#0D8070" strokeWidth="2" strokeLinecap="round" />
      <line x1="26.5" y1="26.5" x2="28.5" y2="28.5" stroke="#0D8070" strokeWidth="2" strokeLinecap="round" />
      <line x1="28.5" y1="11.5" x2="26.5" y2="13.5" stroke="#0D8070" strokeWidth="2" strokeLinecap="round" />
      <line x1="13.5" y1="26.5" x2="11.5" y2="28.5" stroke="#0D8070" strokeWidth="2" strokeLinecap="round" />
      <path d="M17 18 Q20 14 23 18 Q20 22 17 18" fill="#E07A5F" opacity="0.9" />
      <path d="M17 22 Q20 18 23 22 Q20 26 17 22" fill="#E07A5F" opacity="0.9" />
    </svg>
  );
}

/* ─── Scroll-reveal hook ─── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

/* ─── Counter animation ─── */
function AnimatedNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const { ref, visible } = useReveal();
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!visible) return;
    const duration = 1500;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target * 10) / 10);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [visible, target]);
  return (
    <span ref={ref} className={`transition-opacity duration-700 ${visible ? "opacity-100" : "opacity-0"}`}>
      {Number.isInteger(target) ? Math.round(value) : value.toFixed(1)}{suffix}
    </span>
  );
}

/* ─── Animated Chart ─── */
function AnimatedChart({ visible }: { visible: boolean }) {
  const points = "0,60 30,55 60,50 90,52 120,48 150,45 180,42 210,38 240,35 270,55 300,30 330,28 360,25 390,22 420,20";
  return (
    <div className="mt-4">
      <svg viewBox="0 0 420 80" className="w-full" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke="#0D8070"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 600,
            strokeDashoffset: visible ? 0 : 600,
            transition: "stroke-dashoffset 3s ease-out",
          }}
        />
        {visible && (
          <g style={{ animation: "fade-in 0.5s ease-out 2s forwards", opacity: 0 }}>
            <circle cx="270" cy="55" r="5" fill="#E07A5F" style={{ animation: "pulse-dot 2s ease-in-out infinite" }} />
            <rect x="222" y="33" width="96" height="18" rx="4" fill="#0B2340" opacity="0.9" />
            <text x="270" y="45" textAnchor="middle" fill="white" fontSize="8" fontWeight="500">Anomaly detected</text>
          </g>
        )}
      </svg>
      <p className="mt-1 text-xs text-[#8C95A6]">Vibration — CNC Machine #4</p>
    </div>
  );
}

/* ─── Main Page ─── */
export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const heroReveal = useReveal();
  const demoReveal = useReveal();
  const stepsReveal = useReveal();
  const ctaReveal = useReveal();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="bg-white text-[#1A2332]">
      {/* ─── NAVBAR ─── */}
      <header
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          scrolled ? "border-b border-[#E8ECF1] bg-white/95 shadow-sm backdrop-blur" : "bg-transparent"
        }`}
      >
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo size={32} />
            <span className="text-lg font-bold text-[#0B2340]">PredictIQ</span>
          </Link>
          <div className="flex items-center gap-5">
            <Link href="/login" className="text-sm text-[#5A6578] hover:text-[#1A2332]">
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-[#E07A5F] px-5 py-2 text-sm font-semibold text-white transition hover:scale-105 hover:shadow-md"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* ─── HERO ─── */}
        <section className="flex min-h-screen items-center justify-center px-6 pt-20">
          <div
            ref={heroReveal.ref}
            className={`mx-auto max-w-3xl text-center transition-all duration-700 ${
              heroReveal.visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
            }`}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-[#E6F5F0] px-4 py-1.5 text-sm font-medium text-[#0D8070]">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="3" stroke="#0D8070" strokeWidth="1.5" />
                <line x1="7" y1="1" x2="7" y2="3" stroke="#0D8070" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="7" y1="11" x2="7" y2="13" stroke="#0D8070" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="1" y1="7" x2="3" y2="7" stroke="#0D8070" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="11" y1="7" x2="13" y2="7" stroke="#0D8070" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              AI-Powered Predictive Maintenance
            </span>

            <h1 className="mt-8 text-4xl font-bold leading-tight tracking-tight text-[#0B2340] sm:text-5xl lg:text-6xl">
              Predict failures
              <br />
              before they happen.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#5A6578] sm:text-xl">
              PredictIQ monitors your equipment 24/7, detects anomalies in real-time, and alerts your team before costly breakdowns occur.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="rounded-lg bg-[#E07A5F] px-8 py-3.5 text-lg font-semibold text-white transition hover:scale-105 hover:shadow-lg"
              >
                Start Free
              </Link>
              <a
                href="#demo"
                className="rounded-lg border-2 border-[#E8ECF1] px-8 py-3.5 text-lg text-[#1A2332] transition hover:border-[#0D8070]"
              >
                See it in action
              </a>
            </div>

            <p className="mt-4 text-sm text-[#8C95A6]">No credit card required · Setup in 5 minutes</p>
          </div>
        </section>

        {/* ─── LIVE DASHBOARD PREVIEW ─── */}
        <section id="demo" className="bg-[#F5F6FA] px-6 py-20">
          <div
            ref={demoReveal.ref}
            className={`mx-auto max-w-5xl transition-all duration-700 ${
              demoReveal.visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <p className="text-center text-sm font-medium uppercase tracking-widest text-[#8C95A6]">
              See PredictIQ in action
            </p>

            <div
              className="mt-10 overflow-hidden rounded-2xl border border-[#E8ECF1] bg-white shadow-2xl"
              style={{ animation: "float 6s ease-in-out infinite" }}
            >
              {/* Mock top bar */}
              <div className="flex items-center gap-2 border-b border-[#E8ECF1] bg-[#F5F6FA] px-4 py-2.5">
                <span className="h-3 w-3 rounded-full bg-[#E07A5F]" />
                <span className="h-3 w-3 rounded-full bg-[#E8ECF1]" />
                <span className="h-3 w-3 rounded-full bg-[#0D8070]" />
                <span className="ml-3 text-xs font-medium text-[#8C95A6]">PredictIQ Dashboard</span>
              </div>

              <div className="p-4 sm:p-6">
                {/* Stat cards */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  <div className="rounded-lg border border-[#E8ECF1] p-3 text-center sm:p-4">
                    <p className="text-xl font-bold text-[#0D8070] sm:text-2xl">18</p>
                    <p className="text-[10px] text-[#5A6578] sm:text-xs">Machines</p>
                  </div>
                  <div className="rounded-lg border border-[#E8ECF1] p-3 text-center sm:p-4">
                    <p className="animate-pulse text-xl font-bold text-[#8B2252] sm:text-2xl">3</p>
                    <p className="text-[10px] text-[#5A6578] sm:text-xs">Critical</p>
                  </div>
                  <div className="rounded-lg border border-[#E8ECF1] p-3 text-center sm:p-4">
                    <p className="text-xl font-bold text-[#0D8070] sm:text-2xl">94.2%</p>
                    <p className="text-[10px] text-[#5A6578] sm:text-xs">Uptime</p>
                  </div>
                </div>

                <AnimatedChart visible={demoReveal.visible} />

                {/* Alert rows */}
                <div
                  className={`mt-4 space-y-2 transition-all duration-500 ${
                    demoReveal.visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  }`}
                  style={{ transitionDelay: "2.5s" }}
                >
                  <div className="flex items-center gap-2 rounded-lg border border-[#F0E4E8] bg-[#F0E4E8]/50 px-3 py-2 text-xs">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-[#8B2252]" />
                    <span className="text-[#6B1D3A]">
                      <span className="font-semibold">Critical:</span> Air Compressor #2 — Motor temperature exceeding threshold
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-[#FFF0EB] bg-[#FFF0EB]/50 px-3 py-2 text-xs">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-[#E07A5F]" />
                    <span className="text-[#8B3A1F]">
                      <span className="font-semibold">Warning:</span> Hydraulic Press #1 — Pressure fluctuation detected
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── METRICS ─── */}
        <section className="bg-white px-6 py-16">
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 text-center md:grid-cols-3">
            <div>
              <p className="text-5xl font-bold text-[#0B2340]">
                <AnimatedNumber target={12} suffix=" days" />
              </p>
              <p className="mt-2 text-sm text-[#5A6578]">average advance warning</p>
            </div>
            <div>
              <p className="text-5xl font-bold text-[#0D8070]">
                <AnimatedNumber target={94.2} suffix="%" />
              </p>
              <p className="mt-2 text-sm text-[#5A6578]">equipment uptime</p>
            </div>
            <div>
              <p className="text-5xl font-bold text-[#E07A5F]">
                <AnimatedNumber target={40} suffix="%" />
              </p>
              <p className="mt-2 text-sm text-[#5A6578]">reduction in downtime costs</p>
            </div>
          </div>
        </section>

        {/* ─── HOW IT WORKS ─── */}
        <section className="bg-[#0B2340] px-6 py-20">
          <div
            ref={stepsReveal.ref}
            className={`mx-auto max-w-4xl text-center transition-all duration-700 ${
              stepsReveal.visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <h2 className="text-3xl font-bold text-white">Three steps to zero downtime</h2>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {[
                { num: "01", title: "Connect", desc: "Install sensors on your equipment. PredictIQ connects in minutes." },
                { num: "02", title: "Predict", desc: "AI analyzes patterns 24/7 and predicts failures days in advance." },
                { num: "03", title: "Prevent", desc: "Get actionable alerts. Schedule maintenance. Zero unplanned downtime." },
              ].map((step, i) => (
                <div
                  key={step.num}
                  className={`rounded-xl bg-[#132D4F] p-8 transition-all duration-500 hover:-translate-y-1 ${
                    stepsReveal.visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                  }`}
                  style={{ transitionDelay: `${i * 150}ms` }}
                >
                  <p className="text-4xl font-bold text-[#E07A5F]">{step.num}</p>
                  <h3 className="mt-3 text-lg font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#8C95A6]">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section className="bg-[#0D8070] px-6 py-16">
          <div
            ref={ctaReveal.ref}
            className={`mx-auto max-w-2xl text-center transition-all duration-700 ${
              ctaReveal.visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
            }`}
          >
            <h2 className="text-3xl font-bold text-white">Stop reacting. Start predicting.</h2>
            <p className="mt-3 text-white/70">Join 170+ manufacturers who trust PredictIQ.</p>
            <Link
              href="/signup"
              className="mt-8 inline-block rounded-lg bg-[#E07A5F] px-8 py-3.5 text-lg font-semibold text-white transition hover:scale-105 hover:shadow-lg"
            >
              Get Started Free
            </Link>
            <p className="mt-3 text-sm text-white/50">No credit card required</p>
          </div>
        </section>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="bg-[#0B2340] px-6 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo size={24} />
            <span className="text-sm font-semibold text-white">PredictIQ</span>
          </div>
          <p className="text-sm text-[#8C95A6]">&copy; 2026 PredictIQ</p>
        </div>
      </footer>

      {/* ─── CSS Animations ─── */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes pulse-dot {
          0%, 100% { r: 5; opacity: 1; }
          50% { r: 8; opacity: 0.6; }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}
