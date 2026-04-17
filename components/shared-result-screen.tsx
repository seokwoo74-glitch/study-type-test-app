"use client";

import { useMemo } from "react";

type StudentInfo = {
  name: string;
  grade: string;
  school: string;
  phone: string;
};

type Report = {
  title: string;
  subtitle: string;
  summary: string;
  strategy: string;
  parent: string;
  path: string;
  danger: string;
  talk: string;
  color: string;
};

type ResolvedResult = {
  key: string;
  code: string;
  diffText: string;
  fullCode: string;
};

type CharacterMeta = {
  label: string;
  tagline: string;
  emoji: string;
  aura: string;
};

type ResultPayload = {
  version: number;
  submittedAt: string;
  student: StudentInfo;
  result: {
    key: string;
    code: string;
    fullCode: string;
    diffText: string;
    title: string;
    subtitle: string;
    summary: string;
    strategy: string;
    parent: string;
    path: string;
    danger: string;
    talk: string;
    color: string;
  };
  scores: {
    E: number;
    P: number;
    R: number;
    C: number;
    M: number;
    O: number;
    S: number;
    F: number;
  };
  diffs: {
    social: number;
    judgment: number;
    track: number;
    style: number;
  };
  meta: {
    totalAnswered: number;
    totalQuestions: number;
  };
};

type ResultScreenProps = {
  payload?: ResultPayload;

  student?: StudentInfo;
  scores?: Record<string, number>;
  resolved?: ResolvedResult;
  report?: Report;
  meta?: CharacterMeta;

  onRestart?: () => void;
  shareUrl?: string;
  restartLabel?: string;
};

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized;

  const num = parseInt(full, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function buildShareText(title: string, url: string) {
  return `우리 아이 학습유형 결과 😮

👉 ${title}

결과 보러가기👇
${url}`;
}

async function fallbackCopyText(text: string) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      alert("결과 링크가 복사됐어요 👍");
      return true;
    }
  } catch {
    // fallback below
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    const success = document.execCommand("copy");
    document.body.removeChild(textarea);

    if (success) {
      alert("결과 링크가 복사됐어요 👍");
      return true;
    }
  } catch {
    // ignore
  }

  alert(`링크 복사에 실패했어요.\n아래 주소를 직접 복사해 주세요.\n${text}`);
  return false;
}

async function shareNative(title: string, url: string) {
  const text = buildShareText(title, url);

  try {
    if (navigator.share) {
      await navigator.share({
        title: "학습성향 검사 결과",
        text,
        url,
      });
      return;
    }
  } catch {
    // share cancelled or failed
  }

  await fallbackCopyText(url);
}

function getPercentileFromSubtitle(subtitle: string) {
  if (subtitle.includes("1% 미만")) return "1% 미만";
  if (subtitle.includes("2% 미만")) return "2% 미만";
  if (subtitle.includes("3% 미만")) return "3% 미만";
  if (subtitle.includes("4%~6% 미만")) return "4%~6% 미만";
  if (subtitle.includes("4%~10% 미만")) return "4%~10% 미만";
  if (subtitle.includes("7%~10% 미만")) return "7%~10% 미만";
  if (subtitle.includes("10% 미만")) return "10% 미만";
  if (subtitle.includes("20% 미만")) return "20% 미만";
  if (subtitle.includes("70%")) return "70% 내외";
  return subtitle || "분석 결과";
}

