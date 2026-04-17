"use client";

import ResultScreen from "@/components/shared-result-screen";
import { useEffect, useMemo, useState, type ReactNode } from "react";

type Step = "landing" | "form" | "test" | "loading" | "result";

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
  student: {
    name: string;
    grade: string;
    school: string;
    phone: string;
  };
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

function buildResultPayload(params: {
  student: StudentInfo;
  resolved: ResolvedResult;
  report: Report;
  scores: Record<string, number>;
  totalAnswered: number;
  totalQuestions: number;
}): ResultPayload {
  const { student, resolved, report, scores, totalAnswered, totalQuestions } = params;

  const social = Math.abs((scores.E ?? 0) - (scores.P ?? 0));
  const judgment = Math.abs((scores.R ?? 0) - (scores.C ?? 0));
  const track = Math.abs((scores.M ?? 0) - (scores.O ?? 0));
  const style = Math.abs((scores.S ?? 0) - (scores.F ?? 0));

  return {
    version: 1,
    submittedAt: new Date().toISOString(),
    student: {
      name: student.name ?? "",
      grade: student.grade ?? "",
      school: student.school ?? "",
      phone: student.phone ?? "",
    },
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
    scores: {
      E: Number(scores.E ?? 0),
      P: Number(scores.P ?? 0),
      R: Number(scores.R ?? 0),
      C: Number(scores.C ?? 0),
      M: Number(scores.M ?? 0),
      O: Number(scores.O ?? 0),
      S: Number(scores.S ?? 0),
      F: Number(scores.F ?? 0),
    },
    diffs: {
      social,
      judgment,
      track,
      style,
    },
    meta: {
      totalAnswered,
      totalQuestions,
    },
  };
}

