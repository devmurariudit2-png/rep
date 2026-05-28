
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// System instructions for the real estate AI
const SYSTEM_PROMPT = `
You are REOP AI, a premium real estate wealth advisor and operating assistant for high-end properties in India (focusing on GIFT City, Ahmedabad, and prime growth corridors).
Your tone is professional, sophisticated, numbers-driven, yet highly engaging (similar to an elite private wealth manager or luxury brand concierge).
You reference these properties in your answers whenever relevant:
1. "The Aurelia Skyvillas" in GIFT City: 4BHK Skyvilla, ₹2.45 Cr, ROI: 12.8%, Rental Yield: 5.2%. Ideal for luxury living and corporate lease.
2. "Verdant Groves Estate" in Bodakdev, Ahmedabad: 5BHK Luxury Villa, ₹7.8 Cr, ROI: 9.5%, Rental Yield: 2.8%. Ideal for high-net-worth privacy.
3. "The Zenith Tech Tower (Grade A)" on S.G. Highway: Commercial Floor, 12,500 sq.ft, ₹18.5 Cr, Rental Yield: 8.4% (NNN Lease), ROI: 11.2%. Ideal for passive commercial income.
4. "Vanguard Corporate Suites" in GIFT City IFSC: 2BHK Smart Suites, ₹1.12 Cr, ROI: 14.5%, Rental Yield: 6.1%. Ideal for finance executives and high rental demand.
5. "Sanand Industrial Logistics Hub" in Sanand: 2.5 Acres industrial plot, ₹3.5 Cr, ROI: 15.0%. Ideal for manufacturing / warehouse expansion.

When answering, break down investment numbers, calculate rental yields, or mention tax incentives (e.g. GIFT City IFSC tax exemptions) to sound highly knowledgeable. Use structured formatting, bullet points, and clean spacing.
`;

