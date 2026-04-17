import React, { useState, useMemo } from "react";

/* ───────────────────────── TYPES ───────────────────────── */

type PipelineStatus = "Running" | "Failed" | "Completed" | "Draft";
type PipelineType = "Compute" | "Storage" | "Edge Deployment" | "Monitoring";

interface Pipeline {
  id: string;
  name: string;
  status: PipelineStatus;
  runtime: string;
  target: string;
  lastOutput: string;
  type: PipelineType;
}

interface Workflow {
  id: string;
  name: string;
  phase: string;
  completion: number;
}

interface StatusColor {
  bg: string;
  fg: string;
}

/* ───────────────────────── DATA ───────────────────────── */

const PIPELINES: Pipeline[] = [
  { id: "pipe-001", name: "ASU Optimization Pipeline", status: "Running", runtime: "2h 15m", target: "Plant 42", lastOutput: "Model updated", type: "Compute" },
  { id: "pipe-002", name: "Supply Chain Sync", status: "Failed", runtime: "0h 14m", target: "Global", lastOutput: "Data divergence error", type: "Monitoring" },
  { id: "pipe-003", name: "Safety Vision Anomaly", status: "Running", runtime: "14h 0m", target: "Edge nodes", lastOutput: "Inference stable", type: "Edge Deployment" },
  { id: "pipe-004", name: "Demand Forecasting", status: "Completed", runtime: "1h 45m", target: "Analytics DB", lastOutput: "Dataset refreshed", type: "Compute" }
];

const WORKFLOWS: Workflow[] = [
  { id: "wf-10", name: "Train New Safety Model", phase: "Data Annotation", completion: 35 },
  { id: "wf-11", name: "Evaluate Churn Predictor", phase: "Backtesting", completion: 80 },
  { id: "wf-12", name: "Deploy Timeseries to Edge", phase: "Rollout", completion: 95 }
];

const CATEGORIES: PipelineType[] = ["Compute", "Storage", "Edge Deployment", "Monitoring"];
const STATUSES: PipelineStatus[] = ["Running", "Failed", "Completed", "Draft"];

/* ───────────────────────── ICONS (inline SVG) ───────────────────────── */

function IconSearch(): React.JSX.Element { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>; }
function IconChevron(): React.JSX.Element { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>; }
function IconActivity(): React.JSX.Element { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>; }
function IconGitMerge(): React.JSX.Element { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="18" r="3" /><circle cx="6" cy="6" r="3" /><path d="M6 21V9a9 9 0 0 0 9 9" /></svg>; }
function IconPlay(): React.JSX.Element { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>; }
function IconSettings(): React.JSX.Element { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>; }

/* ───────────────────────── COMPONENTS ───────────────────────── */

interface SidebarSectionProps {
  title: string;
  items: string[];
  activeFilters: string[];
  onToggle: (item: any) => void;
}

