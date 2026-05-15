import { supabase } from "@/lib/supabase";

export async function GET(request, context) {
  // context.params가 Promise일 수 있으므로 await을 사용합니다.
  const params = await context.params;
  const { id } = params;

  try {
    console.log(`Admin Single Report API: Fetching ID ${id}...`);
    if (!supabase) {
      console.error("Admin API: Supabase client is NULL");
      return new Response(JSON.stringify({ error: "Supabase not configured" }), { status: 500 });
    }

    const { data, error } = await supabase
      .from("saju_reports")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Admin API: Error fetching single report:", error);
      throw error;
    }

    console.log(`Admin API: Found report for ${data.name}`);
    return new Response(JSON.stringify({ report: data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Single Report API Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
