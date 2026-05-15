"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminDashboard() {
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [printContent, setPrintContent] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin/login");
    } else {
      fetchReports();
      const interval = setInterval(fetchReports, 30000);
      return () => clearInterval(interval);
    }
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch("/api/admin/reports", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.reports) {
        setReports(data.reports);
      }
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (id) => {
    setProcessingId(id);
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`/api/saju?id=${id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        await fetchReports(); // Refresh data
      } else {
        alert("레포트 생성 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("Generation error:", error);
      alert("서버 통신 오류가 발생했습니다.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`/api/admin/reports?id=${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        setReports(reports.filter(r => r.id !== id));
      } else {
        alert("삭제 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("서버 통신 오류가 발생했습니다.");
    }
  };

  const handleQuickPrint = (content) => {
    setPrintContent(content);
    // Use a slightly longer timeout to ensure content is fully rendered in the hidden print-area
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const handleFortuneDrawAndPrint = async () => {
    try {
      const response = await fetch("/api/fortune");
      const data = await response.json();
      if (data.report) {
        handleQuickPrint(data.report);
      }
    } catch (error) {
      console.error("Fortune error:", error);
      alert("행운 뽑기 중 오류가 발생했습니다.");
    }
  };

  if (loading) {
    return (
      <div className="container">
        <p className="pixel-font">목록을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '1000px', justifyContent: 'flex-start', paddingTop: '40px' }}>
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '30px' }}>
        <h1 className="pixel-font" style={{ fontSize: '20px', color: 'var(--primary-color)' }}>
          🛠️ 어드민 패널
        </h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleFortuneDrawAndPrint} className="pixel-button cyan" style={{ fontSize: '11px', padding: '10px 15px', margin: 0 }}>
            🍀 행운 뽑기
          </button>
          <button onClick={fetchReports} className="pixel-button" style={{ fontSize: '11px', padding: '10px 15px', margin: 0 }}>
            🔄 새로고침
          </button>
        </div>
      </div>

      <div className="pixel-card no-print" style={{ width: '100%', padding: '10px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Gaegu' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #000' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>신청 시간</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>이름</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>상태</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>작업</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px', fontSize: '0.8rem' }}>
                  {new Date(report.created_at).toLocaleTimeString()}
                </td>
                <td style={{ padding: '10px', fontWeight: 'bold' }}>{report.name}</td>
                <td style={{ padding: '10px' }}>
                  {report.report ? (
                    <span style={{ color: 'green', fontSize: '0.8rem' }}>✅ 생성됨</span>
                  ) : (
                    <span style={{ color: 'orange', fontSize: '0.8rem' }}>⏳ 대기중</span>
                  )}
                </td>
                <td style={{ padding: '10px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    {!report.report ? (
                      <button
                        onClick={() => handleGenerate(report.id)}
                        disabled={processingId === report.id}
                        className="pixel-button pink"
                        style={{ fontSize: '11px', padding: '8px 12px', margin: 0 }}
                      >
                        {processingId === report.id ? "생성중..." : "🪄 생성"}
                      </button>
                    ) : (
                      <>
                        <Link
                          href={`/admin/print/${report.id}`}
                          className="pixel-button cyan"
                          style={{ fontSize: '11px', padding: '8px 12px', margin: 0 }}
                        >
                          🔍 조회
                        </Link>
                        <button
                          onClick={() => handleQuickPrint(report.report)}
                          className="pixel-button pink"
                          style={{ fontSize: '11px', padding: '8px 12px', margin: 0 }}
                        >
                          🖨️ 출력
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(report.id)}
                      className="pixel-button"
                      style={{ 
                        fontSize: '11px', 
                        padding: '8px 12px', 
                        margin: 0, 
                        background: '#ffcdd2', 
                        color: '#b71c1c',
                        border: '2px solid #000'
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Link href="/" className="pixel-button no-print" style={{ marginTop: '20px', fontSize: '12px' }}>
        🏠 메인으로
      </Link>

      {/* Hidden Print Area that is always present and updated */}
      <div className="print-area">
        {printContent}
      </div>
    </div>
  );
}
