"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Building2, ShieldCheck, Mail, Lock } from "lucide-react";
import { useMockDb, User as UserType } from "@/lib/context/mock-db-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useMockDb();

  const [role, setRole] = useState<UserType["role"]>("admin");
  const [email, setEmail] = useState("devam@reop.in");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Mock validation
      if (!email.includes("@")) {
        setError("Please enter a valid corporate email address.");
        setIsLoading(false);
        return;
      }
      
      await login(email, role);
      router.push("/dashboard");
    } catch {
      setError("Authentication failed. Please verify your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (selectedRole: UserType["role"]) => {
    setRole(selectedRole);
    if (selectedRole === "admin") {
      setEmail("devam@reop.in");
    } else if (selectedRole === "broker") {
      setEmail("rajesh.mehta@prestigebrokers.in");
    } else if (selectedRole === "builder") {
      setEmail("ananya.patel@zenithbuilders.co.in");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-radial-[at_top_center] from-deep-blue/20 via-background to-background px-6 py-12 font-sans">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(128,128,128,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,128,128,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md flex flex-col gap-6"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-gold to-amber-600 flex items-center justify-center text-white shadow-lg">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="text-2xl font-black tracking-tight text-foreground">
              REOP<span className="text-gold font-light text-sm"> OS</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold tracking-tight text-luxury-gradient mt-2">
            Access Operator Console
          </h2>
          <p className="text-xs text-muted-foreground">
            Sign in to manage inventories, score leads, and trace WhatsApp messages.
          </p>
        </div>

        {/* Login Panel */}
        <div className="glass-panel p-8 rounded-2xl border border-white/10 shadow-2xl flex flex-col gap-6">
          {/* Role selector tab */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center">
              Operator Role Profile
            </span>
            <div className="grid grid-cols-3 gap-1 bg-black/10 dark:bg-white/5 p-1 rounded-lg border border-white/5">
              {(["admin", "broker", "builder"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleQuickLogin(r)}
                  className={`py-1.5 rounded text-[10px] font-bold uppercase tracking-wide transition-all cursor-pointer ${
                    role === r
                      ? "bg-gold text-white shadow-md border border-gold/30"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500 font-semibold bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-center">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <Input
                type="email"
                label="Corporate Email"
                placeholder="name@reop.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
              <Mail className="absolute right-4 bottom-3 h-4.5 w-4.5 text-muted-foreground/60" />
            </div>

            <div className="relative">
              <Input
                type="password"
                label="Security Key"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              <Lock className="absolute right-4 bottom-3 h-4.5 w-4.5 text-muted-foreground/60" />
            </div>

            <div className="flex justify-between items-center text-xs mt-1">
              <label className="flex items-center gap-1.5 text-muted-foreground cursor-pointer">
                <input type="checkbox" className="rounded accent-gold" defaultChecked />
                <span>Keep active sandbox session</span>
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-gold font-bold hover:underline"
              >
                Forgot credentials?
              </Link>
            </div>

            <Button
              type="submit"
              variant="gold"
              className="w-full mt-2 font-bold"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>

          {/* Sandbox Indicator */}
          <div className="border-t border-border/10 pt-4 flex items-center gap-2 justify-center text-[9px] text-muted-foreground font-semibold uppercase">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Encrypted Sandbox Environment Active</span>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-muted-foreground font-medium">
          New real estate operator?{" "}
          <Link href="/auth/signup" className="text-gold font-bold hover:underline">
            Register Workspace
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
