
/**
 * Linde EOS — IT Operations & Cybersecurity
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
 * • Status colors: chart-2=success/compliant, chart-3=warning/partial,
 *   destructive=critical, accent=info/active/in-progress, chart-5=AI/special
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
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock,
  Cpu,
  Lock,
  Network,
  Bug,
  FileSearch,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────

type ComplianceStatus = "compliant" | "in-progress" | "partial" | "non-compliant";
type ThreatSeverity = "critical" | "high" | "medium" | "low";
type PatchStatus = "patched" | "pending" | "overdue";

// ── Data ───────────────────────────────────────────────────────────────────────

const COMPLIANCE_MATRIX = [
  { standard: "UK Corp. Governance",  status: "compliant"   as ComplianceStatus, nextAudit: "Jun 2026", scope: "Global operations" },
  { standard: "EU AI Act",            status: "in-progress" as ComplianceStatus, nextAudit: "Aug 2026", scope: "AI systems · 47 agents" },
  { standard: "SOX (NYSE)",           status: "compliant"   as ComplianceStatus, nextAudit: "Dec 2026", scope: "Financial systems" },
  { standard: "IEC 62443 OT",        status: "partial"     as ComplianceStatus, nextAudit: "Sep 2026", scope: "OT networks · 600+ plants" },
  { standard: "GDPR (EU Data)",       status: "compliant"   as ComplianceStatus, nextAudit: "Jul 2026", scope: "EU customer data" },
  { standard: "ISO 19880 H₂",        status: "compliant"   as ComplianceStatus, nextAudit: "Nov 2026", scope: "Hydrogen facilities" },
  { standard: "ISO 27001",            status: "compliant"   as ComplianceStatus, nextAudit: "Mar 2027", scope: "Information security" },
  { standard: "NIST CSF 2.0",        status: "in-progress" as ComplianceStatus, nextAudit: "Jan 2027", scope: "Cybersecurity framework" },
];

type ThreatEvent = {
  id: string;
  severity: ThreatSeverity;
  type: string;
  source: string;
  target: string;
  timestamp: string;
  status: "blocked" | "investigating" | "resolved";
  action?: string;
};

const THREAT_EVENTS: ThreatEvent[] = [
  {
    id: "TH-0841",
    severity: "critical",
    type: "OT Network Intrusion Attempt",
    source: "External · Unknown origin",
    target: "DCS — Plant MH-04 Pune",
    timestamp: "14 min ago",
    status: "blocked",
  },
  {
    id: "TH-0840",
    severity: "high",
    type: "Anomalous API Access Pattern",
    source: "Internal · Service account SA-0192",
    target: "SAP S/4HANA production",
    timestamp: "1 hr ago",
    status: "investigating",
    action: "Isolate Account",
  },
  {
    id: "TH-0839",
    severity: "medium",
    type: "Patch Compliance Breach",
    source: "Endpoint · 14 unpatched nodes",
    target: "IT infrastructure — DL-02 Delhi NCR",
    timestamp: "3 hr ago",
    status: "investigating",
    action: "Force Patch",
  },
  {
    id: "TH-0838",
    severity: "low",
    type: "Shadow IT Tool Detected",
    source: "Employee device · HR department",
    target: "Cloud SaaS — unapproved",
    timestamp: "6 hr ago",
    status: "resolved",
  },
];

const PATCH_COMPLIANCE = [
  { category: "IT Endpoints",           patched: 97, total: 100, status: "patched"  as PatchStatus },
  { category: "OT Controllers (PLC)",   patched: 81, total: 100, status: "pending"  as PatchStatus },
  { category: "SCADA Systems",          patched: 74, total: 100, status: "overdue"  as PatchStatus },
  { category: "Cloud Workloads",        patched: 99, total: 100, status: "patched"  as PatchStatus },
  { category: "Network Devices",        patched: 93, total: 100, status: "patched"  as PatchStatus },
  { category: "Industrial IoT Sensors", patched: 68, total: 100, status: "overdue"  as PatchStatus },
];

const APP_RATIONALIZATION = [
  { label: "Applications Decommissioned", current: 87,  target: 200, color: "bg-chart-2",    text: "text-chart-2"  },
  { label: "Shadow IT Tools Migrated",    current: 62,  target: 100, color: "bg-accent",     text: "text-accent"   },
  { label: "Custom Programs (AI-enabled)",current: 124, target: 300, color: "bg-chart-5",    text: "text-chart-5"  },
  { label: "OT Plants on Zero-Trust",     current: 387, target: 600, color: "bg-chart-3",    text: "text-chart-3"  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function complianceConfig(status: ComplianceStatus) {
  return {
    compliant:      { label: "Compliant",    className: "bg-chart-2/10 text-chart-2 border-transparent"      },
    "in-progress":  { label: "In Progress",  className: "bg-accent/10 text-accent border-transparent"        },
    partial:        { label: "Partial",      className: "bg-chart-3/10 text-chart-3 border-transparent"      },
    "non-compliant":{ label: "Non-Compliant",className: "bg-destructive/10 text-destructive border-transparent" },
  }[status];
}

function threatConfig(severity: ThreatSeverity) {
  return {
    critical: { border: "border-l-destructive", dot: "bg-destructive", text: "text-destructive" },
    high:     { border: "border-l-chart-3",     dot: "bg-chart-3",     text: "text-chart-3"     },
    medium:   { border: "border-l-accent",       dot: "bg-accent",      text: "text-accent"      },
    low:      { border: "border-l-muted-foreground", dot: "bg-muted-foreground", text: "text-muted-foreground" },
  }[severity];
}

function threatStatusBadge(status: ThreatEvent["status"]) {
  return {
    blocked:       { label: "Blocked",       className: "bg-chart-2/10 text-chart-2 border-transparent"        },
    investigating: { label: "Investigating", className: "bg-chart-3/10 text-chart-3 border-transparent"        },
    resolved:      { label: "Resolved",      className: "bg-muted text-muted-foreground border-transparent"    },
  }[status];
}

function patchColor(pct: number) {
  if (pct >= 95) return "text-chart-2";
  if (pct >= 80) return "text-chart-3";
  return "text-destructive";
}

// ── Main ───────────────────────────────────────────────────────────────────────

export default function ItCybersecurity() {
  const [dispatched, setDispatched] = useState<Set<string>>(new Set());
  function dispatch(id: string) {
    setDispatched((prev) => new Set(prev).add(id));
  }

  const criticalThreats = THREAT_EVENTS.filter((t) => t.severity === "critical").length;
  const activeThreats   = THREAT_EVENTS.filter((t) => t.status === "investigating").length;

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            IT Operations & Cybersecurity
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Zero-trust · OT security · IEC 62443 · 25,000+ tickets/month · Section 3.1.6
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 pt-1">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-chart-2" />
            SOC Live
          </span>
          {criticalThreats > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-destructive/10 px-2.5 py-1 text-[11px] font-semibold text-destructive">
              <AlertTriangle className="h-3 w-3" />
              {criticalThreats} Critical
            </span>
          )}
          {activeThreats > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-chart-3/10 px-2.5 py-1 text-[11px] font-semibold text-chart-3">
              <Bug className="h-3 w-3" />
              {activeThreats} Investigating
            </span>
          )}
        </div>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {
            label:      "L1 Ticket Deflection",
            value:      "58%",
            target:     "Target: 55%+",
            pill:       "Exceeded",
            pillColor:  "bg-chart-2/10 text-chart-2",
            valueColor: "text-chart-2",
            border:     "border-l-chart-2",
          },
          {
            label:      "Apps Rationalized",
            value:      "87",
            target:     "200+ → 60–90 target",
            pill:       "On target",
            pillColor:  "bg-accent/10 text-accent",
            valueColor: "text-accent",
            border:     "border-l-accent",
          },
          {
            label:      "OT Threats Blocked",
            value:      "247",
            target:     "This month",
            pill:       null,
            pillColor:  "",
            valueColor: "text-destructive",
            border:     "border-l-destructive",
          },
          {
            label:      "IT Budget (Innovation)",
            value:      "48%",
            target:     "Target: 64% (36mo)",
            pill:       "In progress",
            pillColor:  "bg-chart-3/10 text-chart-3",
            valueColor: "text-chart-3",
            border:     "border-l-chart-3",
          },
        ].map((kpi) => (
          <Card
            key={kpi.label}
            className={cn("border-l-4 border-border bg-card rounded-l-none rounded-xs", kpi.border)}
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
      <Tabs defaultValue="overview">
        <TabsList className="h-9 border border-border bg-muted/40 p-0.5 [&>[data-state=active]]:bg-card [&>[data-state=active]]:text-foreground [&>[data-state=active]]:shadow-sm [&>[data-state=active]]:border [&>[data-state=active]]:border-border">
          <TabsTrigger value="overview" className="gap-1.5 text-xs">
            <Network className="h-3.5 w-3.5" />
            App Rationalization
          </TabsTrigger>
          <TabsTrigger value="threats" className="gap-1.5 text-xs">
            <ShieldCheck className="h-3.5 w-3.5" />
            Threat Intelligence
            {activeThreats > 0 && (
              <span className="ml-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-chart-3/20 px-1 text-[9px] font-bold text-chart-3">
                {activeThreats}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="compliance" className="gap-1.5 text-xs">
            <FileSearch className="h-3.5 w-3.5" />
            Compliance Matrix
          </TabsTrigger>
          <TabsTrigger value="patching" className="gap-1.5 text-xs">
            <Cpu className="h-3.5 w-3.5" />
            Patch Compliance
          </TabsTrigger>
        </TabsList>

        {/* ════════════════════════════════════════════════════════════════════
            APP RATIONALIZATION
        ════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">

            {/* Rationalization progress */}
            <div className="xl:col-span-2">
              <Card className="border-border bg-card">
                <CardHeader className="border-b border-border px-5 py-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">App Rationalization Progress</CardTitle>
                    <Badge variant="outline" className="border-transparent bg-accent/10 text-[10px] text-accent">
                      Tech Debt Programme
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 px-5 py-5">
                  {APP_RATIONALIZATION.map((item) => {
                    const pct = Math.round((item.current / item.target) * 100);
                    return (
                      <div key={item.label} className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{item.label}</span>
                          <span className={cn("font-bold tabular-nums", item.text)}>
                            {item.current.toLocaleString()} / {item.target.toLocaleString()}+
                          </span>
                        </div>
                        <div className="flex h-5 overflow-hidden rounded-sm">
                          <div
                            className={cn("h-full transition-all duration-700", item.color, "opacity-70")}
                            style={{ width: `${pct}%` }}
                          />
                          <div className="h-full flex-1 bg-muted/40" />
                        </div>
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span>{pct}% of target</span>
                          <span>Target: {item.target.toLocaleString()}+</span>
                        </div>
                      </div>
                    );
                  })}
                  <div className="flex items-center gap-5 pt-1 text-[10px] text-muted-foreground border-t border-border">
                    <span className="flex items-center gap-1.5 pt-3">
                      <span className="inline-block h-2.5 w-5 rounded-sm bg-chart-2/60" />
                      Completed
                    </span>
                    <span className="flex items-center gap-1.5 pt-3">
                      <span className="inline-block h-2.5 w-5 rounded-sm bg-muted/40" />
                      Remaining
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              {/* AI Agents */}
              <Card className="border-border bg-card">
                <CardHeader className="border-b border-border px-5 py-4">
                  <CardTitle className="text-sm font-semibold">AI Agents — IT & Security</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {[
                    { name: "IT Ticket Deflection AI", task: "L1 auto-resolution · 25K+/mo", stat: "58%",     active: true,  statColor: "text-chart-2" },
                    { name: "OT Threat Sentinel",       task: "IEC 62443 anomaly detection",  stat: "247 blocked", active: true,  statColor: "text-destructive" },
                    { name: "Patch Compliance Agent",   task: "Automated vulnerability mgmt", stat: "Running", active: true,  statColor: "text-accent"   },
                    { name: "App Rationalization AI",   task: "Shadow IT detection & removal", stat: "Active",  active: true,  statColor: "text-chart-5"  },
                    { name: "Zero-Trust Policy Agent",  task: "Identity & access enforcement", stat: "Standby", active: false, statColor: "text-muted-foreground" },
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

              {/* Ticket deflection summary */}
              <Card className="border-border bg-card">
                <CardHeader className="border-b border-border px-5 py-4">
                  <CardTitle className="text-sm font-semibold">Ticket Deflection (YTD)</CardTitle>
                </CardHeader>
                <CardContent className="px-5 py-4 space-y-3">
                  {[
                    { label: "Total tickets (YTD)",    value: "298,400",  color: "text-foreground"  },
                    { label: "Auto-resolved (AI)",     value: "173,072",  color: "text-chart-2"     },
                    { label: "Deflection rate",        value: "58%",      color: "text-chart-2"     },
                    { label: "Avg resolution time",    value: "↓ 74%",    color: "text-chart-2"     },
                    { label: "Cost saved (YTD)",       value: "$4.1M",    color: "text-chart-5"     },
                  ].map((m) => (
                    <div key={m.label} className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{m.label}</span>
                      <span className={cn("text-sm font-bold tabular-nums", m.color)}>{m.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ════════════════════════════════════════════════════════════════════
            THREAT INTELLIGENCE
        ════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="threats" className="mt-4">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">

            {/* Threat feed */}
            <div className="xl:col-span-2 space-y-2.5">
              <div className="flex items-center justify-between pb-1">
                <p className="text-sm font-semibold text-foreground">
                  Active Threat Events
                  <span className="ml-2 text-xs font-normal text-muted-foreground">247 blocked this month · Top priority shown</span>
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline" className="border-transparent bg-destructive/10 text-[10px] text-destructive">
                    {criticalThreats} Critical
                  </Badge>
                  <Badge variant="outline" className="border-transparent bg-chart-3/10 text-[10px] text-chart-3">
                    {activeThreats} Investigating
                  </Badge>
                </div>
              </div>

              {THREAT_EVENTS.map((threat) => {
                const cfg = threatConfig(threat.severity);
                const statusCfg = threatStatusBadge(threat.status);
                return (
                  <Card
                    key={threat.id}
                    className={cn("border-l-4 rounded-l-none rounded-xs border-border bg-card", cfg.border)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", cfg.dot)} />
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <span className="text-sm font-semibold text-foreground">{threat.type}</span>
                              <span className="mx-1.5 text-xs text-muted-foreground/50">·</span>
                              <span className={cn("text-xs font-semibold", cfg.text)}>
                                {threat.severity.charAt(0).toUpperCase() + threat.severity.slice(1)}
                              </span>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              <Badge variant="outline" className={cn("text-[10px] font-semibold rounded-full px-2 py-0.5", statusCfg.className)}>
                                {statusCfg.label}
                              </Badge>
                              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {threat.timestamp}
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                            <p className="text-xs text-muted-foreground">
                              <span className="font-medium text-foreground">Source: </span>{threat.source}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              <span className="font-medium text-foreground">Target: </span>{threat.target}
                            </p>
                          </div>
                          {threat.action && (
                            <div className="flex items-center gap-2 pt-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 gap-1 px-2.5 text-[10px]"
                                onClick={() => dispatch(threat.id)}
                                disabled={dispatched.has(threat.id)}
                              >
                                {dispatched.has(threat.id) ? (
                                  <><CheckCircle2 className="h-3 w-3 text-chart-2" />Dispatched</>
                                ) : (
                                  <><ChevronRight className="h-3 w-3" />{threat.action}</>
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

            {/* OT/IT security posture */}
            <div className="space-y-4">
              <Card className="border-border bg-card">
                <CardHeader className="border-b border-border px-5 py-4">
                  <CardTitle className="text-sm font-semibold">OT/IT Security Posture</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 px-5 py-4">
                  {[
                    { label: "OT network segmentation",  value: 94 },
                    { label: "Zero-trust coverage",       value: 64 },
                    { label: "SIEM event coverage",       value: 98 },
                    { label: "Privileged access managed", value: 87 },
                    { label: "Encryption at rest",        value: 100 },
                    { label: "MFA enforcement",           value: 96 },
                  ].map((row) => (
                    <div key={row.label} className="space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">{row.label}</span>
                        <span className={cn("text-xs font-bold tabular-nums", row.value >= 95 ? "text-chart-2" : row.value >= 80 ? "text-chart-3" : "text-destructive")}>
                          {row.value}%
                        </span>
                      </div>
                      <Progress value={row.value} className="h-1" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-destructive/30 bg-destructive/5">
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 shrink-0 text-destructive" />
                      <span className="text-sm font-semibold text-foreground">OT Intrusion Blocked</span>
                    </div>
                    <Badge variant="outline" className="rounded-full border-transparent bg-chart-2/10 text-[10px] text-chart-2">
                      Auto-blocked
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">DCS Probe — Plant MH-04</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      External entity attempted unauthorised access to Distributed Control System at Pune. Zero-trust policy enforcement blocked and logged automatically.
                    </p>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      className="h-7 flex-1 bg-chart-2 text-xs text-white hover:bg-chart-2/90"
                      onClick={() => dispatch("ot-intrusion")}
                      disabled={dispatched.has("ot-intrusion")}
                    >
                      {dispatched.has("ot-intrusion") ? (
                        <><CheckCircle2 className="mr-1 h-3 w-3" />Approved</>
                      ) : (
                        "Approve Block"
                      )}
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 border-destructive/30 text-xs text-destructive hover:bg-destructive/10">
                      Override
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ════════════════════════════════════════════════════════════════════
            COMPLIANCE MATRIX
        ════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="compliance" className="mt-4">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">

            {/* Compliance table */}
            <div className="xl:col-span-2">
              <Card className="border-border bg-card">
                <CardHeader className="border-b border-border px-5 py-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">Security Compliance Matrix</CardTitle>
                    <span className="text-[11px] text-muted-foreground">
                      {COMPLIANCE_MATRIX.filter((c) => c.status === "compliant").length} of {COMPLIANCE_MATRIX.length} fully compliant
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        {["Standard", "Scope", "Status", "Next Audit"].map((h) => (
                          <TableHead key={h} className="h-9 px-5 text-[11px] font-semibold text-muted-foreground">
                            {h}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {COMPLIANCE_MATRIX.map((row) => {
                        const cfg = complianceConfig(row.status);
                        return (
                          <TableRow key={row.standard} className="border-border hover:bg-muted/30">
                            <TableCell className="px-5 py-3 text-sm font-semibold text-foreground">
                              {row.standard}
                            </TableCell>
                            <TableCell className="px-5 py-3 text-xs text-muted-foreground">
                              {row.scope}
                            </TableCell>
                            <TableCell className="px-5 py-3">
                              <Badge variant="outline" className={cn("text-[10px] font-semibold rounded-full px-2 py-0.5", cfg.className)}>
                                {cfg.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-5 py-3 text-xs text-muted-foreground">
                              {row.nextAudit}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* Compliance summary */}
            <div className="space-y-4">
              <Card className="border-border bg-card">
                <CardHeader className="border-b border-border px-5 py-4">
                  <CardTitle className="text-sm font-semibold">Compliance Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 px-5 py-4">
                  {[
                    { label: "Compliant",     count: COMPLIANCE_MATRIX.filter((c) => c.status === "compliant").length,      pct: 75, bar: "bg-chart-2",   text: "text-chart-2"   },
                    { label: "In Progress",   count: COMPLIANCE_MATRIX.filter((c) => c.status === "in-progress").length,    pct: 25, bar: "bg-accent",    text: "text-accent"    },
                    { label: "Partial",       count: COMPLIANCE_MATRIX.filter((c) => c.status === "partial").length,        pct: 12, bar: "bg-chart-3",   text: "text-chart-3"   },
                    { label: "Non-Compliant", count: COMPLIANCE_MATRIX.filter((c) => c.status === "non-compliant").length,  pct: 0,  bar: "bg-destructive",text: "text-destructive"},
                  ].map((row) => (
                    <div key={row.label} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{row.label}</span>
                        <span className={cn("font-bold tabular-nums", row.text)}>{row.count}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div className={cn("h-full rounded-full", row.bar)} style={{ width: `${row.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader className="border-b border-border px-5 py-4">
                  <CardTitle className="text-sm font-semibold">EU AI Act Readiness</CardTitle>
                </CardHeader>
                <CardContent className="px-5 py-5">
                  <div className="mb-4 text-center">
                    <p className="font-heading text-5xl font-bold tracking-tight text-accent">62%</p>
                    <p className="mt-1 text-xs text-muted-foreground">Readiness score</p>
                    <p className="mt-0.5 text-[11px] font-semibold text-chart-3">Audit: Aug 2026</p>
                  </div>
                  <Progress value={62} className="h-2 mb-4" />
                  <div className="space-y-2.5">
                    {[
                      { label: "Model registry documented", value: "47 / 47",  color: "text-chart-2" },
                      { label: "Risk tier classification",  value: "Complete",  color: "text-chart-2" },
                      { label: "Bias audit completion",     value: "38 / 47",   color: "text-chart-3" },
                      { label: "Human oversight logs",      value: "In progress",color: "text-accent"  },
                    ].map((s) => (
                      <div key={s.label} className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{s.label}</span>
                        <span className={cn("text-xs font-bold", s.color)}>{s.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ════════════════════════════════════════════════════════════════════
            PATCH COMPLIANCE
        ════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="patching" className="mt-4">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">

            {/* Patch table */}
            <div className="xl:col-span-2">
              <Card className="border-border bg-card">
                <CardHeader className="border-b border-border px-5 py-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">Patch Compliance by Category</CardTitle>
                    <Badge variant="outline" className="border-transparent bg-destructive/10 text-[10px] text-destructive">
                      2 Overdue
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5 px-5 py-5">
                  {PATCH_COMPLIANCE.map((item) => {
                    const statusStyles: Record<PatchStatus, string> = {
                      patched: "bg-chart-2/10 text-chart-2 border-transparent",
                      pending: "bg-chart-3/10 text-chart-3 border-transparent",
                      overdue: "bg-destructive/10 text-destructive border-transparent",
                    };
                    const statusLabels: Record<PatchStatus, string> = {
                      patched: "Compliant",
                      pending: "Pending",
                      overdue: "Overdue",
                    };
                    return (
                      <div key={item.category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground">{item.category}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={cn("text-[10px] font-semibold rounded-full px-2 py-0.5", statusStyles[item.status])}>
                              {statusLabels[item.status]}
                            </Badge>
                            <span className={cn("text-sm font-bold tabular-nums", patchColor(item.patched))}>
                              {item.patched}%
                            </span>
                          </div>
                        </div>
                        <Progress value={item.patched} className="h-2" />
                        <p className="text-[10px] text-muted-foreground">
                          {item.patched} of {item.total} nodes patched
                        </p>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Patch summary + agent */}
            <div className="space-y-4">
              <Card className="border-border bg-card">
                <CardHeader className="border-b border-border px-5 py-4">
                  <CardTitle className="text-sm font-semibold">Patch Metrics</CardTitle>
                </CardHeader>
                <CardContent className="px-5 py-4 space-y-3">
                  {[
                    { label: "Overall patch rate",      value: "85%",     color: "text-chart-3"    },
                    { label: "Critical CVEs patched",   value: "100%",    color: "text-chart-2"    },
                    { label: "Avg patch cycle time",    value: "↓ 41%",   color: "text-chart-2"    },
                    { label: "Overdue categories",      value: "2",       color: "text-destructive" },
                    { label: "AI-automated patches",    value: "63%",     color: "text-chart-5"    },
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
                    <span className="h-1.5 w-1.5 rounded-full bg-chart-2 shadow-[0_0_6px_hsl(var(--chart-2))]" />
                    <span className="text-xs font-semibold text-chart-2">Patch Compliance Agent · Active</span>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Continuously scans the OT/IT estate for unpatched vulnerabilities. Automatically applies patches to IT endpoints and flags OT systems for human-approved deployment due to operational constraints.
                  </p>
                  <p className="pt-1 text-[11px] text-muted-foreground">
                    Last scan: <span className="font-medium text-foreground">8 min ago</span>
                    <span className="mx-1.5 text-muted-foreground/40">·</span>
                    Nodes scanned: <span className="font-medium text-foreground">14,280</span>
                  </p>
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      className="h-7 flex-1 bg-chart-2 text-xs text-white hover:bg-chart-2/90"
                      onClick={() => dispatch("ot-patch")}
                      disabled={dispatched.has("ot-patch")}
                    >
                      {dispatched.has("ot-patch") ? (
                        <><CheckCircle2 className="mr-1 h-3 w-3" />Approved</>
                      ) : (
                        "Approve OT Patch Run"
                      )}
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs text-muted-foreground">
                      Modify
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
