"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, ChevronLeft, ChevronRight, CheckCircle2, ShieldAlert, Sparkles, PhoneCall } from "lucide-react";
import { useMockDb } from "@/lib/context/mock-db-context";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatINR } from "@/lib/utils";
import { EmiCalculator } from "@/components/properties/emi-calculator";
import { RoiCalculator } from "@/components/properties/roi-calculator";
import { BookingModal } from "@/components/properties/booking-modal";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PropertyDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { properties } = useMockDb();

  // Active property lookup
  const property = properties.find((p) => p.id === id);

  // States
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [bookingOpen, setBookingOpen] = useState(false);

  if (!property) {
    return (
      <div className="flex-1 flex flex-col pt-20 bg-background text-foreground min-h-screen">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center p-6 text-center gap-4">
          <div className="h-14 w-14 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold">Property Portfolio Item Not Found</h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            The property listing identifier is either archived or restricted by operators.
          </p>
          <Link href="/properties">
            <Button variant="gold">Return to Portfolio</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const handleNextImage = () => {
    setActiveImageIdx((prev) => (prev + 1) % property.images.length);
  };

  const handlePrevImage = () => {
    setActiveImageIdx((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  return (
    <div className="flex-1 flex flex-col pt-20">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-12 w-full flex-1">
        {/* Navigation Breadcrumb */}
        <Link
          href="/properties"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" /> Back to listings
        </Link>

        {/* Title & Quick Pricing */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="gold">ROI {property.roi}%</Badge>
              <Badge variant="glass" className="capitalize">{property.type}</Badge>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-luxury-gradient mt-1">
              {property.title}
            </h1>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-4.5 w-4.5 text-gold" />
              <span>{property.address}</span>
            </div>
          </div>

          <div className="flex flex-col md:items-end bg-black/10 dark:bg-white/5 border border-white/5 p-5 rounded-2xl md:min-w-[200px]">
            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
              Investment Ask
            </span>
            <span className="text-2xl sm:text-3xl font-black text-luxury-gold mt-1">
              {formatINR(property.price)}
            </span>
            <span className="text-[10px] text-emerald-500 font-semibold mt-1">
              ⭐ Projected Value appreciation
            </span>
          </div>
        </div>

        {/* Visual Showcase (Carousel) & Main Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16">
          {/* Left Column: Image Carousel & Description */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* Image Slider */}
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl border border-white/5 group shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={property.images[activeImageIdx]}
                alt={property.title}
                className="w-full h-full object-cover transition-all duration-500"
              />

              {/* Prev / Next controls */}
              {property.images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 border border-white/10 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-black/60"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 border border-white/10 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-black/60"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>

                  {/* Thumbnail Indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                    {property.images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIdx(idx)}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                          activeImageIdx === idx ? "w-6 bg-gold" : "w-1.5 bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* AI Synthesized Executive Summary */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 h-28 w-28 bg-gold/5 rounded-full blur-2xl" />
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-gold animate-pulse" />
                <h3 className="text-base font-bold uppercase tracking-wider text-luxury-gold">
                  REOP AI Portfolio Prospectus
                </h3>
              </div>
              <p className="text-xs text-foreground/90 leading-relaxed font-mono">
                &quot;We analyzed {property.title} in the {property.location} sub-market. Capital yield projections place this asset in the top {property.roi > 12 ? "tier-A growth bracket (12%+)" : "premium low-risk allocation sector (9%+)"}. Key triggers include immediate proximity to {property.location === "GIFT City" ? "IFSC direct finance offices with SEZ tax write-offs" : "Ahmedabad S.G. lifestyle growth corridor"}.&quot;
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-border/10">
                {property.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xl font-bold tracking-tight text-foreground">
                Architectural Statement
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>
          </div>

          {/* Right Column: CTA triggers & Amenities & Map */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            {/* Booking Call Card */}
            <Card className="p-6 border border-gold/20 shadow-xl bg-gradient-to-b from-gold/5 via-transparent to-transparent flex flex-col gap-5">
              <div>
                <h3 className="text-lg font-bold text-foreground">Schedule Site Viewing</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Book a virtual walkthrough session or a secure physical site tour.
                </p>
              </div>

              <Button variant="gold" size="lg" className="w-full font-bold gap-2" onClick={() => setBookingOpen(true)}>
                <PhoneCall className="h-4.5 w-4.5" /> Book viewing
              </Button>

              <div className="flex flex-col gap-2.5 text-[10px] text-muted-foreground border-t border-border/10 pt-4 font-semibold uppercase tracking-wider">
                <div className="flex items-center justify-between">
                  <span>Assigned Operator</span>
                  <span className="text-foreground">REOP Wealth Agent</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>RERA Status</span>
                  <span className="text-emerald-500">Registered RERA-GJ</span>
                </div>
              </div>
            </Card>

            {/* Amenities Grid */}
            <div className="flex flex-col gap-4">
              <h3 className="text-base font-bold uppercase tracking-wider text-muted-foreground">
                Exclusive Amenities
              </h3>
              <div className="grid grid-cols-2 gap-3.5">
                {property.amenities.map((am, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 text-xs text-foreground bg-black/10 dark:bg-white/5 border border-white/5 py-2.5 px-3 rounded-lg"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-gold" />
                    <span className="font-medium truncate">{am}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mock satellite Map grid */}
            <div className="flex flex-col gap-3">
              <h3 className="text-base font-bold uppercase tracking-wider text-muted-foreground">
                Zoning Map & Location
              </h3>
              <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden border border-white/10 bg-zinc-900 shadow-inner flex items-center justify-center">
                {/* Simulated luxury dark map */}
                <div className="absolute inset-0 bg-radial-[circle_at_center] from-zinc-800 to-zinc-950 opacity-90" />
                
                {/* Map Grid Lines */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:1.5rem_1.5rem]" />
                
                {/* Pin pointer */}
                <div className="absolute flex flex-col items-center gap-1 z-10">
                  <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-gold" />
                  </div>
                  <Badge variant="gold" className="text-[8px] py-0.5 px-1.5 font-bold shadow-md">
                    {property.location} Asset
                  </Badge>
                </div>

                <span className="absolute bottom-2 left-2 text-[8px] text-muted-foreground font-mono">
                  Coordinates: 23.1610° N, 72.6841° E (SEZ Sector)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Compound ROI Modeler Section */}
        <section className="mb-16">
          <RoiCalculator
            propertyPrice={property.price}
            defaultRoi={property.roi}
            defaultRentalYield={property.rentalYield}
          />
        </section>

        {/* Loan EMI Calculator Section */}
        <section className="mb-16">
          <EmiCalculator propertyPrice={property.price} />
        </section>
      </main>

      <Footer />

      {/* Schedule Modal Overlay */}
      <BookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        propertyId={property.id}
        propertyName={property.title}
      />
    </div>
  );
}
