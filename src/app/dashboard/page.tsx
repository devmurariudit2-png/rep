"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Plus,
  Trash2,
  Home,
  LogOut,
  Sun,
  Moon,
  Zap,
  Send,
  ChevronRight,
  ClipboardList,
  Building,
  Mic,
  Upload
} from "lucide-react";
import { useMockDb } from "@/lib/context/mock-db-context";
import { useTheme } from "@/lib/context/theme-context";
import { AreaChart, BarChart, DonutChart } from "@/components/ui/charts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { formatINR } from "@/lib/utils";
import { Property } from "@/data/mock-properties";

interface SpeechRecognitionInstance {
  start: () => void;
  stop: () => void;
  continuous: boolean;
  lang: string;
  interimResults: boolean;
  onstart: () => void;
  onerror: (e: unknown) => void;
  onend: () => void;
  onresult: (e: { results: Array<Array<{ transcript: string }>> }) => void;
}

interface CustomWindow extends Window {
  SpeechRecognition?: new () => SpeechRecognitionInstance;
  webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  _activeSpeechRecDashboard?: SpeechRecognitionInstance;
}

export default function DashboardPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const {
    properties,
    leads,
    currentUser,
    isLoading,
    updateLeadStatus,
    deleteLead,
    addProperty,
    deleteProperty,
    sendWhatsAppMessage,
    logout,
    uploadPropertyImage,
    refreshDb
  } = useMockDb();

  // Sidebar navigation active tab
  const [activeTab, setActiveTab] = useState<"overview" | "leads" | "pipeline" | "whatsapp" | "inventory">("overview");

  // Selected Lead state (for details overlay/view logs)
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const activeLead = leads.find((l) => l.id === selectedLeadId) || leads[0];

  // Chat message input for WhatsApp logs
  const [whatsAppInput, setWhatsAppInput] = useState("");
  const [isListening, setIsListening] = useState(false);

  const toggleListening = () => {
    const clientWindow = window as unknown as CustomWindow;
    const SpeechRecognition =
      clientWindow.SpeechRecognition || clientWindow.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome or Safari.");
      return;
    }

    if (isListening) {
      const activeRec = clientWindow._activeSpeechRecDashboard;
      if (activeRec) {
        activeRec.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = "en-IN";
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event: { results: Array<Array<{ transcript: string }>> }) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setWhatsAppInput(transcript);
        }
      };

      clientWindow._activeSpeechRecDashboard = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  useEffect(() => {
    return () => {
      const clientWindow = window as unknown as CustomWindow;
      const activeRec = clientWindow._activeSpeechRecDashboard;
      if (activeRec) {
        activeRec.stop();
      }
    };
  }, []);

  // New property form state
  const [propTitle, setPropTitle] = useState("");
  const [propLocation, setPropLocation] = useState("GIFT City");
  const propSubLocation = "Gandhinagar, Gujarat";
  const [propType, setPropType] = useState<Property["type"]>("apartment");
  const [propPrice, setPropPrice] = useState("");
  const [propArea, setPropArea] = useState("");
  const [propBeds, setPropBeds] = useState("3");
  const [propBaths, setPropBaths] = useState("3");
  const [propDeveloper, setPropDeveloper] = useState("");
  const [propDescription, setPropDescription] = useState("");
  const [inventorySuccess, setInventorySuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  // Lead capture ingestion state
  const [rawInboundAlert, setRawInboundAlert] = useState("");
  const [isIngestingLead, setIsIngestingLead] = useState(false);
  const [ingestionSuccess, setIngestionSuccess] = useState(false);
  const [inboundSource, setInboundSource] = useState("magicbricks");
  const [ingestionError, setIngestionError] = useState("");

  // Set default selected lead on load
  useEffect(() => {
    if (leads.length > 0 && !selectedLeadId) {
      const timer = setTimeout(() => {
        setSelectedLeadId(leads[0].id);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [leads, selectedLeadId]);

  // Auth Guard
  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.push("/auth/login");
    }
  }, [currentUser, isLoading, router]);

  if (isLoading || !currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-muted-foreground bg-background">
        <div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin mb-4" />
        <span>Authorizing Workspace Node...</span>
      </div>
    );
  }

  // Calculate Metrics
  const totalLeads = leads.length;
  const hotLeads = leads.filter((l) => l.leadQuality === "hot").length;
  const warmLeads = leads.filter((l) => l.leadQuality === "warm").length;
  const coldLeads = leads.filter((l) => l.leadQuality === "cold").length;
  const activeConversations = leads.filter((l) => l.whatsAppHistory.length > 0).length;

  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatsAppInput.trim() || !selectedLeadId) return;

    sendWhatsAppMessage(selectedLeadId, whatsAppInput, "agent");
    setWhatsAppInput("");
  };

  const handleIngestLeadAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawInboundAlert.trim()) return;

    setIsIngestingLead(true);
    setIngestionSuccess(false);
    setIngestionError("");

    try {
      const response = await fetch("/api/leads/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText: rawInboundAlert,
          source: inboundSource
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Lead capture request failed.");
      }

      setIngestionSuccess(true);
      setRawInboundAlert("");
      await refreshDb(false); // Refresh leads list in background!
    } catch (err: unknown) {
      console.error(err);
      setIngestionError(err instanceof Error ? err.message : "Lead capture failed.");
    } finally {
      setIsIngestingLead(false);
      setTimeout(() => setIngestionSuccess(false), 4000);
    }
  };

  const handleAddPropertySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propTitle || !propPrice || !propArea || !propDeveloper) return;

    let imageUrls = [
      propType === "office"
        ? "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80"
        : propType === "plot"
          ? "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80"
          : "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80"
    ];

    if (selectedFile) {
      setIsUploadingImage(true);
      try {
        const publicUrl = await uploadPropertyImage(selectedFile);
        imageUrls = [publicUrl];
      } catch (err) {
        console.error("Image upload failed:", err);
        alert("Image upload failed. Defaulting to placeholder image.");
      } finally {
        setIsUploadingImage(false);
      }
    }

    const newProp: Property = {
      id: `prop-${Math.random().toString(36).substr(2, 9)}`,
      title: propTitle,
      type: propType,
      price: Number(propPrice),
      location: propLocation,
      subLocation: propSubLocation,
      beds: propType === "apartment" || propType === "villa" ? Number(propBeds) : undefined,
      baths: propType === "apartment" || propType === "villa" ? Number(propBaths) : undefined,
      area: propArea,
      images: imageUrls,
      roi: propLocation === "GIFT City" ? 13.5 : 9.8,
      rentalYield: propType === "office" ? 8.2 : propLocation === "GIFT City" ? 5.8 : 3.2,
      description: propDescription || "Premium high-grade real estate asset parsed by REOP developer portal.",
      amenities: ["EV Charging Point", "Smart Gated Access", "24/7 Security System", "Luxury Reception Lobby"],
      features: ["RERA Registered Title Clear", "Premium Quality Finishing", "High Value Capital appreciation Corridor"],
      projectedAppreciation5Yr: propLocation === "GIFT City" ? 75 : 45,
      address: `${propLocation} Commercial SEZ Hub, Gandhinagar, Gujarat`,
      developer: propDeveloper
    };

    addProperty(newProp);
    setInventorySuccess(true);
    
    // Reset Form
    setPropTitle("");
    setPropPrice("");
    setPropArea("");
    setPropDeveloper("");
    setPropDescription("");
    setSelectedFile(null);
    setImagePreview("");

    setTimeout(() => setInventorySuccess(false), 4000);
  };

  // Area chart data (compounding revenue projection placeholder)
  const revenueChartData = [
    { label: "Jan", value: 45000000 },
    { label: "Feb", value: 82000000 },
    { label: "Mar", value: 125000000 },
    { label: "Apr", value: 110000000 },
    { label: "May", value: 185000000 },
    { label: "Jun", value: 245000000 }
  ];

  // Bar Chart data (Inquiries by location)
  const locationInquiryData = [
    { label: "GIFT City", value: 18 },
    { label: "Bodakdev", value: 12 },
    { label: "S.G. Highway", value: 8 },
    { label: "Sanand", value: 5 }
  ];

  // Donut Lead distribution data
  const leadDonutData = [
    { label: "Hot Priority", value: hotLeads, color: "#ef4444" },
    { label: "Warm Growth", value: warmLeads, color: "#f55f0b" },
    { label: "Cold Review", value: coldLeads, color: "#3b82f6" }
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-card border-r border-border/40 flex flex-col justify-between shrink-0 hidden md:flex">
        <div className="flex flex-col gap-8 p-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-gold to-amber-600 flex items-center justify-center text-white shadow-md shadow-gold/10">
              <Building className="h-4.5 w-4.5" />
            </div>
            <span className="text-lg font-black tracking-tight text-foreground">
              REOP<span className="text-gold font-light text-xs ml-1 bg-gold/10 px-1 py-0.5 rounded border border-gold/10">OS</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex flex-col gap-1.5">
            {([
              { id: "overview", name: "Overview Analytics", icon: LayoutDashboard },
              { id: "leads", name: "Leads Console", icon: Users },
              { id: "pipeline", name: "Sales Pipeline", icon: ClipboardList },
              { id: "whatsapp", name: "WhatsApp Studio", icon: MessageSquare },
              { id: "inventory", name: "Inventory Manager", icon: Home }
            ] as const).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-gold/10 border border-gold/20 text-gold shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-black/10 dark:hover:bg-white/5 border border-transparent"
                }`}
              >
                <tab.icon className="h-4.5 w-4.5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* User Card & Logout */}
        <div className="p-6 border-t border-border/10 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-gold/20 flex items-center justify-center text-gold text-sm font-black border border-gold/30">
              {currentUser.name.charAt(0)}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs font-extrabold text-foreground truncate">{currentUser.name}</span>
              <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest truncate">{currentUser.role} Node</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-white/10 dark:hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {theme === "dark" ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>
            <Button variant="ghost" size="sm" onClick={logout} className="h-8 gap-1.5 text-[10px] uppercase font-bold text-muted-foreground hover:text-foreground">
              <LogOut className="h-3.5 w-3.5" />
              <span>Log out</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 flex flex-col overflow-hidden bg-black/5 dark:bg-zinc-950/20">
        {/* Header Bar */}
        <header className="h-16 border-b border-border/40 bg-card px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            {/* Mobile Link Toggle */}
            <span className="text-sm font-extrabold text-foreground uppercase tracking-wider md:hidden flex items-center gap-2">
              <div className="h-7 w-7 rounded bg-gold flex items-center justify-center text-white font-black">R</div>
              <span>REOP OS</span>
            </span>

            <h2 className="text-base font-bold text-foreground capitalize hidden md:block">
              {activeTab === "overview" && "Executive Command Center"}
              {activeTab === "leads" && "Leads Management Terminal"}
              {activeTab === "pipeline" && "Sales Pipeline Kanban"}
              {activeTab === "whatsapp" && "WhatsApp Automation Control"}
              {activeTab === "inventory" && "Portfolio Properties Stock"}
            </h2>
          </div>

          {/* Quick Stats Panel */}
          <div className="flex items-center gap-4 text-xs font-semibold">
            <Badge variant="gold">Server Active</Badge>
            <span className="text-muted-foreground hidden sm:inline">OS v1.1.2</span>
          </div>
        </header>

        {/* Scrollable Dashboard Panel Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* ======================================================== */}
          {/* TAB 1: OVERVIEW ANALYTICS */}
          {/* ======================================================== */}
          {activeTab === "overview" && (
            <div className="flex flex-col gap-8">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { title: "Total Capitalized Leads", val: totalLeads, desc: "Logged in Workspace database", icon: Users },
                  { title: "Hot Priority Segment", val: hotLeads, desc: "AI Leads Score >= 80", icon: Zap, color: "text-red-500" },
                  { title: "Active WhatsApp Dialogues", val: activeConversations, desc: "Delivered status auto-replies", icon: MessageSquare, color: "text-emerald-500" },
                  { title: "Active Properties Stock", val: properties.length, desc: "GIFT City, Ahmedabad, plots", icon: Home }
                ].map((kpi, idx) => (
                  <Card key={idx} hoverGlow={false} className="p-5 flex flex-col justify-between border-border/20">
                    <div className="flex justify-between items-start mb-2.5">
                      <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-snug">
                        {kpi.title}
                      </span>
                      <kpi.icon className={`h-4 w-4 text-muted-foreground/60 ${kpi.color || ""}`} />
                    </div>
                    <span className="text-3xl font-black text-foreground">{kpi.val}</span>
                    <span className="text-[9px] text-muted-foreground font-semibold mt-1 block truncate">
                      {kpi.desc}
                    </span>
                  </Card>
                ))}
              </div>

              {/* Graphic Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Area Chart: Projected Capital Returns */}
                <div className="lg:col-span-8 glass-panel p-6 rounded-2xl border border-white/10 shadow-lg flex flex-col gap-6">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                      Workspace Transaction Volume (MoM)
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Compounded portfolio pipeline assets values
                    </p>
                  </div>
                  <AreaChart data={revenueChartData} height={200} />
                </div>

                {/* Donut Chart: Lead scoring distributions */}
                <div className="lg:col-span-4 glass-panel p-6 rounded-2xl border border-white/10 shadow-lg flex flex-col gap-6 justify-between">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                      AI Lead Scoring Ratio
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Hot Priority vs Warm Growth allocation
                    </p>
                  </div>
                  <div className="my-auto py-2">
                    <DonutChart data={leadDonutData} size={130} />
                  </div>
                </div>
              </div>

              {/* Inquiries by location Bar Chart & Recent Team activities */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Activity bar chart */}
                <div className="lg:col-span-6 glass-panel p-6 rounded-2xl border border-white/10 shadow-lg flex flex-col gap-6">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                      Inquiries Density by Hub
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Active pipeline submissions across sub-markets
                    </p>
                  </div>
                  <BarChart data={locationInquiryData} height={160} />
                </div>

                {/* Recent activity list */}
                <div className="lg:col-span-6 glass-panel p-6 rounded-2xl border border-white/10 shadow-lg flex flex-col gap-5">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    Real-time Activity Stream
                  </h3>
                  <div className="flex flex-col gap-3.5 overflow-y-auto max-h-[180px]">
                    {leads.flatMap(l => l.activityLog.map(act => ({ ...act, leadName: l.name }))).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5).map((activity, idx) => (
                      <div key={idx} className="flex gap-3 text-xs leading-relaxed border-b border-border/10 pb-3 last:border-0 last:pb-0">
                        <div className="h-5 w-5 rounded-full bg-gold/10 border border-gold/30 shrink-0 flex items-center justify-center text-gold text-[9px] font-black">
                          {idx + 1}
                        </div>
                        <div className="flex-1 flex justify-between">
                          <div>
                            <span className="font-bold text-foreground">{activity.leadName}</span>{" "}
                            <span className="text-muted-foreground">{activity.action}</span>
                          </div>
                          <span className="text-[9px] text-muted-foreground font-mono self-start ml-2 whitespace-nowrap">
                            {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: LEADS TABLE & DETAILS PANEL */}
          {/* ======================================================== */}
          {activeTab === "leads" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Leads Table */}
              <div className="lg:col-span-8 glass-panel rounded-2xl border border-white/10 shadow-lg overflow-hidden flex flex-col">
                <div className="p-5 border-b border-border/10 flex justify-between items-center bg-black/10 dark:bg-white/5">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Active Capital Leads Table
                  </span>
                  <Badge variant="gold">{leads.length} Registered Leads</Badge>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border/20 text-muted-foreground uppercase text-[10px] tracking-wider font-extrabold bg-black/5 dark:bg-white/2">
                        <th className="p-4">Lead Name</th>
                        <th className="p-4">Property Interest</th>
                        <th className="p-4 text-center">AI Lead Score</th>
                        <th className="p-4 text-center">Pipeline Stage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map((lead) => (
                        <tr
                          key={lead.id}
                          onClick={() => setSelectedLeadId(lead.id)}
                          className={`border-b border-border/10 hover:bg-black/10 dark:hover:bg-white/2 transition-colors cursor-pointer ${
                            selectedLeadId === lead.id ? "bg-gold/5 border-l-2 border-l-gold" : ""
                          }`}
                        >
                          <td className="p-4 font-bold">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-foreground">{lead.name}</span>
                              <span className="text-[10px] text-muted-foreground font-semibold font-mono">{lead.phone}</span>
                            </div>
                          </td>
                          <td className="p-4 font-semibold text-muted-foreground">
                            {lead.propertyName}
                          </td>
                          <td className="p-4 text-center">
                            <Badge variant={lead.leadQuality}>{lead.aiScore} {lead.leadQuality}</Badge>
                          </td>
                          <td className="p-4 text-center capitalize font-bold text-foreground">
                            {lead.status}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Side Lead Details & Scoring Insight */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                <Card className="border border-gold/10 p-5 shadow-lg flex flex-col gap-5 bg-gradient-to-b from-gold/5 via-transparent to-transparent">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                      Lead Profile Details
                    </span>
                    <Badge variant={activeLead?.leadQuality || "cold"}>
                      {activeLead?.aiScore || 0} Score
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-foreground">{activeLead?.name || "Select Lead"}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 font-mono">{activeLead?.email}</p>
                    <p className="text-xs text-muted-foreground font-mono">{activeLead?.phone}</p>
                  </div>

                  {/* AI Reasoning Section */}
                  <div className="glass-panel p-4 rounded-xl border border-white/5 bg-black/10 dark:bg-white/5 flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 text-gold text-[10px] uppercase font-bold tracking-widest">
                      <Zap className="h-3.5 w-3.5 text-gold animate-pulse" />
                      <span>AI Scoring Rationale</span>
                    </div>
                    <p className="text-[11px] text-foreground/90 font-mono leading-relaxed">
                      {activeLead?.aiReasoning || "No lead analytics calculated."}
                    </p>
                  </div>

                  {/* Update Pipeline Stage selector */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                      Update Pipeline Stage
                    </span>
                    <div className="grid grid-cols-5 gap-1 bg-black/10 dark:bg-white/5 p-1 rounded-lg border border-white/5">
                      {(["new", "contacted", "proposal", "negotiation", "closed"] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => updateLeadStatus(activeLead.id, st)}
                          className={`py-1 rounded text-[9px] font-bold uppercase tracking-wide cursor-pointer transition-all ${
                            activeLead?.status === st
                              ? "bg-gold text-white"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {st.substring(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Manual WhatsApp route triggers */}
                  <div className="flex flex-col gap-2.5 pt-2 border-t border-border/10">
                    <Button
                      variant="glass"
                      size="sm"
                      className="w-full text-xs font-semibold gap-2"
                      onClick={() => {
                        setActiveTab("whatsapp");
                      }}
                    >
                      <MessageSquare className="h-4 w-4" /> Trace WhatsApp History
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs font-bold text-red-500 hover:bg-red-500/10 border-red-500/20"
                      onClick={() => {
                        deleteLead(activeLead.id);
                        setSelectedLeadId(null);
                      }}
                    >
                      Delete Lead Record
                    </Button>
                  </div>
                </Card>

                <Card className="border border-white/10 p-5 shadow-lg flex flex-col gap-4 bg-card mt-6">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Inbound Lead Capture Hub</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Simulate third-party listing alerts (MagicBricks/99acres) using Gemini parsing.
                    </p>
                  </div>

                  {ingestionSuccess && (
                    <p className="text-[10px] text-emerald-500 font-semibold bg-emerald-500/15 border border-emerald-500/30 p-2 rounded text-center">
                      ✓ Lead successfully parsed & registered!
                    </p>
                  )}

                  {ingestionError && (
                    <p className="text-[10px] text-red-500 font-semibold bg-red-500/15 border border-red-500/30 p-2 rounded text-center">
                      ⚠️ {ingestionError}
                    </p>
                  )}

                  <form onSubmit={handleIngestLeadAlert} className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Alert Source
                      </label>
                      <select
                        value={inboundSource}
                        onChange={(e) => setInboundSource(e.target.value)}
                        className="glass-input h-9 px-3 text-xs text-foreground rounded-lg focus:outline-none focus:ring-1 focus:ring-gold/60 cursor-pointer"
                      >
                        <option value="magicbricks" className="bg-card text-foreground">MagicBricks Alert</option>
                        <option value="99acres" className="bg-card text-foreground">99acres Alert</option>
                        <option value="facebook_ads" className="bg-card text-foreground">Facebook Lead Ad</option>
                        <option value="direct_website" className="bg-card text-foreground">Direct Website Webform</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Raw Copy-Pasted Alert / Email
                      </label>
                      <textarea
                        value={rawInboundAlert}
                        onChange={(e) => setRawInboundAlert(e.target.value)}
                        placeholder="e.g. Hi REOP, you have a new inquiry. Inquirer Varun Patel, Mobile 9876543210. Budget: 2.2 Crore. Requirements: interested in luxury 3 BHK in Bodakdev."
                        className="glass-input min-h-[90px] p-3 text-xs text-foreground rounded-lg focus:outline-none focus:ring-1 focus:ring-gold/60 resize-none font-mono leading-relaxed"
                        required
                        disabled={isIngestingLead}
                      />
                    </div>

                    <Button type="submit" variant="gold" className="w-full text-xs font-bold gap-2 h-9" isLoading={isIngestingLead}>
                      <Zap className="h-3.5 w-3.5" /> Parse & Ingest Lead
                    </Button>
                  </form>
                </Card>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: PIPELINE KANBAN BOARD */}
          {/* ======================================================== */}
          {activeTab === "pipeline" && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto min-h-[480px]">
              {(["new", "contacted", "proposal", "negotiation", "closed"] as const).map((stage) => {
                const stageLeads = leads.filter((l) => l.status === stage);
                return (
                  <div key={stage} className="flex flex-col gap-4 min-w-[200px]">
                    {/* Stage Header */}
                    <div className="glass-panel px-4 py-2.5 rounded-lg border border-white/5 bg-black/10 dark:bg-white/5 flex justify-between items-center shrink-0">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground truncate">
                        {stage}
                      </span>
                      <span className="text-[10px] bg-gold/10 text-gold px-1.5 py-0.5 rounded font-black border border-gold/15">
                        {stageLeads.length}
                      </span>
                    </div>

                    {/* Stage List */}
                    <div className="flex-1 flex flex-col gap-3 p-1 bg-black/5 dark:bg-white/1 rounded-xl border border-white/2 overflow-y-auto max-h-[450px]">
                      {stageLeads.map((lead) => (
                        <div
                          key={lead.id}
                          onClick={() => {
                            setSelectedLeadId(lead.id);
                            setActiveTab("leads");
                          }}
                          className="glass-card p-4 rounded-xl border border-border/30 hover:border-gold/30 hover:shadow-md transition-all cursor-pointer flex flex-col gap-3 group"
                        >
                          <div>
                            <div className="flex justify-between items-start gap-2 mb-1">
                              <h4 className="font-bold text-xs text-foreground group-hover:text-gold transition-colors truncate">
                                {lead.name}
                              </h4>
                              <Badge variant={lead.leadQuality} className="text-[8px] px-1 py-0 scale-90 origin-right">
                                {lead.aiScore}
                              </Badge>
                            </div>
                            <p className="text-[9px] text-muted-foreground truncate">{lead.propertyName}</p>
                          </div>

                          <div className="flex justify-between items-center border-t border-border/10 pt-2 text-[9px] text-muted-foreground font-semibold">
                            <span>{new Date(lead.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}</span>
                            {/* Advance trigger */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const stagesOrder = ["new", "contacted", "proposal", "negotiation", "closed"] as const;
                                const currIdx = stagesOrder.indexOf(stage);
                                if (currIdx < stagesOrder.length - 1) {
                                  updateLeadStatus(lead.id, stagesOrder[currIdx + 1]);
                                }
                              }}
                              className="p-1 rounded hover:bg-gold/10 text-muted-foreground hover:text-gold transition-colors cursor-pointer shrink-0"
                              title="Advance stage"
                            >
                              <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {stageLeads.length === 0 && (
                        <div className="flex-grow flex flex-col items-center justify-center p-8 text-center text-muted-foreground text-[10px] font-semibold uppercase tracking-wider min-h-[120px]">
                          Empty Stage
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: WHATSAPP AUTOMATION LOGS */}
          {/* ======================================================== */}
          {activeTab === "whatsapp" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[500px]">
              {/* Left Column: Active Chats list */}
              <div className="lg:col-span-4 glass-panel rounded-2xl border border-white/10 shadow-lg overflow-hidden flex flex-col h-full bg-card">
                <div className="p-4 border-b border-border/10 bg-black/10 dark:bg-white/5 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Active WhatsApp Chats
                  </span>
                  <Badge variant="gold">Active</Badge>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {leads.map((lead) => {
                    const lastMsg = lead.whatsAppHistory[lead.whatsAppHistory.length - 1]?.message || "No messages";
                    return (
                      <div
                        key={lead.id}
                        onClick={() => setSelectedLeadId(lead.id)}
                        className={`p-4 border-b border-border/5 hover:bg-black/10 dark:hover:bg-white/2 transition-colors cursor-pointer flex items-center justify-between gap-4 ${
                          selectedLeadId === lead.id ? "bg-gold/5 border-l-2 border-l-gold" : ""
                        }`}
                      >
                        <div className="flex flex-col gap-1 flex-1 truncate">
                          <div className="flex justify-between items-baseline gap-2">
                            <span className="text-xs font-bold text-foreground truncate">{lead.name}</span>
                            <span className="text-[8px] text-muted-foreground shrink-0 font-mono">
                              {lead.whatsAppStatus === "replied" ? "replied" : "delivered"}
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground truncate">{lastMsg}</p>
                        </div>
                        {lead.whatsAppStatus === "replied" && (
                          <span className="h-2 w-2 rounded-full bg-gold shrink-0 animate-pulse" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Active Dialogue Panel */}
              <div className="lg:col-span-8 glass-panel rounded-2xl border border-white/10 shadow-lg overflow-hidden flex flex-col h-full bg-card">
                {/* Header info */}
                <div className="p-4 border-b border-border/10 bg-black/10 dark:bg-white/5 flex justify-between items-center shrink-0">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-foreground">{activeLead?.name || "Chat Logs"}</span>
                    <span className="text-[9px] text-muted-foreground font-semibold font-mono">WhatsApp Channel: {activeLead?.phone}</span>
                  </div>
                  <Badge variant={activeLead?.leadQuality || "cold"}>
                    Score {activeLead?.aiScore || 0}
                  </Badge>
                </div>

                {/* Dialog Messages list */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                  {activeLead?.whatsAppHistory.map((chat, idx) => {
                    const isSystem = chat.sender === "system";
                    const isAgent = chat.sender === "agent";

                    if (isSystem) {
                      return (
                        <div key={idx} className="flex justify-center my-1.5 shrink-0">
                          <span className="bg-black/20 dark:bg-white/5 border border-white/5 text-[9px] text-muted-foreground font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-inner">
                            {chat.message}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={idx}
                        className={`flex flex-col max-w-[70%] gap-1 ${isAgent ? "self-end items-end" : "self-start items-start"}`}
                      >
                        <div
                          className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                            isAgent
                              ? "bg-gold text-white rounded-tr-none shadow-md border border-gold/30"
                              : "glass-card border border-white/5 text-foreground rounded-tl-none"
                          }`}
                        >
                          {chat.message}
                        </div>
                        <span className="text-[8px] text-muted-foreground font-semibold font-mono px-1">
                          {new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })}

                  {(!activeLead || activeLead.whatsAppHistory.length === 0) && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                      No Message History Active
                    </div>
                  )}
                </div>

                {/* Send Chat input box */}
                <form
                  onSubmit={handleSendWhatsApp}
                  className="p-3 border-t border-border/10 bg-black/10 dark:bg-white/5 flex gap-2 shrink-0"
                >
                  <input
                    type="text"
                    placeholder="Type official WhatsApp response..."
                    value={whatsAppInput}
                    onChange={(e) => setWhatsAppInput(e.target.value)}
                    className="glass-input h-10 px-3 flex-1 rounded-lg text-xs placeholder:text-muted-foreground/60 text-foreground focus:outline-none focus:ring-1 focus:ring-gold/60"
                    disabled={!activeLead}
                  />
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`h-10 w-10 p-0 rounded-lg shrink-0 flex items-center justify-center border transition-all cursor-pointer ${
                      isListening
                        ? "bg-red-500/20 border-red-500 text-red-500 animate-pulse"
                        : "bg-white/10 dark:bg-white/5 border-white/10 hover:border-gold/30 hover:text-gold text-muted-foreground"
                    }`}
                    title="Dictate response"
                    disabled={!activeLead}
                  >
                    {isListening ? (
                      <div className="relative flex items-center justify-center">
                        <Mic className="h-4 w-4" />
                        <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-red-500 rounded-full animate-ping" />
                      </div>
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </button>
                  <Button
                    type="submit"
                    variant="gold"
                    size="sm"
                    className="h-10 w-10 p-0 rounded-lg shrink-0"
                    disabled={!whatsAppInput.trim() || !activeLead}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: INVENTORY MANAGER */}
          {/* ======================================================== */}
          {activeTab === "inventory" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Properties stock list */}
              <div className="lg:col-span-8 glass-panel rounded-2xl border border-white/10 shadow-lg overflow-hidden flex flex-col bg-card">
                <div className="p-5 border-b border-border/10 flex justify-between items-center bg-black/10 dark:bg-white/5">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Active Stock Assets Portfolio
                  </span>
                  <Badge variant="gold">{properties.length} Items Listed</Badge>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border/20 text-muted-foreground uppercase text-[10px] tracking-wider font-extrabold bg-black/5 dark:bg-white/2">
                        <th className="p-4">Property Title</th>
                        <th className="p-4">Location</th>
                        <th className="p-4">Ask Value</th>
                        <th className="p-4 text-center">Projected ROI</th>
                        <th className="p-4 text-center">Operator Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {properties.map((prop) => (
                        <tr key={prop.id} className="border-b border-border/10 hover:bg-black/10 dark:hover:bg-white/2 transition-colors">
                          <td className="p-4 font-bold">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-foreground">{prop.title}</span>
                              <span className="text-[10px] text-muted-foreground uppercase font-bold font-mono">{prop.type} • {prop.area}</span>
                            </div>
                          </td>
                          <td className="p-4 text-muted-foreground">
                            {prop.location} ({prop.subLocation.split(",")[0]})
                          </td>
                          <td className="p-4 font-bold text-foreground">
                            {formatINR(prop.price)}
                          </td>
                          <td className="p-4 text-center text-emerald-500 font-bold">
                            +{prop.roi}%
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => deleteProperty(prop.id)}
                              className="p-1.5 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors cursor-pointer inline-flex items-center"
                              title="Delete from stock"
                            >
                              <Trash2 className="h-4.5 w-4.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Add Property Form */}
              <div className="lg:col-span-4">
                <Card className="border border-gold/10 p-5 shadow-lg flex flex-col gap-4">
                  <div>
                    <h3 className="text-base font-bold text-foreground">Add New Stock Listing</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Inject a new premium asset into the public portfolio.
                    </p>
                  </div>

                  {inventorySuccess && (
                    <p className="text-[10px] text-emerald-500 font-semibold bg-emerald-500/15 border border-emerald-500/30 p-2.5 rounded-lg text-center animate-pulse">
                      ✓ Stock Listing added successfully! Syncing index...
                    </p>
                  )}

                  <form onSubmit={handleAddPropertySubmit} className="flex flex-col gap-3.5">
                    <Input
                      label="Property Name"
                      placeholder="e.g. Signature Business Park"
                      value={propTitle}
                      onChange={(e) => setPropTitle(e.target.value)}
                      required
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Location Hub
                        </label>
                        <select
                          value={propLocation}
                          onChange={(e) => setPropLocation(e.target.value)}
                          className="glass-input h-11 px-3 text-sm text-foreground rounded-lg focus:outline-none focus:ring-1 focus:ring-gold/60 cursor-pointer"
                        >
                          <option value="GIFT City" className="bg-card text-foreground">GIFT City</option>
                          <option value="Bodakdev" className="bg-card text-foreground">Bodakdev</option>
                          <option value="S.G. Highway" className="bg-card text-foreground">S.G. Highway</option>
                          <option value="Sanand" className="bg-card text-foreground">Sanand</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Zoning Type
                        </label>
                        <select
                          value={propType}
                          onChange={(e) => setPropType(e.target.value as Property["type"])}
                          className="glass-input h-11 px-3 text-sm text-foreground rounded-lg focus:outline-none focus:ring-1 focus:ring-gold/60 cursor-pointer"
                        >
                          <option value="apartment" className="bg-card text-foreground">Apartment</option>
                          <option value="villa" className="bg-card text-foreground">Villa</option>
                          <option value="office" className="bg-card text-foreground">Office</option>
                          <option value="plot" className="bg-card text-foreground">Plot</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        type="number"
                        label="Price Ask (INR)"
                        placeholder="e.g. 15000000 (1.5Cr)"
                        value={propPrice}
                        onChange={(e) => setPropPrice(e.target.value)}
                        required
                      />
                      <Input
                        label="Total Area"
                        placeholder="e.g. 2,450 sq.ft"
                        value={propArea}
                        onChange={(e) => setPropArea(e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Project Developer"
                        placeholder="e.g. Adani Realty"
                        value={propDeveloper}
                        onChange={(e) => setPropDeveloper(e.target.value)}
                        required
                      />
                      <div className="grid grid-cols-2 gap-1.5">
                        <Input
                          type="number"
                          label="Beds"
                          value={propBeds}
                          onChange={(e) => setPropBeds(e.target.value)}
                          disabled={propType === "office" || propType === "plot"}
                        />
                        <Input
                          type="number"
                          label="Baths"
                          value={propBaths}
                          onChange={(e) => setPropBaths(e.target.value)}
                          disabled={propType === "office" || propType === "plot"}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Property Cover Image
                      </label>
                      <div className="relative group cursor-pointer border border-dashed border-white/20 hover:border-gold/50 rounded-lg p-3 transition-all duration-300 bg-black/20 dark:bg-white/2 hover:bg-black/30 dark:hover:bg-white/5">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setSelectedFile(file);
                              setImagePreview(URL.createObjectURL(file));
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 font-bold"
                        />
                        {imagePreview ? (
                          <div className="relative h-24 w-full rounded overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={imagePreview}
                              alt="Upload preview"
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-[10px] text-white font-bold uppercase tracking-wider">Change Image</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-2 text-muted-foreground gap-1.5">
                            <Upload className="h-5 w-5 text-gold/60" />
                            <span className="text-[10px] uppercase font-bold tracking-wider">Select Image File</span>
                            <span className="text-[9px] text-muted-foreground/60">Supports PNG, JPG, WebP</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <Textarea
                      label="Property Description"
                      placeholder="Brief architectural details..."
                      value={propDescription}
                      onChange={(e) => setPropDescription(e.target.value)}
                    />

                    <Button type="submit" variant="gold" className="w-full mt-2 font-bold gap-2" isLoading={isUploadingImage}>
                      <Plus className="h-4.5 w-4.5" /> Publish Stock Listing
                    </Button>
                  </form>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
