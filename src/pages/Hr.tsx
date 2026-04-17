/**
 * Linde EOS — Human Resources & Safety
 *
 * CONTEXT FOR FUTURE LLM PROMPTS:
 * ─────────────────────────────────────────────────────────────────────────────
 * This is a React (TypeScript) project using shadcn/ui components and Tailwind CSS.
 * The design system is described in design.md (the canonical source of truth).
 * A prototype exists in prototype.html — use it ONLY to understand information
 * architecture and data content. Do NOT replicate its styling, CSS variables
 * (--bg, --surface, --accent, etc.), or visual approach. The prototype was
 * scaffolded for rapid testing and its styles are incompatible with this codebase.
 *
 * DESIGN PRINCIPLES (from design.md):
 * • Professional, formal, clean, information-dense but never cluttered
 * • Token-driven: always use Tailwind CSS variables via shadcn tokens
 *   (bg-card, text-foreground, text-muted-foreground, border-border, etc.)
 * • Status colors: chart-2=success, chart-3=warning, destructive=critical,
 *   accent=info/active, chart-5=AI/special
 * • Metric cards: border-l-4 accent strip (color conveys status), not full card tint
 * • Status badges: pill-shaped, low-opacity tinted background + semantic text color
 * • No hardcoded hex values anywhere — only CSS variable references
 * • shadcn components available: Card, Badge, Button, Progress, Table, Tabs,
 *   Tooltip, Separator, and all others in the registry
 * • Consistent layout: 4-column KPI row, then tabbed content or 2/3-split grids
 * • Human-in-the-loop actions always require: Approve / Modify / Override
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Users,
  ShieldCheck,
  GraduationCap,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronRight,
  BrainCircuit,
  HardHat,
  FileCheck,
  Activity,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────

type AlertSeverity = "critical" | "warning" | "info" | "ok";
type TrainingStatus = "completed" | "in-progress" | "overdue" | "not-started";

// ── Data ───────────────────────────────────────────────────────────────────────

const TRAINING_PROGRAMS = [
  {
    id: "TP-001",
    name: "AI Awareness — Level 1",
    audience: "All staff · 66,000+ employees",
    completion: 71,
    target: 100,
    deadline: "M18",
    status: "in-progress" as TrainingStatus,
  },
  {
    id: "TP-002",
    name: "AI Practitioner — Level 2",
    audience: "Primary AI users",
    completion: 48,
    target: 80,
    deadline: "M24",
    status: "in-progress" as TrainingStatus,
  },
  {
    id: "TP-003",
    name: "AI Builder — Level 3 (CoE)",
    audience: "Power users & CoE members",
    completion: 68,
    target: 50,
    deadline: "M30",
    status: "completed" as TrainingStatus,
  },
  {
    id: "TP-004",
    name: "Hydrogen Safety — ISO 19880",
    audience: "H₂ plant operators · 120 personnel",
    completion: 42,
    target: 100,
    deadline: "M12",
    status: "overdue" as TrainingStatus,
  },
  {
    id: "TP-005",
    name: "PSM Process Safety Management",
    audience: "All facility managers",
    completion: 89,
    target: 100,
    deadline: "M15",
    status: "in-progress" as TrainingStatus,
  },
  {
    id: "TP-006",
    name: "OSHA Compliance Refresher",
    audience: "Frontline maintenance staff",
    completion: 94,
    target: 100,
    deadline: "M10",
    status: "completed" as TrainingStatus,
  },
];

type SafetyAlert = {
  id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  plant: string;
  timestamp: string;
  action?: string;
};

const SAFETY_ALERTS: SafetyAlert[] = [
  {
    id: "SA-001",
    severity: "warning",
    title: "Hydrogen Safety Certification Renewal Due",
    description: "120 operators at H₂ plants require ISO 19880 / NFPA 2 renewal before end of month.",
    plant: "TN-02 Chennai · MH-04 Pune",
    timestamp: "Deadline: 18 days",
    action: "Initiate Training",
  },
  {
    id: "SA-002",
    severity: "ok",
    title: "PSM Compliance — All 600+ Plants",
    description: "OSHA Process Safety Management standards verified across all facilities. No exceptions noted.",
    plant: "All facilities",
    timestamp: "Verified: 4 hr ago",
  },
  {
    id: "SA-003",
    severity: "info",
    title: "Safety Permit Digitization — 78% Complete",
    description: "Paper-based maintenance permit workflows eliminated at 468 of 600 plants. On schedule for M15 completion.",
    plant: "468 / 600 facilities",
    timestamp: "Updated: 1 hr ago",
  },
  {
    id: "SA-004",
    severity: "ok",
    title: "Zero AI-Flagged Safety Incidents (30d)",
    description: "Predictive safety analytics completed 30 consecutive days with zero undetected safety incidents.",
    plant: "All facilities",
    timestamp: "Streak: 30 days",
  },
];

type HeadcountRegion = {
  region: string;
  employees: number;
  aiAdoption: number;
  plants: number;
};

const HEADCOUNT_REGIONS: HeadcountRegion[] = [
  { region: "South Asia (India HQ)", employees: 18400, aiAdoption: 74, plants: 142 },
  { region: "Europe",                employees: 22100, aiAdoption: 61, plants: 189 },
  { region: "Americas",              employees: 14800, aiAdoption: 58, plants: 148 },
  { region: "Asia Pacific",          employees: 7200,  aiAdoption: 49, plants: 82  },
  { region: "Middle East & Africa",  employees: 3500,  aiAdoption: 33, plants: 39  },
];

type ShiftSchedule = {
  shift: string;
  plant: string;
  headcount: number;
  aiOptimized: boolean;
  utilization: number;
  notes: string;
};

const SHIFT_SCHEDULES: ShiftSchedule[] = [
  { shift: "Morning A (06:00–14:00)", plant: "KA-01 Bangalore North", headcount: 84,  aiOptimized: true,  utilization: 97, notes: "Full capacity" },
  { shift: "Afternoon B (14:00–22:00)", plant: "KA-01 Bangalore North", headcount: 76, aiOptimized: true,  utilization: 91, notes: "Optimal" },
  { shift: "Night C (22:00–06:00)", plant: "KA-01 Bangalore North",    headcount: 52,  aiOptimized: true,  utilization: 88, notes: "Reduced load" },
  { shift: "Morning A (06:00–14:00)", plant: "MH-04 Pune",             headcount: 102, aiOptimized: true,  utilization: 99, notes: "Full capacity" },
  { shift: "Afternoon B (14:00–22:00)", plant: "MH-04 Pune",           headcount: 94,  aiOptimized: false, utilization: 78, notes: "Manual scheduling" },
  { shift: "Morning A (06:00–14:00)", plant: "TN-02 Chennai",           headcount: 71,  aiOptimized: true,  utilization: 93, notes: "H₂ crew assigned" },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function trainingStatusConfig(status: TrainingStatus) {
  return {
    completed:    { label: "Complete",     className: "bg-chart-2/10 text-chart-2 border-transparent" },
    "in-progress":{ label: "In Progress",  className: "bg-accent/10 text-accent border-transparent" },
    overdue:      { label: "Overdue",      className: "bg-destructive/10 text-destructive border-transparent" },
    "not-started":{ label: "Not Started",  className: "bg-muted text-muted-foreground border-transparent" },
  }[status];
}

function completionColor(pct: number, target: number) {
  if (pct >= target) return "text-chart-2";
  if (pct >= target * 0.6) return "text-chart-3";
  return "text-destructive";
}

function alertConfig(severity: AlertSeverity) {
  return {
    critical: { border: "border-l-destructive", icon: <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" /> },
    warning:  { border: "border-l-chart-3",     icon: <AlertTriangle className="h-4 w-4 text-chart-3 mt-0.5 shrink-0" /> },
    info:     { border: "border-l-accent",       icon: <FileCheck className="h-4 w-4 text-accent mt-0.5 shrink-0" /> },
    ok:       { border: "border-l-chart-2",      icon: <CheckCircle2 className="h-4 w-4 text-chart-2 mt-0.5 shrink-0" /> },
  }[severity];
}

// ── Main ───────────────────────────────────────────────────────────────────────

export default function HRAndSafety() {
  const [dispatched, setDispatched] = useState<Set<string>>(new Set());

  function dispatch(id: string) {
    setDispatched((prev) => new Set(prev).add(id));
  }

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            Human Resources & Safety
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            66,000+ employees · 80+ countries · 600+ facilities · AI-augmented workforce management
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 pt-1">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-chart-2" />
            HR Systems Live
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-chart-3/10 px-2.5 py-1 text-[11px] font-semibold text-chart-3">
            <AlertTriangle className="h-3 w-3" />
            1 Cert Due
          </span>
        </div>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {
            label:      "Employees Covered",
            value:      "66,000+",
            target:     "80+ countries",
            pill:       "Global",
            pillColor:  "bg-accent/10 text-accent",
            valueColor: "text-accent",
            border:     "border-l-accent",
          },
          {
            label:      "AI Practitioners Certified",
            value:      "34 / 50",
            target:     "Target by M30",
            pill:       "On track",
            pillColor:  "bg-chart-2/10 text-chart-2",
            valueColor: "text-chart-2",
            border:     "border-l-chart-2",
          },
          {
            label:      "Safety Incidents (AI flagged)",
            value:      "0",
            target:     "30-day streak",
            pill:       "Zero incidents",
            pillColor:  "bg-chart-2/10 text-chart-2",
            valueColor: "text-chart-2",
            border:     "border-l-chart-2",
          },
          {
            label:      "H₂ Cert Renewal Due",
            value:      "120",
            target:     "Operators overdue",
            pill:       "Action required",
            pillColor:  "bg-chart-3/10 text-chart-3",
            valueColor: "text-chart-3",
            border:     "border-l-chart-3",
          },
        ].map((kpi) => (
          <Card
            key={kpi.label}
            className={cn(
              "border-l-4 border-border bg-card rounded-l-none rounded-xs",
              kpi.border
            )}
          >
            <CardContent className="px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                {kpi.label}
              </p>
              <p className={cn("mt-2.5 font-heading text-3xl font-bold tracking-tight", kpi.valueColor)}>
                {kpi.value}
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{kpi.target}</span>
                {kpi.pill && (
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", kpi.pillColor)}>
                    {kpi.pill}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────────────── */}
      <Tabs defaultValue="workforce">
        <TabsList className="h-9 border border-border bg-muted/40 p-0.5 [&>[data-state=active]]:bg-card [&>[data-state=active]]:text-foreground [&>[data-state=active]]:shadow-sm [&>[data-state=active]]:border [&>[data-state=active]]:border-border">
          <TabsTrigger value="workforce" className="gap-1.5 text-xs">
            <Users className="h-3.5 w-3.5" />
            Workforce AI Adoption
          </TabsTrigger>
          <TabsTrigger value="safety" className="gap-1.5 text-xs">
            <ShieldCheck className="h-3.5 w-3.5" />
            Safety & Compliance
          </TabsTrigger>
          <TabsTrigger value="training" className="gap-1.5 text-xs">
            <GraduationCap className="h-3.5 w-3.5" />
            Training Programmes
          </TabsTrigger>
          <TabsTrigger value="scheduling" className="gap-1.5 text-xs">
            <Activity className="h-3.5 w-3.5" />
            Shift Scheduling
          </TabsTrigger>
        </TabsList>

        {/* ════════════════════════════════════════════════════════════════════
            WORKFORCE AI ADOPTION
        ════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="workforce" className="mt-4">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">

            {/* AI Adoption Levels */}
            <div className="xl:col-span-2 space-y-4">
              <Card className="border-border bg-card">
                <CardHeader className="border-b border-border px-5 py-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">AI Adoption — Three-Level Framework</CardTitle>
                    <Badge variant="outline" className="border-transparent bg-accent/10 text-[10px] text-accent">
                      EOS Training Matrix
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="px-5 py-5 space-y-6">
                  {[
                    {
                      level: "Level 1",
                      name: "AI Awareness",
                      audience: "All staff — 66,000+ employees across 80+ countries",
                      completion: 71,
                      target: 100,
                      milestone: "M18",
                      icon: <Users className="h-4 w-4 text-muted-foreground" />,
                      color: "text-chart-2",
                      barColor: "bg-chart-2",
                    },
                    {
                      level: "Level 2",
                      name: "AI Practitioner",
                      audience: "Primary AI users — operational and managerial roles",
                      completion: 48,
                      target: 80,
                      milestone: "M24",
                      icon: <BrainCircuit className="h-4 w-4 text-muted-foreground" />,
                      color: "text-accent",
                      barColor: "bg-accent",
                    },
                    {
                      level: "Level 3",
                      name: "AI Builder",
                      audience: "Centre of Excellence · Power users · AI Champions",
                      completion: 34,
                      target: 50,
                      milestone: "M30",
                      icon: <Zap className="h-4 w-4 text-muted-foreground" />,
                      color: "text-chart-5",
                      barColor: "bg-chart-5",
                    },
                  ].map((lvl, i, arr) => (
                    <div key={lvl.level} className={cn("space-y-3", i < arr.length - 1 && "pb-6 border-b border-border")}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted">
                            {lvl.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{lvl.level}</span>
                              <span className="text-sm font-semibold text-foreground">{lvl.name}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{lvl.audience}</p>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className={cn("font-heading text-xl font-bold tabular-nums", lvl.color)}>
                            {lvl.level === "Level 3" ? `${lvl.completion} / ${lvl.target}` : `${lvl.completion}%`}
                          </p>
                          <p className="text-[10px] text-muted-foreground">Target: {lvl.level === "Level 3" ? `${lvl.target} certified` : `${lvl.target}%`} by {lvl.milestone}</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Progress
                          value={lvl.level === "Level 3" ? (lvl.completion / lvl.target) * 100 : lvl.completion}
                          className="h-2"
                        />
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span>Current</span>
                          <span>Target by {lvl.milestone}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Regional headcount */}
              <Card className="border-border bg-card">
                <CardHeader className="border-b border-border px-5 py-4">
                  <CardTitle className="text-sm font-semibold">Headcount & AI Adoption by Region</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        {["Region", "Employees", "Facilities", "AI Adoption"].map((h) => (
                          <TableHead key={h} className="h-9 px-5 text-[11px] font-semibold text-muted-foreground">
                            {h}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {HEADCOUNT_REGIONS.map((r) => (
                        <TableRow key={r.region} className="border-border hover:bg-muted/30">
                          <TableCell className="px-5 py-3 text-sm font-medium text-foreground">{r.region}</TableCell>
                          <TableCell className="px-5 py-3 text-sm tabular-nums text-muted-foreground">
                            {r.employees.toLocaleString()}
                          </TableCell>
                          <TableCell className="px-5 py-3 text-sm tabular-nums text-muted-foreground">{r.plants}</TableCell>
                          <TableCell className="px-5 py-3">
                            <div className="flex items-center gap-2.5">
                              <Progress value={r.aiAdoption} className="h-1.5 w-20" />
                              <span className={cn("text-xs font-bold tabular-nums", completionColor(r.aiAdoption, 60))}>
                                {r.aiAdoption}%
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              {/* AI Agents */}
              <Card className="border-border bg-card">
                <CardHeader className="border-b border-border px-5 py-4">
                  <CardTitle className="text-sm font-semibold">AI Agents — HR Operations</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {[
                    { name: "HR Scheduling Agent",   task: "Shift optimization across 600+ plants", stat: "Active",  active: true,  statColor: "text-chart-2"  },
                    { name: "Training Tracker AI",   task: "Certification monitoring & nudges",    stat: "Running", active: true,  statColor: "text-accent"   },
                    { name: "Safety Sentinel",        task: "Predictive incident prevention",       stat: "0 flags", active: true,  statColor: "text-chart-2"  },
                    { name: "Recruitment AI",         task: "Candidate screening & ranking",        stat: "Standby", active: false, statColor: "text-muted-foreground" },
                  ].map((agent, i, arr) => (
                    <div
                      key={agent.name}
                      className={cn("flex items-center gap-3 px-5 py-3", i < arr.length - 1 && "border-b border-border")}
                    >
                      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", agent.active ? "bg-chart-2 shadow-[0_0_6px_hsl(var(--chart-2))]" : "bg-muted-foreground/30")} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-foreground">{agent.name}</p>
                        <p className="truncate text-[10px] text-muted-foreground">{agent.task}</p>
                      </div>
                      <span className={cn("shrink-0 text-[11px] font-bold", agent.statColor)}>{agent.stat}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Cert renewal CTA */}
              <Card className="border-chart-3/30 bg-chart-3/5">
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <HardHat className="h-4 w-4 shrink-0 text-chart-3" />
                      <span className="text-sm font-semibold text-foreground">Certification Alert</span>
                    </div>
                    <Badge variant="outline" className="rounded-full border-transparent bg-chart-3/10 text-[10px] text-chart-3">
                      18 days
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">H₂ Safety Renewal — 120 Operators</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      ISO 19880 / NFPA 2 certification renewal required for hydrogen plant personnel at TN-02 and MH-04.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-24 shrink-0 text-[10px] text-muted-foreground">Compliance at risk</span>
                    <Progress value={42} className="h-1.5 flex-1" />
                    <span className="w-8 shrink-0 text-right text-[10px] font-bold text-chart-3">42%</span>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      className="h-7 flex-1 bg-chart-2 text-xs text-white hover:bg-chart-2/90"
                      onClick={() => dispatch("cert-renewal")}
                      disabled={dispatched.has("cert-renewal")}
                    >
                      {dispatched.has("cert-renewal") ? (
                        <><CheckCircle2 className="mr-1 h-3 w-3" />Initiated</>
                      ) : (
                        "Initiate Training"
                      )}
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 border-chart-3/30 text-xs text-chart-3 hover:bg-chart-3/10">
                      Override
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ════════════════════════════════════════════════════════════════════
            SAFETY & COMPLIANCE
        ════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="safety" className="mt-4">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">

            {/* Safety alerts feed */}
            <div className="xl:col-span-2 space-y-2.5">
              <div className="flex items-center justify-between pb-1">
                <p className="text-sm font-semibold text-foreground">
                  Safety Status Feed
                  <span className="ml-2 text-xs font-normal text-muted-foreground">Predictive analytics · All 600+ facilities</span>
                </p>
                <Badge variant="outline" className="border-transparent bg-chart-2/10 text-[10px] text-chart-2">
                  0 critical
                </Badge>
              </div>

              {SAFETY_ALERTS.map((alert) => {
                const cfg = alertConfig(alert.severity);
                return (
                  <Card
                    key={alert.id}
                    className={cn("border-l-4 rounded-l-none rounded-xs border-border bg-card", cfg.border)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {cfg.icon}
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <span className="text-sm font-semibold text-foreground">{alert.title}</span>
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {alert.timestamp}
                            </span>
                          </div>
                          <p className="text-xs leading-relaxed text-muted-foreground">{alert.description}</p>
                          <p className="text-[10px] text-muted-foreground">
                            <span className="font-medium text-foreground">Scope: </span>{alert.plant}
                          </p>
                          {alert.action && (
                            <div className="flex items-center gap-2 pt-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 gap-1 px-2.5 text-[10px]"
                                onClick={() => dispatch(alert.id)}
                                disabled={dispatched.has(alert.id)}
                              >
                                {dispatched.has(alert.id) ? (
                                  <><CheckCircle2 className="h-3 w-3 text-chart-2" />Initiated</>
                                ) : (
                                  <><ChevronRight className="h-3 w-3" />{alert.action}</>
                                )}
                              </Button>
                              <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px] text-muted-foreground">
                                Modify
                              </Button>
                              <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px] text-destructive hover:text-destructive">
                                Override
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* PSM compliance + permit */}
            <div className="space-y-4">
              <Card className="border-border bg-card">
                <CardHeader className="border-b border-border px-5 py-4">
                  <CardTitle className="text-sm font-semibold">PSM Compliance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 px-5 py-4">
                  {[
                    { label: "Process Hazard Analysis",    value: 100 },
                    { label: "Mechanical Integrity",        value: 96  },
                    { label: "Emergency Planning (CAER)",   value: 98  },
                    { label: "Contractor Safety Mgmt",      value: 91  },
                    { label: "Management of Change (MOC)",  value: 94  },
                    { label: "Incident Investigation",      value: 100 },
                  ].map((row) => (
                    <div key={row.label} className="space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">{row.label}</span>
                        <span className={cn("text-xs font-bold tabular-nums", row.value >= 95 ? "text-chart-2" : row.value >= 88 ? "text-chart-3" : "text-destructive")}>
                          {row.value}%
                        </span>
                      </div>
                      <Progress value={row.value} className="h-1" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader className="border-b border-border px-5 py-4">
                  <CardTitle className="text-sm font-semibold">Safety Permit Digitization</CardTitle>
                </CardHeader>
                <CardContent className="px-5 py-5">
                  <div className="mb-4 text-center">
                    <p className="font-heading text-5xl font-bold tracking-tight text-chart-2">78%</p>
                    <p className="mt-1 text-xs text-muted-foreground">Paper workflows eliminated</p>
                    <p className="mt-0.5 text-[11px] font-semibold text-accent">468 of 600 facilities complete</p>
                  </div>
                  <Progress value={78} className="h-2 mb-4" />
                  <div className="space-y-2.5">
                    {[
                      { label: "Permits digitized (YTD)",  value: "14,200+", color: "text-chart-2" },
                      { label: "Paper forms eliminated",    value: "↓ 94%",   color: "text-chart-2" },
                      { label: "Avg permit cycle time",    value: "↓ 67%",   color: "text-accent"  },
                      { label: "Remaining facilities",     value: "132",     color: "text-chart-3" },
                    ].map((s) => (
                      <div key={s.label} className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{s.label}</span>
                        <span className={cn("text-xs font-bold tabular-nums", s.color)}>{s.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ════════════════════════════════════════════════════════════════════
            TRAINING PROGRAMMES
        ════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="training" className="mt-4">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">

            {/* Training table */}
            <div className="xl:col-span-2">
              <Card className="border-border bg-card">
                <CardHeader className="border-b border-border px-5 py-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">Active Training Programmes</CardTitle>
                    <span className="text-[11px] text-muted-foreground">6 programmes · All levels</span>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        {["Programme", "Audience", "Progress", "Deadline", "Status"].map((h) => (
                          <TableHead key={h} className="h-9 px-5 text-[11px] font-semibold text-muted-foreground">
                            {h}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {TRAINING_PROGRAMS.map((tp) => {
                        const statusCfg = trainingStatusConfig(tp.status);
                        const pct = Math.round((tp.completion / tp.target) * 100);
                        return (
                          <TableRow key={tp.id} className="border-border hover:bg-muted/30">
                            <TableCell className="px-5 py-3">
                              <p className="text-sm font-semibold text-foreground">{tp.name}</p>
                              <p className="text-[10px] text-muted-foreground">{tp.id}</p>
                            </TableCell>
                            <TableCell className="px-5 py-3 text-xs text-muted-foreground max-w-[160px]">
                              {tp.audience}
                            </TableCell>
                            <TableCell className="px-5 py-3">
                              <div className="flex items-center gap-2">
                                <Progress value={pct} className="h-1.5 w-16" />
                                <span className={cn("text-xs font-bold tabular-nums", completionColor(pct, 60))}>
                                  {tp.target === 100 ? `${tp.completion}%` : `${tp.completion} / ${tp.target}`}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="px-5 py-3 text-xs text-muted-foreground">{tp.deadline}</TableCell>
                            <TableCell className="px-5 py-3">
                              <Badge variant="outline" className={cn("text-[10px] font-semibold rounded-full px-2 py-0.5", statusCfg.className)}>
                                {statusCfg.label}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* Training summary */}
            <div className="space-y-4">
              <Card className="border-border bg-card">
                <CardHeader className="border-b border-border px-5 py-4">
                  <CardTitle className="text-sm font-semibold">Training Metrics</CardTitle>
                </CardHeader>
                <CardContent className="px-5 py-4 space-y-4">
                  {[
                    { label: "Completions (YTD)",    value: "47,320",  color: "text-chart-2"  },
                    { label: "Avg completion time",  value: "3.2 hrs", color: "text-foreground" },
                    { label: "Pass rate (all progs)","value": "91%",   color: "text-chart-2"  },
                    { label: "Overdue programmes",   value: "1",       color: "text-chart-3"  },
                    { label: "AI-delivered modules", value: "68%",     color: "text-chart-5"  },
                  ].map((m) => (
                    <div key={m.label} className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{m.label}</span>
                      <span className={cn("text-sm font-bold tabular-nums", m.color)}>{m.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardContent className="space-y-2 p-5">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-chart-5 shadow-[0_0_6px_hsl(var(--chart-5))]" />
                    <span className="text-xs font-semibold text-chart-5">Training Tracker AI · Active</span>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Monitors certification expiry dates, sends nudge campaigns, and escalates overdue completions to line managers. Integrates with SAP SuccessFactors for automated record updates.
                  </p>
                  <p className="pt-1 text-[11px] text-muted-foreground">
                    Next nudge batch: <span className="font-medium text-foreground">In 2 hours</span>
                    <span className="mx-1.5 text-muted-foreground/40">·</span>
                    Recipients: <span className="font-medium text-foreground">312</span>
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ════════════════════════════════════════════════════════════════════
            SHIFT SCHEDULING
        ════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="scheduling" className="mt-4">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">

            {/* Shift table */}
            <div className="xl:col-span-2">
              <Card className="border-border bg-card">
                <CardHeader className="border-b border-border px-5 py-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">Active Shift Schedules</CardTitle>
                    <Badge variant="outline" className="border-transparent bg-chart-2/10 text-[10px] text-chart-2">
                      AI Scheduling Agent
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        {["Shift", "Facility", "Headcount", "Utilisation", "AI", "Notes"].map((h) => (
                          <TableHead key={h} className="h-9 px-4 text-[11px] font-semibold text-muted-foreground">
                            {h}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {SHIFT_SCHEDULES.map((s, idx) => (
                        <TableRow key={idx} className="border-border hover:bg-muted/30">
                          <TableCell className="px-4 py-3 text-xs text-muted-foreground">{s.shift}</TableCell>
                          <TableCell className="px-4 py-3 text-xs font-medium text-accent">{s.plant}</TableCell>
                          <TableCell className="px-4 py-3 text-sm font-bold tabular-nums text-foreground">{s.headcount}</TableCell>
                          <TableCell className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Progress value={s.utilization} className="h-1.5 w-12" />
                              <span className={cn("text-xs font-bold tabular-nums", s.utilization >= 90 ? "text-chart-2" : "text-chart-3")}>
                                {s.utilization}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            {s.aiOptimized ? (
                              <Badge variant="outline" className="border-transparent bg-chart-5/10 text-[10px] text-chart-5">AI</Badge>
                            ) : (
                              <Badge variant="outline" className="border-transparent bg-muted text-[10px] text-muted-foreground">Manual</Badge>
                            )}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-xs text-muted-foreground">{s.notes}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* Scheduling KPIs */}
            <div className="space-y-4">
              <Card className="border-border bg-card">
                <CardHeader className="border-b border-border px-5 py-4">
                  <CardTitle className="text-sm font-semibold">Scheduling Outcomes</CardTitle>
                </CardHeader>
                <CardContent className="px-5 py-4 space-y-4">
                  {[
                    { label: "Overtime hours reduced",   value: "↓ 31%",   color: "text-chart-2" },
                    { label: "Shift fill rate",          value: "98.4%",   color: "text-chart-2" },
                    { label: "AI-optimized shifts",      value: "83%",     color: "text-chart-5" },
                    { label: "Avg schedule lead time",   value: "72 hrs",  color: "text-foreground" },
                    { label: "Compliance breaches (YTD)","value": "0",     color: "text-chart-2" },
                  ].map((m) => (
                    <div key={m.label} className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{m.label}</span>
                      <span className={cn("text-sm font-bold tabular-nums", m.color)}>{m.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardContent className="space-y-2 p-5">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-chart-3 shadow-[0_0_6px_hsl(var(--chart-3))]" />
                    <span className="text-xs font-semibold text-chart-3">HR Scheduling Agent · Standby</span>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Awaiting data sync from plant DCS systems before full activation. Shift patterns for 5 of 8 designated facilities have been ingested and validated.
                  </p>
                  <p className="pt-1 text-[11px] text-muted-foreground">
                    Data sync ETA: <span className="font-medium text-foreground">~4 hours</span>
                    <span className="mx-1.5 text-muted-foreground/40">·</span>
                    Facilities pending: <span className="font-medium text-foreground">3</span>
                  </p>
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      className="h-7 flex-1 bg-chart-2 text-xs text-white hover:bg-chart-2/90"
                      onClick={() => dispatch("scheduling-agent")}
                      disabled={dispatched.has("scheduling-agent")}
                    >
                      {dispatched.has("scheduling-agent") ? (
                        <><CheckCircle2 className="mr-1 h-3 w-3" />Approved</>
                      ) : (
                        "Approve Activation"
                      )}
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs text-destructive hover:bg-destructive/10 border-destructive/30">
                      Override
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}
