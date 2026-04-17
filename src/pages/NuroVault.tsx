// ─── NuroVault.tsx ────────────────────────────────────────────────────────────
// LENA Platform — NuroVault: AI Knowledge & Institutional Memory Store
// Secure vault for AI agent memory, document intelligence, and retrieval

import { useState } from "react";
import {
  Search, Upload, Lock, FileText, FolderOpen,
  Clock, Shield, ChevronRight, Plus, Filter,
  BookOpen, Zap, CheckCircle2,
  Brain, Layers, HardDrive, Cpu, Eye, Download,
  MoreVertical, Star, TrendingUp,
  BarChart3, Workflow,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// ─── Types ────────────────────────────────────────────────────────────────────
type VaultTab = "all" | "contracts" | "decisions" | "telemetry" | "compliance" | "models";

interface VaultDocument {
  id: string;
  title: string;
  category: string;
  type: "contract" | "decision" | "telemetry" | "compliance" | "model" | "report";
  size: string;
  date: string;
  agent: string;
  status: "indexed" | "processing" | "pending";
  tags: string[];
  starred?: boolean;
  confidential?: boolean;
  reads: number;
}

interface MemoryEntry {
  id: string;
  agent: string;
  summary: string;
  timestamp: string;
  category: string;
  color: string;
  bgColor: string;
  icon: typeof Brain;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const VAULT_DOCS: VaultDocument[] = [
  {
    id: "d1", title: "Take-or-Pay Contract — Helios Steel Works",
    category: "Contracts", type: "contract",
    size: "1.2 MB", date: "01 Apr 2026", agent: "Finance Agent",
    status: "indexed", tags: ["N₂", "Scunthorpe", "Take-or-Pay"], starred: true, confidential: true, reads: 42,
  },
  {
    id: "d2", title: "Dispatch Decision Log — TK-4421 Chennai",
    category: "Decisions", type: "decision",
    size: "84 KB", date: "16 Apr 2026", agent: "Supply Chain Agent",
    status: "indexed", tags: ["Chennai", "Route R1", "Approved"], reads: 18,
  },
  {
    id: "d3", title: "ASU Compressor Telemetry — Plant B (Apr 2026)",
    category: "Telemetry", type: "telemetry",
    size: "22.4 MB", date: "16 Apr 2026", agent: "Manufacturing Agent",
    status: "indexed", tags: ["Compressor #47", "OEE", "Anomaly"], reads: 91,
  },
  {
    id: "d4", title: "PSM Compliance Audit — Q1 2026",
    category: "Compliance", type: "compliance",
    size: "3.7 MB", date: "31 Mar 2026", agent: "HR Safety Agent",
    status: "indexed", tags: ["PSM", "Permit", "Plant B"], confidential: true, reads: 27,
  },
  {
    id: "d5", title: "LENA Core v3 — Model Card",
    category: "Models", type: "model",
    size: "420 KB", date: "10 Apr 2026", agent: "LENA Orchestrator",
    status: "indexed", tags: ["Foundation", "Reasoning", "v3"], starred: true, reads: 134,
  },
  {
    id: "d6", title: "OT Anomaly Incident Report — Apr 14",
    category: "Compliance", type: "compliance",
    size: "512 KB", date: "14 Apr 2026", agent: "Cybersecurity Agent",
    status: "indexed", tags: ["OT", "Threat", "Isolated"], reads: 55,
  },
  {
    id: "d7", title: "Dynamic Pricing Analysis — Region South",
    category: "Decisions", type: "decision",
    size: "1.1 MB", date: "15 Apr 2026", agent: "Commercial Agent",
    status: "processing", tags: ["Pricing", "South", "Pending"], reads: 8,
  },
  {
    id: "d8", title: "Intercompany Reconciliation — March 2026",
    category: "Contracts", type: "report",
    size: "6.2 MB", date: "02 Apr 2026", agent: "Finance Agent",
    status: "indexed", tags: ["SAP", "Reconciliation", "Q1"], confidential: true, reads: 33,
  },
];

const MEMORY_ENTRIES: MemoryEntry[] = [
  {
    id: "m1", agent: "Supply Chain Agent",
    summary: "Helios Steel Works — Take-or-Pay threshold is £14.2K/hr. Always prioritize in route planning when tank < 15%.",
    timestamp: "Today · 03:17 AM", category: "Routing Rule",
    color: "text-blue-700", bgColor: "bg-blue-50",
    icon: TrendingUp,
  },
  {
    id: "m2", agent: "Finance Agent",
    summary: "BioPharm Solutions credit score 810 · 21-day terms · 99% on-time payment. Tier-1 account — no surcharge required.",
    timestamp: "Yesterday · 11:42 PM", category: "Account Intelligence",
    color: "text-amber-700", bgColor: "bg-amber-50",
    icon: BarChart3,
  },
  {
    id: "m3", agent: "Manufacturing Agent",
    summary: "Compressor #47 Plant B — anomaly pattern matches Q3 2024 failure. Recommend bearing inspection within 48 hours.",
    timestamp: "Today · 03:14 AM", category: "Predictive Insight",
    color: "text-violet-700", bgColor: "bg-violet-50",
    icon: Cpu,
  },
  {
    id: "m4", agent: "Cybersecurity Agent",
    summary: "OT anomaly Apr 14 — isolated to SCADA segment 4. Root cause: unauthorized firmware update. Patch deployed.",
    timestamp: "14 Apr · 09:21 AM", category: "Incident Memory",
    color: "text-red-700", bgColor: "bg-red-50",
    icon: Shield,
  },
];

const VAULT_STATS = [
  { label: "Documents Indexed", value: "14,821", icon: FileText, color: "text-blue-600", border: "border-l-blue-500" },
  { label: "AI Memories Stored", value: "3,247", icon: Brain, color: "text-violet-600", border: "border-l-violet-500" },
  { label: "Active RAG Queries/hr", value: "892", icon: Zap, color: "text-amber-600", border: "border-l-amber-400" },
  { label: "Vault Storage Used", value: "2.4 TB", icon: HardDrive, color: "text-foreground", border: "border-l-primary" },
];

const TABS: { id: VaultTab; label: string; count: number }[] = [
  { id: "all", label: "All Documents", count: 14821 },
  { id: "contracts", label: "Contracts", count: 3214 },
  { id: "decisions", label: "Decision Logs", count: 4782 },
  { id: "telemetry", label: "Telemetry", count: 2941 },
  { id: "compliance", label: "Compliance", count: 1823 },
  { id: "models", label: "Model Cards", count: 47 },
];

const CATEGORY_COLORS: Record<string, string> = {
  Contracts: "bg-blue-100 text-blue-700",
  Decisions: "bg-violet-100 text-violet-700",
  Telemetry: "bg-cyan-100 text-cyan-700",
  Compliance: "bg-amber-100 text-amber-700",
  Models: "bg-emerald-100 text-emerald-700",
};

const TYPE_ICONS: Record<string, typeof FileText> = {
  contract: FileText,
  decision: Workflow,
  telemetry: BarChart3,
  compliance: Shield,
  model: Brain,
  report: BookOpen,
};

// ─── Document Row ─────────────────────────────────────────────────────────────
function DocumentRow({ doc }: { doc: VaultDocument }) {
  const Icon = TYPE_ICONS[doc.type] ?? FileText;
  const catStyle = CATEGORY_COLORS[doc.category] ?? "bg-gray-100 text-gray-700";
  return (
    <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors group">
      <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-semibold truncate">{doc.title}</p>
          {doc.starred && <Star className="h-3 w-3 text-amber-400 fill-amber-400 shrink-0" />}
          {doc.confidential && <Lock className="h-3 w-3 text-red-400 shrink-0" />}
        </div>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span>{doc.date}</span>
          <span>·</span>
          <span>{doc.size}</span>
          <span>·</span>
          <span>By {doc.agent}</span>
          <span>·</span>
          <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{doc.reads}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", catStyle)}>{doc.category}</span>
        <div className="flex gap-1">
          {doc.tags.slice(0, 2).map(t => (
            <span key={t} className="text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">{t}</span>
          ))}
        </div>
        <span className={cn(
          "text-[10px] px-2 py-0.5 rounded-full font-medium",
          doc.status === "indexed" ? "bg-emerald-100 text-emerald-700" :
          doc.status === "processing" ? "bg-blue-100 text-blue-700 animate-pulse" :
          "bg-muted text-muted-foreground"
        )}>
          {doc.status === "indexed" ? "✓ Indexed" : doc.status === "processing" ? "Processing…" : "Pending"}
        </span>
        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-muted">
          <MoreVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}

// ─── Memory Card ──────────────────────────────────────────────────────────────
function MemoryCard({ entry }: { entry: MemoryEntry }) {
  const Icon = entry.icon;
  return (
    <div className={cn("rounded-xl border p-4 space-y-2 hover:shadow-sm transition-shadow", entry.bgColor, "border-opacity-30")}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon className={cn("h-4 w-4 shrink-0", entry.color)} />
          <span className={cn("text-xs font-semibold", entry.color)}>{entry.agent}</span>
        </div>
        <span className="text-[9px] bg-white/80 border text-muted-foreground px-2 py-0.5 rounded-full font-medium">
          {entry.category}
        </span>
      </div>
      <p className="text-xs text-foreground leading-relaxed">{entry.summary}</p>
      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
        <Clock className="h-3 w-3" />
        <span>{entry.timestamp}</span>
      </div>
    </div>
  );
}

// ─── RAG Pipeline Status ──────────────────────────────────────────────────────
function RAGPipelineStatus() {
  const pipelines = [
    { name: "Supply Chain RAG", sources: 3214, queriesHr: 312, status: "active", latency: "84ms" },
    { name: "Finance & ERP RAG", sources: 2841, queriesHr: 187, status: "active", latency: "102ms" },
    { name: "Compliance & Safety RAG", sources: 1823, queriesHr: 94, status: "active", latency: "91ms" },
    { name: "Manufacturing Telemetry RAG", sources: 2941, queriesHr: 241, status: "active", latency: "76ms" },
    { name: "Model Card RAG", sources: 47, queriesHr: 58, status: "active", latency: "63ms" },
  ];
  return (
    <div className="bg-card rounded-xl border p-5">
      <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
        <Layers className="h-4 w-4 text-primary" /> Active RAG Pipelines
      </h3>
      <div className="space-y-2">
        {pipelines.map(p => (
          <div key={p.name} className="flex items-center gap-4 p-3 rounded-lg bg-muted/40">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="text-sm font-medium truncate">{p.name}</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-muted-foreground shrink-0">
              <span className="text-right">
                <span className="font-semibold text-foreground font-mono">{p.sources.toLocaleString()}</span> docs
              </span>
              <span className="text-right">
                <span className="font-semibold text-foreground font-mono">{p.queriesHr}</span>/hr
              </span>
              <span className={cn("font-mono font-semibold",
                parseInt(p.latency) < 80 ? "text-emerald-600" : parseInt(p.latency) < 100 ? "text-blue-600" : "text-amber-600"
              )}>{p.latency}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function NuroVault() {
  const [activeTab, setActiveTab] = useState<VaultTab>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDocs = VAULT_DOCS.filter(doc => {
    const matchTab =
      activeTab === "all" ||
      (activeTab === "contracts" && doc.type === "contract") ||
      (activeTab === "decisions" && doc.type === "decision") ||
      (activeTab === "telemetry" && doc.type === "telemetry") ||
      (activeTab === "compliance" && doc.type === "compliance") ||
      (activeTab === "models" && doc.type === "model");
    const matchSearch = !searchQuery || doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Topbar — matches NuroForge/NuroStack pattern */}
      <div className="h-12 border-b flex items-center px-6 gap-3 shrink-0 bg-background">
        <nav className="flex items-center gap-1 text-sm text-muted-foreground">
          <span>Core</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">NuroVault</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">Document Vault</span>
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6 space-y-6">

          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">NuroVault</h1>
              <p className="text-sm text-muted-foreground mt-1">
                AI knowledge store · Institutional memory · Retrieval-Augmented Generation
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Upload className="h-4 w-4" /> Upload Document
              </Button>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" /> New RAG Source
              </Button>
            </div>
          </div>

          {/* KPI Row */}
          <div className="grid grid-cols-4 gap-4">
            {VAULT_STATS.map(s => {
              const Icon = s.icon;
              return (
                <Card key={s.label} className={cn("border-l-4 rounded-l-none hover:shadow-md transition-shadow", s.border)}>
                  <CardContent className="px-4 py-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">{s.label}</p>
                    </div>
                    <p className={cn("font-heading text-2xl font-bold tracking-tight", s.color)}>{s.value}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Main layout */}
          <div className="grid grid-cols-10 gap-5">

            {/* LEFT — Document Vault 70% */}
            <div className="col-span-7 space-y-5">

              {/* Document search & tabs */}
              <div className="bg-card rounded-xl border p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search documents, decisions, telemetry…"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <Button variant="outline" size="sm" className="gap-2 shrink-0">
                    <Filter className="h-4 w-4" /> Filter
                  </Button>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-0 border-b border-border pb-0 mb-4 overflow-x-auto">
                  {TABS.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "relative px-3 py-2 text-xs font-semibold transition-all whitespace-nowrap",
                        "rounded-t-md border-b-2 -mb-px",
                        activeTab === tab.id
                          ? "text-primary border-primary bg-primary/5"
                          : "text-muted-foreground border-transparent hover:text-foreground hover:border-muted-foreground/30"
                      )}
                    >
                      {tab.label}
                      <span className="ml-1.5 text-[9px] font-mono text-muted-foreground">
                        {tab.count.toLocaleString()}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Document list */}
                <div className="space-y-1">
                  {filteredDocs.length > 0
                    ? filteredDocs.map(doc => <DocumentRow key={doc.id} doc={doc} />)
                    : (
                      <div className="text-center py-10 text-muted-foreground">
                        <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-40" />
                        <p className="text-sm">No documents found</p>
                      </div>
                    )
                  }
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t text-xs text-muted-foreground">
                  <span>Showing {filteredDocs.length} of {VAULT_DOCS.length} documents</span>
                  <Button variant="ghost" size="sm" className="gap-1 text-xs">
                    <Download className="h-3.5 w-3.5" /> Export list
                  </Button>
                </div>
              </div>

              {/* RAG Pipelines */}
              <RAGPipelineStatus />
            </div>

            {/* RIGHT — Memory & Access 30% */}
            <div className="col-span-3 space-y-4">

              {/* Agent Memory Feed */}
              <div className="bg-card rounded-xl border p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Brain className="h-4 w-4 text-violet-600" /> Agent Memory
                  </h3>
                  <span className="text-[10px] text-muted-foreground font-mono">3,247 entries</span>
                </div>
                <div className="space-y-3">
                  {MEMORY_ENTRIES.map(entry => (
                    <MemoryCard key={entry.id} entry={entry} />
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="w-full mt-3 text-xs text-muted-foreground">
                  View all memories →
                </Button>
              </div>

              {/* Vault Security */}
              <div className="bg-card rounded-xl border p-5">
                <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-primary" /> Vault Security
                </h3>
                <div className="space-y-3">
                  {[
                    { label: "End-to-End Encryption", status: "Active", ok: true },
                    { label: "Access Control (RBAC)", status: "Enforced", ok: true },
                    { label: "Audit Logging", status: "Enabled", ok: true },
                    { label: "Data Residency (EU)", status: "Compliant", ok: true },
                    { label: "Confidential Docs Sealed", status: "12 docs", ok: true },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className={cn("flex items-center gap-1 font-semibold",
                        item.ok ? "text-emerald-600" : "text-red-600"
                      )}>
                        <CheckCircle2 className="h-3 w-3" />
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-emerald-600 shrink-0" />
                  <p className="text-xs text-emerald-700 font-medium">Vault integrity verified · ISO 27001</p>
                </div>
              </div>

              {/* Recent Access */}
              <div className="bg-card rounded-xl border p-5">
                <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                  <Eye className="h-4 w-4 text-primary" /> Recent Accesses
                </h3>
                <div className="space-y-2.5">
                  {[
                    { agent: "Supply Chain Agent", doc: "Route Decision Log", time: "Just now" },
                    { agent: "Finance Agent", doc: "Take-or-Pay Contract", time: "2 min ago" },
                    { agent: "Manufacturing Agent", doc: "Compressor Telemetry", time: "3 min ago" },
                    { agent: "LENA Orchestrator", doc: "LENA Core v3 — Model Card", time: "8 min ago" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Brain className="h-3 w-3 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate">{item.agent}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{item.doc}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
