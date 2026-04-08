import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const insertRow = {
      student_name: String(body.student_name ?? ""),
      grade: String(body.grade ?? ""),
      school: String(body.school ?? ""),
      phone: String(body.phone ?? ""),

      result_code: String(body.result_code ?? ""),
      result_full_code: String(body.result_full_code ?? ""),
      result_title: String(body.result_title ?? ""),
      result_subtitle: String(body.result_subtitle ?? ""),

      e_score: Number(body.e_score ?? 0),
      p_score: Number(body.p_score ?? 0),
      r_score: Number(body.r_score ?? 0),
      c_score: Number(body.c_score ?? 0),
      m_score: Number(body.m_score ?? 0),
      o_score: Number(body.o_score ?? 0),
      s_score: Number(body.s_score ?? 0),
      f_score: Number(body.f_score ?? 0),

      result_payload:
        body.result_payload && typeof body.result_payload === "object"
          ? body.result_payload
          : {},
    };

    const { data, error } = await supabaseAdmin
      .from("test_results")
      .insert(insertRow)
      .select()
      .single();

    if (error) {
      console.error("[api/submissions] insert error:", error);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      row: data,
    });
  } catch (error) {
    console.error("[api/submissions] unexpected error:", error);
    return NextResponse.json(
      { ok: false, error: "잘못된 요청입니다." },
      { status: 400 }
    );
  }
}