import React, { useState, useMemo } from "react";

/* ───────────────────────── TYPES ───────────────────────── */

type ModelType = "Foundation" | "Agent" | "Trainable";
type Modality = "Language" | "Vision" | "Tabular" | "Timeseries" | "Documents" | "Speech" | "Dialogue" | "Reasoning";
type Task = "Classification" | "Detection" | "Extraction" | "Forecasting" | "Generation" | "Optimization" | "Anomaly Detection" | "Recognition" | "Regression";

interface Model {
  id: string;
  name: string;
  desc: string;
  type: ModelType;
  modality: Modality[];
  task: Task[];
  featured?: boolean;
}

interface TypeColor {
  bg: string;
  fg: string;
}

/* ───────────────────────── DATA ───────────────────────── */

const MODELS: Model[] = [
  // Foundation Models
  { id: "lena-core-v3", name: "LENA Core v3", desc: "Enterprise reasoning engine powering cross-domain decision orchestration across 600+ Linde facilities.", type: "Foundation", modality: ["Language", "Reasoning"], task: ["Generation", "Classification"], featured: true },
  { id: "lena-vision-asu", name: "LENA Vision — ASU", desc: "Real-time visual inspection model for Air Separation Unit components. Trained on 2.4M annotated frames from Linde plant cameras.", type: "Foundation", modality: ["Vision"], task: ["Detection", "Classification"], featured: true },
  { id: "lena-timeseries", name: "LENA TimeSeries", desc: "Multivariate time-series forecasting for compressor health, energy consumption, and production throughput.", type: "Foundation", modality: ["Tabular", "Timeseries"], task: ["Forecasting", "Anomaly Detection"], featured: true },
  { id: "lena-nlp-ops", name: "LENA NLP — Operations", desc: "Domain-tuned language model for maintenance logs, safety reports, and operational procedure extraction.", type: "Foundation", modality: ["Language", "Documents"], task: ["Extraction", "Classification"], featured: true },

  // Agent Models
  { id: "agent-supply-chain", name: "Supply Chain Optimizer", desc: "Route optimization and fleet dispatch agent for 8,000+ tanker fleet. Integrates with IBM Sterling and SAP TM.", type: "Agent", modality: ["Tabular"], task: ["Optimization", "Forecasting"] },
  { id: "agent-maintenance", name: "Predictive Maintenance Agent", desc: "Schedules maintenance windows using vibration, temperature, and pressure telemetry from 600+ DCS systems.", type: "Agent", modality: ["Tabular", "Timeseries"], task: ["Anomaly Detection", "Forecasting"] },
  { id: "agent-pricing", name: "Dynamic Pricing Engine", desc: "AI-driven pricing for industrial gas contracts. Factors in energy costs, take-or-pay commitments, and market signals.", type: "Agent", modality: ["Tabular"], task: ["Optimization", "Generation"] },
  { id: "agent-safety", name: "Safety & PSM Monitor", desc: "Process Safety Management agent monitoring 80,000+ customer installations for compliance and risk anomalies.", type: "Agent", modality: ["Documents", "Tabular"], task: ["Detection", "Classification"] },
  { id: "agent-churn", name: "Customer Churn Predictor", desc: "Identifies at-risk customer accounts using telemetry patterns, delivery data, and contract usage signals.", type: "Agent", modality: ["Tabular"], task: ["Classification", "Forecasting"] },
  { id: "agent-energy", name: "Energy Optimizer", desc: "Real-time energy cost optimization across ASU plants. Shifts production loads based on grid pricing and demand forecasts.", type: "Agent", modality: ["Tabular", "Timeseries"], task: ["Optimization"] },

  // Trainable / Fine-tunable Models
  { id: "train-defect-classifier", name: "Defect Classifier", desc: "Fine-tunable vision model for identifying equipment defects. Transfer-learn on plant-specific imagery.", type: "Trainable", modality: ["Vision"], task: ["Classification", "Detection"] },
  { id: "train-doc-parser", name: "Document Parser", desc: "Custom document extraction model for safety permits, inspection reports, and regulatory filings.", type: "Trainable", modality: ["Documents", "Language"], task: ["Extraction"] },
  { id: "train-oee-predictor", name: "OEE Predictor", desc: "Trainable model for Overall Equipment Effectiveness prediction. Customizable per plant configuration.", type: "Trainable", modality: ["Tabular"], task: ["Forecasting", "Regression"] },
  { id: "train-speech-ops", name: "Speech — Field Ops", desc: "Automatic speech recognition tuned for industrial field environments with high-noise conditions.", type: "Trainable", modality: ["Speech"], task: ["Recognition"] },
  { id: "train-anomaly-generic", name: "Anomaly Detector", desc: "General-purpose anomaly detection model adaptable to any Linde telemetry stream.", type: "Trainable", modality: ["Tabular", "Timeseries"], task: ["Anomaly Detection"] },
  { id: "train-dialogue-eos", name: "EOS Dialogue Tuner", desc: "Fine-tune the EOS Assistant's conversational abilities for domain-specific Q&A and operator support.", type: "Trainable", modality: ["Language", "Dialogue"], task: ["Generation"] },
];

