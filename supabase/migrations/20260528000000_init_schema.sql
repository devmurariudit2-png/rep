-- ========================================================
-- REOP ENTERPRISE BACKEND SCHEMA (POSTGRESQL)
-- For execution in Supabase SQL Editor
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create User Profiles (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  updated_at timestamp with time zone DEFAULT now(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  role text NOT NULL CHECK (role IN ('broker', 'builder', 'admin', 'client')) DEFAULT 'broker'
);

-- Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-access to profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Allow users to update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow user inserts on registration" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger to automatically create profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, updated_at)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'broker'),
    now()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. Create Properties Table
CREATE TABLE IF NOT EXISTS public.properties (
  id text PRIMARY KEY, -- Slug-style IDs used in routing
  created_at timestamp with time zone DEFAULT now(),
  title text NOT NULL,
  type text NOT NULL CHECK (type IN ('apartment', 'villa', 'office', 'plot')),
  price bigint NOT NULL, -- in INR
  location text NOT NULL,
  sub_location text NOT NULL,
  beds integer,
  baths integer,
  area text NOT NULL,
  images text[] NOT NULL,
  roi numeric NOT NULL, -- Projected annual appreciation rate %
  rental_yield numeric, -- Annual rental yield %
  description text NOT NULL,
  amenities text[] NOT NULL,
  features text[] NOT NULL,
  projected_appreciation_5yr numeric NOT NULL,
  address text NOT NULL,
  developer text NOT NULL,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Enable RLS on Properties
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read properties" ON public.properties
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated operators to modify properties" ON public.properties
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM public.profiles WHERE role IN ('admin', 'builder', 'broker')
    )
  );


-- 3. Create Leads Table
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  interested_property_id text REFERENCES public.properties(id) ON DELETE SET NULL,
  property_name text NOT NULL,
  status text NOT NULL CHECK (status IN ('new', 'contacted', 'proposal', 'negotiation', 'closed')) DEFAULT 'new',
  ai_score integer NOT NULL DEFAULT 50,
  lead_quality text NOT NULL CHECK (lead_quality IN ('hot', 'warm', 'cold')) DEFAULT 'warm',
  ai_reasoning text NOT NULL,
  whatsapp_status text NOT NULL CHECK (whatsapp_status IN ('delivered', 'replied', 'pending', 'none')) DEFAULT 'none',
  whatsapp_history jsonb NOT NULL DEFAULT '[]'::jsonb,
  activity_log jsonb NOT NULL DEFAULT '[]'::jsonb
);

-- Enable RLS on Leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public inserts for lead capturing" ON public.leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read and update leads" ON public.leads
  FOR ALL USING (auth.uid() IS NOT NULL);


-- ========================================================
-- SEED DATA SETUP
-- ========================================================

