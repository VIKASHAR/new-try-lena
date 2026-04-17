# Design Document: Linde EOS — Enterprise AI Operating System

**Version:** 2.0  
**Audience:** Developers, LLM agents, and designers building on or extending the EOS platform  
**Context:** This document describes the design system, information architecture, interaction patterns, and data model of the Linde EOS — a command-and-control platform for orchestrating AI agents, monitoring real-time industrial operations (Air Separation Units, Hydrogen plants), and optimizing global supply chain logistics for a large-scale industrial gas company.

---

## 1. Platform Overview

Linde EOS is enterprise-grade web application that gives senior leaders (CTO, COO, CDO, CFO, VP-level) a unified interface to:

- **Monitor** real-time status of 600+ manufacturing facilities and 8,000+ tanker fleet vehicles
- **Manage** a network of 47+ autonomous AI agents making 1,200+ decisions per hour
- **Approve or override** AI-generated decisions via explicit human-in-the-loop workflows
- **Track** financial performance, regulatory compliance, and AI programme governance
- **Interact** with an AI assistant (EOS Assistant) via natural language for real-time queries

The interface is a single-page application structured as a fixed shell (topbar + sidebar) with a scrollable main content area. Navigation is instant — views are shown/hidden via CSS display toggling, not page loads.

---

## 2. Design Philosophy

### 2.1 Core Principles

- **Professional & Trustworthy.** The UI must convey the reliability of safety-critical industrial software. No gratuitous animations or decoration. Every visual element earns its place by communicating information or guiding action.
- **Information Density Without Clutter.** Views are data-rich. Hierarchy is managed through typographic scale, spatial grouping, and color-coded status — not by reducing information.
- **Action-Oriented.** Every screen has a primary action or decision to make. Critical states (alerts, pending approvals) are immediately visible without scrolling.
- **Operator-Familiar.** Users are experienced industrial managers. The UI uses domain language (ASU, OEE, PSM, take-or-pay, intercompany reconciliation) without explanation. Tooltips and drill-downs are for exploration, not basic orientation.

### 2.2 What This Platform Is Not

- Not a public-facing or consumer product
- Not a lightweight dashboard — it handles enterprise-scale data across multiple domains simultaneously
- Not a reports portal — it is an active control plane with approval workflows and AI orchestration

---

## 3. Visual Identity

### 3.1 Color Palette

All colors are defined as CSS custom properties on `:root` and must be referenced by variable name — never hardcoded hex in component-level CSS.

This system aligns directly with the application’s `index.css` (shadcn token structure).

---

### Backgrounds (Layered Surface System)

| Variable        | Usage                                     |
|-----------------|-------------------------------------------|
| `--background`  | Base page background                      |
| `--sidebar`     | Topbar, sidebar, navigation surfaces      |
| `--popover`     | Input fields, dropdowns, overlays         |
| `--muted`       | Hover states, subtle panels               |
| `--card`        | Cards, primary content containers         |
| `--secondary`   | Active cards, selected states             |

The background system uses **layering**, not shadows alone, to convey depth.

**Rule:** Never stack the same surface level directly (e.g., card on card). Always step through hierarchy.

---

### Text

| Variable                 | Usage                                       |
|--------------------------|---------------------------------------------|
| `--foreground`           | Primary content, headings, key values       |
| `--muted-foreground`     | Secondary labels, descriptions              |
| *(implicit lighter usage)* | Tertiary text (timestamps, hints)         |

---

### Brand Colors (Linde Identity)

| Variable                | Usage                                      |
|-------------------------|--------------------------------------------|
| `--primary`             | Primary brand color (Linde Blue)           |
| `--primary-foreground`  | Text on primary elements                   |

Brand color is used for:
- Primary buttons
- Active navigation
- Key highlights

It should **not replace status colors**.

---

### Status & Functional Colors

| Variable         | Meaning                          |
|------------------|----------------------------------|
| `--accent`       | Info / Active / In-progress      |
| `--chart-2`      | Success / Healthy / Operational  |
| `--chart-3`      | Warning / Attention              |
| `--destructive`  | Critical / Error / Urgent        |
| `--chart-5`      | AI / Special states              |
| `--chart-1`      | Secondary info / telemetry       |

**Rule:** These mappings must remain consistent across all views.

---

### Borders & Inputs

| Variable    | Usage                       |
|-------------|-----------------------------|
| `--border`  | Default borders             |
| `--input`   | Input field borders         |
| `--ring`    | Focus states / outlines     |

---

### Sidebar-Specific Tokens

