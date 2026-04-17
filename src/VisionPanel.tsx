import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────────

type Dept = {
  id:         string;
  to:         string;
  desc:       string;
  icon:       React.ReactNode;
  borderFull: string;
  bgColor:    string;
  textColor:  string;
};

// ── Icons (illustration-style SVGs matching dashboard aesthetic) ───────────────

const SupplyChainIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="2" y="28" width="28" height="14" rx="2" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.8"/>
    <rect x="6" y="22" width="16" height="8" rx="1.5" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1.6"/>
    <circle cx="10" cy="43" r="3.5" fill="currentColor" stroke="white" strokeWidth="1.5"/>
    <circle cx="24" cy="43" r="3.5" fill="currentColor" stroke="white" strokeWidth="1.5"/>
    <path d="M30 35h6l4 5v3h-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="36" cy="43" r="3.5" fill="currentColor" stroke="white" strokeWidth="1.5"/>
    <path d="M8 22v-5l6-4h8l4 4v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M36 18l4 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2"/>
    <circle cx="38" cy="12" r="4" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M36 12h4M38 10v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

const ManufacturingIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="4" y="20" width="40" height="24" rx="2" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.8"/>
    <rect x="8" y="24" width="8" height="16" rx="1" fill="currentColor" fillOpacity="0.25"/>
    <rect x="20" y="24" width="8" height="16" rx="1" fill="currentColor" fillOpacity="0.25"/>
    <rect x="32" y="24" width="8" height="16" rx="1" fill="currentColor" fillOpacity="0.25"/>
    <path d="M4 20l8-10h8l4 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20 20l4-10h8l8 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="36" cy="10" r="5" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M34 10h4M36 8v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <circle cx="36" cy="10" r="2" fill="currentColor" fillOpacity="0.4"/>
    <path d="M10 8l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <path d="M6 4h8v8H6z" rx="1" stroke="currentColor" strokeWidth="1.4" fill="currentColor" fillOpacity="0.1"/>
  </svg>
);

const CommercialIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="4" y="8" width="32" height="28" rx="2" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.8"/>
    <rect x="8" y="12" width="24" height="18" rx="1" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 1.5"/>
    <path d="M10 26l6-7 5 4 5-8 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="36" cy="34" r="8" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.8"/>
    <circle cx="36" cy="34" r="3" fill="currentColor" fillOpacity="0.4"/>
    <path d="M36 27v3M36 38v3M29 34h3M40 34h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <path d="M31.5 29.5l2 2M38.5 36.5l2 2M31.5 38.5l2-2M38.5 31.5l2-2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M18 32l3-1 1 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

const FinanceIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="4" y="10" width="34" height="28" rx="2" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M10 30l6-9 5 5 5-10 5 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="38" cy="14" r="8" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.8"/>
    <text x="35" y="18" fill="currentColor" fontSize="11" fontWeight="bold" fontFamily="sans-serif">$</text>
    <rect x="8" y="32" width="6" height="4" rx="0.8" fill="currentColor" fillOpacity="0.3"/>
    <rect x="16" y="28" width="6" height="8" rx="0.8" fill="currentColor" fillOpacity="0.4"/>
    <rect x="24" y="24" width="6" height="12" rx="0.8" fill="currentColor" fillOpacity="0.5"/>
    <path d="M10 18h12M10 22h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

const HRSafetyIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="16" cy="14" r="6" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.8"/>
    <path d="M4 36c0-7 5-10 12-10s12 3 12 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    <circle cx="34" cy="12" r="4" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M26 32c0-4 3-6 8-6s8 2 8 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <path d="M30 38l3 3 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="33" cy="38" r="7" stroke="currentColor" strokeWidth="1.6" fill="currentColor" fillOpacity="0.08"/>
    <path d="M10 44h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="2 2"/>
  </svg>
);

const ITSecurityIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M24 4l16 6v12c0 10-7 18-16 22C15 40 8 32 8 22V10l16-6z" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    <rect x="16" y="20" width="16" height="12" rx="2" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M20 20v-3a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <circle cx="24" cy="26" r="2.5" fill="currentColor" fillOpacity="0.6"/>
    <path d="M24 26v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <circle cx="36" cy="10" r="4" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M34.5 10h3M36 8.5v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

