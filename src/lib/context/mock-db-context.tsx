"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { mockProperties, Property } from "@/data/mock-properties";
import { mockLeads, Lead, WhatsAppMessage } from "@/data/mock-leads";
import { supabase } from "@/lib/supabase";

export interface User {
  name: string;
  email: string;
  role: "broker" | "builder" | "admin" | "client";
}

interface MockDbContextType {
  properties: Property[];
  leads: Lead[];
  currentUser: User | null;
  isLoading: boolean;
  addLead: (leadData: Omit<Lead, "id" | "createdAt" | "aiScore" | "leadQuality" | "aiReasoning" | "whatsAppStatus" | "whatsAppHistory" | "activityLog">) => void;
  updateLeadStatus: (leadId: string, status: Lead["status"]) => void;
  deleteLead: (leadId: string) => void;
  addProperty: (property: Property) => void;
  deleteProperty: (propertyId: string) => void;
  sendWhatsAppMessage: (leadId: string, messageText: string, sender: "agent" | "system") => void;
  login: (email: string, role: User["role"], name?: string) => Promise<boolean>;
  signup: (name: string, email: string, role: User["role"]) => Promise<boolean>;
  logout: () => void;
}

const MockDbContext = createContext<MockDbContextType | undefined>(undefined);

// ========================================================
// FILE SCOPE STATIC PURE HELPERS
// (Kept outside component to comply with React 19 rendering purity checkers)
// ========================================================

