import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Invalid messages array provided." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your-gemini-api-key-here") {
      return NextResponse.json(
        { error: "Gemini API key is not configured." },
        { status: 400 }
      );
    }

    // 1. Fetch live property context from Supabase
    let propertyContext = "No active listings in database.";
    if (supabase) {
      const { data: properties, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && properties && properties.length > 0) {
        propertyContext = properties
          .map((p) => {
            return `
Property ID: ${p.id}
Title: ${p.title}
Type: ${p.type}
Price: ₹${(Number(p.price) / 10000000).toFixed(2)} Cr (₹${Number(p.price).toLocaleString("en-IN")})
Location: ${p.location}, ${p.sub_location}
Specs: ${p.beds ? p.beds + " BHK" : "N/A"} | ${p.baths ? p.baths + " Baths" : "N/A"} | ${p.area}
Appreciation Rate (ROI): ${p.roi}% projected annual appreciation
Rental Yield: ${p.rental_yield ? p.rental_yield + "%" : "N/A"}
Developer: ${p.developer}
Address: ${p.address}
Amenities: ${p.amenities?.join(", ") || "None"}
Features: ${p.features?.join(", ") || "None"}
Description: ${p.description}
---`;
          })
          .join("\n");
      }
    }

    // 2. Initialize the Gemini API client
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: `You are REOP AI, the ultimate real estate intelligence virtual advisor. You assist brokers, developers, and premium investors in matching leads and analyzing listings in India (specializing in GIFT City and Ahmedabad).
      
Use the following live database property catalog to answer questions. ONLY recommend properties listed in this catalog. If a user asks about general areas, pitch these specific listings:

${propertyContext}

Rules:
1. Always present prices in Indian Rupees (INR) using Crores (Cr) or Lakhs (L).
2. Detail precise specifications (e.g. ROI %, yields, locations, BHKs, developers) from the catalog when suggesting a property.
3. Be professional, direct, and concise (Linear/Apple aesthetic voice). Do not use verbose filler text.
4. Format your output cleanly in Markdown, utilizing bolding, bullet points, and tables where appropriate.
5. If you do not have property data to fulfill a request, politely guide them to check current inventory in the main console.`,
    });

    // 3. Map messages history to Gemini format (role must be 'user' or 'model')
    // We filter out the last message because it will be passed to sendMessage
    const userMessageObj = messages[messages.length - 1];
    const userMessageContent = userMessageObj.content;

    const chatHistory = messages
      .slice(0, -1)
      .map((msg: { role: string; content: string }) => {
        return {
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        };
      });

    // 4. Start Gemini Chat Session and send the user prompt
    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.2,
      },
    });

    const result = await chat.sendMessage(userMessageContent);
    const responseText = result.response.text();

    return NextResponse.json({ response: responseText });
  } catch (err: unknown) {
    console.error("Gemini API handler error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
