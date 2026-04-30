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

type ResultProfile = {
  key: string;
  aliases: string[];
  report: Report;
  meta: CharacterMeta;
};

type ChatLine = {
  type: "parent" | "child";
  text: string;
};

type AnalysisBlock = {
  traits: string[];
  futureTitle: string;
  futureBody: string[];
  dangerPatterns: string[];
  actionText: string;
  chatScenario: ChatLine[];
};

function hexToRgba(hex: string, alpha: number) {
  const normalized = (hex || "#475569").replace("#", "");
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized;

  const num = parseInt(full || "475569", 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function buildShareText(title: string, url: string) {
  return `우리 아이 학습유형 결과 😮\n\n👉 ${title}\n\n결과 보러가기👇\n${url}`;
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

function normalizeKey(value?: string) {
  return (value || "").replace(/\s+/g, "").trim();
}

const RESULT_PROFILE_DB: ResultProfile[] = [
  {
    key: "ERMs",
    aliases: [],
    report: {
      title: "이과 창의적영재형",
      subtitle: "1% 미만",
      summary:
        "극상위권 성적과 이과적 두뇌, 창의적 사고가 매우 강한 최상위 영재형입니다. 특정 과목에서는 절대 지존일 가능성이 큽니다. (내신0.1%이내)",
      strategy:
        "학생의 자기주도성을 존중, 선행·심화 학습 꼭 필요(2~3년), 경시대회·비교과도 관리, 수능만점 목표",
      parent:
        "통제보다 신뢰가 중요합니다. 일반 학생 집단보다 학습 만족도를 채워줄 수 있는 최상위 그룹 환경이 효과적",
      path:
        "고교선택: 영재고, 과학고, 자사고/ 대학선택: 서울대, 카이스트, 포항공대, 연세대, 의예/ 학과선택: 물리·화학·수학·생명과학/ 직업선택: 교수, 연구원, 의사",
      danger:
        "개인적 특성이 강해 또래와의 동화가 어렵거나, 수준이 맞지 않는 환경에서 흥미가 급격히 떨어질 수 있습니다.",
      talk: "네가 원하는 방향으로 가되, 큰 목표는 같이 설계해보자.",
      color: "#2563eb",
    },
    meta: {
      label: "수학神 과학神",
      tagline: "이과적 두뇌와 창의 사고가 뛰어난 극상위형",
      emoji: "🧠",
      aura: "from-blue-500/25 via-sky-400/10 to-cyan-300/20",
    },
  },
  {
    key: "ERMS",
    aliases: ["ERmS", "ERms"],
    report: {
      title: "이과 모범적영재형",
      subtitle: "2% 미만",
      summary:
        "모든 과목에서 고르게 최상위 성적을 유지하는 이상적인 이과 영재형입니다. 계획성과 실천력이 매우 뛰어납니다. 수능만점 목표",
      strategy:
        "학생 의견을 중심으로 학습 방향을 잡아도 안정적이며, 선행·심화 학습과 고난도 목표를 함께 설계할수록 성과가 커집니다.",
      parent:
        "부모가 과하게 흔들기보다 믿고 지지해 주는 방식이 좋습니다. 다만 멘탈 관리는 간헐적으로 점검해 주는 것이 필요합니다.",
      path: "고교선택: 과학고, 자사고/ 대학선택: SKY, 메디칼/ 학과선택: 의치대, 공대/ 직업선택: 의사, 치과의사, 교수",
      danger:
        "완성도가 높은 만큼 학업 스트레스가 누적되면 타격이 클 수 있습니다.",
      talk:
        "너의 학업능력은 충분하니, 미래 목표까지 갈 수 있도록 리듬과 멘탈만 같이 챙기자.",
      color: "#1d4ed8",
    },
    meta: {
      label: "고집불통",
      tagline: "전 과목 고르게 최상위권을 유지하는 이상적 영재형",
      emoji: "👑",
      aura: "from-blue-600/25 via-indigo-400/10 to-sky-300/20",
    },
  },
  {
    key: "eRMF",
    aliases: ["eRMf", "ERMF", "ERMf", "ERmF", "ERmf"],
    report: {
      title: "이과 영재형",
      subtitle: "3% 미만",
      summary:
        "특정 과목에서 압도적인 성취를 보이는 영재형입니다. 관심 분야에서는 타의 추종을 불허합니다.",
      strategy:
        "호기심이 많아 하나에 집중하기가 어려우므로, 시작한 일에 끝까지 집중 할 수 있도록 관심을 가져야 합니다.",
      parent:
        "독특하고 산만해 똘끼가 있다는 얘기를 듣습니다. 시작한 일에 성과를 낼 때까지 꾸준한 관리 필요",
      path:
        "고교선택: 영재고, 과학고, 자사고/ 대학선택: SKY, 카이스트, 포항공대/ 학과선택: 물리학, 수학, 전기전자공학/ 직업선택: 발명가, IT연구원, 교수",
      danger:
        "많은 일을 벌이고 끝맺음이 약해지면 전체 성과가 흩어질 수 있습니다.",
      talk: "강점을 더 강하게, 끝까지 완성하는 힘도 같이 만들어보자.",
      color: "#0f766e",
    },
    meta: {
      label: "관심과목의 神",
      tagline: "특정 과목에서 압도적 강점을 보이는 영재형",
      emoji: "⚡",
      aura: "from-teal-500/25 via-emerald-400/10 to-cyan-300/20",
    },
  },
  {
    key: "eROS",
    aliases: ["eRoS", "EROf", "EROS", "EROs", "ERoS", "ERos", "eRMS", "eRMs"],
    report: {
      title: "이과모범형",
      subtitle: "4%~10% 미만",
      summary:
        "전교과 내신과 모의고사를 안정적으로 유지하는 이과 상위권입니다. 계획성과 실천력이 고르게 잘 잡혀 있습니다. 내신10%이내",
      strategy:
        "내신 중심 전략과 시험 리듬 유지가 중요합니다. 일반고에서 전교권 유지 전략과 교과 중심 학종이 잘 맞습니다.",
      parent:
        "학생 방식에 맞춰줘도 대체로 안정적이지만, 친구·외부 활동 때문에 학습 리듬이 깨지지 않도록 관리가 필요합니다.",
      path:
        "고교선택: 일반고(중위권 이상)/ 대학선택: SKY, 의대/ 학과선택: 의대, 치대, 한의대, 자연과학, 공학, 수의학/ 직업선택: 의사, 치과의사, 한의사, 교수, 연구원, 수의사, 약사",
      danger:
        "적극적인 성향 때문에 외부 활동으로 공부 리듬이 흔들 수 있고, 시험불안 관리가 필요합니다.(주기적인 희망고문 필요)",
      talk:
        "지금 리듬만 잘 지키면 충분히 높은 목표까지 갈 수 있어.",
      color: "#0891b2",
    },
    meta: {
      label: "이과 범생이",
      tagline: "안정적 내신과 실천력이 강한 상위권형",
      emoji: "📘",
      aura: "from-sky-500/25 via-cyan-400/10 to-blue-300/20",
    },
  },
  {
    key: "eRmS",
    aliases: ["eRms", "pRMS", "pRmS", "pROS", "pRoS"],
    report: {
      title: "수동적 이과 모범형",
      subtitle: "4%~10% 미만",
      summary:
        "성실함과 인내심으로 상위권을 안정적으로 유지하는 유형입니다. 겉으로 드러나는 추진력은 약해도 꾸준함이 강점입니다.",
      strategy:
        "안정적 내신 유지, 개념 정리, 시험불안 관리, 그리고 리더십 경험과 교내 활동을 통해 자신감을 키우자",
      parent:
        "실력은 충분하지만 존재감이 약할 수 있어요. 너무 강하게 밀기보다 안정감을 해치지 않는 선에서 경험 폭을 넓혀주는 것이 좋습니다.",
      path:
        "고교선택: 일반고(뱀머리 전략)/ 대학선택: SKY, 지방의대/ 학과선택: 의대, 치대, 한의대, 자연과학, 공학, 수의학/ 직업선택: 의사, 치과의사, 한의사, 교수, 연구원, 수의사, 약사",
      danger:
        "쉬운 문제에서 실수가 멘탈에 큰 타격이 될 수 있고, 지나치게 수동적이면 기회를 놓칠 수 있습니다.",
      talk:
        "차분히 쌓아온 힘이 크니까, 이제는 조금 더 자신감을 가져보자.",
      color: "#0284c7",
    },
    meta: {
      label: "수동적 범생이",
      tagline: "성실함과 인내로 상위권을 유지하는 유형",
      emoji: "🛡️",
      aura: "from-cyan-500/25 via-sky-400/10 to-indigo-300/20",
    },
  },
  {
    key: "PRMF",
    aliases: ["PRMf", "PRmF", "PRmf", "PRMs", "pRMs", "pRMF", "pRMf", "pRmF", "pRmf", "pRoF"],
    report: {
      title: "이과 뺀질이형",
      subtitle: "20% 미만",
      summary:
        "수학 또는 과학처럼 관심 있는 과목은 강하지만, 관심 없는 과목은 관리를 하지 않습니다. 분위기에 휩쓸리기 쉬움, 위기의식 부족",
      strategy:
        "전 과목을 규칙적으로 관리하고, 절대 학습시간을 확보하며, 감독관 있는 환경에서(관리형 스터디카페) 학습 효율을 높이는 전략이 필요합니다.",
      parent:
        "강제적 학습환경과, 절대 학습시간 확보가 중요합니다.",
      path:
        "고교선택: 자사고, 일반고/ 대학선택: 중상위권 대학/ 학과선택: 이공계열/ 직업선택: IT분야, 연구원, CEO",
      danger:
        "선호 과목만 파고들다 전체 성적 균형이 무너질 수 있고, 분위기에 휩쓸리면 성과 편차가 커집니다.",
      talk:
        "재능은 충분하니까, 좋아하는 것만이 아니라 끝까지 균형 있게 가는 힘을 같이 만들어보자.",
      color: "#7c3aed",
    },
    meta: {
      label: "자유로운 영혼",
      tagline: "관심 과목에서만 강하게 튀는 편차형",
      emoji: "🎯",
      aura: "from-violet-500/25 via-fuchsia-400/10 to-purple-300/20",
    },
  },
  {
    key: "EROF",
    aliases: ["ERoF", "ERof", "eROF", "eROf", "eRoF", "eRof", "eRmF", "eRmf"],
    report: {
      title: "외향적 이과뺀질형",
      subtitle: "20% 미만",
      summary:
        "관심 특정 과목에서는 성과가 빠르게 올라가지만 환경과 분위기에 영향을 크게 받는 유형입니다.",
      strategy:
        "통제적 환경, 관리 철저한 학습 공간, 소규모 팀수업과 책임감 있는 역할 경험이 효과적입니다.",
      parent:
        "혼자 잘할 거라고 두기보다 환경을 설계해 주는 것이 핵심입니다. 결과물과 책임 경험이 학습 태도를 바꾸는 데 도움이 됩니다.",
      path:
        "고교선택: 자사고/ 대학선택: 상위권 대학/ 학과선택: 자유전공, 자연과학, 건축/ 직업선택: 건축가, 이공계CEO, IT분야, 연구원",
      danger:
        "많은 일을 시작하나 끝맺음이 약할 수 있으며, 주변 분위기에 따라 성적 편차가 매우 커질 수 있습니다.",
      talk:
        "주변 환경만 잘 맞추면 큰 성적 향상이 기대되니, 끝까지 집중해 보자.",
      color: "#9333ea",
    },
    meta: {
      label: "머리만 좋은애",
      tagline: "환경과 분위기 영향을 크게 받는 활동형",
      emoji: "🚀",
      aura: "from-purple-500/25 via-fuchsia-400/10 to-pink-300/20",
    },
  },
  {
    key: "PROF",
    aliases: [
      "PROf", "pROF", "pROf", "eROs", "eRos", "PRoF", "PRof", "pRof",
      "PROS", "PROs", "PRoS", "PRos", "PRmS", "PRms", "PRMS", "pRms", "pROs", "pRos",
    ],
    report: {
      title: "이과 잠재성장형",
      subtitle: "70% 내외",
      summary:
        "지금은 '???'가 많지만, 단계적으로 성과를 쌓아가면 크게 성장할 수 있는 대기만성형입니다.",
      strategy:
        "선행보다 내신 중심으로 접근하고, 한 과목씩 성취 경험을 만들어 자신감을 회복시키는 방식이 가장 효과적입니다.",
      parent:
        "한과목에서 성취 경험이 중요합니다. 공부의 양보다 질을 높이는 것이 중요합니다.",
      path:
        "고교선택: 일반고/ 대학선택: 중상위권 대학/ 학과선택: 간호, 사범대, 자연과학/ 직업선택: 교사, 간호사, 물리치료사, 약사, 공무원, 회계사",
      danger:
        "막연한 목표만 세우면 쉽게 지칠 수 있고, 물리적 시간만 늘리고 집중력이 따라오지 않으면 비효율이 커집니다.",
      talk:
        "한 번에 다 잘하려고 하지 말고, 이번엔 한 과목 한 단계만 확실히 끝내보자.",
      color: "#ea580c",
    },
    meta: {
      label: "성장 원석",
      tagline: "발견 시점에 따라 가능성이 커지는 대기만성형",
      emoji: "🌱",
      aura: "from-orange-500/25 via-amber-400/10 to-yellow-300/20",
    },
  },
  {
    key: "ECMF",
    aliases: ["ECMf"],
    report: {
      title: "문과 창의적 영재형",
      subtitle: "1% 미만",
      summary:
        "문과적 창의성과 표현력이 매우 강하며, 관심 과목에서는 절대적인 강점을 보이는 최상위 유형입니다. (문과성향 이과영재형)",
      strategy: "관심 과목 선행 및 심화학습 필요.",
      parent:
        "독특함을 고치기보다 개성으로 인정하고 도와주는 것이 중요합니다.",
      path:
        "고교선택: 자사고, 외고/ 대학선택: SKY, 서강대 Art&Tech/ 학과선택: 어문계열, 신문방송, 연극영화, 산업공학/ 직업선택: 교수, 언론인, 광고기획자, 영화감독, 방송PD, 게임기획자",
      danger:
        "산만하고 엉뚱해 보일 수 있어도 핵심 재능을 놓치면 안 됩니다. 너무 일반적 틀에 맞추려 하면 강점이 죽을 수 있습니다.",
      talk:
        "네 생각이 남다른 건 강점이야. 그걸 결과물로 어떻게 보여줄지 같이 만들어보자.",
      color: "#db2777",
    },
    meta: {
      label: "초감각 스토리텔러",
      tagline: "문과 창의성과 표현력이 뛰어난 극상위형",
      emoji: "🎨",
      aura: "from-pink-500/25 via-rose-400/10 to-fuchsia-300/20",
    },
  },
  {
    key: "ECMS",
    aliases: ["eCMS"],
    report: {
      title: "문과 모범형 영재형",
      subtitle: "2% 미만",
      summary:
        "전교과 고르게 최상위 성적을 유지하며 자기관리와 계획 실천이 매우 뛰어난 이상적 문과 영재입니다.",
      strategy:
        "학생 의견을 존중하면서도 선행·심화 학습과 체력 관리, 목표 대학 전략까지 함께 관리하는 방식이 좋습니다.",
      parent:
        "과하게 통제할 필요는 없습니다. 신뢰를 바탕으로 체력과 멘탈만 보조해주는 것이 가장 효과적입니다.",
      path:
        "고교선택: 외고, 자사고, 일반고/ 대학선택: SKY, 한의대/ 학과선택: 경영, 신문방송, 행정, 자유전공/ 직업선택: 교수, 고위공무원, 법조인, 한의사, 외교관",
      danger:
        "높은 완성도 뒤에 부담감이 누적될 수 있어 간헐적 멘탈 관리가 필요합니다.",
      talk: "지금도 충분히 잘하고 있어!!",
      color: "#2563eb",
    },
    meta: {
      label: "타고난 우등생",
      tagline: "전 과목 극상위와 자기관리가 강한 문과형",
      emoji: "👑",
      aura: "from-blue-500/25 via-indigo-400/10 to-sky-300/20",
    },
  },
  {
    key: "ECMs",
    aliases: ["eCMs", "ECoF", "ECmf"],
    report: {
      title: "문과 영재형",
      subtitle: "3% 미만",
      summary:
        "언어·외국어 영역에서 매우 강하고 수학도 우수한 편으로, 특정 과목 최상위 성취가 가능한 문과 영재형입니다.",
      strategy:
        "심화·선행 학습과 스펙 관리, 토론·발표·언어 활동을 함께 설계하면 강점이 크게 살아납니다.",
      parent:
        "언변과 통찰력은 강하지만 실천 습관은 별도 관리가 필요할 수 있습니다. 계획을 실제 행동으로 이어지게 도와주세요.",
      path:
        "고교선택: 자사고, 외고, 국제고/ 대학선택: SKY/ 학과선택: 어문계열, 신문방송, 정치외교/ 직업선택: 법조인, 언론인, 외교관, 교수",
      danger:
        "실천력이 부족해지면 잠재력 대비 결과가 덜 드러날 수 있습니다.",
      talk:
        "생각의 깊이는 충분하니, 이제 그 힘을 실천으로 연결해보자.",
      color: "#7c3aed",
    },
    meta: {
      label: "언어 영재",
      tagline: "언어·외국어 영역 강점이 두드러지는 유형",
      emoji: "📚",
      aura: "from-violet-500/25 via-indigo-400/10 to-purple-300/20",
    },
  },
  {
    key: "pCMS",
    aliases: [],
    report: {
      title: "내성적 문과영재형",
      subtitle: "3% 미만",
      summary:
        "강한 사고력과 언어 재능을 갖췄지만 겉으로 드러나는 에너지가 낮은 편인 영재입니다.",
      strategy:
        "심화 학습, 언어 기반 결과물, 발표·토론 기회를 조금씩 늘리며 자신만의 강점을 밖으로 드러내게 하는 것이 좋습니다.",
      parent:
        "겉으로 조용하다고 약한 것이 아닙니다. 속으로 깊게 사고하므로 기다려주고, 표현 기회를 안정적으로 열어주는 것이 중요합니다.",
      path:
        "고교선택: 자사고, 외고, 국제고/ 대학선택: SKY/ 학과선택: 어문계열, 신문방송, 정치외교/ 직업선택: 법조인, 언론인, 외교관, 교수",
      danger:
        "실천보다 사고에 머물러 결과물이 늦어질 수 있습니다. (자기관리 필요)",
      talk:
        "생각이 깊다는 건 큰 강점이야. 이제 그 생각을 바깥으로 조금씩 보여주자.",
      color: "#6d28d9",
    },
    meta: {
      label: "깊이형 사색가",
      tagline: "조용하지만 깊고 강한 언어 감각형",
      emoji: "🪄",
      aura: "from-purple-500/25 via-violet-400/10 to-fuchsia-300/20",
    },
  },
  {
    key: "ECOS",
    aliases: ["ECOs", "ECoS", "ECos", "ECmS", "ECms", "eCmS", "eCms"],
    report: {
      title: "문과 모범형A",
      subtitle: "4%~6% 미만",
      summary:
        "내신이 고르고 안정적이며 자기주도와 계획·실천이 조화를 이루는 최상위권 문과 모범형입니다.",
      strategy:
        "일반고에서 내신 최상위권 유지 전략이 잘 맞고, 교과 중심 학종과 규칙적인 멘토링이 효과적입니다.",
      parent:
        "시험불안과 멘탈 관리를 주기적으로 챙겨주고, 규칙적 대화 창구를 만들어 주는 것이 좋습니다.",
      path:
        "고교선택: 일반고(뱀머리전략)/ 대학선택: SKY/ 학과선택: 경영, 경제, 행정/ 직업선택: 법조인, 교수, 고위공무원, 회계사",
      danger:
        "내성적일수록 도움 요청을 늦게 할 수 있고, 쉬운 부분의 실수가 멘탈에 큰 영향을 줄 수 있습니다.",
      talk:
        "혼자 버티는 힘도 크지만, 막히는 지점은 같이 정리하면 더 빨리 올라갈 수 있어.",
      color: "#0284c7",
    },
    meta: {
      label: "정교한 실천가",
      tagline: "내신과 실천이 매우 안정적인 문과 모범형",
      emoji: "🧩",
      aura: "from-cyan-500/25 via-blue-400/10 to-slate-300/20",
    },
  },
  {
    key: "pCOS",
    aliases: ["pCoS", "pCmS"],
    report: {
      title: "내성적 문과 모범형",
      subtitle: "4%~6% 미만",
      summary:
        "조용하지만 안정적이고 자기주도적인 상위권 문과형입니다. 계획과 실천이 잘 맞물리는 편입니다.",
      strategy:
        "내신 최상위 유지, 개념 정리, 규칙적인 멘토링, 시험불안 관리 중심의 전략이 효과적입니다.",
      parent:
        "간섭보다 규칙적 점검이 더 잘 맞습니다. 내성적이라도 실력은 충분하니 안정감을 유지해 주세요.",
      path:
        "고교선택: 일반고(뱀머리전략)/ 대학선택: SKY/ 학과선택: 경영, 경제, 행정/ 직업선택: 법조인, 교수, 고위공무원",
      danger:
        "조용히 혼자 해결하려다 어려움을 오래 끌 수 있습니다.",
      talk:
        "혼자서도 잘하지만, 힘든 구간은 같이 나누면 훨씬 편해질 수 있어.",
      color: "#0ea5e9",
    },
    meta: {
      label: "은둔형 모범생",
      tagline: "내성적이지만 자기주도와 계획성이 강한 유형",
      emoji: "🛡️",
      aura: "from-sky-500/25 via-cyan-400/10 to-blue-300/20",
    },
  },
  {
    key: "eCoS",
    aliases: ["eCos", "eCOS", "ECOf"],
    report: {
      title: "문과모범형B",
      subtitle: "7%~10% 미만",
      summary:
        "상위권 성적을 유지하면서도 대외 활동과 리더십 역량이 비교적 잘 살아 있는 문과 모범형입니다.",
      strategy:
        "내신 유지와 활동 경험을 균형 있게 설계하면 강점이 극대화됩니다.",
      parent:
        "학습 방식은 비교적 안정적이지만, 외부 활동과 교우관계가 학습 리듬을 흔들지 않도록 균형 점검이 필요합니다.",
      path:
        "고교선택: 자사고, 일반고/ 대학선택: SKY, 서성한/ 학과선택: 신문방송, 정치외교, 경영/ 직업선택: 교수, PD, 기자, 외교관, 정치인",
      danger:
        "분위기와 대외 활동 비중이 커지면 학습 루틴이 무너질 수 있습니다.",
      talk:
        "네 강점은 많지만, 결국 가장 중요한 건 네 페이스를 지키는 거야.",
      color: "#059669",
    },
    meta: {
      label: "리더형 모범생",
      tagline: "대외활동과 성실함이 함께 강한 문과형",
      emoji: "🌟",
      aura: "from-emerald-500/25 via-teal-400/10 to-green-300/20",
    },
  },
  {
    key: "PCMF",
    aliases: ["PCMf", "pCMF", "pCMf", "pCMs", "ECmF", "ECOF", "ECof", "eCOF", "eCOf", "eCoF", "eCof"],
    report: {
      title: "외향적 문과뺀질이형",
      subtitle: "20% 미만",
      summary:
        "특정 관심 있는 과목만 상위권을 유지하고 분위기와 친구관계 영향을 크게 받는 유형입니다.",
      strategy:
        "관심 과목의 결과물을 동력으로 삼되, 감독관 있는 통제적 환경과 절대 학습시간 확보가 필수입니다.",
      parent:
        "주변 친구와 분위기의 힘이 큰 만큼, 환경을 먼저 관리해 주는 것이 중요합니다.",
      path:
        "고교선택: 자사고, 외고, 국제고/ 대학선택: 중상위권대학/ 학과선택: 신문방송, 정치외교, 호텔경영/ 직업선택: PD, 정치인, 통역사",
      danger:
        "관계 형성 에너지가 큰 대신 자기통제가 약해져 공부보다 분위기에 에너지를 쏟을 수 있습니다.",
      talk:
        "사람과 분위기에서 강점이 크니까, 그 힘을 공부 결과로 연결하는 훈련을 해보자.",
      color: "#9333ea",
    },
    meta: {
      label: "무드 드라이버",
      tagline: "관계와 분위기의 영향을 크게 받는 외향형",
      emoji: "🎤",
      aura: "from-purple-500/25 via-pink-400/10 to-fuchsia-300/20",
    },
  },
  {
    key: "PCMs",
    aliases: ["PCmF", "PCmf", "pCmF", "pCmf", "PCoF", "PCof", "pCoF"],
    report: {
      title: "내향적 문과 뺀질이",
      subtitle: "20% 미만",
      summary:
        "관심 과목만 고득점하는 경향이 있고, 겉으로는 조용하지만 속내 파악이 어려운 유형입니다.",
      strategy:
        "통제적 환경, 절대 학습시간 확보, 관심 분야 결과물을 전체 성적 동력으로 연결하는 전략이 필요합니다.",
      parent:
        "겉으로 조용해 보여도 방심하면 안 됩니다. 조용히 흐트러질 수 있어 세심한 관찰이 중요합니다. (조용히 사고치는유형)",
      path:
        "고교선택: 외고, 국제고, 자사고/ 대학선택: 중상위권대학/ 학과선택: 자유전공, 철학, 애니메이션, 사학, 문헌정보/ 직업선택: 애니메이션작가, 방송작가, 도서관사서",
      danger:
        "많은 일을 시작해도 끝맺음이 약할 수 있고, 관심 밖 과목은 쉽게 손을 놓을 수 있습니다. 주의깊은 관찰 필요",
      talk:
        "공부머리는 있으니까, 이제 끝까지 완성하는 힘만 같이 만들자.",
      color: "#a21caf",
    },
    meta: {
      label: "조용한 몰입러",
      tagline: "겉은 조용하지만 관심 영역 편차가 큰 유형",
      emoji: "🌙",
      aura: "from-fuchsia-500/25 via-purple-400/10 to-violet-300/20",
    },
  },
  {
    key: "PCOS",
    aliases: ["PCOs", "PCoS", "PCos", "PCOF", "PCOf", "eCOs", "pCof", "pCOF", "pCOf", "pCOs", "pCos", "pCms", "PCMS", "PCmS", "PCms"],
    report: {
      title: "문과 잠재성장형",
      subtitle: "70% 내외",
      summary:
        "아직 특출한 과목이 선명하지 않지만, 발견 시점에 따라 가능성이 크게 열릴 수 있는 문과 대기만성형입니다.",
      strategy:
        "선행보다 내신 중심, 선택과 집중, 선호 과목부터 자신감을 붙이는 단계형 전략이 가장 잘 맞습니다.",
      parent:
        "막연한 기대보다 구체적이고 작은 목표가 중요합니다. 친구와 비교보다 자신감 회복에 초점을 맞춰주세요.",
      path:
        "고교선택: 일반고/ 대학선택: 중상위권대학/ 학과선택: 아동, 심리, 사범대, 사회복지/ 직업선택: 유치원교사, 교사, 상담교사, 사회복지사",
      danger:
        "구체적 목표 의식이 부족하면 쉽게 무기력해질 수 있고, 집중시간이 확보되지 않으면 성장이 더딜 수 있습니다.",
      talk:
        "지금 당장 모든 걸 잘할 필요는 없어. 한 단계씩 쌓이면 충분히 커질 수 있어.",
      color: "#ea580c",
    },
    meta: {
      label: "알수없는 성장형",
      tagline: "작은 성취를 쌓을수록 크게 커지는 대기만성형",
      emoji: "☀️",
      aura: "from-orange-500/25 via-yellow-400/10 to-amber-300/20",
    },
  },
  {
    key: "eCmF",
    aliases: ["eCmf", "eCMF", "eCMf"],
    report: {
      title: "문과 예체능 영재형",
      subtitle: "3% 미만",
      summary:
        "예체능 특정 과목에서 강점이 뚜렷하고 감성과 상상력이 풍부한 예체능 영재형입니다.",
      strategy:
        "적성을 빠르게 찾고 전공과 연결하며, 대회·수상·특기자 스펙을 조기에 설계하는 것이 매우 중요합니다.",
      parent:
        "자유로운 영혼처럼 보여도 방향만 잡히면 몰입이 강합니다. 재능을 빨리 발견해 진로와 연결해 주세요.",
      path:
        "고교선택: 예고, 일반고/ 대학선택: SKY, 한국예술종합학교, 한국체대/ 학과선택: 연기, 음악, 미술, 체육/ 직업선택: 예술가, 연출가, 운동선수",
      danger:
        "자유로운 영혼으로 한곳에 빠지면(관찰필요) 실기·특기 강점이 충분히 살지 못할 수 있습니다.",
      talk:
        "좋아하는 걸 힘 있게 밀어주되, 입시와 연결될 기본 루틴도 같이 잡아보자.",
      color: "#e11d48",
    },
    meta: {
      label: "타고난 감성러",
      tagline: "감성과 상상력이 풍부한 예체능 영재형",
      emoji: "🎭",
      aura: "from-rose-500/25 via-pink-400/10 to-red-300/20",
    },
  },
  {
    key: "ErMS",
    aliases: ["ErMs", "EcMS", "EcMs", "erMS", "ecMS", "ErMF", "ErMf", "ErmF", "Ermf", "EcMF", "EcMf", "EcmF", "Ecmf", "erMF", "erMf", "ecMF", "ecMf"],
    report: {
      title: "문·이과 혼합 영재형",
      subtitle: "4% 미만",
      summary:
        "문·이과 전 과목을 고르게 소화하며 상위권을 유지하는 융합형 영재입니다. 넓은 재능과 독특한 개성이 동시에 강합니다.",
      strategy:
        "전과목 균형 유지와 동시에 시작한 일을 성과물로 끝까지 연결하는 훈련이 중요합니다.",
      parent:
        "산만하고 엉뚱해 보이는 점도 강점의 일부일 수 있습니다. 개성을 억누르기보다 결과로 연결되게 돕는 것이 좋습니다.",
      path:
        "고교선택: 자사고, 일반고/ 대학선택: SKY, 메디칼/ 학과선택: 의대, 치대, 한의대, 산업경영, 건축, 행정, 통계, 자유전공/ 직업선택: 외교관, 의사, 건축가, 의학기자, 예술가",
      danger:
        "관심사가 넓어지고 분위기에 흔들리면 집중이 흩어질 수 있습니다.",
      talk:
        "재능이 넓은 만큼, 지금은 우선순위를 정해 끝까지 완성하는 힘을 키워보자.",
      color: "#0f766e",
    },
    meta: {
      label: "All-rounder",
      tagline: "문·이과를 넘나드는 극상위권 융합 영재형",
      emoji: "🧭",
      aura: "from-teal-500/25 via-sky-400/10 to-indigo-300/20",
    },
  },
  {
    key: "ErOS",
    aliases: ["ErOs", "EroS", "Eros", "EcOS", "EcOs", "EcoS", "Ecos", "erOS", "eroS", "ecOS", "ecoS", "ErmS", "Erms", "ermS", "erms", "EcmS", "Ecms", "ecmS", "ecms", "ErOf", "EcOf"],
    report: {
      title: "문·이과 혼합 모범형",
      subtitle: "10% 미만",
      summary:
        "문·이과를 모두 안정적으로 해내며 실리적으로 성과를 쌓는 균형형 상위권입니다.",
      strategy:
        "전과목 내신 균형, 비교과 관리, 시험불안 관리, 활동과 리더십의 균형이 핵심입니다.",
      parent:
        "적극적 성향이 있어 친구나 외부 활동으로 리듬이 깨지지 않도록만 잡아주면 안정적으로 성장합니다.",
      path:
        "고교선택: 자사고, 일반고/ 대학선택: SKY, 한의대/ 학과선택: 한의학, 사회과학, 경제, 자연과학, 통계/ 직업선택: 한의사, 고위공무원, 교사, 변호사",
      danger:
        "다 잘하려다 체력과 자신감이 먼저 무너질 수 있습니다.",
      talk:
        "균형감이 큰 강점이야. 꼭 필요한 것만 남기고 리듬을 지키면 훨씬 멀리 갈 수 있어.",
      color: "#0891b2",
    },
    meta: {
      label: "실리추구 甲",
      tagline: "실리와 균형을 겸비한 안정적 혼합형",
      emoji: "⚖️",
      aura: "from-sky-500/25 via-teal-400/10 to-cyan-300/20",
    },
  },
  {
    key: "PrmS",
    aliases: ["PcmS", "prMS", "prmS", "pcMS", "pcmS", "prOS", "pcOS", "proS", "pcoS"],
    report: {
      title: "문·이과 혼합 수동적모범형",
      subtitle: "10% 미만",
      summary:
        "성실성과 안정감으로 꾸준한 상위권을 유지하는 혼합형입니다.",
      strategy:
        "내신 균형 유지, 개념 정리, 시험불안 관리, 그리고 리더십과 대외활동 경험을 조금씩 확장하는 것이 좋습니다.",
      parent:
        "자기주장이 약할 수 있으니, 안정감을 유지하면서도 스스로 드러낼 기회를 만들어 주는 것이 중요합니다.",
      path:
        "고교선택: 일반고/ 대학선택: SKY, 상위권대학/ 학과선택: 경영, 경제, 통계, 간호, 교대/ 직업선택: 공무원, 교사, 간호사, 변리사, 작가",
      danger:
        "실력 대비 존재감이 약해 기회를 놓칠 수 있고, 시험불안이 쌓이면 스스로 위축될 수 있습니다.",
      talk:
        "조용히 강한 힘이 있으니까, 이제는 그 힘을 조금 더 드러내는 연습도 해보자.",
      color: "#0284c7",
    },
    meta: {
      label: "관리받는 성과형",
      tagline: "타의적 꾸준함으로 상위권을 유지하는 혼합형",
      emoji: "🏅",
      aura: "from-blue-500/25 via-cyan-400/10 to-slate-300/20",
    },
  },
  {
    key: "PrMF",
    aliases: [
      "PrMf", "PrmF", "Prmf", "prMF", "prMf", "prmF", "prmf",
      "PcMF", "PcMf", "PcmF", "Pcmf", "pcMF", "pcMf", "pcmF", "pcmf",
      "PrMs", "prMs", "PcMs", "pcMs", "proF", "pcoF",
      "erOF", "erOf", "eroF", "erof", "ecOF", "ecOf", "ecoF", "ecof",
      "EroF", "Erof", "EcoF", "Ecof", "ErOF", "EcOF",
      "ermF", "ermf", "ecmF", "ecmf", "erMs", "ecMs",
    ],
    report: {
      title: "문·이과 혼합 뺀질이형",
      subtitle: "20% 미만",
      summary:
        "관심 과목만 1등급 수준으로 유지하는 뺀질이형이지만, 재능은 넓고 아이디어가 살아 있는 학생입니다.",
      strategy:
        "통제적 환경, 균형 잡힌 학습 관리, 절대 학습시간 확보, 성적표 챙기기가 핵심입니다.",
      parent:
        "분위기에 휩쓸리기 쉬우므로 주변환경 관리가 매우 중요합니다. 학업성공 경험이 전체 성적에 시너지를 줍니다.",
      path:
        "고교선택: 자사고/ 대학선택: 중상위권대학/ 학과선택: 자유전공, 건축, 철학/ 직업선택: 건축가, PD, 프리랜서",
      danger:
        "많은 일을 시작하고 끝맺음이 약해질 수 있으며, 선호 과목 외 영역은 노력하지 않을 수 있습니다. (일명 머리만좋은 유형)",
      talk:
        "재능은 많으니까, 이제는 관심 있는 과목을 하나씩 늘려 전과목 성과로 연결해보자.",
      color: "#7c3aed",
    },
    meta: {
      label: "머리좋은 베짱이",
      tagline: "재능만 좋은 혼합형",
      emoji: "💡",
      aura: "from-violet-500/25 via-indigo-400/10 to-fuchsia-300/20",
    },
  },
  {
    key: "PrOF",
    aliases: [
      "PrOf", "ProF", "Prof", "PcOF", "PcOf", "PcoF", "Pcof",
      "PrOS", "PrOs", "ProS", "Pros", "prOs", "pros",
      "PcOS", "PcOs", "PcoS", "Pcos", "pcOs", "pcos",
      "prOF", "prOf", "pcOF", "pcOf", "prof", "pcof",
      "erOs", "eros", "ecOs", "ecos", "Prms", "Pcms", "PrMS", "PcMS", "prms", "pcms",
    ],
    report: {
      title: "문·이과 혼합 잠재성장형",
      subtitle: "70% 내외",
      summary:
        "아직 특별히 잘하거나 관심 있는 과목은 없지만, 발견 시점에 따라 큰성장이 기대되는 학생입니다.",
      strategy:
        "선행학습 보다 내신 중심, 선택과 집중, 선호 과목부터 성취 경험을 갖게하는 전략이 가장 효율적입니다.",
      parent:
        "결단력과 현실성이 약해 보여도 가능성이 없는 것은 아닙니다. 단계별 목표를 제시하는 것이 중요합니다.",
      path:
        "고교선택: 일반고/ 대학선택: 중상위권대학/ 학과선택: 사회복지, 사범대, 건축, 간호, 식품영양, 의상/ 직업선택: 사회복지사, 교사, 간호사, 요리사, 의류업",
      danger:
        "막연한 목표와 물리적 학습시간만 늘어나면 성과가 전혀 없을 수 있습니다. 짧은 시간이라도 집중하는 시간을 확보해주세요.",
      talk:
        "지금은 방향을 찾는 시기야. 한 가지씩 성공하는 경험이 쌓이면 생각보다 크게 달라질 수 있어.",
      color: "#ea580c",
    },
    meta: {
      label: "자아 탐험가",
      tagline: "발견 시점에 따라 가능성이 무한대",
      emoji: "🌈",
      aura: "from-orange-500/25 via-amber-400/10 to-rose-300/20",
    },
  },
  {
    key: "DEFAULT",
    aliases: [],
    report: {
      title: "학습성향 분석 결과",
      subtitle: "기본 리포트",
      summary:
        "현재 입력된 응답을 바탕으로 가장 가까운 학습 성향으로 분류한 결과입니다.",
      strategy:
        "기본 학습 루틴을 먼저 안정화하고 강점 과목 중심으로 성취 경험을 늘리는 것이 좋습니다.",
      parent:
        "현재 방식에 맞는 환경과 전략을 함께 찾는 접근이 효과적입니다.",
      path:
        "상세 결과 DB 확장에 따라 더 정밀한 추천으로 연결될 수 있습니다.",
      danger:
        "강점이 선명하지 않을수록 비교의 영향을 더 크게 받을 수 있습니다.",
      talk: "네 방식에 맞는 방법을 같이 찾아가자.",
      color: "#475569",
    },
    meta: {
      label: "성향 분석 캐릭터",
      tagline: "현재 응답을 바탕으로 가장 가까운 성향을 분석했어요.",
      emoji: "✨",
      aura: "from-slate-500/25 via-slate-300/10 to-sky-300/20",
    },
  },
];

const ANALYSIS_DB: Record<string, AnalysisBlock> = {
  ERMs: {
    traits: [
      "이과 과목에서 압도적 강점이 드러나요",
      "깊게 몰입하면 성취욕이 매우 커져요",
      "고난도 일수록 오히려 재미를 느끼기 쉬워요",
    ],
    futureTitle: "이공계 영재로 성장할 가능성이 매우 높아요",
    futureBody: [
      "영재고·과학고와 같은 이공계 트랙에서 강점이 극대화될 수 있어요.",
      "연구·개발·의학 분야처럼 깊은 사고력과 창의적 문제 해결이 필요한 영역에 적합한 인재입니다.",
    ],
    dangerPatterns: [
      "그들만의 리그 학습환경 조성이 중요",
      "또래와 온도 차이로 고립감 형성",
      "재능에 맞는 루틴 관리가 중요",
    ],
    actionText: "강점 과목은 심화학습 필수",
    chatScenario: [
      { type: "parent", text: "왜 쉬운 건 금방 질리고 어려운 걸 더 좋아할까?" },
      { type: "child", text: "쉬운 건 재미없고 어려운 게 더 생각할 게 많아서 좋아." },
      { type: "parent", text: "재능에 맞는 학원을 잘 찾아보자" },
      { type: "child", text: "응, 제대로 해볼 수 있는 환경이면 더 잘할 수 있어." },
    ],
  },
  ERMS: {
    traits: [
      "전 과목을 고르게 최상위 성적으로 끌고 가는 힘이 있어요",
      "계획성과 실천력이 짱입니다",
      "목표가 높아도 꾸준히 따라가는 힘이 좋아요",
    ],
    futureTitle: "안정적인 최상위권으로 성장할 가능성이 높아요",
    futureBody: [
      "전 과목 균형학습과 최상위권 관리 능력이 강해요.",
      "메디컬·최상위 공대·연구 트랙에서 꾸준한 경쟁력을 보일 수 있어요.",
    ],
    dangerPatterns: [
      "높은 기준 때문에 스트레스 누적",
      "완벽주의로 멘탈 피로 증가",
      "늘 잘해야 된다는 압박감",
    ],
    actionText: "실력만큼 체력과 멘탈 회복도 함께 관리하기",
    chatScenario: [
      { type: "parent", text: "지금도 충분히 잘하는데 너무 스스로를 몰아붙이지 않았으면 좋겠어." },
      { type: "child", text: "목표가 높아서 자꾸 더 잘 해야 될 것 같아." },
      { type: "parent", text: "실력은 충분하니 리듬과 멘탈을 같이 챙기자." },
      { type: "child", text: "응, 오래 가려면 그게 필요할 것 같아." },
    ],
  },
  eRMF: {
    traits: [
      "특정 과목에서 압도적인 성취를 보여요",
      "관심 분야에 꽂히면 타의 추종을 불허하는 집중력을 보여요",
      "호기심과 직관이 빠르게 연결되는 편이에요",
    ],
    futureTitle: "특정 강점을 중심으로 크게 올라갈 수 있는 영재형이에요",
    futureBody: [
      "수학·물리·전기전자처럼 한 분야를 깊게 파고드는 트랙에서 강점이 커져요.",
      "강한 호기심을 결과와 성과로 연결하면 폭발적으로 성장할 수 있어요.",
    ],
    dangerPatterns: [
      "많은 일을 벌이고 마무리가 약할 수 있음",
      "산만하다는 평가를 자주 받음",
      "관심이 넓어져 집중이 흩어질 수 있음",
    ],
    actionText: "시작한 일을 마무리 짓는 훈련 반복하기",
    chatScenario: [
      { type: "parent", text: "관심 가는 건 엄청 잘하는데 마무리가 조금 아쉬워." },
      { type: "child", text: "재밌는 건 계속 보는데 중간에 또 다른 게 궁금해져." },
      { type: "parent", text: "그 강점을 더 크게 키우되, 끝내는 힘도 키워보자." },
      { type: "child", text: "응, 그게 되면 진짜 더 잘 할 수 있을 것 같아." },
    ],
  },
  eROS: {
    traits: [
      "안정적인 내신과 시험 리듬을 유지할 수 있어요",
      "계획과 실천이 비교적 균형 있게 잡혀 있어요",
      "주변 분위기를 잘 활용하면 더 크게 성장해요",
    ],
    futureTitle: "안정적인 상위권 이공계 모범형으로 성장 가능성이 높아요",
    futureBody: [
      "일반고 상위권, 의치한·자연과학·공학 계열처럼 성실함이 필요한 진로에 유리해요.",
      "시험불안 관리만 잘되면 꾸준히 높은 목표까지 도달할 수 있는 힘이 있어요.",
    ],
    dangerPatterns: [
      "외부 활동이 많아지면 공부 리듬 흔들림",
      "시험불안이 성과를 가릴 수 있음",
      "분위기에 휩쓸리면 페이스 무너짐",
    ],
    actionText: "내신 루틴과 시험 리듬을 안정화 시켜 흔들리지 않는 패턴 만들기",
    chatScenario: [
      { type: "parent", text: "지금 리듬만 잘 유지하면 충분히 더 올라갈 수 있을 것 같아." },
      { type: "child", text: "응, 흐름만 안 깨지면 나도 꽤 안정적으로 할 수 있어." },
      { type: "parent", text: "그럼 친구나 활동 때문에 리듬만 안 무너지게 같이 관리하자." },
      { type: "child", text: "그게 되면 훨씬 편할 것 같아." },
    ],
  },
  eRmS: {
    traits: [
      "겉으로 조용해도 성실함과 인내심이 강해요",
      "꾸준히 쌓아가며 상위권을 지키는 힘이 있어요",
      "다만 지속적인 관리가 필요해요",
    ],
    futureTitle: "조용하지만 단단한 이공계 인재로 성장할 가능성이 높아요",
    futureBody: [
      "일반고 상위권 유지, 메디컬·자연과학·공학 계열처럼 끈기와 안정성이 중요한 진로에서 강점이 살아나요.",
      "꾸준함을 자신감으로 연결하면 생각보다 크게 성장할 수 있어요.",
    ],
    dangerPatterns: [
      "쉬운 문제 실수는 시험 폭망 각",
      "수동적이면 기회를 놓칠 수 있음",
      "존재감이 약해 보여 저평가될 수 있음",
    ],
    actionText: "안정감을 해치지 않는 선에서 발표·리더십·도전 경험 조금씩 쌓기",
    chatScenario: [
      { type: "parent", text: "차분하게 잘해오긴 했는데, 이제는 자신감도 조금 더 보였으면 좋겠어." },
      { type: "child", text: "앞에 나서는 건 조금 부담스럽지만, 할 일은 계속 해왔어." },
      { type: "parent", text: "힘들면 언제든 얘기해 도와줄게!" },
      { type: "child", text: "응, 고마워." },
    ],
  },
  PRMF: {
    traits: [
      "수학 또는 과학에서는 확실히 강해요",
      "관심이 생기면 빠르게 성과를 내는 편이에요",
      "틀에 갇힌 방식보다 자극 있는 방식에 더 잘 반응해요",
    ],
    futureTitle: "관리만 잘 붙으면 크게 치고 올라갈 수 있는 인재입니다.",
    futureBody: [
      "이공계·IT·연구·창업형 분야처럼 관심과 집중이 필요한 영역에서 잠재력이 있어요.",
      "좋아하는 과목의 성과를 전 과목으로 확장시키면 전교과 성적이 향상될 수 있어요.",
    ],
    dangerPatterns: [
      "좋아하는 과목만 파고들어 편파적 학습",
      "위기의식 부족으로 성실성 약화",
      "환경에 따라 성적 편차 큼",
    ],
    actionText: "절대 학습시간을 먼저 확보하고, 전 과목 관리 루틴을 강제하기",
    chatScenario: [
      { type: "parent", text: "좋아하는 건 진짜 잘하는데, 싫은 건 너무 안 보는 것 같아." },
      { type: "child", text: "관심 없는 건 손이 잘 안 가... 근데 좋아하면 진짜 오래 할 수 있어." },
      { type: "parent", text: "그 재능을 살리되, 골고루 균형 있게 공부하는 힘도 같이 만들자." },
      { type: "child", text: "응, 그게 되면 성적도 더 안정될 것 같아." },
    ],
  },
  EROF: {
    traits: [
      "수학 또는 과학에서 빠르게 오르는 힘이 있어요",
      "외부 분위기와 팀 에너지의 영향을 크게 받아요",
      "책임감 있는 역할이 주어지면 반응이 좋아질 수 있어요",
    ],
    futureTitle: "환경 관리가 잘 되면 성적이 급격히 올라가는 뺀질이 입니다",
    futureBody: [
      "건축·자유전공·자연과학·이공계 기획형 분야처럼 활동성과 아이디어를 함께 쓰는 진로에서 유리해요.",
      "좋은 분위기와 책임 있는 환경에서 성장 속도가 빨라질 수 있어요.",
    ],
    dangerPatterns: [
      "주변 분위기에 따라 성적 편차가 매우 큼",
      "시작은 많지만 끝맺음이 약함",
      "자기주도 학습 보다는 관리형 스카에 적합",
    ],
    actionText: "관리형 학습환경과 책임 있는 목표를 함께 주어 끝까지 완수하기",
    chatScenario: [
      { type: "parent", text: "환경만 잘 맞으면 훨씬 더 잘할 수 있을 것 같아." },
      { type: "child", text: "응, 분위기가 좋으면 훨씬 집중이 잘돼." },
      { type: "parent", text: "그럼 환경을 먼저 점검해서 끝까지 가보자." },
      { type: "child", text: "좋아. 더 해볼게" },
    ],
  },
  PROF: {
    traits: [
      "지금은 아직 강점이 선명하게 드러나지 않을 수 있어요",
      "한 과목에서 성취 경험이 더 중요해요",
      "대기만성형 이지만 한번 성적이 잡히면 안정적으로 올라갈 수 있어요",
    ],
    futureTitle: "대기만성형 성장 인재로서 발견 시점에 따라 크게 달라질 수 있어요",
    futureBody: [
      "간호·사범대·자연과학·공무원·보건 계열처럼 성실성이 필요한 길에서 안정적인 가능성이 있어요.",
      "한 과목의 작은 성공이 자신감과 학습 태도를 바꿔줄 수 있어요.",
    ],
    dangerPatterns: [
      "막연한 목표만 세우면 쉽게 지침",
      "물리적 시간만 늘고 집중이 안 되면 비효율 증가",
      "선행학습 보다는 현행학습 권장",
    ],
    actionText: "한 과목 한 단계씩 확실히 끝내며 작은 성공 경험 먼저 쌓기",
    chatScenario: [
      { type: "parent", text: "한 번에 다 잘하려고 하기보다, 하나씩 성공하는 게 더 중요할 것 같아." },
      { type: "child", text: "응, 뭘 먼저 해야 할지 모르겠어." },
      { type: "parent", text: "그럼 이번엔 00과목만 확실히 끝내보자." },
      { type: "child", text: "그 정도면 해볼 수 있을 것 같아." },
    ],
  },
  ECMF: {
    traits: [
      "문과적 창의성과 표현력이 매우 강해요",
      "관심 분야에서는 절대적 몰입이 가능한 편이에요",
      "보편적 방식보다 자기만의 방식에서 강점이 더 살아나요",
    ],
    futureTitle: "창의성과 표현력을 중심으로 크게 성장할 수 있는 문과 성향 이과 최상위형이에요",
    futureBody: [
      "어문·신문방송·광고·콘텐츠·연극영화·기획 분야처럼 창의성과 감각이 중요한 분야에서 큰 강점이 드러나요.",
      "남다른 해석과 표현이 뛰어나요.",
    ],
    dangerPatterns: [
      "똘끼가 많다는 평가",
      "일반적 틀에 지나치게 맞추면 강점 소멸",
      "독특함이 실행으로 이어지지 않으면 잠재력 묻힘",
    ],
    actionText: "생각에만 그치지 말고 글·발표·기획안 같은 결과물로 자주 꺼내기",
    chatScenario: [
      { type: "parent", text: "남다른 생각을 할 때가 많아서 오히려 더 눈에 띄는 것 같아." },
      { type: "child", text: "내 생각은 좀 다른 편이긴 한데, 그게 재밌어." },
      { type: "parent", text: "그 독특함은 강점이야. 이제 그걸 결과물로 연결해보자." },
      { type: "child", text: "응, 보여줄 수 있게 만들면 더 좋을 것 같아." },
    ],
  },
  ECMS: {
    traits: [
      "전교과 고르게 최상위 성적을 유지할 수 있는 문과형이에요",
      "자기관리와 계획 실천이 매우 강해요",
      "믿고 맡겨도 크게 흔들리지 않는 타입이에요",
    ],
    futureTitle: "문과 최상위 안정형으로 크게 성장할 가능성이 높아요",
    futureBody: [
      "외고·자사고·SKY·법·행정·경영·외교 계열에서 매우 강해요.",
      "꾸준한 최상위 성과를 바탕으로 장기 레이스에 경쟁력이 높아요.",
    ],
    dangerPatterns: [
      "완성도 뒤에 부담감 누적",
      "항상 잘해야 한다는 압박감",
      "체력과 멘탈 관리가 뒤로 밀릴 수 있음",
    ],
    actionText: "실력은 충분하니 체력과 멘탈까지 함께 관리하기",
    chatScenario: [
      { type: "parent", text: "지금도 충분히 잘하고 있어서 오히려 과하게 공부 할 필요는 없을 것 같아." },
      { type: "child", text: "응, 그냥 내 방식대로 가면 꽤 잘 되는 편이야." },
      { type: "parent", text: "좋아. 그 대신 체력과 멘탈은 같이 챙기자." },
      { type: "child", text: "그건 확실히 필요할 것 같아." },
    ],
  },
  ECMs: {
    traits: [
      "언어·외국어 감각이 특히 뛰어난 편이에요",
      "생각의 깊이와 통찰력이 좋아요",
      "표현력은 좋지만 실천 습관은 따로 관리가 필요해요",
    ],
    futureTitle: "언어와 해석력이 강한 문과 영재형이에요",
    futureBody: [
      "어문계열·정치외교·신문방송·법조·외교처럼 언어와 사고의 깊이가 필요한 진로에서 매우 유리해요.",
      "생각을 행동과 결과로 실천할수록 잠재력이 크게 드러나요.",
    ],
    dangerPatterns: [
      "생각보다 실천이 늦을 수 있음",
      "잠재력에 비해 성과가 덜 드러날 수 있음",
      "계획이 행동으로 이어지지 않으면 답답함 증가",
    ],
    actionText: "언어 강점을 바탕으로 발표·토론·글쓰기 결과물 꾸준히 남기기",
    chatScenario: [
      { type: "parent", text: "생각은 깊고 말도 잘하는데, 실천이 조금 아쉬울 때가 있어." },
      { type: "child", text: "머릿속으론 정리가 되는데 바로 행동으로 옮기는 건 좀 늦어." },
      { type: "parent", text: "좋아. 그 힘을 실천으로 연결하는 연습만 더 해보자." },
      { type: "child", text: "응, 그러면 훨씬 더 잘할 수 있을 것 같아." },
    ],
  },
  pCMS: {
    traits: [
      "겉으로 조용하지만 사고력과 언어 재능이 깊어요",
      "속으로 오래 생각하고 정리하는 힘이 있어요",
      "안정적인 환경에서 강점이 더 돋보여요",
    ],
    futureTitle: "조용하지만 깊게 성장하는 문과 영재로 발전할 가능성이 커요",
    futureBody: [
      "어문·정치외교·신문방송·교수·언론 분야처럼 깊은 사고와 언어 감각이 중요한 진로에 잘 맞아요.",
      "표현의 깊이가 깊어질수록 강점이 훨씬 더 선명해질 수 있어요.",
    ],
    dangerPatterns: [
      "실행보다 사고에 머물러 결과가 지연",
      "겉으로 약해 보여 오판할 수 있음",
      "자기관리 루틴이 흐트러지면 강점이 잘 안 드러남",
    ],
    actionText: "생각을 바깥으로 꺼내는 발표·글쓰기·토론 경험을 조금씩 쌓기",
    chatScenario: [
      { type: "parent", text: "조용해 보여도 속으로는 진짜 많이 생각하는 것 같아." },
      { type: "child", text: "응, 멍하게 있는것 같아도 머릿속에선 계속 정리하고 있어." },
      { type: "parent", text: "그 깊은 생각은 강점이야. 이제 표현 기회를 조금씩 늘려보자." },
      { type: "child", text: "천천히라면 해볼 수 있을 것 같아." },
    ],
  },
  ECOS: {
    traits: [
      "문과 내신을 고르고 안정적으로 유지할 수 있어요",
      "자기주도 학습과 계획·실천을 잘해요",
      "리듬을 타면 흔들림 없이 가는 편이에요",
    ],
    futureTitle: "흔들림 없이 꾸준하게 성장하는 문과 최상위 모범형이에요",
    futureBody: [
      "경영·경제·행정·법조·회계 분야에서 유리해요.",
      "꾸준한 집중력을 필요로하는 진로와 잘 맞아요.",
    ],
    dangerPatterns: [
      "도움 요청 시점이 늦어질 수 있음",
      "작은 실수가 멘탈을 흔들 수 있음",
      "혼자 버티다 피로가 누적될 수 있음",
    ],
    actionText: "규칙적 멘토링과 시험불안 관리 루틴을 함께 점검",
    chatScenario: [
      { type: "parent", text: "혼자 버티는 힘이 크지만, 막히는 건 조금 빨리 말해줬으면 좋겠어." },
      { type: "child", text: "혼자 해보려는 편이긴 한데, 오래 막히면 힘들긴 해." },
      { type: "parent", text: "그럴 땐 같이 정리하면 더 빨리 올라갈 수 있어." },
      { type: "child", text: "응, 그건 맞아." },
    ],
  },
  pCOS: {
    traits: [
      "조용하지만 안정적이고 자기주도적인 편이에요",
      "계획과 실천이 비교적 잘 맞물려 있어요",
      "무리하지 않고 차분히 쌓는 방식이 잘 맞아요",
    ],
    futureTitle: "내성적이지만 안정적으로 상위권을 유지하는 문과 실속형이에요",
    futureBody: [
      "경영·경제·행정·법조 등 상위권 문과 진로에 적합해요.",
      "자기 페이스를 유지할수록 실력이 더 강해질 수 있어요.",
    ],
    dangerPatterns: [
      "어려움을 혼자 끙끙 앓을 수 있음",
      "감정 표현이 적어 도움 요청 시점 지연",
      "실력 대비 존재감이 약해 보일 수 있음",
    ],
    actionText: "규칙적 점검은 하되, 과한 간섭보다 신뢰감을 주기",
    chatScenario: [
      { type: "parent", text: "혼자서도 잘하지만 힘든 구간은 조금 더 빨리 말해줘도 괜찮아." },
      { type: "child", text: "혼자 해결해보려는 편이라 바로 말하진 못할 때가 있어." },
      { type: "parent", text: "그래도 같이 나누면 훨씬 편해질 수 있어." },
      { type: "child", text: "응, 그건 알겠어." },
    ],
  },
  eCoS: {
    traits: [
      "성적과 대외 활동을 함께 가져갈 수 있는 편이에요",
      "리더십과 사회성이 발달해 있어요",
      "교과와 비교과 균형을 잘 잡으면 상위권 유지가 가능해요",
    ],
    futureTitle: "활동성과 성실함을 함께 살리는 리더형 인재예요",
    futureBody: [
      "신문방송·정치외교·경영·외교관·PD처럼 사람과 활동, 성과를 함께 요구하는 진로에 적합해요.",
      "학업 리듬만 깨지지 않으면 활동 경험이 오히려 큰 자산이 될 수 있어요.",
    ],
    dangerPatterns: [
      "대외 활동이 커지면 학습 루틴 붕괴",
      "친구관계에 공부가 밀릴 수 있음",
      "분위기에 따라 페이스 흔들림",
    ],
    actionText: "활동은 살리되 내신 관리가 최우선",
    chatScenario: [
      { type: "parent", text: "네 강점은 많은데, 결국 제일 중요한 건 네 페이스를 지키는 거야." },
      { type: "child", text: "맞아. 이것저것 하다 보면 공부 리듬이 흐트러질 때가 있어." },
      { type: "parent", text: "활동은 살리고, 내신은 더 단단히 잡아보자." },
      { type: "child", text: "응, 그러면 더 잘할 수 있을 것 같아." },
    ],
  },
  PCMF: {
    traits: [
      "분위기와 교우관계의 영향을 크게 받는 편이에요",
      "관심 있는 과목만 성적관리가 될 수 있어요",
      "친구관계 속에서 에너지를 얻는 유형이에요",
    ],
    futureTitle: "관계와 환경을 잘 활용하면 크게 성장할 수 있는 외향형 인재예요",
    futureBody: [
      "신문방송·정치외교·호텔경영·통역 등 사람과 소통하는 분야에서 강점이 살아날 수 있어요.",
      "좋은 분위기를 공부와 목표성적으로 연결하는 훈련이 핵심이에요.",
    ],
    dangerPatterns: [
      "공부보다 주변 분위기에 에너지 사용",
      "자기 통제가 약해질 수 있음",
      "교우관계 스트레스가 성적에 즉시 반영",
    ],
    actionText: "친구·주변환경 영향은 줄이고, 관리형 학습환경에서 절대 학습시간 먼저 확보하기",
    chatScenario: [
      { type: "parent", text: "너는 사람과 환경의 영향이 큰 것 같아." },
      { type: "child", text: "응, 분위기 좋으면 훨씬 더 열심히 하게 돼." },
      { type: "parent", text: "그 힘을 목표성적으로 연결하는 훈련을 해보자." },
      { type: "child", text: "좋아. 그건 해볼 수 있을 것 같아." },
    ],
  },
  PCMs: {
    traits: [
      "겉은 조용하지만 관심 분야에선 돋보여요",
      "속내를 잘 드러내지 않아 파악이 어려울 수 있어요",
      "조용히 사고칠 수 있어 세심한 관찰이 필요해요",
    ],
    futureTitle: "존재감이 없어보이지만 자기 재능을 살리면 크게 성장할 수 있어요",
    futureBody: [
      "자유전공·철학·애니메이션·사학·문헌정보처럼 자기만의 관심과 집중력이 필요한 분야에 잘 맞아요.",
      "관심 과목의 성적을 전체 성적으로 넓힐 수 있으면 잠재력이 크게 살아나요.",
    ],
    dangerPatterns: [
      "많은 일을 시작하나 끝맺음이 약함",
      "관심 밖 과목은 조용히 손을 놓을 수 있음",
      "겉으로 문제없어 보여도 속으로 공부를 포기할 수 있음",
    ],
    actionText: "관심 과목의 성적을 전체 성적으로 넓혀가는 경험 꼭 만들기",
    chatScenario: [
      { type: "parent", text: "겉으로는 조용한데, 가끔은 조용히 사고치는 느낌이 있어." },
      { type: "child", text: "티는 안 나도 하기 싫은 건 진짜 손이 안 가..." },
      { type: "parent", text: "공부머리는 있으니까, 이제 끝까지 완성하는 경험을 만들자." },
      { type: "child", text: "응, 그건 필요할 것 같아." },
    ],
  },
  PCOS: {
    traits: [
      "아직 강점이 드러나지 않아도 성장 가능성은 있어요",
      "작은 성취가 쌓일수록 자신감이 크게 살아날 수 있어요",
      "남들과 비교보다 자기 속도에 맞는 전략이 중요해요",
    ],
    futureTitle: "문과 대기만성형으로서 작은 성취가 큰 성장으로 이어질 수 있어요",
    futureBody: [
      "아동·심리·사범·사회복지 등 배려와 나눔이 필요한 분야에서 가능성을 키워갈 수 있어요.",
      "비교보다 자기 속도에 맞는 전략을 쓸수록(slow & study) 더 성장할 수 있어요.",
    ],
    dangerPatterns: [
      "구체적 목표가 없으면 무기력해질 수 있음",
      "공부 양 보다는 집중할 수 있는 시간이 중요",
      "비교가 반복될수록 자신감 하락",
    ],
    actionText: "작고 구체적인 목표를 세우고, 선호 과목부터 성취 경험 만들기",
    chatScenario: [
      { type: "parent", text: "지금 당장 모든 걸 잘할 필요는 없어." },
      { type: "child", text: "응, 아직 뭘 잘하는지 잘 모르겠을 때가 있어." },
      { type: "parent", text: "한 과목씩 쌓으면 충분히 달라질 수 있어." },
      { type: "child", text: "그렇게 해보면 덜 막막할 것 같아." },
    ],
  },
  eCmF: {
    traits: [
      "감성과 상상력이 풍부한 유형이에요",
      "특정 실기·예체능 영역에서 강점이 있어요",
      "자유로운 에너지가 방향만 잡히면 큰 성과로 이어져요",
    ],
    futureTitle: "감성과 재능에 맞는 전공을 찾으면 크게 성장할 수 있는 영재",
    futureBody: [
      "예고·예술대·체대·연기·음악·미술·체육처럼 적성과 재능을 빠르게 전공으로 연결하는 길에서 강해요.",
      "좋아하는 것을 진로와 연결하는 속도가 빠를수록 잠재력이 더 잘 살아나요.",
    ],
    dangerPatterns: [
      "방향 없이 자유로우면 계속 사춘기",
      "실기 강점이 입시 제도와 맞지 않으면 아쉬움 발생",
      "좋아하는 것에만 빠져 편협함",
    ],
    actionText: "적성을 빨리 찾아 실기·대회·포트폴리오와 연결하기",
    chatScenario: [
      { type: "parent", text: "좋아하는 걸 만났을 때 몰입이 확 살아나는 것 같아." },
      { type: "child", text: "응, 재미있으면 진짜 오래할 수 있어." },
      { type: "parent", text: "그 재능을 입시와 연결해보자." },
      { type: "child", text: "좋아. 그러면 더 제대로 해볼 수 있을 것 같아." },
    ],
  },
  ErMS: {
    traits: [
      "문·이과를 고루 소화하는 능력이 있어요",
      "재능의 폭이 넓고 개성이 강한 편이에요",
      "국어·수학에 모두 강해요",
    ],
    futureTitle: "문·이과를 넘나드는 융합형 인재로 크게 성장할 수 있어요",
    futureBody: [
      "의학·건축·통계·행정·자유전공처럼 문·이과에 모두 강점이 있어요.",
      "재능을 우선순위와 연결하면 훨씬 좋은 결과를 만들 수 있어요.",
    ],
    dangerPatterns: [
      "관심사가 많아 집중이 흩어질 수 있음",
      "산만해 보일 수 있음",
      "마무리하는 습관이 꼭 필요함",
    ],
    actionText: "넓은 재능을 한 번에 다 쓰려 하지 말고 우선순위를 정해 끝까지 완성하기",
    chatScenario: [
      { type: "parent", text: "너는 문과, 이과에 다 강점이 있는것 같아." },
      { type: "child", text: "응, 둘 다 좋아." },
      { type: "parent", text: "이제 우선순위를 정해 끝까지 가보자." },
      { type: "child", text: "좋아. 이과를 우선으로 할게" },
    ],
  },
  ErOS: {
    traits: [
      "문·이과 모두 성적이 우수해요",
      "효과적인 학습 계획에 강점이 있어요",
      "교과외 활동과 공부의 균형 감각이 좋은 편이에요",
    ],
    futureTitle: "실리와 균형을 추구하는 상위권이에요",
    futureBody: [
      "한의학·사회과학·경제·통계 분야에 잘 맞아요.",
      "다양한 교과를 조화롭게 학습할수록 강점이 더 커질 수 있어요.",
    ],
    dangerPatterns: [
      "다 잘하려다 체력이 먼저 무너질 수 있음",
      "자신감이 흔들리면 전체 리듬도 같이 무너짐",
      "활동이 많아질수록 우선순위가 무너질 수 있음",
    ],
    actionText: "정말 필요한 것만 남기고, 흔들리지 않게 관리하기",
    chatScenario: [
      { type: "parent", text: "네 강점은 균형감이야. 다만 모두 잘하려고 하지 않았으면 좋겠어." },
      { type: "child", text: "이것저것 다 해내고 싶어서 더 욕심이 나는 것 같아." },
      { type: "parent", text: "좋아. 대신 서두르지 말고 페이스를 유지하자." },
      { type: "child", text: "응, 그게 더 오래 갈 수 있을 것 같아." },
    ],
  },
  PrmS: {
    traits: [
      "성실성과 안정감으로 상위권을 유지하는 유형이에요",
      "관리하면 1%, 관리못하면 11%",
      "조용하지만 꾸준한 관리가 필요해요",
    ],
    futureTitle: "조용하지만 꾸준히 성적을 유지하는 상위권 인재예요",
    futureBody: [
      "경영·경제·통계·간호·교대처럼 안정성과 책임감을 요구하는 진로가 적합해요.",
      "리더십을 기르면 더 크게 성장할 수 있어요.",
    ],
    dangerPatterns: [
      "실력 대비 존재감이 약해 기회를 놓칠 수 있음",
      "시험불안이 쌓이면 스스로 위축될 수 있음",
      "자기주장이 약해 방향이 다른 친구 의견에 끌려갈 수 있음",
    ],
    actionText: "안정감을 해치지 않는 선에서 발표·대외활동·리더십 경험 조금씩 쌓기",
    chatScenario: [
      { type: "parent", text: "조용히 꾸준히 잘하고 있지만, 네 강점이 더 드러났으면 좋겠어." },
      { type: "child", text: "앞에 나서는 건 부담스럽지만, 하라고 하면 하긴 해." },
      { type: "parent", text: "수업시간에 자주 발표하고 질문도 해보자." },
      { type: "child", text: "조금씩이라면 가능할 것 같아." },
    ],
  },
  PrMF: {
    traits: [
      "재능과 아이디어가 많은 편이에요",
      "관심 과목에서는 1등급 수준의 학업능력이 있어요",
      "머리는 좋지만 성실함이 부족할 수 있어요",
    ],
    futureTitle: "재능과 아이디어를 잘 묶으면 크게 치고 올라갈 수 있는 유형이에요",
    futureBody: [
      "자유전공·건축·철학·기획형 진로처럼 폭넓은 아이디어가 필요한 분야에서 강점이 있어요.",
      "좋아하는 과목을 전 과목 성적으로 연결하면 크게 성장할 수 있어요.",
    ],
    dangerPatterns: [
      "많은 일을 시작하고 끝맺음이 약할 수 있음",
      "관심 없는 과목은 아예 노력하지 않음",
      "분위기에 휩쓸리면 전체 성적이 흔들릴 수 있음",
    ],
    actionText: "관리형 환경과 주기적 성적표 점검으로 전 과목을 강제로 관리하기",
    chatScenario: [
      { type: "parent", text: "재능은 진짜 많아 보이는데, 성실함이 많이 아쉬워." },
      { type: "child", text: "관심 있는 건 진짜 잘할 수 있는데 아닌 건 잘 안 하게 돼." },
      { type: "parent", text: "그러면 한학기에 한과목씩 늘려서 전 과목 성적으로 연결해보자." },
      { type: "child", text: "응, 그렇게 하면 좀 더 현실적일 것 같아." },
    ],
  },
  PrOF: {
    traits: [
      "아직은 방향을 찾는 과정이에요",
      "작은 성공 경험이 생기면 생각보다 크게 변할 수 있어요",
      "발견 시점에 따라 성장 폭이 큰 편이에요",
    ],
    futureTitle: "방향을 찾는 순간 크게 달라질 수 있는 대기만성형 학생입니다",
    futureBody: [
      "사회복지·사범·건축·간호·식품영양·의상처럼 나눔, 배려, 봉사정신이 필요한 분야에 적합해요.",
      "짧게라도 집중하는 연습을 늘려가면 성적 변화의 속도가 훨씬 빨라질 수 있어요.",
    ],
    dangerPatterns: [
      "막연한 목표만 세우면 성과가 없음",
      "학습시간만 길고 집중력이 없으면 비효율적",
      "방향이 없는 상태가 오래가면 자신감 하락",
    ],
    actionText: "짧아도 집중하는 시간을 확보하고, 한 가지씩 성공 경험 쌓기",
    chatScenario: [
      { type: "parent", text: "지금은 방향을 찾는 시기라고 생각해도 괜찮아." },
      { type: "child", text: "응, 아직은 내가 뭘 잘할지 찾는 중이야." },
      { type: "parent", text: "그럼 네가 제일 좋아하는 과목부터 해보자." },
      { type: "child", text: "그렇게 하면 좀 더 해볼 만할 것 같아." },
    ],
  },
  DEFAULT: {
    traits: [
      "상황에 따라 유연하게 적응해요",
      "균형 잡힌 스타일을 가지고 있어요",
      "안정적으로 실력을 쌓아갈 가능성이 커요",
    ],
    futureTitle: "균형형 인재로 다양한 진로 선택지 속에서 안정적으로 성장할 수 있어요",
    futureBody: [
      "현재 입력된 응답을 바탕으로 가장 가까운 방향으로 분석한 기본 리포트예요.",
      "강점 과목을 중심으로 성취 경험을 늘리면 더 선명한 방향이 보일 수 있어요.",
    ],
    dangerPatterns: [
      "목표 없이 흐름만 유지할 수 있음",
      "학습 리듬이 느슨해질 수 있음",
      "작은 실수에 자신감이 흔들릴 수 있음",
    ],
    actionText: "하루 학습 루틴을 일정하게 유지하는 것부터 시작하기",
    chatScenario: [
      { type: "parent", text: "지금은 어떤 방식이 잘 맞는지 찾는 중인 것 같아." },
      { type: "child", text: "응, 나한테 맞는 방법을 찾는 중이야." },
      { type: "parent", text: "하나씩 맞는 방법을 찾으면 훨씬 좋아질 수 있어." },
      { type: "child", text: "맞아. 그러면 더 잘할 수 있을 것 같아." },
    ],
  },
};

function findProfileByKey(inputKey?: string) {
  const normalized = normalizeKey(inputKey);

  if (!normalized) {
    return RESULT_PROFILE_DB.find((item) => item.key === "DEFAULT")!;
  }

  const exact = RESULT_PROFILE_DB.find((item) => normalizeKey(item.key) === normalized);
  if (exact) return exact;

  const alias = RESULT_PROFILE_DB.find((item) =>
    item.aliases.some((aliasKey) => normalizeKey(aliasKey) === normalized)
  );
  if (alias) return alias;

  return RESULT_PROFILE_DB.find((item) => item.key === "DEFAULT")!;
}

function getAnalysisByKey(inputKey?: string): AnalysisBlock {
  const profile = findProfileByKey(inputKey);
  return ANALYSIS_DB[profile.key] || ANALYSIS_DB.DEFAULT;
}

function parsePathInfo(path: string) {
  const getValue = (label: string) => {
    const match = path.match(new RegExp(`${label}:\\s*([^/]+)`));
    return match?.[1]?.trim() || "-";
  };

  return [
    { icon: "🏫", label: "고교선택", value: getValue("고교선택") },
    { icon: "🎓", label: "대학선택", value: getValue("대학선택") },
    { icon: "📚", label: "학과선택", value: getValue("학과선택") },
    { icon: "💼", label: "직업선택", value: getValue("직업선택") },
  ];
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
  futureTitle,
  futureBody,
  actionText,
  characterBadge,
}: {
  report: Report;
  resultCode: string;
  student: StudentInfo;
  percentile: string;
  traits: string[];
  dangerPatterns: string[];
  futureTitle: string;
  futureBody: string[];
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
      .replace(/\"/g, "&quot;");

  const traitItems = traits.map((item) => `<div class=\"chip\">${safe(item)}</div>`).join("");
  const dangerItems = dangerPatterns
    .map((item) => `<div class=\"danger-item\">${safe(item)}</div>`)
    .join("");
  const futureItems = futureBody
    .map((item) => `<div class=\"future-item\">${safe(item)}</div>`)
    .join("");

  return `
<!doctype html>
<html lang=\"ko\">
<head>
  <meta charset=\"utf-8\" />
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
    .future-list { display: grid; gap: 8px; margin-top: 10px; }
    .future-item {
      border-radius: 16px; padding: 10px 12px; background: #eff6ff; border: 1px solid #bfdbfe;
      font-size: 12px; font-weight: 800; color: #1d4ed8;
    }
    .action-box {
      margin-top: 12px; border-radius: 18px; padding: 14px; background: #fff8d9;
      border: 1px solid #f3e28d; font-size: 14px; font-weight: 900; color: #111827; line-height: 1.8;
    }
  </style>
</head>
<body>
  <div class=\"page\">
    <section class=\"hero\">
      <div class=\"hero-sub\">${safe(report.subtitle)}</div>
      <div class=\"char-row\">
        <div class=\"char-badge\">${safe(characterBadge.emoji)} ${safe(characterBadge.nickname)}</div>
        <div class=\"char-badge\">우리 아이 결과 캐릭터</div>
      </div>
      <div class=\"hero-title\">${safe(report.title)}</div>
      <div class=\"hero-tagline\">${safe(characterBadge.tagline)}</div>
      <div class=\"hero-summary\">${safe(report.summary)}</div>
      <div class=\"badge-row\">
        <div class=\"badge\">상위 ${safe(percentile)}</div>
        <div class=\"badge\">결과코드 ${safe(resultCode)}</div>
        <div class=\"badge\">학생 ${safe(student.name)}</div>
        <div class=\"badge\">학교 ${safe(student.school)}</div>
      </div>
    </section>

    <div class=\"grid\">
      <div>
        <section class=\"card\">
          <h2 class=\"section-title\">학생 기본 정보</h2>
          <div class=\"info-grid\">
            <div class=\"info-item\"><div class=\"info-label\">이름</div><div class=\"info-value\">${safe(student.name)}</div></div>
            <div class=\"info-item\"><div class=\"info-label\">학년</div><div class=\"info-value\">${safe(student.grade)}</div></div>
            <div class=\"info-item\"><div class=\"info-label\">학교</div><div class=\"info-value\">${safe(student.school)}</div></div>
            <div class=\"info-item\"><div class=\"info-label\">전화번호</div><div class=\"info-value\">${safe(student.phone)}</div></div>
          </div>
        </section>

        <section class=\"card tint\" style=\"margin-top:16px;\">
          <h2 class=\"section-title\">이 아이 실제 모습</h2>
          <div class=\"chip-wrap\">${traitItems}</div>
        </section>

        <section class=\"card danger\" style=\"margin-top:16px;\">
          <h2 class=\"section-title\">주의 패턴</h2>
          <div class=\"danger-list\">${dangerItems}</div>
        </section>
      </div>

      <div>
        <section class=\"card\">
          <h2 class=\"section-title\">핵심 특징</h2>
          <div class=\"body-copy\">${safe(report.summary)}</div>
        </section>

        <section class=\"card tint\" style=\"margin-top:16px;\">
          <h2 class=\"section-title\">보호자 가이드</h2>
          <div class=\"body-copy\">${safe(report.parent)}</div>
        </section>

        <section class=\"card\" style=\"margin-top:16px;\">
          <h2 class=\"section-title\">추천 학습 전략</h2>
          <div class=\"body-copy\">${safe(report.strategy)}</div>
        </section>

        <section class=\"card tint\" style=\"margin-top:16px;\">
          <h2 class=\"section-title\">미래 성장 시나리오</h2>
          <div class=\"body-copy\">${safe(futureTitle)}</div>
          <div class=\"future-list\">${futureItems}</div>
        </section>

        <section class=\"card\" style=\"margin-top:16px;\">
          <h2 class=\"section-title\">지금 당장 해야 할 1가지</h2>
          <div class=\"action-box\">${safe(actionText)}</div>
        </section>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

function Badge({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-[#E9D57E] bg-[#FFF4BF] px-3 py-1.5 text-[12px] font-black text-[#7A5A00] ${className}`}
    >
      {children}
    </span>
  );
}

function SectionCard({
  title,
  icon,
  children,
  className = "",
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[24px] border bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] ${className}`}
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-xl">
          {icon}
        </div>
        <h3 className="text-[18px] font-black tracking-[-0.03em] text-slate-900">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function TraitPill({ text }: { text: string }) {
  return (
    <div className="rounded-[14px] border border-[#E9E2FF] bg-[#F7F4FF] px-4 py-3 text-[15px] font-bold text-slate-700">
      {text}
    </div>
  );
}

function DangerPill({ text }: { text: string }) {
  return (
    <div className="rounded-[14px] border border-[#FFD6DE] bg-[#FFF5F7] px-4 py-3 text-[15px] font-bold text-slate-700">
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
      <div
        className={[
          "max-w-[86%] rounded-[22px] px-4 py-3 text-[15px] font-bold leading-7",
          isParent ? "bg-[#FFF3A6] text-slate-900" : "bg-slate-900 text-white",
        ].join(" ")}
      >
        {children}
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

   const profile = findProfileByKey(resolved.key);

  return {
    version: 1,
    submittedAt: "",
    student,
    result: {
      key: resolved.key || profile.key,
      code: resolved.code,
      fullCode: resolved.fullCode,
      diffText: resolved.diffText,
      title: report.title || profile.report.title,
      subtitle: report.subtitle || profile.report.subtitle,
      summary: report.summary || profile.report.summary,
      strategy: report.strategy || profile.report.strategy,
      parent: report.parent || profile.report.parent,
      path: report.path || profile.report.path,
      danger: report.danger || profile.report.danger,
      talk: report.talk || profile.report.talk,
      color: report.color || profile.report.color,
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

  const resolvedKey = finalPayload.result.key || resolved?.key || "DEFAULT";
  const matchedProfile = useMemo(() => findProfileByKey(resolvedKey), [resolvedKey]);
  const analysis = useMemo(() => getAnalysisByKey(resolvedKey), [resolvedKey]);

  const finalStudent = finalPayload.student;

  const finalResolved: ResolvedResult = {
    key: matchedProfile.key,
    code: finalPayload.result.code || matchedProfile.key,
    diffText: finalPayload.result.diffText || "결과 분석 완료",
    fullCode: finalPayload.result.fullCode || matchedProfile.key,
  };

  const finalReport: Report = {
    title: finalPayload.result.title || matchedProfile.report.title,
    subtitle: finalPayload.result.subtitle || matchedProfile.report.subtitle,
    summary: finalPayload.result.summary || matchedProfile.report.summary,
    strategy: finalPayload.result.strategy || matchedProfile.report.strategy,
    parent: finalPayload.result.parent || matchedProfile.report.parent,
    path: finalPayload.result.path || matchedProfile.report.path,
    danger: finalPayload.result.danger || matchedProfile.report.danger,
    talk: finalPayload.result.talk || matchedProfile.report.talk,
    color: finalPayload.result.color || matchedProfile.report.color,
  };

  const pathInfo = useMemo(
  () => parsePathInfo(finalReport.path),
  [finalReport.path]
);

  const percentile = useMemo(
    () => getPercentileFromSubtitle(finalReport.subtitle),
    [finalReport.subtitle]
  );

  const characterBadge = useMemo(() => {
    if (meta) {
      return {
        emoji: meta.emoji,
        nickname: meta.label,
        tagline: meta.tagline,
      };
    }

    return {
      emoji: matchedProfile.meta.emoji,
      nickname: matchedProfile.meta.label,
      tagline: matchedProfile.meta.tagline,
    };
  }, [meta, matchedProfile.meta]);

  const handleShare = async () => {
    const url =
      shareUrl ||
      (typeof window !== "undefined"
        ? window.location.href
        : "https://study-type-test-app-zbmw.vercel.app");

    await shareNative(finalReport.title, url);
  };

const handlePrint = () => {
  window.print();
};

 return (
  <div id="result-print-area" className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Badge>분석 완료 💛</Badge>
          <div className="text-[15px] font-bold text-slate-600">학습성향 결과 리포트</div>
        </div>

        <div className="rounded-full border border-[#E9DFC0] bg-[#FFF9EC] px-5 py-2">
          <span className="mr-2 text-[13px] font-black text-[#A47A22]">결과 코드</span>
          <span className="text-[18px] font-black tracking-[-0.03em] text-slate-950">
            {finalResolved.code}
          </span>
        </div>
      </div>

      <section className="rounded-[30px] border border-[#EBD89A] bg-[#FFFDF6] px-5 py-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:px-7">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <div className="flex flex-col items-center text-center">
            <div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_30%,#FFE8C2,transparent_35%),radial-gradient(circle_at_70%_35%,#D9ECFF,transparent_35%),#F7F8FC] text-[74px] shadow-inner">
              {characterBadge.emoji}
            </div>

            <div className="mt-4 rounded-full bg-[#EAF2FF] px-4 py-2 text-[15px] font-black text-[#2563EB]">
              {characterBadge.nickname}
            </div>

            <p className="mt-3 break-keep text-[16px] font-bold leading-7 text-slate-700">
              {characterBadge.tagline}
            </p>
          </div>

          <div className="min-w-0">
            <h1 className="break-keep text-[34px] font-black tracking-[-0.05em] text-[#09133F] sm:text-[52px]">
              {finalReport.title}
            </h1>

            <p className="mt-2 text-[22px] font-black text-[#F59E0B]">{finalReport.subtitle}</p>

            <div className="mt-5 space-y-2 text-[17px] leading-8 text-slate-700">
              <p>{finalReport.summary}</p>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Badge>🏆 상위 {percentile}</Badge>
              <Badge>🏷️ {finalResolved.code}</Badge>
              <Badge>⭐ {finalResolved.diffText}</Badge>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <SectionCard title="이 아이 실제 모습 😮" icon="🟣" className="border-[#E9E2FF] bg-[#FCFBFF]">
          <div className="grid gap-3">
            {analysis.traits.map((trait) => (
              <TraitPill key={trait} text={trait} />
            ))}
          </div>
        </SectionCard>

        <div className="grid gap-4">
          <SectionCard title="추천 학습 전략" icon="📘" className="border-slate-200">
            <p className="text-[16px] font-semibold leading-8 text-slate-700">{finalReport.strategy}</p>
          </SectionCard>

          <SectionCard title="보호자 가이드" icon="👥" className="border-slate-200">
            <p className="text-[16px] font-semibold leading-8 text-slate-700">{finalReport.parent}</p>
          </SectionCard>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <SectionCard title="주의 패턴 ⚠️" icon="🚨" className="border-[#FFD9DF] bg-[#FFFDFD]">
          <div className="grid gap-3">
            {analysis.dangerPatterns.map((item) => (
              <DangerPill key={item} text={item} />
            ))}
          </div>
        </SectionCard>

        <div className="grid gap-4">
          <SectionCard title="이대로 가면 위험" icon="💡" className="border-slate-200">
            <p className="text-[16px] font-semibold leading-8 text-slate-700">{finalReport.danger}</p>
          </SectionCard>

          <SectionCard title="아이에게 이렇게 말해보세요" icon="💚" className="border-slate-200">
            <p className="text-[18px] font-black leading-8 text-slate-800">“{finalReport.talk}”</p>
          </SectionCard>

          <SectionCard title="지금 당장 해야 할 1가지" icon="🚀" className="border-slate-200">
            <div className="rounded-[20px] bg-[#FFF4C8] px-4 py-4 text-[18px] font-black leading-8 text-slate-900">
              {analysis.actionText}
            </div>
          </SectionCard>
        </div>
      </div>

      <SectionCard
        title="미래 성장 시나리오"
        icon="📊"
        className="mt-5 border-[#CFE0FF] bg-[#F6FAFF]"
      >
        <div className="rounded-[24px] border border-[#D8E6FF] bg-[#EEF5FF] p-5 sm:p-6 no-break">
          <div className="grid gap-5 lg:grid-cols-[220px_1fr] lg:items-center">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_30%,#CDE7FF,transparent_30%),radial-gradient(circle_at_70%_70%,#8CC5FF,transparent_35%),#D9EDFF] text-[56px] shadow-inner">
                🌍
              </div>
              <div className="mt-4 rounded-full bg-[#DCEBFF] px-4 py-2 text-[15px] font-black text-[#2563EB]">
                통합적 성장형
              </div>
            </div>

            <div>
              <h3 className="break-keep text-[26px] font-black leading-[1.35] tracking-[-0.04em] text-[#1F2A7A] sm:text-[34px]">
                {analysis.futureTitle}
              </h3>

              <div className="mt-5 space-y-3">
                {analysis.futureBody.map((line) => (
                  <p key={line} className="text-[17px] leading-8 text-slate-700">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-[24px] border border-[#E7D7A1] bg-white p-5 sm:p-6 no-break">
          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF3D1] text-lg">
              🧭
            </div>
            <div>
              <h4 className="text-[24px] font-black tracking-[-0.03em] text-slate-950 sm:text-[28px]">
                추천 진로 방향
              </h4>
              <p className="mt-1 text-[16px] font-semibold leading-7 text-slate-600">
                당신의 강점과 성향을 바탕으로 잘 맞는 진로 분야예요.
              </p>
            </div>
          </div>

<div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
  {pathInfo.map((item) => (
    <div
      key={item.label}
      className="rounded-[20px] border border-[#E9DFC0] bg-[#FFFDF6] px-5 py-5 text-center shadow-[0_6px_18px_rgba(0,0,0,0.04)]"
    >
      <div className="text-[28px]">{item.icon}</div>

      <div className="mt-3 text-[13px] font-black tracking-wide text-[#B7791F]">
        {item.label}
      </div>

      <div className="mt-2 break-keep text-[15px] font-bold leading-6 text-slate-800">
        {item.value}
      </div>
    </div>
  ))}
</div>

          <div className="mt-6 rounded-[18px] border border-slate-100 bg-[#FAFBFD] px-5 py-4">
            <div className="text-[16px] font-black text-slate-900">추천 진로 방향 상세</div>
            <p className="mt-2 text-[16px] font-semibold leading-8 text-slate-700">{finalReport.path}</p>
          </div>
        </div>
      </SectionCard>

      <div className="mt-5">
        <SectionCard title="실제 대화 느낌" icon="💬" className="border-slate-200">
          <div className="flex flex-col gap-3">
            {analysis.chatScenario.map((item, index) => (
              <ChatBubble key={`${item.type}-${index}`} type={item.type}>
                {item.text}
              </ChatBubble>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <button
          onClick={handleShare}
          className="h-16 rounded-[20px] bg-[#F6D85F] text-[22px] font-black tracking-[-0.03em] text-slate-950 shadow-[0_10px_20px_rgba(246,216,95,0.28)] transition hover:-translate-y-0.5"
        >
          ⤴ 결과 공유하기
        </button>

        <button
          onClick={handlePrint}
          className="h-16 rounded-[20px] border border-slate-200 bg-white text-[22px] font-black tracking-[-0.03em] text-slate-900 transition hover:bg-slate-50"
        >
          🖨 결과 출력하기
        </button>

        <button
          onClick={onRestart ?? (() => {})}
          className="h-16 rounded-[20px] bg-[#02124D] text-[22px] font-black tracking-[-0.03em] text-white shadow-[0_10px_20px_rgba(2,18,77,0.18)] transition hover:-translate-y-0.5"
        >
          ↻ {restartLabel}
        </button>
      </div>
    </div>
  );
}