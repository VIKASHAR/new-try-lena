/**
 * Linde EOS — Finance & ERP View
 *
 * Context
 * -------
 * This is a React + TypeScript + Tailwind + shadcn/ui component for the
 * Linde EOS Enterprise AI Operating System. Design tokens come from the
 * project's global CSS variables (--background, --card, --border,
 * --foreground, --muted-foreground, --accent, --chart-2/3/5,
 * --destructive, etc.). All colours are referenced via those variables —
 * no hardcoded hex anywhere.
 *
 * NOTE: The prototype.html file supplied alongside this project was used
 * purely to understand the *data* and *information architecture* of this
 * view. Its CSS and styling are intentionally NOT carried over here; the
 * prototype was a quick throwaway and its styles would conflict with the
 * production token system described in the design document.
 *
 * Design goals
 * ------------
 * - Formal, professional, and clean — this is a C-suite financial view
 * - Information-dense without feeling cramped
 * - Consistent with the Manufacturing page pattern (metric cards with
 *   left border accent, tabbed sub-views, shadcn Table / Progress /
 *   Badge / Card primitives)
 * - All shadcn components are available and used where appropriate
 */

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
  DollarSign,
  RefreshCcw,
  BarChart3,
  CheckCircle2,
  Clock,
  ChevronRight,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────

type CloseStatus = "Completed" | "In Progress" | "Pending" | "Overdue";


// ── Static data ────────────────────────────────────────────────────────────────

const ROI_ROWS = [
  {
    domain: "ASU Energy Optimization",
    annualSaving: "$48M",
    npv5yr: "$220M",
    payback: "14 mo",
    savingVal: 48,
  },
  {
    domain: "Fleet Routing AI",
    annualSaving: "$32M",
    npv5yr: "$148M",
    payback: "18 mo",
    savingVal: 32,
  },
  {
    domain: "Predictive Maintenance",
    annualSaving: "$28M",
    npv5yr: "$130M",
    payback: "20 mo",
    savingVal: 28,
  },
  {
    domain: "Financial Close Automation",
    annualSaving: "$12M",
    npv5yr: "$56M",
    payback: "8 mo",
    savingVal: 12,
  },
  {
    domain: "IT Ticket Deflection",
    annualSaving: "$18M",
    npv5yr: "$84M",
    payback: "12 mo",
    savingVal: 18,
  },
] as const;


type CloseRecord = {
  period: string;
  entity: string;
  daysToClose: number;
  status: CloseStatus;
  reconciliations: string;
  agent: string;
};

const CLOSE_RECORDS: CloseRecord[] = [
  {
    period: "M03 2026",
    entity: "Linde India Ltd",
    daysToClose: 5.2,
    status: "Completed",
    reconciliations: "127 / 127",
    agent: "Finance Close Agent",
  },
  {
    period: "M03 2026",
    entity: "Linde APAC Holdings",
    daysToClose: 6.1,
    status: "Completed",
    reconciliations: "84 / 84",
    agent: "Finance Close Agent",
  },
  {
    period: "M03 2026",
    entity: "Linde Gas Germany GmbH",
    daysToClose: 4.8,
    status: "Completed",
    reconciliations: "203 / 203",
    agent: "Finance Close Agent",
  },
  {
    period: "M04 2026",
    entity: "Linde India Ltd",
    daysToClose: 3.1,
    status: "In Progress",
    reconciliations: "91 / 127",
    agent: "Finance Close Agent",
  },
  {
    period: "M04 2026",
    entity: "Linde APAC Holdings",
    daysToClose: 2.4,
    status: "In Progress",
    reconciliations: "41 / 84",
    agent: "Finance Close Agent",
  },
];