function getTraits(key: string) {
  if (["ERMs", "ERMS", "eRMF"].includes(key)) {
    return [
      "이과 과목에서 압도적 강점이 드러나요",
      "깊게 몰입하면 성과 폭이 매우 커요",
      "난도가 높을수록 오히려 재미를 느끼기 쉬워요",
    ];
  }

  if (["eROS", "eRmS"].includes(key)) {
    return [
      "계획과 실천이 비교적 안정적인 편이에요",
      "내신과 시험 리듬을 꾸준히 유지할 수 있어요",
      "성실함이 실력으로 연결되는 타입이에요",
    ];
  }

  if (["PRMF", "EROF"].includes(key)) {
    return [
      "좋아하는 과목에서는 확실히 잘해요",
      "싫은 과목은 미루기 쉬워요",
      "환경에 따라 결과 차이가 크게 날 수 있어요",
    ];
  }

  if (["ECMF", "ECMS", "ECMs", "pCMS"].includes(key)) {
    return [
      "언어 감각과 표현력이 강한 편이에요",
      "생각이 깊고 해석력이 좋아요",
      "관심 분야에서는 높은 몰입을 보여줄 수 있어요",
    ];
  }

  if (["ECOS", "pCOS", "eCoS"].includes(key)) {
    return [
      "문과 과목을 비교적 안정적으로 운영해요",
      "계획을 세우면 차분히 쌓아가는 편이에요",
      "시험불안 관리만 잘되면 성과가 좋아질 가능성이 커요",
    ];
  }

  if (["PCMF", "PCMs"].includes(key)) {
    return [
      "관심 과목만 강하게 파고드는 편이에요",
      "겉보다 속생각이 많은 타입이에요",
      "마무리 습관이 붙으면 확 달라질 수 있어요",
    ];
  }

  if (["ErMS", "ErOS", "PrmS", "PrMF", "PrOF"].includes(key)) {
    return [
      "문·이과를 함께 보는 융합 감각이 있어요",
      "여러 분야를 동시에 이해하려는 경향이 있어요",
      "균형을 잡으면 크게 성장할 가능성이 커요",
    ];
  }

  return [
    "상황에 따라 유연하게 적응해요",
    "균형 잡힌 스타일을 가지고 있어요",
    "안정적으로 실력을 쌓아갈 가능성이 커요",
  ];
}

function getFuture(key: string) {
  if (["ERMs", "ERMS", "eRMF", "eROS", "eRmS", "PRMF", "EROF"].includes(key)) {
    return "이공계, 의학, 공학, 자연과학, IT·연구 분야에서 강점이 살아날 가능성이 큽니다.";
  }

  if (["ECMF", "ECMS", "ECMs", "pCMS", "ECOS", "pCOS", "eCoS", "PCMF", "PCMs", "eCmF", "PCOS"].includes(key)) {
    return "어문, 경영, 법조, 행정, 신문방송, 상담·교육, 예체능 분야에서 강점이 드러날 가능성이 큽니다.";
  }

  if (["ErMS", "ErOS", "PrmS", "PrMF", "PrOF"].includes(key)) {
    return "자유전공, 통계, 건축, 사회과학, 융합전공처럼 여러 역량을 함께 쓰는 분야에서 성장 가능성이 높습니다.";
  }

  return "균형형 인재로 다양한 진로 선택지 속에서 안정적으로 성장할 수 있습니다.";
}

function getDangerPattern(key: string) {
  if (["PRMF", "EROF", "PCMF", "PCMs", "PrMF"].includes(key)) {
    return [
      "좋아하는 것만 하는 패턴",
      "마무리 부족",
      "성적 편차가 커질 수 있음",
    ];
  }

  if (["ERMs", "ERMS", "eRMF", "ECMF", "ECMS", "ECMs", "pCMS", "ErMS", "eCmF"].includes(key)) {
    return [
      "재능에 비해 루틴 관리가 흔들릴 수 있음",
      "완벽주의나 부담감 누적",
      "환경이 맞지 않으면 흥미가 급격히 떨어질 수 있음",
    ];
  }

  return [
    "목표 없이 흐름만 유지",
    "학습 리듬이 느슨해질 수 있음",
    "작은 실수에 자신감이 흔들릴 수 있음",
  ];
}

function getAction(key: string) {
  if (["PRMF", "EROF", "PCMF", "PCMs", "PrMF"].includes(key)) {
    return "하루 1시간이라도 무조건 끝까지 앉아 있는 습관 만들기";
  }

  if (["eROS", "eRmS", "ECOS", "pCOS", "eCoS", "ErOS", "PrmS"].includes(key)) {
    return "매일 같은 시간에 시작하는 고정 공부 루틴 만들기";
  }

  if (["ERMs", "ERMS", "eRMF", "ECMF", "ECMS", "ECMs", "pCMS", "ErMS", "eCmF"].includes(key)) {
    return "강점 과목 1개를 정해서 결과물까지 완성해 보는 경험 만들기";
  }

  return "하루 학습 루틴을 일정하게 유지하기";
}

