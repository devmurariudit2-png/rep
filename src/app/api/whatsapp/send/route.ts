import { NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";

interface OutboundMessageRequest {
  leadId: string;
  message: string;
  sender: "agent" | "system";
}

export async function POST(req: Request) {
  try {
    const payload: OutboundMessageRequest = await req.json();
    const { leadId, message, sender = "agent" } = payload;

    if (!leadId || !message) {
      return NextResponse.json(
        { error: "leadId and message are required." },
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

    // 1. Fetch the lead record
    const { data: lead, error: fetchError } = await dbClient
      .from("leads")
      .select("*")
      .eq("id", leadId)
      .single();

    if (fetchError || !lead) {
      console.error("Error fetching lead for manual send:", fetchError);
      return NextResponse.json(
        { error: "Lead not found or fetch failed." },
        { status: 404 }
      );
    }

    const timestamp = new Date().toISOString();
    const newMsg = {
      sender,
      message,
      timestamp
    };

    const currentHistory = Array.isArray(lead.whatsapp_history)
      ? lead.whatsapp_history
      : [];
    const updatedHistory = [...currentHistory, newMsg];

    const currentActivityLog = Array.isArray(lead.activity_log)
      ? lead.activity_log
      : [];
    const updatedActivityLog = [
      ...currentActivityLog,
      { 
        action: `Sent manual message (Auto-Pilot disabled): "${message.substring(0, 30)}${message.length > 30 ? "..." : ""}"`, 
        timestamp 
      }
    ];

    // Update lead database entry: disable autopilot and add message
    const { data: updatedLead, error: updateError } = await dbClient
      .from("leads")
      .update({
        whatsapp_history: updatedHistory,
        whatsapp_status: "delivered",
        autopilot: false, // Turn off autopilot on manual broker intervention
        activity_log: updatedActivityLog
      })
      .eq("id", leadId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating lead on manual send:", updateError);
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      lead: updatedLead
    });
  } catch (err: unknown) {
    console.error("Manual message send processing error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
