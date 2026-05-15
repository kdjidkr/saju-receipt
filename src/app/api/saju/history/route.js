import { supabase } from "@/lib/supabase";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");
  const password = searchParams.get("password");

  if (!supabase) {
    return new Response(JSON.stringify({ error: "DB not configured" }), { status: 500 });
  }

  try {
    const { data, error } = await supabase
      .from("saju_reports")
      .select("id, name, year, month, day, hour, minute, is_time_unknown, gender, created_at")
      .eq("name", name)
      .eq("password", password)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
