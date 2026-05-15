"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function HistoryPage() {
  const [formData, setFormData] = useState({
    name: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length !== 4) {
      alert("비밀번호는 숫자 4자리입니다.");
      return;
    }
    setLoading(true);
    
    // We search for the result. We need birth date to uniquely identify it normally, 
    // but the user wants to search by name + password.
    // However, the current API GET /api/saju requires all params.
    // I should create a new API endpoint or modify the existing one to allow searching.
    
    // Let's create a search API or use a query that works.
    // Actually, I'll redirect to the result page with name/password and let it handle the search.
    // But result page needs birth date to display info.
    
    // Redirect to a specific search result page
    router.push(`/saju/history/result?name=${formData.name}&password=${formData.password}`);
  };

  return (
    <div className="container">
      <Link href="/saju" className="pixel-button" style={{ position: 'absolute', top: '20px', left: '20px', fontSize: '10px' }}>
        ← 돌아가기
      </Link>

      <div className="pixel-card" style={{ width: '100%', maxWidth: '400px', marginTop: '40px' }}>
        <h2 className="pixel-font" style={{ fontSize: '16px', color: 'var(--primary-color)', marginBottom: '20px', textAlign: 'center' }}>
          기존 결과 조회
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>이름</label>
            <input 
              type="text" 
              className="pixel-input" 
              required 
              placeholder="이름 입력"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="input-group">
            <label>비밀번호 (4자리)</label>
            <input 
              type="password" 
              className="pixel-input" 
              required 
              maxLength={4}
              placeholder="****"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button type="submit" className="pixel-button cyan" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
            {loading ? "조회 중..." : "결과 찾기"}
          </button>
        </form>
      </div>
    </div>
  );
}
