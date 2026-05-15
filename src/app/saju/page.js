"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SajuInput() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    year: "",
    month: "",
    day: "",
    hour: "",
    minute: "0",
    isTimeUnknown: false,
    gender: "1", // 1: Male, 0: Female
    topics: [],
    calendarType: "solar", // solar or lunar
    isLeapMonth: false,
  });

  const topicsList = [
    { id: "love", label: "💘 연애운" },
    { id: "wealth", label: "💰 재물운" },
    { id: "career", label: "💼 직장운" },
    { id: "health", label: "🏥 건강운" },
    { id: "academic", label: "📚 학업운" },
  ];

  // 로딩 중 프로그레스 바 시뮬레이션
  useEffect(() => {
    let interval;
    if (loading && progress < 90) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          // 초반엔 좀 빠르다가 점점 느려지게
          const increment = prev < 50 ? 5 : 2;
          return prev + increment;
        });
      }, 800); // 약 15~20초에 90% 도달
    }
    return () => clearInterval(interval);
  }, [loading, progress]);

  const handleTopicToggle = (topicId) => {
    if (formData.topics.includes(topicId)) {
      setFormData({ ...formData, topics: formData.topics.filter(t => t !== topicId) });
    } else if (formData.topics.length < 3) {
      setFormData({ ...formData, topics: [...formData.topics, topicId] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.topics.length === 0) {
      alert("관심 분야를 최소 1개 선택해주세요!");
      return;
    }
    setLoading(true);
    setProgress(0);

    try {
      const queryParams = new URLSearchParams({
        ...formData,
        topics: formData.topics.join(",")
      }).toString();

      const response = await fetch(`/api/saju/submit?${queryParams}`);
      if (response.ok) {
        setSubmitted(true);
        setLoading(false);
      } else {
        alert("신청 중 오류가 발생했습니다. 다시 시도해주세요.");
        setLoading(false);
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("서버 연결에 실패했습니다.");
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="container">
        <div className="pixel-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>✅</div>
          <h2 className="pixel-font" style={{ fontSize: '18px', color: 'var(--primary-color)', marginBottom: '20px' }}>
            신청이 완료되었습니다!
          </h2>
          <p style={{ lineHeight: '1.6', marginBottom: '30px' }}>
            {formData.name} 님의 사주 분석 신청이<br />
            정상적으로 접수되었습니다.<br /><br />
            운영진에게 가서 성함을 말씀해 주시면<br />
            멋진 영수증 레포트를 출력해 드릴게요! 📜
          </p>
          <Link href="/" className="pixel-button cyan" style={{ width: '100%' }}>
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container">
        <div className="pixel-card" style={{ textAlign: 'center' }}>
          <div className="bounce" style={{ fontSize: '3rem', marginBottom: '20px' }}>🔮</div>
          <h2 className="pixel-font" style={{ fontSize: '14px', lineHeight: '2' }}>
            신청 정보를<br />접수하는 중이에요...
          </h2>
          <p style={{ marginTop: '20px' }}>잠시만 기다려 주세요! ✨</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ justifyContent: 'flex-start', paddingTop: '40px' }}>
      <div style={{ textAlign: 'center', width: '100%', marginBottom: '30px' }}>
        <h2 className="pixel-font" style={{ fontSize: '18px', color: 'var(--primary-color)', margin: 0 }}>
          📜 사주 정보 입력
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '10px' }}>정보를 입력하면 운영진이 출력해 드립니다!</p>
      </div>

      <form onSubmit={handleSubmit} className="pixel-card">
        <div className="input-group">
          <label>이름</label>
          <input
            type="text"
            className="pixel-input"
            required
            placeholder="이름을 입력하세요"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="input-group">
          <label>달력 구분</label>
          <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="calendarType"
                value="solar"
                checked={formData.calendarType === "solar"}
                onChange={(e) => setFormData({ ...formData, calendarType: e.target.value })}
              />
              양력
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="calendarType"
                value="lunar"
                checked={formData.calendarType === "lunar"}
                onChange={(e) => setFormData({ ...formData, calendarType: e.target.value })}
              />
              음력
            </label>
            {formData.calendarType === "lunar" && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', marginLeft: '10px' }}>
                <input
                  type="checkbox"
                  checked={formData.isLeapMonth}
                  onChange={(e) => setFormData({ ...formData, isLeapMonth: e.target.checked })}
                />
                윤달
              </label>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }} className="input-group">
          <div>
            <label>년 (YYYY)</label>
            <input
              type="number"
              className="pixel-input"
              required
              placeholder="1995"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
            />
          </div>
          <div>
            <label>월</label>
            <input
              type="number"
              className="pixel-input"
              required
              min="1" max="12"
              value={formData.month}
              onChange={(e) => setFormData({ ...formData, month: e.target.value })}
            />
          </div>
          <div>
            <label>일</label>
            <input
              type="number"
              className="pixel-input"
              required
              min="1" max="31"
              value={formData.day}
              onChange={(e) => setFormData({ ...formData, day: e.target.value })}
            />
          </div>
        </div>

        <div className="input-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '10px' }}>
            <input
              type="checkbox"
              checked={formData.isTimeUnknown}
              onChange={(e) => setFormData({ ...formData, isTimeUnknown: e.target.checked })}
            />
            <span style={{ fontSize: '0.9rem' }}>태어난 시각을 몰라요</span>
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }} className="input-group">
          <div>
            <label>시 (0-23)</label>
            <input
              type="number"
              className="pixel-input"
              required={!formData.isTimeUnknown}
              disabled={formData.isTimeUnknown}
              min="0" max="23"
              value={formData.hour}
              onChange={(e) => setFormData({ ...formData, hour: e.target.value })}
            />
          </div>
          <div>
            <label>분</label>
            <input
              type="number"
              className="pixel-input"
              required={!formData.isTimeUnknown}
              disabled={formData.isTimeUnknown}
              min="0" max="59"
              value={formData.minute}
              onChange={(e) => setFormData({ ...formData, minute: e.target.value })}
            />
          </div>
        </div>

        <div className="input-group">
          <label>성별</label>
          <div style={{ display: 'flex', gap: '20px' }}>
            <label style={{ cursor: 'pointer' }}>
              <input
                type="radio"
                name="gender"
                value="1"
                checked={formData.gender === "1"}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              /> 남자
            </label>
            <label style={{ cursor: 'pointer' }}>
              <input
                type="radio"
                name="gender"
                value="0"
                checked={formData.gender === "0"}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              /> 여자
            </label>
          </div>
        </div>

        <div className="input-group">
          <label>관심 분야 (최대 3개)</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {topicsList.map(topic => (
              <button
                key={topic.id}
                type="button"
                className={`pixel-button ${formData.topics.includes(topic.id) ? 'cyan' : ''}`}
                style={{ fontSize: '12px', padding: '10px', margin: '0', fontFamily: 'Gaegu' }}
                onClick={() => handleTopicToggle(topic.id)}
              >
                {topic.label}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" className="pixel-button pink" style={{ width: '100%', marginTop: '20px' }}>
          분석 신청하기 ✨
        </button>
      </form>
    </div>
  );
}