function getChatScenario(key: string) {
  if (["PRMF", "PCMF", "PCMs", "PrMF"].includes(key)) {
    return [
      { type: "parent" as const, text: "요즘 왜 이렇게 공부를 미루는 것 같지?" },
      { type: "child" as const, text: "해야 하는 건 아는데... 딱 꽂히는 게 아니면 잘 안 잡혀..." },
      { type: "parent" as const, text: "좋아하는 건 진짜 집중해서 하잖아?" },
      { type: "child" as const, text: "응... 재밌는 건 오래 할 수 있는데, 아닌 건 너무 힘들어." },
    ];
  }

  if (["EROF", "eROS", "ErOS", "eCoS", "PCMF"].includes(key)) {
    return [
      { type: "parent" as const, text: "분명 잘할 수 있는데 왜 공부 리듬이 자꾸 흔들릴까?" },
      { type: "child" as const, text: "혼자 하면 좀 심심하고... 분위기 타면 더 잘돼." },
      { type: "parent" as const, text: "친구들이나 환경 영향을 많이 받는 편이구나?" },
      { type: "child" as const, text: "응! 분위기 좋으면 진짜 열심히 해." },
    ];
  }

  if (["ECMF", "ECMS", "ECMs", "pCMS", "PCMs"].includes(key)) {
    return [
      { type: "parent" as const, text: "겉으로는 조용한데 속으로 생각이 많지?" },
      { type: "child" as const, text: "응... 머릿속으론 많이 생각하는데 바로 말하긴 좀 그래." },
      { type: "parent" as const, text: "그래도 한번 이해되면 깊게 가더라." },
      { type: "child" as const, text: "맞아. 이해되면 끝까지 파고드는 건 재밌어." },
    ];
  }

  return [
    { type: "parent" as const, text: "지금은 어떤 방식이 제일 잘 맞는지 찾는 중인 것 같아." },
    { type: "child" as const, text: "응, 아직은 딱 맞는 방법을 찾는 중이야." },
    { type: "parent" as const, text: "하나씩 맞는 방법을 찾으면 훨씬 좋아질 수 있겠네." },
    { type: "child" as const, text: "맞아. 나한테 맞는 방식이면 더 잘할 수 있을 것 같아." },
  ];
}

function printReport(html: string) {
  const win = window.open("", "_blank", "width=960,height=1200");
  if (!win) return;

  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();

  window.setTimeout(() => {
    win.print();
  }, 250);
}