const QUESTIONS: string[] = [
  "정해진 규칙을 잘 지킨다는 소리를 듣는다",
  "시험 보기 일주일 전부터는 봉사활동 등 학교의 다른 활동에 참여하지 않는다",
  "모둠 과제 발표는 주로 내가 하며 적극적으로 내 의견을 주장한다",
  "내 재능을 발전시킬 수 있는 책을 읽고 그 내용을 실천해 보았다",
  "영화 내용을 이야기할 때 생각나는 장면과 등장 인물에 대해 먼저 말한다",
  "일을 할 때, 사람들이 많이 사용하는 방법보다 내 방식대로 하는 경우가 많다",
  "시험 준비를 하거나 숙제를 제출해야 할 때, 바로 전날이 되어야 준비가 잘 된다",
  "개성이 강하고 좀 독특한 부분이 있어서 보통 사람들과 많이 다르다는 이야기를 자주 듣는다",
  "다른 사람에 비해 친구를 쉽게 사귀고 친구가 많다",
  "암기 과목을 좋아하며 성적도 좋다",
  "추리하거나 생각한 것을 상황에 맞게 차근차근 잘 설명한다는 말을 듣는 것이 좋다",
  "어떤 일이 벌어졌을 때 내 느낌대로 바로 결정하고 실행해도 결과가 좋다",
  "집중력이 강하다",
  "어떤 일이든 실수하는 것이 싫어서 시간이 많이 걸려도 천천히 한다",
  "단어를 이용하는 게임을 잘한다",
  "그냥 무조건 외우는 것보다 그렇게 된 이유를 아는 것이 더 재미있다",
  "나의 감정을 글로 쓸 때 보통 짧은 문장으로 정확하게 표현한다",
  "평소 어떤 일을 할 때 계획을 세우고 차례차례 실천한다",
  "어떤 의견의 옳고 그름을 판단할 때, 그와 비슷한 예나 전문적인 자료를 보고 결정한다",
  "영화 내용을 말할 때 등장 인물보다 주로 벌어진 사건에 대해 이야기한다",
  "글을 쓸 때 여러 번 고쳐 가며 써서 시간이 오래 걸린다",
  "노력한 것보다 결과가 좋지 않을 때가 자주 있다",
  "미리 계획을 세우고 공부와 과제를 한다",
  "감정보다 규칙에 따라 일을 처리하는 것을 중요하게 생각한다",
  "숫자와 관계가 있는 게임을 잘한다",
  "다른 사람을 설득할 때 보통 그 사람을 감동시키는 방법을 사용한다",
  "일의 결과도 중요하지만 결과만큼 일을 하는 과정도 중요하다고 생각한다",
  "중요한 의견을 나눌 때는 결론이 날 때까지 내가 회장이 된 것처럼 대화를 진행한다",
  "시험을 보는 등 다른 사람에게 평가를 받는 것은 언제나 마음이 편하지 않다",
  "다른 사람의 감정과 기분을 잘 이해한다",
  "규칙에 따라 일을 하는 것이 훨씬 좋은 결과를 얻을 수 있다고 생각한다",
  "일을 할 때 망설이지 않고 확실하게 결정하고 빠르게 진행한다",
  "어떤 것을 결정할 때 내 생각보다 다른 사람들의 의견을 듣고 받아들일 때가 많다",
  "내 감정을 한 단어로 분명하게 말하지 않고 비슷하게 표현하는 것이 더 좋다고 생각한다",
  "옳고 그름을 판단할 때 그 일이나 행동이 발생하게 된 원인을 중요하게 생각한다",
  "정해진 규칙대로 하지 않고 자유로운 분위기에서 생각하고 일을 하는 것이 훨씬 잘 된다",
  "새로운 메뉴가 있으면 먼저 먹어 본다",
  "사고하는 방식이 매우 새롭고 창의적이고 독특하다는 얘기를 듣는다",
  "일을 할 때 꼭 정해진 시간 안에 해야 한다는 생각을 하지 않는다",
  "다른 사람들의 입장에서 생각하고 판단하는 것을 정말 잘한다",
  "설명을 듣는 것보다 문장을 읽고 이해하는 것이 더 쉽다",
  "시험 기간이라도 하고 싶은 것이 있으면 이것저것 할 수 있다",
  "중요한 결정을 할 때는 다른 사람의 생각보다 내 생각과 뜻에 따른다",
  "시작한 일은 꼭 끝까지 하고 다른 일을 시작하려고 한다",
  "결과가 마음에 안 들어도 그동안의 노력과 시간이 아까워서 포기하지 못한다",
  "다른 사람을 설득할 때 전문가의 의견이나 사람들에게 인정 받은 자료를 사용한다",
  "다른 사람들이 보았을 때 어지럽고 지저분한 내 책상도 사실은 내 방식대로 정리되어 있는 것이다",
  "글을 쓸 때 그때그때 떠오르는 생각과 느낌을 바로 쓰고, 다시 고쳐 쓰는 일은 별로 없다",
  "마음먹고 일을 하면 결과가 늘 만족스럽다",
  "내 기분과 생각에 따라 대화 중간에 대화 내용이 바뀌기도 한다",
  "내 생각과 다르더라도 여러 사람들의 의견이 같으면 그 의견에 따른다",
  "시험 시작 바로 전에 공부해도 가끔씩 성적이 좋다",
  "사람마다 성격, 취향 등 개성이 다른 것을 인정한다",
  "결과가 마음에 안 들면 처음부터 다시 시작한다",
  "도표나 간단한 공식 등을 이용하여 설명해 주면 이해하기가 쉽다",
  "사람을 만날 때 첫인상과 느낌이 중요하다",
  "내 의견과 다르면 많은 사람들이 찬성하는 의견이라도 받아들이기가 싫다",
  "여행할 때는 미리 철저하게 준비하고 계획을 세워서 여행 도중에 실수하는 일이 없도록 한다",
  "수업 중 모르는 것은 보통 적극적으로 질문한다",
  "시간을 허비하지 않고 계획을 세워서 잘 사용한다",
  "질문하는 것이 쑥스러워서 모르는 것이 있어도 혼자 해결하려고 한다",
  "정해진 규칙대로 하지 않고 자유롭게 하라고 하면 오히려 어렵다",
  "책상 정리가 잘 되어 있을 때 공부가 잘 된다고 생각한다",
  "내 판단과 결정은 대부분 옳다고 생각한다",
  "오래 집중하는 것을 잘 못한다",
  "나에 대한 이야기 중에서 성실하다는 말을 가장 많이 듣는다",
  "일을 할 때 과정보다 결과에 더 신경을 쓴다",
  "차근차근 일을 하지 않고 한꺼번에 몰아서 하면 결과가 안 좋을 때가 많다",
  "많은 사람들이 옳다고 생각하는 정정당당한 평가를 좋아한다",
  "자주 먹어서 잘 알고 있는 음식이 좋다",
  "나보다 잘난 사람을 보면 그 사람을 닮고 싶어서 노력하게 된다",
  "칭찬은 나를 더욱 힘이 나게 하는 가장 큰 선물이다",
  "시작한 일을 끝내지 못하고 새로운 일을 시작하는 경우가 많다",
  "발표보다는 자료를 찾고 모아서 발표 자료를 만드는 일에 관심이 많다",
  "새로운 친구를 사귀는 데 시간이 좀 오래 걸린다",
  "한 일에 대해 다른 사람들의 칭찬을 받는 것도 좋지만 내가 만족스러운 것이 더 좋다",
  "내가 바르고 정직하며 인성교육이 잘 되어 있다는 평가를 받는 것이 좋다",
  "판단하고 결정할 때 항상 다른 사람들의 의견을 따른다",
  "계획대로 여행하지 않고 그때 기분과 상황에 따라 여행 계획을 바꾸기도 한다",
  "사람마다 성격과 취향이 다르기 마련이므로 다른 사람들의 방법을 따라하고 싶지는 않다",
];

const SCORE_MAP: Record<string, number>[] = [
  { O: 1 }, { O: 5 }, { E: 5 }, { S: 3 }, { C: 5 }, { M: 5 }, { F: 5 }, { F: 5 }, { E: 3 }, { C: 5 },
  { S: 3 }, { F: 5 }, { E: 5 }, { P: 5 }, { C: 5 }, { R: 5 }, { R: 3 }, { S: 5 }, { R: 3 }, { R: 1 },
  { O: 5 }, { O: 5 }, { S: 5 }, { R: 5 }, { R: 5 }, { C: 5 }, { C: 1 }, { M: 5 }, { P: 5 }, { C: 3 },
  { O: 5 }, { E: 5 }, { O: 3 }, { C: 5 }, { C: 3 }, { M: 3 }, { M: 1 }, { M: 5 }, { P: 3 }, { R: 5 },
  { C: 5 }, { M: 5 }, { M: 5 }, { S: 5 }, { P: 3 }, { R: 5 }, { M: 5 }, { M: 3 }, { M: 3 }, { O: 3 },
  { O: 5 }, { F: 5 }, { F: 1 }, { E: 3 }, { R: 5 }, { C: 3 }, { M: 5 }, { O: 5 }, { E: 5 }, { E: 3 },
  { P: 5 }, { O: 5 }, { O: 3 }, { E: 5 }, { P: 5 }, { S: 5 }, { R: 3 }, { S: 5 }, { E: 3 }, { O: 3 },
  { S: 3 }, { S: 3 }, { F: 5 }, { P: 3 }, { P: 3 }, { F: 5 }, { F: 3 }, { P: 5 }, { M: 3 }, { F: 3 },
];

