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

type ResultScreenProps = {
  student: StudentInfo;
  scores: Record<string, number>;
  resolved: ResolvedResult;
  report: Report;
  onRestart: () => void;
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

function buildShareText(title: string) {
  return `우리 아이 학습유형 결과 😮

👉 ${title}

생각보다 정확해서 놀람...
무료 테스트 해보세요👇
https://study-type-test-app-zbmw.vercel.app`;
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    alert("링크가 복사됐어요 👍");
  } catch {
    alert("복사에 실패했어요. 다시 시도해 주세요.");
  }
}

async function shareNative(text: string) {
  try {
    if (navigator.share) {
      await navigator.share({
        title: "학습성향 검사",
        text,
        url: "https://study-type-test-app-zbmw.vercel.app",
      });
      return;
    }

    await copyToClipboard(text);
  } catch {
    // 공유 취소 포함 무시
  }
}

function getPercentile(key: string) {
  if (key.includes("ERMS") || key.includes("ECMF")) return 1;
  if (key.includes("ERMF") || key.includes("ECMS")) return 3;
  if (key.includes("EROS") || key.includes("ECOS")) return 10;
  if (key.includes("PRMF") || key.includes("PCMF")) return 20;
  return 70;
}

function getTraits(key: string) {
  if (key.includes("ER")) {
    return [
      "발표·소통 상황에서 에너지가 살아나요",
      "리더 역할을 맡을 때 강점이 드러나요",
      "외부 자극이 있을수록 추진력이 올라가요",
    ];
  }

  if (key.includes("PC")) {
    return [
      "혼자 집중할 때 몰입이 높아요",
      "조용하지만 생각의 깊이가 있는 편이에요",
      "겉보다 속이 단단한 스타일이에요",
    ];
  }

  if (key.includes("PR")) {
    return [
      "관심 있는 과목은 확실히 잘해요",
      "싫은 건 미루기 쉬운 편이에요",
      "환경에 따라 성과 차이가 커질 수 있어요",
    ];
  }

  return [
    "상황에 따라 유연하게 적응해요",
    "균형 잡힌 스타일을 가지고 있어요",
    "안정적으로 실력을 쌓아갈 가능성이 커요",
  ];
}

function getFuture(key: string) {
  if (key.includes("ER")) {
    return "리더형, 기획형, 활동 중심 역할에서 강점이 드러날 가능성이 큽니다.";
  }

  if (key.includes("EC")) {
    return "전문직, 분석형, 언어/연구 계열에서 깊이 있는 성장 가능성이 높습니다.";
  }

  if (key.includes("PR") || key.includes("PC")) {
    return "특정 분야에 강하게 몰입하는 전문가형으로 성장할 가능성이 큽니다.";
  }

  return "균형형 인재로 다양한 진로 선택지 속에서 안정적으로 성장할 수 있습니다.";
}

function getDangerPattern(key: string) {
  if (key.includes("PR") || key.includes("PC")) {
    return [
      "좋아하는 것만 하는 패턴",
      "마무리 부족",
      "성적 편차가 커질 수 있음",
    ];
  }

  if (key.includes("ER")) {
    return [
      "집중력 분산",
      "활동이 과해질 수 있음",
      "계획이 흐트러질 수 있음",
    ];
  }

  return ["목표 없이 흐름만 유지", "성장 속도가 느려질 수 있음"];
}

function getAction(key: string) {
  if (key.includes("PR") || key.includes("PC")) {
    return "하루 1시간이라도 무조건 끝까지 앉아있는 습관 만들기";
  }

  if (key.includes("ER")) {
    return "활동 시간을 조금 줄이고 공부 시간을 고정하기";
  }

  return "하루 학습 루틴을 일정하게 유지하기";
}