const TAKE_OR_PAY = [
  {
    customer: "Tata Steel Ltd",
    gas: "O₂",
    contractVolume: "240,000 m³/mo",
    actualVolume: "238,400 m³/mo",
    utilisation: 99,
    penalty: "—",
    status: "Compliant",
  },
  {
    customer: "ONGC Petro-additions",
    gas: "N₂",
    contractVolume: "180,000 m³/mo",
    actualVolume: "141,300 m³/mo",
    utilisation: 79,
    penalty: "₹18.4L",
    status: "Shortfall",
  },
  {
    customer: "ISRO Sriharikota",
    gas: "H₂",
    contractVolume: "12,000 m³/mo",
    actualVolume: "12,000 m³/mo",
    utilisation: 100,
    penalty: "—",
    status: "Compliant",
  },
  {
    customer: "Reliance Industries",
    gas: "N₂/O₂",
    contractVolume: "320,000 m³/mo",
    actualVolume: "304,000 m³/mo",
    utilisation: 95,
    penalty: "—",
    status: "Compliant",
  },
  {
    customer: "JSW Steel",
    gas: "O₂",
    contractVolume: "200,000 m³/mo",
    actualVolume: "152,000 m³/mo",
    utilisation: 76,
    penalty: "₹31.2L",
    status: "Shortfall",
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function closeStatusBadge(status: CloseStatus) {
  const map: Record<CloseStatus, string> = {
    Completed: "bg-chart-2/10 text-chart-2 border-transparent",
    "In Progress": "bg-accent/10 text-accent border-transparent",
    Pending: "bg-muted text-muted-foreground border-transparent",
    Overdue: "bg-destructive/10 text-destructive border-transparent",
  };
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[10px] font-semibold rounded-full px-2 py-0.5",
        map[status]
      )}
    >
      {status}
    </Badge>
  );
}


// ── Main Component ─────────────────────────────────────────────────────────────

