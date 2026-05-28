"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  Sparkles,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Star,
  Building,
  ArrowDown,
  UserCheck
} from "lucide-react";
import { useMockDb } from "@/lib/context/mock-db-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { formatINR } from "@/lib/utils";

// Example search locations & types
const locations = ["All Locations", "GIFT City", "Bodakdev", "S.G. Highway", "Sanand"];
const propertyTypes = ["All Types", "Apartment", "Villa", "Office", "Plot"];

// AI Interactive Preview Messages
const aiDialogues = [
  {
    question: "Which properties have the best ROI?",
    answer: "Analyzing 5 active portfolios... ⚡ **Vanguard Corporate Suites** in GIFT City leads with **14.5% annual ROI** (6.1% rental yield), followed closely by **Sanand Industrial Logistics Hub** at **15.0% projected appreciation** due to the EV industrial corridor. Shall I compile the detailed financial models?"
  },
  {
    question: "Find me a villa in Ahmedabad with privacy.",
    answer: "Located **[Verdant Groves Estate](/properties/prop-ahmedabad-villa)** in Bodakdev. 5BHK, 6,200 sq.ft, **₹7.8 Cr**. Built with Italian travertine marble, landscaped zen gardens, and a temperature-controlled home theater. Fully gated with 100% privacy assurance."
  },
  {
    question: "Run simulated lead score for a new lead.",
    answer: "Analyzing lead profile: *Rajesh Mehta*. Active GIFT City IFSC property searches, downloaded PDF brochure. **AI Score: 94 (HOT Lead)**. Triggered instant WhatsApp auto-responder. Recommended follow-up action: Schedule site visit Saturday."
  }
];

