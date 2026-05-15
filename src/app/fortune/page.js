"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function FortuneResult() {
    const [report, setReport] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/fortune")
            .then(res => res.json())
            .then(data => {
                setReport(data.report);
                setLoading(false);
            });
    }, []);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="container">
                <div className="pixel-card" style={{ textAlign: 'center' }}>
                    <div className="bounce" style={{ fontSize: '3rem', marginBottom: '20px' }}>🍀</div>
                    <h2 className="pixel-font" style={{ fontSize: '14px' }}>행운을 가져오는 중...</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <h2 className="pixel-font no-print" style={{ fontSize: '18px', color: 'var(--secondary-color)', marginBottom: '20px' }}>
                오늘의 행운 도착!
            </h2>

            <div className="pixel-card no-print">
                <p style={{ marginBottom: '10px', fontSize: '0.9rem', color: '#666' }}>웹 화면 미리보기:</p>
                <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'Gaegu, sans-serif', fontSize: '1.2rem', lineHeight: '1.6', textAlign: 'center' }}>
                    {report}
                </div>
            </div>

            <div className="no-print" style={{ marginTop: '20px', marginBottom: '20px' }}>
                <p style={{ marginBottom: '10px', fontSize: '0.9rem', color: '#666' }}>영수증 출력 미리보기:</p>
                <div className="receipt-preview">
                    {report}
                </div>
            </div>

            <div className="no-print" style={{ display: 'flex', gap: '15px', width: '100%', marginBottom: '40px' }}>
                <button onClick={handlePrint} className="pixel-button cyan" style={{ flex: 1 }}>
                    🖨️ 영수증 출력
                </button>
                <Link href="/" className="pixel-button" style={{ flex: 1 }}>
                    🏠 처음으로
                </Link>
            </div>

            {/* Actual Print Area */}
            <div className="print-area" style={{ display: 'none' }}>
                {report}
            </div>
        </div>
    );
}
