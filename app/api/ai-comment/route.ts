import { NextResponse } from "next/server";

type ResultPayload = {
  student?: {
    name?: string;
    grade?: string;
    school?: string;
    phone?: string;
  };
  result?: {
    key?: string;
    code?: string;
    fullCode?: string;
    title?: string;
    subtitle?: string;
    summary?: string;
    strategy?: string;
    parent?: string;
    path?: string;
    danger?: string;
    talk?: string;
  };
  scores?: {
    E?: number;
    P?: number;
    R?: number;
    C?: number;
    M?: number;
    O?: number;
    S?: number;
    F?: number;
  };
  diffs?: {
    social?: number;
    judgment?: number;
    track?: number;
    style?: number;
  };
  meta?: {
    testType?: "elementary" | "high" | null;
    totalAnswered?: number;
    totalQuestions?: number;
  };
};

function compactPayload(payload: ResultPayload) {
  return {
    student: {
      name: payload.student?.name ?? "",
      grade: payload.student?.grade ?? "",
      school: payload.student?.school ?? "",
    },
    result: {
      title: payload.result?.title ?? "",
      subtitle: payload.result?.subtitle ?? "",
      code: payload.result?.fullCode ?? payload.result?.code ?? "",
      summary: payload.result?.summary ?? "",
      strategy: payload.result?.strategy ?? "",
      parent: payload.result?.parent ?? "",
      path: payload.result?.path ?? "",
      danger: payload.result?.danger ?? "",
      talk: payload.result?.talk ?? "",
    },
    scores: payload.scores ?? {},
    diffs: payload.diffs ?? {},
    meta: payload.meta ?? {},
  };
}

function fallbackComment(payload: ResultPayload) {
  const name = payload.student?.name || "학생";
  const title = payload.result?.title || "학습성향 분석 결과";
  const summary =
    payload.result?.summary ||
    "현재 응답을 바탕으로 학습 성향과 전략을 정리할 필요가 있습니다.";
  const strategy =
    payload.result?.strategy ||
    "기본 학습 루틴을 안정화하고 강점 과목 중심으로 성취 경험을 쌓는 것이 좋습니다.";
  const parent =
    payload.result?.parent ||
    "학생의 현재 방식과 정서를 함께 살피며 무리하지 않는 점검이 필요합니다.";
  const danger =
    payload.result?.danger ||
    "목표가 막연하면 실천력이 떨어질 수 있으므로 작은 목표부터 확인하는 것이 좋습니다.";

  return `[AI 상담 코멘트]

1. 핵심 요약
${name} 학생은 「${title}」 성향으로 보입니다. ${summary}

2. 상담 시 강조 포인트
현재 결과에서 가장 중요한 부분은 강점을 살리되, 학습 루틴이 흔들리지 않도록 관리하는 것입니다. ${strategy}

3. 학부모 안내 문장
학부모님께는 “아이의 성향을 바꾸려고 하기보다, 지금 가진 강점이 실제 성과로 이어지도록 환경과 루틴을 함께 잡아주는 것이 중요합니다.”라고 안내하면 좋겠습니다. ${parent}

4. 주의할 부분
${danger}

5. 다음 실행 제안
이번 상담 후에는 한 번에 많은 것을 바꾸기보다, 2주 동안 실천할 과목 1개와 습관 1개를 정해 확인하는 방식이 적합합니다.`;
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { ok: false, error: "OPENAI_API_KEY is not set" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const payload = (body?.payload || body?.result_payload || {}) as ResultPayload;

    if (!payload || typeof payload !== "object") {
      return NextResponse.json(
        { ok: false, error: "결과 데이터가 없습니다." },
        { status: 400 }
      );
    }

    const compact = compactPayload(payload);

    const systemPrompt = `
너는 학원/교육상담 현장에서 사용하는 전문 상담 코멘트 작성자다.
목표는 관리자가 학부모 상담 전에 바로 읽고 사용할 수 있는 고급 상담 메모를 만드는 것이다.

반드시 지킬 규칙:
- 한국어로 작성한다.
- 과장, 단정, 진단 표현을 피한다.
- "무조건", "반드시 성공", "문제아" 같은 표현 금지.
- 학부모에게 전달 가능한 부드럽고 전문적인 말투.
- 학생의 강점을 먼저 인정하고, 이후 보완점을 제시한다.
- 결과 유형명, 점수, 전략, 위험 포인트를 반영한다.
- 너무 길지 않게, 실제 메모칸에 넣기 좋은 분량으로 작성한다.
- 마크다운 표는 쓰지 않는다.
- 상담사가 바로 읽을 수 있게 제목과 번호를 붙인다.

출력 형식:
[AI 상담 코멘트]

1. 한 줄 핵심
- 학생을 한 문장으로 요약

2. 상담 요약
- 현재 학습성향을 3~4문장으로 설명

3. 학부모 안내 포인트
- 학부모에게 말하기 좋은 문장 3개

4. 학습 전략
- 오늘부터 적용할 수 있는 실행 전략 3개

5. 주의할 점
- 상담 시 조심해야 할 부분 2~3개

6. 다음 상담 전 확인할 것
- 2주 뒤 확인할 체크포인트 3개
`.trim();

    const userPrompt = `
아래 검사 결과를 바탕으로 상담 메모를 작성해줘.

검사 결과 JSON:
${JSON.stringify(compact, null, 2)}
`.trim();

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        temperature: 0.65,
        max_output_tokens: 1200,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const message =
        data?.error?.message ||
        data?.message ||
        "AI 코멘트 생성에 실패했습니다.";

      return NextResponse.json(
        { ok: false, error: message },
        { status: response.status }
      );
    }

    const comment =
      data?.output_text ||
      data?.output?.[0]?.content?.[0]?.text ||
      data?.output?.[1]?.content?.[0]?.text ||
      "";

    return NextResponse.json({
      ok: true,
      comment: String(comment || fallbackComment(payload)).trim(),
    });
  } catch (error) {
    console.error("[api/ai-comment] unexpected error:", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "AI 코멘트 생성 중 알 수 없는 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