function makeScores(answers: number[]) {
  const total: Record<string, number> = {
    E: 0,
    P: 0,
    R: 0,
    C: 0,
    M: 0,
    O: 0,
    S: 0,
    F: 0,
  };

  answers.forEach((answer, idx) => {
    if (answer !== 1) return;

    const map = SCORE_MAP[idx] || {};

    Object.entries(map).forEach(([key, value]) => {
      total[key] += Number(value);
    });
  });

  return total;
}

const CHOICES = [
  { label: "그렇다", value: 1 },
  { label: "아니다", value: 0 },
];

const RESULT_DEFINITIONS: Array<{
  key: string;
  aliases: string[];
  report: Report;
  meta: CharacterMeta;
}> = [
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
      talk:
        "네가 원하는 방향으로 가되, 큰 목표는 같이 설계해보자.",
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
      talk:
        "강점을 더 강하게, 끝까지 완성하는 힘도 같이 만들어보자.",
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
        "적극적인 성향 때문에 외부 활동으로 공부 리듬이 흔들릴 수 있고, 시험불안 관리가 필요합니다.(주기적인 희망고문 필요)",
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
      strategy:
        "관심 과목 선행 및 심화학습 필요.",
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
      talk:
        "지금도 충분히 잘하고 있어!!",
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
      talk:
        "네 방식에 맞는 방법을 같이 찾아가자.",
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

const RESULT_DB: Record<string, Report> = Object.fromEntries(
  RESULT_DEFINITIONS.map((item) => [item.key, item.report])
);

const CHARACTER_META: Record<string, CharacterMeta> = Object.fromEntries(
  RESULT_DEFINITIONS.map((item) => [item.key, item.meta])
);

function getCharacterBadge(key: string) {
  const meta = CHARACTER_META[key];

  if (meta) {
    return {
      emoji: meta.emoji,
      nickname: meta.label,
    };
  }

  return {
    emoji: "✨",
    nickname: "성향 분석 캐릭터",
  };
}

const RESULT_ALIAS_MAP: Record<string, string> = RESULT_DEFINITIONS.reduce(
  (acc, item) => {
    acc[item.key] = item.key;
    item.aliases.forEach((alias) => {
      acc[alias] = item.key;
    });
    return acc;
  },
  {} as Record<string, string>
);

function buildDisplayCode(scores: Record<string, number>) {
  const socialDiff = Math.abs((scores.E ?? 0) - (scores.P ?? 0));
  const judgmentDiff = Math.abs((scores.R ?? 0) - (scores.C ?? 0));
  const trackDiff = Math.abs((scores.M ?? 0) - (scores.O ?? 0));
  const styleDiff = Math.abs((scores.S ?? 0) - (scores.F ?? 0));

  const socialLetter = (scores.E ?? 0) >= (scores.P ?? 0) ? "E" : "P";
  const judgmentLetter = (scores.R ?? 0) >= (scores.C ?? 0) ? "R" : "C";
  const trackLetter = (scores.M ?? 0) >= (scores.O ?? 0) ? "M" : "O";
  const styleLetter = (scores.S ?? 0) >= (scores.F ?? 0) ? "S" : "F";

  const formatLetter = (letter: string, diff: number) =>
    diff <= 2 ? letter.toLowerCase() : letter.toUpperCase();

  const code =
    formatLetter(socialLetter, socialDiff) +
    formatLetter(judgmentLetter, judgmentDiff) +
    formatLetter(trackLetter, trackDiff) +
    formatLetter(styleLetter, styleDiff);

  const diffText = `${socialDiff} / ${judgmentDiff} / ${trackDiff} / ${styleDiff}`;

  return {
    code,
    diffText,
    full: `${code} ( ${diffText} )`,
  };
}

function normalizeResultCode(code: string) {
  const clean = code.replace(/[^A-Za-z]/g, "");
  if (!clean) return "DEFAULT";
  return RESULT_ALIAS_MAP[clean] || "DEFAULT";
}

function resolveResult(scores: Record<string, number>): ResolvedResult {
  const display = buildDisplayCode(scores);
  const mappedKey = normalizeResultCode(display.code);

  return {
    key: mappedKey,
    code: display.code,
    diffText: display.diffText,
    fullCode: display.full,
  };
}

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  const full = normalized.length === 3 ? normalized.split("").map((c) => c + c).join("") : normalized;
  const num = parseInt(full, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function toFiveScalePair(left: number, right: number) {
  const total = left + right;
  if (total === 0) return { leftValue: 2.5, rightValue: 2.5 };
  const leftValue = (left / total) * 5;
  const rightValue = (right / total) * 5;
  return {
    leftValue: Number(leftValue.toFixed(1)),
    rightValue: Number(rightValue.toFixed(1)),
  };
}

async function saveSubmissionToApi(params: {
  student: StudentInfo;
  answers: number[];
  resultKey: string;
  resultCode: string;
  reportTitle: string;
  scores: Record<string, number>;
}) {
  const res = await fetch("/api/submissions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || "결과 저장에 실패했습니다.");
  }

  return res.json().catch(() => ({ ok: true }));
}

function printReport(html: string) {
  const win = window.open("", "_blank", "width=960,height=1200");
  if (!win) return;
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 250);
}

function generateAxisNarratives(scores: Record<string, number>) {
  const social =
    scores.E >= scores.P
      ? "외향성이 더 강해 사람과의 상호작용, 발표, 협업 환경에서 에너지가 살아날 가능성이 큽니다."
      : "내향성이 더 강해 혼자 집중하는 시간, 조용한 환경, 자기 속도에 맞춘 학습에서 안정적으로 실력을 발휘할 가능성이 큽니다.";

  const judgment =
    scores.R >= scores.C
      ? "논리 성향이 더 강해 근거와 원리, 명확한 기준이 있는 설명에서 이해가 빠른 편입니다."
      : "창의 성향이 더 강해 다양한 관점, 확장 해석, 자유로운 아이디어 연결에서 강점이 나타날 가능성이 큽니다.";

  const track =
    scores.M >= scores.O
      ? "모범 성향이 더 강해 계획표, 체크리스트, 정해진 흐름 안에서 꾸준히 성과를 쌓는 방식이 잘 맞습니다."
      : "자율 성향이 더 강해 스스로 선택권이 있을 때 몰입도가 올라가며, 통제보다 자율성이 성과에 더 긍정적으로 작용할 수 있습니다.";

  const style =
    scores.S >= scores.F
      ? "안정 성향이 더 강해 예측 가능한 일정과 익숙한 루틴 속에서 실수 없이 실력을 쌓아가는 방식이 효과적입니다."
      : "도전 성향이 더 강해 새로운 과제, 변화 있는 환경, 목표가 분명한 경쟁 상황에서 동기와 집중력이 살아날 가능성이 큽니다.";

  return [
    { title: "외향·내향 해석", body: social },
    { title: "논리·창의 해석", body: judgment },
    { title: "모범·자율 해석", body: track },
    { title: "안정·도전 해석", body: style },
  ];
}

function generatePrintableReport({
  report,
  resultCode,
  student,
  axes,
  axisNarratives,
}: {
  report: Report;
  resultCode: string;
  student: StudentInfo;
  axes: Array<{
    name: string;
    left: string;
    right: string;
    leftValue: number;
    rightValue: number;
  }>;
  axisNarratives: Array<{
    title: string;
    body: string;
  }>;
}) {
  const safe = (value?: string) =>
    (value || "-")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const axisCards = axes
    .map((axis) => {
      const leftWidth = `${Math.max(8, axis.leftValue * 20)}%`;
      const rightWidth = `${Math.max(8, axis.rightValue * 20)}%`;

      return `
        <div class="axis-card">
          <div class="axis-head">
            <span>${safe(axis.left)}</span>
            <span class="axis-name">${safe(axis.name)}</span>
            <span>${safe(axis.right)}</span>
          </div>

          <div class="axis-track">
            <div class="axis-left" style="width:${leftWidth}"></div>
            <div class="axis-right" style="width:${rightWidth}"></div>
          </div>

          <div class="axis-score-row">
            <span>${axis.leftValue} / 5</span>
            <span>${axis.rightValue} / 5</span>
          </div>
        </div>
      `;
    })
    .join("");

  const narrativeCards = axisNarratives
    .map(
      (item) => `
        <div class="mini-card">
          <div class="mini-title">${safe(item.title)}</div>
          <div class="mini-body">${safe(item.body)}</div>
        </div>
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
      color: #0f172a;
      background: #ffffff;
    }

    body {
      line-height: 1.65;
      font-size: 12.5px;
    }

    .page {
      width: 100%;
    }

    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
    }

    .logo-box {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 170px;
      height: 54px;
      border-radius: 16px;
      border: 1.5px dashed #cbd5e1;
      background: #f8fafc;
      color: #64748b;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.04em;
    }

    .doc-mark {
      font-size: 11px;
      color: #64748b;
      font-weight: 800;
      letter-spacing: 0.16em;
    }

    .hero {
      position: relative;
      overflow: hidden;
      border-radius: 24px;
      padding: 28px;
      color: white;
      background: linear-gradient(135deg, ${report.color} 0%, #0f172a 100%);
    }

    .hero-sub {
      font-size: 11px;
      letter-spacing: 0.18em;
      opacity: 0.85;
      font-weight: 800;
    }

    .hero-title {
      margin-top: 10px;
      font-size: 30px;
      line-height: 1.2;
      font-weight: 900;
      letter-spacing: -0.03em;
    }

    .hero-summary {
      margin-top: 14px;
      max-width: 92%;
      font-size: 14px;
      line-height: 1.8;
      opacity: 0.96;
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
      font-weight: 800;
      background: rgba(255,255,255,0.16);
      border: 1px solid rgba(255,255,255,0.22);
    }

    .grid {
      display: grid;
      grid-template-columns: 1.08fr 0.92fr;
      gap: 16px;
      margin-top: 18px;
    }

    .card {
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      padding: 18px;
      background: #ffffff;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .soft-card {
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      padding: 18px;
      background: #f8fafc;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .warm-card {
      border: 1px solid #fde68a;
      border-radius: 20px;
      padding: 18px;
      background: #fffbeb;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .green-card {
      border: 1px solid #a7f3d0;
      border-radius: 20px;
      padding: 18px;
      background: #ecfdf5;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .danger-card {
      border: 1px solid #fecdd3;
      border-radius: 20px;
      padding: 18px;
      background: #fff1f2;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .section-title {
      font-size: 18px;
      font-weight: 900;
      letter-spacing: -0.02em;
      margin: 0 0 10px 0;
    }

    .section-desc {
      margin: 0 0 14px 0;
      color: #64748b;
      font-size: 12px;
      line-height: 1.7;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .info-item {
      border-radius: 16px;
      padding: 12px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
    }

    .info-label {
      font-size: 10px;
      font-weight: 900;
      letter-spacing: 0.16em;
      color: #94a3b8;
      text-transform: uppercase;
    }

    .info-value {
      margin-top: 6px;
      font-size: 12px;
      line-height: 1.8;
      color: #334155;
      white-space: pre-wrap;
    }

    .axis-list {
      display: grid;
      gap: 12px;
    }

    .axis-card {
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 14px;
      background: #f8fafc;
    }

    .axis-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      font-size: 11px;
      font-weight: 800;
      color: #334155;
      margin-bottom: 10px;
    }

    .axis-name {
      color: #94a3b8;
      font-weight: 900;
    }

    .axis-track {
      position: relative;
      height: 12px;
      border-radius: 999px;
      background: #e2e8f0;
      overflow: hidden;
      display: flex;
    }

    .axis-left {
      height: 100%;
      background: linear-gradient(90deg, #0f172a, ${report.color});
      border-radius: 999px 0 0 999px;
    }

    .axis-right {
      height: 100%;
      background: linear-gradient(90deg, ${report.color}, #0f172a);
      border-radius: 0 999px 999px 0;
      margin-left: auto;
    }

    .axis-score-row {
      margin-top: 8px;
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      font-weight: 800;
      color: #64748b;
    }

    .mini-list {
      display: grid;
      gap: 10px;
    }

    .mini-card {
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      background: #ffffff;
      padding: 12px;
    }

    .mini-title {
      font-size: 11px;
      font-weight: 900;
      color: #0f172a;
      margin-bottom: 4px;
    }

    .mini-body {
      font-size: 12px;
      line-height: 1.75;
      color: #475569;
      white-space: pre-wrap;
    }

    .body-copy {
      font-size: 12.5px;
      line-height: 1.9;
      color: #334155;
      white-space: pre-wrap;
    }

    .comment-card {
      margin-top: 18px;
      border: 1.5px solid #cbd5e1;
      border-radius: 20px;
      background: #ffffff;
      padding: 18px;
    }

    .comment-box {
      margin-top: 10px;
      min-height: 120px;
      border: 1.5px dashed #cbd5e1;
      border-radius: 16px;
      background: #f8fafc;
      padding: 14px;
    }

    .comment-lines {
      margin-top: 8px;
    }

    .comment-line {
      height: 22px;
      border-bottom: 1px dashed #cbd5e1;
    }

    .signature-wrap {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      margin-top: 18px;
    }

    .signature-box {
      border: 1.5px solid #e2e8f0;
      border-radius: 18px;
      padding: 16px;
      background: #ffffff;
      min-height: 92px;
    }

    .signature-title {
      font-size: 11px;
      font-weight: 900;
      color: #64748b;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    .signature-line {
      margin-top: 34px;
      border-bottom: 1px solid #94a3b8;
      height: 1px;
    }

    .footer {
      margin-top: 18px;
      border-top: 1px solid #e2e8f0;
      padding-top: 10px;
      font-size: 10px;
      color: #94a3b8;
      text-align: center;
    }

    @media print {
      .page {
        width: 100%;
      }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="topbar">
      <div class="logo-box">LOGO / 학원명 자리</div>
      <div class="doc-mark">LEARNING TYPE REPORT</div>
    </div>

    <section class="hero">
      <div class="hero-sub">${safe(report.subtitle)}</div>
      <div class="hero-title">${safe(report.title)}</div>
      <div class="hero-summary">${safe(report.summary)}</div>

      <div class="badge-row">
        <div class="badge">결과코드 ${safe(resultCode)}</div>
        <div class="badge">학생 ${safe(student.name)}</div>
        <div class="badge">학년 ${safe(student.grade)}</div>
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

        <section class="card" style="margin-top:16px;">
          <h2 class="section-title">축 분석</h2>
          <p class="section-desc">네 가지 핵심 축에서 현재 응답 경향을 시각적으로 정리한 결과입니다.</p>
          <div class="axis-list">
            ${axisCards}
          </div>
        </section>

        <section class="card" style="margin-top:16px;">
          <h2 class="section-title">축별 해석</h2>
          <p class="section-desc">점수 차이를 실제 학습 지도 문장으로 해석했습니다.</p>
          <div class="mini-list">
            ${narrativeCards}
          </div>
        </section>
      </div>

      <div>
        <section class="soft-card">
          <h2 class="section-title">핵심 특징</h2>
          <div class="body-copy">${safe(report.summary)}</div>
        </section>

        <section class="warm-card" style="margin-top:16px;">
          <h2 class="section-title">부모 코칭 방법</h2>
          <div class="body-copy">${safe(report.parent)}</div>
        </section>

        <section class="card" style="margin-top:16px;">
          <h2 class="section-title">추천 학습 전략</h2>
          <div class="body-copy">${safe(report.strategy)}</div>
        </section>

        <section class="green-card" style="margin-top:16px;">
          <h2 class="section-title">추천 진로 방향</h2>
          <div class="body-copy">${safe(report.path)}</div>
        </section>

        <section class="danger-card" style="margin-top:16px;">
          <h2 class="section-title">주의할 점</h2>
          <div class="body-copy">${safe(report.danger)}</div>
        </section>

        <section class="card" style="margin-top:16px;">
          <h2 class="section-title">추천 대화법</h2>
          <div class="body-copy">${safe(report.talk)}</div>
        </section>
      </div>
    </div>

    <section class="comment-card">
      <h2 class="section-title">상담 코멘트</h2>
      <p class="section-desc">상담자가 학생의 현재 상태, 보완 포인트, 향후 지도 방향을 직접 기록하는 영역입니다.</p>
      <div class="comment-box">
        <div class="comment-lines">
          <div class="comment-line"></div>
          <div class="comment-line"></div>
          <div class="comment-line"></div>
          <div class="comment-line"></div>
          <div class="comment-line"></div>
        </div>
      </div>
    </section>

    <div class="signature-wrap">
      <div class="signature-box">
        <div class="signature-title">상담 교사 서명</div>
        <div class="signature-line"></div>
      </div>
      <div class="signature-box">
        <div class="signature-title">학부모 확인</div>
        <div class="signature-line"></div>
      </div>
    </div>

    <div class="footer">
      학습성향검사 결과 리포트 · 학생의 현재 응답 경향을 바탕으로 생성된 참고용 자료입니다.
    </div>
  </div>
</body>
</html>
  `;
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.12),_transparent_35%),linear-gradient(180deg,#f8fbff_0%,#f8fafc_100%)] text-slate-900">
      {children}
    </main>
  );
}