// Direct local simulator for zero-key execution
export function simulateAIChat(query: string): string {
  const q = query.toLowerCase();

  if (q.includes("3bhk") || q.includes("3 bhk") || q.includes("under 1") || q.includes("under 1cr") || q.includes("under 1 cr") || q.includes("1cr")) {
    return `### Property Recommendation & Market Reality

To be transparent, premium residential assets directly in the core **GIFT City IFSC** zone start slightly above ₹1 Cr. For example, **Vanguard Corporate Suites** (2BHK premium smart suite) is priced at **₹1.12 Cr** and offers an exceptional projected **14.5% annual ROI** with a **6.1% rental yield**.

Here are the details for your consideration:
*   **Property**: [Vanguard Corporate Suites](/properties/prop-gift-city-residence) (2BHK)
*   **Price**: ₹1.12 Cr
*   **ROI Projections**: 14.5% (Highest capital growth segment due to IFSC deregulation)
*   **Estimated Monthly Rent**: ₹55,000 - ₹62,000 (Strong corporate demand)

**Alternative Option**: If you strict-cap your budget under ₹1 Cr, we can explore sub-market options in Gandhinagar outer boundaries, but rental yields will average around 3.2% compared to GIFT City's 6.1%.

Would you like me to trigger an automatic WhatsApp callback with the brochure and layout plan for Vanguard Corporate Suites?`;
  }

  if (q.includes("roi") || q.includes("best investment") || q.includes("return") || q.includes("yield")) {
    return `### Top Yield & ROI Opportunities on REOP

Analyzing our active inventory for yield-focused portfolios, we have two distinct high-performance opportunities:

1.  **Vanguard Corporate Suites (GIFT City)**
    *   **Asset Class**: Premium Residential (IFSC corridor)
    *   **Capital Growth (ROI)**: **14.5% annual appreciation** projected.
    *   **Rental Yield**: **6.1%** (Driven by incoming global finance corporate staff).
    *   **Entry Ticket**: ₹1.12 Cr.

2.  **The Zenith Tech Tower (S.G. Highway)**
    *   **Asset Class**: Grade A Commercial Office (NNN Lease)
    *   **Capital Growth (ROI)**: **11.2%**
    *   **Rental Yield**: **8.4% locked-in** (Net of maintenance/taxes, leased to a multinational tenant).
    *   **Entry Ticket**: ₹18.5 Cr.

3.  **Sanand Industrial Logistics Hub**
    *   **Asset Class**: NA Industrial Plot (Sanand GIDC expansion)
    *   **Capital Growth (ROI)**: **15.0%** (Fueled by the EV manufacturing corridor expansion).
    *   **Entry Ticket**: ₹3.5 Cr.

**Advisory Note**: If you seek passive cash flow, the **Zenith Tech Tower** yields immediate returns. For high-growth capital accumulation, **GIFT City residential suites** are outperforming standard micro-markets in Gujarat by 2.4x.

Which asset class fits your current allocation strategy?`;
  }

  if (q.includes("investment") || q.includes("opportunity") || q.includes("opportunities") || q.includes("buy")) {
    return `### Premium Investment Portfolios Available

Here is a summary of active investment opportunities structured by investor profile:

*   **For the Corporate Yield Investor**:
    **[The Zenith Tech Tower (Grade A Office)](/properties/prop-commercial-offices)** on S.G. Highway. Priced at ₹18.5 Cr, returning an **8.4% yield** with NNN lease covenants.
*   **For the Tech Executive / Landlord**:
    **[Vanguard Corporate Suites](/properties/prop-gift-city-residence)** in GIFT City. Priced at ₹1.12 Cr, yielding **6.1% rental returns** and high tax-efficient capital growth.
*   **For the Land Bank Collector**:
    **[Sanand Industrial Logistics Hub](/properties/prop-sanand-plot)**. A 2.5 Acre industrial plot at ₹3.5 Cr, matching the massive logistics boom near the EV production zones.

I can compile a customized ROI yield spreadsheet for any of these assets. Which one would you like to review?`;
  }

  if (q.includes("gift city") || q.includes("gift")) {
    return `### GIFT City (Gujarat International Finance Tec-City) Market Report

GIFT City is currently India's fastest-appreciating real estate micro-market due to its special economic zone (SEZ) status, tax exemptions, and single-window clearance systems.

We have two highly sought-after listings in the IFSC and SEZ zones:
1.  **[The Aurelia Skyvillas](/properties/prop-gift-city-skyvilla)** (4BHK Ultra-Luxury): **₹2.45 Cr**. Features private plunge pools and automated building protocols. Projected capital appreciation is 12.8% per annum.
2.  **[Vanguard Corporate Suites](/properties/prop-gift-city-residence)** (2BHK Smart Executive Suites): **₹1.12 Cr**. Boasts a 6.1% rental yield.

**Key Drivers**:
*   **Tax Benefits**: Zero business taxes for 10 consecutive years out of 15.
*   **Infrastructure**: Centralized district cooling system, automated waste disposal, and dual-grid power guarantees.
*   **Global Demographics**: Influx of multinational banks (HSBC, Deakin University, tech capitals) creating a high-tier tenant base.

Would you like to book a site visit or receive the official GIFT City investment whitepaper on WhatsApp?`;
  }

  if (q.includes("villa") || q.includes("ahmedabad") || q.includes("bodakdev")) {
    return `### Luxury Residential Real Estate in Ahmedabad

For premium living, our premier residential asset is **[Verdant Groves Estate](/properties/prop-ahmedabad-villa)** in **Bodakdev, Ahmedabad**.

*   **Type**: Ultra-private 5BHK Villa
*   **Price**: ₹7.8 Cr
*   **Build Area**: 6,200 sq.ft
*   **Design**: Italian travertine marble floors, landscaped gardens, koi pond, and integrated smart security.
*   **ROI**: 9.5% annual capital appreciation.

This property is situated in Bodakdev, just 3 minutes from the luxury S.G. Highway shopping and lifestyle district, offering complete isolation and security.

Would you like to schedule a private, NDA-secured physical tour of this villa?`;
  }

  // Fallback generic but high-quality response
  return `### Thank you for contacting REOP Intelligence.

I am your AI Real Estate Advisory Agent. I can assist you with:
*   Finding properties based on specific yields, configuration (e.g. 4BHK skyvillas), and budgets in GIFT City and Ahmedabad.
*   Calculating detailed EMI schedules and 5-year investment appreciation yields.
*   Simulating real-time WhatsApp communication flow setup for brokers and builders.
*   Explaining tax benefits and regulatory policies within GIFT City IFSC zones.

Try asking:
*   *"Show me properties with the best ROI"*
*   *"Find me a 2BHK/3BHK in GIFT City"*
*   *"Tell me more about the luxury Bodakdev villa"*
*   *"What is the rental yield for the commercial office floor?"*

What real estate investment questions can I answer for you today?`;
}

// Live OpenAI API call handler
export async function getAIChatResponse(
  messages: ChatMessage[]
): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

  if (!apiKey) {
    // If no key, run our highly customized simulator
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")?.content || "";
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(simulateAIChat(lastUserMessage));
      }, 1000); // Simulate network latency
    });
  }

  try {
    const formattedMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API responded with status ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error in OpenAI live API call:", error);
    // Fallback to simulator
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")?.content || "";
    return simulateAIChat(lastUserMessage);
  }
}
