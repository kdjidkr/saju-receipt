export async function POST(request) {
  try {
    const { password } = await request.json();
    const adminPw = process.env.ADMIN_PW;

    if (password === adminPw) {
      return new Response(JSON.stringify({ success: true, token: "authorized_session_token" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } else {
      return new Response(JSON.stringify({ success: false, message: "비밀번호가 틀렸습니다." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
