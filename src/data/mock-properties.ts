export interface Property {
  id: string;
  title: string;
  type: "apartment" | "villa" | "office" | "plot";
  price: number; // in INR
  location: string;
  subLocation: string;
  beds?: number;
  baths?: number;
  area: string;
  images: string[];
  roi: number; // Projected annual ROI / appreciation rate in %
  rentalYield?: number; // annual rental yield in %
  description: string;
  amenities: string[];
  features: string[];
  projectedAppreciation5Yr: number; // % growth in 5 years
  address: string;
  developer: string;
}

export const mockProperties: Property[] = [
  {
    id: "prop-gift-city-skyvilla",
    title: "The Aurelia Skyvillas",
    type: "apartment",
    price: 24500000, // 2.45 Cr
    location: "GIFT City",
    subLocation: "Gandhinagar, Gujarat",
    beds: 4,
    baths: 5,
    area: "3,850 sq.ft",
    images: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80"
    ],
    roi: 12.8,
    rentalYield: 5.2,
    description: "Rising high above India's first operational smart city, The Aurelia Skyvillas redefine urban vertical luxury. Each residence features double-height ceilings, a private glass-edge plunge pool, automated climate controls, and breathtaking views of the GIFT City skyline and Sabarmati River. Fully compatible with REOP's smart building interface.",
    amenities: [
      "Private Plunge Pool",
      "24/7 Concierge",
      "Smart Automation",
      "Valet Parking",
      "Sky Lounge Access",
      "Infinity Gym",
      "EV Charging Port"
    ],
    features: [
      "Vastu Compliant Design",
      "Direct walkability to GIFT SEZ",
      "Dual-core structural security",
      "Triple pane soundproof windows"
    ],
    projectedAppreciation5Yr: 68,
    address: "Block 12, Zone 1, GIFT City, Gandhinagar, 382355",
    developer: "Aurelia Luxury Infra"
  },
  {
    id: "prop-ahmedabad-villa",
    title: "Verdant Groves Estate",
    type: "villa",
    price: 78000000, // 7.8 Cr
    location: "Bodakdev",
    subLocation: "Ahmedabad, Gujarat",
    beds: 5,
    baths: 6,
    area: "6,200 sq.ft",
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80"
    ],
    roi: 9.5,
    rentalYield: 2.8,
    description: "Nestled in Ahmedabad's most exclusive residential enclave, Verdant Groves offers an oasis of absolute privacy. Crafted with Italian travertine marble and natural teak, this modern villa integrates seamless indoor-outdoor living, complete with private landscaped gardens, koi pond, automated security gates, and a temperature-controlled home theater.",
    amenities: [
      "Landscaped Private Garden",
      "Private Home Theater",
      "Koi Pond & Zen Garden",
      "Italian Travertine Flooring",
      "4-Car Secure Garage",
      "Staff Quarters",
      "10kW Solar Power System"
    ],
    features: [
      "100% Privacy assurance",
      "Near Sindhu Bhavan Road lifestyle hub",
      "Ultra-high security gating",
      "Integrated water harvesting system"
    ],
    projectedAppreciation5Yr: 42,
    address: "Plots 5-7, Royal Orchard Lane, Bodakdev, Ahmedabad, 380054",
    developer: "Signature Estates Group"
  },
  {
    id: "prop-commercial-offices",
    title: "The Zenith Tech Tower (Grade A)",
    type: "office",
    price: 185000000, // 18.5 Cr
    location: "S.G. Highway",
    subLocation: "Ahmedabad, Gujarat",
    area: "12,500 sq.ft",
    images: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80"
    ],
    roi: 11.2,
    rentalYield: 8.4,
    description: "An exceptional Grade A commercial floor situated directly on the S.G. Highway commercial corridor. Perfect for high-growth tech firms or global corporate capability centers. Fully leased to a multinational tenant with a 5-year lock-in period, guaranteeing immediate cash flow and substantial yield returns.",
    amenities: [
      "High-speed Escalators & Lifts",
      "Centralized HVAC VAV",
      "LEED Platinum Certified",
      "Double-height Reception Lobby",
      "Ample Multi-level Parking",
      "Fibre-optic redundant backbone",
      "Food Court & Cafeteria"
    ],
    features: [
      "8.4% current rental yield locked-in",
      "Triple-net lease (NNN)",
      "High visibility on S.G. Highway",
      "Professional property management included"
    ],
    projectedAppreciation5Yr: 50,
    address: "Levels 11 & 12, Zenith Tech Tower, S.G. Highway, Ahmedabad, 380015",
    developer: "Zenith Commercial Hubs"
  },
  {
    id: "prop-gift-city-residence",
    title: "Vanguard Corporate Suites",
    type: "apartment",
    price: 11200000, // 1.12 Cr
    location: "GIFT City",
    subLocation: "Gandhinagar, Gujarat",
    beds: 2,
    baths: 2,
    area: "1,450 sq.ft",
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80"
    ],
    roi: 14.5,
    rentalYield: 6.1,
    description: "Tailored specifically for finance and tech professionals working within the GIFT City International Financial Services Centre (IFSC). These luxury smart suites provide compact, luxury living with fully automated workspace conversion layouts, keyless fingerprint entries, and exclusive rooftop club access.",
    amenities: [
      "Rooftop Infinity Pool",
      "Co-working Lounge",
      "Fingerprint Keyless Entry",
      "24/7 Power Backup",
      "State-of-the-art Gym",
      "Steam & Sauna Room",
      "Underground Storage Unit"
    ],
    features: [
      "Highest rental demand zone in Gujarat",
      "Eligible for dynamic corporate leasing",
      "Smart-grid utility infrastructure",
      "Tax incentives under GIFT SEZ guidelines"
    ],
    projectedAppreciation5Yr: 80,
    address: "Block B, Vanguard Heights, IFSC Zone, GIFT City, Gandhinagar, 382355",
    developer: "Vanguard Builders Group"
  },
  {
    id: "prop-sanand-plot",
    title: "Sanand Industrial Logistics Hub",
    type: "plot",
    price: 35000000, // 3.5 Cr
    location: "Sanand",
    subLocation: "Ahmedabad Outer, Gujarat",
    area: "2.5 Acres",
    images: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80"
    ],
    roi: 15.0,
    description: "An prime industrial-zoned NA land parcel situated in Sanand, the manufacturing and automotive powerhouse of Western India. Perfectly connected via 6-lane expressways to Mundra port corridors, making it an exceptional high-appreciation asset ideal for custom warehousing development, manufacturing units, or mid-term holding.",
    amenities: [
      "High-tension Power Line access",
      "Dedicated Borewell Water source",
      "Concrete Boundary Walls",
      "60-feet wide approach road",
      "Drainage & Sewage provisions"
    ],
    features: [
      "Non-Agricultural (NA) certified title clear",
      "Direct connectivity to Tata Nano & EV plant sectors",
      "Projected 5-year appreciation of 90%",
      "Fenced and secured layout"
    ],
    projectedAppreciation5Yr: 90,
    address: "Survey No. 124/B, GIDC Sanand Extension, Sanand, 382110",
    developer: "Gujarat Industry Lands"
  }
];