-- Insert Properties
INSERT INTO public.properties (id, title, type, price, location, sub_location, beds, baths, area, images, roi, rental_yield, description, amenities, features, projected_appreciation_5yr, address, developer)
VALUES 
(
  'prop-gift-city-skyvilla', 
  'The Aurelia Skyvillas', 
  'apartment', 
  24500000, 
  'GIFT City', 
  'Gandhinagar, Gujarat', 
  4, 
  5, 
  '3,850 sq.ft', 
  ARRAY['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80'], 
  12.8, 
  5.2, 
  'Rising high above India''s first operational smart city, The Aurelia Skyvillas redefine urban vertical luxury. Each residence features double-height ceilings, a private glass-edge plunge pool, automated climate controls, and breathtaking views of the GIFT City skyline and Sabarmati River. Fully compatible with REOP''s smart building interface.', 
  ARRAY['Private Plunge Pool', '24/7 Concierge', 'Smart Automation', 'Valet Parking', 'Sky Lounge Access', 'Infinity Gym', 'EV Charging Port'], 
  ARRAY['Vastu Compliant Design', 'Direct walkability to GIFT SEZ', 'Dual-core structural security', 'Triple pane soundproof windows'], 
  68, 
  'Block 12, Zone 1, GIFT City, Gandhinagar, 382355', 
  'Aurelia Luxury Infra'
),
(
  'prop-ahmedabad-villa', 
  'Verdant Groves Estate', 
  'villa', 
  78000000, 
  'Bodakdev', 
  'Ahmedabad, Gujarat', 
  5, 
  6, 
  '6,200 sq.ft', 
  ARRAY['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80'], 
  9.5, 
  2.8, 
  'Nestled in Ahmedabad''s most exclusive residential enclave, Verdant Groves offers an oasis of absolute privacy. Crafted with Italian travertine marble and natural teak, this modern villa integrates seamless indoor-outdoor living, complete with private landscaped gardens, koi pond, automated security gates, and a temperature-controlled home theater.', 
  ARRAY['Landscaped Private Garden', 'Private Home Theater', 'Koi Pond & Zen Garden', 'Italian Travertine Flooring', '4-Car Secure Garage', 'Staff Quarters', '10kW Solar Power System'], 
  ARRAY['100% Privacy assurance', 'Near Sindhu Bhavan Road lifestyle hub', 'Ultra-high security gating', 'Integrated water harvesting system'], 
  42, 
  'Plots 5-7, Royal Orchard Lane, Bodakdev, Ahmedabad, 380054', 
  'Signature Estates Group'
),
(
  'prop-commercial-offices', 
  'The Zenith Tech Tower (Grade A)', 
  'office', 
  185000000, 
  'S.G. Highway', 
  'Ahmedabad, Gujarat', 
  NULL, 
  NULL, 
  '12,500 sq.ft', 
  ARRAY['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80'], 
  11.2, 
  8.4, 
  'An exceptional Grade A commercial floor situated directly on the S.G. Highway commercial corridor. Perfect for high-growth tech firms or global corporate capability centers. Fully leased to a multinational tenant with a 5-year lock-in period, guaranteeing immediate cash flow and substantial yield returns.', 
  ARRAY['High-speed Escalators & Lifts', 'Centralized HVAC VAV', 'LEED Platinum Certified', 'Double-height Reception Lobby', 'Ample Multi-level Parking', 'Fibre-optic redundant backbone', 'Food Court & Cafeteria'], 
  ARRAY['8.4% current rental yield locked-in', 'Triple-net lease (NNN)', 'High visibility on S.G. Highway', 'Professional property management included'], 
  50, 
  'Levels 11 & 12, Zenith Tech Tower, S.G. Highway, Ahmedabad, 380015', 
  'Zenith Commercial Hubs'
),
(
  'prop-gift-city-residence', 
  'Vanguard Corporate Suites', 
  'apartment', 
  11200000, 
  'GIFT City', 
  'Gandhinagar, Gujarat', 
  2, 
  2, 
  '1,450 sq.ft', 
  ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'], 
  14.5, 
  6.1, 
  'Tailored specifically for finance and tech professionals working within the GIFT City International Financial Services Centre (IFSC). These luxury smart suites provide compact, luxury living with fully automated workspace conversion layouts, keyless fingerprint entries, and exclusive rooftop club access.', 
  ARRAY['Rooftop Infinity Pool', 'Co-working Lounge', 'Fingerprint Keyless Entry', '24/7 Power Backup', 'State-of-the-art Gym', 'Steam & Sauna Room', 'Underground Storage Unit'], 
  ARRAY['Highest rental demand zone in Gujarat', 'Eligible for dynamic corporate leasing', 'Smart-grid utility infrastructure', 'Tax incentives under GIFT SEZ guidelines'], 
  80, 
  'Block B, Vanguard Heights, IFSC Zone, GIFT City, Gandhinagar, 382355', 
  'Vanguard Builders Group'
),
(
  'prop-sanand-plot', 
  'Sanand Industrial Logistics Hub', 
  'plot', 
  35000000, 
  'Sanand', 
  'Ahmedabad Outer, Gujarat', 
  NULL, 
  NULL, 
  '2.5 Acres', 
  ARRAY['https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80'], 
  15.0, 
  NULL, 
  'An prime industrial-zoned NA land parcel situated in Sanand, the manufacturing and automotive powerhouse of Western India. Perfectly connected via 6-lane expressways to Mundra port corridors, making it an exceptional high-appreciation asset ideal for custom warehousing development, manufacturing units, or mid-term holding.', 
  ARRAY['High-tension Power Line access', 'Dedicated Borewell Water source', 'Concrete Boundary Walls', '60-feet wide approach road', 'Drainage & Sewage provisions'], 
  ARRAY['Non-Agricultural (NA) certified title clear', 'Direct connectivity to Tata Nano & EV plant sectors', 'Projected 5-year appreciation of 90%', 'Fenced and secured layout'], 
  90, 
  'Survey No. 124/B, GIDC Sanand Extension, Sanand, 382110', 
  'Gujarat Industry Lands'
)
ON CONFLICT (id) DO NOTHING;


