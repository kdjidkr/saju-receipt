"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();
      if (data.success) {
        localStorage.setItem("admin_token", data.token);
        router.push("/admin");
      } else {
        setError(data.message || "로그인 실패");
      }
    } catch (err) {
      setError("서버 오류가 발생했습니다.");
    }
  };

  return (
    <div className="container">
      <div className="pixel-card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
        <h2 className="pixel-font" style={{ fontSize: '18px', color: 'var(--primary-color)', marginBottom: '30px' }}>
          🛠️ 관리자 로그인
        </h2>
        
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>비밀번호</label>
            <input
              type="password"
              className="pixel-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="패스워드를 입력하세요"
              required
            />
          </div>
          
          {error && <p style={{ color: 'red', fontSize: '0.8rem', marginBottom: '20px' }}>{error}</p>}
          
          <button type="submit" className="pixel-button pink" style={{ width: '100%', margin: '10px 0' }}>
            로그인
          </button>
          
          <Link href="/" className="pixel-button cyan" style={{ width: '100%', margin: '10px 0' }}>
            홈으로
          </Link>
        </form>
      </div>
    </div>
  );
}
