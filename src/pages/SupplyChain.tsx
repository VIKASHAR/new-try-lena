// ─── SupplyChain.tsx ──────────────────────────────────────────────────────────
// Changes from original:
//   1. Reads ?scenario=A&autostart=true from URL query params (cross-origin safe)
//   2. Falls back to sessionStorage for same-origin navigation
//   3. All other logic unchanged

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import USER_NAME from "@/data/data";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup,
  SidebarGroupContent, SidebarGroupLabel, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarProvider, SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Truck, GitBranch, TrendingUp,
  AlertTriangle, FileText, Users, CheckCircle2, Clock,
  Thermometer, Zap, ArrowRight, ChevronRight, MapPin,
  AlertCircle, BarChart3, Navigation, Package, Brain,
  Shield, CreditCard, Activity, Wifi, Database,
  RotateCcw, Globe, Droplets, XCircle, Vote, ArrowLeft,
} from "lucide-react";

type ScenarioId = "A" | "B" | "C";
type View = "dashboard" | "telemetry-connect" | "agent-working" | "simulation" | "decision";
type Region = "Europe" | "North America" | "South America" | "Africa" | "Asia" | "Australia";

interface Customer {
  id: string; name: string; industry: string; location: string;
  gas: string; tankCapacity: number; currentLevel: number;
  dailyUsage: number; threshold: number;
  priority: "CRITICAL" | "HIGH" | "MEDIUM";
  hoursToEmpty: number; distanceFromDepot: number;
  deliveryRequired: number;
  annualRevenue: number;
  contractValue: number;
  creditScore: number;
  paymentDays: number;
  contractType: "Take-or-Pay" | "Spot" | "Long-Term";
  penaltyPerHour: number;
  lastDelivery: string;
  lastPaymentDate: string;
  lastPaymentAmount: number;
  paymentOnTimeAccuracy: number;
  distanceFromPlant: number;
}

interface Scenario {
  id: ScenarioId; label: string; description: string;
  customers: Customer[]; truckCapacity: number;
  depotLocation: string; truckId: string;
  routeOptions: RouteOption[]; lenadecision: string;
  gasType: string;
  inventoryLevel: number;
  expectedDemand7Days: number;
}

interface RouteOption {
  id: string; label: string; stops: string[];
  totalKm: number; totalTime: number; fuelCost: number;
  co2kg: number; onTimeRisk: "LOW" | "MEDIUM" | "HIGH";
  recommended?: boolean;
  tags: string[];
}

interface AgentStep {
  agentName: string;
  icon: typeof Brain;
  color: string;
  action: string;
  detail: string;
  dataPoints: { label: string; value: string }[];
  durationMs: number;
}

interface RegionalTank {
  tankId: string;
  customerName: string;
  location: string;
  fillLevel: number;
  gas: string;
  hoursToEmpty: number;
  dailyUsage: number;
}

// ─── Regional Tank Data ───────────────────────────────────────────────────────
const REGIONAL_TANKS: Record<Region, RegionalTank[]> = {
  "Europe": [
    { tankId: "EU-T001", customerName: "Helios Steel Works", location: "Scunthorpe, UK", fillLevel: 10, gas: "N₂", hoursToEmpty: 2.1, dailyUsage: 38 },
    { tankId: "EU-T002", customerName: "BioPharm Solutions", location: "Grimsby, UK", fillLevel: 25, gas: "N₂", hoursToEmpty: 11.1, dailyUsage: 9 },
    { tankId: "EU-T003", customerName: "CryoMed Hospital Trust", location: "Hull, UK", fillLevel: 50, gas: "N₂", hoursToEmpty: 28.6, dailyUsage: 3.5 },
    { tankId: "EU-T004", customerName: "Frankfurt Auto GmbH", location: "Frankfurt, Germany", fillLevel: 78, gas: "Ar", hoursToEmpty: 58.4, dailyUsage: 21 },
    { tankId: "EU-T005", customerName: "Paris MedLabs", location: "Paris, France", fillLevel: 42, gas: "O₂", hoursToEmpty: 19.7, dailyUsage: 15 },
    { tankId: "EU-T006", customerName: "Milan Textile SpA", location: "Milan, Italy", fillLevel: 67, gas: "N₂", hoursToEmpty: 41.3, dailyUsage: 11 },
    { tankId: "EU-T007", customerName: "Rotterdam Port Logistics", location: "Rotterdam, Netherlands", fillLevel: 29, gas: "H₂", hoursToEmpty: 8.6, dailyUsage: 44 },
  ],
  "North America": [
    { tankId: "NA-T001", customerName: "Texas Steel Corp", location: "Houston, TX", fillLevel: 72, gas: "N₂", hoursToEmpty: 48.2, dailyUsage: 42 },
    { tankId: "NA-T002", customerName: "Boston BioTech", location: "Boston, MA", fillLevel: 28, gas: "O₂", hoursToEmpty: 9.1, dailyUsage: 18 },
    { tankId: "NA-T003", customerName: "Chicago Medical Center", location: "Chicago, IL", fillLevel: 55, gas: "N₂", hoursToEmpty: 31.6, dailyUsage: 12 },
    { tankId: "NA-T004", customerName: "Seattle Semiconductor", location: "Seattle, WA", fillLevel: 18, gas: "Ar", hoursToEmpty: 6.3, dailyUsage: 35 },
    { tankId: "NA-T005", customerName: "Detroit Auto Parts", location: "Detroit, MI", fillLevel: 61, gas: "CO₂", hoursToEmpty: 44.0, dailyUsage: 28 },
    { tankId: "NA-T006", customerName: "LA Pharma Group", location: "Los Angeles, CA", fillLevel: 38, gas: "H₂", hoursToEmpty: 14.8, dailyUsage: 22 },
  ],
  "South America": [
    { tankId: "SA-T001", customerName: "São Paulo Steel", location: "São Paulo, Brazil", fillLevel: 45, gas: "N₂", hoursToEmpty: 22.5, dailyUsage: 39 },
    { tankId: "SA-T002", customerName: "Buenos Aires Pharma", location: "Buenos Aires, Argentina", fillLevel: 82, gas: "O₂", hoursToEmpty: 67.3, dailyUsage: 14 },
    { tankId: "SA-T003", customerName: "Lima Mining Co", location: "Lima, Peru", fillLevel: 21, gas: "Ar", hoursToEmpty: 7.9, dailyUsage: 31 },
    { tankId: "SA-T004", customerName: "Bogotá Hospital Trust", location: "Bogotá, Colombia", fillLevel: 64, gas: "N₂", hoursToEmpty: 38.2, dailyUsage: 8 },
    { tankId: "SA-T005", customerName: "Santiago Chemical Works", location: "Santiago, Chile", fillLevel: 33, gas: "CO₂", hoursToEmpty: 12.4, dailyUsage: 26 },
  ],
  "Africa": [
    { tankId: "AF-T001", customerName: "Johannesburg Steel", location: "Johannesburg, South Africa", fillLevel: 53, gas: "N₂", hoursToEmpty: 28.1, dailyUsage: 33 },
    { tankId: "AF-T002", customerName: "Lagos BioMed", location: "Lagos, Nigeria", fillLevel: 17, gas: "O₂", hoursToEmpty: 5.4, dailyUsage: 19 },
    { tankId: "AF-T003", customerName: "Cairo Pharma Trust", location: "Cairo, Egypt", fillLevel: 71, gas: "N₂", hoursToEmpty: 52.7, dailyUsage: 7 },
    { tankId: "AF-T004", customerName: "Nairobi Medical Centre", location: "Nairobi, Kenya", fillLevel: 36, gas: "O₂", hoursToEmpty: 13.2, dailyUsage: 16 },
    { tankId: "AF-T005", customerName: "Accra Industrial", location: "Accra, Ghana", fillLevel: 88, gas: "CO₂", hoursToEmpty: 74.6, dailyUsage: 12 },
  ],
  "Asia": [
    { tankId: "AS-T001", customerName: "Chennai Pharma Ltd", location: "Chennai, India", fillLevel: 24, gas: "N₂", hoursToEmpty: 8.2, dailyUsage: 29 },
    { tankId: "AS-T002", customerName: "Tokyo Electronics", location: "Tokyo, Japan", fillLevel: 68, gas: "Ar", hoursToEmpty: 47.5, dailyUsage: 37 },
    { tankId: "AS-T003", customerName: "Shanghai Steel Group", location: "Shanghai, China", fillLevel: 41, gas: "N₂", hoursToEmpty: 18.3, dailyUsage: 52 },
    { tankId: "AS-T004", customerName: "Mumbai Hospital Network", location: "Mumbai, India", fillLevel: 15, gas: "O₂", hoursToEmpty: 4.7, dailyUsage: 22 },
    { tankId: "AS-T005", customerName: "Seoul Semiconductor", location: "Seoul, South Korea", fillLevel: 79, gas: "N₂", hoursToEmpty: 61.8, dailyUsage: 41 },
    { tankId: "AS-T006", customerName: "Singapore LNG Terminal", location: "Singapore", fillLevel: 56, gas: "H₂", hoursToEmpty: 33.9, dailyUsage: 48 },
    { tankId: "AS-T007", customerName: "Bangkok BioTech", location: "Bangkok, Thailand", fillLevel: 32, gas: "N₂", hoursToEmpty: 11.6, dailyUsage: 17 },
  ],
  "Australia": [
    { tankId: "AU-T001", customerName: "Sydney Medical Trust", location: "Sydney, NSW", fillLevel: 63, gas: "O₂", hoursToEmpty: 39.4, dailyUsage: 14 },
    { tankId: "AU-T002", customerName: "Melbourne Pharma", location: "Melbourne, VIC", fillLevel: 27, gas: "N₂", hoursToEmpty: 10.3, dailyUsage: 23 },
    { tankId: "AU-T003", customerName: "Perth Mining Corp", location: "Perth, WA", fillLevel: 84, gas: "Ar", hoursToEmpty: 71.2, dailyUsage: 36 },
    { tankId: "AU-T004", customerName: "Brisbane Steel Works", location: "Brisbane, QLD", fillLevel: 19, gas: "N₂", hoursToEmpty: 6.8, dailyUsage: 28 },
    { tankId: "AU-T005", customerName: "Adelaide Chemical", location: "Adelaide, SA", fillLevel: 47, gas: "CO₂", hoursToEmpty: 24.1, dailyUsage: 18 },
  ],
};

