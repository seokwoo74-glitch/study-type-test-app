"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

type Step = "landing" | "form" | "test" | "result";

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
  { C: 5 }, { M: 5 }, { M: 5 }, { O: 5 }, { P: 3 }, { R: 5 }, { M: 5 }, { M: 3 }, { M: 3 }, { O: 3 },
  { O: 5 }, { F: 5 }, { F: 1 }, { E: 3 }, { R: 5 }, { C: 3 }, { M: 5 }, { O: 5 }, { E: 5 }, { E: 3 },
  { P: 5 }, { O: 5 }, { O: 3 }, { E: 5 }, { P: 5 }, { S: 5 }, { R: 3 }, { S: 5 }, { E: 3 }, { O: 3 },
  { S: 3 }, { S: 3 }, { F: 5 }, { P: 3 }, { P: 3 }, { F: 5 }, { F: 3 }, { P: 5 }, { M: 3 }, { F: 3 },
];

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
    key: "ERMS",
    aliases: ["ERMS", "ERMs", "eRMS", "eRMs", "ErMS", "ErMs", "erMS", "erMs"],
    report: {
      title: "이과 창의적영재형",
      subtitle: "1% 미만",
      summary: "이과적 두뇌와 창의적 사고가 매우 뛰어나며, 상위권을 넘어 특출한 성취 가능성을 지닌 유형입니다.",
      strategy: "자기주도성이 강하므로 학생의 의견을 중심으로 학습 방향을 설계하되, 내신·대회·전형 정보를 균형 있게 관리하는 것이 좋습니다.",
      parent: "통제보다 신뢰와 지원이 효과적입니다. 수준이 맞는 집단에서 더 크게 성장할 가능성이 높습니다.",
      path: "서울대, 카이스트, 포항공대, 의학·공학·자연과학 계열과 잘 맞습니다.",
      danger: "맞지 않는 환경에서는 흥미가 급격히 떨어질 수 있습니다.",
      talk: "‘왜 그렇게 생각했는지 설명해볼래?’ 같은 질문형 대화가 효과적입니다.",
      color: "#2563eb",
    },
    meta: {
      label: "창의 연구자",
      tagline: "깊이 있는 탐구와 독창성이 빛나는 최상위 이과형",
      emoji: "🧠",
      aura: "from-blue-500/25 via-sky-400/10 to-cyan-300/20",
    },
  },
  {
    key: "ERMF",
    aliases: ["ERMF", "ERMf", "ERmF", "ERmf", "eRMF", "eRMf", "eRmF", "eRmf", "ErMF", "ErMf", "ErmF", "Ermf"],
    report: {
      title: "이과 영재형",
      subtitle: "3% 미만",
      summary: "특정 과목에서 매우 높은 성취 가능성을 보이며, 관심 분야에서는 압도적 몰입을 보일 수 있는 유형입니다.",
      strategy: "관심 과목의 강점을 유지하면서도 시작한 일을 성과물로 연결할 수 있도록 고른 학습과 마무리 습관을 설계하는 것이 중요합니다.",
      parent: "흥미 중심 몰입이 강해 균형 잡힌 학습 리듬 관리가 필요합니다.",
      path: "수학, 물리, 전자, 발명, IT·연구 계열과 잘 맞습니다.",
      danger: "마무리와 꾸준함이 약해지면 성과가 불안정해질 수 있습니다.",
      talk: "‘잘하는 걸 살리면서 끝까지 연결해보자’는 접근이 효과적입니다.",
      color: "#0f766e",
    },
    meta: {
      label: "몰입 발명가",
      tagline: "좋아하는 분야에 압도적으로 빠져드는 영재형",
      emoji: "⚡",
      aura: "from-teal-500/25 via-emerald-400/10 to-cyan-300/20",
    },
  },
  {
    key: "EROS",
    aliases: ["eROS", "eRoS", "EROS", "EROs", "ERoS", "ERos"],
    report: {
      title: "이과모범형",
      subtitle: "4%~10% 미만",
      summary: "이과 성향과 자기관리 능력이 함께 강한 유형으로, 안정적인 상위권 전략이 잘 맞습니다.",
      strategy: "내신과 모의고사를 고르게 관리하며 시험 불안과 외부 활동으로 인한 리듬 흔들림만 잘 조절하면 강점을 꾸준히 유지할 수 있습니다.",
      parent: "학생의 학습 방식을 존중해도 무난하지만, 친구 관계나 외부 활동이 학습 흐름을 방해하지 않도록 점검이 필요합니다.",
      path: "SKY, 의·치·한의대, 자연과학, 공학, 수의학 계열과 잘 맞습니다.",
      danger: "적극적인 성향 때문에 학습보다 관계와 활동에 에너지가 분산될 수 있습니다.",
      talk: "‘지금의 리듬만 지키면 충분히 좋은 결과로 이어질 수 있어’라는 대화가 좋습니다.",
      color: "#0891b2",
    },
    meta: {
      label: "엘리트 플래너",
      tagline: "성실함과 자기관리가 돋보이는 안정형 상위권",
      emoji: "📘",
      aura: "from-sky-500/25 via-cyan-400/10 to-blue-300/20",
    },
  },
  {
    key: "PROS_PASSIVE",
    aliases: ["pROS", "pRoS", "pRMS", "pRmS"],
    report: {
      title: "(수동적) 이과 모범형",
      subtitle: "4%~10% 미만",
      summary: "성실함과 인내심을 바탕으로 상위권을 안정적으로 유지하는 유형입니다.",
      strategy: "개념 정리와 실수 관리, 시험 불안 조절이 중요하며 보다 적극적인 활동 경험과 리더십 기회를 함께 쌓으면 성장 폭이 커집니다.",
      parent: "실력은 충분하지만 자기표현과 존재감이 약할 수 있으므로, 안정감을 해치지 않는 선에서 경험의 폭을 넓혀주는 것이 좋습니다.",
      path: "SKY, 지방의대, 자연과학, 공학, 수의학, 약학 계열과 잘 맞습니다.",
      danger: "실수 하나에 흔들리면 멘탈 영향이 큰 편입니다.",
      talk: "‘차분히 쌓아온 힘이 크다’는 식의 대화가 좋습니다.",
      color: "#0284c7",
    },
    meta: {
      label: "차분한 성취가",
      tagline: "묵직하게 쌓아 올리는 실속형 상위권",
      emoji: "🛡️",
      aura: "from-cyan-500/25 via-sky-400/10 to-indigo-300/20",
    },
  },
  {
    key: "PRMF",
    aliases: ["PRMF", "PRMf", "PRmF", "PRmf", "PRMs", "pRMs", "pRMF", "pRMf", "pRmF", "pRmf", "pRoF"],
    report: {
      title: "이과 뺀질이형",
      subtitle: "20% 미만",
      summary: "수학·과학 등 특정 과목에서는 강점을 보이지만, 흥미 없는 과목은 쉽게 놓칠 수 있는 유형입니다.",
      strategy: "절대 학습시간 확보, 감독이 있는 환경, 선호 과목의 성과를 전체 학습 동기로 연결하는 구조가 필요합니다.",
      parent: "자유도보다 책임감이 생기는 환경이 더 적합합니다. 결과물 중심 경험이 학습 전체를 끌어올리는 데 도움이 됩니다.",
      path: "이공계열, 논술·정시 전략, IT 분야와 연결될 수 있습니다.",
      danger: "좋아하는 과목만 밀고 나가다 전체 균형이 무너질 수 있습니다.",
      talk: "‘짧게라도 끝까지 가는 힘을 같이 만들어보자’는 식의 대화가 좋습니다.",
      color: "#7c3aed",
    },
    meta: {
      label: "자유로운 문제해결사",
      tagline: "관심 분야에서 번뜩이는 재능을 터뜨리는 편차형",
      emoji: "🎯",
      aura: "from-violet-500/25 via-fuchsia-400/10 to-purple-300/20",
    },
  },
  {
    key: "EROF",
    aliases: ["EROF", "EROf", "ERoF", "ERof", "eROF", "eROf", "eRoF", "eRof"],
    report: {
      title: "외향적 이과뺀질형",
      subtitle: "20% 미만",
      summary: "관심 있는 과목에서는 번뜩이는 성과를 보이지만, 주변 환경의 영향을 크게 받는 유형입니다.",
      strategy: "통제적 환경, 선택과 집중, 책임감 경험이 효과적이며 관심 분야의 구체적 결과물이 전체 성적 향상에 시너지를 줄 수 있습니다.",
      parent: "환경에 따라 결과 차이가 커질 수 있어 학습 공간과 함께하는 집단을 신중히 선택하는 것이 중요합니다.",
      path: "자유전공, 자연과학, 건축, IT 마케팅, 이공계 연구 계열과 잘 맞습니다.",
      danger: "많은 일을 시작하지만 끝맺음이 약할 수 있습니다.",
      talk: "‘환경을 잘 고르면 강점이 훨씬 크게 드러날 수 있어’라는 코칭이 효과적입니다.",
      color: "#9333ea",
    },
    meta: {
      label: "에너지 크리에이터",
      tagline: "사람과 환경 속에서 아이디어가 살아나는 활동형",
      emoji: "🚀",
      aura: "from-purple-500/25 via-fuchsia-400/10 to-pink-300/20",
    },
  },
  {
    key: "PROS",
    aliases: ["PROF", "PROf", "PROS", "PROs", "PRoF", "PRof", "PRoS", "PRos", "PRMS", "PRmS", "PRms", "pROF", "pROf", "pROs", "pRos", "pRof", "pRms", "eROs", "eRos"],
    report: {
      title: "이과 잠재성장형",
      subtitle: "70% 내외",
      summary: "현재 강점이 선명하게 드러나지 않았더라도 기초를 차분히 쌓을수록 성장 가능성이 커지는 유형입니다.",
      strategy: "선행보다 내신 중심으로 접근하고 한 과목씩 성취 경험을 만드는 방식이 효과적입니다. 절대 시간보다 집중 시간을 늘리는 전략이 중요합니다.",
      parent: "비교보다 작은 성공 경험의 축적이 중요합니다. 선호 과목에서 자신감을 회복하게 하면 전체 학습에도 긍정적인 영향을 줄 수 있습니다.",
      path: "간호, 사범, 이과대학, 교사·간호사·물리치료사·약사 계열과 잘 맞습니다.",
      danger: "막연한 목표만 세우면 쉽게 지칠 수 있습니다.",
      talk: "‘이번에는 이 한 가지를 끝내보자’처럼 작고 분명한 목표가 효과적입니다.",
      color: "#ea580c",
    },
    meta: {
      label: "성장 새싹",
      tagline: "작은 성취를 쌓을수록 크게 성장하는 잠재형",
      emoji: "🌱",
      aura: "from-orange-500/25 via-amber-400/10 to-yellow-300/20",
    },
  },
  {
    key: "ECMF",
    aliases: ["ECMF", "ECMf"],
    report: {
      title: "문과 창의적영재형",
      subtitle: "1% 미만",
      summary: "문과 성향의 창의성과 표현력이 매우 강하며 차별화된 결과물을 만들 가능성이 높은 유형입니다.",
      strategy: "관심 분야 심화 학습과 결과물 축적이 잘 맞습니다.",
      parent: "다름을 교정하기보다 강점이 성과로 연결되게 도와주는 것이 중요합니다.",
      path: "어문, 언론정보, 연극영화, 광고, 방송PD, 게임기획 계열과 잘 맞습니다.",
      danger: "실행 리듬이 무너지면 결과가 불안정해질 수 있습니다.",
      talk: "‘네 생각을 결과물로 보여줄 방법을 같이 찾아보자’는 접근이 좋습니다.",
      color: "#db2777",
    },
    meta: {
      label: "감각 스토리텔러",
      tagline: "표현력과 창의성이 돋보이는 문과 창의형",
      emoji: "🎨",
      aura: "from-pink-500/25 via-rose-400/10 to-fuchsia-300/20",
    },
  },
  {
    key: "ECMS",
    aliases: ["ECMS", "eCMS", "EcMS", "EcMs", "ecMS", "ecMs"],
    report: {
      title: "문과 모범형 영재형",
      subtitle: "2% 미만",
      summary: "안정된 성과와 자기관리 능력을 함께 갖춘 이상적인 문과 영재형입니다.",
      strategy: "신뢰를 기반으로 하되 체력·멘탈 관리까지 함께 챙기면 좋습니다.",
      parent: "과한 개입보다 신뢰와 점검이 적합합니다.",
      path: "SKY, 경영·행정·신문방송·법조·외교관 계열과 잘 맞습니다.",
      danger: "완벽주의와 부담감이 누적될 수 있습니다.",
      talk: "‘지금도 충분히 잘 가고 있어’라는 메시지가 중요합니다.",
      color: "#2563eb",
    },
    meta: {
      label: "품격 있는 우등생",
      tagline: "안정성과 완성도를 동시에 갖춘 문과 영재형",
      emoji: "👑",
      aura: "from-blue-500/25 via-indigo-400/10 to-sky-300/20",
    },
  },
  {
    key: "ECOS",
    aliases: ["ECOS", "ECOs", "ECoS", "ECos", "ECmS", "ECms", "eCmS", "eCms", "pCMS", "ECoF", "ECmf", "ECMs", "eCMs"],
    report: {
      title: "내성적 문과영재형",
      subtitle: "3% 미만",
      summary: "언어·외국어 영역의 강점과 깊이 있는 사고를 함께 지닌 문과 상위권 유형입니다.",
      strategy: "심화 학습과 실천 습관을 함께 보완하는 것이 중요합니다.",
      parent: "겉으로 드러나지 않는 실행 부족을 세심하게 관리해주면 크게 성장할 수 있습니다.",
      path: "정치외교, 신문방송, 법조, 언론, 외교관 계열과 잘 맞습니다.",
      danger: "실행력이 떨어지면 결과가 기대만큼 드러나지 않을 수 있습니다.",
      talk: "‘깊이는 충분하니 이제 실천으로 연결해보자’는 대화가 효과적입니다.",
      color: "#7c3aed",
    },
    meta: {
      label: "깊이형 사색가",
      tagline: "조용하지만 강한 사고력과 언어 감각을 지닌 유형",
      emoji: "📚",
      aura: "from-violet-500/25 via-indigo-400/10 to-purple-300/20",
    },
  },
  {
    key: "PCOS",
    aliases: ["pCOS", "pCoS", "pCmS"],
    report: {
      title: "(내성적) 문과 모범형",
      subtitle: "4%~10% 미만",
      summary: "자기주도성과 계획 실행의 균형이 좋은 내성적 상위권 문과형입니다.",
      strategy: "내신 최상위권 유지, 시험 불안 관리, 개념 정리, 규칙적인 멘토링이 효과적입니다.",
      parent: "지나친 간섭보다 정기적인 대화와 점검이 적합합니다.",
      path: "경영, 경제, 행정, 교대, 법조 계열과 잘 맞습니다.",
      danger: "도움 요청 시점을 놓칠 수 있습니다.",
      talk: "‘혼자 감당하지 말고 막히는 지점을 같이 보자’는 태도가 좋습니다.",
      color: "#0284c7",
    },
    meta: {
      label: "정교한 실천가",
      tagline: "차분하고 정교하게 계획을 현실로 만드는 유형",
      emoji: "🧩",
      aura: "from-cyan-500/25 via-blue-400/10 to-slate-300/20",
    },
  },
  {
    key: "ECOS_B",
    aliases: ["eCoS", "eCos", "eCOS", "ECOf"],
    report: {
      title: "문과모범형B",
      subtitle: "4%~10% 미만",
      summary: "상위권 성적을 안정적으로 유지하면서 리더십과 대외 활동 역량도 함께 갖춘 유형입니다.",
      strategy: "내신 유지와 활동 경험을 균형 있게 관리하면 강점이 잘 살아납니다.",
      parent: "학습 방식은 비교적 안정적이므로 멘탈과 리듬 유지에 집중해서 도와주는 것이 좋습니다.",
      path: "정치외교, 경영, 신문방송, 기자, PD, 외교관 계열과 잘 맞습니다.",
      danger: "관계와 활동 에너지가 큰 만큼 자신의 학습 리듬이 흐트러질 수 있습니다.",
      talk: "‘네 페이스를 먼저 지키는 게 중요해’라는 식의 대화가 효과적입니다.",
      color: "#059669",
    },
    meta: {
      label: "리더형 모범생",
      tagline: "성적과 대외 역량을 균형 있게 이끄는 유형",
      emoji: "🌟",
      aura: "from-emerald-500/25 via-teal-400/10 to-green-300/20",
    },
  },
  {
    key: "PCMS",
    aliases: ["PCMF", "PCMf", "pCMF", "pCMf", "pCMs", "PCMs", "ECmF", "ECOF", "ECof", "eCOF", "eCOf", "eCoF", "eCof"],
    report: {
      title: "(외향적) 문과뺀질이형",
      subtitle: "20% 미만",
      summary: "관심 과목에서는 강점을 보이지만 관계 에너지와 분위기의 영향을 크게 받는 유형입니다.",
      strategy: "관심 과목 결과물을 동기로 삼고 균형 잡힌 과목 관리와 절대 학습시간 확보가 필요합니다.",
      parent: "분위기에 휩쓸리지 않도록 관리형 환경을 만들어 주는 것이 중요합니다.",
      path: "신문방송, 정치, 호텔경영, PD, 엔터테인먼트 계열과 잘 맞습니다.",
      danger: "공부보다 관계와 분위기에 에너지를 더 쓸 수 있습니다.",
      talk: "‘얼마나 했는지 숫자와 결과로 확인해보자’는 방식이 좋습니다.",
      color: "#9333ea",
    },
    meta: {
      label: "무드 드라이버",
      tagline: "분위기와 관계 에너지 속에서 움직이는 외향형",
      emoji: "🎤",
      aura: "from-purple-500/25 via-pink-400/10 to-fuchsia-300/20",
    },
  },
  {
    key: "PCMF",
    aliases: ["PCmF", "PCmf", "PCms", "pCmF", "pCmf", "PCoF", "PCof", "pCoF"],
    report: {
      title: "(내향적) 문과 뺀질이",
      subtitle: "20% 미만",
      summary: "조용하지만 관심 분야에는 강하게 몰입하며, 학습 균형과 마무리 능력이 핵심인 유형입니다.",
      strategy: "통제적 환경, 절대 학습시간 확보, 관심 분야 성과물을 전체 성적 향상의 발판으로 활용하는 것이 중요합니다.",
      parent: "겉으로 드러나지 않아 방심하기 쉽지만 조용히 흐트러질 수 있어 세심한 관찰이 필요합니다.",
      path: "자유전공, 철학, 애니메이션, 사학, 문헌정보 계열과 잘 맞습니다.",
      danger: "마무리가 약해 성과로 연결되지 못할 수 있습니다.",
      talk: "‘끝까지 간 걸 함께 확인하자’는 식의 대화가 좋습니다.",
      color: "#a21caf",
    },
    meta: {
      label: "조용한 몰입러",
      tagline: "겉은 조용하지만 좋아하는 일엔 강하게 빠지는 유형",
      emoji: "🌙",
      aura: "from-fuchsia-500/25 via-purple-400/10 to-violet-300/20",
    },
  },
  {
    key: "PCOF",
    aliases: ["PCOF", "PCOf", "PCOS", "PCOs", "PCoS", "PCos", "PCMS", "PCmS", "pCOF", "pCOf", "pCOs", "pCos", "pCms", "pCof", "eCOs", "pCOS", "pCoS"],
    report: {
      title: "문과 잠재성장형",
      subtitle: "70% 내외",
      summary: "차분한 기반 위에서 성장 가능성이 큰 유형입니다.",
      strategy: "선행보다 내신 중심 학습이 적합하며 작은 성취를 반복적으로 만드는 것이 중요합니다.",
      parent: "비교보다 성취 경험의 축적이 우선입니다.",
      path: "아동, 심리, 사범, 사회복지, 상담, 교육 관련 계열과 잘 맞습니다.",
      danger: "막연한 계획만 세우고 쉽게 지칠 수 있습니다.",
      talk: "‘이번엔 어디까지 해냈는지 같이 확인하자’는 대화가 좋습니다.",
      color: "#ea580c",
    },
    meta: {
      label: "따뜻한 성장형",
      tagline: "작은 성공을 발판 삼아 천천히 커지는 문과 잠재형",
      emoji: "☀️",
      aura: "from-orange-500/25 via-yellow-400/10 to-amber-300/20",
    },
  },
  {
    key: "HYB_ERMS",
    aliases: ["ErMS", "ErMs", "EcMS", "EcMs", "erMS", "ecMS", "ErMF", "ErMf", "ErmF", "Ermf", "EcMF", "EcMf", "EcmF", "Ecmf", "erMF", "erMf", "ecMF", "ecMf"],
    report: {
      title: "문·이과 혼합 영재형",
      subtitle: "4% 미만",
      summary: "문·이과 전 영역을 두루 소화할 수 있는 융합형 상위권 영재입니다.",
      strategy: "전 과목을 고르게 유지하면서도 시작한 일을 결과물로 연결하는 훈련이 중요합니다.",
      parent: "산만함과 독특함을 약점으로 보기보다 강점으로 연결될 수 있도록 마무리와 집중을 도와주는 것이 좋습니다.",
      path: "자유전공, 국제통상, 통계, 건축, 행정, 외교, 예술 융합 계열과 잘 맞습니다.",
      danger: "관심사가 넓어 선택과 집중이 흐려질 수 있습니다.",
      talk: "‘우선순위를 같이 정해보자’는 식의 대화가 효과적입니다.",
      color: "#0f766e",
    },
    meta: {
      label: "융합 설계자",
      tagline: "문·이과를 넘나드는 통합적 사고를 가진 융합형",
      emoji: "🧭",
      aura: "from-teal-500/25 via-sky-400/10 to-indigo-300/20",
    },
  },
  {
    key: "HYB_EROS",
    aliases: ["ErOS", "ErOs", "EroS", "Eros", "EcOS", "EcOs", "EcoS", "Ecos", "erOS", "eroS", "ecOS", "ecoS", "ErmS", "Erms", "ermS", "erms", "EcmS", "Ecms", "ecmS", "ecms", "ErOf", "EcOf"],
    report: {
      title: "문·이과 혼합 모범형",
      subtitle: "10% 미만",
      summary: "문·이과를 모두 무난하게 해내며 실리적으로 성과를 쌓는 안정형 상위권입니다.",
      strategy: "내신, 활동, 시험 리듬을 균형 있게 유지하면 가장 효율적으로 성장할 수 있습니다.",
      parent: "활동과 관계 에너지가 커질 수 있으니 학습 리듬만 잘 잡아주면 좋습니다.",
      path: "사회과학, 경제, 자연과학, 통계, 공무원, 교사, 변호사 계열과 잘 맞습니다.",
      danger: "다 잘하려다 체력과 집중력이 먼저 떨어질 수 있습니다.",
      talk: "‘잘하고 있는 것 중 꼭 챙길 것만 남기자’는 정리형 대화가 좋습니다.",
      color: "#0891b2",
    },
    meta: {
      label: "균형 운영자",
      tagline: "실리와 균형을 바탕으로 안정적으로 성장하는 유형",
      emoji: "⚖️",
      aura: "from-sky-500/25 via-teal-400/10 to-cyan-300/20",
    },
  },
  {
    key: "HYB_PRMS",
    aliases: ["PrMS", "PrmS", "Prms", "prMS"],
    report: {
      title: "문·이과 혼합 수동적모범형",
      subtitle: "10% 미만",
      summary: "성실성과 안정감으로 꾸준한 상위권을 지키는 혼합형 학생입니다.",
      strategy: "개념 정리, 시험 불안 관리, 보다 적극적인 대외 활동 경험이 성장 포인트입니다.",
      parent: "실력은 있으나 자기주장이 약할 수 있어 발표 경험을 조금씩 쌓게 해주는 것이 좋습니다.",
      path: "경영, 경제, 응용통계, 회계, 간호, 교대 계열과 잘 맞습니다.",
      danger: "실력에 비해 존재감이 약해 기회를 놓칠 수 있습니다.",
      talk: "‘드러내는 연습도 중요한 실력이다’라고 말해주는 것이 좋습니다.",
      color: "#0284c7",
    },
    meta: {
      label: "차곡차곡 성과형",
      tagline: "꾸준함으로 결과를 만들어내는 혼합 모범형",
      emoji: "🏅",
      aura: "from-blue-500/25 via-cyan-400/10 to-slate-300/20",
    },
  },
  {
    key: "HYB_PRMF",
    aliases: ["PrMF", "PrMf", "PrmF", "Prmf"],
    report: {
      title: "문·이과 혼합 뺀질이형",
      subtitle: "20% 미만",
      summary: "관심 과목만 잘하는 편차형이지만 융합적 재능과 아이디어가 살아 있는 유형입니다.",
      strategy: "균형 잡힌 과목 관리, 감독이 있는 환경, 관심 분야 결과물을 전체 성적으로 연결하는 전략이 중요합니다.",
      parent: "통제적 환경과 마무리 점검이 필요합니다. 시작은 빠르지만 끝까지 가는 힘을 만들어주는 것이 핵심입니다.",
      path: "자유전공, 건축, 자연과학, 철학, 어문, 방송 관련 계열과 잘 맞습니다.",
      danger: "넓은 재능이 오히려 산만함으로 보일 수 있습니다.",
      talk: "‘재능은 충분하니 끝까지 연결하는 힘을 만들자’는 대화가 효과적입니다.",
      color: "#7c3aed",
    },
    meta: {
      label: "융합 아이디어러",
      tagline: "재능은 넓고, 마무리 훈련이 중요한 융합 편차형",
      emoji: "💡",
      aura: "from-violet-500/25 via-indigo-400/10 to-fuchsia-300/20",
    },
  },
  {
    key: "HYB_PROS",
    aliases: ["PrOF", "PrOf", "ProF", "Prof", "prOF", "prOf", "proF", "prof", "erOF", "erOf", "eroF", "erof"],
    report: {
      title: "융합 잠재성장형",
      subtitle: "70% 내외",
      summary: "현재 특별히 두드러진 과목이 없더라도 생활 속 훈련과 경험에 따라 성장 폭이 크게 달라질 수 있는 유형입니다.",
      strategy: "선행보다 내신 중심으로 접근하고 선택과 집중을 통해 작은 성취 경험을 반복적으로 만드는 것이 중요합니다.",
      parent: "막연한 기대보다 단계적 목표가 필요합니다. 선호 과목에서 자신감을 얻으면 다른 과목으로 확장될 수 있습니다.",
      path: "심리, 사범, 사회복지, 건축, 간호, 상담 관련 계열과 잘 맞습니다.",
      danger: "구체적 목표가 없으면 쉽게 무기력해질 수 있습니다.",
      talk: "‘오늘은 이 한 가지를 끝내보자’처럼 작은 목표가 효과적입니다.",
      color: "#ea580c",
    },
    meta: {
      label: "가능성 탐험가",
      tagline: "생활 속 경험이 쌓일수록 잠재력이 열리는 성장형",
      emoji: "🌈",
      aura: "from-orange-500/25 via-amber-400/10 to-rose-300/20",
    },
  },
  {
    key: "DEFAULT",
    aliases: ["DEFAULT"],
    report: {
      title: "학습성향 분석 결과",
      subtitle: "기본 리포트",
      summary: "현재 입력된 응답을 바탕으로 가장 가까운 학습 성향으로 분류한 결과입니다.",
      strategy: "기본 학습 루틴을 먼저 안정화하고 강점 과목 중심으로 성취 경험을 늘리는 것이 좋습니다.",
      parent: "현재 방식에 맞는 환경과 전략을 함께 찾는 접근이 효과적입니다.",
      path: "상세 결과 DB 확장에 따라 더 정밀한 추천으로 연결될 수 있습니다.",
      danger: "강점이 선명하지 않을수록 비교의 영향을 더 크게 받을 수 있습니다.",
      talk: "‘네 방식에 맞는 방법을 같이 찾아가자’는 접근이 좋습니다.",
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

const RESULT_ALIAS_MAP: Record<string, string> = RESULT_DEFINITIONS.reduce(
  (acc, item) => {
    acc[item.key] = item.key;
    item.aliases.forEach((alias) => {
      acc[alias] = item.key;
      acc[alias.toUpperCase()] = item.key;
    });
    return acc;
  },
  {} as Record<string, string>
);

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

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function normalizeAxis(left: number, right: number) {
  const total = left + right;
  if (total === 0) return 0;
  return clamp(((right - left) / total) * 2, -2, 2);
}

function buildDisplayCode(scores: Record<string, number>) {
  const socialDiff = Math.abs(scores.E - scores.P);
  const judgmentDiff = Math.abs(scores.R - scores.C);
  const trackDiff = Math.abs(scores.M - scores.O);
  const styleDiff = Math.abs(scores.S - scores.F);

  const socialLetter = scores.E >= scores.P ? "E" : "P";
  const judgmentLetter = scores.R >= scores.C ? "R" : "C";
  const trackLetter = scores.M >= scores.O ? "M" : "O";
  const styleLetter = scores.S >= scores.F ? "S" : "F";

  const formatLetter = (letter: string, diff: number) => (diff <= 1 ? letter.toLowerCase() : letter.toUpperCase());

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

  if (RESULT_ALIAS_MAP[clean]) return RESULT_ALIAS_MAP[clean];

  const upper = clean.toUpperCase();
  if (RESULT_ALIAS_MAP[upper]) return RESULT_ALIAS_MAP[upper];

  const chars = upper.split("");
  const social = chars[0] === "P" ? "P" : "E";
  const judgment = chars[1] === "C" ? "C" : "R";
  const track = chars[2] === "O" ? "O" : "M";
  const style = chars[3] === "F" ? "F" : "S";
  const normalized4 = `${social}${judgment}${track}${style}`;

  if (RESULT_ALIAS_MAP[normalized4]) return RESULT_ALIAS_MAP[normalized4];

  const fallbackCandidates = [
    normalized4,
    `${social}${judgment}${track}S`,
    `${social}${judgment}${track}F`,
    `${social}${judgment}M${style}`,
    `${social}${judgment}O${style}`,
    `${social}${judgment}MS`,
    `${social}${judgment}MF`,
    `${social}${judgment}OS`,
    `${social}${judgment}OF`,
    normalized4.toLowerCase(),
  ];

  for (const candidate of fallbackCandidates) {
    if (RESULT_ALIAS_MAP[candidate]) return RESULT_ALIAS_MAP[candidate];
    const candidateUpper = candidate.toUpperCase();
    if (RESULT_ALIAS_MAP[candidateUpper]) return RESULT_ALIAS_MAP[candidateUpper];
  }

  switch (normalized4) {
    case "ERMS":
      return "ERMS";
    case "ERMF":
      return "ERMF";
    case "EROS":
      return "EROS";
    case "EROF":
      return "EROF";
    case "PRMS":
      return "PROS_PASSIVE";
    case "PRMF":
      return "PRMF";
    case "PROS":
    case "PROF":
      return "PROS";
    case "ECMS":
      return "ECMS";
    case "ECMF":
      return "ECMF";
    case "ECOS":
    case "ECOF":
      return "ECOS";
    case "PCOS":
      return "PCOS";
    case "PCMS":
      return "PCOF";
    case "PCMF":
      return "PCMF";
    case "PCOF":
      return "PCOF";
    default:
      return "DEFAULT";
  }
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
  axes: {
    name: string;
    left: string;
    right: string;
    leftValue: number;
    rightValue: number;
  }[];
  axisNarratives: { title: string; body: string }[];
}) {
  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8" />
<title>학습성향 리포트</title>
<style>
body{margin:0;font-family:'Pretendard',Arial;background:#f1f5f9;color:#0f172a}
.page{max-width:900px;margin:0 auto;padding:40px}
.cover{background:linear-gradient(135deg, ${report.color}, #0f172a);color:white;border-radius:28px;padding:40px}
.cover h1{font-size:36px;margin:0}
.cover p{opacity:0.9;margin-top:10px}
.card{background:white;border-radius:20px;padding:24px;margin-top:20px;box-shadow:0 10px 30px rgba(0,0,0,0.08)}
h2{margin:0 0 10px;font-size:18px}
.text{line-height:1.8;font-size:14px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.item{background:#f8fafc;border-radius:12px;padding:12px}
.axis{margin-top:10px}
.footer{text-align:center;margin-top:30px;font-size:12px;color:#64748b}
</style>
</head>
<body>
<div class="page">
<div class="cover">
<h1>${escapeHtml(report.title)}</h1>
<p>${escapeHtml(report.subtitle)} · ${escapeHtml(resultCode)}</p>
</div>

<div class="card">
<h2>학생 정보</h2>
<div class="grid">
<div class="item">이름: ${escapeHtml(student.name || "-")}</div>
<div class="item">학년: ${escapeHtml(student.grade || "-")}</div>
<div class="item">학교: ${escapeHtml(student.school || "-")}</div>
<div class="item">전화: ${escapeHtml(student.phone || "-")}</div>
</div>
</div>

<div class="card"><h2>핵심 설명</h2><div class="text">${escapeHtml(report.summary)}</div></div>
<div class="card"><h2>학습 전략</h2><div class="text">${escapeHtml(report.strategy)}</div></div>
<div class="card"><h2>부모 코칭</h2><div class="text">${escapeHtml(report.parent)}</div></div>
<div class="card"><h2>진로 방향</h2><div class="text">${escapeHtml(report.path)}</div></div>
<div class="card"><h2>주의 패턴</h2><div class="text">${escapeHtml(report.danger)}</div></div>
<div class="card"><h2>대화 제안</h2><div class="text">${escapeHtml(report.talk)}</div></div>

<div class="card">
<h2>축 분석</h2>
${axes
  .map((a) => {
    const leftPercent = a.leftValue * 20;
    const rightPercent = a.rightValue * 20;
    return `
    <div class="axis">
      <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:6px">
        <span>${escapeHtml(a.left)} (${a.leftValue})</span>
        <span>${escapeHtml(a.name)}</span>
        <span>${escapeHtml(a.right)} (${a.rightValue})</span>
      </div>
      <div style="display:flex;height:10px;background:#e2e8f0;border-radius:999px;overflow:hidden">
        <div style="width:${leftPercent}%;background:#94a3b8"></div>
        <div style="width:${rightPercent}%;background:${report.color}"></div>
      </div>
    </div>
    `;
  })
  .join("")}
</div>

<div class="card">
<h2>축별 해석</h2>
${axisNarratives
  .map(
    (item) => `
  <div class="item" style="margin-top:10px">
    <div style="font-weight:700;margin-bottom:6px">${escapeHtml(item.title)}</div>
    <div class="text">${escapeHtml(item.body)}</div>
  </div>
`
  )
  .join("")}
</div>

<div class="footer">학습성향검사 리포트 ©</div>
</div>
</body>
</html>`;
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
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-[36px] border border-white/70 bg-white/90 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-12">
        <span className="inline-flex rounded-full bg-indigo-100 px-4 py-1 text-sm font-black text-indigo-700">
          학생 중심 · 학부모 신뢰형 리포트
        </span>
        <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-900 sm:text-6xl">학습성향검사</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
          학생의 학습 태도와 사고 방식, 실행 습관을 바탕으로 가장 가까운 학습성향을 분석합니다.
          결과는 유형 해설, 학습 전략, 부모 코칭, 진로 방향까지 포함된 리포트로 제공됩니다.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="font-black">문항 수</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">총 {QUESTIONS.length}문항의 2지선다 검사</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="font-black">분석 축</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">E/P · R/C · M/O · S/F 4축 기반</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="font-black">결과 형식</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">유형명 + 축 분석 + 인쇄용 리포트</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onStart}
          className="mt-10 rounded-full bg-slate-900 px-7 py-4 text-base font-black text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
        >
          검사 시작하기
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

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-[32px] border border-white/70 bg-white/90 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-sm font-black tracking-[0.16em] text-indigo-600">
              QUESTION {currentIndex + 1} / {QUESTIONS.length}
            </div>
            <h2 className="mt-2 text-3xl font-black leading-tight text-slate-900">{question}</h2>
          </div>
        </div>

        <ProgressBar current={currentIndex + 1} total={QUESTIONS.length} color="#4f46e5" />

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {CHOICES.map((choice) => {
            const active = currentAnswer === choice.value;
            return (
              <button
                key={choice.label}
                type="button"
                onClick={() => onAnswer(choice.value)}
                className={`rounded-[28px] border px-6 py-6 text-left transition ${
                  active
                    ? "border-slate-900 bg-slate-900 text-white shadow-xl"
                    : "border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="text-xl font-black">{choice.label}</div>
                <div className={`mt-2 text-sm ${active ? "text-slate-200" : "text-slate-500"}`}>
                  {choice.value === 1 ? "해당 문항에 동의합니다." : "해당 문항에 동의하지 않습니다."}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex items-center justify-between gap-3">
          <button type="button" onClick={onPrev} className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700">
            이전
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={currentAnswer === -1}
            className="rounded-full bg-slate-900 px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {currentIndex === QUESTIONS.length - 1 ? "결과 보기" : "다음"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ResultScreen({
  student,
  scores,
  resolved,
  report,
  onRestart,
}: {
  student: StudentInfo;
  scores: Record<string, number>;
  resolved: ResolvedResult;
  report: Report;
  onRestart: () => void;
}) {
  const character = CHARACTER_META[resolved.key] || CHARACTER_META.DEFAULT;

  const axes = [
    { name: "내향·외향", left: "내향", right: "외향", ...toFiveScalePair(scores.E, scores.P) },
    { name: "논리·창의", left: "논리", right: "창의", ...toFiveScalePair(scores.R, scores.C) },
    { name: "모범·자율", left: "모범", right: "자율", ...toFiveScalePair(scores.M, scores.O) },
    { name: "안정·도전", left: "안정", right: "도전", ...toFiveScalePair(scores.S, scores.F) },
  ];

  const axisNarratives = generateAxisNarratives(scores);
  const printableHtml = generatePrintableReport({
    report,
    resultCode: resolved.fullCode,
    student,
    axes,
    axisNarratives,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
        <div className="grid gap-6">
          <section className="relative overflow-hidden rounded-[32px] border border-white/70 bg-white/90 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className={`absolute inset-0 bg-gradient-to-br ${character.aura}`} />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-black text-slate-700 shadow-sm">
                <span>{character.emoji}</span>
                <span>{character.label}</span>
              </div>
              <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">{report.title}</h1>
              <p className="mt-3 text-lg font-bold text-slate-600">{report.subtitle}</p>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-700">{character.tagline}</p>
              <div className="mt-6 flex flex-wrap gap-3 text-sm font-black text-slate-600">
                <span className="rounded-full bg-white/80 px-4 py-2 shadow-sm">결과코드 {resolved.code}</span>
                <span className="rounded-full bg-white/80 px-4 py-2 shadow-sm">차이값 {resolved.diffText}</span>
                <span className="rounded-full bg-white/80 px-4 py-2 shadow-sm">학생 {student.name || "미입력"}</span>
              </div>
            </div>
          </section>

          <SectionCard title="축 분석" desc="네 가지 축에서 현재 응답의 균형을 확인해 보세요." accentColor={report.color}>
            <AxisBars scores={scores} />
          </SectionCard>
        </div>

        <div className="grid gap-6">
          <SectionCard title="결과 해석" desc="유형 설명과 실제 적용 방향을 함께 확인해 보세요." accentColor={report.color}>
            <div className="grid gap-4">
              <InfoItem title="이름" value={student.name} />
              <InfoItem title="학년" value={student.grade} />
              <InfoItem title="학교" value={student.school} />
              <InfoItem title="전화번호" value={student.phone} />
              <InfoItem title="유형명" value={`${report.title} · ${report.subtitle}`} />
              <InfoItem title="핵심 설명" value={report.summary} />
              <InfoItem title="학습 전략" value={report.strategy} />
              <InfoItem title="부모 코칭" value={report.parent} />
              <InfoItem title="진로 방향" value={report.path} />
              <InfoItem title="주의 패턴" value={report.danger} />
              <InfoItem title="대화 제안" value={report.talk} />
            </div>
          </SectionCard>

          <SectionCard title="축별 해석" desc="축 점수를 실제 지도 문장으로 풀어낸 자동 해석입니다." accentColor={report.color}>
            <div className="grid gap-4">
              {axisNarratives.map((item) => (
                <InfoItem key={item.title} title={item.title} value={item.body} />
              ))}
            </div>
          </SectionCard>

          <SectionCard title="활용하기" desc="출력하거나 다시 검사할 수 있어요." accentColor={report.color}>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => printReport(printableHtml)}
                className="rounded-full px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5"
                style={{ background: `linear-gradient(135deg, ${report.color} 0%, #0f172a 100%)` }}
              >
                PDF / 인쇄하기
              </button>
              <button
                type="button"
                onClick={onRestart}
                className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
              >
                처음부터 다시하기
              </button>
            </div>
          </SectionCard>
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
        await saveSubmissionToApi({
          student,
          answers,
          resultKey: resolved.key,
          resultCode: resolved.fullCode,
          reportTitle: report.title,
          scores,
        });

        if (!cancelled) {
          setHasSavedResult(true);
        }
      } catch (error) {
        console.error("결과 저장 실패:", error);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [step, hasSavedResult, isComplete, student, answers, resolved, report, scores]);

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
      moveSafely(() => setStep("result"));
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