function generateUUID(): string {
  if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function generateNewLead(
  leadData: Omit<Lead, "id" | "createdAt" | "aiScore" | "leadQuality" | "aiReasoning" | "whatsAppStatus" | "whatsAppHistory" | "activityLog">
): Lead {
  const id = generateUUID();
  const createdAt = new Date().toISOString();
  
  const isGIFT = leadData.propertyName.includes("GIFT");
  const isVilla = leadData.propertyName.includes("Villa") || leadData.propertyName.includes("Groves");
  
  const aiScore = isGIFT ? Math.floor(Math.random() * 15) + 85  // GIFT is hot (85-99)
                         : isVilla ? Math.floor(Math.random() * 20) + 70 // Villa warm-hot (70-89)
                                   : Math.floor(Math.random() * 40) + 40; // Other (40-79)

  const leadQuality = aiScore >= 80 ? "hot" : aiScore >= 50 ? "warm" : "cold";
  const aiReasoning = `Auto-analyzed lead profile. Interested in ${leadData.propertyName}. Location segment matches ${isGIFT ? "GIFT City High-Growth zone" : "Premium Residential district"}. High response index calculated.`;

  return {
    ...leadData,
    id,
    createdAt,
    aiScore,
    leadQuality,
    aiReasoning,
    status: "new",
    whatsAppStatus: "delivered",
    whatsAppHistory: [
      {
        sender: "system",
        message: "⚡ Instant Lead Capture auto-responder triggered.",
        timestamp: new Date().toISOString()
      },
      {
        sender: "agent",
        message: `Namaste ${leadData.name}! Thank you for your inquiry regarding "${leadData.propertyName}". We have recorded your interest. An automated brochure and ROI prospectus is being generated for you.`,
        timestamp: new Date(Date.now() + 1000).toISOString()
      }
    ],
    activityLog: [
      { action: `Submitted inquiry form for ${leadData.propertyName}`, timestamp: createdAt },
      { action: "AI Lead Scoring: Evaluated as " + leadQuality.toUpperCase(), timestamp: createdAt },
      { action: "WhatsApp Auto-Reply triggered", timestamp: new Date(Date.now() + 1000).toISOString() }
    ]
  };
}

function generateWhatsAppReplyHelper(lead: Lead): Lead {
  const timestamp = new Date().toISOString();
  const replyMsg: WhatsAppMessage = {
    sender: "lead",
    message: "Thanks for the details! Can you tell me if there are any flexible payment milestones? I want to connect with your specialist.",
    timestamp
  };

  return {
    ...lead,
    whatsAppStatus: "replied",
    whatsAppHistory: [...lead.whatsAppHistory, replyMsg],
    activityLog: [
      ...lead.activityLog,
      { action: "Lead sent a WhatsApp response", timestamp }
    ]
  };
}

function updateLeadStatusHelper(lead: Lead, status: Lead["status"]): Lead {
  return {
    ...lead,
    status,
    activityLog: [
      ...lead.activityLog,
      { action: `Status updated to ${status.toUpperCase()}`, timestamp: new Date().toISOString() }
    ]
  };
}

function sendWhatsAppMessageHelper(lead: Lead, messageText: string, sender: "agent" | "system"): Lead {
  const timestamp = new Date().toISOString();
  const newMsg: WhatsAppMessage = {
    sender,
    message: messageText,
    timestamp
  };
  return {
    ...lead,
    whatsAppStatus: "delivered",
    whatsAppHistory: [...lead.whatsAppHistory, newMsg],
    activityLog: [
      ...lead.activityLog,
      { action: `Sent WhatsApp message: "${messageText.substring(0, 30)}..."`, timestamp }
    ]
  };
}

export function MockDbProvider({ children }: { children: React.ReactNode }) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to refresh Supabase session
  const refreshSupabaseSession = async () => {
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (profile) {
        setCurrentUser({
          name: profile.name,
          email: profile.email,
          role: profile.role as User["role"]
        });
      } else {
        setCurrentUser({
          name: user.user_metadata?.name || user.email?.split("@")[0] || "Operator",
          email: user.email || "",
          role: (user.user_metadata?.role || "broker") as User["role"]
        });
      }
    } else {
      setCurrentUser(null);
    }
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      if (supabase) {
        try {
          // 1. Refresh auth state
          await refreshSupabaseSession();

          // 2. Fetch properties
          const { data: props, error: propsErr } = await supabase
            .from("properties")
            .select("*")
            .order("created_at", { ascending: false });

          if (!propsErr && props) {
            const mappedProps = props.map(p => ({
              id: p.id,
              title: p.title,
              type: p.type as Property["type"],
              price: Number(p.price),
              location: p.location,
              subLocation: p.sub_location,
              beds: p.beds ?? undefined,
              baths: p.baths ?? undefined,
              area: p.area,
              images: p.images,
              roi: Number(p.roi),
              rentalYield: p.rental_yield ? Number(p.rental_yield) : undefined,
              description: p.description,
              amenities: p.amenities,
              features: p.features,
              projectedAppreciation5Yr: Number(p.projected_appreciation_5yr),
              address: p.address,
              developer: p.developer
            }));
            setProperties(mappedProps);
          } else {
            setProperties([]);
          }

          // 3. Fetch leads
          const { data: leadsData, error: leadsErr } = await supabase
            .from("leads")
            .select("*")
            .order("created_at", { ascending: false });

          if (!leadsErr && leadsData) {
            const mappedLeads = leadsData.map(l => ({
              id: l.id,
              name: l.name,
              email: l.email,
              phone: l.phone,
              interestedPropertyId: l.interested_property_id || "",
              propertyName: l.property_name,
              status: l.status as Lead["status"],
              aiScore: Number(l.ai_score),
              leadQuality: l.lead_quality as Lead["leadQuality"],
              aiReasoning: l.ai_reasoning,
              createdAt: l.created_at,
              whatsAppStatus: l.whatsapp_status as Lead["whatsAppStatus"],
              whatsAppHistory: l.whatsapp_history as WhatsAppMessage[],
              activityLog: l.activity_log
            }));
            setLeads(mappedLeads);
          } else {
            setLeads([]);
          }
        } catch (err) {
          console.error("Error initializing Supabase backend:", err);
        }
      } else {
        // Fallback: LocalStorage
        const storedProperties = localStorage.getItem("reop-properties");
        if (storedProperties) {
          setProperties(JSON.parse(storedProperties));
        } else {
          localStorage.setItem("reop-properties", JSON.stringify(mockProperties));
          setProperties(mockProperties);
        }

        const storedLeads = localStorage.getItem("reop-leads");
        if (storedLeads) {
          setLeads(JSON.parse(storedLeads));
        } else {
          localStorage.setItem("reop-leads", JSON.stringify(mockLeads));
          setLeads(mockLeads);
        }

        const storedUser = localStorage.getItem("reop-user");
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        } else {
          const defaultUser: User = {
            name: "Devam Shah",
            email: "devam@reop.in",
            role: "admin"
          };
          localStorage.setItem("reop-user", JSON.stringify(defaultUser));
          setCurrentUser(defaultUser);
        }
      }
      setIsLoading(false);
    };

    const timer = setTimeout(loadData, 0);
    return () => clearTimeout(timer);
  }, []);

  // Listen for Supabase Auth updates dynamically
  useEffect(() => {
    if (!supabase) return;
    const client = supabase;

    const { data: { subscription } } = client.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile } = await client
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        
        if (profile) {
          setCurrentUser({
            name: profile.name,
            email: profile.email,
            role: profile.role as User["role"]
          });
        } else {
          setCurrentUser({
            name: session.user.user_metadata?.name || session.user.email?.split("@")[0] || "Operator",
            email: session.user.email || "",
            role: (session.user.user_metadata?.role || "broker") as User["role"]
          });
        }
      } else {
        setCurrentUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Helpers to persist (LocalStorage fallback path)
  const savePropertiesState = (updatedProps: Property[]) => {
    setProperties(updatedProps);
    localStorage.setItem("reop-properties", JSON.stringify(updatedProps));
  };

  const saveLeadsState = (updatedLeads: Lead[]) => {
    setLeads(updatedLeads);
    localStorage.setItem("reop-leads", JSON.stringify(updatedLeads));
  };

  // Add lead and simulate WhatsApp Auto-Reply and AI Score
  const addLead = async (leadData: Omit<Lead, "id" | "createdAt" | "aiScore" | "leadQuality" | "aiReasoning" | "whatsAppStatus" | "whatsAppHistory" | "activityLog">) => {
    const newLead = generateNewLead(leadData);

    if (supabase) {
      // Supabase write
      const leadPayload = {
        id: newLead.id,
        name: newLead.name,
        email: newLead.email,
        phone: newLead.phone,
        interested_property_id: newLead.interestedPropertyId || null,
        property_name: newLead.propertyName,
        status: newLead.status,
        ai_score: newLead.aiScore,
        lead_quality: newLead.leadQuality,
        ai_reasoning: newLead.aiReasoning,
        whatsapp_status: newLead.whatsAppStatus,
        whatsapp_history: newLead.whatsAppHistory,
        activity_log: newLead.activityLog,
        created_at: newLead.createdAt
      };

      // Optimistic client update
      setLeads(prev => [newLead, ...prev]);

      const { error } = await supabase.from("leads").insert(leadPayload);
      if (error) {
        console.error("Error writing new lead to Supabase:", error);
      }
    } else {
      // LocalStorage write
      const updatedLeads = [newLead, ...leads];
      saveLeadsState(updatedLeads);
    }

    // Simulate lead reply after 5 seconds to showcase "WhatsApp replies received" in real time!
    setTimeout(() => {
      simulateLeadWhatsAppReply(newLead.id);
    }, 5000);
  };

  const simulateLeadWhatsAppReply = async (leadId: string) => {
    if (supabase) {
      const { data: leadRecord, error: fetchError } = await supabase
        .from("leads")
        .select("*")
        .eq("id", leadId)
        .single();
      
      if (fetchError || !leadRecord) return;

      const currentLead: Lead = {
        id: leadRecord.id,
        name: leadRecord.name,
        email: leadRecord.email,
        phone: leadRecord.phone,
        interestedPropertyId: leadRecord.interested_property_id || "",
        propertyName: leadRecord.property_name,
        status: leadRecord.status as Lead["status"],
        aiScore: Number(leadRecord.ai_score),
        leadQuality: leadRecord.lead_quality as Lead["leadQuality"],
        aiReasoning: leadRecord.ai_reasoning,
        createdAt: leadRecord.created_at,
        whatsAppStatus: leadRecord.whatsapp_status as Lead["whatsAppStatus"],
        whatsAppHistory: leadRecord.whatsapp_history as WhatsAppMessage[],
        activityLog: leadRecord.activity_log
      };

      const updatedLead = generateWhatsAppReplyHelper(currentLead);

      // Optimistic update
      setLeads(prev => prev.map(l => l.id === leadId ? updatedLead : l));

      const { error } = await supabase
        .from("leads")
        .update({
          whatsapp_status: updatedLead.whatsAppStatus,
          whatsapp_history: updatedLead.whatsAppHistory,
          activity_log: updatedLead.activityLog
        })
        .eq("id", leadId);

      if (error) {
        console.error("Error writing simulated WhatsApp reply to Supabase:", error);
      }
    } else {
      const saved = localStorage.getItem("reop-leads");
      if (!saved) return;
      const currentLeads: Lead[] = JSON.parse(saved);
      const leadIndex = currentLeads.findIndex((l) => l.id === leadId);
      if (leadIndex === -1) return;

      const updatedLead = generateWhatsAppReplyHelper(currentLeads[leadIndex]);
      const updatedLeads = [...currentLeads];
      updatedLeads[leadIndex] = updatedLead;
      saveLeadsState(updatedLeads);
    }
  };

  const updateLeadStatus = async (leadId: string, status: Lead["status"]) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    const updatedLead = updateLeadStatusHelper(lead, status);
    setLeads(prev => prev.map(l => l.id === leadId ? updatedLead : l));

    if (supabase) {
      const { error } = await supabase
        .from("leads")
        .update({
          status: updatedLead.status,
          activity_log: updatedLead.activityLog
        })
        .eq("id", leadId);

      if (error) {
        console.error("Error updating lead status in Supabase:", error);
      }
    } else {
      const updated = leads.map((l) => l.id === leadId ? updatedLead : l);
      saveLeadsState(updated);
    }
  };

  const deleteLead = async (leadId: string) => {
    setLeads(prev => prev.filter((l) => l.id !== leadId));

    if (supabase) {
      const { error } = await supabase
        .from("leads")
        .delete()
        .eq("id", leadId);
      if (error) {
        console.error("Error deleting lead from Supabase:", error);
      }
    } else {
      const updated = leads.filter((l) => l.id !== leadId);
      saveLeadsState(updated);
    }
  };

  const addProperty = async (property: Property) => {
    setProperties(prev => [property, ...prev]);

    if (supabase) {
      const { error } = await supabase.from("properties").insert({
        id: property.id,
        title: property.title,
        type: property.type,
        price: property.price,
        location: property.location,
        sub_location: property.subLocation,
        beds: property.beds || null,
        baths: property.baths || null,
        area: property.area,
        images: property.images,
        roi: property.roi,
        rental_yield: property.rentalYield || null,
        description: property.description,
        amenities: property.amenities,
        features: property.features,
        projected_appreciation_5yr: property.projectedAppreciation5Yr,
        address: property.address,
        developer: property.developer
      });

      if (error) {
        console.error("Error adding property to Supabase:", error);
      }
    } else {
      const updated = [property, ...properties];
      savePropertiesState(updated);
    }
  };

  const deleteProperty = async (propertyId: string) => {
    setProperties(prev => prev.filter((p) => p.id !== propertyId));

    if (supabase) {
      const { error } = await supabase
        .from("properties")
        .delete()
        .eq("id", propertyId);
      if (error) {
        console.error("Error deleting property from Supabase:", error);
      }
    } else {
      const updated = properties.filter((p) => p.id !== propertyId);
      savePropertiesState(updated);
    }
  };

  const sendWhatsAppMessage = async (leadId: string, messageText: string, sender: "agent" | "system" = "agent") => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    const updatedLead = sendWhatsAppMessageHelper(lead, messageText, sender);
    setLeads(prev => prev.map((l) => l.id === leadId ? updatedLead : l));

    if (supabase) {
      const { error } = await supabase
        .from("leads")
        .update({
          whatsapp_status: updatedLead.whatsAppStatus,
          whatsapp_history: updatedLead.whatsAppHistory,
          activity_log: updatedLead.activityLog
        })
        .eq("id", leadId);

      if (error) {
        console.error("Error sending WhatsApp message to Supabase:", error);
      }
    } else {
      const updated = leads.map((l) => l.id === leadId ? updatedLead : l);
      saveLeadsState(updated);
    }
  };

  const login = async (email: string, role: User["role"], name?: string): Promise<boolean> => {
    if (supabase) {
      const defaultPassword = "password123";
      // 1. Try to sign in
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: defaultPassword
      });

      if (error) {
        // 2. If user does not exist, trigger auto signup
        const { error: signUpErr } = await supabase.auth.signUp({
          email,
          password: defaultPassword,
          options: {
            data: {
              name: name || email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
              role
            }
          }
        });
        if (signUpErr) throw signUpErr;
      }
      
      await refreshSupabaseSession();
      return true;
    } else {
      // LocalStorage mock login
      const newUser: User = {
        name: name || email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
        email,
        role
      };
      setCurrentUser(newUser);
      localStorage.setItem("reop-user", JSON.stringify(newUser));
      return true;
    }
  };

  const signup = async (name: string, email: string, role: User["role"]): Promise<boolean> => {
    if (supabase) {
      const defaultPassword = "password123";
      const { error } = await supabase.auth.signUp({
        email,
        password: defaultPassword,
        options: {
          data: {
            name,
            role
          }
        }
      });
      if (error) throw error;
      await refreshSupabaseSession();
      return true;
    } else {
      // LocalStorage mock signup
      const newUser: User = { name, email, role };
      setCurrentUser(newUser);
      localStorage.setItem("reop-user", JSON.stringify(newUser));
      return true;
    }
  };

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setCurrentUser(null);
    } else {
      setCurrentUser(null);
      localStorage.removeItem("reop-user");
    }
  };

  return (
    <MockDbContext.Provider
      value={{
        properties,
        leads,
        currentUser,
        isLoading,
        addLead,
        updateLeadStatus,
        deleteLead,
        addProperty,
        deleteProperty,
        sendWhatsAppMessage,
        login,
        signup,
        logout
      }}
    >
      {children}
    </MockDbContext.Provider>
  );
}

export function useMockDb() {
  const context = useContext(MockDbContext);
  if (context === undefined) {
    throw new Error("useMockDb must be used within a MockDbProvider");
  }
  return context;
}
