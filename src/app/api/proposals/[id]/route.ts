import { NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Proposal ID is required." },
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

    // 1. Fetch lead details securely (bypasses RLS since it is a backend query)
    const { data: lead, error: leadError } = await dbClient
      .from("leads")
      .select("id, name, property_name, interested_property_id, status, created_at")
      .eq("id", id)
      .single();

    if (leadError || !lead) {
      console.error("Proposal lookup: lead not found:", leadError);
      return NextResponse.json(
        { error: "Proposal not found or has expired." },
        { status: 404 }
      );
    }

    // 2. Fetch corresponding property details
    let property = null;
    if (lead.interested_property_id) {
      const { data: prop, error: propError } = await dbClient
        .from("properties")
        .select("*")
        .eq("id", lead.interested_property_id)
        .single();
      
      if (!propError && prop) {
        property = {
          id: prop.id,
          title: prop.title,
          type: prop.type,
          price: Number(prop.price),
          location: prop.location,
          subLocation: prop.sub_location,
          beds: prop.beds ?? undefined,
          baths: prop.baths ?? undefined,
          area: prop.area,
          images: prop.images,
          roi: Number(prop.roi),
          rentalYield: prop.rental_yield ? Number(prop.rental_yield) : undefined,
          description: prop.description,
          amenities: prop.amenities,
          features: prop.features,
          projectedAppreciation5Yr: Number(prop.projected_appreciation_5yr),
          address: prop.address,
          developer: prop.developer
        };
      }
    }

    // 3. Return sanitized response
    return NextResponse.json({
      lead: {
        id: lead.id,
        name: lead.name,
        propertyName: lead.property_name,
        createdAt: lead.created_at
      },
      property
    });
  } catch (err: unknown) {
    console.error("Proposal details fetch error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