| Variable                          | Usage                         |
|----------------------------------|-------------------------------|
| `--sidebar`                       | Sidebar background            |
| `--sidebar-foreground`            | Sidebar text                  |
| `--sidebar-primary`               | Active nav item               |
| `--sidebar-accent`                | Hover states                  |
| `--sidebar-border`                | Sidebar dividers              |

---

### Key Rule

All UI must use these variables directly.  
Do not introduce parallel systems like `--bg`, `--surface`, etc.

The design system is **token-driven**, and these tokens are the single source of truth.

---

## 4. Layout & Shell Architecture

### 4.1 App Shell

The application uses a fixed three-region CSS Grid layout:

```
┌────────────────────────────────────────────┐
│              TOPBAR (52px)                 │  ← grid-column: 1 / -1
├──────────────┬─────────────────────────────┤
│              │                             │
│  SIDEBAR     │       MAIN CONTENT          │
│  (220px)     │       (scrollable)          │
│              │                             │
└──────────────┴─────────────────────────────┘
```

- The shell never scrolls — only the main content area scrolls
- All views are rendered into the DOM at load time; only one is visible at a time via `.view.active`


## 5. Component Reference (Token-Aligned)

All components must use the global token system defined in Section 3.  
No hardcoded colors. No legacy variables (`--bg`, `--surface`, etc.).

---

### 5.1 Metric Cards

The primary KPI display unit.

**Structure**
- Container: `--card`
- Text: `--foreground`, `--muted-foreground`
- Border: `--border`

**Styles**
- Background: `var(--card)`
- Border: `1px solid var(--border)`
- Title: `var(--muted-foreground)`
- Value: uses semantic color (see below)

**Semantic Coloring**
- Info / Active → `--accent`
- Success → `--chart-2`
- Warning → `--chart-3`
- Critical → `--destructive`
- AI / Special → `--chart-5`

**Rule:** Color is applied only to the **value + top strip**, not the entire card.

---

### 5.2 Status Badges

Pill-shaped indicators.

**Base**
- Background: low-opacity version of semantic color
- Text: corresponding semantic color

**Mappings**
- Success → `--chart-2`
- Warning → `--chart-3`
- Critical → `--destructive`
- Info → `--accent`
- AI → `--chart-5`


### 5.6 Decision Cards

The most interactive component type — used in the AI Agent Network view for human-in-the-loop approvals.

Structure:
1. **Header row:** Decision title + urgency badge
2. **Agent tags row:** Pills showing which AI agents participated in this recommendation
3. **Outcome block:** Structured text summarizing the AI recommendation (customer, action, rationale, risk averted)
4. **Action buttons:** Approve (primary, green-ish on confirm) | Edit/Modify (ghost) | Override (danger)

On Approve: button changes to "✓ Dispatched!", fills with `--accent2`, disables. This is the primary micro-interaction pattern for human-in-the-loop workflows.

### 5.7 Flow Steps

Used in Supply Chain and other process views to illustrate multi-step AI workflows.

- Each step: icon container (tinted background) + title + detail text + status badge
- Steps connected by `↓` arrow dividers in `--text3`
- Final step is always an action state (human approval, agent execution, etc.)


## 6. Information Architecture

### 6.1 Page Inventory

| Page / View         | Nav Section     | Key Data Displayed                                         |
|---------------------|-----------------|-------------------------------------------------------------|
| Command Center      | Core            | 4 top KPIs, critical alerts feed, AI value delivered (YTD), 600+ facility heatmap |
| AI Agent Network    | Core            | Active agents list, live decision queue, agent performance chart |
| Supply Chain        | Departments     | Fleet status (8,000+ tankers), tank monitoring (80,000+ sites), route optimization |
| Manufacturing       | Departments     | ASU plant grid (600+), OEE metrics, predictive maintenance alerts |
| Commercial & Trading| Departments     | AI pricing engine, customer churn risk table               |
| Finance & ERP       | Departments     | Financial close tracker, ROI table, SAP S/4HANA migration progress |
| HR & Safety         | Departments     | Workforce AI adoption (3 levels), safety alerts, permit digitization |
| IT & Cybersecurity  | Departments     | OT/IT threat status, patch compliance, ticket deflection   |
| Centre of Excellence| Governance      | Phase-based AI transformation roadmap, certification progress |
| Ethics & Compliance | Governance      | AI risk tier table, model registry, bias audit status      |
| Risk Registry       | Governance      | Centralized risk table: OT security, regulatory, operational |
| Tech Debt Tracker   | System          | Application rationalization progress, legacy system retirement |
| EOS Assistant       | System          | AI chat interface with quick-action prompts and capability badges |

### 6.2 Command Center — Always the Entry Point