// ─── Scenario Data ────────────────────────────────────────────────────────────
const SCENARIOS: Record<ScenarioId, Scenario> = {
  A: {
    id: "A", label: "Facility Shutdown — Helios Steel",
    description: "Primary production plant offline. Nitrogen supply critically low.",
    depotLocation: "Linde Depot, Scunthorpe", truckId: "LIN-T4821",
    truckCapacity: 100,
    gasType: "Nitrogen (N₂)",
    inventoryLevel: 340,
    expectedDemand7Days: 360,
    customers: [
      {
        id: "C1", name: "Helios Steel Works", industry: "Steel Manufacturing",
        location: "Scunthorpe, North Lincolnshire", gas: "Nitrogen (N₂)",
        tankCapacity: 800, currentLevel: 10, dailyUsage: 38, threshold: 10,
        priority: "CRITICAL", hoursToEmpty: 2.1, distanceFromDepot: 12,
        deliveryRequired: 45, annualRevenue: 4.2, contractValue: 18.6,
        creditScore: 720, paymentDays: 28, contractType: "Take-or-Pay",
        penaltyPerHour: 14.2, lastDelivery: "48 hrs ago",
        lastPaymentDate: "01 Apr 2026", lastPaymentAmount: 142000,
        paymentOnTimeAccuracy: 96, distanceFromPlant: 12,
      },
      {
        id: "C2", name: "BioPharm Solutions", industry: "Pharmaceutical",
        location: "Grimsby, Lincolnshire", gas: "Nitrogen (N₂)",
        tankCapacity: 400, currentLevel: 25, dailyUsage: 9, threshold: 25,
        priority: "HIGH", hoursToEmpty: 11.1, distanceFromDepot: 28,
        deliveryRequired: 35, annualRevenue: 2.8, contractValue: 9.4,
        creditScore: 810, paymentDays: 21, contractType: "Long-Term",
        penaltyPerHour: 8.6, lastDelivery: "3 days ago",
        lastPaymentDate: "28 Mar 2026", lastPaymentAmount: 86000,
        paymentOnTimeAccuracy: 99, distanceFromPlant: 28,
      },
      {
        id: "C3", name: "CryoMed Hospital Trust", industry: "Healthcare",
        location: "Hull, East Yorkshire", gas: "Nitrogen (N₂)",
        tankCapacity: 200, currentLevel: 50, dailyUsage: 3.5, threshold: 50,
        priority: "MEDIUM", hoursToEmpty: 28.6, distanceFromDepot: 41,
        deliveryRequired: 20, annualRevenue: 1.9, contractValue: 6.1,
        creditScore: 680, paymentDays: 30, contractType: "Long-Term",
        penaltyPerHour: 22.0, lastDelivery: "5 days ago",
        lastPaymentDate: "25 Mar 2026", lastPaymentAmount: 61000,
        paymentOnTimeAccuracy: 88, distanceFromPlant: 41,
      },
    ],
    routeOptions: [
      {
        id: "R1", label: "Priority-first (LENA Optimal)", recommended: true,
        stops: ["Scunthorpe Depot", "Helios Steel", "BioPharm", "CryoMed Hospital"],
        totalKm: 98, totalTime: 4.2, fuelCost: 187, co2kg: 94, onTimeRisk: "LOW",
        tags: ["LENA Recommended", "Customer Satisfaction"]
      },
      {
        id: "R2", label: "Geographic shortest path",
        stops: ["Scunthorpe Depot", "BioPharm", "CryoMed Hospital", "Helios Steel"],
        totalKm: 89, totalTime: 5.8, fuelCost: 171, co2kg: 86, onTimeRisk: "HIGH",
        tags: ["Quick Delivery"]
      },
      {
        id: "R3", label: "Revenue-weighted",
        stops: ["Scunthorpe Depot", "Helios Steel", "CryoMed Hospital", "BioPharm"],
        totalKm: 112, totalTime: 4.9, fuelCost: 215, co2kg: 108, onTimeRisk: "MEDIUM",
        tags: ["Cost Efficient"]
      },
    ],
    lenadecision: "Helios Steel at 10% with 2.1 hrs — dispatching immediately. Take-or-Pay penalty £14.2K/hr averted. BioPharm second at 11.1 hrs. CryoMed last with 28.6hr buffer.",
  },
  B: {
    id: "B", label: "Demand Spike — BioPharm Emergency",
    description: "Unexpected production surge at pharmaceutical plant. Threshold breached.",
    depotLocation: "Linde Depot, Scunthorpe", truckId: "LIN-T3306",
    truckCapacity: 100,
    gasType: "Nitrogen (N₂)",
    inventoryLevel: 420,
    expectedDemand7Days: 390,
    customers: [
      {
        id: "C1", name: "Helios Steel Works", industry: "Steel Manufacturing",
        location: "Scunthorpe, North Lincolnshire", gas: "Nitrogen (N₂)",
        tankCapacity: 800, currentLevel: 25, dailyUsage: 38, threshold: 25,
        priority: "HIGH", hoursToEmpty: 5.3, distanceFromDepot: 12,
        deliveryRequired: 45, annualRevenue: 4.2, contractValue: 18.6,
        creditScore: 720, paymentDays: 28, contractType: "Take-or-Pay",
        penaltyPerHour: 14.2, lastDelivery: "36 hrs ago",
        lastPaymentDate: "01 Apr 2026", lastPaymentAmount: 142000,
        paymentOnTimeAccuracy: 96, distanceFromPlant: 12,
      },
      {
        id: "C2", name: "BioPharm Solutions", industry: "Pharmaceutical",
        location: "Grimsby, Lincolnshire", gas: "Nitrogen (N₂)",
        tankCapacity: 400, currentLevel: 50, dailyUsage: 24, threshold: 50,
        priority: "CRITICAL", hoursToEmpty: 8.3, distanceFromDepot: 28,
        deliveryRequired: 35, annualRevenue: 2.8, contractValue: 9.4,
        creditScore: 810, paymentDays: 21, contractType: "Long-Term",
        penaltyPerHour: 8.6, lastDelivery: "4 days ago",
        lastPaymentDate: "28 Mar 2026", lastPaymentAmount: 86000,
        paymentOnTimeAccuracy: 99, distanceFromPlant: 28,
      },
      {
        id: "C3", name: "CryoMed Hospital Trust", industry: "Healthcare",
        location: "Hull, East Yorkshire", gas: "Nitrogen (N₂)",
        tankCapacity: 200, currentLevel: 10, dailyUsage: 3.5, threshold: 10,
        priority: "CRITICAL", hoursToEmpty: 5.7, distanceFromDepot: 41,
        deliveryRequired: 20, annualRevenue: 1.9, contractValue: 6.1,
        creditScore: 680, paymentDays: 30, contractType: "Long-Term",
        penaltyPerHour: 22.0, lastDelivery: "6 days ago",
        lastPaymentDate: "25 Mar 2026", lastPaymentAmount: 61000,
        paymentOnTimeAccuracy: 88, distanceFromPlant: 41,
      },
    ],
    routeOptions: [
      {
        id: "R1", label: "Dual-critical optimised (LENA Optimal)", recommended: true,
        stops: ["Scunthorpe Depot", "Helios Steel", "CryoMed Hospital", "BioPharm"],
        totalKm: 104, totalTime: 4.7, fuelCost: 199, co2kg: 101, onTimeRisk: "LOW",
        tags: ["LENA Recommended", "Customer Satisfaction"]
      },
      {
        id: "R2", label: "Geographic shortest path",
        stops: ["Scunthorpe Depot", "BioPharm", "CryoMed Hospital", "Helios Steel"],
        totalKm: 89, totalTime: 6.1, fuelCost: 171, co2kg: 86, onTimeRisk: "HIGH",
        tags: ["Quick Delivery"]
      },
      {
        id: "R3", label: "Revenue-weighted",
        stops: ["Scunthorpe Depot", "Helios Steel", "BioPharm", "CryoMed Hospital"],
        totalKm: 118, totalTime: 5.3, fuelCost: 226, co2kg: 113, onTimeRisk: "MEDIUM",
        tags: ["Cost Efficient"]
      },
    ],
    lenadecision: "Two customers simultaneously critical. Helios Steel nearest with Take-or-Pay risk. CryoMed life-critical facility served second. BioPharm demand surge served last with buffer.",
  },
  C: {
    id: "C", label: "Weather Disruption — Hull Route Blocked",
    description: "Flooding closes A63 corridor. CryoMed hospital access severely limited.",
    depotLocation: "Linde Depot, Scunthorpe", truckId: "LIN-T5512",
    truckCapacity: 100,
    gasType: "Nitrogen (N₂)",
    inventoryLevel: 290,
    expectedDemand7Days: 310,
    customers: [
      {
        id: "C1", name: "Helios Steel Works", industry: "Steel Manufacturing",
        location: "Scunthorpe, North Lincolnshire", gas: "Nitrogen (N₂)",
        tankCapacity: 800, currentLevel: 50, dailyUsage: 38, threshold: 50,
        priority: "MEDIUM", hoursToEmpty: 10.5, distanceFromDepot: 12,
        deliveryRequired: 30, annualRevenue: 4.2, contractValue: 18.6,
        creditScore: 720, paymentDays: 28, contractType: "Take-or-Pay",
        penaltyPerHour: 14.2, lastDelivery: "24 hrs ago",
        lastPaymentDate: "01 Apr 2026", lastPaymentAmount: 142000,
        paymentOnTimeAccuracy: 96, distanceFromPlant: 12,
      },
      {
        id: "C2", name: "BioPharm Solutions", industry: "Pharmaceutical",
        location: "Grimsby, Lincolnshire", gas: "Nitrogen (N₂)",
        tankCapacity: 400, currentLevel: 10, dailyUsage: 9, threshold: 10,
        priority: "CRITICAL", hoursToEmpty: 4.4, distanceFromDepot: 28,
        deliveryRequired: 40, annualRevenue: 2.8, contractValue: 9.4,
        creditScore: 810, paymentDays: 21, contractType: "Long-Term",
        penaltyPerHour: 8.6, lastDelivery: "5 days ago",
        lastPaymentDate: "28 Mar 2026", lastPaymentAmount: 86000,
        paymentOnTimeAccuracy: 99, distanceFromPlant: 28,
      },
      {
        id: "C3", name: "CryoMed Hospital Trust", industry: "Healthcare",
        location: "Hull, East Yorkshire", gas: "Nitrogen (N₂)",
        tankCapacity: 200, currentLevel: 25, dailyUsage: 3.5, threshold: 25,
        priority: "HIGH", hoursToEmpty: 14.3, distanceFromDepot: 67,
        deliveryRequired: 30, annualRevenue: 1.9, contractValue: 6.1,
        creditScore: 680, paymentDays: 30, contractType: "Long-Term",
        penaltyPerHour: 22.0, lastDelivery: "7 days ago",
        lastPaymentDate: "25 Mar 2026", lastPaymentAmount: 61000,
        paymentOnTimeAccuracy: 88, distanceFromPlant: 67,
      },
    ],
    routeOptions: [
      {
        id: "R1", label: "Detour-aware safe route (LENA Optimal)", recommended: true,
        stops: ["Scunthorpe Depot", "BioPharm", "Helios Steel", "CryoMed (via M62)"],
        totalKm: 138, totalTime: 5.9, fuelCost: 264, co2kg: 132, onTimeRisk: "LOW",
        tags: ["LENA Recommended", "Customer Satisfaction"]
      },
      {
        id: "R2", label: "Standard geographic (A63 — flooded)",
        stops: ["Scunthorpe Depot", "BioPharm", "CryoMed (A63 — blocked)", "Helios Steel"],
        totalKm: 89, totalTime: 9.1, fuelCost: 171, co2kg: 86, onTimeRisk: "HIGH",
        tags: ["Quick Delivery"]
      },
      {
        id: "R3", label: "Revenue-weighted",
        stops: ["Scunthorpe Depot", "Helios Steel", "BioPharm", "CryoMed (M62)"],
        totalKm: 149, totalTime: 6.8, fuelCost: 285, co2kg: 143, onTimeRisk: "MEDIUM",
        tags: ["Cost Efficient"]
      },
    ],
    lenadecision: "A63 flooding confirmed via telemetry. BioPharm at 4.4 hrs — nearest and first. CryoMed rerouted via M62 (+26 km). Helios Steel at 50% has safe buffer.",
  },
};

