"use client";

import { useMemo, useState } from "react";

type ResultType =
  | "분석탐구형"
  | "성실축적형"
  | "전략실행형"
  | "관계소통형"
  | "잠재성장형";

type Question = {
  id: number;
  text: string;
  subtitle?: string;
  yesScores: Partial<Record<ResultType, number>>;
};

type ResultMeta = {
  title: string;
  keyword: string;
  summary: string;
  description: string;
  strengths: string[];
  growthTips: string[];
  suitableStudy: string[];
  colorFrom: string;
  colorTo: string;
  badgeBg: string;
  accentText: string;
};

const RESULT_META: Record<ResultType, ResultMeta> = {
  분석탐구형: {
    title: "분석탐구형",
    keyword: "논리와 구조를 통해 깊이 이해하는 유형",
    summary:
      "개념의 원리를 파악하고 체계적으로 정리할 때 가장 큰 학습 효율을 발휘합니다.",
    description:
      "분석탐구형은 단순 암기보다 ‘왜 그런가’를 이해할 때 학습 몰입도가 높아집니다. 문제의 구조를 해석하고 핵심 개념 간의 연결을 파악하는 능력이 뛰어나며, 스스로 학습 체계를 세울 때 강점을 보입니다. 깊이 있는 이해를 바탕으로 흔들리지 않는 실력을 쌓아가는 유형입니다.",
    strengths: [
      "개념과 원리를 구조적으로 이해하는 힘이 뛰어납니다.",
      "복잡한 정보를 논리적으로 정리하는 능력이 좋습니다.",
      "암기보다 이해 중심 학습에서 높은 성과를 냅니다.",
    ],
    growthTips: [
      "이해한 내용을 한 문장으로 요약해보세요.",
      "개념 간 연결도를 직접 그려보면 효과가 커집니다.",
      "너무 오래 분석만 하지 않도록 문제 풀이와 병행하세요.",
    ],
    suitableStudy: [
      "개념 정리 노트",
      "오답 원인 분석",
      "단원별 구조화 복습",
    ],
    colorFrom: "from-sky-500",
    colorTo: "to-blue-700",
    badgeBg: "bg-sky-50",
    accentText: "text-sky-700",
  },
  성실축적형: {
    title: "성실축적형",
    keyword: "꾸준함과 반복을 통해 실력을 완성하는 유형",
    summary:
      "계획을 지키고 정해진 루틴을 지속할 때 안정적으로 성과를 만들어냅니다.",
    description:
      "성실축적형은 하루의 분량을 차분히 쌓아가며 실력을 완성하는 유형입니다. 급격한 변화보다 일관된 반복과 성실한 실행에서 강점이 드러나며, 기본기를 단단히 다지는 과정에서 높은 안정성을 보입니다. 시간이 지날수록 성장 곡선이 더욱 뚜렷해지는 유형입니다.",
    strengths: [
      "반복과 누적 학습에 매우 강합니다.",
      "기초를 탄탄히 다지는 힘이 뛰어납니다.",
      "학습 루틴을 유지하는 안정성이 높습니다.",
    ],
    growthTips: [
      "작은 목표를 자주 달성하며 동기를 유지하세요.",
      "기록형 체크리스트를 활용하면 성취감이 커집니다.",
      "지나치게 보수적으로 가지 않도록 도전 문제도 섞어보세요.",
    ],
    suitableStudy: [
      "루틴형 학습 계획표",
      "반복 복습 시스템",
      "체크리스트 기반 진도 관리",
    ],
    colorFrom: "from-emerald-500",
    colorTo: "to-teal-700",
    badgeBg: "bg-emerald-50",
    accentText: "text-emerald-700",
  },
  전략실행형: {
    title: "전략실행형",
    keyword: "목표를 정하고 효율적으로 달성하는 유형",
    summary:
      "우선순위를 빠르게 정하고 핵심에 집중할 때 높은 성과를 냅니다.",
    description:
      "전략실행형은 목표 달성을 위해 필요한 과정을 빠르게 파악하고 실행으로 옮기는 능력이 뛰어난 유형입니다. 효율을 중시하며, 무엇을 먼저 해야 하는지 판단하는 감각이 좋습니다. 시간과 에너지를 효과적으로 분배할 줄 알기 때문에 실전형 학습에서 특히 강점을 보입니다.",
    strengths: [
      "목표 설정과 우선순위 판단이 빠릅니다.",
      "핵심에 집중하는 효율성이 높습니다.",
      "실전 감각과 문제 해결력이 좋습니다.",
    ],
    growthTips: [
      "속도뿐 아니라 정확도 점검 루틴도 함께 두세요.",
      "중장기 계획을 세분화하면 완성도가 더 높아집니다.",
      "기본 개념 복습을 생략하지 않도록 주의하세요.",
    ],
    suitableStudy: [
      "목표 역산형 계획",
      "시간 제한 문제 풀이",
      "핵심 개념 압축 정리",
    ],
    colorFrom: "from-violet-500",
    colorTo: "to-fuchsia-700",
    badgeBg: "bg-violet-50",
    accentText: "text-violet-700",
  },
  관계소통형: {
    title: "관계소통형",
    keyword: "소통과 상호작용 속에서 성장하는 유형",
    summary:
      "함께 배우고 설명하며 피드백을 주고받을 때 학습 에너지가 극대화됩니다.",
    description:
      "관계소통형은 타인과의 상호작용 속에서 생각이 정리되고 이해가 깊어지는 유형입니다. 혼자만의 학습보다 질문하고 설명하며 피드백을 나누는 과정에서 강점이 살아납니다. 정서적 안정과 관계적 동기가 학습 성과에 긍정적으로 작용하는 유형입니다.",
    strengths: [
      "설명하고 나누는 과정에서 이해가 깊어집니다.",
      "피드백 수용과 협업 능력이 좋습니다.",
      "학습 동기를 관계 속에서 잘 유지합니다.",
    ],
    growthTips: [
      "스터디나 발표형 복습을 활용해보세요.",
      "질문을 메모해두었다가 함께 점검하면 좋습니다.",
      "관계 의존이 커지지 않도록 개인 학습 시간도 확보하세요.",
    ],
    suitableStudy: [
      "스터디 학습",
      "설명형 복습",
      "질문-답변 정리 노트",
    ],
    colorFrom: "from-rose-500",
    colorTo: "to-pink-700",
    badgeBg: "bg-rose-50",
    accentText: "text-rose-700",
  },
  잠재성장형: {
    title: "잠재성장형",
    keyword: "가능성을 품고 크게 성장할 수 있는 유형",
    summary:
      "지금의 결과보다 앞으로의 확장 가능성이 더욱 기대되는 성장 잠재력이 높은 유형입니다.",
    description:
      "잠재성장형은 현재의 학습 패턴이 완전히 고정되어 있지 않지만, 적절한 환경과 방향을 만나면 빠르게 도약할 수 있는 유형입니다. 익숙한 방식에 갇히기보다 새로운 학습 자극과 맞춤형 전략을 통해 자신만의 강점을 발견할 가능성이 큽니다. 지금은 과정의 초입일 수 있지만, 앞으로의 성장 폭은 매우 인상적일 수 있습니다.",
    strengths: [
      "환경과 자극에 따라 빠르게 성장할 가능성이 큽니다.",
      "숨은 강점을 발굴할 여지가 많습니다.",
      "유연하게 새로운 학습 방식을 받아들일 수 있습니다.",
    ],
    growthTips: [
      "작은 성공 경험을 자주 만들며 자신감을 키워주세요.",
      "나에게 맞는 학습 방식을 비교하며 찾아보는 과정이 중요합니다.",
      "꾸준한 기록을 통해 성장 변화를 시각화해보세요.",
    ],
    suitableStudy: [
      "맞춤형 학습 실험",
      "짧은 목표 달성 루틴",
      "성장 기록 기반 피드백",
    ],
    colorFrom: "from-amber-400",
    colorTo: "to-orange-600",
    badgeBg: "bg-amber-50",
    accentText: "text-amber-700",
  },
};