The Command Center (`view-dashboard`) is the default active view on login. It is intentionally the highest-information-density page — it surfaces the single most critical alert from each major domain simultaneously. A senior leader should be able to assess overall system health in under 10 seconds from this view.

The four top metrics (AI Agents Active, Fleet Utilization, Tech Debt, Pending Approvals) act as the platform's vital signs. Red/amber metrics here indicate the user must navigate to the relevant view for action.

---
## 9. Interaction Patterns

### 9.1 Human-in-the-Loop Approvals

This is the platform's most critical interaction pattern. When an AI agent reaches a decision requiring action above a confidence or risk threshold, it appears in the **Live Decision Queue** on the AI Agent Network view.

Flow: AI recommendation presented → User reads outcome summary → User selects Approve / Modify / Override → System logs decision with timestamp and role

**Approve:** Immediately executes the AI recommendation. Button transitions to confirmed state (green, disabled, "✓ Dispatched!").  
**Modify (Edit Route/Edit):** Opens an editor or form to adjust parameters before approval. In the prototype this shows an alert; in production this would open an inline form or modal.  
**Override:** Cancels the AI recommendation. Requires a mandatory reason input in production. Styled as `.btn-danger` (red-tinted) to signal the gravity of the action.

### 9.2 Tab Navigation (Within Views)

Departmental views use horizontal tab bars to switch between functional sub-sections without leaving the view. Tab switching is instant (CSS display toggle). The active tab is stored per view — navigating away and back preserves the last active tab.

### 9.3 Animated Status Indicators

- **Pulse dots** (7px circles): Used in the topbar and live data panels to indicate streaming/live status. Animate via `pulseAnim` keyframe (opacity 1 → 0.5 → 1, 2s cycle). Green = fully live, amber = degraded or partial data.
- **Metric card color strips:** Static — no animation. Color conveys status, not motion.
- **Heatmap cells:** Generated at runtime (JavaScript), color-coded by AI deployment status: green = AI Active, amber = Deploying, dark = Planned.

### 9.4 EOS Assistant (Chat Interface)

A fixed two-panel layout: chat thread (left) + quick actions + capability badges (right).

- Messages are appended to the thread as DOM elements on send/receive
- The AI response delay is simulated at 700ms to feel responsive but not instant
- Quick action buttons pre-fill the input and submit automatically (calls `askAssistant()`)
- Pattern-matching on keywords routes to domain-specific canned responses in the prototype; production would call a real LLM API
- Capability badges display (without interaction) the assistant's domains: SAP Queries, Real-time Telemetry, Multi-agent Orchestration, Voice Commands, Document Analysis, Safety Alerts

### 9.5 Login & Role Selection

The login screen uses a grid selector for role picking (2×3 grid, 6 roles). Clicking a role card marks it active (blue border, blue text, tinted background). The default selected role is CTO.

The "Access EOS Platform" button triggers a 400ms fade-out of the login screen and fade-in of the app shell. No real authentication in the prototype.

---

## 10. Animation & Motion

- **View transitions:** `fadeIn` keyframe — `opacity: 0, translateY(6px)` → `opacity: 1, translateY(0)` over 250ms. Applied on `.view.active`.
- **Button hover:** `translateY(-1px)` + enhanced box-shadow. 150ms transition.
- **Approved decision:** Color fill transition on the approve button — no keyframe animation, just CSS transition.
- **Login fade:** 400ms opacity transition on the login screen container.
- **Pulse animation:** 2s infinite opacity cycle on live status dots.

**Rule:** All motion is functional — it communicates state change. No looping decorative animations on data views. Motion should never distract from data comprehension.

---

## 11. Accessibility & Readability

- All interactive elements have `:hover` and `:focus` states defined
- Status is never communicated by color alone — always paired with a label, icon, or badge text
- Font size minimum: 10px (used only for sidebar section labels and nav badge counts — non-critical navigation chrome)
- The base body font size is 14px

---

## 13. Extension Guidelines for LLMs

When generating new views, components, or data for this platform:

1. **Always use CSS variables.** Never introduce new hex values.
2. **Follow the metric card pattern** for any new KPI. Four per row maximum; use the appropriate color class for the domain.
3. **New agent entries** in the AI Agent Network should include: name, task description, status dot (active/standby), and a single key performance stat.
4. **Domain language** must be preserved. Use the exact terminology from Section 7 (ASU, OEE, PSM, take-or-pay, intercompany reconciliation, etc.). Do not simplify.
5. **Human-in-the-loop** decisions require Approve / Modify / Override — never just a single confirm button.
6. **The heatmap** in the Command Center is the only chart-like element using JavaScript-generated DOM elements. All other data visualizations use CSS (progress bars, tank fill bars, bar charts built from `div` elements).