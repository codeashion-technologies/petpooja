"use client";

import { Suspense, useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterDto, SAAS_PLANS, type PlanTier } from "@nodedr-restaurant/types";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Check, Sparkles, Zap, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { useRegister } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const register = useRegister();
  const prefersReducedMotion = useReducedMotion();

  const initialPlan = (searchParams.get("plan")?.toUpperCase() as PlanTier) || "GROWTH";
  const [selectedPlan, setSelectedPlan] = useState<PlanTier>(
    ["STARTER", "GROWTH", "SCALE"].includes(initialPlan) ? initialPlan : "GROWTH"
  );

  const {
    register: field,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterDto>({ resolver: zodResolver(registerSchema) });

  const onSubmit = (dto: RegisterDto) => {
    register.mutate(dto, {
      onSuccess: () => {
        toast.success(`Welcome to OrderRestro! Activated on ${SAAS_PLANS[selectedPlan].name}`);
        router.push("/dashboard");
      },
      onError: (err) => {
        toast.error(err instanceof ApiError ? err.message : "Something went wrong");
      },
    });
  };

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-md"
    >
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        <Link href="/">
          <Logo size={44} />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          OrderRestro Restaurant Onboarding
        </h1>
        <p className="text-xs text-muted-foreground">
          Start your 14-day zero-risk trial or activate your POS license
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {/* Plan Selector */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold">Select Subscription Tier</Label>
            <Link
              href="/pricing"
              className="text-[11px] text-primary hover:underline font-medium inline-flex items-center gap-1"
            >
              Compare plans
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(["STARTER", "GROWTH", "SCALE"] as PlanTier[]).map((pKey) => {
              const p = SAAS_PLANS[pKey];
              const isSelected = selectedPlan === pKey;
              return (
                <button
                  type="button"
                  key={pKey}
                  onClick={() => setSelectedPlan(pKey)}
                  className={`relative flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 text-foreground ring-2 ring-primary/30"
                      : "border-border/70 bg-card hover:border-border text-muted-foreground"
                  }`}
                >
                  {pKey === "GROWTH" && (
                    <span className="absolute -top-2 rounded-full bg-primary px-1.5 py-0.2 text-[9px] font-bold text-primary-foreground">
                      Popular
                    </span>
                  )}
                  <span className="text-xs font-bold">{p.name.split(" ")[0]}</span>
                  <span className="text-[11px] font-extrabold text-foreground mt-0.5">
                    ₹{p.annualPrice.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[9px] text-muted-foreground">/yr</span>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-primary shrink-0" />
            <span>
              Includes <strong>14-Day Free Access</strong> to all features. No card required upfront.
            </span>
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="restaurantName">Restaurant Name</Label>
          <Input
            id="restaurantName"
            autoComplete="organization"
            placeholder="e.g. Honest Restaurant"
            {...field("restaurantName")}
          />
          {errors.restaurantName && (
            <p className="text-xs text-destructive">{errors.restaurantName.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="branchName">First Branch Name</Label>
          <Input
            id="branchName"
            placeholder="Main Branch"
            defaultValue="Main Branch"
            {...field("branchName")}
          />
          {errors.branchName && (
            <p className="text-xs text-destructive">{errors.branchName.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="ownerName">Owner / Manager Name</Label>
          <Input
            id="ownerName"
            autoComplete="name"
            placeholder="e.g. Milan M."
            {...field("ownerName")}
          />
          {errors.ownerName && (
            <p className="text-xs text-destructive">{errors.ownerName.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Login Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="owner@restaurant.com"
            {...field("email")}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Login Password</Label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            {...field("password")}
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <Button type="submit" className="mt-2 h-11 text-sm font-semibold" disabled={register.isPending}>
          {register.isPending ? "Setting up POS…" : `Activate ${SAAS_PLANS[selectedPlan].name} License`}
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-foreground hover:underline">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}

export default function SignupPage() {
  return (
    <main className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden bg-background px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(50%_50%_at_50%_0%,color-mix(in_oklch,var(--primary),transparent_90%),transparent)]"
      />
      <Suspense fallback={<div className="text-xs text-muted-foreground">Loading onboarding...</div>}>
        <SignupForm />
      </Suspense>
    </main>
  );
}
