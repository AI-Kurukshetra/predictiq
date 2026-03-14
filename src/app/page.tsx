"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Activity, BarChart3, Bell, BrainCircuit, Shield, TrendingUp, Zap } from "lucide-react";

/* ─── Logo SVG ─── */
function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill="#0B2340" />
      <circle cx="20" cy="20" r="9" stroke="#3B82F6" strokeWidth="1.5" />
      <line x1="20" y1="8" x2="20" y2="11" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
      <line x1="20" y1="29" x2="20" y2="32" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
      <line x1="8" y1="20" x2="11" y2="20" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
      <line x1="29" y1="20" x2="32" y2="20" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
      <line x1="11.5" y1="11.5" x2="13.5" y2="13.5" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
      <line x1="26.5" y1="26.5" x2="28.5" y2="28.5" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
      <line x1="28.5" y1="11.5" x2="26.5" y2="13.5" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
      <line x1="13.5" y1="26.5" x2="11.5" y2="28.5" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
      <path d="M17 18 Q20 14 23 18 Q20 22 17 18" fill="#3B82F6" opacity="0.9" />
      <path d="M17 22 Q20 18 23 22 Q20 26 17 22" fill="#3B82F6" opacity="0.9" />
    </svg>
  );
}

/* ─── Scroll reveal ─── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setVisible(true); return; }
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

/* ─── Counter ─── */
function AnimatedNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const { ref, visible } = useReveal();
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!visible) return;
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - start) / 1500, 1);
      setValue(Math.round((1 - Math.pow(1 - p, 3)) * target * 10) / 10);
      if (p < 1) requestAnimationFrame(step);
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
  return (
    <div className="mt-4">
      <svg viewBox="0 0 420 80" className="w-full" preserveAspectRatio="none">
        <polyline points="0,60 30,55 60,50 90,52 120,48 150,45 180,42 210,38 240,35 270,55 300,30 330,28 360,25 390,22 420,20" fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 600, strokeDashoffset: visible ? 0 : 600, transition: "stroke-dashoffset 3s ease-out" }} />
        {visible && (
          <g style={{ animation: "fade-in 0.5s ease-out 2s forwards", opacity: 0 }}>
            <circle cx="270" cy="55" r="5" fill="#F53642" style={{ animation: "pulse-dot 2s ease-in-out infinite" }} />
            <rect x="216" y="33" width="108" height="18" rx="4" fill="#0B2340" opacity="0.95" />
            <text x="270" y="45" textAnchor="middle" fill="white" fontSize="8" fontWeight="500">⚠ Anomaly detected</text>
          </g>
        )}
      </svg>
      <p className="mt-1 text-xs text-[#8C95A6]">Vibration — CNC Machine #4</p>
    </div>
  );
}

/* ─── Grid Background Pattern ─── */
function GridPattern() {
  return (
    <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(59,130,246,0.06)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  );
}

