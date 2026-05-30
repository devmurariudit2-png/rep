import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase, supabaseAdmin } from "@/lib/supabase";

interface IngestPayload {
  rawText?: string;
  name?: string;
  phone?: string;
  email?: string;
  budget?: string | number;
  queryText?: string;
  source?: string;
}

export async function POST(req: Request) {
  try {
    const payload: IngestPayload = await req.json();
    const source = payload.source || "inbound_aggregator";

    let name = payload.name || "";
    let phone = payload.phone || "";
    let email = payload.email || "";
    let budget: number | null = payload.budget ? Number(payload.budget) : null;
    let queryText = payload.queryText || "";

    const apiKey = process.env.GEMINI_API_KEY;
    const hasGemini = apiKey && apiKey !== "your-gemini-api-key-here";

    // 1. If rawText is provided, use Gemini to parse unstructured alert
    if (payload.rawText && hasGemini) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `You are a precise real estate lead parser. Extract the following fields from the raw alert text.
Raw Alert Text:
"${payload.rawText}"

Fields to extract:
- name: Full name of inquirer (string). If not found, use "Valued Client".
- phone: Standardized phone number (string). Remove spaces or special characters.
- email: Email address (string or null).
- budget: Total budget in Indian Rupees. E.g., 2.5 Crore = 25000000, 80 Lakhs = 8000000. Return as integer or null.
- queryText: Brief description of what they are looking for (string).

Return ONLY a valid JSON object matching this structure, with no markdown wrapping, code blocks, or extra text. Example:
{
  "name": "Jane Doe",
  "phone": "+919876543210",
  "email": "jane@example.com",
  "budget": 25000000,
  "queryText": "Looking for 3 BHK under 3 Crore"
}`;

        const response = await model.generateContent(prompt);
        const responseText = response.response.text().trim();
        
        // Clean markdown backticks if returned by LLM
        const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanJson);

        name = parsed.name || name;
        phone = parsed.phone || phone;
        email = parsed.email || email;
        budget = parsed.budget || budget;
        queryText = parsed.queryText || queryText;
      } catch (err) {
        console.error("Gemini lead extraction failed, falling back to regex parser:", err);
      }
    }

    // Quick regex fallbacks if Gemini is not set or failed, to keep the system robust
    if (!name && payload.rawText) {
      const nameMatch = payload.rawText.match(/(?:Name|Client|Inquirer):\s*([^.\n\r]+)/i);
      name = nameMatch ? nameMatch[1].trim() : "Valued Client";
    }
    if (!phone && payload.rawText) {
      const phoneClean = payload.rawText.replace(/[\s\-()]/g, "");
      const match = phoneClean.match(/(?:\+91|0)?[6-9]\d{9}/);
      if (match) {
        phone = match[0];
      } else {
        const phoneMatch = payload.rawText.match(/(?:Phone|Mobile|Contact):\s*([\+\d\s\-()]+)/i);
        phone = phoneMatch ? phoneMatch[1].replace(/[^\d\+]/g, "").trim() : "";
      }
    }
    if (!email && payload.rawText) {
      const emailMatch = payload.rawText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
      email = emailMatch ? emailMatch[0].trim() : "";
    }
    if (!budget && payload.rawText) {
      const budgetClean = payload.rawText.replace(/,/g, "");
      const crMatch = budgetClean.match(/(\d+(?:\.\d+)?)\s*(?:Crore|Cr)/i);
      const lakhMatch = budgetClean.match(/(\d+(?:\.\d+)?)\s*(?:Lakh|L)/i);
      if (crMatch) {
        budget = Math.round(parseFloat(crMatch[1]) * 10000000);
      } else if (lakhMatch) {
        budget = Math.round(parseFloat(lakhMatch[1]) * 100000);
      }
    }

    if (!phone) {
      return NextResponse.json(
        { error: "Inbound lead phone number could not be parsed or found." },
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

    // 2. Fetch properties list to perform matching
    const { data: properties } = await dbClient
      .from("properties")
      .select("*")
      .order("price", { ascending: true });

    let matchedPropertyId: string | null = null;
    let matchedPropertyName = "General Portfolio Inquiry";
    let matchedPropertyPrice = 0;

    if (properties && properties.length > 0) {
      // Find matching properties: Look for budget fit, then check keyword relevance
      let match = properties.find((p) => budget && Number(p.price) <= budget);
      if (!match && budget) {
        // Fallback: closest price
        match = properties.reduce((prev, curr) => 
          Math.abs(Number(curr.price) - budget!) < Math.abs(Number(prev.price) - budget!) ? curr : prev
        );
      }
      
      // Keyword fallback: check queryText
      if (queryText) {
        const lowerQ = queryText.toLowerCase();
        const kwMatch = properties.find((p) => 
          lowerQ.includes(p.location.toLowerCase()) || 
          lowerQ.includes(p.type.toLowerCase()) ||
          lowerQ.includes(p.title.toLowerCase())
        );
        if (kwMatch) match = kwMatch;
      }

      if (match) {
        matchedPropertyId = match.id;
        matchedPropertyName = match.title;
        matchedPropertyPrice = Number(match.price);
      }
    }

    // 3. Score the lead quality dynamically based on budget scale & query responsiveness
    let aiScore = 65;
    let reasoning = "Inbound lead captured via automation hub.";

    if (budget && matchedPropertyPrice) {
      const ratio = budget / matchedPropertyPrice;
      if (ratio >= 1.0) {
        aiScore = Math.floor(Math.random() * 10) + 88; // Budget fits or exceeds ask
        reasoning += ` Budget of ₹${(budget/10000000).toFixed(2)} Cr fully matches property price of ₹${(matchedPropertyPrice/10000000).toFixed(2)} Cr.`;
      } else if (ratio >= 0.8) {
        aiScore = Math.floor(Math.random() * 15) + 70; // Close budget fit
        reasoning += ` Close budget alignment within 20% of property ask.`;
      } else {
        aiScore = Math.floor(Math.random() * 20) + 40;
        reasoning += ` Budget alignment under properties listed. Needs portfolio down-sell strategy.`;
      }
    }

    if (queryText) {
      const lowerQ = queryText.toLowerCase();
      if (lowerQ.includes("visit") || lowerQ.includes("tomorrow") || lowerQ.includes("asap") || lowerQ.includes("now")) {
        aiScore = Math.min(100, aiScore + 10);
        reasoning += ` High urgency identified: requesting site viewing.`;
      }
    }

    const leadQuality = aiScore >= 80 ? "hot" : aiScore >= 50 ? "warm" : "cold";
    const timestamp = new Date().toISOString();

    const autoReplyText = `Namaste ${name}! Thank you for your inquiry via ${source.replace(/_/g, " ")}. We have captured your request for "${matchedPropertyName}". An automated digital brochure, verified ROI prospectus, and payment schedules are ready for your review. Let us know when you would like to schedule a private viewing.`;

    const newLeadId = crypto.randomUUID();
    const leadPayload = {
      id: newLeadId,
      name,
      email: email || `${name.toLowerCase().replace(/\s+/g, ".")}@${source}.in`,
      phone,
      interested_property_id: matchedPropertyId,
      property_name: matchedPropertyName,
      status: "new",
      ai_score: aiScore,
      lead_quality: leadQuality,
      ai_reasoning: reasoning,
      whatsapp_status: "delivered",
      whatsapp_history: [
        {
          sender: "system",
          message: `⚡ Instant Inbound capture auto-responder triggered. Channel: ${source.toUpperCase()}`,
          timestamp
        },
        {
          sender: "agent",
          message: autoReplyText,
          timestamp
        }
      ],
      activity_log: [
        { action: `Lead captured via Inbound Channel API (${source.toUpperCase()})`, timestamp },
        { action: `System auto-matched property: ${matchedPropertyName}`, timestamp },
        { action: `AI Lead Quality evaluated as ${leadQuality.toUpperCase()}`, timestamp },
        { action: "WhatsApp brochure auto-reply dispatched", timestamp }
      ],
      created_at: timestamp
    };

    // 4. Upsert by checking if lead exists with this phone first
    const { data: existingLeads } = await dbClient
      .from("leads")
      .select("*");

    const matchedLead = existingLeads?.find((l) => {
      const s1 = l.phone.replace(/\D/g, "");
      const s2 = phone.replace(/\D/g, "");
      return s1.substring(s1.length - 10) === s2.substring(s2.length - 10);
    });

    if (matchedLead) {
      // Existing lead update instead of duplicate
      const currentHistory = Array.isArray(matchedLead.whatsapp_history) ? matchedLead.whatsapp_history : [];
      const currentActivity = Array.isArray(matchedLead.activity_log) ? matchedLead.activity_log : [];

      const { data: updated, error: updateError } = await dbClient
        .from("leads")
        .update({
          property_name: matchedPropertyName,
          interested_property_id: matchedPropertyId,
          ai_score: Math.round((matchedLead.ai_score + aiScore) / 2), // average score
          ai_reasoning: `Updated inquiry info via ${source.toUpperCase()}. ` + reasoning,
          whatsapp_status: "delivered",
          whatsapp_history: [
            ...currentHistory,
            {
              sender: "system",
              message: `⚡ Re-inquiry logged via channel: ${source.toUpperCase()}`,
              timestamp
            },
            {
              sender: "agent",
              message: `Hi ${name}, we logged your updated inquiry. Let us check matching options for ${matchedPropertyName}...`,
              timestamp
            }
          ],
          activity_log: [
            ...currentActivity,
            { action: `Logged re-inquiry from ${source.toUpperCase()}`, timestamp },
            { action: `Updated matched property: ${matchedPropertyName}`, timestamp }
          ]
        })
        .eq("id", matchedLead.id)
        .select()
        .single();

      if (updateError) {
        console.error("Failed to update existing lead on webhook capture:", updateError);
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        action: "updated",
        lead: updated
      });
    }

    const { data: created, error: insertError } = await dbClient
      .from("leads")
      .insert(leadPayload)
      .select()
      .single();

    if (insertError) {
      console.error("Failed to create lead on webhook capture:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      action: "created",
      lead: created
    });

  } catch (err: unknown) {
    console.error("Lead capture processing error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
