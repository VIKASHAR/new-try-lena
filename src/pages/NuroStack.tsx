import { useState } from "react";
import { Check, Clock, MinusCircle, MoreVertical, Pencil, Eye, Plus, Search, Activity, Gauge, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// ── Types ──────────────────────────────────────────────────────────────────────

type Status = "live" | "standby" | "off";
type Group = "Active" | "Connectors" | "Not Connected";

type Tool = {
  id: string;
  abbr: string;
  name: string;
  type: string;
  status: Status;
  group: Group;
  tone: "blue" | "navy" | "green" | "purple" | "amber" | "teal" | "gray";
  pillText: string;
  desc: string;
  actionLabel: "Disconnect" | "Suspend" | "Connect";
  actionVariant: "danger" | "primary";
  stats: { label: string; value: string; sub: string; tone: "blue" | "green" | "purple" }[];
  writeTools: string[];
  readTools: string[];
  streams: { name: string; detail: string; rate: string; tone: "success" | "primary" | "warning" }[];
};

// ── Data ───────────────────────────────────────────────────────────────────────

const TOOLS: Tool[] = [
  {
    id: "sap", abbr: "S4", name: "SAP S/4HANA", type: "ERP · Enterprise", status: "live", group: "Active", tone: "blue",
    pillText: "Live · Authenticated", actionLabel: "Disconnect", actionVariant: "danger",
    desc: "Live bidirectional integration with SAP S/4HANA for real-time financial reconciliation, intercompany settlement, and ERP-side execution of AI-approved procurement and logistics decisions. Enables take-or-pay contract enforcement, financial close automation, and cross-plant cost allocation across 600+ Linde manufacturing facilities.",
    stats: [
      { label: "API Calls · 24h", value: "1,247", sub: "+12% vs yesterday", tone: "blue" },
      { label: "Avg Response", value: "84ms", sub: "P99 · 220ms", tone: "green" },
      { label: "AI-Executed TXNs", value: "312", sub: "Today · auto-approved", tone: "purple" },
    ],
    writeTools: ["Post Financial Journal Entry", "Create Purchase Order", "Execute Intercompany Transfer", "Update Vendor Master Data"],
    readTools: ["Query Financial Ledger", "Get Contract Status", "Read Plant Cost Centre"],
    streams: [
      { name: "Financial Ledger · Real-time", detail: "fi.gl.posting.stream → EOS Financial Agent", rate: "312 / hr", tone: "success" },
      { name: "Procurement Events", detail: "mm.po.event.stream → EOS Supply Agent", rate: "84 / hr", tone: "primary" },
      { name: "Contract Compliance Monitor", detail: "sd.contract.alerts → EOS Compliance Agent", rate: "12 / hr", tone: "warning" },
    ],
  },
  {
    id: "azure", abbr: "Az", name: "Azure IoT Hub", type: "Industrial · Telemetry", status: "live", group: "Active", tone: "teal",
    pillText: "Live · Streaming", actionLabel: "Disconnect", actionVariant: "danger",
    desc: "Real-time telemetry ingestion from 8,000+ fleet vehicles and 80,000+ tank monitoring sites via Azure IoT Hub. Feeds live sensor data to the EOS Supply Chain Agent for dynamic route optimisation, predictive maintenance alerts, and OEE degradation detection across ASU plants.",
    stats: [
      { label: "Events · 24h", value: "4.2M", sub: "+3% vs yesterday", tone: "blue" },
      { label: "Ingest Latency", value: "42ms", sub: "P99 · 180ms", tone: "green" },
      { label: "Devices Online", value: "87,312", sub: "Fleet + tanks", tone: "purple" },
    ],
    writeTools: ["Trigger Device Command", "Update Twin Desired State"],
    readTools: ["Query Device Telemetry", "Read Device Twin", "List Device Registry"],
    streams: [
      { name: "Fleet Telemetry", detail: "iot.fleet.telemetry → EOS Supply Agent", rate: "2.8M / hr", tone: "success" },
      { name: "Tank Level Events", detail: "iot.tank.level → EOS Supply Agent", rate: "1.1M / hr", tone: "primary" },
    ],
  },
  {
    id: "eos", abbr: "Ea", name: "EOS Agent Core", type: "AI · Orchestration", status: "live", group: "Active", tone: "navy",
    pillText: "Live · Orchestrating", actionLabel: "Suspend", actionVariant: "danger",
    desc: "The primary AI orchestration runtime powering all 47 active EOS agents. Manages agent lifecycle, routes human-in-the-loop approval requests, enforces PSM safety interlocks, and logs every AI-generated decision with full audit trail. Minimum confidence threshold: 0.87 before autonomous execution.",
    stats: [
      { label: "Active Agents", value: "47", sub: "All healthy", tone: "blue" },
      { label: "Decisions · 24h", value: "18,942", sub: "1.2% escalated", tone: "green" },
      { label: "Avg Confidence", value: "0.94", sub: "Threshold · 0.87", tone: "purple" },
    ],
    writeTools: ["Dispatch Agent Task", "Override Safety Interlock", "Escalate to Human"],
    readTools: ["Query Agent Status", "Read Decision Log", "Get Confidence Score"],
    streams: [
      { name: "Agent Decisions", detail: "eos.agent.decision → Audit Log", rate: "789 / hr", tone: "success" },
      { name: "Approval Queue", detail: "eos.approval.pending → HITL Desk", rate: "12 / hr", tone: "warning" },
    ],
  },
  {
    id: "scada", abbr: "SC", name: "SCADA Gateway", type: "Industrial · OT", status: "live", group: "Active", tone: "green",
    pillText: "Live · OT Bridge Active", actionLabel: "Disconnect", actionVariant: "danger",
    desc: "Secure OT/IT bridge connecting plant-floor SCADA systems to the EOS platform. Streams real-time process values from 600+ ASU and hydrogen plants — including O₂ purity, compression ratios, and cold-box temperatures — enabling predictive fault detection and AI-assisted production scheduling.",
    stats: [
      { label: "Tags Streaming", value: "214K", sub: "across 600+ plants", tone: "blue" },
      { label: "Sample Rate", value: "1Hz", sub: "1s resolution", tone: "green" },
      { label: "Anomalies · 24h", value: "7", sub: "All investigated", tone: "purple" },
    ],
    writeTools: ["Send Setpoint Adjustment", "Acknowledge Plant Alarm"],
    readTools: ["Read Process Tag", "Query Historian", "List Plant Alarms"],
    streams: [
      { name: "ASU Process Values", detail: "scada.asu.tags → Manufacturing Agent", rate: "180K / min", tone: "success" },
      { name: "Hydrogen Plant Alarms", detail: "scada.h2.alarms → Safety Agent", rate: "3 / hr", tone: "warning" },
    ],
  },
  {
    id: "historian", abbr: "Ph", name: "Plant Historian", type: "Industrial · Data", status: "standby", group: "Active", tone: "amber",
    pillText: "Standby · Batch Mode", actionLabel: "Disconnect", actionVariant: "danger",
    desc: "Time-series historian providing 10+ years of plant operational data for AI model training and OEE benchmarking. Currently in batch sync mode due to scheduled maintenance window. Resumes live streaming at 06:00 UTC. Used by the Manufacturing AI agent for trend analysis and anomaly baseline calibration.",
    stats: [
      { label: "Archive Size", value: "184TB", sub: "10yr retention", tone: "blue" },
      { label: "Batch Lag", value: "14m", sub: "Resumes 06:00 UTC", tone: "green" },
      { label: "Training Queries", value: "42", sub: "This week", tone: "purple" },
    ],
    writeTools: ["Tag Archive Entry"],
    readTools: ["Query Time Range", "Get Trend Data", "Benchmark OEE Baseline"],
    streams: [
      { name: "Batch Archive Sync", detail: "historian.batch.sync → Training Pipeline", rate: "Batched", tone: "warning" },
    ],
  },
  {
    id: "mcp", abbr: "MC", name: "MCP", type: "Protocol · Model Context", status: "live", group: "Connectors", tone: "purple",
    pillText: "Live · Protocol Active", actionLabel: "Disconnect", actionVariant: "danger",
    desc: "Model Context Protocol connector enabling standardised, structured context injection into EOS AI agents. Exposes Linde operational data — plant states, fleet positions, financial snapshots — as well-typed context blocks consumed by all LLM-backed agents. Reduces hallucination risk by grounding every inference in verified real-time data.",
    stats: [
      { label: "Context Blocks", value: "128", sub: "registered schemas", tone: "blue" },
      { label: "Injections · 24h", value: "52K", sub: "across agents", tone: "green" },
      { label: "Schema Violations", value: "0", sub: "Last 7 days", tone: "purple" },
    ],
    writeTools: ["Register Context Schema", "Invalidate Cached Block"],
    readTools: ["Fetch Context Block", "List Schemas"],
    streams: [
      { name: "Context Injection", detail: "mcp.context.inject → All Agents", rate: "2.1K / hr", tone: "success" },
    ],
  },
  {
    id: "rag", abbr: "RA", name: "RAG", type: "Retrieval · Augmented Gen", status: "live", group: "Connectors", tone: "teal",
    pillText: "Live · Index Current", actionLabel: "Disconnect", actionVariant: "danger",
    desc: "Retrieval-Augmented Generation pipeline over Linde's internal knowledge base: technical SOPs, PSM documentation, compliance regulations, and engineering manuals. EOS agents query this index before generating recommendations, ensuring outputs align with Linde operating procedures and regulatory obligations across 60+ jurisdictions.",
    stats: [
      { label: "Indexed Docs", value: "412K", sub: "SOPs + regs", tone: "blue" },
      { label: "Retrieval P50", value: "64ms", sub: "P99 · 180ms", tone: "green" },
      { label: "Groundedness", value: "0.97", sub: "7d avg", tone: "purple" },
    ],
    writeTools: ["Reindex Corpus", "Add Document"],
    readTools: ["Semantic Search", "Hybrid Retrieve", "Get Citations"],
    streams: [
      { name: "Retrieval Requests", detail: "rag.retrieve → All Agents", rate: "4.8K / hr", tone: "success" },
    ],
  },
  {
    id: "cag", abbr: "CA", name: "CAG", type: "Cache · Augmented Gen", status: "standby", group: "Connectors", tone: "amber",
    pillText: "Standby · Cache Warming", actionLabel: "Disconnect", actionVariant: "danger",
    desc: "Cache-Augmented Generation layer that pre-computes and stores high-frequency EOS agent responses — daily fleet summaries, plant health digests, and financial close snapshots. Reduces average EOS Assistant response latency from 1.8s to 210ms for repeat query patterns. Cache warm-up currently in progress for Q2 reporting cycle.",
    stats: [
      { label: "Hit Rate", value: "62%", sub: "warming", tone: "blue" },
      { label: "Cached Queries", value: "8,412", sub: "populated", tone: "green" },
      { label: "Latency Saved", value: "1.6s", sub: "Avg per hit", tone: "purple" },
    ],
    writeTools: ["Invalidate Key", "Warm Cache"],
    readTools: ["Get Cached Response", "Inspect Cache Entry"],
    streams: [
      { name: "Cache Warm Pipeline", detail: "cag.warm.queue → Workers", rate: "Batched", tone: "warning" },
    ],
  },
  {
    id: "salesforce", abbr: "Sf", name: "Salesforce CRM", type: "Commercial · CRM", status: "off", group: "Not Connected", tone: "gray",
    pillText: "Not Connected", actionLabel: "Connect", actionVariant: "primary",
    desc: "Salesforce CRM integration would enable the EOS Commercial Agent to access live customer churn risk scores, take-or-pay contract status, and key account health metrics directly from the CRM system. Contact IT Operations to provision OAuth credentials and configure field-level sync.",
    stats: [],
    writeTools: [],
    readTools: [],
    streams: [],
  },
  {
    id: "powerbi", abbr: "BI", name: "Power BI", type: "Analytics · Reporting", status: "off", group: "Not Connected", tone: "gray",
    pillText: "Not Connected", actionLabel: "Connect", actionVariant: "primary",
    desc: "Power BI connector would push AI-generated insights from EOS agents into Linde's existing board-level reporting dashboards. Enables AI-sourced KPIs to surface alongside legacy operational metrics without requiring leadership to adopt new tooling. Pending approval from CDO office.",
    stats: [], writeTools: [], readTools: [], streams: [],
  },
  {
    id: "gis", abbr: "GS", name: "GIS Platform", type: "Logistics · Mapping", status: "off", group: "Not Connected", tone: "gray",
    pillText: "Not Connected", actionLabel: "Connect", actionVariant: "primary",
    desc: "GIS integration would provide the EOS Supply Chain Agent with geospatial route optimisation, live traffic overlays, and hazmat corridor compliance checks for the 8,000+ tanker fleet. Currently blocked pending data privacy review for cross-border vehicle tracking in EU jurisdictions.",
    stats: [], writeTools: [], readTools: [], streams: [],
  },
];

// ── Style maps (use theme tokens where possible) ───────────────────────────────

const toneIcon: Record<Tool["tone"], string> = {
  blue:   "bg-primary/10 text-primary border-primary/20",
  navy:   "bg-sidebar/10 text-sidebar-foreground border-sidebar/20 dark:bg-sidebar-accent dark:text-sidebar-foreground",
  green:  "bg-chart-2/10 text-chart-2 border-chart-2/20",
  purple: "bg-accent/10 text-accent border-accent/20",
  amber:  "bg-chart-3/10 text-chart-3 border-chart-3/20",
  teal:   "bg-chart-5/10 text-chart-5 border-chart-5/20",
  gray:   "bg-muted text-muted-foreground border-border",
};

const statusDot: Record<Status, string> = {
  live:    "bg-chart-2 animate-pulse",
  standby: "bg-chart-3",
  off:     "bg-border",
};

const statBorder = {
  blue:   "border-l-primary",
  green:  "border-l-chart-2",
  purple: "border-l-accent",
};

const statText = {
  blue:   "text-primary",
  green:  "text-chart-2",
  purple: "text-accent",
};

const statIcon = {
  blue:   Activity,
  green:  Gauge,
  purple: Sparkles,
};

const streamDot = {
  success: "bg-chart-2",
  primary: "bg-primary",
  warning: "bg-chart-3",
};

// ── Toggle row ─────────────────────────────────────────────────────────────────

type Mode = "allow" | "approve" | "deny";

function PermRow({ name, defaultMode }: { name: string; defaultMode: Mode }) {
  const [mode, setMode] = useState<Mode>(defaultMode);
  const btn = (m: Mode, Icon: typeof Check) => (
    <button
      key={m}
      onClick={() => setMode(m)}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-md border transition-colors",
        mode === m
          ? "bg-primary/10 border-primary/30 text-primary"
          : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-border last:border-b-0 hover:bg-muted/40">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="h-1 w-1 rounded-full bg-border" />
        {name}
      </span>
      <div className="flex items-center gap-1">
        {btn("allow", Check)}
        {btn("approve", Clock)}
        {btn("deny", MinusCircle)}
      </div>
    </div>
  );
}

// ── Permission block ───────────────────────────────────────────────────────────

function PermBlock({
  title, count, Icon, defaultMode, items,
}: { title: string; count: number; Icon: typeof Pencil; defaultMode: Mode; items: string[] }) {
  const badgeText = defaultMode === "allow" ? "Auto-approved" : "Needs approval";
  const BadgeIcon = defaultMode === "allow" ? Check : Clock;
  return (
    <div className="mb-3 overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Icon className="h-3.5 w-3.5 text-foreground" />
          <span className="text-sm font-semibold text-foreground">{title}</span>
          <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-primary">
            {count}
          </span>
        </div>
        <div className="flex items-center gap-1.5 rounded-md border border-border bg-muted px-2.5 py-1 text-xs text-muted-foreground">
          <BadgeIcon className="h-3 w-3" />
          {badgeText}
        </div>
      </div>
      <div className="border-t border-border">
        {items.map((n) => (
          <PermRow key={n} name={n} defaultMode={defaultMode} />
        ))}
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────

export default function NuroStack() {
  const [selectedId, setSelectedId] = useState<string>("sap");
  const selected = TOOLS.find((t) => t.id === selectedId)!;

  const grouped = (["Active", "Connectors", "Not Connected"] as Group[]).map((g) => ({
    group: g,
    items: TOOLS.filter((t) => t.group === g),
  }));

  return (
    <div className="grid h-full grid-cols-[280px_1fr] overflow-hidden">

      {/* LIST PANEL */}
      <aside className="flex flex-col overflow-hidden border-r border-border bg-card">
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
          <span className="font-heading text-base font-semibold text-foreground">Tools</span>
          <div className="flex gap-1.5">
            <Button variant="outline" size="icon" className="h-7 w-7"><Search className="h-3.5 w-3.5" /></Button>
            <Button variant="outline" size="icon" className="h-7 w-7"><Plus className="h-3.5 w-3.5" /></Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {grouped.map(({ group, items }) => (
            <div key={group}>
              <div className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group}
              </div>
              {items.map((t) => {
                const active = t.id === selectedId;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedId(t.id)}
                    className={cn(
                      "relative flex w-full items-center gap-3 px-4 py-2 text-left transition-colors",
                      active ? "bg-primary/5" : "hover:bg-muted/50",
                    )}
                  >
                    {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-primary" />}
                    <div className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-[11px] font-bold",
                      toneIcon[t.tone],
                    )}>
                      {t.abbr}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={cn(
                        "truncate text-sm font-medium",
                        t.status === "off" ? "text-muted-foreground" : "text-foreground",
                      )}>
                        {t.name}
                      </div>
                      <div className="truncate text-[11px] text-muted-foreground">{t.type}</div>
                    </div>
                    <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", statusDot[t.status])} />
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </aside>

      {/* DETAIL PANEL */}
      <section key={selected.id} className="flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-1 duration-200">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border bg-card px-6 py-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-11 w-11 items-center justify-center rounded-lg border text-xs font-bold",
              toneIcon[selected.tone],
            )}>
              {selected.abbr}
            </div>
            <div>
              <h1 className="font-heading text-lg font-semibold text-foreground">{selected.name}</h1>
              <div className={cn(
                "mt-1 inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[11px] font-medium",
                selected.status === "live"    && "bg-chart-2/10 text-chart-2",
                selected.status === "standby" && "bg-chart-3/10 text-chart-3",
                selected.status === "off"     && "bg-muted text-muted-foreground",
              )}>
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {selected.pillText}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant={selected.actionVariant === "danger" ? "destructive" : "default"} size="sm">
              {selected.actionLabel}
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8"><MoreVertical className="h-3.5 w-3.5" /></Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <p className="mb-6 max-w-3xl text-sm leading-relaxed text-muted-foreground">{selected.desc}</p>

          {selected.stats.length > 0 && (
            <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {selected.stats.map((s) => {
                const Icon = statIcon[s.tone];
                return (
                  <Card
                    key={s.label}
                    className={cn("border-l-4 border-border bg-card rounded-l-none rounded-xs", statBorder[s.tone])}
                  >
                    <CardContent className="px-4 py-4">
                      <div className="mb-2 flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                          {s.label}
                        </p>
                      </div>
                      <p className={cn("font-heading text-3xl font-bold tracking-tight", statText[s.tone])}>
                        {s.value}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">{s.sub}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {(selected.writeTools.length > 0 || selected.readTools.length > 0) && (
            <>
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-sm font-semibold text-foreground">Tool Permissions</h2>
                <span className="text-xs text-muted-foreground">Choose when EOS agents may invoke these tools.</span>
              </div>
              {selected.writeTools.length > 0 && (
                <PermBlock title="Write Tools" Icon={Pencil} count={selected.writeTools.length} defaultMode="approve" items={selected.writeTools} />
              )}
              {selected.readTools.length > 0 && (
                <PermBlock title="Read-only Tools" Icon={Eye} count={selected.readTools.length} defaultMode="allow" items={selected.readTools} />
              )}
            </>
          )}

          {selected.streams.length > 0 && (
            <>
              <div className="my-6 h-px bg-border" />
              <h2 className="mb-3 text-sm font-semibold text-foreground">Live Data Streams</h2>
              <div className="rounded-lg border border-border bg-card px-4">
                {selected.streams.map((s) => (
                  <div key={s.name} className="flex items-center gap-3 border-b border-border py-3 last:border-b-0">
                    <span className={cn("h-2 w-2 shrink-0 rounded-full", streamDot[s.tone])} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-medium text-foreground">{s.name}</div>
                      <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">{s.detail}</div>
                    </div>
                    <span className="shrink-0 font-mono text-[11px] text-muted-foreground">{s.rate}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
