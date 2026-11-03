"use client";

import { useState } from "react";
import Link from "next/link";
import { SAAS_PLANS, type PlanTier } from "@nodedr-restaurant/types";
import {
  Check,
  X,
  Sparkles,
  ShieldCheck,
  Zap,
  Building2,
  Store,
  ArrowRight,
  PhoneCall,
  Clock,
  Printer,
  HelpCircle,
} from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"ANNUAL" | "MONTHLY">("ANNUAL");
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [selectedPlanForDemo, setSelectedPlanForDemo] = useState<string>("Growth (Pro)");
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const [demoSubmitting, setDemoSubmitting] = useState(false);

  // Form fields
  const [restName, setRestName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");

  const planKeys: PlanTier[] = ["STARTER", "GROWTH", "SCALE"];

  const handleBookDemo = (planName: string) => {
    setSelectedPlanForDemo(planName);
    setDemoModalOpen(true);
    setDemoSubmitted(false);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDemoSubmitting(true);
    try {
      await fetch("/api/v1/leads/demo-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantName: restName,
          contactName,
          phone,
          city,
          interestedPlan: selectedPlanForDemo,
        }),
      });
      setDemoSubmitted(true);
    } catch (err) {
      console.error(err);
      setDemoSubmitted(true);
    } finally {
      setDemoSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <Logo size={36} />
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-foreground text-lg leading-none">
                OrderRestro
              </span>
              <span className="text-[10px] text-muted-foreground font-mono mt-0.5">
                Restaurant POS & SaaS
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            <LanguageSwitcher />
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-primary text-primary-foreground font-medium">
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-14 sm:py-20 text-center px-4">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[380px] bg-[radial-gradient(50%_50%_at_50%_0%,color-mix(in_oklch,var(--primary),transparent_85%),transparent)]"
        />
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-5">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Transparent, Honest Restaurant Pricing</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-3xl mx-auto leading-tight">
          Enterprise POS Power.
          <span className="text-primary block mt-1">At a fraction of the cost.</span>
        </h1>
        <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
          Local-first offline billing, automated Supabase cloud sync, live cash drawer
          reconciliation, and multi-printer KOTs. No expensive hardware lock-ins.
        </p>

        {/* Billing Cycle Toggle */}
        <div className="mt-8 flex items-center justify-center">
          <div className="inline-flex rounded-full border border-border bg-card p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setBillingCycle("ANNUAL")}
              className={`rounded-full px-5 py-2 text-xs sm:text-sm font-medium transition-all ${
                billingCycle === "ANNUAL"
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Annual Billing
              <span className="ml-1.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-bold">
                Save ~20%
              </span>
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("MONTHLY")}
              className={`rounded-full px-5 py-2 text-xs sm:text-sm font-medium transition-all ${
                billingCycle === "MONTHLY"
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly Billing
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {planKeys.map((key) => {
            const plan = SAAS_PLANS[key];
            const isPopular = plan.isPopular;
            const price = billingCycle === "ANNUAL" ? plan.annualPrice : plan.monthlyPrice;
            const periodLabel = billingCycle === "ANNUAL" ? "/year" : "/month";

            return (
              <div
                key={key}
                className={`relative flex flex-col rounded-2xl border p-6 sm:p-8 transition-all ${
                  isPopular
                    ? "border-primary bg-card shadow-xl ring-2 ring-primary/20 scale-[1.02] md:-translate-y-2"
                    : "border-border bg-card/60 hover:border-border/80"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-foreground shadow">
                    {plan.badge}
                  </div>
                )}

                <div className="mb-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-foreground">{plan.name}</h2>
                    {key === "STARTER" && <Store className="h-5 w-5 text-muted-foreground" />}
                    {key === "GROWTH" && <Zap className="h-5 w-5 text-amber-500" />}
                    {key === "SCALE" && <Building2 className="h-5 w-5 text-primary" />}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground min-h-[36px]">{plan.tagline}</p>
                </div>

                {/* Price Display */}
                <div className="mb-6 flex items-baseline gap-1.5 border-b border-border/60 pb-6">
                  <span className="text-3xl sm:text-4xl font-extrabold text-foreground">
                    ₹{price.toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">{periodLabel}</span>
                  {billingCycle === "ANNUAL" && (
                    <span className="ml-auto text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      ₹{Math.round(plan.annualPrice / 12)}/mo
                    </span>
                  )}
                </div>

                {/* Features List */}
                <ul className="mb-8 flex-1 space-y-3 text-xs sm:text-sm">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <div className="mt-0.5 rounded-full bg-emerald-500/10 p-0.5 text-emerald-500">
                        <Check className="h-3.5 w-3.5 shrink-0" />
                      </div>
                      <span className="text-muted-foreground leading-snug">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Buttons */}
                <div className="space-y-2 mt-auto">
                  <Link href={`/signup?plan=${key}`} className="block w-full">
                    <Button
                      className={`w-full h-11 text-sm font-semibold ${
                        isPopular
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      Get Started with {plan.name}
                      <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs text-muted-foreground"
                    onClick={() => handleBookDemo(plan.name)}
                  >
                    <PhoneCall className="mr-1.5 h-3.5 w-3.5" />
                    Book Live Demo & Consultation
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Detailed Operations Manager Comparison Grid (Petpooja-style) */}
      <section className="container mx-auto max-w-6xl px-4 sm:px-6 py-12 border-t border-border/60">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Detailed Operations Comparison
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Compare features across Starter, Growth, and Scale plans side-by-side
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
                <th className="p-4 sm:px-6 w-1/2">Module & Capability</th>
                <th className="p-4 text-center">Starter (₹8,499)</th>
                <th className="p-4 text-center text-primary font-bold">Growth (₹14,499)</th>
                <th className="p-4 text-center">Scale (₹21,999)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              <tr className="bg-muted/10 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                <td colSpan={4} className="p-3 px-6">
                  Core POS & Cloud Sync
                </td>
              </tr>
              <tr>
                <td className="p-3 px-6 text-foreground font-medium">100% Offline Local Billing</td>
                <td className="p-3 text-center text-emerald-500 font-bold">✓ Included</td>
                <td className="p-3 text-center text-emerald-500 font-bold">✓ Included</td>
                <td className="p-3 text-center text-emerald-500 font-bold">✓ Included</td>
              </tr>
              <tr>
                <td className="p-3 px-6 text-foreground font-medium">Supabase Cloud Sync (30s - 5m)</td>
                <td className="p-3 text-center text-emerald-500 font-bold">✓ Included</td>
                <td className="p-3 text-center text-emerald-500 font-bold">✓ Included</td>
                <td className="p-3 text-center text-emerald-500 font-bold">✓ Included</td>
              </tr>
              <tr>
                <td className="p-3 px-6 text-foreground font-medium">Cash Drawer & Shift Float</td>
                <td className="p-3 text-center text-emerald-500 font-bold">✓ Included</td>
                <td className="p-3 text-center text-emerald-500 font-bold">✓ Included</td>
                <td className="p-3 text-center text-emerald-500 font-bold">✓ Included</td>
              </tr>
              <tr>
                <td className="p-3 px-6 text-foreground font-medium">Table & KOT Printing</td>
                <td className="p-3 text-center text-emerald-500 font-bold">✓ Included</td>
                <td className="p-3 text-center text-emerald-500 font-bold">✓ Included</td>
                <td className="p-3 text-center text-emerald-500 font-bold">✓ Included</td>
              </tr>

              <tr className="bg-muted/10 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                <td colSpan={4} className="p-3 px-6">
                  Kitchen & Dine-In Operations
                </td>
              </tr>
              <tr>
                <td className="p-3 px-6 text-foreground font-medium">Kitchen Display System (KDS)</td>
                <td className="p-3 text-center text-muted-foreground">—</td>
                <td className="p-3 text-center text-emerald-500 font-bold">✓ Included</td>
                <td className="p-3 text-center text-emerald-500 font-bold">✓ Multi-Station</td>
              </tr>
              <tr>
                <td className="p-3 px-6 text-foreground font-medium">QR Table Ordering & Digital Menu</td>
                <td className="p-3 text-center text-muted-foreground">—</td>
                <td className="p-3 text-center text-emerald-500 font-bold">✓ Included</td>
                <td className="p-3 text-center text-emerald-500 font-bold">✓ Included</td>
              </tr>
              <tr>
                <td className="p-3 px-6 text-foreground font-medium">Table Reservation & Waitlist</td>
                <td className="p-3 text-center text-muted-foreground">—</td>
                <td className="p-3 text-center text-muted-foreground">—</td>
                <td className="p-3 text-center text-emerald-500 font-bold">✓ Full Suite</td>
              </tr>
              <tr>
                <td className="p-3 px-6 text-foreground font-medium">Self-Ordering Kiosk Mode</td>
                <td className="p-3 text-center text-muted-foreground">—</td>
                <td className="p-3 text-center text-muted-foreground">—</td>
                <td className="p-3 text-center text-emerald-500 font-bold">✓ Included</td>
              </tr>

              <tr className="bg-muted/10 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                <td colSpan={4} className="p-3 px-6">
                  Inventory & Multibranch
                </td>
              </tr>
              <tr>
                <td className="p-3 px-6 text-foreground font-medium">Recipe Raw Material Deduction</td>
                <td className="p-3 text-center text-muted-foreground">—</td>
                <td className="p-3 text-center text-emerald-500 font-bold">✓ Included</td>
                <td className="p-3 text-center text-emerald-500 font-bold">✓ Included</td>
              </tr>
              <tr>
                <td className="p-3 px-6 text-foreground font-medium">Zomato / Swiggy Reconciliation</td>
                <td className="p-3 text-center text-muted-foreground">—</td>
                <td className="p-3 text-center text-emerald-500 font-bold">✓ Included</td>
                <td className="p-3 text-center text-emerald-500 font-bold">✓ Included</td>
              </tr>
              <tr>
                <td className="p-3 px-6 text-foreground font-medium">Multi-Branch Central Management</td>
                <td className="p-3 text-center text-muted-foreground">Single Branch</td>
                <td className="p-3 text-center text-muted-foreground">Single Branch</td>
                <td className="p-3 text-center text-emerald-500 font-bold">✓ Unlimited Outlets</td>
              </tr>
              <tr>
                <td className="p-3 px-6 text-foreground font-medium">Customer Loyalty & Gift Cards</td>
                <td className="p-3 text-center text-muted-foreground">—</td>
                <td className="p-3 text-center text-muted-foreground">—</td>
                <td className="p-3 text-center text-emerald-500 font-bold">✓ Included</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Trust & Guarantee Section */}
      <section className="container mx-auto max-w-5xl px-4 sm:px-6 py-12 text-center">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex flex-col items-center p-4">
            <div className="rounded-full bg-primary/10 p-3 text-primary mb-3">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-base">Zero Hardware Lock-In</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Works with standard Windows PCs, any USB/LAN 80mm thermal printers, and cash drawers.
            </p>
          </div>
          <div className="flex flex-col items-center p-4">
            <div className="rounded-full bg-primary/10 p-3 text-primary mb-3">
              <Clock className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-base">100% Offline Continuous Billing</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Internet down? Billing never stops. Everything auto-syncs when reconnecting.
            </p>
          </div>
          <div className="flex flex-col items-center p-4">
            <div className="rounded-full bg-primary/10 p-3 text-primary mb-3">
              <Printer className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-base">Direct Thermal Printing</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Instant sub-second KOT printing directly from local hardware without cloud delays.
            </p>
          </div>
        </div>
      </section>

      {/* Demo Booking Modal */}
      {demoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Book a Live Demo</h3>
              <button
                type="button"
                onClick={() => setDemoModalOpen(false)}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {demoSubmitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                  <Check className="h-6 w-6" />
                </div>
                <h4 className="font-semibold text-base">Request Received!</h4>
                <p className="text-xs text-muted-foreground">
                  Our restaurant onboarding team will reach out within 2 business hours for your {selectedPlanForDemo} demo.
                </p>
                <Button className="mt-4" onClick={() => setDemoModalOpen(false)}>
                  Done
                </Button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4 text-xs sm:text-sm">
                <p className="text-xs text-muted-foreground">
                  Interested in: <strong className="text-foreground">{selectedPlanForDemo}</strong>
                </p>
                <div>
                  <label className="block font-medium mb-1">Restaurant Name</label>
                  <input
                    required
                    type="text"
                    value={restName}
                    onChange={(e) => setRestName(e.target.value)}
                    placeholder="e.g. Honest Pavbhaji"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Your Name</label>
                  <input
                    required
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Milan"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Phone / WhatsApp Number</label>
                  <input
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">City</label>
                  <input
                    required
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Ahmedabad, Surat, Rajkot"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                  />
                </div>
                <div className="pt-2 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setDemoModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={demoSubmitting}
                    className="flex-1 bg-primary text-primary-foreground"
                  >
                    {demoSubmitting ? "Submitting..." : "Request Demo"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        <p>© 2026 OrderRestro POS. Made with ❤️ for Indian Restaurants.</p>
        <div className="mt-2 flex justify-center gap-4">
          <Link href="/login" className="hover:underline">
            Login
          </Link>
          <Link href="/signup" className="hover:underline">
            Register
          </Link>
          <Link href="/docs" className="hover:underline">
            Documentation
          </Link>
        </div>
      </footer>
    </div>
  );
}