/**
 * =========================================================
 * 문항 데이터
 * ---------------------------------------------------------
 * 아래는 "형식 예시"야.
 * 네 실제 채점표에 맞게 text / yesScores만 교체하면 바로 적용됨.
 *
 * 규칙:
 * - 그렇다 => yesScores에 적힌 점수 반영
 * - 아니다 => 0점
 * =========================================================
 */
const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "새로운 내용을 배울 때, 먼저 원리와 구조를 이해해야 마음이 놓인다.",
    subtitle: "이해 중심 학습 선호",
    yesScores: { 분석탐구형: 3 },
  },
  {
    id: 2,
    text: "하루 분량을 정해 꾸준히 해나가는 방식이 가장 잘 맞는다.",
    subtitle: "루틴과 반복에 강함",
    yesScores: { 성실축적형: 3 },
  },
  {
    id: 3,
    text: "공부할 때 무엇을 먼저 해야 할지 우선순위를 빠르게 정하는 편이다.",
    subtitle: "효율과 실행 중심",
    yesScores: { 전략실행형: 3 },
  },
  {
    id: 4,
    text: "누군가와 함께 이야기하거나 설명할 때 더 잘 이해된다.",
    subtitle: "상호작용형 학습 선호",
    yesScores: { 관계소통형: 3 },
  },
  {
    id: 5,
    text: "아직 완전히 내 공부 스타일을 찾지는 못했지만, 잘 맞는 방법을 만나면 크게 성장할 것 같다.",
    subtitle: "성장 가능성 중심",
    yesScores: { 잠재성장형: 3 },
  },
  {
    id: 6,
    text: "문제를 틀리면 정답만 보는 것보다 왜 틀렸는지 분석하는 편이다.",
    subtitle: "오답의 구조를 파악함",
    yesScores: { 분석탐구형: 2, 전략실행형: 1 },
  },
  {
    id: 7,
    text: "정해진 계획을 크게 벗어나지 않고 차근차근 따라가는 것이 편하다.",
    subtitle: "안정적 누적형 학습",
    yesScores: { 성실축적형: 2 },
  },
  {
    id: 8,
    text: "중요한 것과 덜 중요한 것을 빨리 구분하는 편이다.",
    subtitle: "핵심 파악 능력",
    yesScores: { 전략실행형: 2 },
  },
  {
    id: 9,
    text: "질문하거나 대화하면서 공부하면 동기부여가 더 잘 된다.",
    subtitle: "관계적 에너지",
    yesScores: { 관계소통형: 2 },
  },
  {
    id: 10,
    text: "지금 당장은 조금 흔들려도, 방향만 잘 잡히면 금방 성장할 자신이 있다.",
    subtitle: "잠재 역량과 확장성",
    yesScores: { 잠재성장형: 2 },
  },
  {
    id: 11,
    text: "개념끼리 연결되는 흐름을 파악하면 오래 기억된다.",
    subtitle: "개념 연결형 사고",
    yesScores: { 분석탐구형: 2 },
  },
  {
    id: 12,
    text: "한 번에 몰아서 하기보다 정해진 패턴으로 반복하는 것이 효과적이다.",
    subtitle: "지속형 습관 학습",
    yesScores: { 성실축적형: 2 },
  },
  {
    id: 13,
    text: "시험이나 과제를 앞두면 목표를 세우고 효율적으로 움직이는 편이다.",
    subtitle: "실전 대응력",
    yesScores: { 전략실행형: 2 },
  },
  {
    id: 14,
    text: "친구나 선생님과의 피드백이 공부에 큰 도움이 된다.",
    subtitle: "피드백 수용형",
    yesScores: { 관계소통형: 2 },
  },
  {
    id: 15,
    text: "내게 맞는 방식이 정리되면 이전보다 훨씬 빠르게 발전할 수 있을 것 같다.",
    subtitle: "가파른 성장 잠재력",
    yesScores: { 잠재성장형: 2 },
  },
];

