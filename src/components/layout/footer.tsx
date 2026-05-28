"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Building2, Mail, Phone, MapPin, Send, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  const footerLinks = {
    platform: [
      { name: "Inventory Management", href: "/properties" },
      { name: "AI Lead Scoring", href: "/dashboard" },
      { name: "WhatsApp Flow Studio", href: "/dashboard" },
      { name: "Security & Role Access", href: "/auth/login" }
    ],
    growthHubs: [
      { name: "GIFT City IFSC", href: "/properties" },
      { name: "Bodakdev Luxury", href: "/properties" },
      { name: "S.G. Commercials", href: "/properties" },
      { name: "Sanand Logistics", href: "/properties" }
    ]
  };

  return (
    <footer className="border-t border-border/40 bg-background/50 backdrop-blur-md pt-16 pb-12 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand Information */}
        <div className="flex flex-col gap-5 md:col-span-1.5">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-gold to-amber-600 flex items-center justify-center text-white">
              <Building2 className="h-4.5 w-4.5" />
            </div>
            <span className="text-lg font-black tracking-tight text-foreground">
              REOP<span className="text-gold font-light text-xs"> OS</span>
            </span>
          </Link>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
            India&apos;s premier AI-powered operating system for modern real estate builders, brokerage agencies, and wealth managers. Automating properties, leads, and client journeys.
          </p>
          <div className="flex flex-col gap-2.5 text-xs text-muted-foreground mt-2">
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-gold shrink-0" />
              <span>+91 79 4000 8080 (HQ)</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-gold shrink-0" />
              <span>intelligence@reop.in</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-gold shrink-0" />
              <span>Tower A, GIFT One Tower, IFSC Road, GIFT City, Gandhinagar, 382355</span>
            </div>
          </div>
        </div>

        {/* Dynamic Navigation Links */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-luxury-gold mb-5">
            Platform Capabilities
          </h4>
          <div className="flex flex-col gap-3.5">
            {footerLinks.platform.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5 group"
              >
                <span>{link.name}</span>
                <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:text-gold transition-all" />
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-luxury-gold mb-5">
            Strategic Growth Hubs
          </h4>
          <div className="flex flex-col gap-3.5">
            {footerLinks.growthHubs.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5 group"
              >
                <span>{link.name}</span>
                <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:text-gold transition-all" />
              </Link>
            ))}
          </div>
        </div>

        {/* Newsletter Signup */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-luxury-gold mb-5">
            Subscribe to Wealth Reports
          </h4>
          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            Acquire quarterly micro-market transaction insights, GIFT City IFSC updates, and prime zoning shifts.
          </p>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="email"
              placeholder="name@corporation.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="glass-input h-10 px-3 flex-1 rounded-lg text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-gold/60 text-foreground"
              required
            />
            <Button type="submit" variant="gold" size="sm" className="h-10 w-10 p-0 rounded-lg">
              <Send className="h-3.5 w-3.5" />
            </Button>
          </form>
          {subscribed && (
            <p className="text-[10px] text-emerald-500 font-semibold mt-2 animate-pulse">
              ✓ Subscribed! Check your inbox for the Q2 market prospectus.
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 border-t border-border/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
        <span>© {new Date().getFullYear()} REOP Technologies Pvt. Ltd. All rights reserved.</span>
        <div className="flex gap-6">
          <Link href="/" className="hover:text-foreground transition-colors">Privacy Charter</Link>
          <Link href="/" className="hover:text-foreground transition-colors">RERA Compliance (Gujarat)</Link>
          <Link href="/" className="hover:text-foreground transition-colors">Terms of Operations</Link>
        </div>
      </div>
    </footer>
  );
}
