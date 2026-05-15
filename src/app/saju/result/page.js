"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

// Register fonts for PDF (Korean fonts are tricky in react-pdf without external links)
// For now, we'll use a basic approach. In a real app, you'd host a .ttf file.
Font.register({
  family: "NanumGothic",
  src: "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/nanumgothic/NanumGothic-Regular.ttf",
});

const styles = StyleSheet.create({
  page: { padding: 30, backgroundColor: "#ffffff", fontFamily: "NanumGothic" },
  title: { fontSize: 24, marginBottom: 20, textAlign: "center", color: "#ff4081" },
  section: { margin: 10, padding: 10, flexGrow: 1 },
  text: { fontSize: 12, lineHeight: 1.6, color: "#333333" },
  header: { fontSize: 10, marginBottom: 20, color: "#999", textAlign: "right" },
});

// PDF Document Component
const SajuPDF = ({ name, report }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text>축제 행운 & 사주 자판기 | 2026 Festival</Text>
      </View>
      <Text style={styles.title}>{name} 님의 사주 레포트</Text>
      <View style={styles.section}>
        <Text style={styles.text}>{report}</Text>
      </View>
      <View style={{ marginTop: 40, borderTop: 1, paddingTop: 10, textAlign: "center" }}>
        <Text style={{ fontSize: 10, color: "#ff4081" }}>오늘 하루 당신에게 행운이 가득하기를 바랍니다! 🌸</Text>
      </View>
    </Page>
  </Document>
);

function SajuResultContent() {
  const searchParams = useSearchParams();
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDataReady, setIsDataReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showNotification, setShowNotification] = useState(false);

  const name = searchParams.get("name");

  // Progress bar logic
  useEffect(() => {
    let timer;
    if (loading) {
      timer = setInterval(() => {
        setProgress((prev) => {
          if (isDataReady) {
            // When data is ready, fill to 100% quickly
            const next = prev + Math.random() * 20;
            return next >= 100 ? 100 : next;
          }
          // Normal slow progression
          if (prev < 40) return prev + Math.random() * 5;
          if (prev < 80) return prev + Math.random() * 2;
          if (prev < 99) return prev + 0.2;
          return prev;
        });
      }, 500); // Update every 0.5s for smoothness
    }
    return () => clearInterval(timer);
  }, [loading, isDataReady]);

  // Handle completion
  useEffect(() => {
    if (progress === 100 && isDataReady) {
      const timeout = setTimeout(() => {
        setLoading(false);
      }, 600); // Short delay at 100% for impact
      return () => clearTimeout(timeout);
    }
  }, [progress, isDataReady]);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const query = searchParams.toString();
        const res = await fetch(`/api/saju?${query}`);
        const data = await res.json();
        if (data.report) {
          setReport(data.report);
          setShowNotification(true);
          setIsDataReady(true); // Signal that we can finish the progress bar
        }
      } catch (error) {
        console.error(error);
        setLoading(false); // Fallback on error
      }
    };

    fetchReport();
  }, [searchParams]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="container">
        <div className="pixel-card" style={{ textAlign: 'center' }}>
          <div className="bounce" style={{ fontSize: '3rem', marginBottom: '20px' }}>🔮</div>
          <h2 className="pixel-font" style={{ fontSize: '14px', lineHeight: '2' }}>
            사주 레포트를<br />생성중이에요...
          </h2>

          <div className="progress-container">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="progress-text">{Math.floor(progress)}% COMPLETE</p>

          <p style={{ marginTop: '20px' }}>잠시만 기다려 주세요! ✨</p>
          <p style={{ marginTop: '10px', fontSize: '0.8rem', color: '#888' }}>
            (최대 60초 정도 소요될 수 있어요)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {showNotification && (
        <div className="pixel-card bounce no-print" style={{ background: 'var(--accent-color)', zIndex: 100, position: 'fixed', top: '20px', width: '90%', maxWidth: '500px' }}>
          <p style={{ fontWeight: 'bold', textAlign: 'center' }}>
            🔔 {name} 님의 사주 레포트가 완성됐어요!
          </p>
          <button
            onClick={() => setShowNotification(false)}
            style={{ position: 'absolute', right: '10px', top: '10px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
          >
            X
          </button>
        </div>
      )}

      <h2 className="pixel-font no-print" style={{ fontSize: '18px', color: 'var(--primary-color)', marginBottom: '20px', marginTop: '60px' }}>
        사주 분석 결과
      </h2>

      <div className="pixel-card no-print">
        <p style={{ marginBottom: '10px', fontSize: '0.9rem', color: '#666' }}>웹 화면 미리보기:</p>
        <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'Gaegu, sans-serif', fontSize: '1.2rem', lineHeight: '1.6', textAlign: 'center' }}>
          {report}
        </div>
      </div>

      <div className="no-print" style={{ marginTop: '40px' }}>
        <p style={{ marginBottom: '10px', fontSize: '0.9rem', color: '#666' }}>영수증 출력 미리보기:</p>
        <div className="receipt-preview">
          {report}
        </div>
      </div>

      <div className="no-print" style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', width: '100%', marginBottom: '40px', marginTop: '20px' }}>
        <button onClick={handlePrint} className="pixel-button cyan" style={{ flex: 1, minWidth: '150px' }}>
          🖨️ 영수증 출력
        </button>

        <PDFDownloadLink
          document={<SajuPDF name={name} report={report} />}
          fileName={`${name}_사주레포트.pdf`}
          className="pixel-button pink"
          style={{ flex: 1, minWidth: '150px' }}
        >
          {({ loading }) => (loading ? "📄 PDF 준비중..." : "📄 PDF 저장")}
        </PDFDownloadLink>

        <Link href="/" className="pixel-button" style={{ width: '100%' }}>
          🏠 처음으로
        </Link>
      </div>

      {/* Actual Print Area (Receipt Style) */}
      <div className="print-area" style={{ display: 'none' }}>
        {report}
      </div>
    </div>
  );
}

export default function SajuResult() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SajuResultContent />
    </Suspense>
  );
}
