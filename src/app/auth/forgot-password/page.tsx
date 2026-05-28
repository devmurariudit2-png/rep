"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Building2, Mail, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    // Mock recovery link dispatch
    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
    }, 1200);
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
            Recover Operator Account
          </h2>
          <p className="text-xs text-muted-foreground">
            We will dispatch an encrypted session key recovery sequence.
          </p>
        </div>

        {/* Form Panel */}
        <div className="glass-panel p-8 rounded-2xl border border-white/10 shadow-2xl flex flex-col gap-6">
          {submitted ? (
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="font-bold text-foreground">Recovery Sequence Dispatched</h4>
                <p className="text-xs text-muted-foreground max-w-xs leading-relaxed mt-1">
                  We have dispatched a workspace access token link to **{email}**. Access is valid for 15 minutes.
                </p>
              </div>
              <Link href="/auth/login" className="w-full mt-4">
                <Button variant="outline" className="w-full text-xs font-semibold gap-2">
                  <ArrowLeft className="h-4 w-4" /> Back to Console Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="relative">
                <Input
                  type="email"
                  label="Registered Corporate Email"
                  placeholder="name@reop.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <Mail className="absolute right-4 bottom-3 h-4.5 w-4.5 text-muted-foreground/60" />
              </div>

              <Button
                type="submit"
                variant="gold"
                className="w-full mt-2 font-bold"
                isLoading={isLoading}
              >
                Send Recovery Key
              </Button>

              <Link
                href="/auth/login"
                className="text-center text-xs font-bold text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1.5 mt-2"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Return to Login
              </Link>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