// ─── Agent steps ──────────────────────────────────────────────────────────────
function buildAgentSteps(s: Scenario): AgentStep[] {
  const c = [...s.customers].sort((a, b) => a.hoursToEmpty - b.hoursToEmpty);
  return [
    {
      agentName: "Telemetry Agent",
      icon: Wifi, color: "text-blue-600",
      action: "Analysing live IoT sensor feeds",
      detail: "Scanning 3 customer tank sensors · 847 fleet GPS pings · weather APIs",
      dataPoints: [
        { label: c[0].name, value: `${c[0].currentLevel}% · ${c[0].hoursToEmpty}h to empty` },
        { label: c[1].name, value: `${c[1].currentLevel}% · ${c[1].hoursToEmpty}h to empty` },
        { label: c[2].name, value: `${c[2].currentLevel}% · ${c[2].hoursToEmpty}h to empty` },
      ],
      durationMs: 6000,
    },
    {
      agentName: "Demand & Allocation Agent",
      icon: TrendingUp, color: "text-violet-600",
      action: "Forecasting demand & allocating volumes",
      detail: "Computing 7-day demand curves · allocating m³ per customer · checking truck capacity",
      dataPoints: [
        { label: "7-day demand", value: `${s.expectedDemand7Days} m³ forecast` },
        { label: "Inventory available", value: `${s.inventoryLevel} m³ in depot` },
        { label: "Allocation balanced", value: `${c.reduce((a, x) => a + x.deliveryRequired, 0)} m³ / ${s.truckCapacity} m³ truck` },
      ],
      durationMs: 5000,
    },
    {
      agentName: "Pricing Optimisation Agent",
      icon: CreditCard, color: "text-amber-600",
      action: "Optimising delivery pricing & surcharges",
      detail: "Applying contract rate cards · emergency surcharges · fuel index adjustments",
      dataPoints: [
        { label: "Base delivery cost", value: `£${s.routeOptions[0].fuelCost} fuel` },
        { label: "Emergency surcharge", value: c[0].priority === "CRITICAL" ? "£320 applied" : "None" },
        { label: "Net margin", value: "18.4% optimised" },
      ],
      durationMs: 7000,
    },
    {
      agentName: "Plant & Logistics Allocation Agent",
      icon: Database, color: "text-orange-600",
      action: "Selecting plant & checking fleet availability",
      detail: "Querying depot manifest · checking truck certification for N₂ · computing fill time",
      dataPoints: [
        { label: "Assigned truck", value: s.truckId },
        { label: "Truck capacity", value: `${s.truckCapacity} m³ liquid N₂` },
        { label: "Depot ready time", value: "T+00:12 from now" },
      ],
      durationMs: 5000,
    },
    {
      agentName: "Route Optimisation Agent",
      icon: Navigation, color: "text-emerald-600",
      action: "Optimising multi-stop delivery route",
      detail: "Running constrained shortest-path with priority weights · 3 route options evaluated",
      dataPoints: [
        { label: "Routes evaluated", value: "3 options" },
        { label: "Optimal route", value: `${s.routeOptions[0].totalKm} km · ${s.routeOptions[0].totalTime} hrs` },
        { label: "All SLAs met?", value: "YES — zero breach risk" },
      ],
      durationMs: 8000,
    },
    {
      agentName: "Risk Agent",
      icon: Shield, color: "text-red-600",
      action: "Assessing SLA & contract risk",
      detail: "Cross-referencing Take-or-Pay clauses, penalty schedules, historical breach data",
      dataPoints: [
        { label: "SLA penalty exposure", value: `£${(c[0].penaltyPerHour * c[0].hoursToEmpty).toFixed(0)}K if delayed` },
        { label: "Contract at risk", value: `£${c[0].contractValue}M — ${c[0].contractType}` },
        { label: "Credit score", value: `${c[0].creditScore} · ${c[0].paymentDays} day terms` },
      ],
      durationMs: 6000,
    },
    {
      agentName: "LENA Orchestrator",
      icon: Brain, color: "text-primary",
      action: "Synthesising decision · awaiting human approval",
      detail: "All agent outputs merged · decision package ready for COO sign-off",
      dataPoints: [
        { label: "Total value protected", value: `£${(c.reduce((a, x) => a + x.annualRevenue, 0)).toFixed(1)}M annual` },
        { label: "Penalty averted", value: `£${(c[0].penaltyPerHour * 8).toFixed(0)}K estimated` },
        { label: "Decision confidence", value: "98.7% · LOW risk" },
      ],
      durationMs: 5000,
    },
  ];
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const SC_NAV = [
  { id: "dashboard", label: "Control Tower", icon: LayoutDashboard },
  { id: "master-agent", label: "Master Agent", icon: Brain },
  { id: "routing", label: "Routing Agent", icon: GitBranch },
  { id: "pipeline", label: "Pipeline Agent", icon: TrendingUp },
  { id: "demand", label: "Demand Agent", icon: BarChart3 },
  { id: "telemetry", label: "Telemetry", icon: Thermometer },
  { id: "risk", label: "Risk Agent", icon: AlertTriangle },
  { id: "decision", label: "Decision Summary", icon: FileText },
];

function SupplyChainSidebar({ activeView, onNavigate, scenarioId }: {
  activeView: string; onNavigate: (v: View) => void; scenarioId?: ScenarioId | null;
}) {
  return (
    <Sidebar className="border-r">
      <SidebarHeader className="px-4 py-3.5 border-b border-sidebar-border">
        <p className="font-heading text-sm font-bold tracking-wide text-foreground">
          Supply Chain Control Tower
        </p>
      </SidebarHeader>
      <SidebarContent className="pt-3">
        <div className="px-2">
          <SidebarGroup className="p-0 mb-1">
            <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/40 px-3 h-7">
              Navigation
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {SC_NAV.map(item => {
                  const isActive =
                    (item.id === "dashboard" && (activeView === "dashboard" || activeView === "telemetry-connect")) ||
                    (item.id === "master-agent" && activeView === "agent-working") ||
                    (item.id === "routing" && activeView === "simulation") ||
                    (item.id === "decision" && activeView === "decision");
                  const isWorking = item.id === "master-agent" && activeView === "agent-working";
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        className={cn(
                          "relative h-9 rounded-md px-3 text-sm font-medium transition-all duration-150",
                          "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                          isActive && "text-sidebar-foreground bg-sidebar-accent border-l-4 border-primary rounded-l-none"
                        )}
                        onClick={() => {
                          if (item.id === "dashboard") onNavigate("dashboard");
                          if (item.id === "decision" && scenarioId) onNavigate("decision");
                          if (item.id === "routing" && scenarioId) onNavigate("simulation");
                          if (item.id === "master-agent" && scenarioId) onNavigate("agent-working");
                        }}
                      >
                        <item.icon className={cn("h-4 w-4 shrink-0 mr-3", isActive ? "opacity-100 text-primary" : "opacity-60")} />
                        {item.label}
                        {isWorking && <span className="ml-auto h-2 w-2 rounded-full bg-orange-500 animate-pulse" />}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-sidebar-accent transition-colors">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-primary">{USER_NAME.charAt(0)}</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium leading-tight">{USER_NAME}</span>
            <span className="text-[11px] text-muted-foreground leading-tight">Chief Operating Officer</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function PriorityBadge({ priority }: { priority: Customer["priority"] }) {
  return (
    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider", {
      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400": priority === "CRITICAL",
      "bg-orange-100 text-orange-700": priority === "HIGH",
      "bg-yellow-100 text-yellow-700": priority === "MEDIUM",
    })}>{priority}</span>
  );
}

function KpiCard({ label, value, sub, color, border, Icon }: {
  label: string; value: string; sub: string; color: string; border: string; Icon: typeof Truck;
}) {
  return (
    <Card className={cn("border-l-4 border-border bg-card rounded-l-none rounded-xs", border)}>
      <CardContent className="px-4 py-4">
        <div className="mb-2 flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            {label}
          </p>
        </div>
        <p className={cn("font-heading text-3xl font-bold tracking-tight", color)}>{value}</p>
        <p className="mt-2 text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  );
}

// ─── Tank Telemetry Tabs ──────────────────────────────────────────────────────
const REGIONS: Region[] = ["Europe", "North America", "South America", "Africa", "Asia", "Australia"];

function TankCard({ tank }: { tank: RegionalTank }) {
  const status = tank.fillLevel >= 50 ? "safe" : tank.fillLevel >= 30 ? "warning" : "critical";
  return (
    <div className={cn(
      "rounded-xl border p-4 space-y-3 transition-all duration-200 hover:shadow-md",
      status === "critical" && "border-red-200 bg-red-50/40",
      status === "warning" && "border-yellow-200 bg-yellow-50/40",
      status === "safe" && "border-blue-100 bg-blue-50/20",
    )}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[10px] font-mono font-bold text-muted-foreground">{tank.tankId}</span>
            <span className={cn("h-1.5 w-1.5 rounded-full", {
              "bg-emerald-500": status === "safe",
              "bg-yellow-500": status === "warning",
              "bg-red-500 animate-pulse": status === "critical",
            })} />
          </div>
          <p className="font-semibold text-sm leading-tight">{tank.customerName}</p>
          <p className="text-[11px] text-muted-foreground">{tank.location}</p>
        </div>
        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide", {
          "bg-blue-100 text-blue-700": status === "safe",
          "bg-yellow-100 text-yellow-700": status === "warning",
          "bg-red-100 text-red-700": status === "critical",
        })}>
          {status === "safe" ? "Safe" : status === "warning" ? "Warning" : "Critical"}
        </span>
      </div>
      <div>
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-muted-foreground">Fill Level · {tank.gas}</span>
          <span className={cn("font-mono font-bold", {
            "text-blue-600": status === "safe",
            "text-yellow-600": status === "warning",
            "text-red-600": status === "critical",
          })}>{tank.fillLevel}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-700", {
              "bg-blue-500": status === "safe",
              "bg-yellow-400": status === "warning",
              "bg-red-500": status === "critical",
            })}
            style={{ width: `${tank.fillLevel}%` }}
          />
        </div>
      </div>
      <div className="flex items-center justify-between pt-1 border-t border-dashed border-muted-foreground/20">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span className={cn("text-xs font-semibold", {
            "text-red-600": tank.hoursToEmpty < 10,
            "text-yellow-600": tank.hoursToEmpty >= 10 && tank.hoursToEmpty < 24,
            "text-emerald-600": tank.hoursToEmpty >= 24,
          })}>Empty in {tank.hoursToEmpty}h</span>
        </div>
        <span className="text-[10px] text-muted-foreground">{tank.dailyUsage} m³/day</span>
      </div>
    </div>
  );
}

