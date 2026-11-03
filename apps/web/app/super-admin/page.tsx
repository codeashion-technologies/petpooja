"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Building2,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar,
  Lock,
  Unlock,
  Key,
  RefreshCw,
  Search,
  Plus,
  Copy,
  MessageCircle,
  Check,
  Store,
  Clock,
  ShieldAlert,
  LogOut,
  ChevronRight,
  Send,
  PhoneCall,
  Sparkles,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface OverviewStats {
  totalRestaurants: number;
  activeRestaurants: number;
  expiredRestaurants: number;
  suspendedRestaurants: number;
  totalLeads: number;
  newLeads: number;
}

interface DemoLead {
  id: string;
  restaurantName: string;
  contactName: string;
  phone: string;
  city: string | null;
  interestedPlan: string;
  status: "NEW" | "CONTACTED" | "DEMO_GIVEN" | "CONVERTED" | "REJECTED";
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface RestaurantItem {
  id: string;
  name: string;
  currency: string;
  subscriptionPlan: string;
  subscriptionStatus: "ACTIVE" | "SUSPENDED";
  subscriptionExpiresAt: string | null;
  createdAt: string;
  branchesCount: number;
  usersCount: number;
  ownerEmail: string;
  ownerName: string;
}

const SUPER_ADMIN_STORAGE_KEY = "orderrestro_super_admin_pin";

export default function SuperAdminPage() {
  const [authorized, setAuthorized] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"leads" | "restaurants">("leads");

  // Overview stats & records
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [leads, setLeads] = useState<DemoLead[]>([]);
  const [restaurants, setRestaurants] = useState<RestaurantItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Search & filters
  const [leadSearch, setLeadSearch] = useState<string>("");
  const [leadStatusFilter, setLeadStatusFilter] = useState<string>("ALL");
  const [restaurantSearch, setRestaurantSearch] = useState<string>("");

  // Modals state
  const [showAddRestaurantModal, setShowAddRestaurantModal] = useState<boolean>(false);
  const [showRenewModal, setShowRenewModal] = useState<RestaurantItem | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState<RestaurantItem | null>(null);
  const [copiedInfo, setCopiedInfo] = useState<string | null>(null);

  // Onboard restaurant form
  const [newRestName, setNewRestName] = useState<string>("");
  const [newBranchName, setNewBranchName] = useState<string>("Main Branch");
  const [newOwnerName, setNewOwnerName] = useState<string>("");
  const [newOwnerEmail, setNewOwnerEmail] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("Password123!");
  const [newPlan, setNewPlan] = useState<string>("GROWTH");
  const [newValidityDays, setNewValidityDays] = useState<number>(365);
  const [onboardSuccess, setOnboardSuccess] = useState<any | null>(null);
  const [onboardError, setOnboardError] = useState<string | null>(null);
  const [submittingOnboard, setSubmittingOnboard] = useState<boolean>(false);

  // Renew form
  const [renewDays, setRenewDays] = useState<number>(365);
  const [renewPlan, setRenewPlan] = useState<string>("GROWTH");
  const [renewing, setRenewing] = useState<boolean>(false);

  // Password reset form
  const [resetPwd, setResetPwd] = useState<string>("Password123!");
  const [resettingPwd, setResettingPwd] = useState<boolean>(false);
  const [resetSuccess, setResetSuccess] = useState<boolean>(false);

  // Verify PIN helper
  const getAuthHeader = () => {
    return {
      Authorization: `Bearer super-admin-authorized`,
    };
  };

  const verifyPin = async (pin: string) => {
    try {
      setAuthError(null);
      const res = await fetch("/api/v1/super-admin/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      if (!res.ok) {
        throw new Error("Invalid Master PIN");
      }
      sessionStorage.setItem(SUPER_ADMIN_STORAGE_KEY, pin);
      setAuthorized(true);
      fetchDashboardData();
    } catch (err: any) {
      setAuthError(err.message || "Failed to verify Master PIN");
      setAuthorized(false);
    }
  };

  const fetchDashboardData = async () => {
    setIsRefreshing(true);
    try {
      const headers = getAuthHeader();
      const [overviewRes, leadsRes, restaurantsRes] = await Promise.all([
        fetch("/api/v1/super-admin/overview", { headers }),
        fetch("/api/v1/super-admin/leads", { headers }),
        fetch("/api/v1/super-admin/restaurants", { headers }),
      ]);

      if (overviewRes.ok) {
        const data = await overviewRes.json();
        setStats(data);
      }
      if (leadsRes.ok) {
        const data = await leadsRes.json();
        setLeads(data);
      }
      if (restaurantsRes.ok) {
        const data = await restaurantsRes.json();
        setRestaurants(data);
      }
    } catch (err) {
      console.error("Error fetching super admin data:", err);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  // Check existing session on mount
  useEffect(() => {
    const savedPin = sessionStorage.getItem(SUPER_ADMIN_STORAGE_KEY);
    if (savedPin) {
      verifyPin(savedPin);
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem(SUPER_ADMIN_STORAGE_KEY);
    setAuthorized(false);
    setPinInput("");
  };

  // Lead status update
  const handleUpdateLeadStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/v1/super-admin/leads/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) => (l.id === id ? { ...l, status: status as any } : l))
        );
      }
    } catch (err) {
      console.error("Failed to update lead status:", err);
    }
  };

  // Lead notes update
  const handleUpdateLeadNotes = async (id: string, notes: string) => {
    try {
      await fetch(`/api/v1/super-admin/leads/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({ notes }),
      });
    } catch (err) {
      console.error("Failed to update lead notes:", err);
    }
  };

  // Pre-fill onboarding from lead
  const handleConvertLeadToRestaurant = (lead: DemoLead) => {
    setNewRestName(lead.restaurantName);
    setNewBranchName("Main Branch");
    setNewOwnerName(lead.contactName);
    setNewOwnerEmail(`${lead.restaurantName.toLowerCase().replace(/[^a-z0-9]/g, "")}@example.com`);
    setNewPassword("Password123!");
    setNewPlan(lead.interestedPlan || "GROWTH");
    setNewValidityDays(365);
    setOnboardSuccess(null);
    setOnboardError(null);
    setShowAddRestaurantModal(true);
  };

  // Submit new restaurant
  const handleOnboardRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingOnboard(true);
    setOnboardError(null);
    try {
      const res = await fetch("/api/v1/super-admin/restaurants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          name: newRestName,
          branchName: newBranchName,
          ownerName: newOwnerName,
          email: newOwnerEmail,
          password: newPassword,
          plan: newPlan,
          validityDays: Number(newValidityDays),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to onboard restaurant");
      }

      setOnboardSuccess({
        ...data,
        password: newPassword,
      });
      fetchDashboardData();
    } catch (err: any) {
      setOnboardError(err.message || "An error occurred during onboarding");
    } finally {
      setSubmittingOnboard(false);
    }
  };

  // Toggle restaurant active/suspended kill-switch
  const handleToggleRestaurantStatus = async (restaurant: RestaurantItem) => {
    const nextStatus = restaurant.subscriptionStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      const res = await fetch(`/api/v1/super-admin/restaurants/${restaurant.id}/license`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setRestaurants((prev) =>
          prev.map((r) =>
            r.id === restaurant.id ? { ...r, subscriptionStatus: nextStatus } : r
          )
        );
        if (stats) {
          setStats({
            ...stats,
            activeRestaurants:
              nextStatus === "ACTIVE"
                ? stats.activeRestaurants + 1
                : Math.max(0, stats.activeRestaurants - 1),
            suspendedRestaurants:
              nextStatus === "SUSPENDED"
                ? stats.suspendedRestaurants + 1
                : Math.max(0, stats.suspendedRestaurants - 1),
          });
        }
      }
    } catch (err) {
      console.error("Failed to toggle license:", err);
    }
  };

  // Renew License Submit
  const handleRenewLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRenewModal) return;
    setRenewing(true);
    try {
      const res = await fetch(`/api/v1/super-admin/restaurants/${showRenewModal.id}/license`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          plan: renewPlan,
          extendDays: Number(renewDays),
          status: "ACTIVE",
        }),
      });
      if (res.ok) {
        setShowRenewModal(null);
        fetchDashboardData();
      }
    } catch (err) {
      console.error("Failed to renew license:", err);
    } finally {
      setRenewing(false);
    }
  };

  // Reset Password Submit
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPasswordModal) return;
    setResettingPwd(true);
    setResetSuccess(false);
    try {
      const res = await fetch(
        `/api/v1/super-admin/restaurants/${showPasswordModal.id}/password`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(),
          },
          body: JSON.stringify({ newPassword: resetPwd }),
        }
      );
      if (res.ok) {
        setResetSuccess(true);
        setTimeout(() => {
          setShowPasswordModal(null);
          setResetSuccess(false);
        }, 1500);
      }
    } catch (err) {
      console.error("Failed to reset password:", err);
    } finally {
      setResettingPwd(false);
    }
  };

  // Copy helper
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedInfo(label);
    setTimeout(() => setCopiedInfo(null), 2000);
  };

  // Filtered lists
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const matchesSearch =
        l.restaurantName.toLowerCase().includes(leadSearch.toLowerCase()) ||
        l.contactName.toLowerCase().includes(leadSearch.toLowerCase()) ||
        l.phone.includes(leadSearch) ||
        (l.city && l.city.toLowerCase().includes(leadSearch.toLowerCase()));
      const matchesStatus = leadStatusFilter === "ALL" || l.status === leadStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [leads, leadSearch, leadStatusFilter]);

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((r) => {
      return (
        r.name.toLowerCase().includes(restaurantSearch.toLowerCase()) ||
        r.ownerEmail.toLowerCase().includes(restaurantSearch.toLowerCase()) ||
        r.ownerName.toLowerCase().includes(restaurantSearch.toLowerCase())
      );
    });
  }, [restaurants, restaurantSearch]);

  const formatDaysLeft = (dateStr: string | null) => {
    if (!dateStr) return { text: "Lifetime Access", isExpired: false, badgeVariant: "default" as const };
    const diffMs = new Date(dateStr).getTime() - Date.now();
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (days < 0) {
      return { text: `Expired ${Math.abs(days)}d ago`, isExpired: true, badgeVariant: "destructive" as const };
    }
    if (days <= 14) {
      return { text: `${days} days left (Expiring soon)`, isExpired: false, badgeVariant: "outline" as const };
    }
    return { text: `${days} days left`, isExpired: false, badgeVariant: "secondary" as const };
  };

  // 1. PIN Gate Screen
  if (!authorized) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-xl text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
            <Lock className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Super Admin Portal</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            OrderRestro Platform Owner & License Management
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              verifyPin(pinInput);
            }}
            className="mt-6 space-y-4 text-left"
          >
            <div>
              <Label htmlFor="super-pin" className="text-xs">
                Enter Master Security PIN
              </Label>
              <Input
                id="super-pin"
                type="password"
                placeholder="Default: admin123"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                autoFocus
                className="mt-1 h-11 text-center font-mono tracking-widest text-lg"
              />
            </div>

            {authError && (
              <div className="rounded-lg bg-destructive/10 p-2.5 text-xs text-destructive text-center">
                {authError}
              </div>
            )}

            <Button type="submit" className="w-full h-11 font-medium bg-primary text-primary-foreground">
              Unlock Super Admin
            </Button>
          </form>

          <div className="mt-6 border-t border-border pt-4 text-[11px] text-muted-foreground">
            <Link href="/" className="hover:underline text-primary">
              ← Return to Main Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Super Admin Dashboard Screen
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur px-4 sm:px-6">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Logo size={32} />
              <div className="flex flex-col">
                <span className="font-bold tracking-tight text-foreground text-sm sm:text-base leading-none">
                  OrderRestro
                </span>
                <span className="text-[10px] text-primary font-semibold tracking-wider uppercase mt-0.5">
                  Super Admin Console
                </span>
              </div>
            </Link>
            <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Owner Mode: Milan
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDashboardData}
              disabled={isRefreshing}
              className="h-8 gap-1 text-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>

            <Link href="/login" target="_blank">
              <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">POS Login</span>
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="h-8 gap-1 text-xs text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Lock</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* KPI Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Total Restaurants</span>
              <Store className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">
              {stats?.totalRestaurants ?? 0}
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              Across all cities & outlets
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Active Licenses</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
              {stats?.activeRestaurants ?? 0}
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              Paid & valid subscriptions
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Expired / Suspended</span>
              <ShieldAlert className="h-4 w-4 text-rose-500" />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-rose-600 dark:text-rose-400">
              {(stats?.expiredRestaurants ?? 0) + (stats?.suspendedRestaurants ?? 0)}
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              Access blocked by gatekeeper
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Demo Leads</span>
              <MessageCircle className="h-4 w-4 text-blue-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {stats?.totalLeads ?? 0}
              </span>
              {(stats?.newLeads ?? 0) > 0 && (
                <span className="rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-2 py-0.5 text-[10px] font-semibold">
                  {stats?.newLeads} NEW
                </span>
              )}
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              Inbound demo & pricing requests
            </div>
          </div>
        </div>

        {/* Tab Controls & Primary Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("leads")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "leads"
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <MessageCircle className="h-4 w-4" />
              <span>Demo Requests & Leads</span>
              {stats?.newLeads ? (
                <span className="rounded-full bg-background text-primary px-1.5 py-0.2 text-[10px] font-bold">
                  {stats.newLeads}
                </span>
              ) : null}
            </button>

            <button
              onClick={() => setActiveTab("restaurants")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "restaurants"
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Store className="h-4 w-4" />
              <span>Restaurant Licenses ({restaurants.length})</span>
            </button>
          </div>

          <div>
            <Button
              onClick={() => {
                setNewRestName("");
                setNewBranchName("Main Branch");
                setNewOwnerName("");
                setNewOwnerEmail("");
                setNewPassword("Password123!");
                setNewPlan("GROWTH");
                setNewValidityDays(365);
                setOnboardSuccess(null);
                setOnboardError(null);
                setShowAddRestaurantModal(true);
              }}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>+ Onboard New Restaurant</span>
            </Button>
          </div>
        </div>

        {/* TAB 1: DEMO REQUESTS & INBOUND LEADS */}
        {activeTab === "leads" && (
          <div className="space-y-4">
            {/* Filter bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search lead by name, phone, city..."
                  value={leadSearch}
                  onChange={(e) => setLeadSearch(e.target.value)}
                  className="pl-9 text-xs h-9"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                {["ALL", "NEW", "CONTACTED", "DEMO_GIVEN", "CONVERTED", "REJECTED"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setLeadStatusFilter(st)}
                    className={`px-3 py-1 text-xs rounded-full border transition-all whitespace-nowrap ${
                      leadStatusFilter === st
                        ? "border-primary bg-primary text-primary-foreground font-medium"
                        : "border-border bg-card text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Leads Table / Cards */}
            {filteredLeads.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
                <MessageCircle className="mx-auto h-8 w-8 opacity-40 mb-2" />
                <p className="text-sm font-medium">No demo requests found.</p>
                <p className="text-xs text-muted-foreground mt-1">
                  When visitors submit the "Book Live Demo" form on the landing page, they appear here.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Restaurant & Contact</th>
                        <th className="px-4 py-3 font-semibold">City</th>
                        <th className="px-4 py-3 font-semibold">Interested Plan</th>
                        <th className="px-4 py-3 font-semibold">Phone / WhatsApp</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-4 py-3 font-semibold">Notes / History</th>
                        <th className="px-4 py-3 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredLeads.map((lead) => {
                        const cleanPhone = lead.phone.replace(/\D/g, "");
                        const waLink = `https://wa.me/${cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone}?text=Hello%20${encodeURIComponent(
                          lead.contactName
                        )},%20thank%20you%20for%20requesting%20a%20demo%20of%20OrderRestro%20POS%20for%20${encodeURIComponent(
                          lead.restaurantName
                        )}!`;

                        return (
                          <tr key={lead.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3">
                              <div className="font-semibold text-foreground text-sm">
                                {lead.restaurantName}
                              </div>
                              <div className="text-muted-foreground">{lead.contactName}</div>
                              <div className="text-[10px] text-muted-foreground mt-0.5">
                                {new Date(lead.createdAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-medium text-foreground">
                                {lead.city || "—"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex rounded border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                                {lead.interestedPlan}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className="font-mono">{lead.phone}</span>
                                <a
                                  href={waLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 rounded bg-emerald-600 px-2 py-1 text-[10px] font-medium text-white hover:bg-emerald-700"
                                >
                                  <MessageCircle className="h-3 w-3" />
                                  WhatsApp
                                </a>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={lead.status}
                                onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value)}
                                className={`rounded border px-2 py-1 text-xs font-semibold ${
                                  lead.status === "NEW"
                                    ? "bg-blue-500/10 text-blue-600 border-blue-500/30"
                                    : lead.status === "CONVERTED"
                                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                                    : lead.status === "DEMO_GIVEN"
                                    ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                                    : "bg-muted text-muted-foreground border-border"
                                }`}
                              >
                                <option value="NEW">NEW</option>
                                <option value="CONTACTED">CONTACTED</option>
                                <option value="DEMO_GIVEN">DEMO GIVEN</option>
                                <option value="CONVERTED">CONVERTED</option>
                                <option value="REJECTED">REJECTED</option>
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              <input
                                defaultValue={lead.notes || ""}
                                onBlur={(e) => handleUpdateLeadNotes(lead.id, e.target.value)}
                                placeholder="Add follow-up note..."
                                className="w-40 rounded border border-border bg-background px-2 py-1 text-xs text-foreground focus:w-60 transition-all"
                              />
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleConvertLeadToRestaurant(lead)}
                                className="h-7 text-xs gap-1 border-primary/30 text-primary hover:bg-primary/10"
                              >
                                <Plus className="h-3 w-3" />
                                Onboard
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: RESTAURANT LICENSES & CLIENTS */}
        {activeTab === "restaurants" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search restaurant, owner email, name..."
                  value={restaurantSearch}
                  onChange={(e) => setRestaurantSearch(e.target.value)}
                  className="pl-9 text-xs h-9"
                />
              </div>

              <div className="text-xs text-muted-foreground">
                Showing {filteredRestaurants.length} registered restaurant licenses
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Restaurant Details</th>
                      <th className="px-4 py-3 font-semibold">Owner Login (Email)</th>
                      <th className="px-4 py-3 font-semibold">Plan</th>
                      <th className="px-4 py-3 font-semibold">Status (Kill-Switch)</th>
                      <th className="px-4 py-3 font-semibold">License Validity</th>
                      <th className="px-4 py-3 font-semibold text-right">License Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredRestaurants.map((restaurant) => {
                      const validity = formatDaysLeft(restaurant.subscriptionExpiresAt);
                      const isSuspended = restaurant.subscriptionStatus === "SUSPENDED";

                      return (
                        <tr key={restaurant.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-foreground text-sm">
                              {restaurant.name}
                            </div>
                            <div className="text-muted-foreground text-[11px]">
                              {restaurant.branchesCount} Branch · {restaurant.usersCount} Staff Users
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-mono text-foreground font-medium">
                              {restaurant.ownerEmail}
                            </div>
                            <div className="text-muted-foreground text-[11px]">
                              {restaurant.ownerName}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                              {restaurant.subscriptionPlan}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleToggleRestaurantStatus(restaurant)}
                              title="Click to toggle License Status"
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-all ${
                                isSuspended
                                  ? "bg-rose-500/10 text-rose-600 border border-rose-500/30 hover:bg-rose-500/20"
                                  : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 hover:bg-emerald-500/20"
                              }`}
                            >
                              {isSuspended ? (
                                <>
                                  <Lock className="h-3 w-3" />
                                  SUSPENDED
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-3 w-3" />
                                  ACTIVE
                                </>
                              )}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-foreground">
                              {restaurant.subscriptionExpiresAt
                                ? new Date(restaurant.subscriptionExpiresAt).toLocaleDateString(
                                    "en-IN",
                                    { day: "numeric", month: "short", year: "numeric" }
                                  )
                                : "Lifetime"}
                            </div>
                            <div
                              className={`text-[10px] font-medium mt-0.5 ${
                                validity.isExpired
                                  ? "text-rose-600 dark:text-rose-400 font-semibold"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {validity.text}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Renew License */}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setShowRenewModal(restaurant);
                                  setRenewPlan(restaurant.subscriptionPlan);
                                  setRenewDays(365);
                                }}
                                className="h-7 text-xs gap-1"
                              >
                                <Calendar className="h-3 w-3" />
                                Renew
                              </Button>

                              {/* Reset Password */}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setShowPasswordModal(restaurant);
                                  setResetPwd("Password123!");
                                }}
                                className="h-7 text-xs gap-1"
                              >
                                <Key className="h-3 w-3" />
                                Reset Pwd
                              </Button>

                              {/* Copy Credentials */}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  const text = `🍽️ OrderRestro POS Login Credentials:\nRestaurant: ${restaurant.name}\nEmail: ${restaurant.ownerEmail}\nLogin URL: http://localhost:1995/login`;
                                  copyToClipboard(text, restaurant.id);
                                }}
                                className="h-7 w-7 p-0"
                                title="Copy Client Credentials"
                              >
                                {copiedInfo === restaurant.id ? (
                                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: ONBOARD NEW RESTAURANT */}
      {showAddRestaurantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">Onboard New Restaurant</h3>
                <p className="text-xs text-muted-foreground">
                  Create restaurant license & owner credentials
                </p>
              </div>
              <button
                onClick={() => setShowAddRestaurantModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            {onboardSuccess ? (
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 space-y-3 text-xs">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="h-5 w-5" />
                  Restaurant Onboarded Successfully!
                </div>
                <div className="bg-background/80 rounded-lg p-3 font-mono space-y-1 text-foreground">
                  <div><strong>Restaurant:</strong> {onboardSuccess.restaurantName}</div>
                  <div><strong>Owner Email:</strong> {onboardSuccess.ownerEmail}</div>
                  <div><strong>Password:</strong> {onboardSuccess.password}</div>
                  <div><strong>Plan:</strong> {onboardSuccess.plan}</div>
                  <div>
                    <strong>Expires At:</strong>{" "}
                    {new Date(onboardSuccess.expiresAt).toLocaleDateString("en-IN")}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => {
                      const text = `🎉 OrderRestro POS Login Details:\nRestaurant: ${onboardSuccess.restaurantName}\nEmail: ${onboardSuccess.ownerEmail}\nPassword: ${onboardSuccess.password}\nStaff PIN: 1234\nPlan: ${onboardSuccess.plan}\nValidity: Till ${new Date(onboardSuccess.expiresAt).toLocaleDateString("en-IN")}\nLogin URL: http://localhost:1995/login`;
                      navigator.clipboard.writeText(text);
                      alert("Copied to clipboard! You can paste and send directly on WhatsApp.");
                    }}
                  >
                    <Copy className="h-3.5 w-3.5 mr-1" />
                    Copy Details for WhatsApp
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAddRestaurantModal(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleOnboardRestaurant} className="space-y-3 text-xs">
                {onboardError && (
                  <div className="rounded-lg bg-destructive/10 p-2.5 text-destructive font-medium">
                    {onboardError}
                  </div>
                )}

                <div>
                  <Label className="text-xs">Restaurant Name</Label>
                  <Input
                    required
                    placeholder="e.g. Honest Pavbhaji & Fast Food"
                    value={newRestName}
                    onChange={(e) => setNewRestName(e.target.value)}
                    className="h-9 mt-1 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs">Branch Name</Label>
                  <Input
                    required
                    placeholder="e.g. Main Branch"
                    value={newBranchName}
                    onChange={(e) => setNewBranchName(e.target.value)}
                    className="h-9 mt-1 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Owner Full Name</Label>
                    <Input
                      required
                      placeholder="e.g. Milan Patel"
                      value={newOwnerName}
                      onChange={(e) => setNewOwnerName(e.target.value)}
                      className="h-9 mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Owner Email (Login ID)</Label>
                    <Input
                      required
                      type="email"
                      placeholder="owner@honest.com"
                      value={newOwnerEmail}
                      onChange={(e) => setNewOwnerEmail(e.target.value)}
                      className="h-9 mt-1 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Initial Password</Label>
                  <Input
                    required
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-9 mt-1 text-xs font-mono"
                  />
                  <span className="text-[10px] text-muted-foreground">Default PIN is 1234</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Subscription Plan</Label>
                    <select
                      value={newPlan}
                      onChange={(e) => setNewPlan(e.target.value)}
                      className="w-full h-9 mt-1 rounded-md border border-input bg-background px-3 text-xs"
                    >
                      <option value="STARTER">Starter (Base) - ₹8,499</option>
                      <option value="GROWTH">Growth (Pro) - ₹14,499</option>
                      <option value="SCALE">Scale (Enterprise) - ₹21,999</option>
                    </select>
                  </div>

                  <div>
                    <Label className="text-xs">License Validity</Label>
                    <select
                      value={newValidityDays}
                      onChange={(e) => setNewValidityDays(Number(e.target.value))}
                      className="w-full h-9 mt-1 rounded-md border border-input bg-background px-3 text-xs"
                    >
                      <option value={14}>14 Days (Free Trial)</option>
                      <option value={30}>1 Month (30 Days)</option>
                      <option value={90}>3 Months (90 Days)</option>
                      <option value={180}>6 Months (180 Days)</option>
                      <option value={365}>1 Year (365 Days)</option>
                      <option value={730}>2 Years (730 Days)</option>
                      <option value={3650}>10 Years (Lifetime)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowAddRestaurantModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submittingOnboard}
                    className="flex-1 bg-primary text-primary-foreground font-medium"
                  >
                    {submittingOnboard ? "Creating..." : "Create & Issue License"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: RENEW / EXTEND LICENSE */}
      {showRenewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">Renew / Extend License</h3>
              <p className="text-xs text-muted-foreground">{showRenewModal.name}</p>
            </div>

            <form onSubmit={handleRenewLicense} className="space-y-3 text-xs">
              <div>
                <Label className="text-xs">Subscription Plan</Label>
                <select
                  value={renewPlan}
                  onChange={(e) => setRenewPlan(e.target.value)}
                  className="w-full h-9 mt-1 rounded-md border border-input bg-background px-3 text-xs"
                >
                  <option value="STARTER">Starter Plan (₹8,499)</option>
                  <option value="GROWTH">Growth Plan (₹14,499)</option>
                  <option value="SCALE">Scale Plan (₹21,999)</option>
                </select>
              </div>

              <div>
                <Label className="text-xs">Extend Validity By</Label>
                <select
                  value={renewDays}
                  onChange={(e) => setRenewDays(Number(e.target.value))}
                  className="w-full h-9 mt-1 rounded-md border border-input bg-background px-3 text-xs"
                >
                  <option value={30}>+ 30 Days (1 Month)</option>
                  <option value={90}>+ 90 Days (3 Months)</option>
                  <option value={180}>+ 180 Days (6 Months)</option>
                  <option value={365}>+ 365 Days (1 Full Year)</option>
                  <option value={730}>+ 730 Days (2 Years)</option>
                  <option value={3650}>+ Lifetime Access</option>
                </select>
              </div>

              <div className="rounded-lg bg-muted/60 p-2.5 text-[11px] text-muted-foreground">
                Extending adds days to their current expiry or from today if currently expired, and ensures their license status is <strong>ACTIVE</strong>.
              </div>

              <div className="pt-2 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowRenewModal(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={renewing}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                >
                  {renewing ? "Renewing..." : "Confirm Renewal"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: RESET PASSWORD */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">Reset Owner Password</h3>
              <p className="text-xs text-muted-foreground">
                {showPasswordModal.name} ({showPasswordModal.ownerEmail})
              </p>
            </div>

            {resetSuccess ? (
              <div className="rounded-lg bg-emerald-500/10 p-3 text-emerald-600 dark:text-emerald-400 font-semibold text-center text-xs">
                Password updated successfully!
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-3 text-xs">
                <div>
                  <Label className="text-xs">New Password</Label>
                  <Input
                    required
                    type="text"
                    value={resetPwd}
                    onChange={(e) => setResetPwd(e.target.value)}
                    className="h-9 mt-1 text-xs font-mono"
                  />
                  <span className="text-[10px] text-muted-foreground">
                    Restaurant owner will use this new password to sign in.
                  </span>
                </div>

                <div className="pt-2 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowPasswordModal(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={resettingPwd}
                    className="flex-1 bg-primary text-primary-foreground font-medium"
                  >
                    {resettingPwd ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

