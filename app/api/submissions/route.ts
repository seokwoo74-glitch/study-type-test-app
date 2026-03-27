import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

type SubmissionPayload = {
  student: {
    name: string;
    grade: string;
    school?: string;
    phone?: string;
  };
  answers: number[];
  resultKey: string;
  resultCode: string;
  reportTitle: string;
  scores: Record<string, number>;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<SubmissionPayload>;

    if (!body.student?.name || !body.student?.grade) {
      return NextResponse.json(
        { ok: false, error: "학생 이름과 학년이 필요합니다." },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.answers)) {
      return NextResponse.json(
        { ok: false, error: "answers 형식이 올바르지 않습니다." },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin.from("test_results").insert({
      student_name: body.student.name,
      grade: body.student.grade,
      school: body.student.school ?? "",
      phone: body.student.phone ?? "",
      answers: body.answers,
      result_key: body.resultKey ?? "",
      result_code: body.resultCode ?? "",
      report_title: body.reportTitle ?? "",
      scores: body.scores ?? {},
    });

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { ok: false, error: "서버 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}