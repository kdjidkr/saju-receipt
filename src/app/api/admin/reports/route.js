import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    console.log("Admin API: Fetching reports...");
    if (!supabase) {
      console.error("Admin API: Supabase client is NULL");
      return new Response(JSON.stringify({ error: "Supabase not configured" }), { status: 500 });
    }

    const { data, error } = await supabase
      .from("saju_reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Admin API: Supabase query error:", error);
      throw error;
    }

    console.log(`Admin API: Successfully fetched ${data?.length || 0} reports`);
    return new Response(JSON.stringify({ reports: data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Admin API Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return new Response(JSON.stringify({ error: "Missing ID" }), { status: 400 });
    }

    if (!supabase) {
      return new Response(JSON.stringify({ error: "Supabase not configured" }), { status: 500 });
    }

    const { error } = await supabase
      .from("saju_reports")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Admin API DELETE Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
