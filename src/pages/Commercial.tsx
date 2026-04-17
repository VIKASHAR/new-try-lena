/**
 * Linde EOS — Commercial & Trading View
 *
 * Context
 * -------
 * React + TypeScript + Tailwind + shadcn/ui component for the
 * Linde EOS Enterprise AI Operating System.
 *
 * Design tokens come from the project's global CSS variables only —
 * no hardcoded hex anywhere. Consistent with Manufacturing.tsx and
 * Finance.tsx patterns: left-border KPI cards, tabbed sub-views,
 * shadcn Table / Progress / Badge / Card / Tabs / Button primitives.
 *
 * NOTE: prototype.html was referenced purely for data / information
 * architecture. Its CSS is intentionally NOT used here.
 *
 * Design goals
 * ------------
 * - Formal, professional, and clean — C-suite commercial view
 * - Consistent with the rest of the EOS design system
 * - All shadcn components used where appropriate
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
  TrendingUp,
  Users,
  FlaskConical,
  DollarSign,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Zap,
  BarChart3,
  Target,
  RefreshCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────

type ChurnLevel = "High" | "Medium" | "Low";
type ContractStatus = "Active" | "Renewal Due" | "At Risk" | "New";

// ── Data ───────────────────────────────────────────────────────────────────────

type ChurnRecord = {
  customer: string;
  segment: string;
  gas: string;
  churnPct: number;
  level: ChurnLevel;
  annualValue: string;
  action: string;
  actionType: "danger" | "warn" | "positive";
};

const CHURN_DATA: ChurnRecord[] = [
  {
    customer: "Tata Steel Ltd",
    segment: "Bulk",
    gas: "O₂",
    churnPct: 78,
    level: "High",
    annualValue: "₹420 Cr",
    action: "Retain",
    actionType: "danger",
  },
  {
    customer: "Mahindra Auto",
    segment: "Packaged",
    gas: "N₂",
    churnPct: 45,
    level: "Medium",
    annualValue: "₹84 Cr",
    action: "Monitor",
    actionType: "warn",
  },
  {
    customer: "SAIL (Bhilai)",
    segment: "On-Site",
    gas: "O₂/N₂",
    churnPct: 41,
    level: "Medium",
    annualValue: "₹310 Cr",
    action: "Review",
    actionType: "warn",
  },
  {
    customer: "Reliance Industries",
    segment: "Bulk",
    gas: "N₂/O₂",
    churnPct: 34,
    level: "Medium",
    annualValue: "₹680 Cr",
    action: "Review",
    actionType: "warn",
  },
  {
    customer: "ISRO Sriharikota",
    segment: "On-Site",
    gas: "H₂",
    churnPct: 12,
    level: "Low",
    annualValue: "₹62 Cr",
    action: "Upsell",
    actionType: "positive",
  },
  {
    customer: "ONGC Petro-additions",
    segment: "Bulk",
    gas: "N₂",
    churnPct: 8,
    level: "Low",
    annualValue: "₹290 Cr",
    action: "Upsell",
    actionType: "positive",
  },
];

type ContractRecord = {
  id: string;
  customer: string;
  gas: string;
  type: string;
  annualValue: string;
  renewalDate: string;
  margin: string;
  status: ContractStatus;
};

const CONTRACTS: ContractRecord[] = [
  {
    id: "C-4421",
    customer: "Tata Steel Ltd",
    gas: "O₂",
    type: "Bulk Supply",
    annualValue: "₹420 Cr",
    renewalDate: "Jun 2026",
    margin: "24.1%",
    status: "At Risk",
  },
  {
    id: "C-3381",
    customer: "Reliance Industries",
    gas: "N₂/O₂",
    type: "Bulk Supply",
    annualValue: "₹680 Cr",
    renewalDate: "Sep 2026",
    margin: "28.9%",
    status: "Renewal Due",
  },
  {
    id: "C-2219",
    customer: "ISRO Sriharikota",
    gas: "H₂",
    type: "On-Site",
    annualValue: "₹62 Cr",
    renewalDate: "Dec 2027",
    margin: "31.2%",
    status: "Active",
  },
  {
    id: "C-5502",
    customer: "SAIL (Bhilai)",
    gas: "O₂/N₂",
    type: "On-Site",
    annualValue: "₹310 Cr",
    renewalDate: "Mar 2027",
    margin: "22.4%",
    status: "Active",
  },
  {
    id: "C-6671",
    customer: "Adani Green Energy",
    gas: "H₂",
    type: "Merchant",
    annualValue: "₹144 Cr",
    renewalDate: "Jan 2028",
    margin: "34.7%",
    status: "New",
  },
  {
    id: "C-7712",
    customer: "JSW Steel",
    gas: "O₂",
    type: "Bulk Supply",
    annualValue: "₹210 Cr",
    renewalDate: "Aug 2026",
    margin: "21.8%",
    status: "Renewal Due",
  },
];

const H2_SEGMENTS = [
  {
    segment: "Green H₂ — Refineries",
    volume: "48,000 m³/mo",
    pricing: "₹9.40 / m³",
    growth: "+142%",
    customers: 8,
    trend: "up",
  },
  {
    segment: "Industrial H₂ — Steel",
    volume: "120,000 m³/mo",
    pricing: "₹6.20 / m³",
    growth: "+38%",
    customers: 14,
    trend: "up",
  },
  {
    segment: "Mobility H₂ — Transport",
    volume: "12,000 m³/mo",
    pricing: "₹11.80 / m³",
    growth: "+224%",
    customers: 3,
    trend: "up",
  },
  {
    segment: "Space / Defence",
    volume: "8,400 m³/mo",
    pricing: "₹18.20 / m³",
    growth: "+12%",
    customers: 2,
    trend: "stable",
  },
];

// ── Pricing engine state ───────────────────────────────────────────────────────

const PRICING_MAP: Record<string, Record<string, { price: string; margin: string; score: number; risk: string }>> = {
  "Oxygen (O₂)": {
    "Bulk Supply":   { price: "£4.82", margin: "28.4%", score: 82, risk: "Low" },
    "On-Site":       { price: "£3.91", margin: "31.2%", score: 78, risk: "Low" },
    "Packaged":      { price: "£7.40", margin: "24.1%", score: 71, risk: "Medium" },
    "Merchant":      { price: "£5.60", margin: "26.7%", score: 75, risk: "Low" },
  },
  "Nitrogen (N₂)": {
    "Bulk Supply":   { price: "£3.20", margin: "22.8%", score: 79, risk: "Low" },
    "On-Site":       { price: "£2.74", margin: "29.4%", score: 84, risk: "Low" },
    "Packaged":      { price: "£5.80", margin: "21.3%", score: 68, risk: "Medium" },
    "Merchant":      { price: "£4.10", margin: "24.0%", score: 72, risk: "Low" },
  },
  "Hydrogen (H₂)": {
    "Bulk Supply":   { price: "₹6.20", margin: "33.1%", score: 88, risk: "Low" },
    "On-Site":       { price: "₹9.40", margin: "36.8%", score: 91, risk: "Low" },
    "Packaged":      { price: "₹11.80", margin: "29.5%", score: 83, risk: "Low" },
    "Merchant":      { price: "₹8.60", margin: "31.4%", score: 86, risk: "Low" },
  },
  "Argon (Ar)": {
    "Bulk Supply":   { price: "₹14.20", margin: "38.4%", score: 76, risk: "Medium" },
    "On-Site":       { price: "₹11.90", margin: "42.1%", score: 80, risk: "Low" },
    "Packaged":      { price: "₹18.40", margin: "35.7%", score: 69, risk: "Medium" },
    "Merchant":      { price: "₹15.60", margin: "37.2%", score: 74, risk: "Medium" },
  },
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function churnBadge(level: ChurnLevel, pct: number) {
  const styles: Record<ChurnLevel, string> = {
    High:   "bg-destructive/10 text-destructive border-transparent",
    Medium: "bg-chart-3/10 text-chart-3 border-transparent",
    Low:    "bg-chart-2/10 text-chart-2 border-transparent",
  };
  return (
    <Badge
      variant="outline"
      className={cn("text-[10px] font-semibold rounded-full px-2 py-0.5", styles[level])}
    >
      {level} {pct}%
    </Badge>
  );
}

function contractStatusBadge(status: ContractStatus) {
  const styles: Record<ContractStatus, string> = {
    Active:       "bg-chart-2/10 text-chart-2 border-transparent",
    "Renewal Due":"bg-chart-3/10 text-chart-3 border-transparent",
    "At Risk":    "bg-destructive/10 text-destructive border-transparent",
    New:          "bg-chart-5/10 text-chart-5 border-transparent",
  };
  return (
    <Badge
      variant="outline"
      className={cn("text-[10px] font-semibold rounded-full px-2 py-0.5", styles[status])}
    >
      {status}
    </Badge>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function Commercial() {
  const [gasType, setGasType]           = useState("Oxygen (O₂)");
  const [contractType, setContractType] = useState("Bulk Supply");
  const [dispatched, setDispatched]     = useState<Set<string>>(new Set());

  const pricing = PRICING_MAP[gasType]?.[contractType] ?? PRICING_MAP["Oxygen (O₂)"]["Bulk Supply"];

  function dispatch(key: string) {
    setDispatched((prev) => new Set(prev).add(key));
  }

  const highChurn   = CHURN_DATA.filter((r) => r.level === "High").length;
  const mediumChurn = CHURN_DATA.filter((r) => r.level === "Medium").length;

  return (
    <div className="space-y-6">

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            Commercial &amp; Trading
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            AI pricing engine · Customer analytics · Hydrogen economy · Section 3.1.3
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 pt-1">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-chart-2" />
            Pricing Engine Live
          </span>
          {highChurn > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-destructive/10 px-2.5 py-1 text-[11px] font-semibold text-destructive">
              <AlertTriangle className="h-3 w-3" />
              {highChurn} High Churn Risk
            </span>
          )}
        </div>
      </div>

      {/* ── KPI Cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {
            label:      "Contract Win Rate",
            value:      "68%",
            sub:        "↑ 14% vs manual pricing",
            subColor:   "text-chart-2",
            pill:       "On track",
            pillColor:  "bg-chart-2/10 text-chart-2",
            valueColor: "text-chart-2",
            border:     "border-l-chart-2",
            Icon:       TrendingUp,
          },
          {
            label:      "Churn Predicted (30d)",
            value:      "23",
            sub:        "Retention actions queued",
            subColor:   "text-chart-3",
            pill:       null,
            pillColor:  "",
            valueColor: "text-chart-3",
            border:     "border-l-chart-3",
            Icon:       Users,
          },
          {
            label:      "H₂ Pricing Accuracy",
            value:      "87%",
            sub:        "New segment model",
            subColor:   "text-chart-5",
            pill:       "Improved",
            pillColor:  "bg-chart-5/10 text-chart-5",
            valueColor: "text-chart-5",
            border:     "border-l-chart-5",
            Icon:       FlaskConical,
          },
          {
            label:      "AI Revenue Impact (YTD)",
            value:      "₹184 Cr",
            sub:        "Across 127 contracts",
            subColor:   "text-accent",
            pill:       "Exceeded",
            pillColor:  "bg-accent/10 text-accent",
            valueColor: "text-accent",
            border:     "border-l-accent",
            Icon:       DollarSign,
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
              <p className={cn("font-heading text-3xl font-bold tracking-tight", kpi.valueColor)}>
                {kpi.value}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className={cn("text-xs", kpi.subColor)}>{kpi.sub}</span>
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

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <Tabs defaultValue="pricing">
        <TabsList className="h-9 border border-border bg-muted/40 p-0.5 [&>[data-state=active]]:bg-card [&>[data-state=active]]:text-foreground [&>[data-state=active]]:shadow-sm [&>[data-state=active]]:border [&>[data-state=active]]:border-border">
          <TabsTrigger value="pricing" className="gap-1.5 text-xs">
            <Zap className="h-3.5 w-3.5" />
            AI Pricing Engine
          </TabsTrigger>
          <TabsTrigger value="churn" className="gap-1.5 text-xs">
            <Users className="h-3.5 w-3.5" />
            Churn Prediction
            {highChurn > 0 && (
              <span className="ml-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive/20 px-1 text-[9px] font-bold text-destructive">
                {highChurn}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="contracts" className="gap-1.5 text-xs">
            <BarChart3 className="h-3.5 w-3.5" />
            Contract Portfolio
          </TabsTrigger>
          <TabsTrigger value="hydrogen" className="gap-1.5 text-xs">
            <FlaskConical className="h-3.5 w-3.5" />
            Hydrogen Economy
          </TabsTrigger>
        </TabsList>

        {/* ══════════════════════════════════════════════════════════════════
            AI PRICING ENGINE
        ══════════════════════════════════════════════════════════════════ */}
        <TabsContent value="pricing" className="mt-4">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">

            {/* Pricing configurator */}
            <div className="xl:col-span-2 space-y-4">
              <Card className="border-border bg-card">
                <CardHeader className="border-b border-border px-5 py-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">Pricing Configuration</CardTitle>
                    <Badge variant="outline" className="border-transparent bg-chart-2/10 text-[10px] text-chart-2">
                      Live
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-5 space-y-5">
                  {/* Selectors */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                        Gas Type
                      </label>
                      <select
                        value={gasType}
                        onChange={(e) => setGasType(e.target.value)}
                        className="w-full rounded-md border border-border bg-popover px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        {Object.keys(PRICING_MAP).map((g) => (
                          <option key={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                        Contract Type
                      </label>
                      <select
                        value={contractType}
                        onChange={(e) => setContractType(e.target.value)}
                        className="w-full rounded-md border border-border bg-popover px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        {Object.keys(PRICING_MAP["Oxygen (O₂)"]).map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                        Volume (m³/month)
                      </label>
                      <input
                        type="number"
                        defaultValue={50000}
                        className="w-full rounded-md border border-border bg-popover px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                        Contract Duration
                      </label>
                      <select className="w-full rounded-md border border-border bg-popover px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
                        <option>1 Year</option>
                        <option>3 Years</option>
                        <option>5 Years</option>
                      </select>
                    </div>
                  </div>

                  {/* Result panel */}
                  <div className="rounded-md border border-border bg-muted/30 px-5 py-4 space-y-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                      AI Recommended Pricing
                    </p>
                    <p className="font-heading text-4xl font-bold tracking-tight text-chart-2">
  {pricing.price} / m³
</p>
                    <p className="text-xs text-muted-foreground">
                      Energy pass-through included · Margin: {pricing.margin} · Risk-adjusted
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <Badge
                        variant="outline"
                        className={cn(
                          "border-transparent text-[10px] font-semibold",
                          pricing.score >= 80
                            ? "bg-chart-2/10 text-chart-2"
                            : pricing.score >= 65
                            ? "bg-chart-3/10 text-chart-3"
                            : "bg-destructive/10 text-destructive"
                        )}
                      >
                        Competitive Score: {pricing.score}/100
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn(
                          "border-transparent text-[10px] font-semibold",
                          pricing.risk === "Low"
                            ? "bg-accent/10 text-accent"
                            : "bg-chart-3/10 text-chart-3"
                        )}
                      >
                        Churn Risk: {pricing.risk}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button size="sm" className="h-8 flex-1 bg-primary text-xs text-primary-foreground hover:bg-primary/90">
                      <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                      Apply to Quote
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 border-border text-xs">
                      <RefreshCcw className="mr-1.5 h-3.5 w-3.5" />
                      Re-run Model
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* All-gas pricing matrix */}
              <Card className="border-border bg-card">
                <CardHeader className="border-b border-border px-5 py-4">
                  <CardTitle className="text-sm font-semibold">
                    Pricing Matrix — Bulk Supply (Current Quarter)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        {["Gas", "AI Price", "Margin", "Comp. Score", "Trend"].map((h) => (
                          <TableHead key={h} className="h-9 px-5 text-[11px] font-semibold text-muted-foreground">
                            {h}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        { gas: "Oxygen (O₂)",   price: "£4.82 / m³", margin: "28.4%", score: 82, trend: "+2.1%", color: "text-chart-2" },
                        { gas: "Nitrogen (N₂)", price: "£3.20 / m³", margin: "22.8%", score: 79, trend: "+0.8%", color: "text-chart-2" },
                        { gas: "Hydrogen (H₂)", price: "£6.20 / m³", margin: "33.1%", score: 88, trend: "+8.4%", color: "text-chart-5" },
                        { gas: "Argon (Ar)",    price: "£14.20 / m³", margin: "38.4%", score: 76, trend: "+1.2%", color: "text-chart-3" },
                        { gas: "CO₂",           price: "£2.40 / m³", margin: "19.2%", score: 71, trend: "−0.4%", color: "text-muted-foreground" },
                      ].map((row) => (
                        <TableRow key={row.gas} className="border-border hover:bg-muted/30">
                          <TableCell className="px-5 py-3 text-sm font-medium text-foreground">
                            {row.gas}
                          </TableCell>
                          <TableCell className="px-5 py-3">
                            <span className={cn("text-sm font-bold tabular-nums", row.color)}>
                              {row.price}
                            </span>
                          </TableCell>
                          <TableCell className="px-5 py-3 text-xs text-muted-foreground tabular-nums">
                            {row.margin}
                          </TableCell>
                          <TableCell className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <Progress value={row.score} className="h-1 w-14" />
                              <span className="text-[10px] tabular-nums text-muted-foreground">
                                {row.score}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="px-5 py-3">
                            <span className={cn(
                              "text-xs font-semibold tabular-nums",
                              row.trend.startsWith("+") ? "text-chart-2" : "text-destructive"
                            )}>
                              {row.trend}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* Right — AI agent + win rate */}
            <div className="space-y-4">
              <Card className="border-border bg-card">
                <CardHeader className="border-b border-border px-5 py-4">
                  <CardTitle className="text-sm font-semibold">Pricing Agent</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 p-5">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-chart-2 shadow-[0_0_6px_hsl(var(--chart-2))]" />
                    <span className="text-xs font-semibold text-chart-2">
                      Commercial Pricing Agent · Active
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Real-time tariff benchmarking across competitors. Incorporates
                    energy cost pass-through, take-or-pay history, churn risk score,
                    and margin floor rules to generate risk-adjusted quotes.
                  </p>
                  <div className="pt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Last recalculation: <span className="font-medium text-foreground">3 min ago</span></span>
                    <span>Quotes today: <span className="font-medium text-foreground">47</span></span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader className="border-b border-border px-5 py-4">
                  <CardTitle className="text-sm font-semibold">Win Rate Trend</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 px-5 py-4">
                  <div className="border-b border-border pb-4 text-center">
                    <p className="font-heading text-5xl font-bold tracking-tight text-chart-2">68%</p>
                    <p className="mt-1 text-xs text-muted-foreground">Contract win rate — Q1 2026</p>
                    <p className="mt-0.5 text-[11px] font-semibold text-chart-2">↑ 14% vs manual baseline</p>
                  </div>
                  {[
                    { label: "Bulk supply bids won",     value: "72%", color: "text-chart-2" },
                    { label: "On-site contracts won",    value: "81%", color: "text-chart-2" },
                    { label: "Packaged gas won",         value: "54%", color: "text-chart-3" },
                    { label: "H₂ contracts won",        value: "89%", color: "text-chart-5" },
                    { label: "Avg. quote turnaround",   value: "4.2 hr", color: "text-foreground" },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{s.label}</span>
                      <span className={cn("text-xs font-bold tabular-nums", s.color)}>
                        {s.value}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ══════════════════════════════════════════════════════════════════
            CHURN PREDICTION
        ══════════════════════════════════════════════════════════════════ */}
        <TabsContent value="churn" className="mt-4">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">

            {/* Churn table */}
            <div className="xl:col-span-2 space-y-2.5">
              <div className="flex items-center justify-between pb-1">
                <p className="text-sm font-semibold text-foreground">
                  Customer Churn Risk
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    23 at-risk accounts · 30-day window
                  </span>
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline" className="border-transparent bg-destructive/10 text-[10px] text-destructive">
                    {highChurn} High
                  </Badge>
                  <Badge variant="outline" className="border-transparent bg-chart-3/10 text-[10px] text-chart-3">
                    {mediumChurn} Medium
                  </Badge>
                </div>
              </div>

              {CHURN_DATA.map((rec) => (
                <Card
                  key={rec.customer}
                  className={cn(
                    "border-l-4 rounded-l-none rounded-xs border-border bg-card",
                    rec.level === "High"   && "border-l-destructive",
                    rec.level === "Medium" && "border-l-chart-3",
                    rec.level === "Low"    && "border-l-chart-2",
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Dot */}
                      <span className={cn(
                        "mt-0.5 h-2 w-2 shrink-0 rounded-full self-start",
                        rec.level === "High"   && "bg-destructive",
                        rec.level === "Medium" && "bg-chart-3",
                        rec.level === "Low"    && "bg-chart-2",
                      )} />

                      <div className="min-w-0 flex-1 space-y-2">
                        {/* Title row */}
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <span className="text-sm font-semibold text-foreground">
                              {rec.customer}
                            </span>
                            <span className="mx-1.5 text-xs text-muted-foreground/50">·</span>
                            <span className="text-xs text-muted-foreground">
                              {rec.segment} {rec.gas}
                            </span>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            {churnBadge(rec.level, rec.churnPct)}
                            <span className="text-[10px] text-muted-foreground">
                              {rec.annualValue} / yr
                            </span>
                          </div>
                        </div>

                        {/* Probability bar */}
                        <div className="flex items-center gap-2">
                          <span className="w-28 shrink-0 text-[10px] text-muted-foreground">
                            Churn probability
                          </span>
                          <Progress value={rec.churnPct} className="h-1 flex-1" />
                          <span className={cn(
                            "w-8 shrink-0 text-right text-[10px] font-bold tabular-nums",
                            rec.level === "High"   ? "text-destructive" :
                            rec.level === "Medium" ? "text-chart-3" : "text-chart-2"
                          )}>
                            {rec.churnPct}%
                          </span>
                        </div>

                        {/* Action row */}
                        <div className="flex items-center justify-between pt-0.5">
                          <p className="text-[11px] text-muted-foreground">
                            <span className="font-medium text-foreground">→ </span>
                            Recommended:{" "}
                            <span className={cn(
                              "font-semibold",
                              rec.actionType === "danger"   ? "text-destructive" :
                              rec.actionType === "warn"     ? "text-chart-3" : "text-chart-2"
                            )}>
                              {rec.action}
                            </span>
                          </p>
                          {rec.level !== "Low" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 gap-1 px-2.5 text-[10px]"
                              onClick={() => dispatch(rec.customer)}
                              disabled={dispatched.has(rec.customer)}
                            >
                              {dispatched.has(rec.customer) ? (
                                <><CheckCircle2 className="h-3 w-3 text-chart-2" />Actioned</>
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

            {/* Right — churn stats + agent */}
            <div className="space-y-4">
              <Card className="border-border bg-card">
                <CardHeader className="border-b border-border px-5 py-4">
                  <CardTitle className="text-sm font-semibold">Churn Model Performance</CardTitle>
                </CardHeader>
                <CardContent className="px-5 py-5">
                  <div className="border-b border-border pb-4 text-center">
                    <p className="font-heading text-5xl font-bold tracking-tight text-chart-2">91%</p>
                    <p className="mt-1 text-xs text-muted-foreground">Model accuracy — last 90 days</p>
                    <p className="mt-0.5 text-[11px] font-semibold text-chart-2">
                      ↑ from 84% (retrained Apr 2026)
                    </p>
                  </div>
                  <div className="mt-4 space-y-3">
                    {[
                      { label: "Precision",              value: "88%",   color: "text-chart-2" },
                      { label: "Recall",                 value: "94%",   color: "text-chart-2" },
                      { label: "False positive rate",    value: "4.1%",  color: "text-muted-foreground" },
                      { label: "Accounts monitored",     value: "127",   color: "text-foreground" },
                      { label: "Revenue at risk (30d)",  value: "₹84 Cr", color: "text-chart-3" },
                    ].map((s) => (
                      <div key={s.label} className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{s.label}</span>
                        <span className={cn("text-xs font-bold tabular-nums", s.color)}>
                          {s.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardContent className="space-y-2 p-5">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-chart-5 shadow-[0_0_6px_hsl(var(--chart-5))]" />
                    <span className="text-xs font-semibold text-chart-5">
                      Customer Churn Agent · Active
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Monitors consumption patterns, contract utilisation, pricing
                    sensitivity, and competitor activity across 127 accounts.
                    Surfaces retention actions before contract renewal windows.
                  </p>
                  <p className="pt-1 text-[11px] text-muted-foreground">
                    Last scan:{" "}
                    <span className="font-medium text-foreground">12 min ago</span>
                    <span className="mx-1.5 text-muted-foreground/40">·</span>
                    Next:{" "}
                    <span className="font-medium text-foreground">~18 min</span>
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ══════════════════════════════════════════════════════════════════
            CONTRACT PORTFOLIO
        ══════════════════════════════════════════════════════════════════ */}
        <TabsContent value="contracts" className="mt-4">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">

            {/* Contract table */}
            <div className="xl:col-span-2">
              <Card className="border-border bg-card">
                <CardHeader className="border-b border-border px-5 py-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">
                      Active Contract Portfolio
                    </CardTitle>
                    <span className="text-[11px] text-muted-foreground">
                      127 total · top priority shown
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        {["ID", "Customer", "Gas", "Type", "Annual Value", "Renewal", "Margin", "Status"].map(
                          (h) => (
                            <TableHead key={h} className="h-9 px-4 text-[11px] font-semibold text-muted-foreground">
                              {h}
                            </TableHead>
                          )
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {CONTRACTS.map((c) => (
                        <TableRow key={c.id} className="border-border hover:bg-muted/30">
                          <TableCell className="px-4 py-3 text-xs font-semibold text-accent tabular-nums">
                            {c.id}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-sm font-medium text-foreground">
                            {c.customer}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-xs text-muted-foreground">
                            {c.gas}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-xs text-muted-foreground">
                            {c.type}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-sm font-bold text-chart-2 tabular-nums">
                            {c.annualValue}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-xs text-muted-foreground tabular-nums">
                            {c.renewalDate}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-xs font-semibold text-foreground tabular-nums">
                            {c.margin}
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            {contractStatusBadge(c.status)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* Right — portfolio summary */}
            <div className="space-y-4">
              <Card className="border-border bg-card">
                <CardHeader className="border-b border-border px-5 py-4">
                  <CardTitle className="text-sm font-semibold">Portfolio Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {[
                    { label: "Total annual value",    value: "₹4,840 Cr", color: "text-chart-2" },
                    { label: "Active contracts",       value: "98",        color: "text-foreground" },
                    { label: "Renewal due (90d)",      value: "14",        color: "text-chart-3" },
                    { label: "At risk",                value: "7",         color: "text-destructive" },
                    { label: "New (YTD)",              value: "22",        color: "text-chart-5" },
                    { label: "Average margin",         value: "27.4%",     color: "text-chart-2" },
                  ].map((item, i, arr) => (
                    <div
                      key={item.label}
                      className={cn(
                        "flex items-center justify-between px-5 py-3.5",
                        i < arr.length - 1 && "border-b border-border"
                      )}
                    >
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                      <span className={cn("text-sm font-bold tabular-nums", item.color)}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* At-risk contract CTA */}
              <Card className="border-destructive/30 bg-destructive/5">
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
                    <span className="text-sm font-semibold text-foreground">
                      Renewal Alert
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Tata Steel Ltd · C-4421</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      Renewal due Jun 2026 · 78% churn risk · ₹420 Cr annual value.
                      Pricing Agent recommends proactive outreach and revised bulk pricing.
                    </p>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      className="h-7 flex-1 bg-chart-2 text-xs text-white hover:bg-chart-2/90"
                      onClick={() => dispatch("tata-renewal")}
                      disabled={dispatched.has("tata-renewal")}
                    >
                      {dispatched.has("tata-renewal") ? (
                        <><CheckCircle2 className="mr-1 h-3 w-3" />Actioned</>
                      ) : (
                        <><ArrowUpRight className="mr-1 h-3 w-3" />Initiate Retention</>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 border-destructive/30 text-xs text-destructive hover:bg-destructive/10"
                    >
                      Override
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ══════════════════════════════════════════════════════════════════
            HYDROGEN ECONOMY
        ══════════════════════════════════════════════════════════════════ */}
        <TabsContent value="hydrogen" className="mt-4">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">

            {/* H₂ segment table */}
            <div className="xl:col-span-2 space-y-4">
              <Card className="border-border bg-card">
                <CardHeader className="border-b border-border px-5 py-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">
                      Hydrogen Segment Performance
                    </CardTitle>
                    <Badge variant="outline" className="border-transparent bg-chart-5/10 text-[10px] text-chart-5">
                      H₂ Pricing Agent Active
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        {["Segment", "Volume", "AI Price", "YoY Growth", "Customers"].map((h) => (
                          <TableHead key={h} className="h-9 px-5 text-[11px] font-semibold text-muted-foreground">
                            {h}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {H2_SEGMENTS.map((row) => (
                        <TableRow key={row.segment} className="border-border hover:bg-muted/30">
                          <TableCell className="px-5 py-3 text-sm font-medium text-foreground">
                            {row.segment}
                          </TableCell>
                          <TableCell className="px-5 py-3 text-xs text-muted-foreground tabular-nums">
                            {row.volume}
                          </TableCell>
                          <TableCell className="px-5 py-3">
                            <span className="text-sm font-bold text-chart-5 tabular-nums">
                              {row.pricing}
                            </span>
                          </TableCell>
                          <TableCell className="px-5 py-3">
                            <span className={cn(
                              "text-sm font-bold tabular-nums",
                              row.trend === "up" ? "text-chart-2" : "text-muted-foreground"
                            )}>
                              {row.growth}
                            </span>
                          </TableCell>
                          <TableCell className="px-5 py-3 text-xs text-muted-foreground tabular-nums">
                            {row.customers}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* H₂ volume breakdown */}
              <Card className="border-border bg-card">
                <CardHeader className="border-b border-border px-5 py-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">
                      H₂ Volume Distribution
                    </CardTitle>
                    <span className="text-[11px] font-semibold text-chart-5">
                      188,400 m³/mo total
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 px-5 py-5">
                  {[
                    { label: "Industrial H₂ — Steel",    pct: 64, val: "120,000 m³", color: "bg-chart-5/70" },
                    { label: "Green H₂ — Refineries",    pct: 25, val: "48,000 m³",  color: "bg-chart-2/70" },
                    { label: "Mobility H₂ — Transport",  pct: 6,  val: "12,000 m³",  color: "bg-accent/70"  },
                    { label: "Space / Defence",           pct: 4,  val: "8,400 m³",   color: "bg-chart-3/70" },
                  ].map((row) => (
                    <div key={row.label} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{row.label}</span>
                        <span className="font-bold text-foreground tabular-nums">{row.val}</span>
                      </div>
                      <div className="flex h-5 overflow-hidden rounded-sm">
                        <div
                          className={cn("h-full transition-all duration-700", row.color)}
                          style={{ width: `${row.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Right — H₂ KPIs + agent */}
            <div className="space-y-4">
              <Card className="border-border bg-card">
                <CardHeader className="border-b border-border px-5 py-4">
                  <CardTitle className="text-sm font-semibold">H₂ Business KPIs</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {[
                    { label: "H₂ revenue (YTD)",       value: "₹284 Cr",  color: "text-chart-5", Icon: DollarSign },
                    { label: "Pricing accuracy",        value: "87%",      color: "text-chart-2", Icon: Target     },
                    { label: "Green H₂ premium",        value: "+52%",     color: "text-chart-5", Icon: TrendingUp },
                    { label: "New H₂ customers (YTD)", value: "7",        color: "text-accent",   Icon: Users      },
                    { label: "Margin vs industrial",    value: "+12.1pp",  color: "text-chart-2", Icon: BarChart3  },
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
                      <span className={cn("text-sm font-bold tabular-nums", kpi.color)}>
                        {kpi.value}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardContent className="space-y-2 p-5">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-chart-5 shadow-[0_0_6px_hsl(var(--chart-5))]" />
                    <span className="text-xs font-semibold text-chart-5">
                      H₂ Pricing Agent · Active
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Dedicated model for green and industrial hydrogen pricing.
                    Factors in electrolysis cost curves, carbon credit markets,
                    and NITI Aayog green H₂ mission targets.
                  </p>
                  <p className="pt-1 text-[11px] text-muted-foreground">
                    Model version:{" "}
                    <span className="font-medium text-foreground">H₂-Pricing v3.0</span>
                    <span className="mx-1.5 text-muted-foreground/40">·</span>
                    Drift:{" "}
                    <span className="font-medium text-chart-3">Minor</span>
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader className="border-b border-border px-5 py-4">
                  <CardTitle className="text-sm font-semibold">Green H₂ Pipeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 px-5 py-4">
                  {[
                    { label: "NTPC Green Energy",  value: "₹420 Cr",  stage: "RFQ" },
                    { label: "ReNew Power",         value: "₹180 Cr",  stage: "Negotiation" },
                    { label: "Greenko Group",       value: "₹290 Cr",  stage: "LOI Signed" },
                    { label: "Torrent Power",       value: "₹96 Cr",   stage: "Pilot" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-foreground">{item.label}</p>
                        <p className="text-[10px] text-muted-foreground">{item.stage}</p>
                      </div>
                      <span className="text-xs font-bold text-chart-5 tabular-nums">
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
