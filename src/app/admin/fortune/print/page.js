"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function FortunePrintPage() {
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchFortune = async () => {
      try {
        const response = await fetch("/api/fortune");
        const data = await response.json();
        if (data.report) {
          setReport(data.report);
          // Wait for render, then print
          setTimeout(() => {
            window.print();
          }, 500);
        }
      } catch (error) {
        console.error("Failed to fetch fortune:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFortune();
  }, []);

  if (loading) return <div className="container pixel-font">행운을 불러오는 중...</div>;

  return (
    <div className="container">
      <div className="no-print" style={{ marginBottom: '20px', textAlign: 'center' }}>
        <p className="pixel-font" style={{ fontSize: '12px', marginBottom: '20px' }}>🍀 행운 뽑기 준비 완료</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button onClick={() => window.print()} className="pixel-button pink" style={{ fontSize: '10px' }}>🖨️ 다시 출력</button>
          <button onClick={() => router.back()} className="pixel-button cyan" style={{ fontSize: '10px' }}>🔙 뒤로가기</button>
        </div>
      </div>

      <div className="print-area" style={{ display: 'block' }}>
        {report}
      </div>

      {/* Preview for Admin */}
      <div className="receipt-preview no-print" style={{ margin: '0 auto' }}>
        {report}
      </div>
    </div>
  );
}
