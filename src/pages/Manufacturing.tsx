import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Factory,
  Zap,
  Wrench,
  AlertTriangle,
  Activity,
  FlaskConical,
  Wind,
  CheckCircle2,
  Clock,
  ChevronRight,
  Gauge,
  Cpu,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────

type PlantStatus = "Optimized" | "Monitoring" | "Alert";
type AlertSeverity = "critical" | "warning" | "info";
type HeatmapStatus = "ai-active" | "monitoring" | "deploying" | "planned" | "alert";

// ── Data ───────────────────────────────────────────────────────────────────────

const PLANTS = [
  { id: "KA-01", name: "Bangalore North", type: "ASU",     oee: 94.2, energy: 12.1, status: "Optimized"  as PlantStatus },
  { id: "MH-04", name: "Pune",            type: "ASU+H₂", oee: 91.8, energy:  9.4, status: "Optimized"  as PlantStatus },
  { id: "GJ-11", name: "Surat",           type: "ASU",     oee: 92.7, energy: 10.2, status: "Optimized"  as PlantStatus },
  { id: "DL-02", name: "Delhi NCR",       type: "ASU",     oee: 89.6, energy:  9.8, status: "Optimized"  as PlantStatus },
  { id: "AP-03", name: "Hyderabad",       type: "CO₂",     oee: 90.1, energy:  8.9, status: "Optimized"  as PlantStatus },
  { id: "TN-02", name: "Chennai",         type: "H₂",      oee: 88.5, energy:  7.8, status: "Monitoring" as PlantStatus },
  { id: "WB-05", name: "Kolkata",         type: "H₂",      oee: 85.3, energy:  6.1, status: "Monitoring" as PlantStatus },
  { id: "KA-07", name: "Bangalore South", type: "ASU",     oee: 76.4, energy:  null, status: "Alert"     as PlantStatus },
  { id: "KA-01", name: "Bangalore North", type: "ASU",     oee: 94.2, energy: 12.1, status: "Optimized"  as PlantStatus },
  { id: "MH-04", name: "Pune",            type: "ASU+H₂", oee: 91.8, energy:  9.4, status: "Optimized"  as PlantStatus },
  { id: "GJ-11", name: "Surat",           type: "ASU",     oee: 92.7, energy: 10.2, status: "Optimized"  as PlantStatus },
];

type Alert = {
  id: string;
  severity: AlertSeverity;
  asset: string;
  plant: string;
  issue: string;
  probability: number;
  window: string;
  action: string;
};

const ALERTS: Alert[] = [
  {
    id: "MA-001",
    severity: "critical",
    asset: "Compressor C-7A",
    plant: "KA-07 Bangalore South",
    issue: "Vibration anomaly — 73% failure probability within 72hr window",
    probability: 73,
    window: "72 hr",
    action: "Dispatch maintenance team immediately",
  },
  {
    id: "MA-002",
    severity: "warning",
    asset: "Heat Exchanger HX-12",
    plant: "MH-04 Pune",
    issue: "Efficiency degrading at 3.2%/week — approaching PSM threshold",
    probability: 38,
    window: "14 days",
    action: "Schedule inspection in next maintenance window",
  },
  {
    id: "MA-003",
    severity: "warning",
    asset: "Turbine T-09",
    plant: "AP-03 Hyderabad",
    issue: "Bearing temperature 4°C above baseline — trending upward",
    probability: 31,
    window: "21 days",
    action: "Lubrication cycle override recommended",
  },
  {
    id: "MA-004",
    severity: "info",
    asset: "Cryogenic Pump CP-03",
    plant: "TN-02 Chennai",
    issue: "Seal wear detected via acoustic monitoring — non-urgent",
    probability: 12,
    window: "30 days",
    action: "Order replacement parts",
  },
  {
    id: "MA-005",
    severity: "info",
    asset: "Cold Box CB-02",
    plant: "GJ-11 Surat",
    issue: "Minor insulation degradation — efficiency impact below 1%",
    probability: 8,
    window: "90 days",
    action: "Schedule during next planned outage",
  },
];

