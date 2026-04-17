// ─── Nexus.tsx ────────────────────────────────────────────────────────────────
// LENA Platform — AI Command Center
// Live multi-agent orchestration, monitoring and approvals

import { useState, useEffect } from "react";
import {
  Brain, Truck, Factory, DollarSign, Shield, Lock, TrendingUp,
  CheckCircle2, Clock, Activity, Zap,
  Users, RefreshCw, Download, FileText,
  PauseCircle, ChevronRight, Cpu,
  AlertCircle, XCircle, RotateCcw, Globe, Radio, Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// ─── Types ────────────────────────────────────────────────────────────────────
type AgentStatus = "Running" | "Completed" | "Alert" | "Waiting";
type ApprovalAction = "approved" | "rejected" | null;

interface Agent {
  id: string;
  name: string;
  domain: string;
  task: string;
  confidence: number;
  status: AgentStatus;
  lastUpdated: string;
  icon: typeof Brain;
  color: string;
  bgColor: string;
}

interface ApprovalItem {
  id: string;
  title: string;
  detail: string;
  urgency: "HIGH" | "MEDIUM" | "LOW";
  actions: ("approve" | "reject" | "modify")[];
  agentTag: string;
}

interface TimelineEvent {
  time: string;
  event: string;
  type: "alert" | "action" | "system" | "human";
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const AGENTS: Agent[] = [
  {
    id: "sc",
    name: "Supply Chain Agent",
    domain: "Logistics",
    task: "Optimizing tanker route Chennai cluster",
    confidence: 96,
    status: "Running",
    lastUpdated: "Just now",
    icon: Truck,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    id: "mfg",
    name: "Manufacturing Agent",
    domain: "Operations",
    task: "Predictive maintenance on Compressor #47",
    confidence: 93,
    status: "Running",
    lastUpdated: "1 min ago",
    icon: Factory,
    color: "text-violet-600",
    bgColor: "bg-violet-50",
  },
  {
    id: "fin",
    name: "Finance Agent",
    domain: "Finance",
    task: "Margin risk analysis in progress",
    confidence: 91,
    status: "Running",
    lastUpdated: "2 min ago",
    icon: DollarSign,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    id: "hr",
    name: "HR Safety Agent",
    domain: "HR & Safety",
    task: "Permit validation at Plant B",
    confidence: 98,
    status: "Completed",
    lastUpdated: "4 min ago",
    icon: Shield,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    id: "cyber",
    name: "Cybersecurity Agent",
    domain: "IT & OT",
    task: "OT anomaly detected and isolated",
    confidence: 89,
    status: "Alert",
    lastUpdated: "3 min ago",
    icon: Lock,
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
  {
    id: "comm",
    name: "Commercial Agent",
    domain: "Commercial",
    task: "Dynamic pricing recommendation ready",
    confidence: 95,
    status: "Waiting",
    lastUpdated: "5 min ago",
    icon: TrendingUp,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
];

const TIMELINE: TimelineEvent[] = [
  { time: "03:14 AM", event: "Compressor #47 anomaly detected by Manufacturing Agent", type: "alert" },
  { time: "03:15 AM", event: "Supply reroute initiated — Chennai cluster TK-4421", type: "action" },
  { time: "03:15 AM", event: "Finance exposure flagged — margin risk £1.2M", type: "alert" },
  { time: "03:16 AM", event: "Engineer auto-assigned via HR Safety Agent", type: "system" },
  { time: "03:17 AM", event: "Human approval pending — awaiting COO sign-off", type: "human" },
];

const APPROVALS: ApprovalItem[] = [
  {
    id: "a1",
    title: "Dispatch Tanker TK-4421 to Customer B",
    detail: "Chennai cluster · Route R1 · 98 km · £187 fuel · Confidence 96%",
    urgency: "HIGH",
    actions: ["approve", "reject", "modify"],
    agentTag: "Supply Chain Agent",
  },
  {
    id: "a2",
    title: "Release emergency oxygen backup stock",
    detail: "Plant B — 200 m³ O₂ · SLA breach risk if delayed >2hrs",
    urgency: "HIGH",
    actions: ["approve", "reject"],
    agentTag: "HR Safety Agent",
  },
  {
    id: "a3",
    title: "Apply dynamic pricing for Region South",
    detail: "Margin uplift +4.2% · Affects 18 contracts · Low churn risk",
    urgency: "MEDIUM",
    actions: ["approve", "modify"],
    agentTag: "Commercial Agent",
  },
];

const HEALTH_METRICS = [
  { label: "Supply Chain APIs", value: 98, color: "bg-emerald-500" },
  { label: "ERP Connectivity", value: 94, color: "bg-blue-500" },
  { label: "Sensor Streams", value: 91, color: "bg-blue-500" },
  { label: "Model Latency", value: 87, color: "bg-amber-500" },
  { label: "Database Health", value: 99, color: "bg-emerald-500" },
];

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

function KpiCard({ label, value, sub, icon: Icon, color, borderColor }: {
  label: string; value: number; sub: string;
  icon: typeof Brain; color: string; borderColor: string;
}) {
  const count = useCountUp(value);
  return (
    <Card className={cn("border-l-4 rounded-l-none hover:shadow-md transition-shadow duration-200", borderColor)}>
      <CardContent className="px-4 py-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">{label}</p>
        </div>
        <p className={cn("font-heading text-3xl font-bold tracking-tight", color)}>{count}</p>
        <p className="mt-1.5 text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: AgentStatus }) {
  const cfg = {
    Running: { cls: "bg-blue-100 text-blue-700", dot: "bg-blue-500 animate-pulse", label: "Running" },
    Completed: { cls: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500", label: "Completed" },
    Alert: { cls: "bg-red-100 text-red-700", dot: "bg-red-500 animate-pulse", label: "Alert" },
    Waiting: { cls: "bg-orange-100 text-orange-700", dot: "bg-orange-500", label: "Waiting" },
  }[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider", cfg.cls)}>
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", cfg.dot)} />
      {cfg.label}
    </span>
  );
}

// ─── Agent Card ───────────────────────────────────────────────────────────────
function AgentCard({ agent }: { agent: Agent }) {
  const Icon = agent.icon;
  return (
    <div className={cn(
      "rounded-xl border p-4 space-y-3 bg-card",
      "hover:shadow-md hover:-translate-y-0.5 transition-all duration-200",
      agent.status === "Alert" && "border-red-200 bg-red-50/30",
      agent.status === "Waiting" && "border-orange-200 bg-orange-50/20",
    )}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center shrink-0", agent.bgColor)}>
            <Icon className={cn("h-4.5 w-4.5", agent.color)} style={{ height: 18, width: 18 }} />
          </div>
          <div>
            <p className="font-semibold text-sm leading-tight">{agent.name}</p>
            <p className="text-[10px] text-muted-foreground">{agent.domain}</p>
          </div>
        </div>
        <StatusBadge status={agent.status} />
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{agent.task}</p>
      <div className="flex items-center justify-between pt-1 border-t border-dashed border-muted-foreground/15">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground">Confidence</span>
          <span className={cn("text-[11px] font-bold font-mono",
            agent.confidence >= 95 ? "text-emerald-600" : agent.confidence >= 90 ? "text-blue-600" : "text-orange-600"
          )}>{agent.confidence}%</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{agent.lastUpdated}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Timeline ─────────────────────────────────────────────────────────────────
function WorkflowTimeline() {
  const typeConfig = {
    alert: { dot: "bg-red-500", text: "text-red-600" },
    action: { dot: "bg-blue-500", text: "text-blue-700" },
    system: { dot: "bg-emerald-500", text: "text-emerald-700" },
    human: { dot: "bg-orange-500", text: "text-orange-700" },
  };
  return (
    <div className="bg-card rounded-xl border p-5">
      <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
        <Radio className="h-4 w-4 text-primary" /> Live Workflow Timeline
      </h3>
      <div className="space-y-0">
        {TIMELINE.map((ev, i) => {
          const cfg = typeConfig[ev.type];
          return (
            <div key={i} className="flex gap-3 group">
              <div className="flex flex-col items-center">
                <div className={cn("h-2.5 w-2.5 rounded-full shrink-0 mt-1", cfg.dot, ev.type === "alert" || ev.type === "human" ? "animate-pulse" : "")} />
                {i < TIMELINE.length - 1 && <div className="w-px flex-1 bg-border my-1.5" />}
              </div>
              <div className={cn("pb-4 flex-1", i === TIMELINE.length - 1 && "pb-0")}>
                <div className="flex items-start gap-2">
                  <span className="text-[10px] font-mono text-muted-foreground shrink-0 mt-0.5 w-16">{ev.time}</span>
                  <p className={cn("text-xs", cfg.text)}>{ev.event}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Approval Card ────────────────────────────────────────────────────────────
function ApprovalCard({ item }: { item: ApprovalItem }) {
  const [state, setState] = useState<ApprovalAction>(null);
  const urgencyStyle = item.urgency === "HIGH"
    ? "bg-red-100 text-red-700"
    : "bg-yellow-100 text-yellow-700";

  if (state === "approved") {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <div>
            <p className="text-sm font-semibold text-emerald-700">Approved & Dispatched</p>
            <p className="text-xs text-emerald-600">{item.title}</p>
          </div>
        </div>
      </div>
    );
  }
  if (state === "rejected") {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50/40 p-4">
        <div className="flex items-center gap-2">
          <XCircle className="h-5 w-5 text-red-500" />
          <div>
            <p className="text-sm font-semibold text-red-700">Decision Rejected</p>
            <p className="text-xs text-red-600">{item.title}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "rounded-xl border p-4 space-y-3 bg-card hover:shadow-sm transition-shadow",
      item.urgency === "HIGH" && "border-red-200"
    )}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold leading-snug">{item.title}</p>
        <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase shrink-0 tracking-wider", urgencyStyle)}>
          {item.urgency}
        </span>
      </div>
      <p className="text-[11px] text-muted-foreground">{item.detail}</p>
      <div className="flex items-center gap-1">
        <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">{item.agentTag}</span>
      </div>
      <div className="flex gap-1.5 pt-1">
        {item.actions.includes("approve") && (
          <Button size="sm" className="h-7 text-xs gap-1 px-2.5" onClick={() => setState("approved")}>
            <CheckCircle2 className="h-3 w-3" /> Approve
          </Button>
        )}
        {item.actions.includes("reject") && (
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1 px-2.5 border-red-200 text-red-600 hover:bg-red-50" onClick={() => setState("rejected")}>
            <XCircle className="h-3 w-3" /> Reject
          </Button>
        )}
        {item.actions.includes("modify") && (
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1 px-2.5" onClick={() => setState(null)}>
            <RotateCcw className="h-3 w-3" /> Modify
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Agent Health Monitor ─────────────────────────────────────────────────────
function AgentHealthMonitor() {
  return (
    <div className="bg-card rounded-xl border p-5">
      <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
        <Cpu className="h-4 w-4 text-primary" /> Agent Health Monitor
      </h3>
      <div className="space-y-3.5">
        {HEALTH_METRICS.map(m => (
          <div key={m.label}>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">{m.label}</span>
              <span className={cn("font-mono font-bold",
                m.value >= 95 ? "text-emerald-600" : m.value >= 90 ? "text-blue-600" : "text-amber-600"
              )}>{m.value}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-700", m.color)}
                style={{ width: `${m.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-dashed border-muted-foreground/20">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] text-emerald-600 font-semibold">All critical systems nominal</span>
        </div>
      </div>
    </div>
  );
}

// ─── Global Control Console ───────────────────────────────────────────────────
function GlobalControlConsole() {
  const [refreshing, setRefreshing] = useState(false);

  function handleRefresh() {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }

  return (
    <div className="bg-card rounded-xl border p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" /> Global Control Console
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage all active agents across business domains
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] text-emerald-600 font-mono font-semibold uppercase tracking-wider">Live</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" size="sm" className="gap-2 border-orange-200 text-orange-700 hover:bg-orange-50">
          <PauseCircle className="h-4 w-4" /> Pause All Low Priority Agents
        </Button>
        <Button
          variant="outline" size="sm"
          className={cn("gap-2", refreshing && "opacity-70")}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          {refreshing ? "Refreshing…" : "Refresh Live State"}
        </Button>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" /> Export Logs
        </Button>
        <Button variant="outline" size="sm" className="gap-2">
          <FileText className="h-4 w-4" /> Open Governance Audit
        </Button>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Nexus() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Topbar — matches NuroForge/NuroStack pattern */}
      <div className="h-12 border-b flex items-center px-6 gap-3 shrink-0 bg-background">
        <nav className="flex items-center gap-1 text-sm text-muted-foreground">
          <span>Core</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">Nexus</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">AI Command Center</span>
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6 space-y-6">

          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Nexus — AI Command Center</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Live multi-agent orchestration, monitoring and approvals
              </p>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-emerald-700 font-mono font-semibold uppercase tracking-wider">
                27 Agents Live
              </span>
            </div>
          </div>

          {/* KPI Row */}
          <div className="grid grid-cols-4 gap-4">
            <KpiCard label="Active Agents" value={27} sub="Across all domains" icon={Brain} color="text-foreground" borderColor="border-l-primary" />
            <KpiCard label="Running Workflows" value={14} sub="In real-time execution" icon={Activity} color="text-blue-600" borderColor="border-l-blue-500" />
            <KpiCard label="Decisions Today" value={186} sub="+14% vs yesterday" icon={Zap} color="text-violet-600" borderColor="border-l-violet-500" />
            <KpiCard label="Approvals Pending" value={9} sub="Require human action" icon={AlertCircle} color="text-red-600" borderColor="border-l-red-500" />
          </div>

          {/* Main two-column layout */}
          <div className="grid grid-cols-10 gap-5">

            {/* LEFT — 70% */}
            <div className="col-span-7 space-y-5">

              {/* Live Agents Grid */}
              <div className="bg-card rounded-xl border p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-sm flex items-center gap-2">
                    <Eye className="h-4 w-4 text-primary" /> Live Agents Grid
                  </h2>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" /> 3 Running
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" /> 1 Alert
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-orange-400" /> 1 Waiting
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> 1 Completed
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {AGENTS.map(agent => (
                    <AgentCard key={agent.id} agent={agent} />
                  ))}
                </div>
              </div>

              {/* Workflow Timeline */}
              <WorkflowTimeline />
            </div>

            {/* RIGHT — 30% */}
            <div className="col-span-3 space-y-4">

              {/* Human Approval Queue */}
              <div className="bg-card rounded-xl border p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" /> Approval Queue
                  </h3>
                  <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                    {APPROVALS.length} pending
                  </span>
                </div>
                <div className="space-y-3">
                  {APPROVALS.map(item => (
                    <ApprovalCard key={item.id} item={item} />
                  ))}
                </div>
              </div>

              {/* Agent Health Monitor */}
              <AgentHealthMonitor />
            </div>
          </div>

          {/* Global Control Console — full width */}
          <GlobalControlConsole />
        </div>
      </div>
    </div>
  );
}
