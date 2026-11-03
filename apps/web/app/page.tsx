"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Zap,
  CheckCircle2,
  WifiOff,
  ChefHat,
  Receipt,
  Store,
  Layers,
  ShieldCheck,
  Globe,
  Database,
  ArrowRight,
  PhoneCall,
  MessageCircle,
  HelpCircle,
  Check,
  X,
  Menu,
  Lock,
  ArrowUpRight,
  UserCheck,
  Printer,
  Clock,
  Smartphone,
  LayoutGrid,
  Bell,
} from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { PosMockup } from "@/components/marketing/pos-mockup";
import { SAAS_PLANS, type PlanTier } from "@nodedr-restaurant/types";

export default function MarketingHomePage() {
  const [billingCycle, setBillingCycle] = useState<"ANNUAL" | "MONTHLY">("ANNUAL");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Demo lead state
  const [restaurantName, setRestaurantName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [interestedPlan, setInterestedPlan] = useState("GROWTH");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/v1/leads/demo-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantName,
          contactName,
          phone,
          city,
          interestedPlan,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit demo request. Please try again.");
      }

      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const planKeys: PlanTier[] = ["STARTER", "GROWTH", "SCALE"];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <Logo size={34} />
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-foreground leading-none">
                OrderRestro
              </span>
              <span className="text-[10px] text-muted-foreground font-mono mt-0.5">
                Restaurant POS Platform
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#operations" className="hover:text-foreground transition-colors">
              Operations & KDS
            </a>
            <a href="#pricing" className="hover:text-foreground transition-colors">
              Plans & Pricing
            </a>
            <a href="#demo" className="hover:text-foreground transition-colors">
              Book Live Demo
            </a>
          </nav>

          <div className="hidden sm:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="gap-1.5 font-medium">
                <UserCheck className="h-4 w-4" />
                <span>Client Login</span>
              </Button>
            </Link>
            <a href="#demo">
              <Button size="sm" className="bg-primary text-primary-foreground font-semibold shadow-sm">
                Book a Demo
              </Button>
            </a>
          </div>

          {/* Mobile Hamburger Controls */}
          <div className="flex items-center gap-2 md:hidden">
            <Link href="/login">
              <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs font-medium">
                Login
              </Button>
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground hover:bg-muted"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-border bg-card/95 backdrop-blur-md px-4 py-4 md:hidden space-y-3 animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col gap-1 text-sm font-medium">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-foreground hover:bg-muted transition-colors"
              >
                Features
              </a>
              <a
                href="#operations"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-foreground hover:bg-muted transition-colors"
              >
                Operations & KDS
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-foreground hover:bg-muted transition-colors"
              >
                Plans & Pricing
              </a>
              <a
                href="#demo"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-foreground hover:bg-muted transition-colors"
              >
                Book Live Demo
              </a>
            </nav>
            <div className="pt-2 border-t border-border">
              <a href="#demo" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-primary text-primary-foreground font-semibold">
                  Book a Free Live Demo
                </Button>
              </a>
            </div>
          </div>
        )}
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden px-4 pt-16 pb-20 sm:px-6 sm:pt-24 text-center">
        {/* Radial ambient glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(60%_50%_at_50%_0%,color-mix(in_oklch,var(--primary),transparent_86%),transparent)]"
        />

        <div className="mx-auto max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary mb-6 shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Commercial Restaurant POS · Zero Docker · 100% Offline Resilience</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-[1.12]">
            The Modern Restaurant POS
            <span className="block text-primary mt-1">Built to Accelerate Your Service.</span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Local-first lightning billing, live kitchen display (KDS), floor & table map,
            cash drawer shift tracking, and automated Supabase cloud sync. Everything Petpooja offers,
            engineered for ultra-fast performance.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <a href="#demo" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-12 px-7 text-sm font-semibold gap-2 bg-primary text-primary-foreground shadow-md hover:shadow-lg transition-all">
                Book a Free Live Demo & Consultation
                <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
            <a href="#pricing" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 px-6 text-sm font-semibold">
                Explore Plans (From ₹8,499/yr)
              </Button>
            </a>
          </div>

          {/* Quick value badges */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              100% Offline Billing (No Internet Needed)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Zero Docker · Native Windows Portable
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Supabase Cloud Sync & Backup
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Thermal Bill Print (58mm & 80mm)
            </span>
          </div>
        </div>

        {/* POS Interface Preview */}
        <div className="mt-14 max-w-6xl mx-auto">
          <PosMockup />
        </div>
      </section>

      {/* 3. Features Section */}
      <section id="features" className="py-20 bg-muted/30 border-y border-border px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary mb-2">
              Enterprise Features
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Engineered for Every Stage of Restaurant Growth
            </h3>
            <p className="mt-3 text-muted-foreground text-sm sm:text-base">
              From busy quick-service outlets to fine dine restaurants and multi-branch chains,
              OrderRestro keeps operations frictionless.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1 */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-5">
                <Receipt className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-bold">Lightning-Fast Billing</h4>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Split bills, merge tables, add item notes, apply discount codes, tax GST calculation,
                and print thermal receipts in under 1 second.
              </p>
            </div>

            {/* 2 */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 mb-5">
                <WifiOff className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-bold">100% Offline-First</h4>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Local PostgreSQL runtime guarantees uninterrupted billing even during complete internet
                or ISP outages. Never keep customers waiting.
              </p>
            </div>

            {/* 3 */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 mb-5">
                <ChefHat className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-bold">Live Kitchen Display (KDS)</h4>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Paperless kitchen order tickets routed directly to chef screens. Real-time timers,
                station filters, and audio chimes for new orders.
              </p>
            </div>

            {/* 4 */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 mb-5">
                <Database className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-bold">Supabase Cloud Sync</h4>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Automatic cloud replication keeps your sales, inventory, and analytics backed up.
                Access multi-outlet reports from your mobile anytime.
              </p>
            </div>

            {/* 5 */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 mb-5">
                <Store className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-bold">Cash Drawer & Shift Audits</h4>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Opening cash float logging, mid-shift pay-ins/pay-outs, expected vs counted cash,
                and mandatory shift handover reports to prevent pilferage.
              </p>
            </div>

            {/* 6 */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 mb-5">
                <Globe className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-bold">Multilingual Interface</h4>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Full native language support for English, ગુજરાતી (Gujarati), and हिंदी (Hindi).
                Staff can switch languages with one click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3.5 Operations & KDS Section */}
      <section id="operations" className="py-20 bg-background border-b border-border px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary mb-3 shadow-sm">
              <ChefHat className="h-3.5 w-3.5" />
              <span>Real-Time Kitchen, Floor & Captain Workflow</span>
            </div>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Seamless Operations from Captain to Kitchen
            </h3>
            <p className="mt-3 text-muted-foreground text-sm sm:text-base">
              Say goodbye to messy paper tickets and delayed orders. Connect captains, cashiers, and kitchen chefs in real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Card 1: Wireless KDS */}
            <div className="flex flex-col rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600">
                  <ChefHat className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-orange-500/10 border border-orange-500/20 px-2.5 py-0.5 text-[11px] font-bold text-orange-600">
                  PAPERLESS KDS
                </span>
              </div>
              <h4 className="text-xl font-bold text-foreground">Live Kitchen Display System</h4>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Replaces noisy dot-matrix printers with digital screens. Order tickets appear instantly with color-coded timers and station filters.
              </p>

              {/* KDS Mockup Ticket */}
              <div className="mt-6 rounded-2xl border border-border bg-muted/40 p-4 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-border/80 pb-2">
                  <div className="font-bold text-foreground">TICKET #104</div>
                  <span className="rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-bold animate-pulse">
                    PREPARING · 3m
                  </span>
                </div>
                <div className="space-y-1.5 text-foreground text-[11px]">
                  <div className="flex justify-between">
                    <span>2x Paneer Tikka Masala</span>
                    <span className="text-primary font-bold">Main</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground pl-2 italic">
                    ↳ Note: Mild spicy, less oil
                  </div>
                  <div className="flex justify-between">
                    <span>4x Butter Garlic Naan</span>
                    <span className="text-primary font-bold">Tandoor</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-border/80 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Table 07 · Dine-In</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Captain: Rahul</span>
                </div>
              </div>

              <ul className="mt-6 space-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Works on any Android TV, tablet, iPad or PC</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Audio chime alerts when new order arrives</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Split items across Kitchen, Tandoor & Bar stations</span>
                </li>
              </ul>
            </div>

            {/* Card 2: Captain App & Table Management */}
            <div className="flex flex-col rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                  <LayoutGrid className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 text-[11px] font-bold text-blue-600">
                  TABLE & FLOOR MAP
                </span>
              </div>
              <h4 className="text-xl font-bold text-foreground">Captain App & Floor Layout</h4>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Waiters take orders tableside on their mobile phones. Live visual floor map displays vacant, occupied, running KOT, and billed tables.
              </p>

              {/* Table Floor Mockup */}
              <div className="mt-6 rounded-2xl border border-border bg-muted/40 p-4 space-y-2.5 text-xs">
                <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-2">
                  Ground Floor · Realtime Occupancy
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-center">
                    <div className="font-bold text-emerald-600 dark:text-emerald-400">T-01 (4 Pax)</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Vacant / Ready</div>
                  </div>
                  <div className="rounded-xl border border-primary/30 bg-primary/10 p-2.5 text-center">
                    <div className="font-bold text-primary">T-02 (2 Pax)</div>
                    <div className="text-[10px] font-mono text-foreground font-semibold mt-0.5">₹1,420 (KOT Live)</div>
                  </div>
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-center">
                    <div className="font-bold text-amber-600 dark:text-amber-400">T-03 (6 Pax)</div>
                    <div className="text-[10px] text-foreground font-semibold mt-0.5">Bill Printed</div>
                  </div>
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-center">
                    <div className="font-bold text-emerald-600 dark:text-emerald-400">T-04 (4 Pax)</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Vacant / Ready</div>
                  </div>
                </div>
              </div>

              <ul className="mt-6 space-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Transfer items between tables or merge bills easily</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Captains take orders on smartphone — zero notepad wastage</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Guest seat tracking and quick table turnaround alerts</span>
                </li>
              </ul>
            </div>

            {/* Card 3: Thermal Hardware & Cash Reconciliation */}
            <div className="flex flex-col rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600">
                  <Printer className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 text-[11px] font-bold text-purple-600">
                  HARDWARE ECOSYSTEM
                </span>
              </div>
              <h4 className="text-xl font-bold text-foreground">Hardware & Shift Cash Float</h4>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Connect your ESC/POS receipt printers, automatic cash drawer, barcode scanners, and track cashier shift balances down to the penny.
              </p>

              {/* Hardware Mockup */}
              <div className="mt-6 rounded-2xl border border-border bg-muted/40 p-4 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between text-muted-foreground text-[10px] border-b border-border/80 pb-2">
                  <span>ESC/POS 80mm PRINTER</span>
                  <span className="text-emerald-500 font-bold">ONLINE (USB/LAN)</span>
                </div>
                <div className="bg-background rounded-lg p-2.5 border border-border text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span>Shift Opening Float:</span>
                    <span className="font-bold text-foreground">₹2,000.00</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Cash Collected Today:</span>
                    <span className="font-bold">+ ₹18,450.00</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-1 font-bold text-foreground">
                    <span>Expected in Drawer:</span>
                    <span className="text-primary">₹20,450.00</span>
                  </div>
                </div>
              </div>

              <ul className="mt-6 space-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Supports all 58mm and 80mm thermal receipt printers</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Auto drawer trigger kicks open upon cash payment</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Day-end Z-Report with full GST breakdown</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Interactive banner */}
          <div className="mt-12 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div>
              <h4 className="text-lg sm:text-xl font-bold text-foreground">
                Ready to experience modern kitchen and floor operations?
              </h4>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                Book a personalized demo and see live KDS routing and wireless captain ordering on your screen.
              </p>
            </div>
            <a href="#demo" className="shrink-0">
              <Button size="lg" className="h-11 px-6 font-semibold bg-primary text-primary-foreground gap-2">
                Schedule Live Operations Demo
                <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* 4. Plans & Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary mb-2">
              Transparent Pricing
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Affordable SaaS Plans Tailored to Indian Restaurants
            </h3>
            <p className="mt-3 text-muted-foreground text-sm sm:text-base">
              Compare our plans inspired by Petpooja, priced attractively without hidden setup fees.
            </p>

            {/* Toggle */}
            <div className="mt-8 flex items-center justify-center">
              <div className="inline-flex rounded-full border border-border bg-card p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => setBillingCycle("ANNUAL")}
                  className={`rounded-full px-5 py-2 text-xs sm:text-sm font-semibold transition-all ${
                    billingCycle === "ANNUAL"
                      ? "bg-primary text-primary-foreground shadow"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Annual Billing (Save 20%)
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle("MONTHLY")}
                  className={`rounded-full px-5 py-2 text-xs sm:text-sm font-semibold transition-all ${
                    billingCycle === "MONTHLY"
                      ? "bg-primary text-primary-foreground shadow"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Monthly Billing
                </button>
              </div>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {planKeys.map((key) => {
              const plan = SAAS_PLANS[key];
              const isPopular = plan.isPopular;
              const price = billingCycle === "ANNUAL" ? plan.annualPrice : plan.monthlyPrice;
              const priceSuffix = billingCycle === "ANNUAL" ? "/year" : "/month";

              return (
                <div
                  key={key}
                  className={`relative flex flex-col rounded-3xl border bg-card p-8 shadow-sm transition-all hover:shadow-xl ${
                    isPopular
                      ? "border-primary ring-2 ring-primary/20 scale-[1.02] shadow-lg"
                      : "border-border"
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground shadow">
                      MOST POPULAR
                    </div>
                  )}

                  <div className="mb-6">
                    <h4 className="text-xl font-bold text-foreground">{plan.name}</h4>
                    <p className="mt-1 text-xs text-muted-foreground">{plan.tagline}</p>
                    <div className="mt-5 flex items-baseline">
                      <span className="text-4xl font-extrabold tracking-tight">₹{price.toLocaleString()}</span>
                      <span className="ml-1 text-xs text-muted-foreground font-medium">{priceSuffix}</span>
                    </div>
                    {billingCycle === "ANNUAL" && (
                      <span className="mt-1 block text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        Billed annually (Best Value)
                      </span>
                    )}
                  </div>

                  <a
                    href="#demo"
                    onClick={() => setInterestedPlan(plan.id)}
                    className="w-full"
                  >
                    <Button
                      className={`w-full h-11 font-semibold ${
                        isPopular
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      Book a Live Demo
                    </Button>
                  </a>

                  <div className="mt-8 flex-1 border-t border-border pt-6">
                    <span className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
                      Included Capabilities:
                    </span>
                    <ul className="mt-4 space-y-3 text-xs text-muted-foreground">
                      {plan.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2.5">
                          <Check className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                          <span className="text-foreground">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Book Live Demo & Consultation Section (Form) */}
      <section id="demo" className="py-20 bg-muted/40 border-t border-border px-4 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl border border-border bg-card p-8 sm:p-12 shadow-xl">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-semibold text-primary mb-3">
                <PhoneCall className="h-3.5 w-3.5" />
                <span>Personalized Onboarding & Live Walkthrough</span>
              </div>
              <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Book a Live Demo & Free Consultation
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
                See OrderRestro in action on your screen. Our restaurant specialist will demonstrate
                offline billing, KDS routing, and thermal printer setup.
              </p>
            </div>

            {submitted ? (
              <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-8 text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h4 className="text-xl font-bold text-foreground">
                  Demo Request Received!
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                  Thank you, <strong>{contactName}</strong>! Our product specialist will call or WhatsApp
                  you at <span className="font-mono font-bold text-foreground">{phone}</span> shortly
                  to schedule your personalized live demo for <strong>{restaurantName}</strong>.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSubmitted(false);
                    setRestaurantName("");
                    setContactName("");
                    setPhone("");
                    setCity("");
                  }}
                  className="mt-2 text-xs"
                >
                  Submit Another Request
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmitLead} className="space-y-4 text-xs sm:text-sm max-w-xl mx-auto">
                {submitError && (
                  <div className="rounded-lg bg-destructive/10 p-3 text-destructive text-xs font-medium">
                    {submitError}
                  </div>
                )}

                <div>
                  <label className="block font-semibold mb-1 text-foreground">Restaurant Name</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Honest Pavbhaji & Fast Food"
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-4 py-3 text-xs sm:text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-1 text-foreground">Your Name</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Milan Patel"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background px-4 py-3 text-xs sm:text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-foreground">Phone / WhatsApp Number</label>
                    <input
                      required
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background px-4 py-3 text-xs sm:text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-1 text-foreground">City</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Ahmedabad, Surat, Rajkot, Vadodara"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background px-4 py-3 text-xs sm:text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-foreground">Interested Plan</label>
                    <select
                      value={interestedPlan}
                      onChange={(e) => setInterestedPlan(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background px-4 py-3 text-xs sm:text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="STARTER">Starter Plan (₹8,499/yr)</option>
                      <option value="GROWTH">Growth Plan (₹14,499/yr) [Popular]</option>
                      <option value="SCALE">Scale Plan (₹21,999/yr)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 text-sm font-bold bg-primary text-primary-foreground shadow-md hover:shadow-lg transition-all"
                  >
                    {isSubmitting ? "Submitting Demo Request..." : "Schedule My Free Live Demo →"}
                  </Button>
                </div>

                <p className="text-[11px] text-center text-muted-foreground mt-3">
                  🔒 No obligation or credit card required. We respect your privacy.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="border-t border-border bg-card/60 py-10 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2.5">
            <Logo size={24} />
            <span className="font-semibold text-foreground">OrderRestro POS</span>
            <span>— The Petpooja Alternative for Indian Restaurants</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-foreground transition-colors">
              Client Login
            </Link>
            <Link href="/pricing" className="hover:text-foreground transition-colors">
              Pricing Grid
            </Link>
            <Link href="/docs" className="hover:text-foreground transition-colors">
              Documentation
            </Link>
            <Link
              href="/super-admin"
              className="font-medium text-primary hover:underline flex items-center gap-1"
            >
              <Lock className="h-3 w-3" />
              Super Admin Portal
            </Link>
          </div>
        </div>
        <div className="mx-auto max-w-7xl text-center sm:text-left mt-4 text-[11px] text-muted-foreground">
          © 2026 OrderRestro POS SaaS Platform. Built with ❤️ in Gujarat, India.
        </div>
      </footer>
    </div>
  );
}