const MODALITIES: Modality[] = ["Language", "Vision", "Tabular", "Timeseries", "Documents", "Speech", "Dialogue", "Reasoning"];
const TASKS: Task[] = ["Classification", "Detection", "Extraction", "Forecasting", "Generation", "Optimization", "Anomaly Detection", "Recognition", "Regression"];
const TYPES: ModelType[] = ["Foundation", "Agent", "Trainable"];

/* Linde-aligned type badge colors */
const TYPE_COLORS: Record<ModelType, TypeColor> = {
  Foundation: { bg: "#007AB9", fg: "#fff" },
  Agent: { bg: "#002F5A", fg: "#fff" },
  Trainable: { bg: "#00A3E0", fg: "#fff" },
};

/* Modality badge colors — muted professional tones that work on white */
const MODALITY_COLORS: Record<Modality, string> = {
  Language: "#4A6FA5",
  Vision: "#C2721E",
  Tabular: "#2D8659",
  Timeseries: "#7B5EA7",
  Documents: "#5F7080",
  Speech: "#B8433A",
  Dialogue: "#1A8A7A",
  Reasoning: "#3D5066",
};

/* ───────────────────────── ICONS (inline SVG) ───────────────────────── */

function IconSearch(): React.JSX.Element {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
}
function IconBrain(): React.JSX.Element {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4 4 0 0 0-4 4v1a4 4 0 0 0-4 4c0 1.5.8 2.8 2 3.5V17a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4v-2.5c1.2-.7 2-2 2-3.5a4 4 0 0 0-4-4V6a4 4 0 0 0-4-4z" /><path d="M12 2v20" /><path d="M8 7h8" /><path d="M8 12h8" /></svg>;
}
function IconFlask(): React.JSX.Element {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3h6" /><path d="M10 3v7.4a2 2 0 0 1-.5 1.3L4 18.6a1 1 0 0 0 .7 1.7h14.6a1 1 0 0 0 .7-1.7l-5.5-6.9a2 2 0 0 1-.5-1.3V3" /></svg>;
}
function IconCpu(): React.JSX.Element {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><path d="M15 2v2" /><path d="M15 20v2" /><path d="M2 15h2" /><path d="M2 9h2" /><path d="M20 15h2" /><path d="M20 9h2" /><path d="M9 2v2" /><path d="M9 20v2" /></svg>;
}
function IconExternalLink(): React.JSX.Element {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>;
}
function IconNetwork(): React.JSX.Element {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="3" /><circle cx="5" cy="19" r="3" /><circle cx="19" cy="19" r="3" /><path d="M12 8v3" /><path d="M6.5 17L10 13" /><path d="M17.5 17L14 13" /><circle cx="12" cy="13" r="2" /></svg>;
}
function IconChevron(): React.JSX.Element {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>;
}
function IconRegistry(): React.JSX.Element {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8" /><path d="M12 17v4" /></svg>;
}

/* ───────────────────────── COMPONENTS ───────────────────────── */

interface BadgeProps {
  label: string;
  color?: string;
  textColor?: string;
}

function Badge({ label, color, textColor }: BadgeProps): React.JSX.Element {
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: "3px",
      fontSize: "11px",
      fontWeight: 600,
      letterSpacing: "0.02em",
      background: color || "var(--clr-muted)",
      color: textColor || "var(--clr-foreground)",
      lineHeight: "18px",
      whiteSpace: "nowrap",
    }}>
      {label}
    </span>
  );
}

interface ModelCardProps {
  model: Model;
}

