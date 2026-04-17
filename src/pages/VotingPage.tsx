import { useEffect, useRef, useState, useCallback } from "react";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const MAIN_APP_URL = "https://lina-web-gamma.vercel.app"; 
const STORAGE_KEY = "lena_votes";

// ─── Design tokens ─────────────────────────────────────────────────────────────
const THEME = {
  bg: "#f5f6fa",           
  sidebar: "#ffffff",      
  textPrimary: "#1a2b4a",  
  textSecondary: "#64748b",
  textMeta: "#94a3b8",     
  border: "#e8ecf0",       
  blue: "#2d6fa6",         
};

// ─── Types ────────────────────────────────────────────────────────────────────
type ScenarioId = "A" | "B" | "C";

interface VoteState {
  A: number;
  B: number;
  C: number;
  closed: boolean;
}

// ─── localStorage helpers ─────────────────────────────────────────────────────
function readVotes(): VoteState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as VoteState;
  } catch { }
  return { A: 0, B: 0, C: 0, closed: false };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function VotingPage() {
  const [winner, setWinner] = useState<ScenarioId | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const syncVotes = useCallback(() => {
    const fresh = readVotes();
    if (fresh.closed) {
      const w = (["A", "B", "C"] as ScenarioId[]).reduce((a, b) =>
        fresh[a] >= fresh[b] ? a : b
      );
      setWinner(w);
    }
  }, []);

  useEffect(() => {
    syncVotes();
    try {
      const ch = new BroadcastChannel("lena_votes");
      ch.onmessage = () => syncVotes();
      channelRef.current = ch;
    } catch { }
    pollRef.current = setInterval(syncVotes, 800);
    return () => {
      channelRef.current?.close();
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [syncVotes]);

  function handleFeed() {
    const target = winner ?? "A";
    const url = `${MAIN_APP_URL}/supply-chain?scenario=${target}&autostart=true`;
    window.location.href = url;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: THEME.bg,
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}
    >
      {/* ── LENA Header ── */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          padding: "0 24px",
          height: "52px",
          background: THEME.sidebar,
          borderBottom: `1px solid ${THEME.border}`,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: "16px",
            fontWeight: 800,
            color: THEME.textPrimary,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          LENA
        </span>
        <div style={{ width: "1px", height: "16px", background: THEME.border }} />
        <span
          style={{
            fontSize: "10px",
            fontWeight: 600,
            color: THEME.textSecondary,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          Powered by IBM WatsonX
        </span>
      </header>

      {/* ── Breadcrumb bar ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "10px 28px",
          background: THEME.sidebar,
          borderBottom: `1px solid ${THEME.border}`,
        }}
      >
        <span style={{ fontSize: "13px", color: THEME.textSecondary }}>Core</span>
        <span style={{ fontSize: "13px", color: THEME.textMeta }}>/</span>
        <span style={{ fontSize: "13px", fontWeight: 600, color: THEME.textPrimary }}>
          Feed to Agent
        </span>
      </div>

      {/* ── Main Content (centered) ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "4rem 2rem 3rem",
          gap: "24px",
        }}
      >
        {/* Telemetry status badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 14px",
            borderRadius: "999px",
            background: "#e8f5ee",
            border: "1px solid #b7dfc8",
          }}
        >
          <PulseDot />
          <span style={{ fontSize: "11px", fontWeight: 600, color: "#1e7e45", letterSpacing: "0.07em", textTransform: "uppercase" }}>
            Voting Complete · Live Telemetry Active
          </span>
        </div>

        {/* Heading */}
        <h1 style={{ fontSize: "34px", fontWeight: 700, color: THEME.textPrimary, margin: 0, lineHeight: 1.25, letterSpacing: "-0.02em" }}>
          Audience has voted.<br />Ready to run the agent.
        </h1>

        {/* Sub-text */}
        <p style={{ fontSize: "16px", color: THEME.textSecondary, margin: 0, lineHeight: 1.75, maxWidth: "440px", fontWeight: 400 }}>
          Customer telemetry data is feeding to the agent.<br />Initiate the supply chain intelligence.
        </p>

        {/* Accent divider */}
        <div style={{ width: "48px", height: "2px", background: THEME.blue, borderRadius: "2px", opacity: 0.35 }} />

        {/* CTA Button */}
        <button
          onClick={handleFeed}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            padding: "14px 32px",
            borderRadius: "10px",
            background: THEME.blue,
            color: "#ffffff",
            fontSize: "15px",
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
            transition: "all 0.15s ease",
            boxShadow: "0 2px 12px rgba(45,111,166,0.22)",
          }}
        >
          <ArrowRightIcon />
          Feed to agent
        </button>

        <p style={{ fontSize: "12px", color: THEME.textMeta, margin: 0, marginTop: "-8px" }}>
          Winning scenario will be passed as context to LENA
        </p>
      </div>

      {/* ── Footer ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "14px 24px",
          borderTop: `1px solid ${THEME.border}`,
          background: THEME.sidebar,
        }}
      >
        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: THEME.textSecondary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700 }}>L</div>
        <div>
          <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: THEME.textPrimary }}>LENA User</p>
          <p style={{ margin: 0, fontSize: "11px", color: THEME.textMeta }}>COO</p>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function PulseDot() {
  return (
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", width: "8px", height: "8px" }}>
      <span style={{ position: "absolute", width: "8px", height: "8px", borderRadius: "50%", background: "#1e7e45", animation: "lena-pulse-ring 2s ease-out infinite" }} />
      <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#1e7e45", position: "relative", zIndex: 1 }} />
      <style>{`@keyframes lena-pulse-ring { 0% { transform: scale(1); opacity: 0.7; } 70% { transform: scale(1.8); opacity: 0; } 100% { transform: scale(1.8); opacity: 0; } }`}</style>
    </span>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 8H14M14 8L9.5 3.5M14 8L9.5 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}