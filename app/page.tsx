"use client";

import { useMemo, useState } from "react";

/* ===================== 데이터 ===================== */

const QUESTIONS = [/* ← 그대로 유지 (너 코드 그대로 쓰면 됨) */];

const SCORE_MAP = [/* ← 그대로 유지 */];

const CHOICES = [
  { label: "매우 그렇다", value: 5 },
  { label: "그렇다", value: 4 },
  { label: "보통", value: 3 },
  { label: "아니다", value: 2 },
  { label: "전혀 아니다", value: 1 },
];

/* ===================== 로직 ===================== */

function scoreAnswer(base, answer) {
  return (base * answer) / 5;
}

function makeScores(answers) {
  const total = { E: 0, P: 0, R: 0, C: 0, M: 0, O: 0, S: 0, F: 0 };

  answers.forEach((ans, i) => {
    const map = SCORE_MAP[i] || {};
    Object.entries(map).forEach(([k, v]) => {
      total[k] += scoreAnswer(v, ans);
    });
  });

  return total;
}

function buildCode(s) {
  return `${s.E >= 12 ? "E" : "p"}${s.R >= s.C ? "R" : "C"}${s.M >= s.S ? "M" : "O"}${s.F >= s.P ? "F" : "S"}`;
}

/* ===================== PDF ===================== */

function downloadPDF() {
  window.print(); // 👉 안정형 (한글 깨짐 없음)
}

/* ===================== UI ===================== */

function ProgressBar({ value }) {
  return (
    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
      <div className="h-full bg-sky-600" style={{ width: `${value}%` }} />
    </div>
  );
}

/* ===================== 메인 ===================== */

export default function Page() {
  const [step, setStep] = useState("landing");
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState([]);

  const progress = (answers.length / QUESTIONS.length) * 100;

  const scores = useMemo(() => makeScores(answers), [answers]);
  const code = useMemo(() => buildCode(scores), [scores]);

  /* ---------- 화면 ---------- */

  if (step === "landing") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white flex items-center justify-center">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold">
            학습성향 <span className="text-sky-600">정밀 검사</span>
          </h1>
          <p className="text-slate-500">
            우리 아이의 공부 방식, 결과로 확인하세요
          </p>

          <button
            onClick={() => setStep("test")}
            className="bg-sky-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg"
          >
            검사 시작
          </button>
        </div>
      </div>
    );
  }

  if (step === "test") {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center py-10">
        <div className="w-full max-w-xl bg-white p-6 rounded-3xl shadow">

          <div className="flex justify-between text-sm text-slate-500">
            <span>{idx + 1} / {QUESTIONS.length}</span>
            <button onClick={() => setStep("landing")}>처음으로</button>
          </div>

          <div className="mt-4">
            <ProgressBar value={progress} />
          </div>

          <h2 className="mt-6 text-xl font-bold leading-8">
            {QUESTIONS[idx]}
          </h2>

          <div className="mt-6 space-y-3">
            {CHOICES.map((c) => (
              <button
                key={c.label}
                onClick={() => {
                  const next = [...answers, c.value];
                  setAnswers(next);

                  if (idx === QUESTIONS.length - 1) {
                    setStep("result");
                  } else {
                    setIdx(idx + 1);
                  }
                }}
                className="w-full border p-4 rounded-xl hover:bg-sky-50"
              >
                {c.label}
              </button>
            ))}
          </div>

        </div>
      </div>
    );
  }

  /* ---------- 결과 ---------- */

  return (
    <div className="min-h-screen bg-slate-50 py-10 flex justify-center">
      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-6">

        {/* 좌측 */}
        <div className="bg-white p-6 rounded-3xl shadow">
          <h2 className="text-sm text-sky-600 font-bold">분석 결과</h2>
          <h1 className="text-3xl font-bold mt-2">{code}</h1>

          <p className="mt-4 text-slate-600">
            학습 성향 분석이 완료되었습니다.
          </p>

          <button
            onClick={downloadPDF}
            className="mt-6 w-full bg-sky-600 text-white py-3 rounded-xl font-bold"
          >
            PDF 저장
          </button>
        </div>

        {/* 우측 */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl shadow">
            <h3 className="font-bold">학습 전략</h3>
            <p className="text-sm text-slate-500 mt-2">
              학생에게 맞는 학습 전략이 여기에 들어갑니다
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow">
            <h3 className="font-bold">부모 코칭</h3>
            <p className="text-sm text-slate-500 mt-2">
              부모가 어떻게 도와줘야 하는지 설명
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow">
            <h3 className="font-bold">진로 방향</h3>
            <p className="text-sm text-slate-500 mt-2">
              추천 진로 및 방향
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}