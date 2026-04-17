import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  Info,
  ChevronRight,
  Brain,
  TrendingUp,
  Activity,
  Zap,
  BarChart3,
  Shield,
  Database,
  Cpu,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────

type AlertLevel = "critical" | "warning" | "info";

// ── Data ───────────────────────────────────────────────────────────────────────

// COO role data (default — from role selector)
const ROLE_DATA = {
  greeting: "Good day, Chief Operating Officer",
  focus: "Operations, Supply Chain & Fleet Performance",
  kpis: [
    { label: "Fleet Utilisation",       value: "84.7%",   delta: "+2.1%", up: true  },
    { label: "On-Time Deliveries",      value: "96.2%",   delta: "+0.8%", up: true  },
    { label: "Unplanned Shutdowns",     value: "2",       delta: "−1",    up: true  },
    { label: "Pending Route Approvals", value: "7",       delta: "+7",    up: false },
  ],
  alerts: [
    { level: "critical" as AlertLevel, text: "ASU Plant ID LI-0482 unplanned shutdown — LENA dispatched maintenance crew" },
    { level: "warning"  as AlertLevel, text: "7 AI route optimisation recommendations awaiting COO approval" },
    { level: "info"     as AlertLevel, text: "Fleet predictive maintenance deflected 14 breakdowns this week" },
  ],
  actions: [
    "Approve 7 Pending Route Optimisations",
    "Review Plant LI-0482 Incident Report",
    "Sign off Quarterly OEE Improvement Plan",
  ],
  insight: "LENA's supply chain agents re-routed 312 tanker trips this week, reducing average delivery time by 18 minutes and saving 14,200 litres of fuel. Fleet OEE at 84.7%, highest this year.",
};