function generatePrintableReport({
  report,
  resultCode,
  student,
  percentile,
  traits,
  dangerPatterns,
  future,
  actionText,
  characterBadge,
}: {
  report: Report;
  resultCode: string;
  student: StudentInfo;
  percentile: string;
  traits: string[];
  dangerPatterns: string[];
  future: string;
  actionText: string;
  characterBadge: {
    emoji: string;
    nickname: string;
    tagline: string;
  };
}) {
  const safe = (value?: string) =>
    (value || "-")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const traitItems = traits.map((item) => `<div class="chip">${safe(item)}</div>`).join("");
  const dangerItems = dangerPatterns
    .map((item) => `<div class="danger-item">${safe(item)}</div>`)
    .join("");

  return `
<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <title>${safe(report.title)} 결과 리포트</title>
  <style>
    @page { size: A4; margin: 16mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    html, body {
      margin: 0; padding: 0;
      font-family: "Pretendard", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif;
      color: #111827; background: #fff8d9;
    }
    body { line-height: 1.65; font-size: 12.5px; }
    .page { width: 100%; }
    .hero {
      background: linear-gradient(135deg, #fee500 0%, #fff3a6 100%);
      border-radius: 28px; padding: 28px; border: 1px solid #f1d74c;
      color: #111827;
    }
    .hero-sub { font-size: 11px; letter-spacing: 0.14em; font-weight: 900; color: #6b7280; }
    .char-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; align-items: center; }
    .char-badge {
      display: inline-flex; align-items: center; gap: 8px; border-radius: 999px; padding: 8px 12px;
      background: rgba(255,255,255,0.75); border: 1px solid rgba(17,24,39,0.08);
      font-size: 12px; font-weight: 900; color: #111827;
    }
    .hero-title { margin-top: 12px; font-size: 30px; line-height: 1.2; font-weight: 900; letter-spacing: -0.03em; color: #111827; }
    .hero-tagline { margin-top: 10px; font-size: 13px; font-weight: 800; line-height: 1.7; color: #4b5563; }
    .hero-summary { margin-top: 14px; max-width: 92%; font-size: 14px; line-height: 1.8; color: #374151; }
    .badge-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 18px; }
    .badge {
      display: inline-flex; align-items: center; border-radius: 999px; padding: 7px 12px;
      font-size: 11px; font-weight: 900; background: rgba(255,255,255,0.72);
      border: 1px solid rgba(17,24,39,0.08); color: #111827;
    }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 18px; }
    .card {
      border: 1px solid #e5e7eb; border-radius: 22px; padding: 18px; background: #ffffff;
      page-break-inside: avoid; break-inside: avoid;
    }
    .tint { background: #fffdf5; border: 1px solid #f3e28d; }
    .danger { background: #fff1f2; border: 1px solid #fecdd3; }
    .section-title {
      font-size: 18px; font-weight: 900; letter-spacing: -0.02em; margin: 0 0 10px 0; color: #111827;
    }
    .body-copy { font-size: 12.5px; line-height: 1.9; color: #374151; white-space: pre-wrap; }
    .info-grid { display: grid; grid-template-columns: 1fr; gap: 10px; }
    .info-item { border-radius: 16px; padding: 12px; background: #f8fafc; border: 1px solid #e5e7eb; }
    .info-label { font-size: 10px; font-weight: 900; letter-spacing: 0.16em; color: #9ca3af; text-transform: uppercase; }
    .info-value { margin-top: 6px; font-size: 12px; line-height: 1.8; color: #374151; white-space: pre-wrap; }
    .chip-wrap { display: flex; flex-wrap: wrap; gap: 8px; }
    .chip {
      border-radius: 999px; padding: 8px 12px; background: #f8fafc; border: 1px solid #e5e7eb;
      font-size: 12px; font-weight: 800; color: #374151;
    }
    .danger-list { display: grid; gap: 8px; }
    .danger-item {
      border-radius: 16px; padding: 10px 12px; background: white; border: 1px solid #fecdd3;
      font-size: 12px; font-weight: 800; color: #be123c;
    }
    .action-box {
      margin-top: 12px; border-radius: 18px; padding: 14px; background: #fff8d9;
      border: 1px solid #f3e28d; font-size: 14px; font-weight: 900; color: #111827; line-height: 1.8;
    }
  </style>
</head>
<body>
  <div class="page">
    <section class="hero">
      <div class="hero-sub">${safe(report.subtitle)}</div>

      <div class="char-row">
        <div class="char-badge">${safe(characterBadge.emoji)} ${safe(characterBadge.nickname)}</div>
        <div class="char-badge">우리 아이 결과 캐릭터</div>
      </div>

      <div class="hero-title">${safe(report.title)}</div>
      <div class="hero-tagline">${safe(characterBadge.tagline)}</div>
      <div class="hero-summary">${safe(report.summary)}</div>

      <div class="badge-row">
        <div class="badge">상위 ${safe(percentile)}</div>
        <div class="badge">결과코드 ${safe(resultCode)}</div>
        <div class="badge">학생 ${safe(student.name)}</div>
        <div class="badge">학교 ${safe(student.school)}</div>
      </div>
    </section>

    <div class="grid">
      <div>
        <section class="card">
          <h2 class="section-title">학생 기본 정보</h2>
          <div class="info-grid">
            <div class="info-item"><div class="info-label">이름</div><div class="info-value">${safe(student.name)}</div></div>
            <div class="info-item"><div class="info-label">학년</div><div class="info-value">${safe(student.grade)}</div></div>
            <div class="info-item"><div class="info-label">학교</div><div class="info-value">${safe(student.school)}</div></div>
            <div class="info-item"><div class="info-label">전화번호</div><div class="info-value">${safe(student.phone)}</div></div>
          </div>
        </section>

        <section class="card tint" style="margin-top:16px;">
          <h2 class="section-title">이 아이 실제 모습</h2>
          <div class="chip-wrap">${traitItems}</div>
        </section>

        <section class="card danger" style="margin-top:16px;">
          <h2 class="section-title">주의 패턴</h2>
          <div class="danger-list">${dangerItems}</div>
        </section>
      </div>

      <div>
        <section class="card">
          <h2 class="section-title">핵심 특징</h2>
          <div class="body-copy">${safe(report.summary)}</div>
        </section>

        <section class="card tint" style="margin-top:16px;">
          <h2 class="section-title">보호자 가이드</h2>
          <div class="body-copy">${safe(report.parent)}</div>
        </section>

        <section class="card" style="margin-top:16px;">
          <h2 class="section-title">추천 학습 전략</h2>
          <div class="body-copy">${safe(report.strategy)}</div>
        </section>

        <section class="card tint" style="margin-top:16px;">
          <h2 class="section-title">미래 성장 시나리오</h2>
          <div class="body-copy">${safe(future)}</div>
        </section>

        <section class="card" style="margin-top:16px;">
          <h2 class="section-title">지금 당장 해야 할 1가지</h2>
          <div class="action-box">${safe(actionText)}</div>
        </section>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

function KakaoBadge({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-black/5 bg-[#FFF3A6] px-3 py-1 text-[11px] font-black tracking-[-0.01em] text-slate-800 shadow-[0_8px_18px_rgba(250,224,90,0.25)] ${className}`}
    >
      {children}
    </span>
  );
}

