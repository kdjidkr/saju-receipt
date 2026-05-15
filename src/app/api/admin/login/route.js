import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request) {
  try {
    const { password } = await request.json();
    const adminPw = process.env.ADMIN_PW;

    if (password === adminPw) {
      // 비밀번호를 기반으로 간단한 보안 토큰 생성 (Base64 인코딩 등으로 위장)
      const secureToken = Buffer.from(`auth_${adminPw}`).toString('base64');
      
      return new Response(JSON.stringify({ 
        success: true, 
        token: secureToken 
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      return new Response(JSON.stringify({ success: false, error: "비밀번호가 일치하지 않습니다." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: "서버 오류가 발생했습니다." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