function ModelCard({ model }: ModelCardProps): React.JSX.Element {
  const tc: TypeColor = TYPE_COLORS[model.type] || { bg: "", fg: "" };
  return (
    <div style={{
      background: "var(--clr-card)",
      border: "1px solid var(--clr-border)",
      borderRadius: "4px",
      padding: 0,
      display: "flex",
      flexDirection: "column",
      transition: "box-shadow 150ms, transform 150ms",
      cursor: "pointer",
      minHeight: "210px",
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,47,90,0.10)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      {/* Tags row */}
      <div style={{ padding: "14px 16px 0", display: "flex", flexWrap: "wrap", gap: "5px" }}>
        <Badge label={model.type} color={tc.bg} textColor={tc.fg} />
        {model.modality.map(m => (
          <Badge key={m} label={m} color={`${MODALITY_COLORS[m]}14`} textColor={MODALITY_COLORS[m]} />
        ))}
      </div>

      {/* Title + description */}
      <div style={{ padding: "10px 16px 0", flex: 1 }}>
        <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--clr-foreground)", marginBottom: "6px", lineHeight: 1.3 }}>
          {model.name}
        </div>
        <div style={{ fontSize: "12.5px", color: "var(--clr-muted-fg)", lineHeight: 1.55 }}>
          {model.desc}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--clr-border)", marginTop: "auto" }}>
        <code style={{ fontSize: "11px", color: "var(--clr-muted-fg)", fontFamily: "'SF Mono', 'Cascadia Code', 'Consolas', monospace" }}>
          {model.id}
        </code>
        <span style={{ fontSize: "12px", fontWeight: 600, color: "#007AB9", display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}>
          VIEW DETAILS <IconExternalLink />
        </span>
      </div>
    </div>
  );
}

interface SidebarSectionProps {
  title: string;
  items: string[];
  counts: Record<string, number>;
  activeFilters: string[];
  onToggle: (item: any) => void;
}

function SidebarSection({ title, items, counts, activeFilters, onToggle }: SidebarSectionProps): React.JSX.Element {
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
            const count = counts[item] || 0;
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
                <span style={{ fontSize: "11px", color: "var(--clr-muted-fg)", fontWeight: 400, minWidth: "20px", textAlign: "right" }}>{count}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface HeroCardProps {
  icon: React.JSX.Element;
  title: string;
  desc: string;
  onClick: () => void;
  highlight?: boolean;
}

function HeroCard({ icon, title, desc, onClick, highlight }: HeroCardProps): React.JSX.Element {
  return (
    <div
      onClick={onClick}
      style={{
        flex: "1 1 0",
        minWidth: "200px",
        padding: "22px 20px",
        border: highlight ? "2px solid #007AB9" : "2px solid var(--clr-border)",
        borderRadius: "4px",
        cursor: "pointer",
        transition: "border-color 200ms, box-shadow 200ms",
        background: "var(--clr-card)",
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "#007AB9"; e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,122,185,0.10)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = highlight ? "#007AB9" : "var(--clr-border)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <div style={{ marginBottom: "12px", color: "#007AB9" }}>{icon}</div>
      <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--clr-foreground)", marginBottom: "6px" }}>{title}</div>
      <div style={{ fontSize: "13px", color: "var(--clr-muted-fg)", lineHeight: 1.55 }}>{desc}</div>
    </div>
  );
}

interface ModelSectionProps {
  title: string;
  subtitle: string;
  models: Model[];
  showAll: boolean;
  onToggleShowAll: () => void;
}

function ModelSection({ title, subtitle, models, showAll, onToggleShowAll }: ModelSectionProps): React.JSX.Element {
  const displayed = showAll ? models : models.slice(0, 4);
  return (
    <div style={{ marginBottom: "36px" }}>
      <h2 style={{ fontSize: "17px", fontWeight: 700, color: "var(--clr-foreground)", margin: "0 0 4px" }}>{title}</h2>
      <p style={{ fontSize: "13px", color: "var(--clr-muted-fg)", margin: "0 0 16px" }}>{subtitle}</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "14px" }}>
        {displayed.map(m => <ModelCard key={m.id} model={m} />)}
      </div>
      {models.length > 4 && (
        <button
          onClick={onToggleShowAll}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            margin: "14px 0 0", padding: "6px 0",
            background: "none", border: "none", cursor: "pointer",
            fontSize: "13px", fontWeight: 600, color: "#007AB9",
          }}
        >
          <span style={{ transform: showAll ? "rotate(180deg)" : "rotate(0)", transition: "transform 150ms", display: "flex" }}>
            <IconChevron />
          </span>
          {showAll ? "SHOW LESS" : `SHOW ALL (${models.length})`}
        </button>
      )}
    </div>
  );
}

/* ───────────────────────── MAIN APP ───────────────────────── */