function BubbleCard({
  title,
  desc,
  children,
  icon,
  accentColor,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
  icon: string;
  accentColor: string;
}) {
  return (
    <section
      className="rounded-[30px] border bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:p-6"
      style={{
        borderColor: hexToRgba(accentColor, 0.16),
        boxShadow: `0 18px 50px ${hexToRgba(accentColor, 0.08)}`,
      }}
    >
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] bg-[#FFF3A6] text-xl shadow-[0_10px_22px_rgba(250,224,90,0.28)]">
          {icon}
        </div>

        <div>
          <h3 className="text-[17px] font-black tracking-[-0.03em] text-slate-900">
            {title}
          </h3>
          {desc ? <p className="mt-1 text-sm leading-6 text-slate-500">{desc}</p> : null}
        </div>
      </div>

      {children}
    </section>
  );
}

function TraitChip({ text }: { text: string }) {
  return (
    <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700">
      {text}
    </div>
  );
}

function ChatBubble({
  type,
  children,
}: {
  type: "parent" | "child";
  children: React.ReactNode;
}) {
  const isParent = type === "parent";

  return (
    <div className={`flex ${isParent ? "justify-start" : "justify-end"}`}>
      <div className="max-w-[84%]">
        <div
          className={[
            "relative rounded-[24px] px-4 py-3 text-sm font-bold leading-7 shadow-sm",
            isParent ? "bg-[#FFF3A6] text-slate-900" : "bg-slate-900 text-white",
          ].join(" ")}
        >
          {children}

          <span
            className={[
              "absolute top-4 h-3 w-3 rotate-45",
              isParent ? "-left-1 bg-[#FFF3A6]" : "-right-1 bg-slate-900",
            ].join(" ")}
          />
        </div>
      </div>
    </div>
  );
}