export default function Finance() {
  const [approvedRows, setApprovedRows] = useState<Set<string>>(new Set());

  function approve(key: string) {
    setApprovedRows((prev) => new Set(prev).add(key));
  }

  return (
    <div className="space-y-6">

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            Finance &amp; ERP
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            SAP S/4HANA · Financial close · Take-or-pay · Intercompany reconciliation
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 pt-1">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-chart-2" />
            SAP Live
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-accent/10 px-2.5 py-1 text-[11px] font-semibold text-accent">
            <RefreshCcw className="h-3 w-3" />
            M04 Close Active
          </span>
        </div>
      </div>

      {/* ── KPI Cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {
            label: "Financial Close",
            value: "5.2 days",
            sub: "↓ from 9+ days baseline",
            subColor: "text-chart-2",
            pill: "Best ever",
            pillColor: "bg-chart-2/10 text-chart-2",
            valueColor: "text-chart-2",
            border: "border-l-chart-2",
            Icon: Clock,
          },
          {
            label: "IT Budget — Innovation",
            value: "48%",
            sub: "↑ from 42% baseline",
            subColor: "text-accent",
            pill: "On track",
            pillColor: "bg-accent/10 text-accent",
            valueColor: "text-accent",
            border: "border-l-accent",
            Icon: BarChart3,
          },
          {
            label: "Interco. Reconciliations",
            value: "94%",
            sub: "Automated this period",
            subColor: "text-chart-3",
            pill: null,
            pillColor: "",
            valueColor: "text-chart-3",
            border: "border-l-chart-3",
            Icon: RefreshCcw,
          },
          {
            label: "5-Year NPV (Projected)",
            value: "$840M",
            sub: "Baseline scenario",
            subColor: "text-chart-5",
            pill: "Confirmed",
            pillColor: "bg-chart-5/10 text-chart-5",
            valueColor: "text-chart-5",
            border: "border-l-chart-5",
            Icon: DollarSign,
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
              <div className="flex items-center gap-2 mb-2">
                <kpi.Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                  {kpi.label}
                </p>
              </div>
              <p
                className={cn(
                  "font-heading text-3xl font-bold tracking-tight",
                  kpi.valueColor
                )}
              >
                {kpi.value}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className={cn("text-xs", kpi.subColor)}>{kpi.sub}</span>
                {kpi.pill && (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      kpi.pillColor
                    )}
                  >
                    {kpi.pill}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <Tabs defaultValue="roi">
        <TabsList className="h-9 border border-border bg-muted/40 p-0.5 [&>[data-state=active]]:bg-card [&>[data-state=active]]:text-foreground [&>[data-state=active]]:shadow-sm [&>[data-state=active]]:border [&>[data-state=active]]:border-border">
          <TabsTrigger value="roi" className="gap-1.5 text-xs">
            <BarChart3 className="h-3.5 w-3.5" />
            ROI Analysis
          </TabsTrigger>
          <TabsTrigger value="close" className="gap-1.5 text-xs">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Financial Close
          </TabsTrigger>
         
          <TabsTrigger value="topay" className="gap-1.5 text-xs">
            <FileText className="h-3.5 w-3.5" />
            Take-or-Pay
          </TabsTrigger>
        </TabsList>

        {/* ══════════════════════════════════════════════════════════════════
            ROI ANALYSIS
        ══════════════════════════════════════════════════════════════════ */}
        <TabsContent value="roi" className="mt-4">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">

            {/* ROI Table */}
            <div className="xl:col-span-2">
              <Card className="border-border bg-card">
                <CardHeader className="border-b border-border px-5 py-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">
                      EOS Programme — ROI Summary
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="border-transparent bg-chart-2/10 text-[10px] text-chart-2"
                    >
                      16 mo avg payback
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        {["Domain", "Annual Saving", "5-Year NPV", "Payback", "Contribution"].map(
                          (h) => (
                            <TableHead
                              key={h}
                              className="h-9 px-5 text-[11px] font-semibold text-muted-foreground"
                            >
                              {h}
                            </TableHead>
                          )
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ROI_ROWS.map((row) => {
                        const pct = Math.round((row.savingVal / 138) * 100);
                        return (
                          <TableRow
                            key={row.domain}
                            className="border-border hover:bg-muted/30"
                          >
                            <TableCell className="px-5 py-3 text-sm font-medium text-foreground">
                              {row.domain}
                            </TableCell>
                            <TableCell className="px-5 py-3">
                              <span className="text-sm font-bold text-chart-2 tabular-nums">
                                {row.annualSaving}
                              </span>
                            </TableCell>
                            <TableCell className="px-5 py-3">
                              <span className="text-sm font-bold text-foreground tabular-nums">
                                {row.npv5yr}
                              </span>
                            </TableCell>
                            <TableCell className="px-5 py-3">
                              <span className="text-xs text-muted-foreground tabular-nums">
                                {row.payback}
                              </span>
                            </TableCell>
                            <TableCell className="px-5 py-3 w-32">
                              <div className="flex items-center gap-2">
                                <Progress value={pct} className="h-1 w-20" />
                                <span className="text-[10px] tabular-nums text-muted-foreground">
                                  {pct}%
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>

                  {/* Total row */}
                  <div className="border-t border-border bg-muted/20 px-5 py-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">Total</span>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Annual</p>
                        <p className="text-base font-bold text-chart-2 tabular-nums">$138M</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">5-Year NPV</p>
                        <p className="text-base font-bold text-chart-2 tabular-nums">$638M</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Avg Payback</p>
                        <p className="text-base font-bold text-foreground tabular-nums">16 mo</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right column — NPV + Finance Agent */}
            <div className="space-y-4">
              <Card className="border-border bg-card">
                <CardHeader className="border-b border-border px-5 py-4">
                  <CardTitle className="text-sm font-semibold">
                    NPV Breakdown (5-Year)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 px-5 py-4">
                  {ROI_ROWS.map((row) => {
                    const pct = Math.round((row.savingVal / 48) * 100);
                    return (
                      <div key={row.domain} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground truncate max-w-[140px]">
                            {row.domain}
                          </span>
                          <span className="font-normal text-foreground tabular-nums">
                            {row.npv5yr}
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-chart-2/70 transition-all duration-700"
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  <div className="pt-2 border-t border-border flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">
                      Total 5-Year NPV
                    </span>
                    <span className="text-lg font-bold text-chart-2 tabular-nums">
                      $638M
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Baseline scenario · 8% discount rate · FY2026–FY2031
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardContent className="space-y-2 p-5">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-chart-5 shadow-[0_0_6px_hsl(var(--chart-5))]" />
                    <span className="text-xs font-semibold text-chart-5">
                      Finance Close Agent · Active
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Automated intercompany reconciliation across all legal entities.
                    Handles take-or-pay accruals, energy cost pass-through, and
                    SAP journal entry generation without manual intervention.
                  </p>
                  <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
                    <span>
                      Reconciled:{" "}
                      <span className="font-medium text-foreground">
                        414 / 498
                      </span>
                    </span>
                    <span>
                      Next cycle:{" "}
                      <span className="font-medium text-foreground">~6 min</span>
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ══════════════════════════════════════════════════════════════════
            FINANCIAL CLOSE
        ══════════════════════════════════════════════════════════════════ */}
        <TabsContent value="close" className="mt-4">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">

            {/* Close records table */}
            <div className="xl:col-span-2 space-y-4">
              <Card className="border-border bg-card">
                <CardHeader className="border-b border-border px-5 py-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">
                      Close Status by Entity
                    </CardTitle>
                    <div className="flex gap-2">
                      <Badge
                        variant="outline"
                        className="border-transparent bg-chart-2/10 text-[10px] text-chart-2"
                      >
                        3 Completed
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-transparent bg-accent/10 text-[10px] text-accent"
                      >
                        2 In Progress
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        {["Period", "Entity", "Days to Close", "Status", "Reconciliations", ""].map(
                          (h) => (
                            <TableHead
                              key={h}
                              className="h-9 px-5 text-[11px] font-semibold text-muted-foreground"
                            >
                              {h}
                            </TableHead>
                          )
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {CLOSE_RECORDS.map((rec, i) => {
                        const key = `close-${i}`;
                        const isComplete = rec.status === "Completed";
                        return (
                          <TableRow
                            key={key}
                            className="border-border hover:bg-muted/30"
                          >
                            <TableCell className="px-5 py-3 text-xs text-muted-foreground tabular-nums">
                              {rec.period}
                            </TableCell>
                            <TableCell className="px-5 py-3 text-sm font-medium text-foreground">
                              {rec.entity}
                            </TableCell>
                            <TableCell className="px-5 py-3">
                              <span
                                className={cn(
                                  "text-sm font-bold tabular-nums",
                                  rec.daysToClose <= 6
                                    ? "text-chart-2"
                                    : "text-chart-3"
                                )}
                              >
                                {rec.daysToClose}d
                              </span>
                            </TableCell>
                            <TableCell className="px-5 py-3">
                              {closeStatusBadge(rec.status)}
                            </TableCell>
                            <TableCell className="px-5 py-3 text-xs text-muted-foreground tabular-nums">
                              {rec.reconciliations}
                            </TableCell>
                            <TableCell className="px-5 py-3">
                              {!isComplete && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-6 gap-1 px-2.5 text-[10px]"
                                  onClick={() => approve(key)}
                                  disabled={approvedRows.has(key)}
                                >
                                  {approvedRows.has(key) ? (
                                    <>
                                      <CheckCircle2 className="h-3 w-3 text-chart-2" />
                                      Approved
                                    </>
                                  ) : (
                                    <>
                                      <ChevronRight className="h-3 w-3" />
                                      Review
                                    </>
                                  )}
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Automation stats */}
              <Card className="border-border bg-card">
                <CardHeader className="border-b border-border px-5 py-4">
                  <CardTitle className="text-sm font-semibold">
                    Intercompany Reconciliation — Automation Rate
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 px-5 py-4">
                  {[
                    { label: "Journal Entries Auto-posted", value: 94, color: "bg-chart-2" },
                    { label: "Take-or-Pay Accruals", value: 88, color: "bg-accent" },
                    { label: "Energy Cost Pass-through", value: 100, color: "bg-chart-2" },
                    { label: "Intercompany Eliminations", value: 91, color: "bg-chart-3" },
                    { label: "Tax Provision Calculation", value: 72, color: "bg-chart-3" },
                  ].map((item) => (
                    <div key={item.label} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span
                          className={cn(
                            "font-bold tabular-nums",
                            item.value >= 90
                              ? "text-chart-2"
                              : item.value >= 75
                              ? "text-chart-3"
                              : "text-muted-foreground"
                          )}
                        >
                          {item.value}%
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-700",
                            item.color
                          )}
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Right — close performance */}
            <div className="space-y-4">
              <Card className="border-border bg-card">
                <CardHeader className="border-b border-border px-5 py-4">
                  <CardTitle className="text-sm font-semibold">
                    Close Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 py-5">
                  <div className="border-b border-border pb-4 text-center">
                    <p className="font-heading text-5xl font-bold tracking-tight text-chart-2">
                      5.2d
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Average days to close — M03 2026
                    </p>
                    <div className="mt-1 flex items-center justify-center gap-1">
                      <ArrowDownRight className="h-3.5 w-3.5 text-chart-2" />
                      <span className="text-[11px] font-semibold text-chart-2">
                        ↓ 3.8 days vs baseline
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    {[
                      {
                        label: "Baseline (pre-AI)",
                        value: "9+ days",
                        color: "text-destructive",
                      },
                      {
                        label: "Target (SLA)",
                        value: "≤ 5 days",
                        color: "text-chart-3",
                      },
                      {
                        label: "M03 Achieved",
                        value: "5.2 days",
                        color: "text-chart-2",
                      },
                      {
                        label: "Manual interventions",
                        value: "6%",
                        color: "text-muted-foreground",
                      },
                      {
                        label: "SAP journal errors",
                        value: "0.3%",
                        color: "text-chart-2",
                      },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="flex items-center justify-between"
                      >
                        <span className="text-xs text-muted-foreground">
                          {s.label}
                        </span>
                        <span
                          className={cn(
                            "text-xs font-bold tabular-nums",
                            s.color
                          )}
                        >
                          {s.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader className="border-b border-border px-5 py-4">
                  <CardTitle className="text-sm font-semibold">
                    AI Agents — Finance
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {[
                    {
                      name: "Finance Close Agent",
                      task: "Intercompany reconciliation · SAP auto-posting",
                      stat: "Active",
                      statColor: "text-chart-2",
                      active: true,
                    },
                    {
                      name: "Take-or-Pay Monitor",
                      task: "Contract volume tracking · Penalty accruals",
                      stat: "Active",
                      statColor: "text-chart-2",
                      active: true,
                    },
                    {
                      name: "Budget Variance Agent",
                      task: "FP&A anomaly detection",
                      stat: "Active",
                      statColor: "text-accent",
                      active: true,
                    },
                    {
                      name: "Tax Provision Agent",
                      task: "Deferred tax & transfer pricing",
                      stat: "Standby",
                      statColor: "text-muted-foreground",
                      active: false,
                    },
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
                        <p className="truncate text-xs font-medium text-foreground">
                          {agent.name}
                        </p>
                        <p className="truncate text-[10px] text-muted-foreground">
                          {agent.task}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 text-[11px] font-bold tabular-nums",
                          agent.statColor
                        )}
                      >
                        {agent.stat}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

      
        {/* ══════════════════════════════════════════════════════════════════
            TAKE-OR-PAY
        ══════════════════════════════════════════════════════════════════ */}
        <TabsContent value="topay" className="mt-4">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">

            {/* Contract table */}
            <div className="xl:col-span-2">
              <Card className="border-border bg-card">
                <CardHeader className="border-b border-border px-5 py-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">
                      Take-or-Pay Contract Monitor
                    </CardTitle>
                    <div className="flex gap-2">
                      <Badge
                        variant="outline"
                        className="border-transparent bg-chart-2/10 text-[10px] text-chart-2"
                      >
                        3 Compliant
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-transparent bg-destructive/10 text-[10px] text-destructive"
                      >
                        2 Shortfall
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        {[
                          "Customer",
                          "Gas",
                          "Contract Vol.",
                          "Actual Vol.",
                          "Utilisation",
                          "Penalty",
                          "Status",
                        ].map((h) => (
                          <TableHead
                            key={h}
                            className="h-9 px-5 text-[11px] font-semibold text-muted-foreground"
                          >
                            {h}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {TAKE_OR_PAY.map((row) => (
                        <TableRow
                          key={row.customer}
                          className="border-border hover:bg-muted/30"
                        >
                          <TableCell className="px-5 py-3 text-sm font-medium text-foreground">
                            {row.customer}
                          </TableCell>
                          <TableCell className="px-5 py-3 text-xs text-muted-foreground">
                            {row.gas}
                          </TableCell>
                          <TableCell className="px-5 py-3 text-xs text-muted-foreground tabular-nums">
                            {row.contractVolume}
                          </TableCell>
                          <TableCell className="px-5 py-3 text-xs text-muted-foreground tabular-nums">
                            {row.actualVolume}
                          </TableCell>
                          <TableCell className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "text-sm font-bold tabular-nums",
                                  row.utilisation >= 90
                                    ? "text-chart-2"
                                    : row.utilisation >= 80
                                    ? "text-chart-3"
                                    : "text-destructive"
                                )}
                              >
                                {row.utilisation}%
                              </span>
                              <Progress
                                value={row.utilisation}
                                className="h-1 w-14"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="px-5 py-3">
                            <span
                              className={cn(
                                "text-xs font-semibold tabular-nums",
                                row.penalty !== "—"
                                  ? "text-destructive"
                                  : "text-muted-foreground"
                              )}
                            >
                              {row.penalty}
                            </span>
                          </TableCell>
                          <TableCell className="px-5 py-3">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px] font-semibold rounded-full px-2 py-0.5 border-transparent",
                                row.status === "Compliant"
                                  ? "bg-chart-2/10 text-chart-2"
                                  : "bg-destructive/10 text-destructive"
                              )}
                            >
                              {row.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* Right — penalty summary + AI agent */}
            <div className="space-y-4">
              <Card className="border-border bg-card">
                <CardHeader className="border-b border-border px-5 py-4">
                  <CardTitle className="text-sm font-semibold">
                    Penalty Exposure
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 py-5 space-y-3">
                  <div className="text-center border-b border-border pb-4">
                    <p className="font-heading text-4xl font-bold tracking-tight text-destructive">
                      ₹49.6L
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Total take-or-pay shortfall exposure
                    </p>
                    <p className="mt-0.5 text-[11px] text-chart-3">
                      2 contracts below minimum offtake
                    </p>
                  </div>
                  {[
                    {
                      label: "ONGC Petro-additions",
                      value: "₹18.4L",
                      pct: 79,
                    },
                    { label: "JSW Steel", value: "₹31.2L", pct: 76 },
                  ].map((item) => (
                    <div key={item.label} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="font-bold text-destructive tabular-nums">
                          {item.value}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={item.pct} className="h-1 flex-1" />
                        <span className="text-[10px] text-destructive font-semibold tabular-nums w-8 text-right">
                          {item.pct}%
                        </span>
                      </div>
                    </div>
                  ))}
                  <div className="pt-1">
                    <Button
                      size="sm"
                      className="w-full h-7 text-xs bg-chart-2 text-white hover:bg-chart-2/90"
                    >
                      <ArrowUpRight className="mr-1 h-3 w-3" />
                      Initiate Retention Actions
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader className="border-b border-border px-5 py-4">
                  <CardTitle className="text-sm font-semibold">
                    Contract Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {[
                    {
                      label: "Active contracts",
                      value: "127",
                      color: "text-foreground",
                    },
                    {
                      label: "Total annual value",
                      value: "₹4,840 Cr",
                      color: "text-chart-2",
                    },
                    {
                      label: "Auto-accrued (AI)",
                      value: "88%",
                      color: "text-chart-2",
                    },
                    {
                      label: "Pending renewal (90d)",
                      value: "14",
                      color: "text-chart-3",
                    },
                    {
                      label: "Dispute in progress",
                      value: "2",
                      color: "text-destructive",
                    },
                  ].map((item, i, arr) => (
                    <div
                      key={item.label}
                      className={cn(
                        "flex items-center justify-between px-5 py-3.5",
                        i < arr.length - 1 && "border-b border-border"
                      )}
                    >
                      <span className="text-xs text-muted-foreground">
                        {item.label}
                      </span>
                      <span
                        className={cn(
                          "text-sm font-bold tabular-nums",
                          item.color
                        )}
                      >
                        {item.value}
                      </span>
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
