import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

type SubmissionPayload = {
  student: {
    name: string;
    grade: string;
    school: string;
    phone: string;
  };
  answers: number[];
  resultKey: string;
  resultCode: string;
  reportTitle: string;
  scores: Record<string, number>;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SubmissionPayload;

    const payload = {
      student_name: String(body?.student?.name ?? ""),
      student_grade: String(body?.student?.grade ?? ""),
      student_school: String(body?.student?.school ?? ""),
      student_phone: String(body?.student?.phone ?? ""),
      result_key: String(body?.resultKey ?? ""),
      result_code: String(body?.resultCode ?? ""),
      report_title: String(body?.reportTitle ?? ""),
      answers: Array.isArray(body?.answers) ? body.answers : [],
      scores:
        body?.scores && typeof body.scores === "object" ? body.scores : {},
    };

    const { error } = await supabaseAdmin
      .from("study_type_submissions")
      .insert(payload);

    if (error) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, message: "제출 저장 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("study_type_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: 500 }
      );
    }

    const items = (data ?? []).map((row) => ({
      id: row.id,
      createdAt: row.created_at,
      student: {
        name: row.student_name ?? "",
        grade: row.student_grade ?? "",
        school: row.student_school ?? "",
        phone: row.student_phone ?? "",
      },
      answers: Array.isArray(row.answers) ? row.answers : [],
      resultKey: row.result_key ?? "",
      resultCode: row.result_code ?? "",
      reportTitle: row.report_title ?? "",
      scores: row.scores && typeof row.scores === "object" ? row.scores : {},
    }));

    return NextResponse.json({ ok: true, items });
  } catch {
    return NextResponse.json(
      { ok: false, message: "목록 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}