function buildFallbackPayload(params: {
  student?: StudentInfo;
  scores?: Record<string, number>;
  resolved?: ResolvedResult;
  report?: Report;
}): ResultPayload {
  const student = params.student ?? {
    name: "",
    grade: "",
    school: "",
    phone: "",
  };

  const scores = {
    E: Number(params.scores?.E ?? 0),
    P: Number(params.scores?.P ?? 0),
    R: Number(params.scores?.R ?? 0),
    C: Number(params.scores?.C ?? 0),
    M: Number(params.scores?.M ?? 0),
    O: Number(params.scores?.O ?? 0),
    S: Number(params.scores?.S ?? 0),
    F: Number(params.scores?.F ?? 0),
  };

  const resolved = params.resolved ?? {
    key: "DEFAULT",
    code: "",
    diffText: "",
    fullCode: "",
  };

  const report = params.report ?? {
    title: "학습성향 분석 결과",
    subtitle: "기본 리포트",
    summary: "",
    strategy: "",
    parent: "",
    path: "",
    danger: "",
    talk: "",
    color: "#475569",
  };

  return {
    version: 1,
    submittedAt: "",
    student,
    result: {
      key: resolved.key,
      code: resolved.code,
      fullCode: resolved.fullCode,
      diffText: resolved.diffText,
      title: report.title,
      subtitle: report.subtitle,
      summary: report.summary,
      strategy: report.strategy,
      parent: report.parent,
      path: report.path,
      danger: report.danger,
      talk: report.talk,
      color: report.color,
    },
    scores,
    diffs: {
      social: Math.abs(scores.E - scores.P),
      judgment: Math.abs(scores.R - scores.C),
      track: Math.abs(scores.M - scores.O),
      style: Math.abs(scores.S - scores.F),
    },
    meta: {
      totalAnswered: 0,
      totalQuestions: 0,
    },
  };
}