function TankTelemetrySection() {
  const [activeRegion, setActiveRegion] = useState<Region>("Europe");
  const tanks = REGIONAL_TANKS[activeRegion];
  const criticalCount = tanks.filter(t => t.fillLevel < 30).length;
  const warningCount = tanks.filter(t => t.fillLevel >= 30 && t.fillLevel < 50).length;

  return (
    <div className="bg-card rounded-xl border p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-sm flex items-center gap-2">
          <Globe className="h-4 w-4 text-primary" /> Global Tank Telemetry
        </h2>
        <div className="flex items-center gap-3 text-[11px]">
          {criticalCount > 0 && (
            <span className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              {criticalCount} Critical
            </span>
          )}
          {warningCount > 0 && (
            <span className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-semibold">
              {warningCount} Warning
            </span>
          )}
          <span className="text-muted-foreground">{tanks.length} tanks monitored</span>
        </div>
      </div>
      <div className="flex items-center gap-1 mb-5 border-b border-border pb-0">
        {REGIONS.map(region => (
          <button
            key={region}
            onClick={() => setActiveRegion(region)}
            className={cn(
              "relative px-3 py-2 text-xs font-semibold transition-all duration-200 whitespace-nowrap",
              "rounded-t-md border-b-2 -mb-px",
              activeRegion === region
                ? "text-primary border-primary bg-primary/5"
                : "text-muted-foreground border-transparent hover:text-foreground hover:border-muted-foreground/30"
            )}
          >
            {region}
            {REGIONAL_TANKS[region].some(t => t.fillLevel < 30) && (
              <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-red-500" />
            )}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {tanks.map(tank => (
          <TankCard key={tank.tankId} tank={tank} />
        ))}
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function DashboardView({ onGoToVoting }: { onGoToVoting: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Supply Chain & Logistics</h1>
          <p className="text-sm text-muted-foreground mt-1">8,000+ tanker fleet · 80,000+ customer installations · Real-time AI dispatch</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-emerald-600 font-mono font-semibold uppercase tracking-wider">All Systems Operational</span>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        <KpiCard label="Active Deliveries" value="847" sub="+12% vs yesterday" color="text-foreground" border="border-l-primary" Icon={Truck} />
        <KpiCard label="Production Plants" value="612" sub="All online · monitored" color="text-chart-2" border="border-l-chart-2" Icon={Activity} />
        <KpiCard label="Inventory Level" value="94%" sub="Optimal across network" color="text-primary" border="border-l-primary" Icon={Package} />
        <KpiCard label="AI Decisions/Hour" value="2,456" sub="+8% efficiency gain" color="text-accent" border="border-l-accent" Icon={Brain} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-card rounded-xl border p-5">
          <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <Truck className="h-4 w-4 text-primary" /> Fleet Status — Active Tankers
          </h2>
          <div className="space-y-3">
            {[
              { id: "LIN-T4821", route: "Scunthorpe → Helios Steel Works", status: "In Transit", eta: "14 min" },
              { id: "LIN-T3306", route: "Grimsby Depot → BioPharm Solutions", status: "Loading", eta: "Ready 09:40" },
              { id: "LIN-T5512", route: "Hull → CryoMed Hospital Trust", status: "Delivered", eta: "Complete" },
              { id: "LIN-T2291", route: "Manchester → Peel Ports LNG Terminal", status: "In Transit", eta: "1hr 22min" },
            ].map(t => (
              <div key={t.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/40">
                <Truck className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-semibold">{t.id}</span>
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase", {
                      "bg-blue-100 text-blue-700": t.status === "In Transit",
                      "bg-yellow-100 text-yellow-700": t.status === "Loading",
                      "bg-emerald-100 text-emerald-700": t.status === "Delivered",
                    })}>{t.status}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{t.route}</p>
                </div>
                <p className="text-xs font-semibold shrink-0">{t.eta}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card rounded-xl border p-5">
          <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" /> Gas Distribution
          </h2>
          <div className="space-y-3">
            {[
              { gas: "Nitrogen (N₂)", pct: 35, color: "bg-blue-500" },
              { gas: "Oxygen (O₂)", pct: 28, color: "bg-emerald-500" },
              { gas: "Hydrogen (H₂)", pct: 20, color: "bg-violet-500" },
              { gas: "Carbon Dioxide", pct: 12, color: "bg-orange-500" },
              { gas: "Argon (Ar)", pct: 5, color: "bg-gray-400" },
            ].map(g => (
              <div key={g.gas}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{g.gas}</span>
                  <span className="font-semibold">{g.pct}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full", g.color)} style={{ width: `${g.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border p-5">
          <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" /> Regional Delivery Performance
          </h2>
          <div className="space-y-3">
            {[
              { region: "North East England", onTime: 97.2, trips: 214 },
              { region: "Yorkshire & Humber", onTime: 94.8, trips: 189 },
              { region: "North West England", onTime: 96.1, trips: 241 },
              { region: "East Midlands", onTime: 98.4, trips: 118 },
              { region: "Scotland", onTime: 93.7, trips: 85 },
            ].map(r => (
              <div key={r.region} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground truncate">{r.region}</span>
                    <span className="font-semibold ml-2 shrink-0">{r.onTime}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${r.onTime}%` }} />
                  </div>
                </div>
                <span className="text-[11px] text-muted-foreground font-mono shrink-0 w-16 text-right">{r.trips} trips</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card rounded-xl border p-5">
          <h2 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" /> Active Risk Alerts
          </h2>
          <div className="space-y-2">
            {[
              { level: "HIGH", msg: "Helios Steel Works — Tank at threshold. Dispatch pending.", time: "2 min ago" },
              { level: "MEDIUM", msg: "M62 congestion alert — ETA +18min for 3 tankers.", time: "9 min ago" },
              { level: "LOW", msg: "BioPharm Grimsby — demand spike forecast next 4h.", time: "14 min ago" },
              { level: "LOW", msg: "Winter weather advisory — Hull Docks route. Monitor.", time: "31 min ago" },
            ].map((a, i) => (
              <div key={i} className="flex gap-3 p-2.5 rounded-lg bg-muted/40">
                <AlertCircle className={cn("h-4 w-4 shrink-0 mt-0.5", {
                  "text-red-500": a.level === "HIGH",
                  "text-orange-500": a.level === "MEDIUM",
                  "text-yellow-500": a.level === "LOW",
                })} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs">{a.msg}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <TankTelemetrySection />

      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl p-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Vote className="h-4 w-4 text-primary" />
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-primary">Audience-Driven Demo</span>
          </div>
          <h3 className="font-semibold">Run Supply Chain Optimization</h3>
          <p className="text-sm text-muted-foreground mt-1">
            The audience votes on a live scenario. LENA then analyses telemetry, prioritises deliveries and recommends the optimal dispatch route.
          </p>
        </div>
        <Button className="ml-6 shrink-0 gap-2" size="lg" onClick={onGoToVoting}>
          Go to Audience Vote <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── Telemetry Connect View ───────────────────────────────────────────────────
function TelemetryConnectView({ scenario, onComplete, onBack }: {
  scenario: Scenario; onComplete: () => void; onBack: () => void;
}) {
  const customers = scenario.customers;
  const [progress, setProgress] = useState<number[]>([0, 0, 0]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [allDone, setAllDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {

    function animateCustomer(idx: number) {
      if (idx >= customers.length) { setAllDone(true); return; }
      setActiveIdx(idx);
      let val = 0;
      intervalRef.current = setInterval(() => {
        val += 1;
        setProgress(prev => { const next = [...prev]; next[idx] = val; return next; });
        if (val >= 100) {
          clearInterval(intervalRef.current!);
          setTimeout(() => animateCustomer(idx + 1), 300);
        }
      }, 50);
    }
    animateCustomer(0);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  useEffect(() => {
    if (allDone) { const t = setTimeout(() => onComplete(), 600); return () => clearTimeout(t); }
  }, [allDone]);

  return (
    <div className="max-w-2xl mx-auto py-12 space-y-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </div>
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-mono font-semibold uppercase tracking-wider mb-4">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold">Reading Live Sensor Data from Customers</h2>
      </div>
      <div className="space-y-4">
        {customers.map((customer, idx) => {
          const isActive = idx === activeIdx && !allDone && progress[idx] < 100;
          const isDone = progress[idx] >= 100;
          const isPending = idx > activeIdx && progress[idx] === 0;
          return (
            <div key={customer.id} className={cn("rounded-xl border p-5 transition-all duration-500 border-border bg-card", isPending && "opacity-40", isDone && "border-emerald-300 bg-emerald-50/30")}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {isActive && <span className="text-[10px] font-mono text-primary animate-pulse font-semibold">Connecting…</span>}
                    {isDone && <span className="text-[10px] font-mono text-emerald-600 font-semibold flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Connected</span>}
                    {isPending && <span className="text-[10px] font-mono text-muted-foreground">Pending…</span>}
                  </div>
                  <h3 className="font-semibold text-base">{customer.name}</h3>
                  <p className="text-xs text-muted-foreground">{customer.location}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Telemetry sync · {customer.gas}</span>
                  <span className={cn("font-mono font-bold", { "text-primary": isActive, "text-emerald-600": isDone, "text-muted-foreground": isPending })}>{progress[idx]}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all duration-100", { "bg-primary": isActive, "bg-emerald-500": isDone, "bg-muted-foreground/20": isPending })} style={{ width: `${progress[idx]}%` }} />
                </div>
              </div>
              {isDone && (
                <div className="mt-3 grid grid-cols-3 gap-3 text-xs pt-3 border-t border-emerald-200">
                  <div><span className="text-muted-foreground">Tank level</span><p className="font-semibold font-mono">{customer.currentLevel}%</p></div>
                  <div><span className="text-muted-foreground">Daily usage</span><p className="font-semibold font-mono">{customer.dailyUsage} m³</p></div>
                  <div><span className="text-muted-foreground">Industry</span><p className="font-semibold">{customer.industry}</p></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {allDone && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold animate-pulse">
            <CheckCircle2 className="h-4 w-4" /> All sensors connected · Launching LENA agents…
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Agent Working View ───────────────────────────────────────────────────────
function AgentWorkingView({ scenario, onComplete, onBack, agentsDone }: {
  scenario: Scenario; onComplete: () => void; onBack: () => void; agentsDone: boolean;
}) {
  const steps = buildAgentSteps(scenario);
  const allIndices = steps.map((_, i) => i);

  const [currentStep, setCurrentStep] = useState(agentsDone ? steps.length - 1 : 0);
  const [completedSteps, setCompletedSteps] = useState<number[]>(agentsDone ? allIndices : []);
  const [stepProgress, setStepProgress] = useState(agentsDone ? 100 : 0);
  const [logs, setLogs] = useState<string[]>(agentsDone ? buildAllLogs(scenario) : []);
  const [done, setDone] = useState(agentsDone);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Trigger Lena voice narration when agent pipeline starts
    if (!agentsDone) {
      window.dispatchEvent(new CustomEvent('lena-pipeline-start'));
    }
  }, [agentsDone]);

  const logMessages: string[][] = [
    ["[Telemetry] Connecting to IoT hub…", "[Telemetry] Tank sensors online · 3/3 customers", "[Telemetry] Alert: Customer at threshold"],
    ["[Demand] Computing usage curves…", "[Demand] 7-day demand forecast: " + scenario.expectedDemand7Days + " m³", "[Demand] Allocations balanced to truck capacity"],
    ["[Pricing] Loading contract rate cards…", "[Pricing] Emergency surcharge applied", "[Pricing] Net margin: 18.4% optimised"],
    ["[Plant] Checking depot manifest…", `[Plant] ${scenario.truckId} certified N₂ · ${scenario.truckCapacity}m³`, "[Plant] ETA depot departure: T+12min"],
    ["[Routing] Evaluating 3 route options…", "[Routing] Priority-first optimal · " + scenario.routeOptions[0].totalKm + " km", "[Routing] All SLAs met · LOW risk"],
    ["[Risk] Loading contract database…", "[Risk] Take-or-Pay clause active · penalties scheduled", "[Risk] Credit scores assessed"],
    ["[LENA] Synthesising agent outputs…", "[LENA] Decision package ready", "[LENA] Awaiting COO approval"],
  ];

  useEffect(() => {
    if (agentsDone) return;
    let elapsed = 0;
    steps.forEach((step, idx) => {
      setTimeout(() => {
        setCurrentStep(idx);
        setStepProgress(0);
        logMessages[idx].forEach((msg, mi) => {
          setTimeout(() => {
            setLogs(l => [...l, msg]);
            if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
          }, mi * (step.durationMs / 3));
        });
      }, elapsed);
      elapsed += step.durationMs;
      setTimeout(() => setCompletedSteps(c => [...c, idx]), elapsed - 100);
    });
    setTimeout(() => { setDone(true); setTimeout(onComplete, 1200); }, elapsed);
  }, []);

  useEffect(() => {
    if (agentsDone) return;
    const iv = setInterval(() => setStepProgress(p => Math.min(p + 3, 100)), 40);
    return () => clearInterval(iv);
  }, [currentStep, agentsDone]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        {agentsDone && (
          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" /> All agents completed
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border p-5 space-y-3">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Activity className={cn("h-4 w-4 text-primary", !agentsDone && "animate-pulse")} /> LENA Agent Pipeline
          </h3>
          {steps.map((step, idx) => {
            const isActive = !agentsDone && currentStep === idx && !completedSteps.includes(idx);
            const isDone = completedSteps.includes(idx);
            const isPending = !agentsDone && idx > currentStep;
            return (
              <div key={idx} className={cn("rounded-lg border p-3 transition-all duration-300", {
                "border-primary bg-primary/5": isActive,
                "border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20": isDone,
                "border-border opacity-40": isPending,
              })}>
                <div className="flex items-center gap-3 mb-1">
                  {isDone ? <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    : isActive ? <step.icon className={cn("h-4 w-4 shrink-0 animate-pulse", step.color)} />
                    : <div className="h-4 w-4 rounded-full border border-muted-foreground/30 shrink-0" />}
                  <span className={cn("text-xs font-semibold", isDone ? "text-emerald-700" : isActive ? step.color : "text-muted-foreground")}>
                    {step.agentName}
                  </span>
                  {isActive && <span className="ml-auto text-[10px] text-muted-foreground font-mono animate-pulse">Processing…</span>}
                  {isDone && <span className="ml-auto text-[10px] text-emerald-600 font-mono">✓ Done</span>}
                </div>
                {isActive && (
                  <>
                    <p className="text-[11px] text-muted-foreground mb-2 ml-7">{step.action}</p>
                    <div className="h-1 bg-muted rounded-full overflow-hidden ml-7">
                      <div className="h-full bg-primary rounded-full transition-all duration-100" style={{ width: `${stepProgress}%` }} />
                    </div>
                  </>
                )}
                {isDone && (
                  <div className="flex gap-3 mt-1 ml-7">
                    {step.dataPoints.slice(0, 2).map((dp, di) => (
                      <div key={di} className="text-[10px]">
                        <span className="text-emerald-600 font-semibold">{dp.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="space-y-4">
          <div className="bg-card rounded-xl border p-4">
            <h3 className="font-semibold text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
              <TerminalIcon className="h-3 w-3" /> Agent Log
            </h3>
            <div ref={logRef} className="h-44 overflow-y-auto space-y-1 font-mono text-[11px]">
              {logs.map((l, i) => (
                <div key={i} className={cn("flex gap-2", {
                  "text-red-600": l.includes("Alert") || l.includes("threshold"),
                  "text-emerald-600": l.includes("certified") || l.includes("optimal") || l.includes("ready"),
                  "text-blue-600": l.includes("[Telemetry]"),
                  "text-violet-600": l.includes("[Demand]"),
                  "text-amber-600": l.includes("[Pricing]") || l.includes("[Plant]"),
                  "text-emerald-700": l.includes("[Routing]"),
                  "text-red-700": l.includes("[Risk]"),
                  "text-primary": l.includes("[LENA]"),
                  "text-muted-foreground": !l.includes("Alert") && !l.includes("threshold") && !l.includes("certified"),
                })}>
                  <span className="opacity-50 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                  <span>{l}</span>
                </div>
              ))}
              {!done && <div className="flex gap-2 text-muted-foreground/50"><span className="animate-pulse">▌</span></div>}
            </div>
          </div>
          {agentsDone && (
            <div className="flex justify-end">
              <Button size="lg" className="gap-2" onClick={onComplete}>
                View Routing Analysis <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function buildAllLogs(scenario: Scenario): string[] {
  return [
    "[Telemetry] Connecting to IoT hub…",
    "[Telemetry] Tank sensors online · 3/3 customers",
    "[Telemetry] Alert: Customer at threshold",
    "[Demand] Computing usage curves…",
    `[Demand] 7-day demand forecast: ${scenario.expectedDemand7Days} m³`,
    "[Demand] Allocations balanced to truck capacity",
    "[Pricing] Loading contract rate cards…",
    "[Pricing] Emergency surcharge applied",
    "[Pricing] Net margin: 18.4% optimised",
    "[Plant] Checking depot manifest…",
    `[Plant] ${scenario.truckId} certified N₂ · ${scenario.truckCapacity}m³`,
    "[Plant] ETA depot departure: T+12min",
    "[Routing] Evaluating 3 route options…",
    `[Routing] Priority-first optimal · ${scenario.routeOptions[0].totalKm} km`,
    "[Routing] All SLAs met · LOW risk",
    "[Risk] Loading contract database…",
    "[Risk] Take-or-Pay clause active · penalties scheduled",
    "[Risk] Credit scores assessed",
    "[LENA] Synthesising agent outputs…",
    "[LENA] Decision package ready",
    "[LENA] Awaiting COO approval",
  ];
}

function TerminalIcon({ className }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" /></svg>;
}

// ─── Customer Card ────────────────────────────────────────────────────────────
function CustomerCard({ c }: { c: Customer }) {
  const urgency = c.hoursToEmpty < 4 ? "IMMINENT" : c.hoursToEmpty < 12 ? "URGENT" : "STABLE";
  const deliveryPct = Math.round((c.deliveryRequired / 100) * 100);
  const creditBg = c.creditScore >= 750 ? "bg-emerald-100 text-emerald-700" : c.creditScore >= 650 ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700";

  return (
    <div className={cn("rounded-xl border p-5 space-y-4", {
      "border-red-300 bg-red-50/50 dark:bg-red-950/20": c.priority === "CRITICAL",
      "border-orange-300 bg-orange-50/50": c.priority === "HIGH",
      "border-border": c.priority === "MEDIUM",
    })}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold text-muted-foreground"></span>
            <PriorityBadge priority={c.priority} />
          </div>
          <h3 className="font-semibold">{c.name}</h3>
          <p className="text-xs text-muted-foreground">{c.industry} · {c.location}</p>
        </div>
        <div className="text-right">
          <div className={cn("text-2xl font-bold font-mono", { "text-red-600": urgency === "IMMINENT", "text-orange-500": urgency === "URGENT", "text-emerald-600": urgency === "STABLE" })}>
            {c.hoursToEmpty.toFixed(1)}h
          </div>
          <div className="text-[10px] text-muted-foreground">to empty</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
        <div><span className="text-muted-foreground">Usage rate</span><p className="font-semibold">{c.dailyUsage} m³/hr</p></div>
        <div><span className="text-muted-foreground">Tank level</span><p className={cn("font-semibold", { "text-red-600": c.currentLevel <= c.threshold })}>{c.currentLevel}% <span className="text-muted-foreground font-normal">(threshold {c.threshold}%)</span></p></div>
        <div><span className="text-muted-foreground">Annual revenue</span><p className="font-semibold">£{c.annualRevenue}M</p></div>
        <div><span className="text-muted-foreground">Contract value</span><p className="font-semibold">£{c.contractValue}M</p></div>
        <div>
          <span className="text-muted-foreground">Credit Score</span>
          <p className="font-semibold flex items-center gap-1 mt-0.5">
            <span className={cn("font-bold px-1.5 py-0.5 rounded text-[10px]", creditBg)}>{c.creditScore}</span>
          </p>
        </div>
        <div><span className="text-muted-foreground">SLA penalty</span><p className="font-semibold text-red-600">£{c.penaltyPerHour}K/hr</p></div>
        <div><span className="text-muted-foreground">Last payment</span><p className="font-semibold text-[11px]">{c.lastPaymentDate}<br /><span className="text-muted-foreground font-normal">£{(c.lastPaymentAmount / 1000).toFixed(0)}K</span></p></div>
        <div><span className="text-muted-foreground">Payment on-time</span>
          <p className={cn("font-bold text-sm mt-0.5", c.paymentOnTimeAccuracy >= 95 ? "text-emerald-600" : c.paymentOnTimeAccuracy >= 85 ? "text-orange-500" : "text-red-600")}>
            {c.paymentOnTimeAccuracy}%
          </p>
        </div>
        <div><span className="text-muted-foreground">Distance from plant</span><p className="font-semibold">{c.distanceFromPlant} km</p></div>
        <div><span className="text-muted-foreground">Last delivery</span><p className="font-semibold">{c.lastDelivery}</p></div>
      </div>
      <div className="pt-1">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">Tank level</span>
          <span className="font-mono font-semibold">{c.currentLevel}%</span>
        </div>
        <div className="relative h-2 bg-muted rounded-full overflow-visible">
          <div className={cn("h-full rounded-full", { "bg-red-500": c.currentLevel <= c.threshold, "bg-orange-400": c.currentLevel > c.threshold && c.currentLevel <= c.threshold * 1.5, "bg-emerald-500": c.currentLevel > c.threshold * 1.5 })} style={{ width: `${c.currentLevel}%` }} />
          <div className="absolute top-0 h-2 w-0.5 bg-red-500" style={{ left: `${c.threshold}%` }} title={`Threshold: ${c.threshold}%`} />
        </div>
        <div className="flex justify-between text-[9px] text-muted-foreground mt-0.5">
          <span>0%</span><span className="text-red-500">▲ {c.threshold}% threshold</span><span>100%</span>
        </div>
      </div>
      <div className="pt-2 border-t">
        <span className="text-xs text-muted-foreground">Delivery allocation</span>
        <div className="flex items-center gap-2 mt-1">
          <div className="h-2 bg-muted rounded-full overflow-hidden flex-1">
            <div className="h-full bg-primary rounded-full" style={{ width: `${deliveryPct}%` }} />
          </div>
          <span className="font-mono font-bold text-sm text-primary">{c.deliveryRequired} m³</span>
        </div>
        {urgency === "IMMINENT" && (
          <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full mt-2 inline-block animate-pulse">⚠ Imminent runout</span>
        )}
      </div>
    </div>
  );
}

function DemandAllocationPie({ customers, truckCapacity }: { customers: Customer[]; truckCapacity: number }) {
  const colors = ["#ef4444", "#f97316", "#3b82f6"];
  const rawTotal = customers.reduce((s, c) => s + c.deliveryRequired, 0);
  const normalised = customers.map(c => ({ ...c, normDelivery: Math.round((c.deliveryRequired / rawTotal) * truckCapacity) }));
  const normSum = normalised.reduce((s, c) => s + c.normDelivery, 0);
  if (normalised.length > 0) normalised[normalised.length - 1].normDelivery += truckCapacity - normSum;
  const total = truckCapacity;
  const segments = normalised.map((c, i) => ({ label: c.name.split(" ")[0], value: c.normDelivery, color: colors[i] }));
  let cumAngle = -90;
  const cx = 80, cy = 80, r = 65, inner = 40;
  const arcs = segments.map(seg => {
    const angle = (seg.value / total) * 360;
    const startAngle = cumAngle;
    cumAngle += angle;
    const endAngle = cumAngle;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(startAngle)), y1 = cy + r * Math.sin(toRad(startAngle));
    const x2 = cx + r * Math.cos(toRad(endAngle)), y2 = cy + r * Math.sin(toRad(endAngle));
    const ix1 = cx + inner * Math.cos(toRad(startAngle)), iy1 = cy + inner * Math.sin(toRad(startAngle));
    const ix2 = cx + inner * Math.cos(toRad(endAngle)), iy2 = cy + inner * Math.sin(toRad(endAngle));
    const large = angle > 180 ? 1 : 0;
    const path = `M ${ix1} ${iy1} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${inner} ${inner} 0 ${large} 0 ${ix1} ${iy1} Z`;
    return { ...seg, path, pct: Math.round((seg.value / total) * 100) };
  });
  return (
    <div className="bg-card rounded-xl border p-5">
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
        <Droplets className="h-4 w-4 text-primary" /> Demand Allocation — {truckCapacity} m³ Truck (100%)
      </h3>
      <div className="flex items-center gap-6">
        <svg width="160" height="160" viewBox="0 0 160 160">
          {arcs.map((arc, i) => <path key={i} d={arc.path} fill={arc.color} stroke="white" strokeWidth="2" />)}
          <text x="80" y="76" textAnchor="middle" className="font-bold" style={{ fontSize: 18, fill: "currentColor", fontWeight: 700 }}>{truckCapacity}</text>
          <text x="80" y="90" textAnchor="middle" style={{ fontSize: 9, fill: "#6b7280" }}>m³ total</text>
        </svg>
        <div className="flex-1 space-y-3">
          {arcs.map((arc, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-sm shrink-0" style={{ background: arc.color }} />
              <div className="flex-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium">{arc.label}</span>
                  <span className="font-mono font-bold">{arc.value} m³ ({arc.pct}%)</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${arc.pct}%`, background: arc.color }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Route Options Component ──────────────────────────────────────────────────
function RouteOptionsSection({
  scenario, selectedRouteId, onSelectRoute,
}: {
  scenario: Scenario; selectedRouteId: string; onSelectRoute: (id: string) => void;
}) {
  const tagStyles: Record<string, string> = {
    "LENA Recommended": "bg-primary/10 text-primary border border-primary/30",
    "Customer Satisfaction": "bg-emerald-100 text-emerald-700 border border-emerald-300",
    "Quick Delivery": "bg-blue-100 text-blue-700 border border-blue-300",
    "Cost Efficient": "bg-amber-100 text-amber-700 border border-amber-300",
  };
  return (
    <div className="space-y-3">
      {scenario.routeOptions.map(r => {
        const isSelected = selectedRouteId === r.id;
        return (
          <div
            key={r.id}
            onClick={() => onSelectRoute(r.id)}
            className={cn(
              "rounded-xl border p-4 flex items-start gap-4 cursor-pointer transition-all duration-200",
              isSelected ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border hover:border-primary/40 hover:bg-muted/30"
            )}
          >
            <div className="shrink-0 mt-0.5">
              {isSelected
                ? <CheckCircle2 className="h-5 w-5 text-primary" />
                : <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="font-semibold text-sm">{r.label}</span>
                {r.tags.map(tag => (
                  <span key={tag} className={cn("text-[10px] px-2 py-0.5 rounded-full font-semibold", tagStyles[tag] || "bg-muted text-muted-foreground")}>{tag}</span>
                ))}
                <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full ml-auto", {
                  "bg-emerald-100 text-emerald-700": r.onTimeRisk === "LOW",
                  "bg-orange-100 text-orange-700": r.onTimeRisk === "MEDIUM",
                  "bg-red-100 text-red-700": r.onTimeRisk === "HIGH",
                })}>{r.onTimeRisk} risk</span>
              </div>
              <div className="flex gap-1 flex-wrap mb-2">
                {r.stops.map((stop, si) => (
                  <div key={si} className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">{stop}</span>
                    {si < r.stops.length - 1 && <ChevronRight className="h-3 w-3 text-muted-foreground/50" />}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-3 text-xs">
                <div><span className="text-muted-foreground">Distance</span><p className="font-semibold font-mono">{r.totalKm} km</p></div>
                <div><span className="text-muted-foreground">Duration</span><p className="font-semibold font-mono">{r.totalTime} hrs</p></div>
                <div><span className="text-muted-foreground">Fuel cost</span><p className="font-semibold font-mono">£{r.fuelCost}</p></div>
                <div><span className="text-muted-foreground">CO₂</span><p className="font-semibold font-mono">{r.co2kg} kg</p></div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Simulation View ──────────────────────────────────────────────────────────
function SimulationView({ scenario, onDecision, onBack }: {
  scenario: Scenario; onDecision: () => void; onBack: () => void;
}) {
  const customers = [...scenario.customers].sort((a, b) => a.hoursToEmpty - b.hoursToEmpty);
  const inventoryStatus = scenario.inventoryLevel >= scenario.expectedDemand7Days ? "sufficient" : "low";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </div>
      <div>
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Thermometer className="h-4 w-4 text-primary" /> Customer Telemetry — Priority by Time-to-Empty
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {customers.map((c) => <CustomerCard key={c.id} c={c} />)}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-card rounded-xl border p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Gas Type</p>
          <p className="font-bold text-lg text-primary">{scenario.gasType}</p>
          <p className="text-[11px] text-muted-foreground mt-1">This dispatch</p>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Inventory Level</p>
          <p className="font-bold text-2xl font-mono">{scenario.inventoryLevel}<span className="text-sm font-normal text-muted-foreground ml-1">m³</span></p>
          <p className={cn("text-[11px] mt-1 font-semibold", inventoryStatus === "sufficient" ? "text-emerald-600" : "text-orange-600")}>
            {inventoryStatus === "sufficient" ? "✓ Sufficient" : "⚠ Monitor"}
          </p>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Expected Demand (7d)</p>
          <p className="font-bold text-2xl font-mono">{scenario.expectedDemand7Days}<span className="text-sm font-normal text-muted-foreground ml-1">m³</span></p>
          <p className="text-[11px] text-muted-foreground mt-1">Forecast period</p>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Customers to Act On</p>
          <p className="font-bold text-2xl font-mono">{customers.length}</p>
          <p className="text-[11px] text-muted-foreground mt-1">
            {customers.filter(c => c.priority === "CRITICAL").length} Critical · {customers.filter(c => c.priority === "HIGH").length} High
          </p>
        </div>
      </div>
      <div className="flex justify-end">
        <Button size="lg" className="gap-2" onClick={onDecision}>
          View Decision Summary <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── Decision View ────────────────────────────────────────────────────────────
function DecisionView({ scenario, onBack }: { scenario: Scenario; onBack: () => void }) {
  const [approved, setApproved] = useState(false);
  const [rejected, setRejected] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState<string>(
    scenario.routeOptions.find(r => r.recommended)?.id ?? scenario.routeOptions[0].id
  );
  const routeOptionsRef = useRef<HTMLDivElement>(null);

  const recommended = scenario.routeOptions.find(r => r.recommended)!;
  const selectedRoute = scenario.routeOptions.find(r => r.id === selectedRouteId) ?? recommended;
  const customers = [...scenario.customers].sort((a, b) => a.hoursToEmpty - b.hoursToEmpty);
  const totalRevenue = customers.reduce((s, c) => s + c.annualRevenue, 0);
  const totalContract = customers.reduce((s, c) => s + c.contractValue, 0);
  const penaltyAvertedMax = customers[0].penaltyPerHour * 8;

  function handleModify() {
    setApproved(false);
    setRejected(false);
    routeOptionsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </div>
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold">Decision Summary</h2>
          <p className="text-sm text-muted-foreground mt-1">{scenario.label} · Truck {scenario.truckId} · Generated by LENA</p>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-mono">{new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      <DemandAllocationPie customers={customers} truckCapacity={scenario.truckCapacity} />

      <div ref={routeOptionsRef}>
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Navigation className="h-4 w-4 text-primary" /> Route Options Evaluated
        </h3>
        <RouteOptionsSection
          scenario={scenario}
          selectedRouteId={selectedRouteId}
          onSelectRoute={setSelectedRouteId}
        />
      </div>

      <div className="bg-card rounded-xl border p-5">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Recommended Delivery Sequence — {scenario.truckId}
        </h3>
        <div className="space-y-3">
          {customers.map((c, i) => (
            <div key={c.id} className="flex gap-4 items-start">
              <div className={cn("h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0", {
                "bg-red-500": i === 0, "bg-orange-400": i === 1, "bg-blue-500": i === 2,
              })}>{i + 1}</div>
              <div className="flex-1 p-3 rounded-lg bg-muted/40">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">{c.name}</span>
                  <PriorityBadge priority={c.priority} />
                </div>
                <div className="flex flex-wrap gap-4 mt-1.5 text-xs text-muted-foreground">
                  <span>Deliver: <span className="font-mono font-semibold text-foreground">{c.deliveryRequired} m³ N₂</span></span>
                  <span>Buffer: <span className="font-semibold text-foreground">{c.hoursToEmpty.toFixed(1)} hrs left</span></span>
                  <span>Revenue: <span className="font-semibold text-foreground">£{c.annualRevenue}M/yr</span></span>
                  <span>Credit Score: <span className="font-semibold text-foreground">{c.creditScore}</span></span>
                  <span>Penalty: <span className="font-semibold text-red-600">£{c.penaltyPerHour}K/hr if missed</span></span>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">
                  {i === 0 && "Critical — deliver first. Threshold breached. Take-or-Pay clause active."}
                  {i === 1 && "High priority — deliver second. Sufficient buffer for travel time. SLA protected."}
                  {i === 2 && "Stable — deliver last. Tank level within safe window. No breach risk."}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-xl border p-5">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Customer Credit Risk Profile</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="text-left py-2 pr-3 font-medium">Customer</th>
                <th className="text-left py-2 pr-3 font-medium">Credit Score</th>
                <th className="text-left py-2 pr-3 font-medium">Payment Terms</th>
                <th className="text-left py-2 pr-3 font-medium">Last Payment</th>
                <th className="text-left py-2 pr-3 font-medium">On-Time %</th>
                <th className="text-left py-2 pr-3 font-medium">Distance (Plant)</th>
                <th className="text-left py-2 font-medium">SLA Penalty/hr</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {customers.map(c => {
                const scoreBg = c.creditScore >= 750 ? "bg-emerald-100 text-emerald-700" : c.creditScore >= 650 ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700";
                return (
                  <tr key={c.id}>
                    <td className="py-2.5 pr-3 font-semibold">{c.name}</td>
                    <td className="py-2.5 pr-3"><span className={cn("font-bold px-1.5 py-0.5 rounded text-[10px]", scoreBg)}>{c.creditScore}</span></td>
                    <td className="py-2.5 pr-3 text-muted-foreground">{c.paymentDays} days</td>
                    <td className="py-2.5 pr-3"><p className="font-semibold">{c.lastPaymentDate}</p><p className="text-muted-foreground">£{(c.lastPaymentAmount / 1000).toFixed(0)}K</p></td>
                    <td className="py-2.5 pr-3"><span className={cn("font-bold", c.paymentOnTimeAccuracy >= 95 ? "text-emerald-600" : c.paymentOnTimeAccuracy >= 85 ? "text-orange-500" : "text-red-600")}>{c.paymentOnTimeAccuracy}%</span></td>
                    <td className="py-2.5 pr-3 text-muted-foreground">{c.distanceFromPlant} km</td>
                    <td className="py-2.5 text-red-600 font-semibold">£{c.penaltyPerHour}K</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-card rounded-xl border p-5">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Financial Impact Analysis</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-xs text-red-700 font-semibold">Penalty Exposure (if delayed)</p>
              <p className="font-bold text-xl text-red-600 font-mono mt-1">£{penaltyAvertedMax.toFixed(0)}K</p>
              <p className="text-xs text-red-600">£{customers[0].penaltyPerHour}K/hr × 8 hrs est. delay</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
              <p className="text-xs text-emerald-700 font-semibold">Penalty Averted (LENA action)</p>
              <p className="font-bold text-xl text-emerald-600 font-mono mt-1">£{penaltyAvertedMax.toFixed(0)}K</p>
              <p className="text-xs text-emerald-600">All SLAs met · {selectedRoute.onTimeRisk} risk</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-muted/40 border">
              <p className="text-xs text-muted-foreground font-semibold">Total Annual Revenue Protected</p>
              <p className="font-bold text-xl font-mono mt-1">£{totalRevenue.toFixed(1)}M</p>
              <p className="text-xs text-muted-foreground">Across {customers.length} long-term accounts</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/40 border">
              <p className="text-xs text-muted-foreground font-semibold">Total Contract Value Protected</p>
              <p className="font-bold text-xl font-mono mt-1">£{totalContract.toFixed(1)}M</p>
              <p className="text-xs text-muted-foreground">Weighted contract portfolio</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border p-5">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Factors Considered by LENA</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Telemetry time-to-empty", value: `${customers[0].hoursToEmpty}h critical · ${customers[1].hoursToEmpty}h high`, icon: Thermometer },
            { label: "Contract type & penalties", value: `Take-or-Pay £${customers[0].penaltyPerHour}K/hr · Long-Term SLAs`, icon: FileText },
            { label: "Annual revenue weighting", value: `£${customers.map(c => c.annualRevenue + "M").join(" · ")}`, icon: BarChart3 },
            { label: "Credit risk assessment", value: `${customers.map(c => c.name.split(" ")[0] + ": " + c.creditScore).join(" · ")}`, icon: CreditCard },
            { label: "Payment terms & on-time accuracy", value: `${customers.map(c => c.paymentOnTimeAccuracy + "% OTA").join(" · ")}`, icon: Clock },
            { label: "Route & fuel cost", value: `${selectedRoute.totalKm} km · £${selectedRoute.fuelCost} fuel`, icon: Navigation },
            { label: "Carbon emissions", value: `${selectedRoute.co2kg} kg CO₂`, icon: Zap },
            { label: "Road & weather conditions", value: scenario.id === "C" ? "A63 flooding — M62 reroute active" : "Normal — no disruptions", icon: AlertTriangle },
          ].map(f => (
            <div key={f.label} className="flex gap-3 p-3 rounded-lg bg-muted/40">
              <f.icon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div><p className="text-xs font-semibold">{f.label}</p><p className="text-xs text-muted-foreground">{f.value}</p></div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-xl border p-5">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Impact of This Decision</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Immediate: Penalty averted", value: `£${penaltyAvertedMax.toFixed(0)}K`, sub: "No SLA breach for any customer", icon: CheckCircle2, color: "text-emerald-600" },
            { label: "Short-term: Revenue protected", value: `£${totalRevenue.toFixed(1)}M/yr`, sub: "All 3 accounts retained", icon: TrendingUp, color: "text-primary" },
            { label: "Long-term: Relationship value", value: `£${totalContract.toFixed(1)}M`, sub: "Contract portfolio preserved", icon: Users, color: "text-violet-600" },
          ].map(item => (
            <div key={item.label} className="p-4 rounded-lg bg-muted/40 border">
              <item.icon className={cn("h-5 w-5 mb-2", item.color)} />
              <p className="text-xs text-muted-foreground font-semibold">{item.label}</p>
              <p className={cn("font-bold text-xl font-mono mt-1", item.color)}>{item.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 flex items-start gap-3">
        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-emerald-700 text-sm">LENA — Analysis complete. Route optimised.</span>
          <p className="text-sm text-emerald-700 mt-1">{scenario.lenadecision}</p>
        </div>
      </div>

      {!approved && !rejected ? (
        <div className="bg-primary/5 border-2 border-primary/30 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <Users className="h-6 w-6 text-primary shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold">Human-in-the-Loop Approval Required</h3>
              <p className="text-sm text-muted-foreground mt-1">
                LENA has generated this dispatch plan for truck <span className="font-mono font-semibold">{scenario.truckId}</span>. As COO, your approval is required before the tanker departs from {scenario.depotLocation}. You may modify the delivery sequence or allocation before approving.
              </p>
              <div className="mt-4 flex gap-3">
                <Button className="gap-2" onClick={() => setApproved(true)}>
                  <CheckCircle2 className="h-4 w-4" /> Approve & Dispatch {scenario.truckId}
                </Button>
                <Button variant="outline" className="gap-2" onClick={handleModify}>
                  <RotateCcw className="h-4 w-4" /> Modify Decision
                </Button>
                <Button variant="outline" className="gap-2 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setRejected(true)}>
                  <XCircle className="h-4 w-4" /> Reject
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : approved ? (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-700 rounded-xl p-6 space-y-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-emerald-600 shrink-0" />
            <div>
              <h3 className="font-semibold text-emerald-700 dark:text-emerald-400">Dispatch Approved — {scenario.truckId} Departing</h3>
              <p className="text-sm text-emerald-600 dark:text-emerald-500">Truck {scenario.truckId} dispatched from {scenario.depotLocation}. ETA completion: {selectedRoute.totalTime} hours.</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="bg-emerald-100 rounded-lg p-3"><p className="text-emerald-700 font-semibold">Penalty averted</p><p className="font-bold text-emerald-600 text-lg font-mono">£{penaltyAvertedMax.toFixed(0)}K</p></div>
            <div className="bg-emerald-100 rounded-lg p-3"><p className="text-emerald-700 font-semibold">Revenue protected</p><p className="font-bold text-emerald-600 text-lg font-mono">£{totalRevenue.toFixed(1)}M/yr</p></div>
            <div className="bg-emerald-100 rounded-lg p-3"><p className="text-emerald-700 font-semibold">Customers served</p><p className="font-bold text-emerald-600 text-lg font-mono">{customers.length} sites</p></div>
          </div>
          <p className="text-xs text-emerald-600">Dispatch confirmed · All agents standing by.</p>
        </div>
      ) : (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-300 dark:border-red-700 rounded-xl p-6 space-y-3">
          <div className="flex items-center gap-3">
            <XCircle className="h-8 w-8 text-red-600 shrink-0" />
            <div>
              <h3 className="font-semibold text-red-700 dark:text-red-400">Dispatch Rejected — {scenario.truckId} On Hold</h3>
              <p className="text-sm text-red-600 dark:text-red-500">The dispatch plan has been rejected. Truck {scenario.truckId} remains at {scenario.depotLocation} pending a revised plan.</p>
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <Button variant="outline" className="gap-2" onClick={handleModify}>
              <RotateCcw className="h-4 w-4" /> Review & Modify Plan
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Animated Page Wrapper ────────────────────────────────────────────────────
function PageTransition({ children, viewKey }: { children: React.ReactNode; viewKey: string }) {
  return (
    <div key={viewKey} style={{ animation: "slideFromTop 0.3s ease-out forwards" }}>
      <style>{`
        @keyframes slideFromTop {
          from { opacity: 0; transform: translateY(-20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      {children}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function SupplyChain() {
  const navigate = useNavigate();
  const [view, setView] = useState<View>("dashboard");
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [agentsDone, setAgentsDone] = useState(false);

  // ── Auto-launch: read from URL query params (cross-origin) OR sessionStorage (same-origin) ──
  useEffect(() => {
    // 1. Try URL query params first (arriving from Render voting page)
    const params = new URLSearchParams(window.location.search);
    const qScenario = params.get("scenario") as ScenarioId | null;
    const qAutostart = params.get("autostart");

    if (qScenario && qAutostart === "true" && SCENARIOS[qScenario]) {
      // Clean URL without reloading
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, "", cleanUrl);
      setScenario(SCENARIOS[qScenario]);
      setAgentsDone(false);
      setView("telemetry-connect");
      return;
    }

    // 2. Fall back to sessionStorage (same-origin navigation from internal voting page)
    const sid = sessionStorage.getItem("lena_scenario") as ScenarioId | null;
    const autostart = sessionStorage.getItem("lena_autostart");
    if (sid && autostart === "true" && SCENARIOS[sid]) {
      sessionStorage.removeItem("lena_scenario");
      sessionStorage.removeItem("lena_autostart");
      setScenario(SCENARIOS[sid]);
      setAgentsDone(false);
      setView("telemetry-connect");
    }
  }, []);

  function handleGoToVoting() {
    navigate("/voting");
  }

  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [view]);

  function navigateTo(v: View) {
    setView(v);
  }

  return (
    <SidebarProvider>
      <div className="flex h-full w-full overflow-hidden bg-background">
        <SupplyChainSidebar
          activeView={view}
          scenarioId={scenario?.id}
          onNavigate={(v) => {
            if (v === "dashboard") navigateTo("dashboard");
            else if (v === "decision" && scenario) navigateTo("decision");
            else if (v === "simulation" && scenario) navigateTo("simulation");
            else if (v === "agent-working" && scenario) navigateTo("agent-working");
          }}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="h-4 flex items-center px-4 gap-3 shrink-0 bg-background">
            <SidebarTrigger className="h-8 w-8" />
            <div className="h-4 w-px bg-border" />
            <nav className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>Core</span>
              <ChevronRight className="h-3 w-3" />
              <span>Supply Chain</span>
              {view === "agent-working" && <><ChevronRight className="h-3 w-3" /><span className="text-foreground">Master Agent</span></>}
              {view === "simulation" && <><ChevronRight className="h-3 w-3" /><span className="text-foreground">Routing Agent</span></>}
              {view === "telemetry-connect" && <><ChevronRight className="h-3 w-3" /><span className="text-foreground">Telemetry Connect</span></>}
              {view === "decision" && <><ChevronRight className="h-3 w-3" /><span className="text-foreground">Decision Summary</span></>}
            </nav>
          </div>
          <div className="flex-1 overflow-y-auto" ref={contentRef}>
            <div className="max-w-6xl mx-auto px-6 py-6">
              <PageTransition viewKey={view}>
                {view === "dashboard" && <DashboardView onGoToVoting={handleGoToVoting} />}
                {view === "telemetry-connect" && scenario && (
                  <TelemetryConnectView
                    scenario={scenario}
                    onComplete={() => navigateTo("agent-working")}
                    onBack={() => navigateTo("dashboard")}
                  />
                )}
                {view === "agent-working" && scenario && (
                  <AgentWorkingView
                    scenario={scenario}
                    agentsDone={agentsDone}
                    onComplete={() => {
                      setAgentsDone(true);
                      navigateTo("simulation");
                    }}
                    onBack={() => navigateTo("telemetry-connect")}
                  />
                )}
                {view === "simulation" && scenario && (
                  <SimulationView
                    scenario={scenario}
                    onDecision={() => navigateTo("decision")}
                    onBack={() => navigateTo("agent-working")}
                  />
                )}
                {view === "decision" && scenario && (
                  <DecisionView scenario={scenario} onBack={() => navigateTo("simulation")} />
                )}
              </PageTransition>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
