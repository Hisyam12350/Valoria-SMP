// src/app/api/store/get-points/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("site_content")
      .select("content_value")
      .eq("content_key", "points_store")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: "Data points tidak ditemukan" },
        { status: 404 }
      );
    }

    const points =
      typeof data.content_value === "string"
        ? JSON.parse(data.content_value)
        : data.content_value;

    return NextResponse.json({ success: true, points });
  } catch (error: any) {
    console.error("GET POINTS ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}