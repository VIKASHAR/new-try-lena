import { useEffect, useState, useRef } from "react";
import { CheckCircle2, Users } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Constants (must match VotingPage.tsx) ────────────────────────────────────
const STORAGE_KEY = "lena_votes";

type ScenarioId = "A" | "B" | "C";

interface VoteState {
  A: number;
  B: number;
  C: number;
  closed: boolean;
}

function readVotes(): VoteState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as VoteState;
  } catch {}
  return { A: 0, B: 0, C: 0, closed: false };
}

function writeVotes(state: VoteState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ─── Scenario Data ─────────────────────────────────────────────────────────────
const SCENARIOS = [
  {
    id: "A" as ScenarioId,
    customerName: "Helios Steel Works",
    location: "Scunthorpe, North Lincolnshire",
    color: "var(--primary)",
    avatarBg: "var(--primary)",
  },
  {
    id: "B" as ScenarioId,
    customerName: "BioPharm Solutions",
    location: "Grimsby, Lincolnshire",
    color: "var(--accent)",
    avatarBg: "var(--accent)",
  },
  {
    id: "C" as ScenarioId,
    customerName: "CryoMed Hospital Trust",
    location: "Hull, East Yorkshire",
    color: "var(--destructive)",
    avatarBg: "var(--destructive)",
  },
];

// ─── Mobile Vote Page ──────────────────────────────────────────────────────────
export default function MobileVotePage() {
  const [votes, setVotes] = useState<VoteState>(readVotes);
  const [hasVoted, setHasVoted] = useState<ScenarioId | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalVotes = votes.A + votes.B + votes.C;
  const isClosed = votes.closed;
  const canVote = !isClosed && hasVoted === null;

  // Check if already voted this session
  useEffect(() => {
    const v = sessionStorage.getItem("lena_my_vote") as ScenarioId | null;
    if (v) setHasVoted(v);
  }, []);

  const syncVotes = () => {
    setVotes(readVotes());
  };

  useEffect(() => {
    syncVotes();
    try {
      const ch = new BroadcastChannel("lena_votes");
      ch.onmessage = syncVotes;
      channelRef.current = ch;
    } catch {}
    pollRef.current = setInterval(syncVotes, 1000);
    return () => {
      channelRef.current?.close();
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  function castVote(id: ScenarioId) {
    if (!canVote || submitting) return;
    setSubmitting(true);

    setTimeout(() => {
      const current = readVotes();
      if (current.closed) {
        setSubmitting(false);
        syncVotes();
        return;
      }
      const updated: VoteState = {
        ...current,
        [id]: current[id] + 1,
      };
      writeVotes(updated);
      channelRef.current?.postMessage("update");
      sessionStorage.setItem("lena_my_vote", id);
      setHasVoted(id);
      setVotes(updated);
      setSubmitting(false);
    }, 600);
  }

  return (
    <div
      className="min-h-screen w-full"
      style={{
        background: "var(--background)",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}
    >
      <div className="max-w-md mx-auto px-4 py-8 space-y-5">

        {/* Title */}
        <div className="text-center">
          <p
            className="text-xs font-bold uppercase tracking-[0.2em] mb-1"
            style={{ color: "var(--accent)" }}
          >
            Live Audience Vote
          </p>
          <h1
            className="text-2xl font-black tracking-tight"
            style={{ color: "var(--primary)" }}
          >
            {hasVoted ? "Your vote is in!" : "Vote for a Scenario"}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            {hasVoted
              ? `You voted for Scenario ${hasVoted} — thank you!`
              : isClosed
              ? "Voting has closed. Results are live on the main screen."
              : "Tap a scenario below to cast your vote"}
          </p>
        </div>

        {/* Progress / vote count */}
        <div
          className="rounded-xl p-4"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center justify-between text-xs mb-2">
            <span
              className="flex items-center gap-1.5 font-semibold"
              style={{ color: "var(--primary)" }}
            >
              <Users className="h-3.5 w-3.5" />
              {totalVotes} votes cast
            </span>
            <span
              className="h-2 w-2 rounded-full animate-pulse"
              style={{ background: isClosed ? "var(--chart-2)" : "var(--chart-3)" }}
            />
          </div>
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{ background: "var(--muted)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: totalVotes > 0 ? "100%" : "0%",
                background: isClosed
                  ? "var(--chart-2)"
                  : "linear-gradient(90deg, var(--primary), var(--accent))",
                opacity: isClosed ? 1 : 0.75,
              }}
            />
          </div>
        </div>

        {/* Scenario cards */}
        {SCENARIOS.map(s => {
          const isMyVote = hasVoted === s.id;
          const votePct = totalVotes > 0 ? Math.round((votes[s.id] / totalVotes) * 100) : 0;
          const isDisabled = !canVote || submitting;

          return (
            <div
              key={s.id}
              onClick={() => !isDisabled && castVote(s.id)}
              className={cn(
                "rounded-2xl overflow-hidden transition-all duration-300 select-none",
                !isDisabled && "cursor-pointer active:scale-[0.98]",
              )}
              style={{
                background: "var(--card)",
                border: `2px solid ${isMyVote ? s.color : "var(--border)"}`,
                boxShadow: isMyVote
                  ? `0 0 0 2px color-mix(in srgb, ${s.color} 20%, transparent)`
                  : "none",
              }}
            >
              {/* Card main content */}
              <div className="px-5 pt-5 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center font-black text-lg shrink-0"
                      style={{
                        background: s.avatarBg,
                        color: "var(--primary-foreground)",
                      }}
                    >
                      {s.id}
                    </div>
                    <div>
                      <h3
                        className="font-bold text-base leading-tight"
                        style={{ color: "var(--foreground)" }}
                      >
                        {s.customerName}
                      </h3>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        {s.location}
                      </p>
                    </div>
                  </div>
                  {isMyVote && (
                    <CheckCircle2 className="h-6 w-6 shrink-0" style={{ color: s.color }} />
                  )}
                </div>
              </div>

              {/* Vote bar / button */}
              <div
                className="px-5 py-3 flex items-center justify-between"
                style={{
                  background: `color-mix(in srgb, ${s.color} 5%, var(--muted))`,
                  borderTop: `1px solid color-mix(in srgb, ${s.color} 20%, var(--border))`,
                }}
              >
                {/* Live pct bar */}
                <div className="flex-1 mr-4">
                  <div
                    className="flex justify-between text-[10px] mb-1"
                    style={{ color: s.color }}
                  >
                    <span className="font-semibold">{votes[s.id]} votes</span>
                    <span className="font-bold">{votePct}%</span>
                  </div>
                  <div
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ background: "var(--muted)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${votePct}%`, background: s.color }}
                    />
                  </div>
                </div>

                {/* Vote button */}
                {!hasVoted && !isClosed && (
                  <button
                    onClick={e => { e.stopPropagation(); castVote(s.id); }}
                    disabled={submitting}
                    className="shrink-0 px-5 py-2 rounded-xl font-bold text-sm transition-all duration-200 active:scale-95 disabled:opacity-50"
                    style={{
                      background: s.color,
                      color: "var(--primary-foreground)",
                      boxShadow: `0 3px 12px color-mix(in srgb, ${s.color} 40%, transparent)`,
                    }}
                  >
                    {submitting ? "..." : "Vote"}
                  </button>
                )}
                {isMyVote && (
                  <span
                    className="shrink-0 px-4 py-2 rounded-xl font-bold text-xs"
                    style={{
                      background: s.color,
                      color: "var(--primary-foreground)",
                    }}
                  >
                    ✓ Voted
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Closed state */}
        {isClosed && (
          <div
            className="rounded-2xl p-5 text-center"
            style={{
              background: "color-mix(in srgb, var(--chart-2) 15%, var(--card))",
              border: "1px solid color-mix(in srgb, var(--chart-2) 40%, var(--border))",
            }}
          >
            <CheckCircle2
              className="h-8 w-8 mx-auto mb-2"
              style={{ color: "var(--chart-2)" }}
            />
            <p className="font-bold" style={{ color: "var(--foreground)" }}>
              Voting Complete
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
              Voting has been closed.<br />
              Check the main screen for live results!
            </p>
          </div>
        )}

        {hasVoted && !isClosed && (
          <div
            className="rounded-2xl p-4 text-center text-sm"
            style={{
              background: "color-mix(in srgb, var(--accent) 10%, var(--card))",
              color: "var(--primary)",
              border: "1px solid color-mix(in srgb, var(--accent) 25%, var(--border))",
            }}
          >
            <span className="font-semibold">Thanks for voting!</span> Watch the live screen to see how the votes unfold.
          </div>
        )}
      </div>
    </div>
  );
}
