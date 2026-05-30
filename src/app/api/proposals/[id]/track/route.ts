import { NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Proposal/Lead ID is required." },
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

    // 1. Fetch the lead
    const { data: lead, error: fetchError } = await dbClient
      .from("leads")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !lead) {
      console.error("Proposal track: Lead not found or fetch error:", fetchError);
      return NextResponse.json(
        { error: "Corresponding lead record not found." },
        { status: 404 }
      );
    }

    const timestamp = new Date().toISOString();

    // 2. Append View alert log items
    const currentHistory = Array.isArray(lead.whatsapp_history) ? lead.whatsapp_history : [];
    const currentActivity = Array.isArray(lead.activity_log) ? lead.activity_log : [];

    // Avoid double logging alerts if page reloads within 2 minutes
    const lastAlert = currentHistory.slice().reverse().find(
      (m: { sender: string; message: string }) => 
        m.sender === "system" && m.message.includes("opened their proposal")
    );

    let shouldAlertSystem = true;
    if (lastAlert) {
      const lastTime = new Date(lastAlert.timestamp).getTime();
      const diffMin = (Date.now() - lastTime) / 1000 / 60;
      if (diffMin < 2) {
        shouldAlertSystem = false;
      }
    }

    const updatedActivity = [
      ...currentActivity,
      {
        action: `Client opened proposal micro-site`,
        timestamp
      }
    ];

    let updatedHistory = currentHistory;
    if (shouldAlertSystem) {
      updatedHistory = [
        ...currentHistory,
        {
          sender: "system",
          message: `🔔 SYSTEM ALERT: Client ${lead.name} has opened their proposal micro-site!`,
          timestamp
        }
      ];
    }

    // 3. Save updates back to database
    const { error: updateError } = await dbClient
      .from("leads")
      .update({
        whatsapp_history: updatedHistory,
        activity_log: updatedActivity,
        whatsapp_status: "replied" // Flag for dashboard alert
      })
      .eq("id", id);

    if (updateError) {
      console.error("Proposal track: failed to update lead logs:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Proposal tracking error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