/* ─── Main ─── */
export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const heroReveal = useReveal();
  const demoReveal = useReveal();
  const featuresReveal = useReveal();
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
      <header className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled ? "border-b border-[#E8ECF1] bg-white/95 shadow-sm backdrop-blur" : "bg-white/80 backdrop-blur-md"}`}>
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo size={32} />
            <span className="text-lg font-bold text-[#0B2340]">PredictIQ</span>
          </Link>
          <div className="flex items-center gap-5">
            <Link href="/login" className="text-sm text-[#5A6578] hover:text-[#1A2332]">Log in</Link>
            <Link href="/signup" className="rounded-lg bg-[#3B82F6] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#2563EB] hover:shadow-md">
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* ─── HERO — split layout with floating dashboard ─── */}
        <section className="relative min-h-screen overflow-hidden" style={{ background: "linear-gradient(135deg, #F8FAFF 0%, #EEF2FF 30%, #F0FDF9 60%, #FFFBEB 100%)" }}>
          <GridPattern />

          <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col items-center gap-12 px-6 pt-28 pb-16 lg:flex-row lg:gap-16 lg:pt-32">
            {/* Left — text */}
            <div
              ref={heroReveal.ref}
              className={`flex-1 text-center transition-all duration-700 lg:text-left ${heroReveal.visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"}`}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-[#3B82F6]/20 bg-[#DBEAFE] px-4 py-1.5 text-sm font-medium text-[#1E40AF]">
                <Zap className="h-3.5 w-3.5" />
                AI-Powered Predictive Maintenance
              </span>

              <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-[#0B2340] sm:text-5xl lg:text-[3.5rem]">
                Predict failures
                <br />
                <span className="bg-gradient-to-r from-[#3B82F6] to-[#2563EB] bg-clip-text text-transparent">before they happen.</span>
              </h1>

              <p className="mt-5 max-w-lg text-lg leading-relaxed text-[#5A6578] lg:text-xl">
                PredictIQ monitors your equipment 24/7, detects anomalies in real-time, and alerts your team before costly breakdowns.
              </p>

              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
                <Link href="/signup" className="rounded-lg bg-[#3B82F6] px-8 py-3.5 text-lg font-semibold text-white shadow-lg shadow-[#3B82F6]/25 transition hover:bg-[#2563EB] hover:shadow-xl">
                  Start Free
                </Link>
                <a href="#demo" className="rounded-lg border-2 border-[#E8ECF1] bg-white px-8 py-3.5 text-lg font-medium text-[#1A2332] transition hover:border-[#3B82F6] hover:text-[#3B82F6]">
                  See it in action
                </a>
              </div>

              <p className="mt-4 text-sm text-[#8C95A6]">No credit card required · Setup in 5 minutes</p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                {[
                  { icon: Shield, label: "99.9% Uptime", bg: "bg-[#DCFCE7]", color: "text-[#166534]", iconColor: "text-[#2ADE6B]" },
                  { icon: Activity, label: "Real-time", bg: "bg-[#DBEAFE]", color: "text-[#1E40AF]", iconColor: "text-[#3B82F6]" },
                  { icon: BrainCircuit, label: "AI Powered", bg: "bg-[#FEF3C7]", color: "text-[#92400E]", iconColor: "text-[#F59E0B]" },
                ].map((item) => (
                  <div key={item.label} className={`flex items-center gap-1.5 rounded-full ${item.bg} px-3 py-1.5 text-xs font-semibold ${item.color}`}>
                    <item.icon className={`h-3.5 w-3.5 ${item.iconColor}`} />
                    {item.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — floating dashboard preview */}
            <div className={`flex-1 transition-all delay-300 duration-700 ${heroReveal.visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
              <div className="relative mx-auto max-w-lg" style={{ animation: "float 6s ease-in-out infinite" }}>
                {/* Main card */}
                <div className="rounded-2xl border border-[#E8ECF1] bg-white p-5 shadow-2xl shadow-[#3B82F6]/10">
                  {/* Top bar */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-[#0B2340] p-1.5">
                        <BrainCircuit className="h-full w-full text-[#3B82F6]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#1A2332]">AI Prediction Engine</p>
                        <p className="text-[10px] text-[#8C95A6]">Analyzing 18 machines</p>
                      </div>
                    </div>
                    <span className="flex items-center gap-1 rounded-full bg-[#DCFCE7] px-2 py-0.5 text-[10px] font-semibold text-[#166534]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#2ADE6B] animate-pulse" />
                      Live
                    </span>
                  </div>

                  {/* Mini stats */}
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="rounded-lg bg-[#F5F6FA] p-2.5 text-center">
                      <p className="text-lg font-bold text-[#2ADE6B]">94%</p>
                      <p className="text-[10px] text-[#8C95A6]">Uptime</p>
                    </div>
                    <div className="rounded-lg bg-[#F5F6FA] p-2.5 text-center">
                      <p className="text-lg font-bold text-[#F53642]">3</p>
                      <p className="text-[10px] text-[#8C95A6]">Critical</p>
                    </div>
                    <div className="rounded-lg bg-[#F5F6FA] p-2.5 text-center">
                      <p className="text-lg font-bold text-[#3B82F6]">12</p>
                      <p className="text-[10px] text-[#8C95A6]">Predictions</p>
                    </div>
                  </div>

                  {/* Sensor chart */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-[#1A2332]">Vibration Sensor — CNC #4</p>
                      <span className="rounded bg-[#FEE2E2] px-1.5 py-0.5 text-[9px] font-bold text-[#991B1B]">ANOMALY</span>
                    </div>
                    <svg viewBox="0 0 300 60" className="mt-2 w-full">
                      {/* Grid lines */}
                      <line x1="0" y1="15" x2="300" y2="15" stroke="#E8ECF1" strokeWidth="0.5" />
                      <line x1="0" y1="30" x2="300" y2="30" stroke="#E8ECF1" strokeWidth="0.5" />
                      <line x1="0" y1="45" x2="300" y2="45" stroke="#E8ECF1" strokeWidth="0.5" />
                      {/* Threshold line */}
                      <line x1="0" y1="18" x2="300" y2="18" stroke="#F53642" strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />
                      {/* Data line */}
                      <polyline points="0,40 20,38 40,35 60,37 80,33 100,30 120,32 140,28 160,25 180,22 200,20 210,14 220,8 230,14 240,18 260,22 280,25 300,28" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 500, strokeDashoffset: heroReveal.visible ? 0 : 500, transition: "stroke-dashoffset 2.5s ease-out" }} />
                      {/* Anomaly spike dot */}
                      {heroReveal.visible && <circle cx="220" cy="8" r="4" fill="#F53642" style={{ animation: "pulse-dot 2s ease-in-out infinite" }} />}
                      {/* Area fill */}
                      <polygon points="0,40 20,38 40,35 60,37 80,33 100,30 120,32 140,28 160,25 180,22 200,20 210,14 220,8 230,14 240,18 260,22 280,25 300,28 300,60 0,60" fill="url(#heroGradient)" opacity="0.15" />
                      <defs><linearGradient id="heroGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3B82F6" /><stop offset="100%" stopColor="#3B82F6" stopOpacity="0" /></linearGradient></defs>
                    </svg>
                  </div>

                  {/* AI prediction card */}
                  <div className="mt-3 rounded-lg border-l-3 border border-[#E8ECF1] bg-[#F5F6FA] p-3" style={{ borderLeftWidth: "3px", borderLeftColor: "#F59E0B" }}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-semibold text-[#1A2332]">Bearing Failure Predicted</p>
                        <p className="mt-0.5 text-[10px] text-[#5A6578]">CNC Machine #4 · 87% confidence</p>
                      </div>
                      <span className="rounded bg-[#FEF3C7] px-1.5 py-0.5 text-[9px] font-bold text-[#92400E]">5 DAYS</span>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-[#E8ECF1]">
                      <div className="h-1.5 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#F53642]" style={{ width: "87%" }} />
                    </div>
                  </div>
                </div>

                {/* Floating mini card — top right */}
                <div className="absolute -right-4 -top-3 rounded-xl border border-[#E8ECF1] bg-white p-3 shadow-lg" style={{ animation: "float 5s ease-in-out 1s infinite" }}>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#DCFCE7]">
                      <TrendingUp className="h-4 w-4 text-[#2ADE6B]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#166534]">40%</p>
                      <p className="text-[9px] text-[#8C95A6]">Cost saved</p>
                    </div>
                  </div>
                </div>

                {/* Floating mini card — bottom left */}
                <div className="absolute -bottom-2 -left-4 rounded-xl border border-[#E8ECF1] bg-white p-3 shadow-lg" style={{ animation: "float 7s ease-in-out 0.5s infinite" }}>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FEE2E2]">
                      <Bell className="h-4 w-4 text-[#F53642]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#991B1B]">3 Alerts</p>
                      <p className="text-[9px] text-[#8C95A6]">Need attention</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── LIVE DASHBOARD PREVIEW ─── */}
        <section id="demo" className="bg-[#F5F6FA] px-6 py-20">
          <div ref={demoReveal.ref} className={`mx-auto max-w-5xl transition-all duration-700 ${demoReveal.visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
            <p className="text-center text-sm font-medium uppercase tracking-widest text-[#8C95A6]">See PredictIQ in action</p>

            <div className="mt-10 overflow-hidden rounded-2xl border border-[#E8ECF1] bg-white shadow-2xl" style={{ animation: "float 6s ease-in-out infinite" }}>
              <div className="flex items-center gap-2 border-b border-[#E8ECF1] bg-[#F5F6FA] px-4 py-2.5">
                <span className="h-3 w-3 rounded-full bg-[#F53642]" />
                <span className="h-3 w-3 rounded-full bg-[#F59E0B]" />
                <span className="h-3 w-3 rounded-full bg-[#2ADE6B]" />
                <span className="ml-3 text-xs font-medium text-[#8C95A6]">PredictIQ Dashboard</span>
              </div>
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  <div className="rounded-lg border border-[#E8ECF1] p-3 text-center sm:p-4">
                    <p className="text-xl font-bold text-[#3B82F6] sm:text-2xl">18</p>
                    <p className="text-[10px] text-[#5A6578] sm:text-xs">Machines</p>
                  </div>
                  <div className="rounded-lg border border-[#E8ECF1] p-3 text-center sm:p-4">
                    <p className="animate-pulse text-xl font-bold text-[#F53642] sm:text-2xl">3</p>
                    <p className="text-[10px] text-[#5A6578] sm:text-xs">Critical</p>
                  </div>
                  <div className="rounded-lg border border-[#E8ECF1] p-3 text-center sm:p-4">
                    <p className="text-xl font-bold text-[#2ADE6B] sm:text-2xl">94.2%</p>
                    <p className="text-[10px] text-[#5A6578] sm:text-xs">Uptime</p>
                  </div>
                </div>
                <AnimatedChart visible={demoReveal.visible} />
                <div className={`mt-4 space-y-2 transition-all duration-500 ${demoReveal.visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`} style={{ transitionDelay: "2.5s" }}>
                  <div className="flex items-center gap-2 rounded-lg border border-[#FEE2E2] bg-[#FEE2E2]/50 px-3 py-2 text-xs">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-[#F53642]" />
                    <span className="text-[#991B1B]"><span className="font-semibold">Critical:</span> Air Compressor #2 — Motor temperature exceeding threshold</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-[#FEF3C7] bg-[#FEF3C7]/50 px-3 py-2 text-xs">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-[#F59E0B]" />
                    <span className="text-[#92400E]"><span className="font-semibold">Warning:</span> Hydraulic Press #1 — Pressure fluctuation detected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── FEATURES ─── */}
        <section className="bg-white px-6 py-20">
          <div ref={featuresReveal.ref} className={`mx-auto max-w-5xl transition-all duration-700 ${featuresReveal.visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-[#3B82F6]">Features</p>
              <h2 className="mt-3 text-3xl font-bold text-[#0B2340]">Everything you need to prevent downtime</h2>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {[
                { icon: Activity, title: "Real-time Monitoring", desc: "Track vibration, temperature, and pressure sensors across all equipment with live dashboards.", iconBg: "bg-[#DBEAFE]", iconColor: "text-[#3B82F6]", hoverBg: "group-hover:bg-[#3B82F6]" },
                { icon: BrainCircuit, title: "AI Failure Prediction", desc: "Machine learning models predict failures 12+ days in advance with 87% accuracy.", iconBg: "bg-[#FEF3C7]", iconColor: "text-[#F59E0B]", hoverBg: "group-hover:bg-[#F59E0B]" },
                { icon: Bell, title: "Smart Alerts", desc: "Get notified instantly when anomalies are detected. Prioritized by severity and urgency.", iconBg: "bg-[#FEE2E2]", iconColor: "text-[#F53642]", hoverBg: "group-hover:bg-[#F53642]" },
                { icon: BarChart3, title: "Analytics & Reports", desc: "Track uptime, MTBF, MTTR, and cost savings with interactive charts and exportable reports.", iconBg: "bg-[#DBEAFE]", iconColor: "text-[#3B82F6]", hoverBg: "group-hover:bg-[#3B82F6]" },
                { icon: Shield, title: "Role-Based Access", desc: "Managers, technicians, and admins each get tailored views and permissions.", iconBg: "bg-[#DCFCE7]", iconColor: "text-[#2ADE6B]", hoverBg: "group-hover:bg-[#2ADE6B]" },
                { icon: TrendingUp, title: "ROI Tracking", desc: "Measure the financial impact of predictive maintenance vs reactive repairs.", iconBg: "bg-[#DCFCE7]", iconColor: "text-[#166534]", hoverBg: "group-hover:bg-[#166534]" },
              ].map((f, i) => (
                <div
                  key={f.title}
                  className={`group rounded-xl border border-[#E8ECF1] bg-white p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-lg ${featuresReveal.visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${f.iconBg} transition-colors ${f.hoverBg}`}>
                    <f.icon className={`h-6 w-6 ${f.iconColor} transition-colors group-hover:text-white`} />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-[#1A2332]">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#5A6578]">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── METRICS ─── */}
        <section className="border-y border-[#E8ECF1] bg-[#F5F6FA] px-6 py-16">
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 text-center md:grid-cols-3">
            <div>
              <p className="text-5xl font-bold text-[#0B2340]"><AnimatedNumber target={12} suffix=" days" /></p>
              <p className="mt-2 text-sm text-[#5A6578]">average advance warning</p>
            </div>
            <div>
              <p className="text-5xl font-bold text-[#2ADE6B]"><AnimatedNumber target={94.2} suffix="%" /></p>
              <p className="mt-2 text-sm text-[#5A6578]">equipment uptime</p>
            </div>
            <div>
              <p className="text-5xl font-bold text-[#3B82F6]"><AnimatedNumber target={40} suffix="%" /></p>
              <p className="mt-2 text-sm text-[#5A6578]">reduction in downtime costs</p>
            </div>
          </div>
        </section>

        {/* ─── HOW IT WORKS ─── */}
        <section className="bg-[#0B2340] px-6 py-20">
          <div ref={stepsReveal.ref} className={`mx-auto max-w-4xl text-center transition-all duration-700 ${stepsReveal.visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
            <p className="text-sm font-semibold uppercase tracking-widest text-[#3B82F6]">How it works</p>
            <h2 className="mt-3 text-3xl font-bold text-white">Three steps to zero downtime</h2>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {[
                { num: "01", title: "Connect", desc: "Install sensors on your equipment. PredictIQ connects in minutes." },
                { num: "02", title: "Predict", desc: "AI analyzes patterns 24/7 and predicts failures days in advance." },
                { num: "03", title: "Prevent", desc: "Get actionable alerts. Schedule maintenance. Zero unplanned downtime." },
              ].map((step, i) => (
                <div
                  key={step.num}
                  className={`rounded-xl border border-white/5 bg-[#132D4F] p-8 transition-all duration-500 hover:-translate-y-1 hover:border-[#3B82F6]/30 ${stepsReveal.visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
                  style={{ transitionDelay: `${i * 150}ms` }}
                >
                  <p className="text-4xl font-bold text-[#3B82F6]">{step.num}</p>
                  <h3 className="mt-3 text-lg font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#8C95A6]">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section className="relative overflow-hidden bg-[#3B82F6] px-6 py-20">
          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-[60px]" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-[#0B2340]/20 blur-[60px]" />
          <div ref={ctaReveal.ref} className={`relative mx-auto max-w-2xl text-center transition-all duration-700 ${ctaReveal.visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"}`}>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Stop reacting. Start predicting.</h2>
            <p className="mt-4 text-lg text-white/80">Join 170+ manufacturers who trust PredictIQ to prevent costly downtime.</p>
            <Link href="/signup" className="mt-8 inline-block rounded-lg bg-white px-8 py-3.5 text-lg font-semibold text-[#3B82F6] shadow-lg transition hover:shadow-xl">
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

      <style jsx global>{`
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        @keyframes pulse-dot { 0%, 100% { r: 5; opacity: 1; } 50% { r: 8; opacity: 0.6; } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }
      `}</style>
    </div>
  );
}