const RESULT_ORDER: ResultType[] = [
  "분석탐구형",
  "성실축적형",
  "전략실행형",
  "관계소통형",
  "잠재성장형",
];

const INITIAL_SCORES: Record<ResultType, number> = {
  분석탐구형: 0,
  성실축적형: 0,
  전략실행형: 0,
  관계소통형: 0,
  잠재성장형: 0,
};

export default function Page() {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, boolean | null>>({});
  const [scores, setScores] = useState<Record<ResultType, number>>(INITIAL_SCORES);
  const [finished, setFinished] = useState(false);

  const totalQuestions = QUESTIONS.length;
  const currentQuestion = QUESTIONS[step];
  const progress = totalQuestions === 0 ? 0 : Math.round((step / totalQuestions) * 100);

  const sortedResults = useMemo(() => {
    return RESULT_ORDER.map((type) => ({
      type,
      score: scores[type],
      meta: RESULT_META[type],
    })).sort((a, b) => b.score - a.score);
  }, [scores]);

  const topResult = sortedResults[0];
  const secondResult = sortedResults[1];

  const maxScore = useMemo(() => {
    let totals = { ...INITIAL_SCORES };
    QUESTIONS.forEach((q) => {
      RESULT_ORDER.forEach((type) => {
        totals[type] += q.yesScores[type] ?? 0;
      });
    });
    return totals;
  }, []);

  const handleAnswer = (value: boolean) => {
    if (!currentQuestion) return;

    const prevAnswer = answers[currentQuestion.id];
    const nextScores = { ...scores };

    if (prevAnswer === true) {
      RESULT_ORDER.forEach((type) => {
        nextScores[type] -= currentQuestion.yesScores[type] ?? 0;
      });
    }

    if (value === true) {
      RESULT_ORDER.forEach((type) => {
        nextScores[type] += currentQuestion.yesScores[type] ?? 0;
      });
    }

    const nextAnswers = {
      ...answers,
      [currentQuestion.id]: value,
    };

    setAnswers(nextAnswers);
    setScores(nextScores);

    const isLast = step === totalQuestions - 1;
    if (isLast) {
      setFinished(true);
    } else {
      setStep((prev) => prev + 1);
    }
  };

  const goPrev = () => {
    if (step > 0) setStep((prev) => prev - 1);
  };

  const restartTest = () => {
    setStarted(false);
    setStep(0);
    setAnswers({});
    setScores(INITIAL_SCORES);
    setFinished(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.14),_transparent_35%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_45%,#f8fafc_100%)] text-slate-900 print:bg-white">
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          .print-page {
            box-shadow: none !important;
            border: 1px solid #e5e7eb !important;
            margin: 0 !important;
          }
        }
      `}</style>

      <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-10">
        {!started && !finished && (
          <section className="no-print">
            <div className="relative overflow-hidden rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur md:p-10">
              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet-200/50 blur-3xl" />
              <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-sky-200/50 blur-3xl" />

              <div className="relative grid items-center gap-8 md:grid-cols-[1.2fr_0.8fr]">
                <div>
                  <div className="mb-4 inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-sm font-semibold text-violet-700">
                    학습성향 유형진단
                  </div>

                  <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900 md:text-5xl">
                    나에게 맞는 학습 방식,
                    <br />
                    <span className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-sky-600 bg-clip-text text-transparent">
                      더 정교하게 발견해보세요
                    </span>
                  </h1>

                  <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
                    문항에 따라 <span className="font-semibold text-slate-900">그렇다</span>를
                    선택했을 때만 점수가 반영되는 2지선다 검사입니다.
                    <br />
                    결과를 통해 현재의 학습 강점과 더 효과적인 성장 방향을 확인할 수 있습니다.
                  </p>

                  <div className="mt-8 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-500">문항 수</p>
                      <p className="mt-2 text-2xl font-black text-slate-900">
                        {totalQuestions}문항
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-500">응답 방식</p>
                      <p className="mt-2 text-2xl font-black text-slate-900">그렇다 / 아니다</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-500">결과 제공</p>
                      <p className="mt-2 text-2xl font-black text-slate-900">PDF 출력 가능</p>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <button
                      onClick={() => setStarted(true)}
                      className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-violet-300/40 transition hover:scale-[1.02]"
                    >
                      검사 시작하기
                    </button>
                    <button
                      onClick={() => {
                        const el = document.getElementById("guide");
                        el?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-base font-bold text-slate-700 transition hover:bg-slate-50"
                    >
                      검사 안내 보기
                    </button>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-2xl">
                    <p className="text-sm font-semibold text-violet-200">대표 결과 예시</p>
                    <h3 className="mt-3 text-2xl font-black">잠재성장형</h3>
                    <p className="mt-3 leading-7 text-slate-200">
                      지금의 모습보다 앞으로의 확장 가능성이 더 기대되는 유형.
                      맞는 학습 전략을 만나면 성장 폭이 크게 달라질 수 있습니다.
                    </p>
                  </div>

                  <div className="rounded-[28px] border border-white/80 bg-white p-6 shadow-lg">
                    <p className="text-sm font-semibold text-slate-500">이런 분께 추천해요</p>
                    <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                      <li>• 아이에게 맞는 학습 방향을 구체적으로 알고 싶은 경우</li>
                      <li>• 단순 점수보다 학습 성향과 성장 포인트를 보고 싶은 경우</li>
                      <li>• 결과를 PDF로 저장해 상담 자료로 활용하고 싶은 경우</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <section id="guide" className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-100 text-lg font-black text-violet-700">
                  1
                </div>
                <h3 class