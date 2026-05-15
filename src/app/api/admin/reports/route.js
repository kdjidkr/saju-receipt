import { supabaseAdmin } from "@/lib/supabase";

// 관리자 권한 검증 함수 (개선됨)
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

export async function GET(request) {
  if (!verifyAdmin(request)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("saju_reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return new Response(JSON.stringify({ reports: data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Admin API Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

export async function DELETE(request) {
  if (!verifyAdmin(request)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response(JSON.stringify({ error: "ID is required" }), { status: 400 });
  }

  try {
    const { error } = await supabaseAdmin
      .from("saju_reports")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
