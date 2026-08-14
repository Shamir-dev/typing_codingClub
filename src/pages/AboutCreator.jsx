import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { X, ChevronUp, ChevronDown, Link2, Mail, Code2, Sparkles } from "lucide-react";

// Save to: src/pages/AboutCreator.jsx (route: /about-creator)

const SLIDES = [
  {
    id: "intro",
    kicker: "Hey, I'm",
    title: "Shamir",
    subtitle: "Aspiring AI Developer & Full-Stack Engineer",
    body: "BSc CSIT student building ProCoder/Club. It's a typing platform made for developers, not typists. Every moment spend here worth for your knowledge and to improve your typing skills",
    accent: "var(--color-accent-purple)",
  },
  {
    id: "skills",
    kicker: "Stack",
    title: "What I build with",
    subtitle: "React \u00b7 Node.js \u00b7 Python \u00b7 .NET",
    body: "C++ \u00b7 Java \u00b7 C# \u00b7 Flutter \u00b7 React Native , full-stack, cross-platform, whatever the problem needs.",
    accent: "var(--color-accent-blue)",
    chips: ["React", "Next.js", "Node.js", "Python", ".NET", "C++", "Java", "Flutter"],
  },
  {
    id: "project",
    kicker: "This project",
    title: "ProCoder/Club",
    subtitle: "100 lessons \u00d7 8 languages + EnglishTypeing Mode with MemoryTest ",
    body: "A code-typing practice platform combining EDClub, SpeedCoder, and MonkeyType, built solo, from typing engine to lesson content.",
    accent: "var(--color-accent-purple)",
  },
  {
    id: "contact",
    kicker: "Let's connect",
    title: "Know real Me, And Collab",
    subtitle: "Open to internships, Job & collab",
    body: "This probject will bring you One Level up than Others so be Consistent and practice everyday",
    accent: "var(--color-accent-blue)",
    links: true,
  },
];

function useTilt() {
  const ref = useRef(null);
  const onMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) scale(1.02)`;
  }, []);
  const onLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = "perspective(900px) rotateY(0) rotateX(0) scale(1)";
  }, []);
  return { ref, onMove, onLeave };
}

function Slide({ slide, active }) {
  const { ref, onMove, onLeave } = useTilt();
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="relative h-full w-full overflow-hidden rounded-[28px] border border-line bg-panel/70 backdrop-blur-xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.35)] flex flex-col justify-center px-8 py-10"
      style={{
        transition: "transform 0.15s ease-out, opacity 0.4s ease, filter 0.4s ease",
        opacity: active ? 1 : 0,
        filter: active ? "blur(0)" : "blur(6px)",
      }}
    >
      <div
        className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full opacity-30 blur-[90px]"
        style={{ background: slide.accent }}
      />
      <span className="flex items-center text-[13px] font-semibold uppercase tracking-widest" style={{ color: slide.accent }}>
        <Sparkles size={14} className="mr-1.5" />
        {slide.kicker}
      </span>
      <h1
        className="mt-3 text-[42px] font-extrabold leading-tight"
        style={{ backgroundImage: `linear-gradient(90deg, var(--color-text), ${slide.accent})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}
      >
        {slide.title}
      </h1>
      <h2 className="text-lg font-semibold text-text-muted mb-3">{slide.subtitle}</h2>
      {slide.body && <p className="text-[15px] leading-relaxed text-text-faint">{slide.body}</p>}

      {slide.chips && (
        <div className="flex flex-wrap gap-2 mt-5">
          {slide.chips.map((c) => (
            <span key={c} className="flex items-center gap-1.5 text-[13px] rounded-full border border-line bg-panel-raised px-3 py-1.5 text-text-muted">
              <Code2 size={12} /> {c}
            </span>
          ))}
        </div>
      )}

      {slide.links && (
        <div className="flex flex-col gap-3 mt-6">
          <a href="https://github.com/shamir-dev" target="_blank" rel="noreferrer" className="flex items-center gap-2.5 rounded-xl border border-line bg-panel-raised px-4 py-3 text-text font-medium transition-colors hover:border-accent-purple/60 hover:bg-panel-raised/70">
            <Link2 size={18} /> GitHub
          </a>
          <a href="https://www.linkedin.com/in/shamir-aryal-06754b352/?skipRedirect=true" target="_blank" rel="noreferrer" className="flex items-center gap-2.5 rounded-xl border border-line bg-panel-raised px-4 py-3 text-text font-medium transition-colors hover:border-accent-purple/60 hover:bg-panel-raised/70">
            <Link2 size={18} /> LinkedIn
          </a>
          <a href="mailto:samiraryal449@gmail.com" className="flex items-center gap-2.5 rounded-xl border border-line bg-panel-raised px-4 py-3 text-text font-medium transition-colors hover:border-accent-purple/60 hover:bg-panel-raised/70">
            <Mail size={18} /> Email
          </a>
        </div>
      )}
    </div>
  );
}

export default function AboutCreator() {
  const navigate = useNavigate();
  const onClose = () => navigate(-1);
  const [index, setIndex] = useState(0);
  const touchStartY = useRef(0);

  const next = useCallback(() => setIndex((i) => Math.min(i + 1, SLIDES.length - 1)), []);
  const prev = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "ArrowDown" || e.key === "ArrowRight") next();
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, onClose]);

  const onWheel = useCallback(
    (e) => {
      if (e.deltaY > 30) next();
      if (e.deltaY < -30) prev();
    },
    [next, prev]
  );

  const onTouchStart = (e) => (touchStartY.current = e.touches[0].clientY);
  const onTouchEnd = (e) => {
    const diff = touchStartY.current - e.changedTouches[0].clientY;
    if (diff > 40) next();
    if (diff < -40) prev();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-base"
      onWheel={onWheel}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-5 right-5 z-10 grid h-10 w-10 place-items-center rounded-full border border-line bg-panel-raised text-text-muted hover:text-text transition-colors"
      >
        <X size={22} />
      </button>

      <div className="absolute top-5 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {SLIDES.map((s, i) => (
          <div
            key={s.id}
            onClick={() => setIndex(i)}
            className={`h-[3px] w-7 rounded-full cursor-pointer transition-colors ${
              i === index ? "bg-gradient-to-r from-accent-purple to-accent-blue" : "bg-line"
            }`}
          />
        ))}
      </div>

      <div className="w-[min(420px,90vw)] h-[min(680px,82vh)] flex items-center justify-center">
        {SLIDES.map((s, i) => (
          <div key={s.id} style={{ display: i === index ? "block" : "none" }} className="h-full w-full">
            <Slide slide={s} active={i === index} />
          </div>
        ))}
      </div>

      <div className="absolute right-6 bottom-8 z-10 flex flex-col gap-2">
        <button
          onClick={prev}
          disabled={index === 0}
          className="grid h-10 w-10 place-items-center rounded-full border border-line bg-panel-raised text-text-muted hover:text-text disabled:opacity-25 transition-colors"
        >
          <ChevronUp size={20} />
        </button>
        <button
          onClick={next}
          disabled={index === SLIDES.length - 1}
          className="grid h-10 w-10 place-items-center rounded-full border border-line bg-panel-raised text-text-muted hover:text-text disabled:opacity-25 transition-colors"
        >
          <ChevronDown size={20} />
        </button>
      </div>
    </div>
  );
}