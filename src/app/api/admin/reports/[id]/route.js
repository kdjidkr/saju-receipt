import { supabaseAdmin } from "@/lib/supabase";

function verifyAdmin(request) {
  const authHeader = request.headers.get("authorization");
  const adminPw = process.env.ADMIN_PW;
  if (!adminPw) return false;
  const expectedToken = Buffer.from(`auth_${adminPw}`).toString('base64');
  
  if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
    return false;
  }
  return true;
}

export async function GET(request, context) {
  if (!verifyAdmin(request)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const params = await context.params;
  const { id } = params;

  try {
    const { data, error } = await supabaseAdmin
      .from("saju_reports")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ report: data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