// ── Data ───────────────────────────────────────────────────────────────────────

const DEPTS: Dept[] = [
  {
    id:         "Supply Chain",
    to:         "/supply-chain",
    desc:       "Fleet logistics, tank monitoring & route optimisation",
    icon:       <SupplyChainIcon className="h-8 w-8" />,
    borderFull: "border-primary",
    bgColor:    "bg-primary/10",
    textColor:  "text-primary",
  },
  {
    id:         "Manufacturing",
    to:         "/manufacturing",
    desc:       "ASU & hydrogen plant ops, OEE & predictive maintenance",
    icon:       <ManufacturingIcon className="h-8 w-8" />,
    borderFull: "border-chart-2",
    bgColor:    "bg-chart-2/10",
    textColor:  "text-chart-2",
  },
  {
    id:         "Commercial & Trading",
    to:         "/commercial",
    desc:       "AI pricing engine, customer churn & contract management",
    icon:       <CommercialIcon className="h-8 w-8" />,
    borderFull: "border-chart-5",
    bgColor:    "bg-chart-5/10",
    textColor:  "text-chart-5",
  },
  {
    id:         "Finance",
    to:         "/finance",
    desc:       "Financial close, ROI tracking & SAP S/4HANA migration",
    icon:       <FinanceIcon className="h-8 w-8" />,
    borderFull: "border-chart-3",
    bgColor:    "bg-chart-3/10",
    textColor:  "text-chart-3",
  },
  {
    id:         "HR & Safety",
    to:         "/hr",
    desc:       "Workforce AI adoption, safety alerts & permit digitisation",
    icon:       <HRSafetyIcon className="h-8 w-8" />,
    borderFull: "border-accent",
    bgColor:    "bg-accent/10",
    textColor:  "text-accent",
  },
  {
    id:         "IT & Cybersecurity",
    to:         "/it",
    desc:       "OT/IT threat status, patch compliance & ticket deflection",
    icon:       <ITSecurityIcon className="h-8 w-8" />,
    borderFull: "border-destructive",
    bgColor:    "bg-destructive/10",
    textColor:  "text-destructive",
  },
];

// ── Card Component ─────────────────────────────────────────────────────────────

function DeptCard({ dept }: { dept: Dept }) {
  return (
    <Link key={dept.id} to={dept.to} className="group focus:outline-none">
      <div className={cn(
        "relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-border bg-card",
        "transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-md",
        "cursor-pointer h-full text-center"
      )}>
        {/* Hover border overlay */}
        <div className={cn(
          "pointer-events-none absolute inset-0 rounded-[inherit] border-2 border-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100",
          dept.borderFull,
        )} />

        {/* Icon */}
        <div className={cn(
          "flex items-center justify-center rounded-xl p-2 mb-1",
          dept.bgColor,
          dept.textColor,
        )}>
          {dept.icon}
        </div>

        {/* Name */}
        <p className="font-heading text-sm font-semibold text-foreground leading-tight">
          {dept.id}
        </p>

        {/* Description */}
        <p className="text-[11px] leading-relaxed text-muted-foreground px-1">
          {dept.desc}
        </p>

        {/* CTA */}
        <p className={cn(
          "text-[10px] font-semibold mt-1 opacity-50 transition-opacity duration-150 group-hover:opacity-100",
          dept.textColor
        )}>
          Open Dashboard →
        </p>
      </div>
    </Link>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function VisionPanel() {
  const firstRow = DEPTS.slice(0, 4);
  const secondRow = DEPTS.slice(4);

  return (
    <div className="flex h-full flex-col px-6 py-8">
      <div className="w-full max-w-4xl">

        {/* First row — 4 cards */}
        <div className="grid grid-cols-4 gap-3 mb-3">
          {firstRow.map((dept) => (
            <DeptCard key={dept.id} dept={dept} />
          ))}
        </div>

        {/* Second row — 2 cards, left-aligned */}
        <div className="grid grid-cols-4 gap-3">
          {secondRow.map((dept) => (
            <DeptCard key={dept.id} dept={dept} />
          ))}
        </div>

      </div>
    </div>
  );
}
