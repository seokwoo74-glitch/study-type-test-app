import { NextResponse } from "next/server";

type ResultPayload = {
  student?: {
    name?: string;
    grade?: string;
    school?: string;
    phone?: string;
  };
  result?: {
    title?: string;
    subtitle?: string;
    code?: string;
    fullCode?: string;
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

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { ok: false, error: "OPENAI_API_KEY가 설정되어 있지 않습니다." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const payload = (body?.payload ?? {}) as ResultPayload;
    const existingMemo = String(body?.memo ?? "").trim();

    const prompt = `
너는 학습성향검사 결과를 바탕으로 학부모 상담 메모를 작성하는 전문 상담 코치야.
아래 검사 결과를 바탕으로 관리자 메모칸에 바로 붙여넣을 수 있는 상담 코멘트를 작성해줘.

작성 규칙:
- 한국어로 작성
- 과장하거나 단정하지 말고, 상담용 문장으로 부드럽게 작성
- 학생을 비난하지 말 것
- 학부모에게 바로 설명할 수 있게 실용적으로 작성
- 너무 길지 않게 작성하되, 상담 기록으로 충분히 쓸 수 있게 작성
- 형식은 아래 5개 섹션으로 고정

[상담 요약]
[강점]
[주의할 점]
[학습 전략]
[부모 코칭 멘트]

기존 메모가 있다면 참고만 하고, 더 정리된 최종 메모로 다시 작성해줘.

검사 결과 JSON:
${JSON.stringify(compactPayload(payload), null, 2)}

기존 메모:
${existingMemo || "없음"}
`.trim();

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        input: prompt,
        temperature: 0.4,
        max_output_tokens: 900,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[api/ai-comment] OpenAI error:", data);
      return NextResponse.json(
        {
          ok: false,
          error:
            data?.error?.message || "AI 상담 코멘트 생성 중 오류가 발생했습니다.",
        },
        { status: response.status }
      );
    }

    const comment =
      typeof data?.output_text === "string"
        ? data.output_text
        : Array.isArray(data?.output)
        ? data.output
            .flatMap((item: any) => item?.content ?? [])
            .map((content: any) => content?.text ?? "")
            .join("\n")
            .trim()
        : "";

    if (!comment) {
      return NextResponse.json(
        { ok: false, error: "AI 응답을 읽지 못했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, comment });
  } catch (error) {
    console.error("[api/ai-comment] unexpected error:", error);
    return NextResponse.json(
      { ok: false, error: "AI 상담 코멘트 생성 요청에 실패했습니다." },
      { status: 400 }
    );
  }
}
