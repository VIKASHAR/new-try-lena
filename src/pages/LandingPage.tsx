import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [launched, setLaunched] = useState(false);
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  const taglines = ["LENA Connects.", "LENA Thinks.", "LENA Grows."];

  // Stagger entry
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Cycle taglines
  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIndex((i) => (i + 1) % taglines.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  // Canvas particle network
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    const particles: {
      x: number; y: number; vx: number; vy: number;
      r: number; opacity: number;
    }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 72; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.5,
        opacity: Math.random() * 0.4 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(79, 142, 247, ${(1 - dist / 130) * 0.15})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(79, 142, 247, ${p.opacity})`;
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const handleLaunch = () => {
    setLaunched(true);
    // ✅ Navigate to external voting URL
    setTimeout(() => {
      window.location.href = "https://voting-xq20.onrender.com/display";
    }, 800);
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden bg-background font-heading">

      {/* ── Canvas ── */}
      <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0" />

      {/* ── Subtle grid overlay ── */}
      <div
        className="pointer-events-none fixed inset-0 z-1"
        style={{
          backgroundImage: `
            linear-gradient(rgba(79, 142, 247, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(79, 142, 247, 0.02) 1px, transparent 1px)
          `,
          backgroundSize: "52px 52px",
        }}
      />

      {/* ── Top accent line ── */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-[5] h-px"
        style={{ background: "linear-gradient(90deg, transparent 0%, hsl(var(--primary)) 30%, hsl(var(--primary) / 0.6) 70%, transparent 100%)" }}
      />

      {/* ── Left accent bar ── */}
      <div
        className="pointer-events-none fixed bottom-0 left-0 top-0 z-[5] w-px"
        style={{ background: "linear-gradient(180deg, transparent 0%, hsl(var(--primary)) 30%, hsl(var(--primary) / 0.6) 70%, transparent 100%)" }}
      />

      {/* ── Corner brackets ── */}
      <Corner pos="tl" />
      <Corner pos="tr" />
      <Corner pos="bl" />
      <Corner pos="br" />

      {/* ── Radial glow ── */}
      <div
        className="pointer-events-none fixed z-[1]"
        style={{
          width: 640,
          height: 640,
          borderRadius: "50%",
          background: "radial-gradient(circle, hsl(var(--primary) / 0.1) 0%, hsl(var(--primary) / 0.05) 40%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -58%)",
        }}
      />

      {/* ── Main content ── */}
      <main
        className={cn(
          "relative z-10 flex flex-col items-center px-6 text-center",
          "transition-all duration-700 ease-out",
          visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
        )}
      >
        {/* Status pill */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-chart-2" />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            All Systems Operational · EOS v2.0
          </span>
        </div>

        {/* LENA wordmark */}
        <h1
          className="font-heading font-bold leading-none tracking-[0.22em] text-foreground"
          style={{ fontSize: "clamp(80px, 13vw, 116px)" }}
        >
          LENA
        </h1>

        {/* Full name */}
        <p className="mb-8 mt-1.5 font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground/60">
          Linde&rsquo;s Enterprise Neural Agent
        </p>

        {/* Animated taglines */}
        <div className="mb-7 flex flex-wrap items-center justify-center gap-8">
          {taglines.map((t, i) => (
            <span
              key={t}
              className={cn(
                "inline-block text-lg font-semibold tracking-wide transition-all duration-500",
                i === taglineIndex
                  ? "scale-100 text-primary"
                  : "scale-95 text-foreground/25",
              )}
            >
              {t}
            </span>
          ))}
        </div>

        {/* Divider */}
        <div
          className="mb-6 h-px w-44"
          style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.35), transparent)" }}
        />

        {/* Description */}
        <p className="mb-10 max-w-md text-sm leading-relaxed text-muted-foreground">
          Orchestrating{" "}
          <span className="font-semibold text-foreground">47+ autonomous agents</span>{" "}
          across{" "}
          <span className="font-semibold text-foreground">600+ facilities</span>{" "}
          and an{" "}
          <span className="font-semibold text-foreground">8,000-vehicle fleet</span>{" "}
          — real-time decisions, enterprise-grade control.
        </p>

        {/* CTA */}
        <Button
          size="lg"
          className="mb-12 gap-2 px-10 text-xs font-bold uppercase tracking-[0.18em]"
          onClick={handleLaunch}
          disabled={launched}
        >
          {launched ? "✓  Initialising..." : "Initialise Platform"}
          {!launched && <ArrowRight className="h-4 w-4" />}
        </Button>

        {/* Stats row */}
        <div className="flex flex-wrap items-center justify-center">
          {[
            { val: "1,200+", label: "Decisions / hr" },
            { val: "47", label: "Active Agents" },
            { val: "99.4%", label: "System Uptime" },
            { val: "600+", label: "Facilities" },
          ].map((s, i, arr) => (
            <div key={s.label} className="flex items-center">
              <div className="flex flex-col items-center gap-1 px-7">
                <span className="font-mono text-xl font-medium text-primary tabular-nums">
                  {s.val}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground/60">
                  {s.label}
                </span>
              </div>
              {i < arr.length - 1 && (
                <div className="h-8 w-px bg-border" />
              )}
            </div>
          ))}
        </div>
      </main>

      {/* ── Footer classification bar ── */}
      <footer className="fixed bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-4 whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground/40">
        <span>LENA · EOS v2.0</span>
        <span className="text-border">·</span>
        <span>Classification: Internal</span>
        <span className="text-border">·</span>
        <span>Authorised Access Only</span>
      </footer>
    </div>
  );
}

// ── Corner brackets ────────────────────────────────────────────────────────────

function Corner({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const SIZE = 48;
  const THICKNESS = 1.5;
  const COLOR = "hsl(var(--primary) / 0.3)";

  const position: React.CSSProperties =
    pos === "tl" ? { top: 20, left: 20 } :
      pos === "tr" ? { top: 20, right: 20 } :
        pos === "bl" ? { bottom: 20, left: 20 } :
          { bottom: 20, right: 20 };

  const borders: React.CSSProperties =
    pos === "tl" ? { borderTop: `${THICKNESS}px solid ${COLOR}`, borderLeft: `${THICKNESS}px solid ${COLOR}` } :
      pos === "tr" ? { borderTop: `${THICKNESS}px solid ${COLOR}`, borderRight: `${THICKNESS}px solid ${COLOR}` } :
        pos === "bl" ? { borderBottom: `${THICKNESS}px solid ${COLOR}`, borderLeft: `${THICKNESS}px solid ${COLOR}` } :
          { borderBottom: `${THICKNESS}px solid ${COLOR}`, borderRight: `${THICKNESS}px solid ${COLOR}` };

  return (
    <div
      style={{
        position: "fixed",
        width: SIZE,
        height: SIZE,
        borderRadius: 0,
        pointerEvents: "none",
        zIndex: 5,
        ...position,
        ...borders,
      }}
    />
  );
}
