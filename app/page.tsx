"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createClient } from "@supabase/supabase-js";

/* =========================
   Supabase 설정
========================= */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

async function saveResultToSupabase(params: {
  student: StudentInfo;
  answers: number[];
  resultKey: string;
  resultCode: string;
  reportTitle: string;
  scores: Record<string, number>;
}) {
  if (!supabase) return;

  const { error } = await supabase.from("test_results").insert({
    student_name: params.student.name,
    grade: params.student.grade,
    school: params.student.school,
    phone: params.student.phone,
    answers: params.answers,
    result_key: params.resultKey,
    result_code: params.resultCode,
    report_title: params.reportTitle,
    scores: params.scores,
  });

  if (error) {
    console.error(error);
  }
}

/* =========================
   타입
========================= */
type Step = "landing" | "test" | "result";

type StudentInfo = {
  name: string;
  grade: string;
  school?: string;
  phone?: string;
};

/* =========================
   유틸
========================= */
function toFiveScalePair(a: number, b: number) {
  const total = a + b || 1;
  const ratio = Math.round((b / total) * 4) + 1; // 1~5
  return { value: ratio };
}

/* =========================
   메인
========================= */
export default function Page() {
  const [step, setStep] = useState<Step>("landing");
  const [answers, setAnswers] = useState<number[]>([]);
  const [student, setStudent] = useState<StudentInfo>({
    name: "",
    grade: "",
    school: "",
    phone: "",
  });

  const [hasSavedResult, setHasSavedResult] = useState(false);

  const isComplete = answers.length >= 10; // 예시 기준

  const scores = useMemo(() => {
    return {
      E: 5,
      P: 3,
      R: 4,
      C: 2,
      M: 4,
      O: 3,
      S: 2,
      F: 1,
    };
  }, []);

  const resolved = {
    key: "ERMF",
    fullCode: "ERMF",
  };

  const report = {
    title: "이과 영재형",
  };

  /* =========================
     ⭐ Supabase 저장
  ========================= */
  useEffect(() => {
    if (step !== "result" || hasSavedResult || !isComplete) return;

    let cancelled = false;

    const run = async () => {
      await saveResultToSupabase({
        student,
        answers,
        resultKey: resolved.key,
        resultCode: resolved.fullCode,
        reportTitle: report.title,
        scores,
      });

      if (!cancelled) setHasSavedResult(true);
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [step, hasSavedResult, isComplete, student, answers, resolved, report, scores]);

  /* =========================
     결과 화면
  ========================= */
  if (step === "result") {
    const axes = [
      // 🔥 여기 수정됨 (외향 → 내향)
      { name: "외향·내향", left: "외향", right: "내향", ...toFiveScalePair(scores.E, scores.P) },

      { name: "논리·창의", left: "논리", right: "창의", ...toFiveScalePair(scores.R, scores.C) },
      { name: "모범·자율", left: "모범", right: "자율", ...toFiveScalePair(scores.M, scores.O) },
      { name: "안정·도전", left: "안정", right: "도전", ...toFiveScalePair(scores.S, scores.F) },
    ];

    return (
      <div style={{ padding: 40 }}>
        <h1>결과</h1>
        <h2>{report.title}</h2>

        {axes.map((a, i) => (
          <div key={i}>
            {a.name} : {a.value}
          </div>
        ))}
      </div>
    );
  }

  /* =========================
     테스트 완료 버튼
  ========================= */
  return (
    <div style={{ padding: 40 }}>
      <h1>테스트 페이지</h1>

      <button
        onClick={() => {
          setAnswers([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
          setStep("result");
        }}
      >
        결과 보기
      </button>
    </div>
  );
}