import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), 'src', 'app', 'api', 'fortune');

    // fortunes.txt 읽기 및 랜덤 선택
    const fortunesRaw = fs.readFileSync(path.join(dataDir, 'fortunes.txt'), 'utf8');
    const fortuneList = fortunesRaw.split('===').map(f => f.trim()).filter(f => f);
    let fortuneBody = fortuneList[Math.floor(Math.random() * fortuneList.length)];

    // 각 줄의 앞뒤 공백 제거 및 내부 줄바꿈 제거 (한 문단으로 만들기)
    const lines = fortuneBody.split('\n').map(line => line.trim()).filter(line => line);
    if (lines.length > 1) {
      // 첫 줄은 제목으로 유지, 나머지는 하나로 합침
      fortuneBody = lines[0] + '\n\n' + lines.slice(1).join(' ');
    } else {
      fortuneBody = lines[0] || "";
    }

    // 로또 번호 생성
    const lottoNumbers = [];
    while (lottoNumbers.length < 6) {
      const num = Math.floor(Math.random() * 45) + 1;
      if (!lottoNumbers.includes(num)) {
        lottoNumbers.push(num);
      }
    }
    lottoNumbers.sort((a, b) => a - b);
    const lottoStr = lottoNumbers.map(n => String(n).padStart(2, '0')).join(' / ');
    // 파이썬 스크립트의 양식을 기반으로 하되, CSS 중앙 정렬을 위해 불필요한 공백 제거
    const report = `${fortuneBody}

-----------------------
🎫 추천 로또 번호 🎫

[ ${lottoStr} ]

-----------------------

🔥 [ 놓치면 손해! 500원 할인 쿠폰 ] 🔥

3개 이상 구매 시 500원 할인 적용!
구매 시 사주 무료로 봐드립니다.

- 사용기한: 오늘 단 하루!

-----------------------`;

    return new Response(JSON.stringify({ report }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating fortune:", error);
    return new Response(JSON.stringify({ report: "운세를 불러오는 중 오류가 발생했습니다." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