const HEATMAP_REGIONS: { region: string; cells: { id: string; status: HeatmapStatus }[] }[] = [
  {
    region: "South India",
    cells: [
      { id: "KA-01", status: "ai-active" }, { id: "KA-03", status: "ai-active" },
      { id: "KA-07", status: "alert" },     { id: "TN-02", status: "monitoring" },
      { id: "TN-06", status: "ai-active" }, { id: "AP-03", status: "ai-active" },
      { id: "AP-08", status: "deploying" }, { id: "KL-01", status: "planned" },
    ],
  },
  {
    region: "West India",
    cells: [
      { id: "MH-04", status: "ai-active" }, { id: "MH-07", status: "ai-active" },
      { id: "MH-11", status: "monitoring" }, { id: "GJ-11", status: "ai-active" },
      { id: "GJ-04", status: "ai-active" }, { id: "GJ-09", status: "deploying" },
      { id: "RJ-02", status: "planned" },   { id: "RJ-05", status: "planned" },
    ],
  },
  {
    region: "North India",
    cells: [
      { id: "DL-02", status: "ai-active" }, { id: "DL-08", status: "ai-active" },
      { id: "UP-03", status: "monitoring" }, { id: "UP-07", status: "deploying" },
      { id: "HR-04", status: "ai-active" }, { id: "PB-01", status: "planned" },
      { id: "MP-06", status: "deploying" }, { id: "MP-11", status: "planned" },
    ],
  },
  {
    region: "East India",
    cells: [
      { id: "WB-05", status: "monitoring" }, { id: "WB-09", status: "ai-active" },
      { id: "WB-12", status: "ai-active" },  { id: "OD-03", status: "deploying" },
      { id: "OD-07", status: "planned" },    { id: "JH-02", status: "planned" },
      { id: "AS-01", status: "planned" },    { id: "BR-04", status: "planned" },
    ],
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function oeeColor(oee: number) {
  if (oee >= 90) return "text-chart-2";
  if (oee >= 85) return "text-chart-3";
  return "text-destructive";
}

function PlantStatusBadge({ status }: { status: PlantStatus }) {
  const styles: Record<PlantStatus, string> = {
    Optimized:  "bg-chart-2/10 text-chart-2 border-transparent",
    Monitoring: "bg-accent/10 text-accent border-transparent",
    Alert:      "bg-destructive/10 text-destructive border-transparent",
  };
  return (
    <Badge variant="outline" className={cn("text-[10px] font-semibold rounded-full px-2 py-0.5", styles[status])}>
      {status}
    </Badge>
  );
}

function SeverityDot({ severity }: { severity: AlertSeverity }) {
  const styles: Record<AlertSeverity, string> = {
    critical: "bg-destructive",
    warning:  "bg-chart-3",
    info:     "bg-accent",
  };
  return <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", styles[severity])} />;
}

function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  const styles: Record<AlertSeverity, string> = {
    critical: "bg-destructive/10 text-destructive border-transparent",
    warning:  "bg-chart-3/10 text-chart-3 border-transparent",
    info:     "bg-accent/10 text-accent border-transparent",
  };
  const labels: Record<AlertSeverity, string> = { critical: "Critical", warning: "Warning", info: "Info" };
  return (
    <Badge variant="outline" className={cn("text-[10px] font-semibold rounded-full px-2 py-0.5", styles[severity])}>
      {labels[severity]}
    </Badge>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────

export default function Manufacturing() {
  const [dispatched, setDispatched] = useState<Set<string>>(new Set());

  function dispatch(id: string) {
    setDispatched((prev) => new Set(prev).add(id));
  }

  const criticalCount = ALERTS.filter((a) => a.severity === "critical").length;
  const warningCount  = ALERTS.filter((a) => a.severity === "warning").length;

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            Manufacturing & Plant Operations
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            600+ ASUs &amp; hydrogen plants · DCS integration · Predictive maintenance
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 pt-1">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-chart-2" />
            DCS Live
          </span>
          {criticalCount > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-destructive/10 px-2.5 py-1 text-[11px] font-semibold text-destructive">
              <AlertTriangle className="h-3 w-3" />
              {criticalCount} Critical
            </span>
          )}
        </div>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {
            label:  "ASU Energy Savings",
            value:  "11.4%",
            target: "Target 8–12%",
            pill:   "On target",
            pillColor: "bg-chart-2/10 text-chart-2",
            valueColor: "text-chart-2",
            border: "border-l-chart-2",
          },
          {
            label:  "H₂ Yield Improvement",
            value:  "6.8%",
            target: "Target 5–8%",
            pill:   "On target",
            pillColor: "bg-accent/10 text-accent",
            valueColor: "text-accent",
            border: "border-l-accent",
          },
          {
            label:  "Compressors Monitored",
            value:  "2,400",
            target: "73 anomalies flagged",
            pill:   null,
            pillColor: "",
            valueColor: "text-chart-3",
            border: "border-l-chart-3",
          },
          {
            label:  "Unplanned Failures",
            value:  "↓ 52%",
            target: "Target: 45% reduction",
            pill:   "Exceeded",
            pillColor: "bg-chart-2/10 text-chart-2",
            valueColor: "text-destructive",
            border: "border-l-destructive",
          },
        ].map((kpi) => (
          <Card key={kpi.label} className={cn("border-l-4 border-border bg-card rounded-l-none rounded-xs", kpi.border)}>
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
      <Tabs defaultValue="plants">
        <TabsList className="h-9 border border-border bg-muted/40 p-0.5 [&>[data-state=active]]:bg-card [&>[data-state=active]]:text-foreground [&>[data-state=active]]:shadow-sm [&>[data-state=active]]:border [&>[data-state=active]]:border-border">
          <TabsTrigger value="plants" className="gap-1.5 text-xs">
            <Factory className="h-3.5 w-3.5" />
            Plant Overview
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="gap-1.5 text-xs">
            <Wrench className="h-3.5 w-3.5" />
            Predictive Maintenance
            {criticalCount > 0 && (
              <span className="ml-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive/20 px-1 text-[9px] font-bold text-destructive">
                {criticalCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="energy" className="gap-1.5 text-xs">
            <Zap className="h-3.5 w-3.5" />
            Energy Optimisation
          </TabsTrigger>
          <TabsTrigger value="heatmap" className="gap-1.5 text-xs">
            <Gauge className="h-3.5 w-3.5" />
            AI Deployment
          </TabsTrigger>
        </TabsList>

        {/* ════════════════════════════════════════════════════════════════════
            PLANT OVERVIEW
        ════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="plants" className="mt-4">
          {/* FIX: added items-stretch so both columns match height */}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3 items-stretch">

            {/* Facility table */}
            <div className="xl:col-span-2">
              {/* FIX: h-full + flex flex-col so card fills the column height */}
              <Card className="border-border bg-card h-full flex flex-col">
                <CardHeader className="border-b border-border px-5 py-4 shrink-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">Facility Status</CardTitle>
                    <span className="text-[11px] text-muted-foreground">8 of 600+ facilities</span>
                  </div>
                </CardHeader>
                {/* FIX: flex-1 so table area expands to fill remaining card height */}
                <CardContent className="p-0 flex-1">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        {["Plant", "Type", "OEE", "Energy Saved", "Status"].map((h) => (
                          <TableHead key={h} className="h-9 px-5 text-[11px] font-semibold text-muted-foreground">
                            {h}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {PLANTS.map((p) => (
                        <TableRow key={p.id} className="border-border hover:bg-muted/30 cursor-default">
                          <TableCell className="px-5 py-3">
                            <span className="text-sm font-semibold text-accent">{p.id}</span>
                            <span className="ml-2 text-xs text-muted-foreground">{p.name}</span>
                          </TableCell>
                          <TableCell className="px-5 py-3">
                            <div className="flex items-center gap-1.5">
                              {p.type.includes("H₂") ? (
                                <FlaskConical className="h-3 w-3 text-chart-5" />
                              ) : p.type === "CO₂" ? (
                                <Wind className="h-3 w-3 text-muted-foreground" />
                              ) : (
                                <Factory className="h-3 w-3 text-muted-foreground" />
                              )}
                              <span className="text-xs text-muted-foreground">{p.type}</span>
                            </div>
                          </TableCell>
                          <TableCell className="px-5 py-3">
                            <div className="flex items-center gap-2.5">
                              <span className={cn("text-sm font-bold tabular-nums", oeeColor(p.oee))}>
                                {p.oee}%
                              </span>
                              <Progress value={p.oee} className="h-1 w-16" />
                            </div>
                          </TableCell>
                          <TableCell className="px-5 py-3">
                            {p.energy != null ? (
                              <span className="text-xs font-semibold text-chart-2">↓ {p.energy}%</span>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="px-5 py-3">
                            <PlantStatusBadge status={p.status} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* Right column — FIX: flex flex-col h-full so cards stack and fill height */}
            <div className="flex flex-col h-full gap-4">
              {/* AI Agents — FIX: flex-1 so it grows to fill space above the alert card */}
              <Card className="border-border bg-card flex-1">
                <CardHeader className="border-b border-border px-5 py-4">
                  <CardTitle className="text-sm font-semibold">AI Agents — Plant Ops</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {[
                    { name: "ASU Energy Optimizer",         task: "Electricity cost minimisation · 600+ plants", stat: "11.4%",    active: true,  statColor: "text-chart-2" },
                    { name: "Predictive Maintenance Agent", task: "Monitoring 2,400+ compressors",               stat: "73 alerts", active: true,  statColor: "text-chart-3" },
                    { name: "H₂ Yield Optimizer",           task: "Catalyst & process tuning",                   stat: "6.8%",     active: true,  statColor: "text-chart-5" },
                    { name: "DCS Anomaly Detector",         task: "Real-time sensor fusion",                     stat: "Running",  active: true,  statColor: "text-accent"  },
                    { name: "Shutdown Planner",             task: "Turnaround scheduling AI",                    stat: "Standby",  active: false, statColor: "text-muted-foreground" },
                  ].map((agent, i, arr) => (
                    <div
                      key={agent.name}
                      className={cn(
                        "flex items-center gap-3 px-5 py-3",
                        i < arr.length - 1 && "border-b border-border"
                      )}
                    >
                      <span
                        className={cn(
                          "h-1.5 w-1.5 shrink-0 rounded-full",
                          agent.active
                            ? "bg-chart-2 shadow-[0_0_6px_hsl(var(--chart-2))]"
                            : "bg-muted-foreground/30"
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-foreground">{agent.name}</p>
                        <p className="truncate text-[10px] text-muted-foreground">{agent.task}</p>
                      </div>
                      <span className={cn("shrink-0 text-[11px] font-bold tabular-nums", agent.statColor)}>
                        {agent.stat}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Critical alert CTA — shrink-0 keeps it at its natural height */}
              <Card className="border-destructive/30 bg-destructive/5 shrink-0">
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
                      <span className="text-sm font-semibold text-foreground">Critical Alert</span>
                    </div>
                    <Badge variant="outline" className="rounded-full border-transparent bg-destructive/10 text-[10px] text-destructive">
                      72 hr window
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Compressor C-7A · KA-07</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      Vibration anomaly detected. 73% failure probability. Immediate maintenance dispatch required.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-28 shrink-0 text-[10px] text-muted-foreground">Failure probability</span>
                    <Progress value={73} className="h-1.5 flex-1" />
                    <span className="w-8 shrink-0 text-right text-[10px] font-bold text-destructive">73%</span>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      className="h-7 flex-1 bg-chart-2 text-xs text-white hover:bg-chart-2/90"
                      onClick={() => dispatch("crit-main")}
                      disabled={dispatched.has("crit-main")}
                    >
                      {dispatched.has("crit-main") ? (
                        <><CheckCircle2 className="mr-1 h-3 w-3" />Dispatched</>
                      ) : (
                        "Dispatch Team"
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
            PREDICTIVE MAINTENANCE
        ════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="maintenance" className="mt-4">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">

            {/* Alert list */}
            <div className="xl:col-span-2 space-y-2.5">
              <div className="flex items-center justify-between pb-1">
                <p className="text-sm font-semibold text-foreground">
                  Active Alerts
                  <span className="ml-2 text-xs font-normal text-muted-foreground">73 total · top priority shown</span>
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline" className="border-transparent bg-destructive/10 text-[10px] text-destructive">
                    {criticalCount} Critical
                  </Badge>
                  <Badge variant="outline" className="border-transparent bg-chart-3/10 text-[10px] text-chart-3">
                    {warningCount} Warning
                  </Badge>
                </div>
              </div>

              {ALERTS.map((alert) => (
                <Card
                  key={alert.id}
                  className={cn(
                    "border-l-4 rounded-l-none rounded-xs border-border bg-card",
                    alert.severity === "critical" && "border-l-destructive",
                    alert.severity === "warning"  && "border-l-chart-3",
                    alert.severity === "info"     && "border-l-accent",
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <SeverityDot severity={alert.severity} />
                      <div className="min-w-0 flex-1 space-y-2">
                        {/* Title row */}
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <span className="text-sm font-semibold text-foreground">{alert.asset}</span>
                            <span className="mx-1.5 text-xs text-muted-foreground/50">·</span>
                            <span className="text-xs text-muted-foreground">{alert.plant}</span>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <SeverityBadge severity={alert.severity} />
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {alert.window}
                            </span>
                          </div>
                        </div>
                        {/* Issue */}
                        <p className="text-xs text-muted-foreground">{alert.issue}</p>
                        {/* Probability */}
                        <div className="flex items-center gap-2">
                          <span className="w-32 shrink-0 text-[10px] text-muted-foreground">Failure probability</span>
                          <Progress value={alert.probability} className="h-1 flex-1" />
                          <span
                            className={cn(
                              "w-8 shrink-0 text-right text-[10px] font-bold tabular-nums",
                              alert.severity === "critical" ? "text-destructive" :
                              alert.severity === "warning"  ? "text-chart-3" : "text-accent"
                            )}
                          >
                            {alert.probability}%
                          </span>
                        </div>
                        {/* Action row */}
                        <div className="flex items-center justify-between pt-0.5">
                          <p className="text-[11px] text-muted-foreground">
                            <span className="font-medium text-foreground">→ </span>
                            {alert.action}
                          </p>
                          {alert.severity !== "info" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 gap-1 px-2.5 text-[10px]"
                              onClick={() => dispatch(alert.id)}
                              disabled={dispatched.has(alert.id)}
                            >
                              {dispatched.has(alert.id) ? (
                                <><CheckCircle2 className="h-3 w-3 text-chart-2" />Dispatched</>
                              ) : (
                                <><ChevronRight className="h-3 w-3" />Approve</>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* PSM + Reliability */}
            <div className="space-y-4">
              <Card className="border-border bg-card">
                <CardHeader className="border-b border-border px-5 py-4">
                  <CardTitle className="text-sm font-semibold">PSM Compliance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 px-5 py-4">
                  {[
                    { label: "Compressors in spec", value: 96 },
                    { label: "Heat exchangers OK",  value: 91 },
                    { label: "Cryogenic units",     value: 88 },
                    { label: "Turbines nominal",    value: 94 },
                    { label: "Safety systems",      value: 100 },
                  ].map((row) => (
                    <div key={row.label} className="space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">{row.label}</span>
                        <span
                          className={cn(
                            "text-xs font-bold tabular-nums",
                            row.value >= 95 ? "text-chart-2" :
                            row.value >= 88 ? "text-chart-3" : "text-destructive"
                          )}
                        >
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
                  <CardTitle className="text-sm font-semibold">Reliability Metrics</CardTitle>
                </CardHeader>
                <CardContent className="px-5 py-4">
                  <div className="border-b border-border pb-4 text-center">
                    <p className="font-heading text-5xl font-bold tracking-tight text-destructive">↓52%</p>
                    <p className="mt-1 text-xs text-muted-foreground">Unplanned failures vs. baseline</p>
                    <p className="mt-0.5 text-[11px] font-semibold text-chart-2">Exceeding 45% target</p>
                  </div>
                  <div className="mt-4 space-y-3">
                    {[
                      { label: "MTBF improvement",          value: "+34%",    color: "text-chart-2"           },
                      { label: "Maintenance cost reduction", value: "−28%",   color: "text-chart-2"           },
                      { label: "AI prediction lead time",    value: "14 days", color: "text-foreground"       },
                      { label: "False positive rate",        value: "4.2%",   color: "text-muted-foreground" },
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
            ENERGY OPTIMISATION
        ════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="energy" className="mt-4">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">

            {/* Bar chart */}
            <div className="xl:col-span-2">
              <Card className="border-border bg-card">
                <CardHeader className="border-b border-border px-5 py-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">Energy Consumption vs. Baseline</CardTitle>
                    <span className="text-[11px] font-semibold text-chart-2">Avg saving 9.2%</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 px-5 py-5">
                  {[
                    { id: "KA-01 Bangalore North", actual: 87.9, saving: 12.1 },
                    { id: "GJ-11 Surat",           actual: 89.8, saving: 10.2 },
                    { id: "DL-02 Delhi NCR",        actual: 90.2, saving:  9.8 },
                    { id: "MH-04 Pune",             actual: 90.6, saving:  9.4 },
                    { id: "AP-03 Hyderabad",        actual: 91.1, saving:  8.9 },
                    { id: "TN-02 Chennai",          actual: 92.2, saving:  7.8 },
                    { id: "WB-05 Kolkata",          actual: 93.9, saving:  6.1 },
                  ].map((p) => (
                    <div key={p.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="w-44 truncate text-muted-foreground">{p.id}</span>
                        <span className="font-bold tabular-nums text-chart-2">↓ {p.saving}%</span>
                      </div>
                      <div className="flex h-5 overflow-hidden rounded-sm">
                        <div className="h-full bg-accent/30 transition-all duration-700" style={{ width: `${p.actual}%` }} />
                        <div className="h-full bg-chart-2/60 transition-all duration-700" style={{ width: `${p.saving}%` }} />
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center gap-5 pt-1 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block h-2.5 w-5 rounded-sm bg-accent/30" />
                      Actual consumption
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block h-2.5 w-5 rounded-sm bg-chart-2/60" />
                      Savings vs. baseline
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* KPIs + Agent */}
            <div className="space-y-4">
              <Card className="border-border bg-card">
                <CardHeader className="border-b border-border px-5 py-4">
                  <CardTitle className="text-sm font-semibold">Energy KPIs</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {[
                    { label: "Total saved (YTD)",    value: "₹18.4 Cr",  Icon: Zap,      color: "text-chart-2"           },
                    { label: "CO₂ reduction",        value: "−14,200 T", Icon: Wind,     color: "text-chart-2"           },
                    { label: "Peak shaving events",  value: "847",       Icon: Activity, color: "text-accent"            },
                    { label: "Off-peak utilisation", value: "73%",       Icon: Cpu,      color: "text-chart-3"           },
                    { label: "Cost per TPD",         value: "₹4,120",    Icon: Factory,  color: "text-foreground"        },
                  ].map((kpi, i, arr) => (
                    <div
                      key={kpi.label}
                      className={cn(
                        "flex items-center justify-between px-5 py-3.5",
                        i < arr.length - 1 && "border-b border-border"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <kpi.Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{kpi.label}</span>
                      </div>
                      <span className={cn("text-sm font-bold tabular-nums", kpi.color)}>{kpi.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardContent className="space-y-2 p-5">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-chart-2 shadow-[0_0_6px_hsl(var(--chart-2))]" />
                    <span className="text-xs font-semibold text-chart-2">ASU Energy Optimizer · Active</span>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Real-time tariff arbitrage across interruptible supply contracts. Shifts load to off-peak windows and coordinates with the demand agent for production scheduling.
                  </p>
                  <p className="pt-1 text-[11px] text-muted-foreground">
                    Last cycle: <span className="font-medium text-foreground">4 min ago</span>
                    <span className="mx-1.5 text-muted-foreground/40">·</span>
                    Next: <span className="font-medium text-foreground">~11 min</span>
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ════════════════════════════════════════════════════════════════════
            AI DEPLOYMENT HEATMAP
        ════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="heatmap" className="mt-4">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">

            {/* Grid */}
            <div className="xl:col-span-2">
              <Card className="border-border bg-card">
                <CardHeader className="border-b border-border px-5 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <CardTitle className="text-sm font-semibold">AI Deployment — India Network</CardTitle>
                    <div className="flex flex-wrap items-center gap-4 text-[10px] text-muted-foreground">
                      {[
                        { label: "AI Active",  cls: "bg-chart-2/70"      },
                        { label: "Monitoring", cls: "bg-accent/50"        },
                        { label: "Deploying",  cls: "bg-chart-3/50"      },
                        { label: "Planned",    cls: "bg-muted"            },
                        { label: "Alert",      cls: "bg-destructive/60"   },
                      ].map((l) => (
                        <span key={l.label} className="flex items-center gap-1.5">
                          <span className={cn("inline-block h-2.5 w-2.5 rounded-sm", l.cls)} />
                          {l.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 px-5 py-5">
                  {HEATMAP_REGIONS.map((region) => (
                    <div key={region.region}>
                      <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        {region.region}
                      </p>
                      <div className="grid grid-cols-8 gap-1.5">
                        {region.cells.map((cell) => {
                          const colorMap: Record<HeatmapStatus, string> = {
                            "ai-active":  "bg-chart-2/70 hover:bg-chart-2",
                            "monitoring": "bg-accent/50 hover:bg-accent/70",
                            "deploying":  "bg-chart-3/50 hover:bg-chart-3/70",
                            "planned":    "bg-muted hover:bg-muted/70",
                            "alert":      "bg-destructive/60 hover:bg-destructive/80 animate-pulse",
                          };
                          return (
                            <div
                              key={cell.id}
                              title={cell.id}
                              className={cn(
                                "aspect-square cursor-default rounded-sm transition-colors duration-150",
                                colorMap[cell.status]
                              )}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  <p className="text-[10px] text-muted-foreground">
                    32 representative facilities shown · Full network: 600+ plants
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Summary + Milestones */}
            <div className="space-y-4">
              <Card className="border-border bg-card">
                <CardHeader className="border-b border-border px-5 py-4">
                  <CardTitle className="text-sm font-semibold">Deployment Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 px-5 py-4">
                  {[
                    { label: "AI Active",  count: "347", pct: 57, bar: "bg-chart-2",              text: "text-chart-2"           },
                    { label: "Monitoring", count: "89",  pct: 15, bar: "bg-accent",               text: "text-accent"            },
                    { label: "Deploying",  count: "74",  pct: 12, bar: "bg-chart-3",              text: "text-chart-3"           },
                    { label: "Planned",    count: "94",  pct: 16, bar: "bg-muted-foreground/40",  text: "text-muted-foreground"  },
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
                  <CardTitle className="text-sm font-semibold">Rollout Milestones</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 px-5 py-4">
                  {[
                    { label: "Phase 1 — South India",    status: "complete", detail: "68 plants · Complete"   },
                    { label: "Phase 2 — West India",     status: "complete", detail: "112 plants · Complete"  },
                    { label: "Phase 3 — North India",    status: "active",   detail: "94 plants · In progress"},
                    { label: "Phase 4 — East India",     status: "planned",  detail: "Q3 2026"                },
                    { label: "Phase 5 — Global rollout", status: "planned",  detail: "2027"                   },
                  ].map((m) => (
                    <div key={m.label} className="flex items-start gap-3">
                      <div
                        className={cn(
                          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                          m.status === "complete" ? "bg-chart-2/20" :
                          m.status === "active"   ? "bg-accent/20"  : "bg-muted"
                        )}
                      >
                        {m.status === "complete" && <CheckCircle2 className="h-3 w-3 text-chart-2" />}
                        {m.status === "active"   && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />}
                        {m.status === "planned"  && <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-foreground">{m.label}</p>
                        <p className="text-[10px] text-muted-foreground">{m.detail}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}