-- Insert Leads
INSERT INTO public.leads (id, name, email, phone, interested_property_id, property_name, status, ai_score, lead_quality, ai_reasoning, whatsapp_status, whatsapp_history, activity_log)
VALUES
(
  '8d3cfb57-6fcb-4c4b-b0b9-3b91811e5ad1',
  'Rajesh Mehta',
  'rajesh.mehta@fintechcorp.in',
  '+91 98250 12345',
  'prop-gift-city-skyvilla',
  'The Aurelia Skyvillas',
  'new',
  94,
  'hot',
  'Requested structural layouts. Searched GIFT City properties 4 times in the past 48 hours. Works as Managing Director at a prominent GIFT IFSC FinTech firm. Immediate budget available.',
  'replied',
  '[
    {"sender": "system", "message": "⚡ Instant Lead Capture auto-responder triggered.", "timestamp": "2026-05-27T10:30:05Z"},
    {"sender": "agent", "message": "Namaste Rajeshji! Thank you for inquiring about The Aurelia Skyvillas in GIFT City. I am REOP AI, your virtual real estate advisor. Would you like us to share the project layout and payment schedules over WhatsApp?", "timestamp": "2026-05-27T10:30:06Z"},
    {"sender": "lead", "message": "Yes please, also send details on the NNN lease structures for commercial holdings if you have them, or just the skyvilla floor layout. I want to visit this Saturday.", "timestamp": "2026-05-27T10:32:15Z"},
    {"sender": "agent", "message": "Perfect! Sending the brochure and layouts. Our executive will call to confirm Saturday morning timings. Here is the direct download link: [Aurelia_Skyvilla_Brochure.pdf]", "timestamp": "2026-05-27T10:33:00Z"}
  ]'::jsonb,
  '[
    {"action": "Visited landing page property finder", "timestamp": "2026-05-27T10:25:00Z"},
    {"action": "Submitted inquiry form for Aurelia Skyvilla", "timestamp": "2026-05-27T10:30:00Z"},
    {"action": "AI Assistant auto-reply triggered", "timestamp": "2026-05-27T10:30:06Z"},
    {"action": "Lead responded to WhatsApp inquiry", "timestamp": "2026-05-27T10:32:15Z"},
    {"action": "Viewed brochure PDF download", "timestamp": "2026-05-27T10:35:00Z"}
  ]'::jsonb
),
(
  '4e9cfb57-6fcb-4c4b-b0b9-3b91811e5ad2',
  'Priya Sharma',
  'priya.sharma@nrifinance.com',
  '+44 7700 900077',
  'prop-ahmedabad-villa',
  'Verdant Groves Estate',
  'contacted',
  82,
  'hot',
  'NRI based in London. High intent. Calculated EMI twice using the Verdant Groves customized calculator. Has asked for digital walkthrough options.',
  'delivered',
  '[
    {"sender": "agent", "message": "Hello Priya! We noticed you calculated the ROI profiles for Verdant Groves in Bodakdev. Would you like to schedule an immersive VR video call walkthrough with our premium agent?", "timestamp": "2026-05-26T14:16:00Z"},
    {"sender": "lead", "message": "That sounds good. I''m available at 4 PM IST tomorrow. Do you accept payments in GBP or directly to NRE accounts?", "timestamp": "2026-05-26T14:40:00Z"},
    {"sender": "agent", "message": "Yes, we handle NRO/NRE direct bank transfers and provide complete legal guidance for NRI repatriation. Your 4 PM IST meeting is scheduled. Link will be sent here.", "timestamp": "2026-05-26T14:45:00Z"}
  ]'::jsonb,
  '[
    {"action": "Used custom EMI calculator (7.8 Cr property)", "timestamp": "2026-05-26T14:10:00Z"},
    {"action": "Used ROI projection slider (projected 5 years)", "timestamp": "2026-05-26T14:12:00Z"},
    {"action": "Submitted WhatsApp call request", "timestamp": "2026-05-26T14:15:00Z"},
    {"action": "Representative scheduled a VR Walkthrough for 2026-05-28", "timestamp": "2026-05-27T09:00:00Z"}
  ]'::jsonb
),
(
  '7fa1fb57-6fcb-4c4b-b0b9-3b91811e5ad3',
  'Amit Patel',
  'amitpatel.sanand@gmail.com',
  '+91 99090 98765',
  'prop-sanand-plot',
  'Sanand Industrial Logistics Hub',
  'proposal',
  68,
  'warm',
  'Local industrialist. Interested in plot acquisition for warehousing extension. Low frequency visits but high-budget transaction scope. Clean title search requested.',
  'replied',
  '[
    {"sender": "agent", "message": "Namaste Amitbhai. We have compiled the GIDC zoning approvals and Land Registry Title clearance papers for the Sanand 2.5 Acre industrial plot. Shall we send them?", "timestamp": "2026-05-25T08:05:00Z"},
    {"sender": "lead", "message": "Send it. Also let me know if GIDC has completed the 60 feet asphalt road laying near Survey No. 124/B.", "timestamp": "2026-05-25T11:20:00Z"},
    {"sender": "agent", "message": "Yes, the GIDC asphalt road construction is fully complete. Sending the layout map showing the road frontage and GIDC NOC files.", "timestamp": "2026-05-25T11:30:00Z"}
  ]'::jsonb,
  '[
    {"action": "Acquired brochure for Sanand GIDC plot", "timestamp": "2026-05-25T08:00:00Z"},
    {"action": "Requested Title Clearance reports via agent link", "timestamp": "2026-05-26T10:00:00Z"}
  ]'::jsonb
),
(
  'bca3fb57-6fcb-4c4b-b0b9-3b91811e5ad4',
  'Vikram Rathore',
  'vikram.rathore@retailinvest.in',
  '+91 97771 88811',
  'prop-commercial-offices',
  'The Zenith Tech Tower (Grade A)',
  'negotiation',
  78,
  'warm',
  'Investment advisor looking for rental yield properties. Looked at Grade A commercial NNN lease details. Negotiating on token deposit amount.',
  'replied',
  '[
    {"sender": "agent", "message": "Dear Vikram, the developer has agreed to discuss the 5-year corporate rental yield structure for Zenith Tech Tower. Are you available for a negotiation call with their finance director?", "timestamp": "2026-05-24T17:00:00Z"},
    {"sender": "lead", "message": "I am ready. Ask them if they can reduce the security deposit term from 9 months to 6 months. That is my main condition.", "timestamp": "2026-05-25T14:10:00Z"}
  ]'::jsonb,
  '[
    {"action": "Downloaded corporate tenant lease agreement mock", "timestamp": "2026-05-24T16:50:00Z"},
    {"action": "Scheduled developer board conference call", "timestamp": "2026-05-26T11:00:00Z"}
  ]'::jsonb
),
(
  '9ea5fb57-6fcb-4c4b-b0b9-3b91811e5ad5',
  'Sneha Patel',
  'sneha.patel@accenture.com',
  '+91 94270 55432',
  'prop-gift-city-residence',
  'Vanguard Corporate Suites',
  'closed',
  92,
  'hot',
  'Secured tech lease profile. Fast closing. Looking for rental investment near IFSC. Transaction complete.',
  'delivered',
  '[
    {"sender": "agent", "message": "Congratulations Sneha! The bank has released the home loan disbursement for Vanguard Corporate Suite 404. All registry papers are complete.", "timestamp": "2026-05-23T11:30:00Z"},
    {"sender": "lead", "message": "Thank you for all the help! The REOP platform made the paper validation and digital signatures super smooth.", "timestamp": "2026-05-23T11:45:00Z"}
  ]'::jsonb,
  '[
    {"action": "Selected Vanguard Corporate Suite", "timestamp": "2026-05-20T11:05:00Z"},
    {"action": "e-Signed booking form via digital interface", "timestamp": "2026-05-21T09:00:00Z"},
    {"action": "Transaction closed and home loan approved", "timestamp": "2026-05-23T11:30:00Z"}
  ]'::jsonb
)
ON CONFLICT (id) DO NOTHING;
