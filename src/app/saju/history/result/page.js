"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function HistoryResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const name = searchParams.get("name");
      const password = searchParams.get("password");
      
      try {
        const res = await fetch(`/api/saju/history?name=${name}&password=${password}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [searchParams]);

  if (loading) return <div className="container"><p className="pixel-font">검색 중...</p></div>;

  return (
    <div className="container" style={{ justifyContent: 'flex-start', paddingTop: '60px' }}>
      <Link href="/saju/history" className="pixel-button" style={{ position: 'absolute', top: '20px', left: '20px', fontSize: '10px' }}>
        ← 뒤로
      </Link>

      <h2 className="pixel-font" style={{ fontSize: '16px', marginBottom: '30px' }}>검색 결과 ({results.length})</h2>

      {results.length === 0 ? (
        <div className="pixel-card">
          <p>일치하는 결과가 없습니다.</p>
          <Link href="/saju" className="pixel-button cyan" style={{ display: 'block', marginTop: '20px', textAlign: 'center' }}>
            새로 생성하기
          </Link>
        </div>
      ) : (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {results.map((item) => (
            <div 
              key={item.id} 
              className="pixel-card" 
              style={{ cursor: 'pointer' }}
              onClick={() => {
                const query = new URLSearchParams({
                  name: item.name,
                  year: item.year,
                  month: item.month,
                  day: item.day,
                  hour: item.hour || "",
                  minute: item.minute || "",
                  isTimeUnknown: item.is_time_unknown.toString(),
                  password: searchParams.get("password")
                }).toString();
                router.push(`/saju/result?${query}`);
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p className="pixel-font" style={{ fontSize: '14px', marginBottom: '5px' }}>{item.name} 님의 사주</p>
                  <p style={{ fontSize: '0.8rem', color: '#666' }}>
                    {item.year}-{item.month}-{item.day} {item.is_time_unknown ? "(시간 모름)" : `${item.hour}:${item.minute}`}
                  </p>
                </div>
                <span style={{ fontSize: '1.2rem' }}>➡️</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function HistoryResultPage() {
  return (
    <Suspense fallback={<div className="container"><p className="pixel-font">로딩 중...</p></div>}>
      <HistoryResultContent />
    </Suspense>
  );
}
