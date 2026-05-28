import { NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";

interface IncomingMessage {
  phone: string;
  name: string;
  message: string;
}

// Helper to sanitize phone numbers for robust matching (compares last 10 digits)
function getSanitizedNumber(phone: string): string {
  return phone.replace(/\D/g, "");
}

function matchPhoneNumbers(num1: string, num2: string): boolean {
  const s1 = getSanitizedNumber(num1);
  const s2 = getSanitizedNumber(num2);
  if (s1.length >= 10 && s2.length >= 10) {
    return s1.substring(s1.length - 10) === s2.substring(s2.length - 10);
  }
  return s1 === s2;
}

export async function POST(req: Request) {
  try {
    const payload: IncomingMessage = await req.json();
    const { phone, name, message } = payload;

    if (!phone || !name || !message) {
      return NextResponse.json(
        { error: "Phone, name, and message are required." },
        { status: 400 }
      );
    }

    const dbClient = supabaseAdmin || supabase;

    if (!dbClient) {
      return NextResponse.json(
        { error: "Supabase connection is not initialized." },
        { status: 500 }
      );
    }

    // 1. Fetch all leads to compare sanitized phone numbers
    const { data: leads, error: fetchError } = await dbClient
      .from("leads")
      .select("*");

    if (fetchError) {
      console.error("Error fetching leads for webhook:", fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    const matchedLead = leads?.find((l) => matchPhoneNumbers(l.phone, phone));

    const timestamp = new Date().toISOString();
    const newHistoryMsg = {
      sender: "lead",
      message: message,
      timestamp
    };

    if (matchedLead) {
      // LEAD EXISTS: Update history, status, activity log, and AI scoring Heuristics
      const currentHistory = Array.isArray(matchedLead.whatsapp_history)
        ? matchedLead.whatsapp_history
        : [];
      
      const updatedHistory = [...currentHistory, newHistoryMsg];

      // Simple keyword heuristic for scoring updates on inbound message
      const text = message.toLowerCase();
      let scoreBoost = 2; // general reply is positive indicator
      if (text.includes("visit") || text.includes("schedule") || text.includes("meet")) {
        scoreBoost = 15;
      } else if (text.includes("price") || text.includes("cost") || text.includes("budget")) {
        scoreBoost = 10;
      } else if (text.includes("roi") || text.includes("yield") || text.includes("return")) {
        scoreBoost = 8;
      } else if (text.includes("brochure") || text.includes("pdf") || text.includes("details")) {
        scoreBoost = 5;
      }

      const currentScore = matchedLead.ai_score ?? 50;
      const newScore = Math.min(100, Math.max(0, currentScore + scoreBoost));
      const newQuality = newScore >= 80 ? "hot" : newScore >= 50 ? "warm" : "cold";
      
      const newActivity = {
        action: `Received WhatsApp message: "${message.substring(0, 30)}${message.length > 30 ? "..." : ""}"`,
        timestamp
      };
      
      const currentActivityLog = Array.isArray(matchedLead.activity_log)
        ? matchedLead.activity_log
        : [];
      
      const updatedActivityLog = [...currentActivityLog, newActivity];

      const { data: updatedLead, error: updateError } = await dbClient
        .from("leads")
        .update({
          whatsapp_history: updatedHistory,
          whatsapp_status: "replied",
          ai_score: newScore,
          lead_quality: newQuality,
          activity_log: updatedActivityLog
        })
        .eq("id", matchedLead.id)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating lead on webhook:", updateError);
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        action: "updated",
        lead: updatedLead
      });
    } else {
      // NEW LEAD: Auto-generate lead profile from WhatsApp message
      // 1. Fetch a property to associate with or use a generic inquiry
      const { data: properties } = await dbClient
        .from("properties")
        .select("id, title")
        .limit(1);
      
      const assocPropertyId = properties?.[0]?.id || null;
      const assocPropertyName = properties?.[0]?.title || "General Portfolio Inquiry";

      const newLeadId = crypto.randomUUID();
      
      const text = message.toLowerCase();
      let initialScore = 60; // default initial score for WhatsApp inbound
      if (text.includes("visit") || text.includes("schedule")) {
        initialScore = 85;
      } else if (text.includes("price") || text.includes("roi")) {
        initialScore = 75;
      }
      
      const initialQuality = initialScore >= 80 ? "hot" : "warm";
      
      const leadPayload = {
        id: newLeadId,
        name: name,
        email: `${name.toLowerCase().replace(/\s+/g, ".")}@whatsapp.in`,
        phone: phone,
        interested_property_id: assocPropertyId,
        property_name: assocPropertyName,
        status: "new",
        ai_score: initialScore,
        lead_quality: initialQuality,
        ai_reasoning: `Auto-captured via inbound WhatsApp message channel. Initial interest parsed: "${message.substring(0, 50)}".`,
        whatsapp_status: "replied",
        whatsapp_history: [newHistoryMsg],
        activity_log: [
          { action: "Lead captured via WhatsApp Webhook Channel", timestamp },
          { action: `Assigned initial AI Score: ${initialScore}`, timestamp }
        ],
        created_at: timestamp
      };

      const { data: createdLead, error: insertError } = await dbClient
        .from("leads")
        .insert(leadPayload)
        .select()
        .single();

      if (insertError) {
        console.error("Error creating lead on webhook:", insertError);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        action: "created",
        lead: createdLead
      });
    }
  } catch (err: unknown) {
    console.error("Webhook processing error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
