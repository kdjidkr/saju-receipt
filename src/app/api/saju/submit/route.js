import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");
  const year = searchParams.get("year");
  const month = searchParams.get("month");
  const day = searchParams.get("day");
  const hour = searchParams.get("hour");
  const minute = searchParams.get("minute");
  const calendarType = searchParams.get("calendarType") || "solar";
  const isLeapMonth = searchParams.get("isLeapMonth") === "true";
  const isTimeUnknown = searchParams.get("isTimeUnknown") === "true";
  const gender = searchParams.get("gender") === "1" ? "남성" : "여성";
  const topics = searchParams.get("topics") || "추천";

  try {
    if (!supabaseAdmin) {
      throw new Error("Supabase is not configured");
    }

    console.log("Saving saju request for:", name);
    
    const { data, error: saveError } = await supabaseAdmin
      .from("saju_reports")
      .insert([{
        name,
        year,
        month,
        day,
        hour: isTimeUnknown ? null : hour,
        minute: isTimeUnknown ? null : minute,
        is_time_unknown: isTimeUnknown,
        calendar_type: calendarType,
        is_leap_month: isLeapMonth,
        gender,
        topics,
        report: null // Will be generated later by admin
      }])
      .select()
      .single();

    if (saveError) {
      console.error("Supabase Save Error:", saveError);
      throw saveError;
    }

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Submission API Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
