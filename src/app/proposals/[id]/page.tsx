"use client";

import React, { useState, useEffect, use } from "react";
import { 
  MapPin, 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp, 
  ShieldAlert, 
  Calendar, 
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatINR } from "@/lib/utils";
import { BookingModal } from "@/components/properties/booking-modal";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface ProposalData {
  lead: {
    id: string;
    name: string;
    propertyName: string;
    createdAt: string;
  };
  property: {
    id: string;
    title: string;
    type: string;
    price: number;
    location: string;
    subLocation: string;
    beds?: number;
    baths?: number;
    area: string;
    images: string[];
    roi: number;
    rentalYield?: number;
    description: string;
    amenities: string[];
    features: string[];
    projectedAppreciation5Yr: number;
    address: string;
    developer: string;
  } | null;
}

export default function ProposalDetailPage({ params }: PageProps) {
  const { id } = use(params);

  // States
  const [data, setData] = useState<ProposalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [compoundYears, setCompoundYears] = useState(5);

  // Fetch proposal details and matching property
  useEffect(() => {
    const fetchProposal = async () => {
      try {
        const res = await fetch(`/api/proposals/${id}`);
        const result = await res.json();
        
        if (!res.ok) {
          throw new Error(result.error || "Failed to load proposal.");
        }

        setData(result);
        
        // Trigger Open-Tracking endpoint
        fetch(`/api/proposals/${id}/track`, { method: "POST" })
          .catch((err) => console.error("Failed to log proposal tracking open:", err));

      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error loading proposal.");
      } finally {
        setLoading(false);
      }
    };

    fetchProposal();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-muted-foreground bg-background">
        <div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin mb-4" />
        <span className="text-xs uppercase font-bold tracking-widest text-gold/80 animate-pulse">Loading Secure Prospectus...</span>
      </div>
    );
  }

  if (error || !data || !data.property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center gap-4 bg-background text-foreground">
        <div className="h-14 w-14 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold">Prospectus Link Expired</h2>
        <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
          The requested property proposal link is either archived, restricted, or expired. Please contact your investment manager.
        </p>
      </div>
    );
  }

  const { lead, property } = data;

  const handleNextImage = () => {
    setActiveImageIdx((prev) => (prev + 1) % property.images.length);
  };

  const handlePrevImage = () => {
    setActiveImageIdx((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  // ROI Calculator Calculations
  const calculatedFutureValue = property.price * Math.pow(1 + property.roi / 100, compoundYears);
  const totalAppreciation = calculatedFutureValue - property.price;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-gold/20">
      {/* Premium Proposal Header */}
      <header className="fixed top-0 left-0 right-0 h-16 border-b border-white/5 bg-background/60 backdrop-blur-md z-40 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-gold to-amber-500 flex items-center justify-center text-white font-black shadow-lg shadow-gold/20">
            R
          </div>
          <span className="text-sm font-extrabold uppercase tracking-widest text-foreground">
            REOP <span className="text-gold font-normal">Capital</span>
          </span>
        </div>
        <Badge variant="gold" className="text-[10px] uppercase font-bold tracking-widest py-1 px-2.5">
          🔒 Secure Client Node
        </Badge>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-6 pt-28 pb-20 w-full flex-grow flex flex-col gap-10">
        
        {/* Dynamic Personalised Greeting Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl bg-gradient-to-r from-gold/10 via-transparent to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] text-emerald-500 font-extrabold uppercase tracking-widest font-mono">
                Exclusive Invitation
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground">
              Hello, {lead.name}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
              Based on your requirements, we have curated the following institutional-grade investment prospectus for your consideration.
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-1 shrink-0">
            <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest font-mono">
              Prepared Date
            </span>
            <span className="text-xs font-semibold text-foreground font-mono">
              {new Date(lead.createdAt).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric"
              })}
            </span>
          </div>
        </div>

        {/* Title and Specs Grid */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="gold">ROI {property.roi}%</Badge>
              <Badge variant="glass" className="capitalize">{property.type}</Badge>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-luxury-gradient mt-1">
              {property.title}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-4 w-4 text-gold" />
              <span>{property.address}</span>
            </div>
          </div>

          <div className="flex flex-col md:items-end bg-black/10 dark:bg-white/5 border border-white/5 p-5 rounded-2xl md:min-w-[200px] shrink-0">
            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
              Investment Ask
            </span>
            <span className="text-2xl sm:text-3xl font-black text-luxury-gold mt-1">
              {formatINR(property.price)}
            </span>
            <span className="text-[10px] text-emerald-500 font-semibold mt-1">
              ⭐ RERA Registered Title Clear
            </span>
          </div>
        </div>

        {/* Image Carousel */}
        <div className="relative h-[300px] sm:h-[450px] w-full rounded-3xl overflow-hidden shadow-2xl group border border-white/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={property.images[activeImageIdx]}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out scale-100 group-hover:scale-103"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Carousel Arrows */}
          {property.images.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm border border-white/10 hover:border-gold/50 cursor-pointer transition-all duration-300"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm border border-white/10 hover:border-gold/50 cursor-pointer transition-all duration-300"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              {/* Dots */}
              <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-1.5 z-10">
                {property.images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      activeImageIdx === idx ? "w-6 bg-gold" : "w-1.5 bg-white/40"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Property Specs overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel p-4 rounded-xl border border-white/5 bg-black/10 dark:bg-white/5 flex flex-col justify-center text-center">
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-muted-foreground">Appreciation (ROI)</span>
            <span className="text-xl font-black text-gold mt-1">+{property.roi}% / Yr</span>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-white/5 bg-black/10 dark:bg-white/5 flex flex-col justify-center text-center">
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-muted-foreground">Zoning Type</span>
            <span className="text-xl font-black text-foreground mt-1 capitalize">{property.type}</span>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-white/5 bg-black/10 dark:bg-white/5 flex flex-col justify-center text-center">
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-muted-foreground">Portfolio Area</span>
            <span className="text-xl font-black text-foreground mt-1">{property.area}</span>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-white/5 bg-black/10 dark:bg-white/5 flex flex-col justify-center text-center">
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-muted-foreground">Project Developer</span>
            <span className="text-xl font-black text-foreground mt-1 truncate">{property.developer}</span>
          </div>
        </div>

        {/* Description & Financial sliders */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Column 1: Description & Amenities */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-bold text-foreground">Project Overview</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {property.description}
              </p>
            </div>

            <div className="flex flex-col gap-4 pt-4 border-t border-white/5">
              <h3 className="text-lg font-bold text-foreground">Premium Project Features</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {property.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-semibold text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4 pt-4 border-t border-white/5">
              <h3 className="text-lg font-bold text-foreground">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((amenity, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-white/5 bg-black/10 dark:bg-white/5 text-muted-foreground"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Financial Calculator Sliders */}
          <div className="lg:col-span-5">
            <Card className="border border-gold/10 p-6 bg-gradient-to-b from-gold/5 via-transparent to-transparent flex flex-col gap-6">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-gold" /> ROI Appreciation Modeler
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  See how your equity appreciates compounded at {property.roi}% per annum.
                </p>
              </div>

              {/* Slider Input */}
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-muted-foreground uppercase tracking-wider">Holding Period</span>
                  <span className="font-bold text-gold font-mono">{compoundYears} Years</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  value={compoundYears}
                  onChange={(e) => setCompoundYears(Number(e.target.value))}
                  className="w-full accent-gold h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-muted-foreground font-mono">
                  <span>1 Year</span>
                  <span>15 Years</span>
                </div>
              </div>

              {/* Projections breakdown */}
              <div className="flex flex-col gap-3.5 pt-4 border-t border-white/5 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Original Investment:</span>
                  <span className="font-bold text-foreground">{formatINR(property.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-500">Compounded Growth:</span>
                  <span className="font-bold text-emerald-500">+{formatINR(totalAppreciation)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-white/5 text-sm">
                  <span className="text-muted-foreground font-bold">Projected Future Value:</span>
                  <span className="font-extrabold text-luxury-gold text-base">{formatINR(calculatedFutureValue)}</span>
                </div>
              </div>

              {/* Call-to-action button */}
              <Button
                variant="gold"
                className="w-full mt-4 font-bold gap-2"
                onClick={() => setBookingOpen(true)}
              >
                <Calendar className="h-4.5 w-4.5" /> Book Private Property Tour
              </Button>
            </Card>
          </div>

        </div>

      </main>

      {/* Booking Form Modal Overlay */}
      <BookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        propertyId={property.id}
        propertyName={property.title}
      />
    </div>
  );
}
