import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { slug } = await req.json();

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          error: "Slug wajib diisi",
        },
        {
          status: 400,
        }
      );
    }

    // ambil content ranks dari site_content
    const { data, error } = await supabaseAdmin
      .from("site_content")
      .select("content_value")
      .eq("content_key", "ranks")
      .single();

    if (error || !data) {
      return NextResponse.json(
        {
          success: false,
          error: "Data ranks tidak ditemukan",
        },
        {
          status: 404,
        }
      );
    }

    // parse JSON ranks
    const ranks =
      typeof data.content_value === "string"
        ? JSON.parse(data.content_value)
        : data.content_value;

    // cari rank berdasarkan slug
    const rank = ranks.find(
      (item: any) => item.slug === slug
    );

    if (!rank) {
      return NextResponse.json(
        {
          success: false,
          error: "Rank tidak ditemukan",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      rank,
    });
  } catch (error: any) {
    console.error("GET RANK ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}