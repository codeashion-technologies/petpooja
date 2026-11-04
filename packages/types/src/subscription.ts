import { z } from "zod";

export type PlanTier = "TRIAL" | "STARTER" | "GROWTH" | "SCALE";

export interface SaasPlan {
  id: PlanTier;
  name: string;
  tagline: string;
  badge?: string;
  isPopular?: boolean;
  annualPrice: number;
  monthlyPrice: number;
  features: string[];
  limits: {
    branches: number | "UNLIMITED";
    terminals: number | "UNLIMITED";
    reports: string;
    kds: boolean;
    inventory: boolean;
    qrOrdering: boolean;
    multiBranch: boolean;
    kiosk: boolean;
    loyalty: boolean;
  };
}

export const SAAS_PLANS: Record<PlanTier, SaasPlan> = {
  TRIAL: {
    id: "TRIAL",
    name: "7-Day Free Trial",
    tagline: "Test All Pro Features Free on Your Restaurant Counter",
    badge: "Risk-Free Trial",
    annualPrice: 0,
    monthlyPrice: 0,
    features: [
      "Full Access to all Growth (Pro) Features",
      "100% Offline Local Billing (Zero Downtime)",
      "Kitchen Display System (KDS) Live Order Screens",
      "Captain Ordering & Real-time Table Floor Map",
      "Thermal Bill Printing (58mm & 80mm ESC/POS)",
      "Cash Drawer & Cashier Shift Float Tracking",
      "Full 7-Day Validity (Auto-Locks on Day 7)",
      "Zero Credit Card or Payment Required",
    ],
    limits: {
      branches: 1,
      terminals: "UNLIMITED",
      reports: "Standard Reports",
      kds: true,
      inventory: true,
      qrOrdering: true,
      multiBranch: false,
      kiosk: false,
      loyalty: false,
    },
  },
  STARTER: {
    id: "STARTER",
    name: "Starter (Base)",
    tagline: "Essential POS & Cloud Sync for Cafes, Bakeries & QSRs",
    annualPrice: 8499,
    monthlyPrice: 899,
    features: [
      "100% Offline Local Billing (Zero Downtime)",
      "Supabase Central Cloud Sync & Auto-Backup",
      "Cash Drawer & Cashier Shift Float Tracking",
      "Table & Order Management with KOT Printing",
      "Menu Categories & Half/Full Price Dishes",
      "Daily Sales, Cash Collection & Day-End Z-Report",
      "Multi-Language: English, Gujarati, Hindi",
      "Unlimited Bills & Counter Staff Logins",
    ],
    limits: {
      branches: 1,
      terminals: "UNLIMITED",
      reports: "90+ Core Reports",
      kds: false,
      inventory: false,
      qrOrdering: false,
      multiBranch: false,
      kiosk: false,
      loyalty: false,
    },
  },
  GROWTH: {
    id: "GROWTH",
    name: "Growth (Pro)",
    tagline: "Advanced Operations for Full-Service Dine-In & Bar Outlets",
    badge: "Most Popular ⭐",
    isPopular: true,
    annualPrice: 14499,
    monthlyPrice: 1499,
    features: [
      "Everything in Starter Plan, PLUS:",
      "Kitchen Display System (KDS) Live Order Screens",
      "Smart Multi-Counter & Multi-Printer Routing",
      "QR Code Table Ordering & Digital Menu",
      "Inventory & Raw Material Recipe Stock Deductions",
      "Wastage Tracking & Low Stock Alerts",
      "Zomato & Swiggy Online Aggregator Reconciliation",
      "Staff Attendance Clock-In & Granular Roles",
      "Expense & Cash Drop Management to Safe",
    ],
    limits: {
      branches: 1,
      terminals: "UNLIMITED",
      reports: "Advanced Analytics & Profitability",
      kds: true,
      inventory: true,
      qrOrdering: true,
      multiBranch: false,
      kiosk: false,
      loyalty: false,
    },
  },
  SCALE: {
    id: "SCALE",
    name: "Scale (Enterprise)",
    tagline: "Full-Stack Management for Multi-Branch Chains & Franchises",
    badge: "Enterprise Suite",
    annualPrice: 21999,
    monthlyPrice: 2199,
    features: [
      "Everything in Growth Plan, PLUS:",
      "Centralized Multi-Branch Cloud Management",
      "Central Menu & Real-time Price Sync Across Outlets",
      "Inter-Branch Stock Transfers & Central Warehouse",
      "Table Reservation & Waitlist Queue Management",
      "Self-Ordering Customer Kiosk Mode",
      "Customer Loyalty Rewards & Gift Cards",
      "Granular Multi-Branch Comparative Reports",
      "Priority 24/7 Phone & Remote Onboarding Assistance",
    ],
    limits: {
      branches: "UNLIMITED",
      terminals: "UNLIMITED",
      reports: "Enterprise Multi-Branch Analytics",
      kds: true,
      inventory: true,
      qrOrdering: true,
      multiBranch: true,
      kiosk: true,
      loyalty: true,
    },
  },
};

export const selectPlanSchema = z.object({
  plan: z.enum(["TRIAL", "STARTER", "GROWTH", "SCALE"]).default("GROWTH"),
  billingCycle: z.enum(["MONTHLY", "ANNUAL"]).default("ANNUAL"),
});
export type SelectPlanDto = z.infer<typeof selectPlanSchema>;

