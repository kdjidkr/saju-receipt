"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

export default function AdminPrintPage({ params }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const router = useRouter();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin/login");
      return;
    }

    if (id) {
      console.log(`Fetching report for ID: ${id} with Auth`);
      fetch(`/api/admin/reports/${id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.report) {
            setReportData(data.report);
          } else {
            console.error("Report not found in response", data);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error("Fetch error:", err);
          setLoading(false);
        });
    }
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="container">
        <p className="pixel-font">레포트를 불러오는 중...</p>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="container">
        <div className="pixel-card no-print" style={{ textAlign: 'center' }}>
          <p style={{ marginBottom: '20px' }}>레포트를 찾을 수 없습니다. (ID: {id})</p>
          <button onClick={() => router.back()} className="pixel-button cyan">뒤로가기</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="pixel-card no-print" style={{ textAlign: 'center' }}>
        <h2 className="pixel-font" style={{ fontSize: '18px', color: 'var(--primary-color)', marginBottom: '10px' }}>
          {reportData.name} 님의 레포트
        </h2>
        <p style={{ fontSize: '0.8rem', color: '#666' }}>신청일시: {new Date(reportData.created_at).toLocaleString()}</p>

        <div className="receipt-preview" style={{ margin: '20px auto' }}>
          {reportData.report}
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button onClick={handlePrint} className="pixel-button pink" style={{ flex: 1, margin: 0 }}>
            🖨️ 영수증 출력
          </button>
          <button onClick={() => router.back()} className="pixel-button cyan" style={{ flex: 1, margin: 0 }}>
            ⬅️ 목록으로
          </button>
        </div>
      </div>

      {/* Actual Print Area (Hidden on screen, shown in @media print) */}
      <div className="print-area">
        {reportData.report}
      </div>
    </div>
  );
}