function SectionCard({
  title,
  desc,
  accentColor,
  children,
}: {
  title: string;
  desc?: string;
  accentColor: string;
  children: ReactNode;
}) {
  return (
    <section
      className="rounded-[28px] border bg-white/85 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur"
      style={{
        borderColor: accentColor ? hexToRgba(accentColor, 0.18) : "rgba(255,255,255,0.8)",
        boxShadow: accentColor ? `0 18px 60px ${hexToRgba(accentColor, 0.1)}` : "0 18px 60px rgba(15,23,42,0.08)",
      }}
    >
      <div className="mb-4">
        <h3 className="text-lg font-black text-slate-900">{title}</h3>
        {desc ? <p className="mt-1 text-sm leading-6 text-slate-500">{desc}</p> : null}
      </div>
      {children}
    </section>
  );
}

function InfoItem({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{title}</div>
      <div className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">{value}</div>
    </div>
  );
}

function AxisBars({ scores }: { scores: Record<string, number> }) {
  const axes = [
    { name: "외향 ↔ 내향", left: "E", right: "P", leftLabel: "외향", rightLabel: "내향" },
    { name: "논리 ↔ 창의", left: "R", right: "C", leftLabel: "논리", rightLabel: "창의" },
    { name: "모범 ↔ 자율", left: "M", right: "O", leftLabel: "모범", rightLabel: "자율" },
    { name: "안정 ↔ 도전", left: "S", right: "F", leftLabel: "안정", rightLabel: "도전" },
  ] as const;

  return (
    <div className="grid gap-6">
      {axes.map((axis) => {
        const pair = toFiveScalePair(scores[axis.left], scores[axis.right]);
        return (
          <div key={axis.name} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between text-sm font-bold text-slate-700">
              <span>{axis.leftLabel}</span>
              <span className="text-slate-400">{axis.name}</span>
              <span>{axis.rightLabel}</span>
            </div>

            <div className="relative h-4 w-full rounded-full bg-slate-200">
              <div
                className="absolute top-0 left-0 h-4 rounded-full bg-gradient-to-r from-slate-700 to-indigo-500 transition-all"
                style={{ width: `${pair.rightValue * 20}%` }}
              />
            </div>

            <div className="mt-3 flex justify-between text-xs font-bold text-slate-500">
              <span>{pair.leftValue} / 5</span>
              <span>{pair.rightValue} / 5</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ProgressBar({ current, total, color }: { current: number; total: number; color: string }) {
  const progress = Math.round((current / total) * 100);
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs font-black tracking-[0.16em] text-slate-400">
        <span>PROGRESS</span>
        <span>{progress}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${color}, #0f172a)` }} />
      </div>
    </div>
  );
}

function LandingScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="rounded-[32px] bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div className="text-center">
          <div className="inline-block animate-[floatBadge_2.6s_ease-in-out_infinite] rounded-full bg-yellow-300 px-4 py-2 text-sm font-black shadow-sm">
            🔥 실제 상담에서 쓰는 검사
          </div>

          <h1 className="mt-6 text-3xl font-black leading-tight text-slate-900 sm:text-4xl">
            우리 아이
            <br />
            <span className="text-indigo-600">학습성향</span> 정확히 알아보기
          </h1>

          <p className="mt-4 text-base leading-7 text-slate-600">
            공부를 못하는 이유가 아니라
            <br />
            <span className="font-bold text-slate-900">
              방법이 안 맞았던 걸 수도 있습니다
            </span>
          </p>
        </div>

        <div className="mt-8 grid gap-4">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 shadow-sm transition hover:-translate-y-0.5">
            <div className="font-bold text-slate-900">
              ✓ 결과 정확도 높음 (실제 상담 사용)
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 shadow-sm transition hover:-translate-y-0.5">
            <div className="font-bold text-slate-900">
              ✓ 5분이면 끝나는 간단 검사
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 shadow-sm transition hover:-translate-y-0.5">
            <div className="font-bold text-slate-900">
              ✓ 검사 후 바로 솔루션 제공
            </div>
          </div>
        </div>

        <button
          onClick={onStart}
          className="mt-8 w-full animate-[pulseSoft_2.2s_ease-in-out_infinite] rounded-[24px] bg-[#FEE500] py-5 text-lg font-black text-slate-900 shadow-md transition hover:-translate-y-0.5"
        >
          검사 시작하기 🚀
        </button>
      </div>
    </div>
  );
}

function FormScreen({
  student,
  onChange,
  onNext,
  onBack,
}: {
  student: StudentInfo;
  onChange: (field: keyof StudentInfo, value: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const isValid = student.name.trim() && student.grade.trim() && student.phone.trim();
  const fields: Array<{ key: keyof StudentInfo; label: string; placeholder: string }> = [
    { key: "name", label: "학생 이름", placeholder: "예: 홍길동" },
    { key: "grade", label: "학년", placeholder: "예: 중2 / 고1" },
    { key: "school", label: "학교명", placeholder: "예: OO중학교" },
    { key: "phone", label: "전화번호", placeholder: "예: 010-1234-5678" },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-[32px] border border-white/70 bg-white/90 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
        <h2 className="text-3xl font-black text-slate-900">기본 정보 입력</h2>
        <p className="mt-3 text-slate-600">검사 결과 리포트에 표시될 학생 정보를 입력해 주세요.</p>
        <div className="mt-8 grid gap-5">
          {fields.map((field) => (
            <label key={field.key} className="grid gap-2">
              <span className="text-sm font-black text-slate-700">{field.label}</span>
              <input
                value={student[field.key]}
                onChange={(e) => onChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-base font-semibold text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-slate-400"
              />
            </label>
          ))}
        </div>
        <div className="mt-8 flex items-center justify-between gap-3">
          <button type="button" onClick={onBack} className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700">
            이전
          </button>
          <button
            type="button"
            disabled={!isValid}
            onClick={onNext}
            className="rounded-full bg-slate-900 px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            검사하러 가기
          </button>
        </div>
      </div>
    </div>
  );
}

function TestScreen({
  currentIndex,
  answers,
  onAnswer,
  onNext,
  onPrev,
}: {
  currentIndex: number;
  answers: number[];
  onAnswer: (value: number) => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const question = QUESTIONS[currentIndex];
  const currentAnswer = answers[currentIndex];

  const progress = Math.round(((currentIndex + 1) / QUESTIONS.length) * 100);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">

      <div className="rounded-[32px] bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">

        {/* 진행률 */}
        <div className="mb-6">
          <div className="flex justify-between text-xs font-black text-slate-400">
            <span>{currentIndex + 1} / {QUESTIONS.length}</span>
            <span>{progress}%</span>
          </div>

          <div className="mt-2 h-3 rounded-full bg-slate-200">
            <div
              className="h-3 rounded-full bg-yellow-300 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 질문 */}
        <div className="text-center">
          <h2 className="text-xl font-black leading-8 text-slate-900">
            {question}
          </h2>
        </div>

        {/* 선택 */}
        <div className="mt-8 grid gap-4">

          <button
            onClick={() => onAnswer(1)}
            className={`rounded-[24px] p-6 text-lg font-black transition ${
              currentAnswer === 1
                ? "bg-yellow-300 text-slate-900 shadow-lg"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            그렇다 👍
          </button>

          <button
            onClick={() => onAnswer(0)}
            className={`rounded-[24px] p-6 text-lg font-black transition ${
              currentAnswer === 0
                ? "bg-slate-900 text-white shadow-lg"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            아니다 👎
          </button>

        </div>

        {/* 버튼 */}
        <div className="mt-8 flex justify-between">

          <button
            onClick={onPrev}
            className="rounded-full bg-slate-100 px-5 py-3 text-sm font-black"
          >
            이전
          </button>

          <button
            onClick={onNext}
            disabled={currentAnswer === -1}
            className="rounded-full bg-slate-900 px-5 py-3 text-sm font-black text-white disabled:opacity-30"
          >
            {currentIndex === QUESTIONS.length - 1 ? "결과 보기" : "다음"}
          </button>

        </div>

      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-[32px] bg-white p-10 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div className="mx-auto flex h-16 w-16 animate-[floatBadge_2.3s_ease-in-out_infinite] items-center justify-center rounded-full bg-yellow-300 text-3xl shadow-sm">
          ⏳
        </div>

        <div className="mt-6 text-sm font-black tracking-[0.16em] text-slate-400">
          RESULT ANALYZING
        </div>

        <h2 className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl">
          결과 분석 중입니다...
        </h2>

        <p className="mt-4 text-base leading-8 text-slate-600">
          학생의 응답 패턴을 바탕으로
          <br />
          <span className="font-black text-slate-900">
            정확도 높은 결과를 생성 중
          </span>
          입니다.
        </p>

        <div className="mt-8 flex items-center justify-center gap-2">
          <span className="h-3 w-3 animate-[dotBounce_1.1s_ease-in-out_infinite] rounded-full bg-yellow-300" />
          <span className="h-3 w-3 animate-[dotBounce_1.1s_ease-in-out_0.15s_infinite] rounded-full bg-yellow-300" />
          <span className="h-3 w-3 animate-[dotBounce_1.1s_ease-in-out_0.3s_infinite] rounded-full bg-yellow-300" />
        </div>

        <div className="mt-6 overflow-hidden rounded-full bg-slate-200">
          <div className="h-3 animate-[loadingBar_1.8s_ease-in-out_infinite] rounded-full bg-yellow-300" />
        </div>

        <div className="mt-4 text-sm font-bold text-slate-400">
          잠시만 기다려 주세요
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const [step, setStep] = useState<Step>("landing");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hasSavedResult, setHasSavedResult] = useState(false);
  const [student, setStudent] = useState<StudentInfo>({ name: "", grade: "", school: "", phone: "" });
  const [answers, setAnswers] = useState<number[]>(() => Array(QUESTIONS.length).fill(-1));

  const answeredCount = useMemo(() => answers.filter((answer) => answer !== -1).length, [answers]);
  const isComplete = answeredCount === QUESTIONS.length;
  const scores = useMemo(() => makeScores(answers), [answers]);
  const resolved = useMemo(() => resolveResult(scores), [scores]);
  const report = RESULT_DB[resolved.key] || RESULT_DB.DEFAULT;

useEffect(() => {
  if (step !== "result" || hasSavedResult || !isComplete) return;

  let cancelled = false;

  const run = async () => {
    try {
      const resultPayload = buildResultPayload({
        student,
        resolved,
        report,
        scores,
        totalAnswered: answeredCount,
        totalQuestions: QUESTIONS.length,
      });

      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_name: student.name,
          grade: student.grade,
          school: student.school,
          phone: student.phone,

          result_code: resolved.code,
          result_full_code: resolved.fullCode,
          result_title: report.title,
          result_subtitle: report.subtitle,

          e_score: scores.E ?? 0,
          p_score: scores.P ?? 0,
          r_score: scores.R ?? 0,
          c_score: scores.C ?? 0,
          m_score: scores.M ?? 0,
          o_score: scores.O ?? 0,
          s_score: scores.S ?? 0,
          f_score: scores.F ?? 0,

          result_payload: resultPayload,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json?.ok) {
        throw new Error(json?.error || "결과 저장 실패");
      }

      if (!cancelled) {
        setHasSavedResult(true);
      }
    } catch (error) {
      console.error("결과 저장 실패:", error);
    }
  };

  void run();

  return () => {
    cancelled = true;
  };
}, [step, hasSavedResult, isComplete, student, resolved, report, scores, answeredCount]);

  const moveSafely = (next: () => void) => {
    setIsTransitioning(true);
    window.setTimeout(() => {
      next();
      setIsTransitioning(false);
    }, 120);
  };

  const handleStudentChange = (field: keyof StudentInfo, value: string) => {
    setStudent((prev) => ({ ...prev, [field]: value }));
  };

  const handleAnswer = (value: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = value;
      return next;
    });
  };

const goNext = () => {
  if (step === "test" && currentIndex === QUESTIONS.length - 1) {
    moveSafely(() => setStep("loading"));

    window.setTimeout(() => {
      setStep("result");
    }, 1600);

    return;
  }

  if (step === "test") {
    moveSafely(() => setCurrentIndex((prev) => prev + 1));
  }
};

  const goPrev = () => {
    if (step === "form") {
      moveSafely(() => setStep("landing"));
      return;
    }

    if (step === "test" && currentIndex === 0) {
      moveSafely(() => setStep("form"));
      return;
    }

    if (step === "test") {
      moveSafely(() => setCurrentIndex((prev) => prev - 1));
    }
  };

  const restart = () => {
    setStudent({ name: "", grade: "", school: "", phone: "" });
    setAnswers(Array(QUESTIONS.length).fill(-1));
    setCurrentIndex(0);
    setHasSavedResult(false);
    setStep("landing");
  };

  return (
    <Shell>
      <div className={`${isTransitioning ? "opacity-80" : "opacity-100"} transition-opacity duration-150`}>
       {step === "landing" && <LandingScreen onStart={() => moveSafely(() => setStep("form"))} />}

{step === "form" && (
  <FormScreen
    student={student}
    onChange={handleStudentChange}
    onNext={() => moveSafely(() => setStep("test"))}
    onBack={() => moveSafely(() => setStep("landing"))}
  />
)}

{step === "test" && (
  <TestScreen
    currentIndex={currentIndex}
    answers={answers}
    onAnswer={handleAnswer}
    onNext={goNext}
    onPrev={goPrev}
  />
)}

{step === "loading" && <LoadingScreen />}

{step === "result" && (
  <ResultScreen
    student={student}
    scores={scores}
    resolved={resolved}
    report={report}
    onRestart={restart}
  />
)}
      </div>
    </Shell>
  );
}

function buildShareText(title: string) {
  return `우리 아이 학습유형 결과 😮

👉 ${title}

생각보다 정확해서 놀람...
무료 테스트 해보세요👇
https://study-type-test-app-zbmw.vercel.app`;
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
  alert("링크가 복사됐어요 👍");
}

function shareNative(text: string) {
  if (navigator.share) {
    navigator.share({
      title: "학습성향 검사",
      text,
      url: "https://study-type-test-app-zbmw.vercel.app",
    });
  } else {
    copyToClipboard(text);
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
    return ["발표·소통에서 강함", "에너지가 외부 활동에서 살아남", "리더 역할을 맡을 때 빛남"];
  }

  if (key.includes("PC")) {
    return ["혼자 집중할 때 몰입이 높음", "조용하지만 생각이 깊음", "겉보다 속이 단단한 편"];
  }

  if (key.includes("PR")) {
    return ["관심 있는 과목은 확실히 잘함", "싫은 건 미루는 편", "환경에 따라 성과 차이가 큼"];
  }

  return ["상황에 따라 유연함", "균형 잡힌 성향", "안정적인 학습 스타일"];
}

function getFuture(key: string) {
  if (key.includes("ER")) return "리더형, 기획형, 활동 중심 역할에서 강점이 드러날 가능성이 큽니다.";
  if (key.includes("EC")) return "전문직, 분석형, 언어/연구 계열에서 깊이 있는 성장 가능성이 높습니다.";
  if (key.includes("PR") || key.includes("PC")) return "특정 분야에 강하게 몰입하는 전문가형으로 성장할 가능성이 큽니다.";
  return "균형형 인재로 다양한 진로 선택지 속에서 안정적으로 성장할 수 있습니다.";
}

function getDangerPattern(key: string) {
  if (key.includes("PR") || key.includes("PC")) {
    return ["좋아하는 것만 하는 패턴", "마무리 부족", "성적 편차가 커질 수 있음"];
  }

  if (key.includes("ER")) {
    return ["집중력 분산", "활동이 과해질 수 있음", "계획이 흐트러질 수 있음"];
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