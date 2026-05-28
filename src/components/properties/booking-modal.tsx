"use client";

import React, { useState } from "react";
import { Sparkles, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { useMockDb } from "@/lib/context/mock-db-context";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertyName: string;
}

export function BookingModal({ isOpen, onClose, propertyId, propertyName }: BookingModalProps) {
  const { addLead } = useMockDb();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00 AM");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !date) return;

    setIsSubmitting(true);
    
    // Simulate API delay
    setTimeout(() => {
      addLead({
        name,
        email,
        phone,
        interestedPropertyId: propertyId,
        propertyName,
        status: "new"
      });
      
      setIsSubmitting(false);
      setSuccess(true);
      
      // Reset form
      setName("");
      setEmail("");
      setPhone("");
      setDate("");
    }, 1200);
  };

  const handleClose = () => {
    setSuccess(false);
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title={success ? "Booking Confirmed" : "Schedule Private Viewing"}
      description={
        success
          ? "Your inquiry has been successfully parsed by REOP Core."
          : `Submit an inquiry for "${propertyName}"`
      }
    >
      {success ? (
        <div className="flex flex-col items-center text-center gap-5 py-6">
          <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)] animate-bounce">
            <Sparkles className="h-7 w-7" />
          </div>
          
          <div className="flex flex-col gap-2">
            <h4 className="text-lg font-bold text-foreground">Inquiry Dispatch Complete</h4>
            <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
              We have processed your request. A simulated WhatsApp catalog and NNN ROI sheet have been sent to your phone number.
            </p>
          </div>

          <div className="glass-panel w-full p-4 rounded-xl border border-white/5 bg-black/10 dark:bg-white/5 text-left flex flex-col gap-1.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 text-emerald-500 font-bold uppercase tracking-wider text-[10px]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>Active WhatsApp Pipeline</span>
            </div>
            <p>&quot;Namaste! Thank you for inquiring about {propertyName}. An automated brochure is arriving shortly...&quot;</p>
          </div>

          <Button variant="gold" className="w-full mt-2" onClick={handleClose}>
            Acknowledge & Close
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <Input
            label="Full Name"
            placeholder="e.g. Amit Patel"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isSubmitting}
          />
          
          <Input
            type="email"
            label="Corporate Email"
            placeholder="e.g. amit.patel@corporation.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isSubmitting}
          />

          <Input
            type="tel"
            label="WhatsApp Number (with Country Code)"
            placeholder="e.g. +91 99000 88000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            disabled={isSubmitting}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Visit Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="glass-input w-full h-11 px-4 text-foreground rounded-lg transition-all duration-300 placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:ring-1 focus:ring-gold/60 focus:border-gold/60 disabled:opacity-50"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Pref. Time
              </label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="glass-input w-full h-11 px-4 text-foreground rounded-lg transition-all duration-300 text-sm focus:outline-none focus:ring-1 focus:ring-gold/60 focus:border-gold/60 disabled:opacity-50 cursor-pointer"
                disabled={isSubmitting}
              >
                <option value="10:00 AM" className="bg-card text-foreground">10:00 AM (Morning)</option>
                <option value="01:00 PM" className="bg-card text-foreground">01:00 PM (Afternoon)</option>
                <option value="04:00 PM" className="bg-card text-foreground">04:00 PM (Late Afternoon)</option>
                <option value="07:00 PM" className="bg-card text-foreground">07:00 PM (Evening)</option>
              </select>
            </div>
          </div>

          <Button
            type="submit"
            variant="gold"
            className="w-full mt-4 font-semibold gap-2"
            isLoading={isSubmitting}
          >
            <Send className="h-4 w-4" /> Book Viewing Tour
          </Button>
        </form>
      )}
    </Dialog>
  );
}