function getChatScenario(key: string) {
  if (key.includes("PR") || key.includes("PC")) {
    return [
      { type: "parent" as const, text: "요즘 왜 이렇게 공부를 미루는 것 같지?" },
      { type: "child" as const, text: "해야 하는 건 아는데... 딱 꽂히는 게 아니면 잘 안 잡혀..." },
      { type: "parent" as const, text: "좋아하는 건 진짜 집중해서 하잖아?" },
      { type: "child" as const, text: "응... 재밌는 건 오래 할 수 있는데, 아닌 건 너무 힘들어." },
    ];
  }

  if (key.includes("ER")) {
    return [
      { type: "parent" as const, text: "너는 분명 잘할 수 있는데 왜 공부 리듬이 자꾸 흔들릴까?" },
      { type: "child" as const, text: "혼자 하면 좀 심심하고... 뭔가 자극이 있어야 더 잘돼." },
      { type: "parent" as const, text: "친구들이나 분위기 영향을 많이 받는 편이구나?" },
      { type: "child" as const, text: "응! 분위기 좋으면 진짜 열심히 해." },
    ];
  }

  if (key.includes("EC")) {
    return [
      { type: "parent" as const, text: "겉으로는 티가 안 나는데 속으로 생각이 많지?" },
      { type: "child" as const, text: "응... 머릿속으론 많이 생각하는데 바로 말하긴 좀 그래." },
      { type: "parent" as const, text: "그래도 한번 시작하면 되게 깊게 하더라." },
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

function getCharacterBadge(key: string) {
  if (key.includes("ERMS")) {
    return { emoji: "🧠", nickname: "창의 연구자" };
  }

  if (key.includes("ERMF")) {
    return { emoji: "⚡", nickname: "몰입 발명가" };
  }

  if (key.includes("EROS")) {
    return { emoji: "📘", nickname: "엘리트 플래너" };
  }

  if (key.includes("EROF")) {
    return { emoji: "🚀", nickname: "에너지 크리에이터" };
  }

  if (key.includes("PRMF")) {
    return { emoji: "🎯", nickname: "자유로운 문제해결사" };
  }

  if (key.includes("PROS") || key.includes("PRMS")) {
    return { emoji: "🌱", nickname: "성장 새싹" };
  }

  if (key.includes("ECMF")) {
    return { emoji: "🎨", nickname: "감각 스토리텔러" };
  }

  if (key.includes("ECMS")) {
    return { emoji: "👑", nickname: "품격 있는 우등생" };
  }

  if (key.includes("ECOS")) {
    return { emoji: "📚", nickname: "깊이형 사색가" };
  }

  if (key.includes("PCOS")) {
    return { emoji: "🧩", nickname: "정교한 실천가" };
  }

  if (key.includes("PCMF")) {
    return { emoji: "🌙", nickname: "조용한 몰입러" };
  }

  if (key.includes("PCOF") || key.includes("PCMS")) {
    return { emoji: "☀️", nickname: "따뜻한 성장형" };
  }

  return { emoji: "✨", nickname: "성향 분석 캐릭터" };
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
  percentile: number;
  traits: string[];
  dangerPatterns: string[];
  future: string;
  actionText: string;
  characterBadge: {
    emoji: string;
    nickname: string;
  };
}) {
  const safe = (value?: string) =>
    (value || "-")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const traitItems = traits
    .map(
      (item) => `
        <div class="chip">${safe(item)}</div>
      `
    )
    .join("");

  const dangerItems = dangerPatterns
    .map(
      (item) => `
        <div class="danger-item">${safe(item)}</div>
      `
    )
    .join("");

  return `
<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <title>${safe(report.title)} 결과 리포트</title>
  <style>
    @page {
      size: A4;
      margin: 16mm;
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    html, body {
      margin: 0;
      padding: 0;
      font-family: "Pretendard", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif;
      color: #111827;
      background: #fff8d9;
    }

    body {
      line-height: 1.65;
      font-size: 12.5px;
    }

    .page {
      width: 100%;
    }

    .hero {
      background: linear-gradient(135deg, #fee500 0%, #fff3a6 100%);
      border-radius: 28px;
      padding: 28px;
      border: 1px solid #f1d74c;
      color: #111827;
    }

    .hero-sub {
      font-size: 11px;
      letter-spacing: 0.14em;
      font-weight: 900;
      color: #6b7280;
    }

    .char-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 14px;
      align-items: center;
    }

    .char-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      border-radius: 999px;
      padding: 8px 12px;
      background: rgba(255,255,255,0.75);
      border: 1px solid rgba(17,24,39,0.08);
      font-size: 12px;
      font-weight: 900;
      color: #111827;
    }

    .hero-title {
      margin-top: 12px;
      font-size: 30px;
      line-height: 1.2;
      font-weight: 900;
      letter-spacing: -0.03em;
      color: #111827;
    }

    .hero-summary {
      margin-top: 14px;
      max-width: 92%;
      font-size: 14px;
      line-height: 1.8;
      color: #374151;
    }

    .badge-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 18px;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      border-radius: 999px;
      padding: 7px 12px;
      font-size: 11px;
      font-weight: 900;
      background: rgba(255,255,255,0.72);
      border: 1px solid rgba(17,24,39,0.08);
      color: #111827;
    }

    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-top: 18px;
    }

    .card {
      border: 1px solid #e5e7eb;
      border-radius: 22px;
      padding: 18px;
      background: #ffffff;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .tint {
      background: #fffdf5;
      border: 1px solid #f3e28d;
    }

    .danger {
      background: #fff1f2;
      border: 1px solid #fecdd3;
    }

    .section-title {
      font-size: 18px;
      font-weight: 900;
      letter-spacing: -0.02em;
      margin: 0 0 10px 0;
      color: #111827;
    }

    .body-copy {
      font-size: 12.5px;
      line-height: 1.9;
      color: #374151;
      white-space: pre-wrap;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 10px;
    }

    .info-item {
      border-radius: 16px;
      padding: 12px;
      background: #f8fafc;
      border: 1px solid #e5e7eb;
    }

    .info-label {
      font-size: 10px;
      font-weight: 900;
      letter-spacing: 0.16em;
      color: #9ca3af;
      text-transform: uppercase;
    }

    .info-value {
      margin-top: 6px;
      font-size: 12px;
      line-height: 1.8;
      color: #374151;
      white-space: pre-wrap;
    }

    .chip-wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .chip {
      border-radius: 999px;
      padding: 8px 12px;
      background: #f8fafc;
      border: 1px solid #e5e7eb;
      font-size: 12px;
      font-weight: 800;
      color: #374151;
    }

    .danger-list {
      display: grid;
      gap: 8px;
    }

    .danger-item {
      border-radius: 16px;
      padding: 10px 12px;
      background: white;
      border: 1px solid #fecdd3;
      font-size: 12px;
      font-weight: 800;
      color: #be123c;
    }

    .action-box {
      margin-top: 12px;
      border-radius: 18px;
      padding: 14px;
      background: #fff8d9;
      border: 1px solid #f3e28d;
      font-size: 14px;
      font-weight: 900;
      color: #111827;
      line-height: 1.8;
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
      <div class="hero-summary">${safe(report.summary)}</div>

      <div class="badge-row">
        <div class="badge">상위 ${safe(String(percentile))}% 경향</div>
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
            <div class="info-item">
              <div class="info-label">이름</div>
              <div class="info-value">${safe(student.name)}</div>
            </div>
            <div class="info-item">
              <div class="info-label">학년</div>
              <div class="info-value">${safe(student.grade)}</div>
            </div>
            <div class="info-item">
              <div class="info-label">학교</div>
              <div class="info-value">${safe(student.school)}</div>
            </div>
            <div class="info-item">
              <div class="info-label">전화번호</div>
              <div class="info-value">${safe(student.phone)}</div>
            </div>
          </div>
        </section>

        <section class="card tint" style="margin-top:16px;">
          <h2 class="section-title">이 아이 실제 모습</h2>
          <div class="chip-wrap">
            ${traitItems}
          </div>
        </section>

        <section class="card danger" style="margin-top:16px;">
          <h2 class="section-title">주의 패턴</h2>
          <div class="danger-list">
            ${dangerItems}
          </div>
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
          {desc ? (
            <p className="mt-1 text-sm leading-6 text-slate-500">{desc}</p>
          ) : null}
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
            isParent
              ? "bg-[#FFF3A6] text-slate-900"
              : "bg-slate-900 text-white",
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

export default function ResultScreen({
  student,
  scores,
  resolved,
  report,
  onRestart,
}: ResultScreenProps) {
  const percentile = useMemo(() => getPercentile(resolved.key), [resolved.key]);
  const traits = useMemo(() => getTraits(resolved.key), [resolved.key]);
  const future = useMemo(() => getFuture(resolved.key), [resolved.key]);
  const dangerPatterns = useMemo(
    () => getDangerPattern(resolved.key),
    [resolved.key]
  );
  const actionText = useMemo(() => getAction(resolved.key), [resolved.key]);
  const chatScenario = useMemo(
    () => getChatScenario(resolved.key),
    [resolved.key]
  );
  const characterBadge = useMemo(
    () => getCharacterBadge(resolved.key),
    [resolved.key]
  );

  const handleShare = async () => {
    const text = buildShareText(report.title);
    await shareNative(text);
  };

  const handlePrint = () => {
    const html = generatePrintableReport({
      report,
      resultCode: resolved.fullCode,
      student,
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

            <h1 className="mt-3 break-keep text-[28px] font-black tracking-[-0.05em] text-slate-950 sm:text-[36px]">
              {report.title}
            </h1>

            <p className="mt-2 text-[15px] font-bold leading-7 text-slate-600">
              {report.subtitle}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <KakaoBadge>상위 {percentile}% 경향</KakaoBadge>
              <KakaoBadge>{resolved.code}</KakaoBadge>
              <KakaoBadge>{resolved.diffText}</KakaoBadge>
            </div>
          </div>

          <div className="w-full max-w-[280px] rounded-[26px] border border-[#F2DE78] bg-[#FFF8D9] p-4 shadow-[0_12px_24px_rgba(250,224,90,0.16)]">
            <div className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
              Result Code
            </div>

            <div className="mt-1 text-[22px] font-black tracking-[-0.03em] text-slate-950">
              {resolved.code}
            </div>

            <div className="mt-1 text-[12px] font-bold text-slate-500">
              {resolved.fullCode}
            </div>

            <div className="mt-4 rounded-[20px] bg-white/80 p-4">
              <div className="text-[11px] font-black text-slate-400">
                학생 정보
              </div>

              <div className="mt-3 grid gap-2 text-sm font-bold text-slate-700">
                <div className="rounded-xl bg-slate-50 px-3 py-2">
                  이름 · {student.name || "이름 미입력"}
                </div>
                <div className="rounded-xl bg-slate-50 px-3 py-2">
                  학년 · {student.grade || "학년 미입력"}
                </div>
                <div className="rounded-xl bg-slate-50 px-3 py-2">
                  학교 · {student.school || "학교 미입력"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-6 rounded-[28px] border border-[#F4E38F] bg-[#FFFDF5] p-5">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-lg">🫶</span>
            <span className="text-[14px] font-black text-slate-900">
              한 줄 요약
            </span>
          </div>
          <p className="text-[15px] leading-7 text-slate-700">
            {report.summary}
          </p>
        </div>
      </section>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-4">
          <BubbleCard
            title="실제 대화 느낌"
            desc="부모님이 자주 느끼는 반응을 카톡처럼 풀어봤어요."
            icon="💬"
            accentColor={report.color}
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
            accentColor={report.color}
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
            accentColor={report.color}
          >
            <p className="text-[15px] leading-7 text-slate-700">
              {report.strategy}
            </p>
          </BubbleCard>

          <BubbleCard
            title="보호자 가이드"
            desc="부모님이 옆에서 도와줄 때 특히 중요한 포인트예요."
            icon="👨‍👩‍👧"
            accentColor={report.color}
          >
            <p className="text-[15px] leading-7 text-slate-700">
              {report.parent}
            </p>
          </BubbleCard>
        </div>

        <div className="grid gap-4">
          <BubbleCard
            title="이대로 가면 위험"
            desc="결과가 흔들릴 때 자주 보이는 패턴이에요."
            icon="⚠️"
            accentColor={report.color}
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
            accentColor={report.color}
          >
            <div className="rounded-[22px] border border-[#F2DE78] bg-[#FFF8D9] px-4 py-4 text-[16px] font-black leading-7 text-slate-900">
              {actionText}
            </div>
          </BubbleCard>

          <BubbleCard
            title="미래 성장 시나리오"
            desc="앞으로 강점이 살아날 수 있는 방향이에요."
            icon="🧠"
            accentColor={report.color}
          >
            <p className="text-[15px] leading-7 text-slate-700">
              {future}
            </p>

            <div className="mt-4 rounded-[20px] bg-slate-50 p-4">
              <div className="text-[12px] font-black text-slate-500">
                추천 진로 방향
              </div>
              <p className="mt-2 text-sm leading-7 text-slate-700">
                {report.path}
              </p>
            </div>
          </BubbleCard>

          <BubbleCard
            title="아이에게 이렇게 말해보세요"
            desc="말투 하나만 바뀌어도 반응이 달라질 수 있어요."
            icon="💛"
            accentColor={report.color}
          >
            <div className="rounded-[22px] border border-[#F2DE78] bg-[#FFF8D9] px-4 py-4 text-[15px] font-black leading-7 text-slate-800">
              “{report.talk}”
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
          onClick={onRestart}
          className="h-14 rounded-[22px] bg-slate-900 text-[15px] font-black text-white shadow-[0_16px_32px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5"
        >
          다시 검사하기
        </button>
      </div>
    </div>
  );
}