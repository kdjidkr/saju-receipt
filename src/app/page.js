import Link from "next/link";

export default function Home() {
  return (
    <div className="container">
      <div className="bounce" style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--primary-color)', textShadow: '4px 4px 0px var(--secondary-color)' }}>
          FESTIVAL<br />FORTUNE
        </h1>
        <p className="pixel-font" style={{ fontSize: '10px', marginTop: '10px' }}>PRESS BUTTON TO START</p>
      </div>

      <div className="pixel-card" style={{ textAlign: 'center', background: '#fff' }}>
        <p style={{ fontSize: '1.5rem', marginBottom: '20px', fontWeight: 'bold' }}>
          ✨ 오늘의 행운과 사주 ✨
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%' }}>
          <Link href="/saju" className="pixel-button pink" style={{ width: '100%' }}>
            📜 사주 정보 입력하기
          </Link>
        </div>

        <p style={{ marginTop: '20px', fontSize: '0.9rem', color: '#666' }}>
          * 사주 레포트는 버터떡/두쫀쿠 세트 구매자 전용입니다!
        </p>
      </div>

      <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <Link href="/admin" className="pixel-button" style={{ background: '#eee', fontSize: '10px', padding: '10px 20px', boxShadow: '4px 4px 0px #000' }}>
          🛠️ 관리자
        </Link>
        
        <div style={{ fontSize: '1.2rem', marginTop: '10px' }}>🌸 🦄 🍬 🍭 🌸</div>
      </div>
    </div>
  );
}
