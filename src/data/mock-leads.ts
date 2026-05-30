export interface WhatsAppMessage {
  sender: "lead" | "agent" | "system";
  message: string;
  timestamp: string;
}

export interface Activity {
  action: string;
  timestamp: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  interestedPropertyId: string;
  propertyName: string;
  status: "new" | "contacted" | "proposal" | "negotiation" | "closed";
  aiScore: number; // 0-100
  leadQuality: "hot" | "warm" | "cold";
  aiReasoning: string;
  createdAt: string;
  whatsAppStatus: "delivered" | "replied" | "pending" | "none";
  whatsAppHistory: WhatsAppMessage[];
  activityLog: Activity[];
  autopilot?: boolean;
}

export const mockLeads: Lead[] = [
  {
    id: "lead-rajesh",
    name: "Rajesh Mehta",
    email: "rajesh.mehta@fintechcorp.in",
    phone: "+91 98250 12345",
    interestedPropertyId: "prop-gift-city-skyvilla",
    propertyName: "The Aurelia Skyvillas",
    status: "new",
    aiScore: 94,
    leadQuality: "hot",
    aiReasoning: "Requested structural layouts. Searched GIFT City properties 4 times in the past 48 hours. Works as Managing Director at a prominent GIFT IFSC FinTech firm. Immediate budget available.",
    createdAt: "2026-05-27T10:30:00Z",
    whatsAppStatus: "replied",
    whatsAppHistory: [
      {
        sender: "system",
        message: "⚡ Instant Lead Capture auto-responder triggered.",
        timestamp: "2026-05-27T10:30:05Z"
      },
      {
        sender: "agent",
        message: "Namaste Rajeshji! Thank you for inquiring about The Aurelia Skyvillas in GIFT City. I am REOP AI, your virtual real estate advisor. Would you like us to share the project layout and payment schedules over WhatsApp?",
        timestamp: "2026-05-27T10:30:06Z"
      },
      {
        sender: "lead",
        message: "Yes please, also send details on the NNN lease structures for commercial holdings if you have them, or just the skyvilla floor layout. I want to visit this Saturday.",
        timestamp: "2026-05-27T10:32:15Z"
      },
      {
        sender: "agent",
        message: "Perfect! Sending the brochure and layouts. Our executive will call to confirm Saturday morning timings. Here is the direct download link: [Aurelia_Skyvilla_Brochure.pdf]",
        timestamp: "2026-05-27T10:33:00Z"
      }
    ],
    activityLog: [
      { action: "Visited landing page property finder", timestamp: "2026-05-27T10:25:00Z" },
      { action: "Submitted inquiry form for Aurelia Skyvilla", timestamp: "2026-05-27T10:30:00Z" },
      { action: "AI Assistant auto-reply triggered", timestamp: "2026-05-27T10:30:06Z" },
      { action: "Lead responded to WhatsApp inquiry", timestamp: "2026-05-27T10:32:15Z" },
      { action: "Viewed brochure PDF download", timestamp: "2026-05-27T10:35:00Z" }
    ]
  },
  {
    id: "lead-priya",
    name: "Priya Sharma",
    email: "priya.sharma@nrifinance.com",
    phone: "+44 7700 900077",
    interestedPropertyId: "prop-ahmedabad-villa",
    propertyName: "Verdant Groves Estate",
    status: "contacted",
    aiScore: 82,
    leadQuality: "hot",
    aiReasoning: "NRI based in London. High intent. Calculated EMI twice using the Verdant Groves customized calculator. Has asked for digital walkthrough options.",
    createdAt: "2026-05-26T14:15:00Z",
    whatsAppStatus: "delivered",
    whatsAppHistory: [
      {
        sender: "agent",
        message: "Hello Priya! We noticed you calculated the ROI profiles for Verdant Groves in Bodakdev. Would you like to schedule an immersive VR video call walkthrough with our premium agent?",
        timestamp: "2026-05-26T14:16:00Z"
      },
      {
        sender: "lead",
        message: "That sounds good. I'm available at 4 PM IST tomorrow. Do you accept payments in GBP or directly to NRE accounts?",
        timestamp: "2026-05-26T14:40:00Z"
      },
      {
        sender: "agent",
        message: "Yes, we handle NRO/NRE direct bank transfers and provide complete legal guidance for NRI repatriation. Your 4 PM IST meeting is scheduled. Link will be sent here.",
        timestamp: "2026-05-26T14:45:00Z"
      }
    ],
    activityLog: [
      { action: "Used custom EMI calculator (7.8 Cr property)", timestamp: "2026-05-26T14:10:00Z" },
      { action: "Used ROI projection slider (projected 5 years)", timestamp: "2026-05-26T14:12:00Z" },
      { action: "Submitted WhatsApp call request", timestamp: "2026-05-26T14:15:00Z" },
      { action: "Representative scheduled a VR Walkthrough for 2026-05-28", timestamp: "2026-05-27T09:00:00Z" }
    ]
  },
  {
    id: "lead-amit",
    name: "Amit Patel",
    email: "amitpatel.sanand@gmail.com",
    phone: "+91 99090 98765",
    interestedPropertyId: "prop-sanand-plot",
    propertyName: "Sanand Industrial Logistics Hub",
    status: "proposal",
    aiScore: 68,
    leadQuality: "warm",
    aiReasoning: "Local industrialist. Interested in plot acquisition for warehousing extension. Low frequency visits but high-budget transaction scope. Clean title search requested.",
    createdAt: "2026-05-25T08:00:00Z",
    whatsAppStatus: "replied",
    whatsAppHistory: [
      {
        sender: "agent",
        message: "Namaste Amitbhai. We have compiled the GIDC zoning approvals and Land Registry Title clearance papers for the Sanand 2.5 Acre industrial plot. Shall we send them?",
        timestamp: "2026-05-25T08:05:00Z"
      },
      {
        sender: "lead",
        message: "Send it. Also let me know if GIDC has completed the 60 feet asphalt road laying near Survey No. 124/B.",
        timestamp: "2026-05-25T11:20:00Z"
      },
      {
        sender: "agent",
        message: "Yes, the GIDC asphalt road construction is fully complete. Sending the layout map showing the road frontage and GIDC NOC files.",
        timestamp: "2026-05-25T11:30:00Z"
      }
    ],
    activityLog: [
      { action: "Acquired brochure for Sanand GIDC plot", timestamp: "2026-05-25T08:00:00Z" },
      { action: "Requested Title Clearance reports via agent link", timestamp: "2026-05-26T10:00:00Z" }
    ]
  },
  {
    id: "lead-vikram",
    name: "Vikram Rathore",
    email: "vikram.rathore@retailinvest.in",
    phone: "+91 97771 88811",
    interestedPropertyId: "prop-commercial-offices",
    propertyName: "The Zenith Tech Tower (Grade A)",
    status: "negotiation",
    aiScore: 78,
    leadQuality: "warm",
    aiReasoning: "Investment advisor looking for rental yield properties. Looked at Grade A commercial NNN lease details. Negotiating on token deposit amount.",
    createdAt: "2026-05-24T16:45:00Z",
    whatsAppStatus: "replied",
    whatsAppHistory: [
      {
        sender: "agent",
        message: "Dear Vikram, the developer has agreed to discuss the 5-year corporate rental yield structure for Zenith Tech Tower. Are you available for a negotiation call with their finance director?",
        timestamp: "2026-05-24T17:00:00Z"
      },
      {
        sender: "lead",
        message: "I am ready. Ask them if they can reduce the security deposit term from 9 months to 6 months. That is my main condition.",
        timestamp: "2026-05-25T14:10:00Z"
      }
    ],
    activityLog: [
      { action: "Downloaded corporate tenant lease agreement mock", timestamp: "2026-05-24T16:50:00Z" },
      { action: "Scheduled developer board conference call", timestamp: "2026-05-26T11:00:00Z" }
    ]
  },
  {
    id: "lead-sneha",
    name: "Sneha Patel",
    email: "sneha.patel@accenture.com",
    phone: "+91 94270 55432",
    interestedPropertyId: "prop-gift-city-residence",
    propertyName: "Vanguard Corporate Suites",
    status: "closed",
    aiScore: 92,
    leadQuality: "hot",
    aiReasoning: "Secured tech lease profile. Fast closing. Looking for rental investment near IFSC. Transaction complete.",
    createdAt: "2026-05-20T11:00:00Z",
    whatsAppStatus: "delivered",
    whatsAppHistory: [
      {
        sender: "agent",
        message: "Congratulations Sneha! The bank has released the home loan disbursement for Vanguard Corporate Suite 404. All registry papers are complete.",
        timestamp: "2026-05-23T11:30:00Z"
      },
      {
        sender: "lead",
        message: "Thank you for all the help! The REOP platform made the paper validation and digital signatures super smooth.",
        timestamp: "2026-05-23T11:45:00Z"
      }
    ],
    activityLog: [
      { action: "Selected Vanguard Corporate Suite", timestamp: "2026-05-20T11:05:00Z" },
      { action: "e-Signed booking form via digital interface", timestamp: "2026-05-21T09:00:00Z" },
      { action: "Transaction closed and home loan approved", timestamp: "2026-05-23T11:30:00Z" }
    ]
  }
];