export default function NexusModels(): React.JSX.Element {
  const [search, setSearch] = useState<string>("");
  const [modalityFilters, setModalityFilters] = useState<Modality[]>([]);
  const [taskFilters, setTaskFilters] = useState<Task[]>([]);
  const [showFoundation, setShowFoundation] = useState<boolean>(false);
  const [showAgent, setShowAgent] = useState<boolean>(false);
  const [showTrainable, setShowTrainable] = useState<boolean>(false);

  const toggle = <T extends string>(_arr: T[], setArr: React.Dispatch<React.SetStateAction<T[]>>) => (item: T): void => {
    setArr(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const filtered = useMemo<Model[]>(() => {
    return MODELS.filter(m => {
      if (search && !m.name.toLowerCase().includes(search.toLowerCase()) && !m.desc.toLowerCase().includes(search.toLowerCase()) && !m.id.toLowerCase().includes(search.toLowerCase())) return false;
      if (modalityFilters.length && !modalityFilters.some(f => m.modality.includes(f))) return false;
      if (taskFilters.length && !taskFilters.some(f => m.task.includes(f))) return false;
      return true;
    });
  }, [search, modalityFilters, taskFilters]);

  const modalityCounts = useMemo<Record<string, number>>(() => {
    const c: Record<string, number> = {};
    MODELS.forEach(m => m.modality.forEach(mod => { c[mod] = (c[mod] || 0) + 1; }));
    return c;
  }, []);

  const taskCounts = useMemo<Record<string, number>>(() => {
    const c: Record<string, number> = {};
    MODELS.forEach(m => m.task.forEach(t => { c[t] = (c[t] || 0) + 1; }));
    return c;
  }, []);

  const foundation = filtered.filter(m => m.type === "Foundation");
  const agent = filtered.filter(m => m.type === "Agent");
  const trainable = filtered.filter(m => m.type === "Trainable");

  const hasActiveFilters = modalityFilters.length > 0 || taskFilters.length > 0 || search.length > 0;

  return (
    <div style={{
      fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif",
      fontSize: "14px",
      color: "var(--clr-foreground)",
      background: "var(--clr-background)",
      minHeight: "100vh",

      /* ═══════════════════════════════════════════════════════
         LINDE BRAND THEME — Light Professional
         Primary:  #007AB9  (Linde Blue / Lochmara)
         Dark:     #002F5A  (Prussian Blue)
         Accent:   #00A3E0  (Linde Cyan)
         ═══════════════════════════════════════════════════════ */
      "--clr-background": "#F5F7FA",
      "--clr-foreground": "#1A2B3D",
      "--clr-card": "#FFFFFF",
      "--clr-card-fg": "#1A2B3D",
      "--clr-popover": "#FFFFFF",
      "--clr-muted": "#EDF0F5",
      "--clr-muted-fg": "#5C6B7F",
      "--clr-secondary": "#E8EFF7",
      "--clr-secondary-fg": "#002F5A",
      "--clr-border": "#D6DCE5",
      "--clr-input": "#D6DCE5",
      "--clr-ring": "#007AB9",
      "--clr-primary": "#007AB9",
      "--clr-primary-fg": "#FFFFFF",
      "--clr-accent": "#00A3E0",
      "--clr-accent-fg": "#FFFFFF",
      "--clr-destructive": "#CC3340",
      "--clr-chart1": "#007AB9",
      "--clr-chart2": "#2D8659",
      "--clr-chart3": "#E6930E",
      "--clr-chart5": "#7B5EA7",
      "--clr-sidebar": "#FFFFFF",
      "--clr-sidebar-fg": "#3D4F63",
      "--clr-sidebar-primary": "#007AB9",
      "--clr-sidebar-accent": "#F0F5FA",
      "--clr-sidebar-border": "#E2E8F0",
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
            <IconNetwork />
            <span style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "-0.01em" }}>
              Nexus Models
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
            PREVIEW
          </span>
          <a href="#" style={{
            display: "flex", alignItems: "center", gap: "5px",
            fontSize: "12.5px", fontWeight: 600, color: "#7AB8DD",
            textDecoration: "none", marginLeft: "8px",
          }}>
            <IconRegistry /> VIEW MODEL REGISTRY
          </a>
        </div>

        {/* Search */}
        <div style={{ position: "relative", width: "320px" }}>
          <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#6e8faa" }}>
            <IconSearch />
          </span>
          <input
            type="text"
            placeholder="Search models, tasks, modalities…"
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

      {/* Linde blue accent stripe */}
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
          <SidebarSection title="Modalities" items={MODALITIES} counts={modalityCounts} activeFilters={modalityFilters} onToggle={toggle(modalityFilters, setModalityFilters)} />
          <div style={{ height: "1px", background: "var(--clr-sidebar-border)", margin: "8px 0 16px" }} />
          <SidebarSection title="Tasks" items={TASKS} counts={taskCounts} activeFilters={taskFilters} onToggle={toggle(taskFilters, setTaskFilters)} />

          {hasActiveFilters && (
            <button
              onClick={() => { setModalityFilters([]); setTaskFilters([]); setSearch(""); }}
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

          {/* Hero cards */}
          <div style={{ display: "flex", gap: "14px", marginBottom: "32px", flexWrap: "wrap" }}>
            <HeroCard
              icon={<IconFlask />}
              title="Browse Common Tasks"
              desc="Find models for classification, detection, forecasting, and optimization — tuned for Linde's industrial operations."
              onClick={() => { }}
            />
            <HeroCard
              icon={<IconBrain />}
              title="Explore LENA Agents"
              desc="Discover autonomous AI agents making 1,200+ decisions per hour across supply chain, manufacturing, and commercial domains."
              onClick={() => { setModalityFilters([]); setTaskFilters([]); setSearch("Agent"); }}
              highlight
            />
            <HeroCard
              icon={<IconCpu />}
              title="View My Models"
              desc="Models you've deployed, fine-tuned, or imported into LENA's Model Registry across your assigned facilities."
              onClick={() => { }}
            />
          </div>

          {/* Active filters display */}
          {hasActiveFilters && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "18px", alignItems: "center" }}>
              <span style={{ fontSize: "12px", color: "var(--clr-muted-fg)", marginRight: "4px" }}>Filters:</span>
              {modalityFilters.map(f => (
                <span key={f} onClick={() => toggle(modalityFilters, setModalityFilters)(f)}
                  style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 10px", borderRadius: "3px", fontSize: "11px", fontWeight: 600, cursor: "pointer", background: `${MODALITY_COLORS[f]}14`, color: MODALITY_COLORS[f] }}>
                  {f} ×
                </span>
              ))}
              {taskFilters.map(f => (
                <span key={f} onClick={() => toggle(taskFilters, setTaskFilters)(f)}
                  style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 10px", borderRadius: "3px", fontSize: "11px", fontWeight: 600, cursor: "pointer", background: "#007AB914", color: "#007AB9" }}>
                  {f} ×
                </span>
              ))}
              {search && (
                <span onClick={() => setSearch("")}
                  style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 10px", borderRadius: "3px", fontSize: "11px", fontWeight: 600, cursor: "pointer", background: "var(--clr-muted)", color: "var(--clr-foreground)" }}>
                  "{search}" ×
                </span>
              )}
            </div>
          )}

          {/* Results summary */}
          <div style={{ fontSize: "12px", color: "var(--clr-muted-fg)", marginBottom: "20px" }}>
            Showing {filtered.length} of {MODELS.length} models
            {hasActiveFilters && " (filtered)"}
          </div>

          {/* Model sections */}
          {foundation.length > 0 && (
            <ModelSection
              title="Foundation Models"
              subtitle="Pre-trained multi-task models powering LENA's enterprise reasoning. Can be further tuned or deployed directly."
              models={foundation}
              showAll={showFoundation}
              onToggleShowAll={() => setShowFoundation(!showFoundation)}
            />
          )}

          {agent.length > 0 && (
            <ModelSection
              title="Agent Models"
              subtitle="Autonomous decision-making agents operating across Linde's 600+ facilities and 80,000+ customer installations."
              models={agent}
              showAll={showAgent}
              onToggleShowAll={() => setShowAgent(!showAgent)}
            />
          )}

          {trainable.length > 0 && (
            <ModelSection
              title="Trainable Models"
              subtitle="Models that Linde's CoE team can fine-tune through custom notebooks, pipelines, or on-site data."
              models={trainable}
              showAll={showTrainable}
              onToggleShowAll={() => setShowTrainable(!showTrainable)}
            />
          )}

          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--clr-muted-fg)" }}>
              <div style={{ fontSize: "15px", fontWeight: 600, marginBottom: "6px" }}>No models match your filters</div>
              <div style={{ fontSize: "13px" }}>Try adjusting your search or clearing filters.</div>
            </div>
          )}

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
            <span>LENA — Linde's Enterprise Nexus AI · Nexus Models Registry</span>
            <span>{MODELS.length} models · {TYPES.length} categories · {MODALITIES.length} modalities</span>
          </div>
        </main>
      </div>
    </div>
  );
}