function SidebarSection({ title, items, activeFilters, onToggle }: SidebarSectionProps): React.JSX.Element {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  return (
    <div style={{ marginBottom: "16px" }}>
      <div
        onClick={() => setCollapsed(!collapsed)}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", cursor: "pointer", userSelect: "none" }}
      >
        <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--clr-muted-fg)" }}>{title}</span>
        <span style={{ transform: collapsed ? "rotate(-90deg)" : "rotate(0)", transition: "transform 150ms", color: "var(--clr-muted-fg)", display: "flex" }}>
          <IconChevron />
        </span>
      </div>
      {!collapsed && (
        <div style={{ marginTop: "4px" }}>
          {items.map(item => {
            const isActive = activeFilters.includes(item);
            return (
              <div
                key={item}
                onClick={() => onToggle(item)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "6px 10px",
                  borderRadius: "3px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? "#007AB9" : "var(--clr-foreground)",
                  background: isActive ? "#007AB90D" : "transparent",
                  transition: "background 100ms",
                  borderLeft: isActive ? "3px solid #007AB9" : "3px solid transparent",
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "var(--clr-muted)"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = isActive ? "#007AB90D" : "transparent"; }}
              >
                <span>{item}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface PipelineCardProps {
  pipeline: Pipeline;
}

function PipelineCard({ pipeline }: PipelineCardProps): React.JSX.Element {
  const statusColors: Record<PipelineStatus, StatusColor> = {
    "Running": { bg: "#E8F5E9", fg: "#2D8659" },
    "Failed": { bg: "#FFEBEE", fg: "#CC3340" },
    "Completed": { bg: "#E3F2FD", fg: "#007AB9" },
    "Draft": { bg: "#F5F7FA", fg: "#5C6B7F" }
  };
  const sc: StatusColor = statusColors[pipeline.status] || statusColors.Draft;

  return (
    <div style={{
      background: "var(--clr-card)",
      border: "1px solid var(--clr-border)",
      borderRadius: "4px",
      padding: "16px",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      transition: "box-shadow 150ms, transform 150ms",
      cursor: "pointer",
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,47,90,0.10)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--clr-foreground)" }}>{pipeline.name}</div>
          <div style={{ fontSize: "12px", color: "var(--clr-muted-fg)", marginTop: "4px" }}>Target: {pipeline.target}</div>
        </div>
        <span style={{
          padding: "3px 8px",
          borderRadius: "12px",
          fontSize: "11px",
          fontWeight: 700,
          background: sc.bg,
          color: sc.fg,
          display: "flex",
          alignItems: "center",
          gap: "4px"
        }}>
          {pipeline.status === "Running" && <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: sc.fg }} />}
          {pipeline.status}
        </span>
      </div>

      <div style={{ padding: "12px", background: "var(--clr-background)", borderRadius: "4px", fontSize: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
          <span style={{ color: "var(--clr-muted-fg)" }}>Runtime:</span>
          <span style={{ fontWeight: 600 }}>{pipeline.runtime}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "var(--clr-muted-fg)" }}>Last Output:</span>
          <span style={{ fontWeight: 600 }}>{pipeline.lastOutput}</span>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "auto" }}>
        <button style={{ padding: "6px 12px", background: "white", border: "1px solid #D6DCE5", borderRadius: "3px", fontSize: "12px", fontWeight: 600, color: "#1A2B3D", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}><IconSettings /> Config</button>
        <button style={{ padding: "6px 12px", background: "#007AB9", border: "none", borderRadius: "3px", fontSize: "12px", fontWeight: 600, color: "white", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}><IconPlay /> Execute</button>
      </div>
    </div>
  );
}

interface WorkflowRowProps {
  workflow: Workflow;
}

function WorkflowRow({ workflow }: WorkflowRowProps): React.JSX.Element {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      padding: "16px",
      borderBottom: "1px solid var(--clr-border)",
      justifyContent: "space-between"
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "14px", fontWeight: 600 }}>{workflow.name}</div>
        <div style={{ fontSize: "12px", color: "var(--clr-muted-fg)", marginTop: "4px" }}>Phase: {workflow.phase}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "200px" }}>
        <div style={{ flex: 1, height: "6px", background: "var(--clr-background)", borderRadius: "3px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${workflow.completion}%`, background: "#00A3E0", borderRadius: "3px" }} />
        </div>
        <div style={{ fontSize: "13px", fontWeight: 600, minWidth: "36px", textAlign: "right" }}>{workflow.completion}%</div>
      </div>
    </div>
  );
}

/* ───────────────────────── GRAPHS ───────────────────────── */

function CollaborationGraph(): React.JSX.Element {
  return (
    <div style={{
      width: "100%", height: "260px", background: "var(--clr-background)",
      borderRadius: "6px", border: "1px solid var(--clr-border)",
      position: "relative", overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "center"
    }}>
      {/* Background grid */}
      <svg width="100%" height="100%" style={{ position: "absolute", zIndex: 0, opacity: 0.4 }}>
        <defs>
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#D6DCE5" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Edges */}
      <svg width="100%" height="100%" style={{ position: "absolute", zIndex: 1 }}>
        {/* Plant to Hub */}
        <path d="M 150 130 C 250 130, 250 130, 350 130" fill="none" stroke="#00A3E0" strokeWidth="2" strokeDasharray="4 4">
          <animate attributeName="stroke-dashoffset" values="8;0" dur="1s" repeatCount="indefinite" />
        </path>
        {/* Hub to Registry */}
        <path d="M 450 130 C 550 80, 550 80, 650 80" fill="none" stroke="#007AB9" strokeWidth="2" />
        {/* Hub to Engineering */}
        <path d="M 450 130 C 550 180, 550 180, 650 180" fill="none" stroke="#7B5EA7" strokeWidth="2" />
      </svg>

      {/* Nodes */}
      <div style={{ position: "absolute", zIndex: 2, left: "50px", top: "100px", padding: "12px", background: "#FFF", border: "2px solid var(--clr-border)", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", textAlign: "center" }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#1A2B3D" }}>Edge Server</div>
        <div style={{ fontSize: "11px", color: "var(--clr-muted-fg)" }}>Plant 42</div>
      </div>

      <div style={{ position: "absolute", zIndex: 2, left: "350px", top: "100px", padding: "16px 24px", background: "#002F5A", color: "#FFF", border: "2px solid #007AB9", borderRadius: "8px", boxShadow: "0 8px 24px rgba(0,47,90,0.2)", textAlign: "center" }}>
        <div style={{ fontSize: "14px", fontWeight: 700 }}>Nexus Hub</div>
        <div style={{ fontSize: "11px", opacity: 0.8 }}>Orchestration</div>
      </div>

      <div style={{ position: "absolute", zIndex: 2, left: "650px", top: "50px", padding: "12px", background: "#FFF", border: "2px solid #007AB9", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", textAlign: "center" }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#007AB9" }}>Model Registry</div>
        <div style={{ fontSize: "11px", color: "var(--clr-muted-fg)" }}>Production</div>
      </div>

      <div style={{ position: "absolute", zIndex: 2, left: "650px", top: "150px", padding: "12px", background: "#FFF", border: "2px solid #7B5EA7", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", textAlign: "center" }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#7B5EA7" }}>CoE Engineering</div>
        <div style={{ fontSize: "11px", color: "var(--clr-muted-fg)" }}>Analysis</div>
      </div>
    </div>
  );
}

/* ───────────────────────── MAIN APP ───────────────────────── */

export default function NexusForge(): React.JSX.Element {
  const [search, setSearch] = useState<string>("");
  const [categoryFilters, setCategoryFilters] = useState<PipelineType[]>([]);
  const [statusFilters, setStatusFilters] = useState<PipelineStatus[]>([]);

  const toggle = <T extends string>(_arr: T[], setArr: React.Dispatch<React.SetStateAction<T[]>>) => (item: T): void => {
    setArr(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const filteredPipelines = useMemo<Pipeline[]>(() => {
    return PIPELINES.filter(p => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.id.toLowerCase().includes(search.toLowerCase())) return false;
      if (categoryFilters.length && !categoryFilters.includes(p.type)) return false;
      if (statusFilters.length && !statusFilters.includes(p.status)) return false;
      return true;
    });
  }, [search, categoryFilters, statusFilters]);

  const hasActiveFilters = categoryFilters.length > 0 || statusFilters.length > 0 || search.length > 0;

  return (
    <div style={{
      fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif",
      fontSize: "14px",
      color: "var(--clr-foreground)",
      background: "var(--clr-background)",
      minHeight: "100vh",

      /* LINDE BRAND THEME */
      "--clr-background": "#F5F7FA",
      "--clr-foreground": "#1A2B3D",
      "--clr-card": "#FFFFFF",
      "--clr-card-fg": "#1A2B3D",
      "--clr-popover": "#FFFFFF",
      "--clr-muted": "#EDF0F5",
      "--clr-muted-fg": "#5C6B7F",
      "--clr-border": "#D6DCE5",
      "--clr-input": "#D6DCE5",
      "--clr-ring": "#007AB9",
      "--clr-primary": "#007AB9",
      "--clr-primary-fg": "#FFFFFF",
      "--clr-sidebar": "#FFFFFF",
      "--clr-sidebar-border": "#E2E8F0",
      "--clr-destructive": "#CC3340",
    } as React.CSSProperties}>
      {/* ════════════ TOPBAR ════════════ */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "52px",
        padding: "0 24px",
        background: "#002F5A",
        borderBottom: "none",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#FFFFFF" }}>
            <IconGitMerge />
            <span style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "-0.01em" }}>
              Nexus Forge
            </span>
          </div>
          <span style={{
            fontSize: "10px",
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: "3px",
            background: "#00A3E0",
            color: "#fff",
            letterSpacing: "0.05em",
          }}>
            WORKSPACE
          </span>
          <a href="#" style={{
            display: "flex", alignItems: "center", gap: "5px",
            fontSize: "12.5px", fontWeight: 600, color: "#7AB8DD",
            textDecoration: "none", marginLeft: "8px",
          }}>
            <IconActivity /> ACTIVITY LOGS
          </a>
        </div>

        {/* Search */}
        <div style={{ position: "relative", width: "320px" }}>
          <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#6e8faa" }}>
            <IconSearch />
          </span>
          <input
            type="text"
            placeholder="Search pipelines, workflows..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "7px 12px 7px 32px",
              borderRadius: "4px",
              border: "1px solid #1A4B73",
              background: "#003D6B",
              color: "#FFFFFF",
              fontSize: "13px",
              outline: "none",
              boxSizing: "border-box",
            }}
            onFocus={e => { e.target.style.borderColor = "#00A3E0"; e.target.style.boxShadow = "0 0 0 2px rgba(0,163,224,0.25)"; }}
            onBlur={e => { e.target.style.borderColor = "#1A4B73"; e.target.style.boxShadow = "none"; }}
          />
        </div>
      </div>

      {/* Accent stripe */}
      <div style={{ height: "3px", background: "linear-gradient(90deg, #007AB9, #00A3E0)" }} />

      {/* ════════════ BODY ════════════ */}
      <div style={{ display: "flex", minHeight: "calc(100vh - 55px)" }}>

        {/* Sidebar */}
        <aside style={{
          width: "220px",
          flexShrink: 0,
          background: "var(--clr-sidebar)",
          borderRight: "1px solid var(--clr-sidebar-border)",
          padding: "18px 14px",
          overflowY: "auto",
          position: "sticky",
          top: "55px",
          height: "calc(100vh - 55px)",
        }}>
          <SidebarSection title="Categories" items={CATEGORIES} activeFilters={categoryFilters} onToggle={toggle(categoryFilters, setCategoryFilters)} />
          <div style={{ height: "1px", background: "var(--clr-sidebar-border)", margin: "8px 0 16px" }} />
          <SidebarSection title="Status" items={STATUSES} activeFilters={statusFilters} onToggle={toggle(statusFilters, setStatusFilters)} />

          {hasActiveFilters && (
            <button
              onClick={() => { setCategoryFilters([]); setStatusFilters([]); setSearch(""); }}
              style={{
                marginTop: "8px", padding: "6px 12px",
                fontSize: "12px", fontWeight: 600,
                color: "var(--clr-destructive)",
                background: "transparent",
                border: "1px solid var(--clr-destructive)",
                borderRadius: "4px",
                cursor: "pointer",
                width: "100%",
                transition: "background 150ms",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "#CC33400D"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >
              Clear all filters
            </button>
          )}
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, padding: "24px 28px", overflowY: "auto" }}>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", marginBottom: "32px" }}>
            {/* Pipelines Grid */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <h2 style={{ fontSize: "17px", fontWeight: 700, margin: "0 0 4px" }}>Active Pipelines</h2>
                  <p style={{ fontSize: "13px", color: "var(--clr-muted-fg)", margin: 0 }}>Showing {filteredPipelines.length} operational pipelines</p>
                </div>
                <button style={{ padding: "6px 12px", background: "var(--clr-primary)", border: "none", borderRadius: "3px", fontSize: "12px", fontWeight: 600, color: "white", cursor: "pointer" }}>+ New Pipeline</button>
              </div>

              {filteredPipelines.length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                  {filteredPipelines.map(p => <PipelineCard key={p.id} pipeline={p} />)}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "40px", background: "var(--clr-card)", border: "1px dashed var(--clr-border)", borderRadius: "4px", color: "var(--clr-muted-fg)" }}>
                  No pipelines match the current filters.
                </div>
              )}
            </div>

            {/* Workflows List */}
            <div>
              <div style={{ marginBottom: "16px" }}>
                <h2 style={{ fontSize: "17px", fontWeight: 700, margin: "0 0 4px" }}>Running Workflows</h2>
                <p style={{ fontSize: "13px", color: "var(--clr-muted-fg)", margin: 0 }}>Tasks pending across the nexus</p>
              </div>
              <div style={{ background: "var(--clr-card)", border: "1px solid var(--clr-border)", borderRadius: "6px" }}>
                {WORKFLOWS.map((wf) => (
                  <WorkflowRow key={wf.id} workflow={wf} />
                ))}
                <div style={{ padding: "12px", textAlign: "center", borderTop: "1px solid var(--clr-border)", fontSize: "13px", color: "var(--clr-primary)", fontWeight: 600, cursor: "pointer" }}>
                  View All Workflows
                </div>
              </div>
            </div>
          </div>

          {/* Collaboration Graph Section */}
          <div style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "17px", fontWeight: 700, margin: "0 0 4px" }}>Network Activity Graph</h2>
            <p style={{ fontSize: "13px", color: "var(--clr-muted-fg)", margin: "0 0 16px" }}>Live orchestration overview across edge nodes and engineering centers</p>
            <CollaborationGraph />
          </div>

          {/* Footer */}
          <div style={{
            marginTop: "40px",
            paddingTop: "20px",
            borderTop: "1px solid var(--clr-border)",
            display: "flex",
            justifyContent: "space-between",
            fontSize: "11px",
            color: "var(--clr-muted-fg)",
          }}>
            <span>LENA — Linde's Enterprise Nexus AI · Nexus Forge Workspace</span>
            <span>{PIPELINES.length} Pipelines · {WORKFLOWS.length} Workflows Active</span>
          </div>

        </main>
      </div>
    </div>
  );
}
