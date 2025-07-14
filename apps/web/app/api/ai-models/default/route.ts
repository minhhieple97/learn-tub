import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Get the first available AI model as default
    const { data: aiModel, error } = await supabase
      .from("ai_model_pricing_view")
      .select("id")
      .limit(1)
      .single();

    if (error || !aiModel) {
      // Return a fallback UUID if no model found
      return NextResponse.json({
        modelId: "550e8400-e29b-41d4-a716-446655440000",
      });
    }

    return NextResponse.json({
      modelId: aiModel.id,
    });
  } catch (error) {
    console.error("Error fetching default AI model:", error);

    // Return a fallback UUID on error
    return NextResponse.json({
      modelId: "550e8400-e29b-41d4-a716-446655440000",
    });
  }
}