const NAV_MODULES = [
  { label: "Vision Panel",  sub: "Strategic Overview",   icon: BarChart3,  id: "vision"  },
  { label: "Nexus",         sub: "Agent Orchestration",  icon: Brain,      id: "nexus"   },
  { label: "NuroVault",     sub: "Secure Data Layer",    icon: Database,   id: "vault"   },
  { label: "NuroForge",     sub: "Model Development",    icon: Zap,        id: "forge"   },
  { label: "NuroStack",     sub: "Infra & Deployment",   icon: Cpu,        id: "stack"   },
  { label: "NuroModels",    sub: "Model Registry",       icon: Activity,   id: "models"  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function AlertBadge({ level }: { level: AlertLevel }) {
  const styles: Record<AlertLevel, string> = {
    critical: "bg-destructive/10 text-destructive border-transparent",
    warning:  "bg-chart-3/10 text-chart-3 border-transparent",
    info:     "bg-accent/10 text-accent border-transparent",
  };
  const labels: Record<AlertLevel, string> = { critical: "Critical", warning: "Warning", info: "Info" };
  return (
    <Badge variant="outline" className={cn("text-[10px] font-semibold rounded-full px-2 py-0.5 shrink-0", styles[level])}>
      {labels[level]}
    </Badge>
  );
}

function AlertIcon({ level }: { level: AlertLevel }) {
  if (level === "critical") return <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />;
  if (level === "warning")  return <AlertTriangle className="h-3.5 w-3.5 text-chart-3 shrink-0 mt-0.5" />;
  return <Info className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />;
}

// ── Vision Panel ───────────────────────────────────────────────────────────────

function VisionPanel() {
  const phases = [
    { phase: "Phase 1", name: "Foundation",       status: "complete",    pct: 100, sites: 600 },
    { phase: "Phase 2", name: "Intelligence",     status: "active",      pct: 72,  sites: 432 },
    { phase: "Phase 3", name: "Autonomy",         status: "in-progress", pct: 28,  sites: 168 },
    { phase: "Phase 4", name: "Self-Optimising",  status: "planned",     pct: 0,   sites: 0   },
  ];

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      complete:      "bg-chart-2/10 text-chart-2 border-transparent",
      active:        "bg-accent/10 text-accent border-transparent",
      "in-progress": "bg-chart-3/10 text-chart-3 border-transparent",
      planned:       "bg-muted text-muted-foreground border-transparent",
    };
    const labels: Record<string, string> = {
      complete: "Complete", active: "Active", "in-progress": "In Progress", planned: "Planned",
    };
    return (
      <Badge variant="outline" className={cn("text-[10px] font-semibold rounded-full px-2", map[status])}>
        {labels[status]}
      </Badge>
    );
  };

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {phases.map((p) => (
        <Card key={p.phase} className="border-border bg-card">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {p.phase}
              </span>
              {statusBadge(p.status)}
            </div>
            <p className="font-heading text-base font-bold text-foreground">{p.name}</p>
            <div className="space-y-1.5">
              <Progress value={p.pct} className="h-1" />
              <p className="font-mono text-[10px] text-muted-foreground">{p.pct}% · {p.sites} sites</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ── Nexus Panel ────────────────────────────────────────────────────────────────

function NexusPanel() {
  const agents = [
    { name: "SupplyOptimiser-7", domain: "Supply Chain",  status: "active",  decisions: 312, confidence: 97 },
    { name: "PredictMaint-3",    domain: "Manufacturing", status: "active",  decisions: 189, confidence: 94 },
    { name: "PricingEngine-2",   domain: "Commercial",    status: "active",  decisions: 241, confidence: 91 },
    { name: "RiskGuard-1",       domain: "Compliance",    status: "standby", decisions: 44,  confidence: 88 },
    { name: "FleetRouter-9",     domain: "Logistics",     status: "active",  decisions: 416, confidence: 96 },
  ];
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              {["Agent", "Domain", "Status", "Decisions Today", "Confidence", ""].map((h) => (
                <TableHead key={h} className="h-9 px-5 text-[11px] font-semibold text-muted-foreground">{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {agents.map((a) => (
              <TableRow key={a.name} className="border-border hover:bg-muted/30">
                <TableCell className="px-5 py-3 text-sm font-semibold text-accent">{a.name}</TableCell>
                <TableCell className="px-5 py-3 text-xs text-muted-foreground">{a.domain}</TableCell>
                <TableCell className="px-5 py-3">
                  <Badge variant="outline" className={cn(
                    "text-[10px] font-semibold rounded-full border-transparent",
                    a.status === "active" ? "bg-chart-2/10 text-chart-2" : "bg-muted text-muted-foreground"
                  )}>
                    {a.status === "active" ? "Active" : "Standby"}
                  </Badge>
                </TableCell>
                <TableCell className="px-5 py-3 font-mono text-sm font-semibold text-primary tabular-nums">{a.decisions}</TableCell>
                <TableCell className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Progress value={a.confidence} className="h-1 w-20" />
                    <span className="font-mono text-xs text-muted-foreground tabular-nums">{a.confidence}%</span>
                  </div>
                </TableCell>
                <TableCell className="px-5 py-3">
                  <Button variant="outline" size="sm" className="h-6 px-2.5 text-[10px]">Review</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ── NuroVault Panel ────────────────────────────────────────────────────────────

function NuroVaultPanel() {
  const stats = [
    { label: "Data Assets",      value: "18,422", icon: Database },
    { label: "Lineage Coverage", value: "94.1%",  icon: TrendingUp },
    { label: "Active Pipelines", value: "214",    icon: Activity },
    { label: "Compliance Score", value: "98.2%",  icon: Shield },
  ];
  const sources = [
    { name: "SAP S/4HANA",     records: "4.2M",  status: "healthy" as const },
    { name: "SCADA / OT",      records: "18.7M", status: "healthy" as const },
    { name: "Fleet Telemetry", records: "6.1M",  status: "healthy" as const },
    { name: "Market Feeds",    records: "892K",  status: "warning" as const },
    { name: "HR Systems",      records: "214K",  status: "healthy" as const },
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-border bg-card">
            <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
              <s.icon className="h-5 w-5 text-primary" />
              <span className="font-heading text-xl font-bold text-foreground tabular-nums">{s.value}</span>
              <span className="text-[11px] text-muted-foreground">{s.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-border bg-card">
        <CardHeader className="px-5 py-4 border-b border-border">
          <CardTitle className="text-sm font-semibold">Connected Data Sources</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {sources.map((src, i, arr) => (
            <div key={src.name} className={cn("flex items-center justify-between px-5 py-3", i < arr.length - 1 && "border-b border-border")}>
              <span className="text-sm font-medium text-foreground">{src.name}</span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-muted-foreground">{src.records} records</span>
                <Badge variant="outline" className={cn("text-[10px] font-semibold rounded-full border-transparent",
                  src.status === "healthy" ? "bg-chart-2/10 text-chart-2" : "bg-chart-3/10 text-chart-3"
                )}>
                  {src.status === "healthy" ? "Healthy" : "Warning"}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ── NuroForge Panel ────────────────────────────────────────────────────────────

function NuroForgePanel() {
  const experiments = [
    { name: "ChurnPredictor-v4",   type: "Classification", status: "training", accuracy: 91, owner: "CDO Team" },
    { name: "DemandForecast-APAC", type: "Time Series",    status: "review",   accuracy: 88, owner: "COO Team" },
    { name: "MaintenanceAlert-v2", type: "Anomaly",        status: "deployed", accuracy: 94, owner: "CTO Team" },
    { name: "PricingOptimiser-v6", type: "Reinforcement",  status: "training", accuracy: 87, owner: "CFO Team" },
  ];
  const statusStyle = (st: string) => ({
    deployed: "bg-chart-2/10 text-chart-2",
    training: "bg-accent/10 text-accent",
    review:   "bg-chart-3/10 text-chart-3",
  }[st] ?? "bg-muted text-muted-foreground");

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              {["Model", "Type", "Status", "Accuracy", "Owner", ""].map((h) => (
                <TableHead key={h} className="h-9 px-5 text-[11px] font-semibold text-muted-foreground">{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {experiments.map((e) => (
              <TableRow key={e.name} className="border-border hover:bg-muted/30">
                <TableCell className="px-5 py-3 text-sm font-semibold text-accent">{e.name}</TableCell>
                <TableCell className="px-5 py-3 text-xs text-muted-foreground">{e.type}</TableCell>
                <TableCell className="px-5 py-3">
                  <Badge variant="outline" className={cn("text-[10px] font-semibold rounded-full border-transparent", statusStyle(e.status))}>
                    {e.status}
                  </Badge>
                </TableCell>
                <TableCell className="px-5 py-3 font-mono text-sm font-semibold text-primary tabular-nums">{e.accuracy}%</TableCell>
                <TableCell className="px-5 py-3 text-xs text-muted-foreground">{e.owner}</TableCell>
                <TableCell className="px-5 py-3">
                  <Button variant="outline" size="sm" className="h-6 px-2.5 text-[10px]">Open</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ── NuroStack Panel ────────────────────────────────────────────────────────────

function NuroStackPanel() {
  const services = [
    { name: "Agent Runtime",    region: "EU-West", cpu: 42, mem: 61, status: "healthy" as const },
    { name: "Inference Engine", region: "US-East", cpu: 78, mem: 83, status: "warning" as const },
    { name: "Data Ingestion",   region: "APAC",    cpu: 31, mem: 44, status: "healthy" as const },
    { name: "Model Serving",    region: "EU-West", cpu: 55, mem: 67, status: "healthy" as const },
    { name: "Telemetry Bus",    region: "Global",  cpu: 29, mem: 38, status: "healthy" as const },
  ];
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              {["Service", "Region", "CPU", "Memory", "Status"].map((h) => (
                <TableHead key={h} className="h-9 px-5 text-[11px] font-semibold text-muted-foreground">{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((svc) => (
              <TableRow key={svc.name} className="border-border hover:bg-muted/30">
                <TableCell className="px-5 py-3 text-sm font-semibold text-foreground">{svc.name}</TableCell>
                <TableCell className="px-5 py-3 text-xs text-muted-foreground">{svc.region}</TableCell>
                <TableCell className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Progress value={svc.cpu} className="h-1 w-16" />
                    <span className={cn("font-mono text-xs tabular-nums", svc.cpu > 70 ? "text-chart-3" : "text-muted-foreground")}>{svc.cpu}%</span>
                  </div>
                </TableCell>
                <TableCell className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Progress value={svc.mem} className="h-1 w-16" />
                    <span className={cn("font-mono text-xs tabular-nums", svc.mem > 75 ? "text-destructive" : "text-muted-foreground")}>{svc.mem}%</span>
                  </div>
                </TableCell>
                <TableCell className="px-5 py-3">
                  <Badge variant="outline" className={cn("text-[10px] font-semibold rounded-full border-transparent",
                    svc.status === "healthy" ? "bg-chart-2/10 text-chart-2" : "bg-chart-3/10 text-chart-3"
                  )}>
                    {svc.status === "healthy" ? "Healthy" : "Warning"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ── NuroModels Panel ───────────────────────────────────────────────────────────

function NuroModelsPanel() {
  const models = [
    { name: "SupplyOpt-7",     version: "v7.2.1", domain: "Logistics",     deployed: "12 Nov 2024", calls: "84K/day",  drift: "low" as const },
    { name: "PredictMaint-3",  version: "v3.0.4", domain: "Manufacturing", deployed: "4 Oct 2024",  calls: "52K/day",  drift: "low" as const },
    { name: "ChurnDetect-2",   version: "v2.1.0", domain: "Commercial",    deployed: "22 Sep 2024", calls: "18K/day",  drift: "med" as const },
    { name: "PricingEngine-6", version: "v6.0.0", domain: "Finance",       deployed: "1 Dec 2024",  calls: "31K/day",  drift: "low" as const },
    { name: "ThreatMonitor-1", version: "v1.4.2", domain: "Cybersecurity", deployed: "10 Nov 2024", calls: "120K/day", drift: "low" as const },
  ];
  const driftStyle = (d: string) => ({
    low: "bg-chart-2/10 text-chart-2",
    med: "bg-chart-3/10 text-chart-3",
    high: "bg-destructive/10 text-destructive",
  }[d] ?? "bg-muted text-muted-foreground");

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              {["Model", "Version", "Domain", "Deployed", "Daily Calls", "Drift", ""].map((h) => (
                <TableHead key={h} className="h-9 px-5 text-[11px] font-semibold text-muted-foreground">{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {models.map((m) => (
              <TableRow key={m.name} className="border-border hover:bg-muted/30">
                <TableCell className="px-5 py-3 text-sm font-semibold text-accent">{m.name}</TableCell>
                <TableCell className="px-5 py-3 font-mono text-xs text-muted-foreground">{m.version}</TableCell>
                <TableCell className="px-5 py-3 text-xs text-muted-foreground">{m.domain}</TableCell>
                <TableCell className="px-5 py-3 text-xs text-muted-foreground">{m.deployed}</TableCell>
                <TableCell className="px-5 py-3 font-mono text-sm font-semibold text-primary tabular-nums">{m.calls}</TableCell>
                <TableCell className="px-5 py-3">
                  <Badge variant="outline" className={cn("text-[10px] font-semibold rounded-full border-transparent", driftStyle(m.drift))}>
                    {m.drift}
                  </Badge>
                </TableCell>
                <TableCell className="px-5 py-3">
                  <Button variant="outline" size="sm" className="h-6 px-2.5 text-[10px]">Inspect</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function ConsolidatedDashboard() {
  const [activeModule, setActiveModule] = useState("vision");

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="space-y-5">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            {ROLE_DATA.greeting}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{ROLE_DATA.focus}</p>
        </div>
        <span className="shrink-0 font-mono text-[11px] text-muted-foreground bg-muted px-2.5 py-1 rounded-md">
          {today}
        </span>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {ROLE_DATA.kpis.map((kpi) => (
          <Card key={kpi.label} className={cn(
            "relative overflow-hidden border-l-4 border-border bg-card rounded-l-none",
            kpi.up ? "border-l-chart-2" : "border-l-chart-3",
          )}>
            <CardContent className="px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                {kpi.label}
              </p>
              <p className={cn(
                "mt-2.5 font-heading text-3xl font-bold tracking-tight",
                kpi.up ? "text-chart-2" : "text-chart-3",
              )}>
                {kpi.value}
              </p>
              <div className="mt-2 flex items-center gap-1.5">
                {kpi.up
                  ? <ArrowUpRight className="h-3 w-3 text-chart-2" />
                  : <ArrowDownRight className="h-3 w-3 text-chart-3" />
                }
                <span className={cn("text-xs font-semibold tabular-nums", kpi.up ? "text-chart-2" : "text-chart-3")}>
                  {kpi.delta}
                </span>
                <span className="text-xs text-muted-foreground">vs last period</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Alerts + Actions ── */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">

        {/* Alerts */}
        <Card className="border-border bg-card">
          <CardHeader className="border-b border-border px-5 py-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Active Alerts</CardTitle>
              <Badge variant="outline" className="border-transparent bg-destructive/10 text-[10px] text-destructive">
                {ROLE_DATA.alerts.filter((a) => a.level === "critical").length} Critical
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {ROLE_DATA.alerts.map((alert, i, arr) => (
              <div key={i} className={cn("flex items-start gap-3 px-5 py-3.5", i < arr.length - 1 && "border-b border-border")}>
                <AlertIcon level={alert.level} />
                <p className="flex-1 text-xs leading-relaxed text-muted-foreground">{alert.text}</p>
                <AlertBadge level={alert.level} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="border-border bg-card">
          <CardHeader className="border-b border-border px-5 py-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Required Actions</CardTitle>
              <Badge variant="outline" className="border-transparent bg-chart-3/10 text-[10px] text-chart-3">
                {ROLE_DATA.actions.length} Pending
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {ROLE_DATA.actions.map((action, i, arr) => (
              <div key={i} className={cn("flex items-center gap-3 px-5 py-3.5", i < arr.length - 1 && "border-b border-border")}>
                <span className="font-mono text-[11px] font-bold text-muted-foreground/50 w-5 shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 text-xs text-muted-foreground">{action}</span>
                <Button variant="ghost" size="sm" className="h-6 gap-1 px-2 text-[10px] text-primary">
                  Review <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ── LENA Insight Banner ── */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
            <Brain className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-primary/70 mb-1">
              LENA Intelligence · Personalised
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">{ROLE_DATA.insight}</p>
          </div>
          <Button size="sm" className="shrink-0 gap-1.5 text-xs">
            Ask LENA <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        </CardContent>
      </Card>

      {/* ── Module tabs ── */}
      <div>
        {/* Module selector */}
        <div className="mb-4 grid grid-cols-3 gap-2 lg:grid-cols-6">
          {NAV_MODULES.map((mod) => (
            <button
              key={mod.id}
              onClick={() => setActiveModule(mod.id)}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-all duration-150",
                "hover:-translate-y-0.5 hover:shadow-sm",
                activeModule === mod.id
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              <mod.icon className="h-4 w-4 shrink-0" />
              <span className="text-[11px] font-semibold leading-tight">{mod.label}</span>
              <span className="text-[9px] leading-tight opacity-70">{mod.sub}</span>
            </button>
          ))}
        </div>

        {/* Module content */}
        <div>
          {activeModule === "vision"  && <VisionPanel />}
          {activeModule === "nexus"   && <NexusPanel />}
          {activeModule === "vault"   && <NuroVaultPanel />}
          {activeModule === "forge"   && <NuroForgePanel />}
          {activeModule === "stack"   && <NuroStackPanel />}
          {activeModule === "models"  && <NuroModelsPanel />}
        </div>
      </div>

    </div>
  );
}