import { exec } from "child_process";
import { promisify } from "util";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabaseAdmin } from "@/lib/supabase";

const execPromise = promisify(exec);

// 관리자 권한 검증 함수 (개선됨)
function verifyAdmin(request) {
  const authHeader = request.headers.get("authorization");
  const adminPw = process.env.ADMIN_PW;
  if (!adminPw) return false;
  const expectedToken = Buffer.from(`auth_${adminPw}`).toString('base64');
  
  if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
    return false;
  }
  return true;
}

export async function GET(request) {
  // [보안 강화] 모든 AI 생성 요청은 반드시 관리자 인증이 필요함
  if (!verifyAdmin(request)) {
    console.warn("Unauthorized AI Generation attempt blocked.");
    return new Response(JSON.stringify({ error: "Unauthorized. Admin access required." }), { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  
  if (!id) {
    return new Response(JSON.stringify({ error: "ID is required for report generation." }), { status: 400 });
  }

  let name, year, month, day, hour, minute, calendarType, isLeapMonth, isTimeUnknown, gender, topics;

  try {
    console.log(`Fetching record for ID: ${id} using Admin Client`);
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from("saju_reports")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      throw new Error("Record not found");
    }

    name = existing.name;
    year = existing.year;
    month = existing.month;
    day = existing.day;
    hour = existing.hour || "0";
    minute = existing.minute || "0";
    calendarType = existing.calendar_type;
    isLeapMonth = existing.is_leap_month;
    isTimeUnknown = existing.is_time_unknown;
    gender = existing.gender;
    topics = existing.topics || "추천";

    console.log("Saju AI Generation starting for:", name);

    // 1. Call Python sajupy wrapper
    // Railway/Linux 환경에서는 'python3'를 사용하고, 로컬 Windows에서는 'venv' 경로 사용
    const isWin = process.platform === "win32";
    const pythonPath = isWin ? "venv\\Scripts\\python" : "python3";
    
    const calcHour = isTimeUnknown ? "0" : hour;
    const calcMinute = isTimeUnknown ? "0" : minute;

    const { stdout, stderr } = await execPromise(`${pythonPath} saju_wrapper.py ${year} ${month} ${day} ${calcHour} ${calcMinute} ${calendarType} ${isLeapMonth}`);
    const sajuInfo = JSON.parse(stdout);

    // 2. Prepare Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const prompt = `
사용자 정보:
이름: ${name}
성별: ${gender}
생년월일: ${year}년 ${month}월 ${day}일
태어난 시각: ${isTimeUnknown ? "모름 (시주 제외하고 분석 필요)" : `${hour}시 ${minute}분`}
만세력 정보(JSON): ${JSON.stringify(sajuInfo)}
선택 주제: ${topics}

[오행 참고 정보]
- 천간: 갑/을(나무), 병/정(불), 무/기(흙), 경/신(금), 임/계(물)
- 지지: 인/묘(나무), 사/오(불), 진/술/축/미(흙), 신/유(금), 해/자(물)

위 정보를 바탕으로 아주 깊이 있고 긴 호흡의 '사주 레포트'를 작성해주세요. 
영수증(너비 80mm)에 출력할 것이므로 다음 지침을 반드시 지켜주세요:

1. 제목은 반드시 다음 형식을 사용하여 고정된 너비로 작성해주세요:
   ✦ ₊˚ ────────────── ˚₊ ✦
      ${name} 님의 사주 분석 레포트
   ✦ ₊˚ ────────────── ˚₊ ✦

2. [중요] 최상단에 '기본 만세력' 표를 보여주세요. 
   **반드시 제공된 JSON 데이터(sajuInfo)를 바탕으로 4열(시주, 일주, 월주, 연주)의 정렬을 완벽하게 맞춘 표를 만드세요.**
   - 각 칸(천간, 지지)에는 반드시 **하나의 한자, 하나의 한글 발음, 하나의 오행**만 표시해야 합니다. 
   - 지지(아랫줄)의 경우 지장간 등 여러 오행을 나열하지 말고, **제공된 [오행 참고 정보]에 있는 대표 오행 하나만** 적으세요. (열이 어긋나지 않게 하는 것이 가장 중요합니다.)
   ${isTimeUnknown ? "- [주의] 사용자가 태어난 시각을 모르므로, 만세력 표의 '시주' 열(가장 왼쪽 열)의 모든 칸은 한자나 오행 대신 '?' 또는 '-'로 표시해주세요. 또한 분석 내용 도입부에 '태어난 시각을 모르므로 삼주(연, 월, 일)를 바탕으로 분석합니다'라는 안내 문구를 포함해주세요." : ""}
   - 예시 포맷 (반드시 4열 정렬 유지, 구분선 길이를 20자 내외로 유지):
   -----------------------------
     시주   일주   월주   연주
     ${isTimeUnknown ? "  ?   " : "庚(경)"} 庚(경) 己(기) 庚(경)
     ${isTimeUnknown ? "  ?   " : " [금]  "} [금]   [흙]   [금]
     ${isTimeUnknown ? "  ?   " : "辰(진)"} 辰(진) 丑(축) 辰(진)
     ${isTimeUnknown ? "  ?   " : " [흙]  "} [흙]   [흙]   [흙]
   -----------------------------

3. [중요] '< 사주 총평 및 오행 조언 >' 섹션을 작성해주세요. 
   전체적인 사주의 흐름을 비유와 상징을 섞어 설명하되, 특히 오행의 분포(나무, 불, 흙, 금, 물)를 바탕으로 "${name} 님은 어떤 성격인지, 부족한 기운을 보완하기 위해 어떤 사람이나 물건을 가까이하면 좋은지"에 대한 조언을 한데 묶어 작성해주세요. 
   **특히, 내용이 지나치게 긍정적이기만 하면 신뢰도가 떨어질 수 있으므로, ${name} 님이 살면서 '특히 유의해야 할 점(조심해야 할 기운이나 행동) 또는 부족한 점(채워나가야 할 점)'에 대해서도 상대방이 상처받지 않도록 다정하지만 명확하게 한 문단 포함해주세요.**

4. **[매우 중요]** 사용자가 선택한 주제(**${topics}**)에 대해서만 분석을 진행하세요. 선택되지 않은 주제는 절대 언급하지 마세요.
   - 각 선택된 주제별로 **최소 500자 이상의 매우 깊고 풍부한 분석**을 제공해야 합니다. (전체 리포트의 완성도는 이 분석의 깊이에 달렸습니다.)
   - 모든 내용은 **부드러운 내러티브(이야기 방식)**로만 작성하세요. **절대로 '1.', '-', '•' 같은 개조식이나 글머리 기호를 사용하지 마세요.**
   - **[형식 엄수]** 각 주제 시작 시 반드시 **< ${name} 님의 주제명 분석 >** 형태의 말머리를 사용하고, **반드시 줄바꿈(Enter)을 한 번 한 뒤에** 본문 내용을 시작하세요.
   - 분석 가이드라인:
     - **연애운(love)**: < ${name} 님의 연애운 분석 > 말머리로 시작. 타고난 연애 스타일과 매력, 그리고 **2026년부터 향후 5년 중 가장 큰 애정의 기운이 들어오는 '황금기'가 언제인지 집중적으로 분석하고, 5년 전체의 전반적인 흐름을 설명해주세요. 또한 ${name} 님과 사주적으로 기운이 잘 맞는 '찰떡궁합'인 사람의 특징(성격, 오행 등)을 구체적으로 언급해주세요.**
     - **재물운(wealth)**: < ${name} 님의 재물운 분석 > 말머리로 시작. **본인의 기운(일간 등)에 의거하여 어떤 '재물 관리 및 축적 스타일'을 가졌는지 먼저 설명하고, 이를 바탕으로 현재 나이 기준 향후 50년간(10년 단위 5단계)의 장기 재운 로드맵을 흐름 위주로 풀어내주세요.**
     - **직장운(career)**: < ${name} 님의 직장운 분석 > 말머리로 시작. **본인의 타고난 기운을 바탕으로 가장 잠재력을 발휘할 수 있는 직무와 직업군을 구체적으로 추천해주세요. 또한 직장 생활에서의 본인만의 뚜렷한 강점과 보완해야 할 약점을 분석하고, 이를 바탕으로 업무 시 조심해야 할 점이나 시너지가 나는 동료(귀인)의 특징을 심도 있게 다뤄주세요.**
     - **건강운(health)**: < ${name} 님의 건강운 분석 > 말머리로 시작. **전체적인 사주 오행의 균형을 진단하고, 이를 바탕으로 본인이 선천적으로 다소 약하거나 보완해야 할 신체 부위를 정확히 짚어주세요. 더불어 현재 나이 기준 향후 50년간(10년 단위 5단계)의 건강 흐름을 설명하면서, 각 시기별로 특히 컨디션 관리에 유의해야 할 점을 다정하면서도 경각심을 줄 수 있는 어조로 조언해주세요.**
     - **학업운(academic)**: < ${name} 님의 학업운 분석 > 말머리로 시작. **본인의 학습 성향(예: 몰입형/분산형, 이론/실습 선호 등)과 타고난 집중력의 특징을 분석하고, 이를 바탕으로 가장 효과적인 학습 전략과 시간 관리법을 제시해주세요. 또한 ${name} 님의 학업 능률을 최고로 끌어올릴 수 있는 '최적의 공부 환경'과 집중력 향상에 도움이 되는 구체적인 환경적 요인(소음, 조명, 공간 배치 등)에 대해 조언해주세요.**

5. **[절대 엄수] 줄바꿈 및 공백 지침**: 
   - **본문 문단 내에서는 문장 사이에 인위적인 줄바꿈이나 불필요한 띄어쓰기를 절대 하지 마세요.** 
   - 각 주제별 본문은 **처음부터 끝까지 단 하나의 연속된 긴 줄(문단)**로 작성해야 합니다. 
   - 오직 **말머리 직후**와 **섹션 사이(예: 총평과 연애운 사이)**에만 줄바꿈을 넣어 구분하세요. 
   - 영수증 너비에 맞춘 자동 줄바꿈은 시스템이 처리하므로, 본문 텍스트 내부에 수동으로 엔터(Enter)를 입력하지 마세요.
6. 말투는 신뢰감 있으면서도 통통 튀고 다정한 Y2K 감성으로 해주세요.
7. 전체 길이는 영수증 3~4장 분량(약 1500~2000자)으로 아주 풍성하게 작성해주세요.
8. 마지막에는 사용자를 위한 따뜻한 축복과 응원의 한마디를 잊지 마세요.
`;

    let text = "";
    const modelName = "gemini-3.1-flash-lite";
    console.log(`Calling Gemini API (${modelName})...`);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    text = response.text();

    // Update DB
    await supabaseAdmin.from("saju_reports").update({ report: text }).eq("id", id);

    return new Response(JSON.stringify({ report: text }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("AI Generation Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
