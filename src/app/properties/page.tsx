"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, Heart, MapPin, Eye, Grid } from "lucide-react";
import { useMockDb } from "@/lib/context/mock-db-context";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatINR } from "@/lib/utils";
import Link from "next/link";

function PropertiesListContent() {
  const searchParams = useSearchParams();
  const { properties } = useMockDb();

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedLoc, setSelectedLoc] = useState("all");
  const [maxBudget, setMaxBudget] = useState(200000000); // 20 Cr default max
  const [showFilters, setShowFilters] = useState(false);
  const [savedPropertyIds, setSavedPropertyIds] = useState<string[]>([]);

  // Load URL queries if present
  useEffect(() => {
    const syncParams = () => {
      const loc = searchParams.get("location");
      const type = searchParams.get("type");
      const budget = searchParams.get("budget");

      if (loc) setSelectedLoc(loc);
      if (type) setSelectedType(type);
      if (budget) setMaxBudget(Number(budget));

      // Load saved properties bookmarks
      const saved = localStorage.getItem("reop-saved-properties");
      if (saved) {
        setSavedPropertyIds(JSON.parse(saved));
      }
    };

    // Defer state update asynchronously to avoid React 19 cascading render warnings
    const timer = setTimeout(syncParams, 0);
    return () => clearTimeout(timer);
  }, [searchParams]);

  // Handle save toggle
  const toggleSaveProperty = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    let updated;
    if (savedPropertyIds.includes(id)) {
      updated = savedPropertyIds.filter((item) => item !== id);
    } else {
      updated = [...savedPropertyIds, id];
    }
    setSavedPropertyIds(updated);
    localStorage.setItem("reop-saved-properties", JSON.stringify(updated));
  };

  // Filter properties logic
  const filteredProperties = properties.filter((prop) => {
    const matchesSearch =
      prop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === "all" || prop.type === selectedType;
    const matchesLoc = selectedLoc === "all" || prop.location === selectedLoc;
    const matchesBudget = prop.price <= maxBudget;

    return matchesSearch && matchesType && matchesLoc && matchesBudget;
  });

  const locations = ["all", "GIFT City", "Bodakdev", "S.G. Highway", "Sanand"];
  const types = ["all", "apartment", "villa", "office", "plot"];

  return (
    <div className="flex-1 flex flex-col pt-20">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-12 w-full flex-1">
        {/* Page Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <Badge variant="gold" className="mb-2">Operator Inventory</Badge>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-luxury-gradient">
              Active Properties Portfolio
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Select premium investment plots, Grade A offices, and luxury residential suites.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-6 bg-black/10 dark:bg-white/5 px-4 py-2.5 rounded-xl border border-white/5">
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Total Assets</p>
              <p className="text-base font-black text-foreground">{properties.length}</p>
            </div>
            <div className="h-6 w-px bg-border/20" />
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Matching Filters</p>
              <p className="text-base font-black text-gold">{filteredProperties.length}</p>
            </div>
          </div>
        </div>

        {/* Search & Filter Header */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by title, features, keywords, GIFT City..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-input w-full h-11 pl-11 pr-4 text-foreground rounded-lg transition-all duration-300 placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:ring-1 focus:ring-gold/60"
              />
            </div>
            <Button
              variant="glass"
              className="h-11 gap-2 text-sm font-semibold"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4.5 w-4.5" />
              <span>Filters</span>
            </Button>
          </div>

          {/* Advanced Filters Expandable Panel */}
          {showFilters && (
            <div className="glass-panel p-5 rounded-xl border border-white/10 shadow-xl flex flex-col gap-6 animate-in fade-in slide-in-from-top-3 duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Location select */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Location</label>
                  <select
                    value={selectedLoc}
                    onChange={(e) => setSelectedLoc(e.target.value)}
                    className="glass-input h-10 px-3 text-sm text-foreground rounded-lg focus:outline-none focus:ring-1 focus:ring-gold/60 cursor-pointer"
                  >
                    {locations.map((loc) => (
                      <option key={loc} value={loc} className="bg-card text-foreground">
                        {loc === "all" ? "All Locations" : loc}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type select */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Zoning Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="glass-input h-10 px-3 text-sm text-foreground rounded-lg focus:outline-none focus:ring-1 focus:ring-gold/60 cursor-pointer"
                  >
                    {types.map((type) => (
                      <option key={type} value={type} className="bg-card text-foreground">
                        {type === "all" ? "All Asset Types" : type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Budget Slider */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-muted-foreground">Max Budget</span>
                    <span className="text-foreground">{formatINR(maxBudget)}</span>
                  </div>
                  <input
                    type="range"
                    min={10000000}
                    max={200000000}
                    step={5000000}
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(Number(e.target.value))}
                    className="w-full accent-gold bg-muted h-1 rounded-lg cursor-pointer mt-3"
                  />
                </div>
              </div>

              {/* Reset button */}
              <div className="flex justify-end border-t border-border/10 pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedLoc("all");
                    setSelectedType("all");
                    setMaxBudget(200000000);
                    setSearchQuery("");
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Reset Configuration
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Properties Grid */}
        {filteredProperties.length === 0 ? (
          <div className="glass-panel p-16 rounded-2xl border border-border/40 text-center flex flex-col items-center gap-4 max-w-lg mx-auto mt-12">
            <div className="h-12 w-12 rounded-full bg-gold/10 flex items-center justify-center text-gold">
              <Grid className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-foreground">No Matching Assets Found</h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
                Adjust your filters, expand budget caps, or try searching for another micro-market region.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedLoc("all");
                setSelectedType("all");
                setMaxBudget(200000000);
                setSearchQuery("");
              }}
            >
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((prop) => {
              const isSaved = savedPropertyIds.includes(prop.id);
              return (
                <Link key={prop.id} href={`/properties/${prop.id}`}>
                  <Card className="group relative h-full flex flex-col justify-between cursor-pointer">
                    {/* Header Image */}
                    <div className="relative aspect-[16/10] overflow-hidden rounded-t-xl shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={prop.images[0]}
                        alt={prop.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      
                      {/* Top Overlay Actions */}
                      <div className="absolute inset-0 p-3 flex justify-between items-start bg-gradient-to-b from-black/40 via-transparent to-transparent opacity-90">
                        <Badge variant="gold" className="text-[9px] font-bold">
                          ROI {prop.roi}%
                        </Badge>
                        <button
                          onClick={(e) => toggleSaveProperty(prop.id, e)}
                          className={`p-2 rounded-full border backdrop-blur-md shadow-md transition-colors cursor-pointer ${
                            isSaved
                              ? "bg-red-500 border-red-500 text-white"
                              : "bg-black/40 border-white/20 text-white hover:bg-white hover:text-black"
                          }`}
                        >
                          <Heart className={`h-4 w-4 ${isSaved ? "fill-white" : ""}`} />
                        </button>
                      </div>

                      {/* Bottom Type Badge */}
                      <div className="absolute bottom-3 right-3">
                        <Badge variant="glass" className="text-[9px] font-bold">
                          {prop.type}
                        </Badge>
                      </div>
                    </div>

                    {/* Content Details */}
                    <CardContent className="p-5 flex-1 flex flex-col justify-between gap-4">
                      <div className="flex flex-col gap-1.5">
                        <h3 className="font-bold text-base text-foreground group-hover:text-gold transition-colors leading-snug">
                          {prop.title}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 text-gold shrink-0" />
                          <span>{prop.location}, {prop.subLocation}</span>
                        </div>
                      </div>

                      {/* Specific Features Row */}
                      <div className="grid grid-cols-3 gap-2 border-t border-b border-border/10 py-3 text-center text-[10px] text-muted-foreground font-bold">
                        <div className="flex flex-col gap-0.5 border-r border-border/10">
                          <span>Developer</span>
                          <span className="text-foreground text-[9px] truncate">{prop.developer}</span>
                        </div>
                        <div className="flex flex-col gap-0.5 border-r border-border/10">
                          <span>Build Area</span>
                          <span className="text-foreground">{prop.area}</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span>Appreciation</span>
                          <span className="text-emerald-500">+{prop.projectedAppreciation5Yr}%</span>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex justify-between items-center pt-2">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">
                            Portfolio Value
                          </span>
                          <span className="font-extrabold text-foreground text-sm">
                            {formatINR(prop.price)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gold font-bold group-hover:translate-x-1 transition-transform">
                          <span>Analyze Asset</span>
                          <Eye className="h-4 w-4" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function PropertiesListingPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen text-muted-foreground bg-background">
        <div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin mb-4" />
        <span>Syncing Properties Database...</span>
      </div>
    }>
      <PropertiesListContent />
    </Suspense>
  );
}
