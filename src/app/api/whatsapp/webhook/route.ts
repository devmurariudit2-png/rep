import { NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

interface PropertyDetails {
  title: string;
  type: string;
  price: number;
  location: string;
  sub_location: string;
  beds: number | null;
  baths: number | null;
  area: string;
  roi: number;
  rental_yield: number | null;
  developer: string;
  address: string;
  amenities: string[];
  features: string[];
  description: string;
}

// Helper to generate autopilot replies using Gemini with robust offline keyword fallbacks
async function generateAutoPilotReply(
  message: string,
  clientName: string,
  property: PropertyDetails | null,
  apiKey?: string
): Promise<{ reply: string; escalate: boolean }> {
  const text = message.toLowerCase();
  
  // Heuristic checks for escalation request
  const isEscalationRequested =
    text.includes("visit") ||
    text.includes("schedule") ||
    text.includes("meet") ||
    text.includes("call me") ||
    text.includes("talk to") ||
    text.includes("number") ||
    text.includes("discount") ||
    text.includes("negotiate") ||
    text.includes("appointment") ||
    text.includes("viewing");

  const propertyInfo = property
    ? `
Property Context:
Title: ${property.title}
Type: ${property.type}
Price: ₹${(Number(property.price) / 10000000).toFixed(2)} Cr (₹${Number(property.price).toLocaleString("en-IN")})
Location: ${property.location}, ${property.sub_location}
Specs: ${property.beds ? property.beds + " BHK" : "N/A"} | ${property.baths ? property.baths + " Baths" : "N/A"} | ${property.area}
Appreciation Rate (ROI): ${property.roi}% projected annual appreciation
Rental Yield: ${property.rental_yield ? property.rental_yield + "%" : "N/A"}
Developer: ${property.developer}
Address: ${property.address}
Amenities: ${property.amenities?.join(", ") || "None"}
Features: ${property.features?.join(", ") || "None"}
Description: ${property.description}
`
    : "No property details available.";

  // 1. If Gemini is available, use live LLM parsing
  if (apiKey && apiKey !== "your-gemini-api-key-here" && apiKey !== "") {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: `You are REOP AI, an automated WhatsApp real estate assistant acting on behalf of the broker.
You are chatting with a client named "${clientName}" over WhatsApp.

Use the following property context to answer their question:
${propertyInfo}

Rules:
1. Answer the question directly and professionally. Keep the reply short and fit for WhatsApp (maximum 3 sentences).
2. End with a polite next-step question (e.g. asking if they want a brochure link or want to plan a visit).
3. If they ask to meet, talk to a human broker, request a phone call, negotiate pricing/discounts, or ask to book a viewing, append "[ESCALATE]" at the end of the text. Otherwise, do not append it.
4. Respond in clear, friendly conversational English. Use Hinglish greetings (like "Namaste") if natural. Keep formatting minimal (plain text).`,
      });

      const prompt = `Client message: "${message}"`;
      const result = await model.generateContent(prompt);
      let replyText = result.response.text().trim();
      
      let escalate = isEscalationRequested;
      if (replyText.includes("[ESCALATE]")) {
        escalate = true;
        replyText = replyText.replace("[ESCALATE]", "").trim();
      }

      return { reply: replyText, escalate };
    } catch (err) {
      console.error("Error generating Gemini autopilot reply:", err);
      // Fall through to heuristic fallback
    }
  }

  // 2. Offline Heuristic Fallback
  let reply = `Namaste ${clientName}! `;
  const escalate = isEscalationRequested;

  if (isEscalationRequested) {
    reply += `I would be happy to help schedule a site visit or connect you with our lead broker. I am notifying the team to call you back right away to confirm details!`;
  } else if (text.includes("price") || text.includes("cost") || text.includes("budget") || text.includes("crore") || text.includes("lakh")) {
    if (property) {
      reply += `The pricing for ${property.title} in ${property.location} is ₹${(Number(property.price) / 10000000).toFixed(2)} Cr (₹${Number(property.price).toLocaleString("en-IN")}). We have special payment plans available. Would you like to see the details?`;
    } else {
      reply += `Our premium units in GIFT City and Ahmedabad start from ₹1.5 Cr. Let me know which location you are interested in!`;
    }
  } else if (text.includes("amenity") || text.includes("facility") || text.includes("pool") || text.includes("gym") || text.includes("park")) {
    if (property && property.amenities && property.amenities.length > 0) {
      reply += `Some of the premium amenities at ${property.title} include: ${property.amenities.slice(0, 4).join(", ")}, and more. Shall I email you the complete project brochure?`;
    } else {
      reply += `Our projects feature luxury amenities including 24/7 concierge, swimming pool, gym, and automated security. Would you like a brochure?`;
    }
  } else if (text.includes("roi") || text.includes("yield") || text.includes("return") || text.includes("appreciat")) {
    if (property) {
      reply += `${property.title} offers a strong projected annual appreciation of ${property.roi}%${property.rental_yield ? ` and a rental yield of ${property.rental_yield}%` : ""}. Shall I send you a custom ROI projection model?`;
    } else {
      reply += `Our projects offer between 9% to 14% annual appreciation returns. Which specific project fits your investment goals?`;
    }
  } else if (text.includes("location") || text.includes("address") || text.includes("where") || text.includes("map")) {
    if (property) {
      reply += `${property.title} is located in ${property.sub_location}. It is in the premium high-growth sector. Would you like a maps location pin?`;
    } else {
      reply += `We have premium projects in GIFT City, S.G. Highway, and Bodakdev. Which location fits your criteria?`;
    }
  } else {
    if (property) {
      reply += `Regarding ${property.title}, it is a luxury ${property.beds ? property.beds + " BHK " : ""}${property.type} developed by ${property.developer}. Would you like to schedule a call or virtual tour?`;
    } else {
      reply += `I am your virtual real estate assistant. I can share details on pricing, locations, specifications, and returns. How can I help you today?`;
    }
  }

  return { reply, escalate };
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
      // LEAD EXISTS
      const currentHistory = Array.isArray(matchedLead.whatsapp_history)
        ? matchedLead.whatsapp_history
        : [];
      
      const currentActivityLog = Array.isArray(matchedLead.activity_log)
        ? matchedLead.activity_log
        : [];
      
      const newActivity = {
        action: `Received WhatsApp message: "${message.substring(0, 30)}${message.length > 30 ? "..." : ""}"`,
        timestamp
      };

      // Heuristics for scoring updates
      const text = message.toLowerCase();
      let scoreBoost = 2;
      if (text.includes("visit") || text.includes("schedule") || text.includes("meet")) {
        scoreBoost = 15;
      } else if (text.includes("price") || text.includes("cost") || text.includes("budget")) {
        scoreBoost = 10;
      } else if (text.includes("roi") || text.includes("yield") || text.includes("return")) {
        scoreBoost = 8;
      }

      const currentScore = matchedLead.ai_score ?? 50;
      const newScore = Math.min(100, Math.max(0, currentScore + scoreBoost));
      const newQuality = newScore >= 80 ? "hot" : newScore >= 50 ? "warm" : "cold";

      // 2. CHECK IF AUTOPILOT IS ENABLED
      const updatedHistory = [...currentHistory, newHistoryMsg];
      const updatedActivityLog = [...currentActivityLog, newActivity];
      let autopilotStatus = matchedLead.autopilot;
      let finalStatus = "replied";

      if (autopilotStatus) {
        // Fetch property details for context
        let propertyDetails = null;
        if (matchedLead.interested_property_id) {
          const { data: prop } = await dbClient
            .from("properties")
            .select("*")
            .eq("id", matchedLead.interested_property_id)
            .single();
          propertyDetails = prop;
        }

        const apiKey = process.env.GEMINI_API_KEY;
        const { reply: botReply, escalate } = await generateAutoPilotReply(
          message,
          matchedLead.name,
          propertyDetails,
          apiKey
        );

        const botMsgTimestamp = new Date().toISOString();
        updatedHistory.push({
          sender: "agent",
          message: botReply,
          timestamp: botMsgTimestamp
        });
        
        updatedActivityLog.push({
          action: `Auto-Pilot auto-responded: "${botReply.substring(0, 30)}${botReply.length > 30 ? "..." : ""}"`,
          timestamp: botMsgTimestamp
        });

        if (escalate) {
          autopilotStatus = false; // Turn off autopilot
          finalStatus = "replied"; // Requires manual follow-up
          
          const alertTimestamp = new Date(Date.now() + 500).toISOString();
          updatedHistory.push({
            sender: "system",
            message: "🔔 SYSTEM ALERT: Client requested human escalation or site visit. Auto-Pilot deactivated. Handoff to broker.",
            timestamp: alertTimestamp
          });
          
          updatedActivityLog.push({
            action: "Auto-Pilot deactivated: Human escalation triggered",
            timestamp: alertTimestamp
          });
        } else {
          finalStatus = "delivered"; // Bot answered, wait for lead to reply
        }
      }

      // Update lead
      const { data: updatedLead, error: updateError } = await dbClient
        .from("leads")
        .update({
          whatsapp_history: updatedHistory,
          whatsapp_status: finalStatus,
          ai_score: newScore,
          lead_quality: newQuality,
          activity_log: updatedActivityLog,
          autopilot: autopilotStatus
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
      const { data: properties } = await dbClient
        .from("properties")
        .select("*")
        .limit(1);
      
      const assocPropertyId = properties?.[0]?.id || null;
      const assocPropertyName = properties?.[0]?.title || "General Portfolio Inquiry";

      const newLeadId = crypto.randomUUID();
      const text = message.toLowerCase();
      let initialScore = 60;
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
        created_at: timestamp,
        autopilot: false // Default to manual override for new leads, broker can toggle on
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