export default function ResultScreen({
  payload,
  student,
  scores,
  resolved,
  report,
  meta,
  onRestart,
  shareUrl,
  restartLabel = "다시 검사하기",
}: ResultScreenProps) {
  const finalPayload = useMemo(
    () =>
      payload ??
      buildFallbackPayload({
        student,
        scores,
        resolved,
        report,
      }),
    [payload, student, scores, resolved, report]
  );

  const finalStudent = finalPayload.student;
  const finalResolved: ResolvedResult = {
    key: finalPayload.result.key,
    code: finalPayload.result.code,
    diffText: finalPayload.result.diffText,
    fullCode: finalPayload.result.fullCode,
  };
  const finalReport: Report = {
    title: finalPayload.result.title,
    subtitle: finalPayload.result.subtitle,
    summary: finalPayload.result.summary,
    strategy: finalPayload.result.strategy,
    parent: finalPayload.result.parent,
    path: finalPayload.result.path,
    danger: finalPayload.result.danger,
    talk: finalPayload.result.talk,
    color: finalPayload.result.color,
  };

  const percentile = useMemo(
    () => getPercentileFromSubtitle(finalReport.subtitle),
    [finalReport.subtitle]
  );

  const traits = useMemo(() => getTraits(finalResolved.key), [finalResolved.key]);
  const future = useMemo(() => getFuture(finalResolved.key), [finalResolved.key]);
  const dangerPatterns = useMemo(() => getDangerPattern(finalResolved.key), [finalResolved.key]);
  const actionText = useMemo(() => getAction(finalResolved.key), [finalResolved.key]);
  const chatScenario = useMemo(() => getChatScenario(finalResolved.key), [finalResolved.key]);

  const characterBadge = useMemo(() => {
    if (meta) {
      return {
        emoji: meta.emoji,
        nickname: meta.label,
        tagline: meta.tagline,
      };
    }

    return {
      emoji: "✨",
      nickname: "성향 분석 캐릭터",
      tagline: "현재 응답을 바탕으로 가장 가까운 성향을 분석했어요.",
    };
  }, [meta]);

  const handleShare = async () => {
    const url =
      shareUrl ||
      (typeof window !== "undefined"
        ? window.location.href
        : "https://study-type-test-app-zbmw.vercel.app");

    await shareNative(finalReport.title, url);
  };

  const handlePrint = () => {
    const html = generatePrintableReport({
      report: finalReport,
      resultCode: finalResolved.fullCode,
      student: finalStudent,
      percentile,
      traits,
      dangerPatterns,
      future,
      actionText,
      characterBadge,
    });

    printReport(html);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <KakaoBadge>분석 완료 💛</KakaoBadge>
        <div className="rounded-full bg-white/80 px-3 py-1 text-[12px] font-black text-slate-500 shadow-sm">
          학습성향 결과 리포트
        </div>
      </div>

      <section className="relative overflow-hidden rounded-[34px] border border-[#F1D74C] bg-white px-5 py-6 shadow-[0_28px_70px_rgba(15,23,42,0.10)] sm:px-7 sm:py-7">
        <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[#FEE500]/30 blur-3xl" />
        <div className="absolute -left-10 bottom-0 h-28 w-28 rounded-full bg-[#FFF3A6]/60 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-[24px] bg-[#FEE500] text-3xl shadow-[0_16px_30px_rgba(250,224,90,0.34)]">
              {characterBadge.emoji}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#F2DE78] bg-[#FFF8D9] px-3 py-1.5 text-[12px] font-black text-slate-900 shadow-[0_8px_18px_rgba(250,224,90,0.18)]">
                <span className="text-[15px]">{characterBadge.emoji}</span>
                <span>{characterBadge.nickname}</span>
              </span>

              <span className="inline-flex items-center rounded-full bg-white px-3 py-1.5 text-[12px] font-black text-slate-500 shadow-sm">
                우리 아이 결과 캐릭터
              </span>
            </div>

            <p className="mt-3 text-[14px] font-bold leading-6 text-slate-500">
              {characterBadge.tagline}
            </p>

            <h1 className="mt-3 break-keep text-[28px] font-black tracking-[-0.05em] text-slate-950 sm:text-[36px]">
              {finalReport.title}
            </h1>

            <p className="mt-2 text-[15px] font-bold leading-7 text-slate-600">
              {finalReport.subtitle}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <KakaoBadge>상위 {percentile}</KakaoBadge>
              <KakaoBadge>{finalResolved.code}</KakaoBadge>
              <KakaoBadge>{finalResolved.diffText}</KakaoBadge>
            </div>
          </div>

          <div className="w-full max-w-[280px] rounded-[26px] border border-[#F2DE78] bg-[#FFF8D9] p-4 shadow-[0_12px_24px_rgba(250,224,90,0.16)]">
            <div className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
              Result Code
            </div>

            <div className="mt-1 text-[22px] font-black tracking-[-0.03em] text-slate-950">
              {finalResolved.code}
            </div>

            <div className="mt-1 text-[12px] font-bold text-slate-500">
              {finalResolved.fullCode}
            </div>

            <div className="mt-4 rounded-[20px] bg-white/80 p-4">
              <div className="text-[11px] font-black text-slate-400">학생 정보</div>

              <div className="mt-3 grid gap-2 text-sm font-bold text-slate-700">
                <div className="rounded-xl bg-slate-50 px-3 py-2">
                  이름 · {finalStudent.name || "이름 미입력"}
                </div>
                <div className="rounded-xl bg-slate-50 px-3 py-2">
                  학년 · {finalStudent.grade || "학년 미입력"}
                </div>
                <div className="rounded-xl bg-slate-50 px-3 py-2">
                  학교 · {finalStudent.school || "학교 미입력"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-6 rounded-[28px] border border-[#F4E38F] bg-[#FFFDF5] p-5">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-lg">🫶</span>
            <span className="text-[14px] font-black text-slate-900">한 줄 요약</span>
          </div>
          <p className="text-[15px] leading-7 text-slate-700">{finalReport.summary}</p>
        </div>
      </section>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-4">
          <BubbleCard
            title="실제 대화 느낌"
            desc="부모님이 자주 느끼는 반응을 카톡처럼 풀어봤어요."
            icon="💬"
            accentColor={finalReport.color}
          >
            <div className="flex flex-col gap-3">
              {chatScenario.map((item, index) => (
                <ChatBubble key={`${item.type}-${index}`} type={item.type}>
                  {item.text}
                </ChatBubble>
              ))}
            </div>
          </BubbleCard>

          <BubbleCard
            title="이 아이 실제 모습"
            desc="부모 입장에서 ‘맞다’ 싶은 포인트를 모았어요."
            icon="😮"
            accentColor={finalReport.color}
          >
            <div className="flex flex-wrap gap-2">
              {traits.map((trait) => (
                <TraitChip key={trait} text={trait} />
              ))}
            </div>
          </BubbleCard>

          <BubbleCard
            title="추천 학습 전략"
            desc="이 성향에서 가장 효과적으로 먹히는 방향이에요."
            icon="📘"
            accentColor={finalReport.color}
          >
            <p className="text-[15px] leading-7 text-slate-700">{finalReport.strategy}</p>
          </BubbleCard>

          <BubbleCard
            title="보호자 가이드"
            desc="부모님이 옆에서 도와줄 때 특히 중요한 포인트예요."
            icon="👨‍👩‍👧"
            accentColor={finalReport.color}
          >
            <p className="text-[15px] leading-7 text-slate-700">{finalReport.parent}</p>
          </BubbleCard>
        </div>

        <div className="grid gap-4">
          <BubbleCard
            title="이대로 가면 위험"
            desc="결과가 흔들릴 때 자주 보이는 패턴이에요."
            icon="⚠️"
            accentColor={finalReport.color}
          >
            <div className="grid gap-2">
              {dangerPatterns.map((item) => (
                <div
                  key={item}
                  className="rounded-[18px] border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700"
                >
                  {item}
                </div>
              ))}
            </div>
          </BubbleCard>

          <BubbleCard
            title="지금 당장 해야 할 1가지"
            desc="많이 말고, 이 한 가지부터 잡으면 좋아요."
            icon="🚀"
            accentColor={finalReport.color}
          >
            <div className="rounded-[22px] border border-[#F2DE78] bg-[#FFF8D9] px-4 py-4 text-[16px] font-black leading-7 text-slate-900">
              {actionText}
            </div>
          </BubbleCard>

          <BubbleCard
            title="미래 성장 시나리오"
            desc="앞으로 강점이 살아날 수 있는 방향이에요."
            icon="🧠"
            accentColor={finalReport.color}
          >
            <p className="text-[15px] leading-7 text-slate-700">{future}</p>

            <div className="mt-4 rounded-[20px] bg-slate-50 p-4">
              <div className="text-[12px] font-black text-slate-500">추천 진로 방향</div>
              <p className="mt-2 text-sm leading-7 text-slate-700">{finalReport.path}</p>
            </div>
          </BubbleCard>

          <BubbleCard
            title="아이에게 이렇게 말해보세요"
            desc="말투 하나만 바뀌어도 반응이 달라질 수 있어요."
            icon="💛"
            accentColor={finalReport.color}
          >
            <div className="rounded-[22px] border border-[#F2DE78] bg-[#FFF8D9] px-4 py-4 text-[15px] font-black leading-7 text-slate-800">
              “{finalReport.talk}”
            </div>
          </BubbleCard>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <button
          onClick={handleShare}
          className="h-14 rounded-[22px] bg-[#FEE500] text-[15px] font-black text-slate-900 shadow-[0_16px_32px_rgba(250,224,90,0.26)] transition hover:-translate-y-0.5"
        >
          결과 공유하기
        </button>

        <button
          onClick={handlePrint}
          className="h-14 rounded-[22px] border border-slate-200 bg-white text-[15px] font-black text-slate-800 transition hover:bg-slate-50"
        >
          결과 출력하기
        </button>

        <button
          onClick={onRestart ?? (() => {})}
          className="h-14 rounded-[22px] bg-slate-900 text-[15px] font-black text-white shadow-[0_16px_32px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5"
        >
          {restartLabel}
        </button>
      </div>
    </div>
  );
}