export default function LandingPage() {
  const router = useRouter();
  const { properties, addLead } = useMockDb();
  
  // Search state
  const [searchLoc, setSearchLoc] = useState("All Locations");
  const [searchType, setSearchType] = useState("All Types");
  const [searchBudget, setSearchBudget] = useState("All Budgets");

  // AI Interactive State
  const [aiActiveIndex, setAiActiveIndex] = useState(0);
  const [aiResponseText, setAiResponseText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Form submission state
  const [demoName, setDemoName] = useState("");
  const [demoPhone, setDemoPhone] = useState("");
  const [demoSubmitted, setDemoSubmitted] = useState(false);

  // AI assistant preview typing simulation
  useEffect(() => {
    const startTyping = setTimeout(() => {
      setAiResponseText("");
      setIsTyping(true);
    }, 0);
    const targetText = aiDialogues[aiActiveIndex].answer;
    let index = 0;
    
    const timer = setInterval(() => {
      if (index < targetText.length) {
        setAiResponseText((prev) => prev + targetText.charAt(index));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, 15);

    return () => {
      clearTimeout(startTyping);
      clearInterval(timer);
    };
  }, [aiActiveIndex]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect to listings page with filters
    const query = [];
    if (searchLoc !== "All Locations") query.push(`location=${searchLoc}`);
    if (searchType !== "All Types") query.push(`type=${searchType.toLowerCase()}`);
    if (searchBudget !== "All Budgets") query.push(`budget=${searchBudget}`);
    
    router.push(`/properties?${query.join("&")}`);
  };

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (demoName && demoPhone) {
      addLead({
        name: demoName,
        email: `${demoName.toLowerCase().replace(/\s+/g, "")}@demo-inquiry.com`,
        phone: demoPhone,
        interestedPropertyId: "prop-gift-city-skyvilla",
        propertyName: "REOP Platform Demo Run",
        status: "new"
      });
      setDemoSubmitted(true);
      setDemoName("");
      setDemoPhone("");
      setTimeout(() => setDemoSubmitted(false), 5000);
    }
  };

  return (
    <div className="flex-1 flex flex-col pt-20">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-6 py-20 bg-radial-[at_top_center] from-deep-blue/20 via-background to-background">
        {/* Animated Mesh Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(128,128,128,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,128,128,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
        
        {/* Abstract Glowing Aura */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 h-[350px] w-[500px] rounded-full bg-gold/10 blur-[120px] pointer-events-none animate-pulse-slow" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center w-full z-10">
          {/* Headline and CTAs */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="gold" className="text-[10px] py-1 px-3 mb-4">
                <Sparkles className="h-3 w-3 mr-1.5 inline" /> AI-Powered Operating System
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.08] text-foreground"
            >
              The AI Operating System for{" "}
              <span className="text-luxury-gold">Modern Real Estate.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              Unify properties, score leads with smart intelligence, and deploy instant WhatsApp automation workflows. Built for India&apos;s leading builders, brokers, and agencies.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mt-4"
            >
              <Link href="/auth/login">
                <Button variant="gold" size="lg" className="w-full sm:w-auto font-semibold gap-2">
                  Launch Console <ArrowRight className="h-4.5 w-4.5" />
                </Button>
              </Link>
              <Link href="/properties">
                <Button variant="glass" size="lg" className="w-full sm:w-auto font-semibold gap-2">
                  Explore Active Inventory
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Floating Luxury Dashboard Graphic */}
          <div className="lg:col-span-5 relative w-full aspect-square max-w-[450px] mx-auto">
            {/* Center card: Lead scoring */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 glass-panel p-5 rounded-2xl border border-white/10 shadow-2xl z-20"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                  Lead Intel Report
                </span>
                <Badge variant="hot">94 HOT</Badge>
              </div>
              <h4 className="text-sm font-bold text-foreground mb-1">Rajesh Mehta</h4>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                &quot;Wants to visit Aurelia Skyvillas this Saturday. Capital allocated for GIFT IFSC holdings.&quot;
              </p>
              <div className="border-t border-border/10 mt-3 pt-3 flex justify-between items-center">
                <span className="text-[9px] text-muted-foreground font-semibold">AI Lead Scoring</span>
                <span className="text-xs text-gold font-bold">12.8% Yield Target</span>
              </div>
            </motion.div>

            {/* Top Right: WhatsApp notification */}
            <motion.div
              initial={{ opacity: 0, x: 30, y: -30 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ type: "spring", stiffness: 80, delay: 0.4 }}
              className="absolute top-4 right-0 w-64 glass-panel p-4 rounded-xl border border-emerald-500/20 shadow-xl z-30"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
                  WhatsApp Automation
                </span>
              </div>
              <p className="text-[10px] text-foreground/90 font-medium">
                ⚡ Auto-reply sent: &quot;Layout PDF brochure and payment terms delivered to Priya Sharma...&quot;
              </p>
            </motion.div>

            {/* Bottom Left: Portfolio Growth metrics */}
            <motion.div
              initial={{ opacity: 0, x: -30, y: 30 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ type: "spring", stiffness: 80, delay: 0.6 }}
              className="absolute bottom-4 left-0 w-60 glass-panel p-4 rounded-xl border border-gold/20 shadow-xl z-30 flex flex-col gap-2"
            >
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                  GIFT City Appreciation
                </span>
                <span className="text-[9px] text-emerald-500 font-bold">+80%</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-black text-foreground">₹2.45 Cr</span>
                <span className="text-[10px] text-muted-foreground">Original Ticket</span>
              </div>
              {/* Compounding bar */}
              <div className="h-1 bg-border/20 rounded-full overflow-hidden">
                <div className="h-full bg-gold w-4/5 rounded-full" />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:block text-muted-foreground/60 hover:text-foreground transition-colors cursor-pointer">
          <ArrowDown className="h-5 w-5 animate-bounce" />
        </div>
      </section>

      {/* Property Search Bar Section */}
      <section className="relative z-20 px-6 -mt-8 mb-24 max-w-5xl mx-auto w-full">
        <form
          onSubmit={handleSearchSubmit}
          className="glass-panel p-4 sm:p-5 rounded-2xl border border-white/10 shadow-2xl grid grid-cols-1 sm:grid-cols-4 gap-4"
        >
          {/* Location */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Location</span>
            <select
              value={searchLoc}
              onChange={(e) => setSearchLoc(e.target.value)}
              className="w-full bg-transparent border-0 text-foreground font-semibold text-sm focus:ring-0 focus:outline-none cursor-pointer"
            >
              {locations.map((loc) => (
                <option key={loc} value={loc} className="bg-card text-foreground">
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div className="flex flex-col gap-1.5 border-t sm:border-t-0 sm:border-l border-border/20 pt-3 sm:pt-0 sm:pl-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Property Type</span>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="w-full bg-transparent border-0 text-foreground font-semibold text-sm focus:ring-0 focus:outline-none cursor-pointer"
            >
              {propertyTypes.map((type) => (
                <option key={type} value={type} className="bg-card text-foreground">
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Budget */}
          <div className="flex flex-col gap-1.5 border-t sm:border-t-0 sm:border-l border-border/20 pt-3 sm:pt-0 sm:pl-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Max Budget</span>
            <select
              value={searchBudget}
              onChange={(e) => setSearchBudget(e.target.value)}
              className="w-full bg-transparent border-0 text-foreground font-semibold text-sm focus:ring-0 focus:outline-none cursor-pointer"
            >
              <option value="All Budgets" className="bg-card text-foreground">All Budgets</option>
              <option value="20000000" className="bg-card text-foreground">Under ₹2.0 Cr</option>
              <option value="50000000" className="bg-card text-foreground">Under ₹5.0 Cr</option>
              <option value="100000000" className="bg-card text-foreground">Under ₹10.0 Cr</option>
            </select>
          </div>

          {/* Search Button */}
          <Button type="submit" variant="gold" className="w-full h-full flex items-center justify-center gap-2">
            <Search className="h-4.5 w-4.5" />
            <span>Search Portfolio</span>
          </Button>
        </form>
      </section>

      {/* Featured Luxury Listings */}
      <section className="py-16 px-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
          <div>
            <Badge variant="gold" className="mb-2">Signature Portfolio</Badge>
            <h2 className="text-3xl font-extrabold tracking-tight text-luxury-gradient">
              Active Growth Opportunities
            </h2>
          </div>
          <Link href="/properties" className="text-xs font-bold uppercase tracking-wider text-gold hover:text-gold/80 flex items-center gap-1 mt-3 sm:mt-0 transition-colors">
            View All Properties <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {properties.slice(0, 3).map((prop) => (
            <Card key={prop.id} className="group relative">
              {/* Image box */}
              <div className="relative aspect-[16/10] overflow-hidden rounded-t-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={prop.images[0]}
                  alt={prop.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-3 left-3">
                  <Badge variant="gold" className="text-[9px] font-bold">
                    ROI {prop.roi}%
                  </Badge>
                </div>
                <div className="absolute bottom-3 right-3">
                  <Badge variant="glass" className="text-[9px] font-bold">
                    {prop.type}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-5 flex flex-col gap-4">
                <div>
                  <h4 className="font-bold text-base text-foreground leading-snug group-hover:text-gold transition-colors">
                    {prop.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <span>{prop.location}</span> • <span>{prop.subLocation}</span>
                  </p>
                </div>

                <div className="flex justify-between items-center border-t border-border/10 pt-4">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">
                      Value
                    </span>
                    <span className="font-extrabold text-foreground text-sm">
                      {formatINR(prop.price)}
                    </span>
                  </div>
                  <Link href={`/properties/${prop.id}`}>
                    <Button variant="outline" size="sm" className="h-8 text-xs font-semibold px-3.5">
                      Analyze Yield
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* AI Assistant Preview Block */}
      <section className="py-20 bg-black/10 dark:bg-white/5 border-y border-border/20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-5 flex flex-col gap-6">
            <Badge variant="gold" className="self-start">REOP Intelligence</Badge>
            <h2 className="text-3xl font-extrabold tracking-tight text-luxury-gradient">
              Consult the Real Estate Oracle
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our embedded AI agent understands commercial yield covenants, GIFT City IFSC tax regimes, and villa EMI calculations. Try clicking the quick prompts to see responses.
            </p>

            {/* Interactive Prompts Selectors */}
            <div className="flex flex-col gap-2.5 mt-2">
              {aiDialogues.map((dlg, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (!isTyping) setAiActiveIndex(idx);
                  }}
                  className={`text-left p-3.5 rounded-xl border transition-all text-xs font-semibold flex items-center justify-between cursor-pointer ${
                    aiActiveIndex === idx
                      ? "border-gold bg-gold/10 text-gold shadow-lg"
                      : "border-border/40 hover:border-gold/30 text-muted-foreground"
                  }`}
                  disabled={isTyping}
                >
                  <span className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-gold shrink-0" />
                    <span>&quot;{dlg.question}&quot;</span>
                  </span>
                  <ArrowRight className="h-3 w-3 opacity-60 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Interactive AI Output Box */}
          <div className="lg:col-span-7">
            <div className="glass-panel w-full rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
              {/* Header bar */}
              <div className="bg-black/20 dark:bg-white/5 border-b border-border/10 px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-gold animate-pulse" />
                  <span className="text-[10px] font-bold text-gold uppercase tracking-widest">
                    REOP AI Terminal
                  </span>
                </div>
                <span className="text-[9px] text-muted-foreground font-bold uppercase">
                  Connected to GPT-4o
                </span>
              </div>

              {/* Terminal body */}
              <div className="p-6 font-mono text-xs leading-relaxed min-h-[220px] flex flex-col gap-4 text-foreground/90">
                <div className="flex items-start gap-2 text-muted-foreground">
                  <span className="text-gold font-bold">&gt;</span>
                  <span>{aiDialogues[aiActiveIndex].question}</span>
                </div>
                <div className="border-t border-border/5 pt-4">
                  {isTyping ? (
                    <div className="flex items-center gap-2 text-gold font-bold">
                      <Zap className="h-3.5 w-3.5 animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  ) : (
                    <div className="whitespace-pre-line text-xs">
                      {aiResponseText}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Statistics Grid */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col gap-4">
          <Badge variant="gold" className="self-center">Platform Scale</Badge>
          <h2 className="text-3xl font-extrabold tracking-tight text-luxury-gradient">
            Engineered for High-Performance
          </h2>
          <p className="text-sm text-muted-foreground">
            REOP provides real-time infrastructure, allowing real estate operators to close deals 3x faster.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { metric: "₹450Cr+", label: "Transacted Volume", desc: "Successfully tracked through the dashboard pipeline", icon: TrendingUp },
            { metric: "2.4 min", label: "Avg Lead Response", desc: "Instant automated WhatsApp broker follow-up", icon: Zap },
            { metric: "98.2%", label: "RERA Matching", desc: "Automatic title and regulatory document check", icon: ShieldCheck },
            { metric: "14.5%", label: "Top Asset ROI", desc: "Investment yield benchmarks in GIFT City IFSC", icon: Building }
          ].map((stat, idx) => (
            <Card key={idx} hoverGlow={false} className="p-6 border border-border/20 hover:border-gold/10">
              <div className="h-10 w-10 rounded-lg bg-gold/10 flex items-center justify-center text-gold mb-5">
                <stat.icon className="h-5 w-5" />
              </div>
              <span className="text-3xl font-black text-foreground tracking-tight">{stat.metric}</span>
              <h4 className="text-xs font-bold text-luxury-gold uppercase tracking-wider mt-1.5 mb-2">
                {stat.label}
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{stat.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-black/10 dark:bg-white/5 border-t border-border/20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col gap-4">
            <Badge variant="gold" className="self-center">Operator Testimonials</Badge>
            <h2 className="text-3xl font-extrabold tracking-tight text-luxury-gradient">
              Trusted by Elite Builders & Brokers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "REOP completely transformed our client onboarding. Inquiring NRI buyers are instantly greeted over WhatsApp with ROI computations, and our team tracks them on a Linear-style pipeline board.",
                author: "Vikram Shah",
                role: "Director, Gujarat Prestige Realty",
                stars: 5
              },
              {
                quote: "We deployed REOP for our new commercial tower in GIFT City. The AI Scoring filters out hot institutional buyers in seconds, saving our sales team hundreds of hours on unqualified cold leads.",
                author: "Ananya Patel",
                role: "VP Marketing, Zenith Builders Group",
                stars: 5
              },
              {
                quote: "The slide calculators, RERA document auto-responses, and custom dashboard metrics make this the Apple of real estate software. Visually stunning and incredibly practical.",
                author: "Manoj Mehta",
                role: "Founder, GIFT Capital Advisors",
                stars: 5
              }
            ].map((test, idx) => (
              <Card key={idx} className="p-6 flex flex-col justify-between gap-6 border-border/10">
                <div className="flex flex-col gap-4">
                  {/* Stars */}
                  <div className="flex gap-1">
                    {Array.from({ length: test.stars }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                    ))}
                  </div>
                  <p className="text-xs italic text-foreground/90 leading-relaxed">
                    &quot;{test.quote}&quot;
                  </p>
                </div>

                <div className="flex items-center gap-3 border-t border-border/15 pt-4">
                  <div className="h-9 w-9 rounded-full bg-gold/20 flex items-center justify-center text-gold text-xs font-black">
                    {test.author.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground">{test.author}</span>
                    <span className="text-[10px] text-muted-foreground font-medium">{test.role}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-24 px-6 max-w-5xl mx-auto w-full z-10">
        <div className="relative glass-panel rounded-3xl border border-white/10 shadow-2xl p-8 sm:p-12 overflow-hidden flex flex-col lg:flex-row items-center gap-10">
          {/* Abstract glow */}
          <div className="absolute top-1/2 left-1/3 -translate-y-1/2 h-[200px] w-[350px] rounded-full bg-gold/15 blur-[60px] pointer-events-none" />

          <div className="flex-1 flex flex-col gap-4 text-center lg:text-left z-10">
            <h2 className="text-3xl font-black text-luxury-gradient tracking-tight leading-tight">
              Ready to Upgrade to the AI Real Estate OS?
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto lg:mx-0">
              Schedule an interactive layout integration or launch the broker sandbox. Get started in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mt-2">
              <Link href="/auth/signup">
                <Button variant="gold" className="font-semibold gap-2">
                  Create Agent Account <UserCheck className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="glass" className="font-semibold">
                  Launch Demo Dashboard
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Consultation Form */}
          <form
            onSubmit={demoFormSubmit(handleDemoSubmit)}
            className="w-full max-w-sm glass-panel p-6 rounded-2xl border border-white/5 shadow-xl flex flex-col gap-4 z-10"
          >
            <span className="text-[10px] font-bold text-gold uppercase tracking-wider text-center block">
              Book Physical / Virtual site tour
            </span>
            <input
              type="text"
              placeholder="Your Name"
              value={demoName}
              onChange={(e) => setDemoName(e.target.value)}
              className="glass-input h-10 px-4 rounded-lg text-xs placeholder:text-muted-foreground/60 text-foreground"
              required
            />
            <input
              type="tel"
              placeholder="Your Mobile Number"
              value={demoPhone}
              onChange={(e) => setDemoPhone(e.target.value)}
              className="glass-input h-10 px-4 rounded-lg text-xs placeholder:text-muted-foreground/60 text-foreground"
              required
            />
            <Button type="submit" variant="gold" size="sm" className="h-10 text-xs font-semibold">
              Submit Call Request
            </Button>
            {demoSubmitted && (
              <p className="text-[10px] text-emerald-500 font-bold text-center animate-pulse">
                ✓ Call request logged! Check your phone for instant WhatsApp auto-reply.
              </p>
            )}
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// Simple wrapper helper for form submit
function demoFormSubmit(handler: (e: React.FormEvent<HTMLFormElement>) => void) {
  return (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handler(e);
  };
}
