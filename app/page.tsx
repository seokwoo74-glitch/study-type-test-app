"use client";

import { useMemo, useState, type ReactNode } from "react";

type Step = "landing" | "test" | "result";

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

type AxisProfile = {
  social: number;
  judgment: number;
  track: number;
  style: number;
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
  image?: string;
  aura: string;
};

type PromptMeta = {
  base: string;
  detail: string;
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
  { O: 1 },
  { O: 5 },
  { E: 5 },
  { S: 3 },
  { C: 5 },
  { M: 5 },
  { F: 5 },
  { F: 5 },
  { E: 3 },
  { C: 5 },
  { S: 3 },
  { F: 5 },
  { E: 5 },
  { P: 5 },
  { C: 5 },
  { R: 5 },
  { R: 3 },
  { S: 5 },
  { R: 3 },
  { R: 1 },
  { O: 5 },
  { O: 5 },
  { S: 5 },
  { R: 5 },
  { R: 5 },
  { C: 5 },
  { C: 1 },
  { M: 5 },
  { P: 5 },
  { C: 3 },
  { O: 5 },
  { E: 5 },
  { O: 3 },
  { C: 5 },
  { C: 3 },
  { M: 3 },
  { M: 1 },
  { M: 5 },
  { P: 3 },
  { R: 5 },
  { C: 5 },
  { M: 5 },
  { M: 5 },
  { O: 5 },
  { P: 3 },
  { R: 5 },
  { M: 5 },
  { M: 3 },
  { M: 3 },
  { O: 3 },
  { O: 5 },
  { F: 5 },
  { F: 1 },
  { E: 3 },
  { R: 5 },
  { C: 3 },
  { M: 5 },
  { O: 5 },
  { E: 5 },
  { E: 3 },
  { P: 5 },
  { O: 5 },
  { O: 3 },
  { E: 5 },
  { P: 5 },
  { S: 5 },
  { R: 3 },
  { S: 5 },
  { E: 3 },
  { O: 3 },
  { S: 3 },
  { S: 3 },
  { F: 5 },
  { P: 3 },
  { P: 3 },
  { F: 5 },
  { F: 3 },
  { P: 5 },
  { M: 3 },
  { F: 3 },
];

const CHOICES = [
  { label: "그렇다", value: 1 },
  { label: "아니다", value: 0 },
];

const RESULT_DB: Record<string, Report> = {
  ERMS: {
    title: "이과 창의적영재형",
    subtitle: "1% 미만",
    summary:
      "이과적 두뇌와 창의적 사고가 매우 뛰어나며, 상위권을 넘어 특출한 성취 가능성을 지닌 유형입니다.",
    strategy:
      "자기주도성이 강하므로 학생의 의견을 중심으로 학습 방향을 설계하되, 내신·대회·전형 정보를 균형 있게 관리하는 것이 좋습니다. 선행·심화 학습과 결과물 중심 활동이 잘 맞습니다.",
    parent:
      "통제보다 신뢰와 지원이 효과적입니다. 일반적인 학습 환경보다 수준이 맞는 집단에서 더 크게 성장할 가능성이 높습니다.",
    path: "서울대, 카이스트, 포항공대, 의학·공학·자연과학 계열과 잘 맞습니다.",
    danger:
      "개인적 특성이 강해 일반적인 학습 분위기와 맞지 않을 수 있으며, 맞지 않는 환경에서는 흥미가 크게 떨어질 수 있습니다.",
    talk: "‘왜 그렇게 생각했는지 설명해볼래?’처럼 사고를 확장시키는 질문형 대화가 효과적입니다.",
    color: "#2563eb",
  },
  ERMF: {
    title: "이과 영재형",
    subtitle: "3% 미만",
    summary:
      "특정 과목에서 매우 높은 성취 가능성을 보이며, 관심 분야에서는 압도적 몰입을 보일 수 있는 유형입니다.",
    strategy:
      "관심 과목의 강점을 유지하면서도 시작한 일을 성과물로 연결할 수 있도록 고른 학습과 마무리 습관을 함께 설계하는 것이 중요합니다.",
    parent:
      "흥미 중심의 몰입이 강한 유형이므로 균형 잡힌 스펙 관리와 학습 리듬 유지에 도움을 주는 것이 좋습니다.",
    path: "수학, 물리, 전자, 발명, IT·연구 계열과 잘 맞습니다.",
    danger: "흥미가 넓고 시작이 빠른 만큼, 마무리와 꾸준함이 약해지면 성과가 불안정해질 수 있습니다.",
    talk: "‘잘하는 걸 살리면서, 끝까지 연결되는 경험을 같이 만들어보자’는 접근이 효과적입니다.",
    color: "#0f766e",
  },
  eROS: {
    title: "이과모범형",
    subtitle: "4%~10% 미만",
    summary: "이과 성향과 자기관리 능력이 함께 강한 유형으로, 안정적인 상위권 전략이 잘 맞습니다.",
    strategy:
      "내신과 모의고사를 고르게 관리하며, 시험 불안과 외부 활동으로 인한 리듬 흔들림만 잘 조절하면 강점을 꾸준히 유지할 수 있습니다.",
    parent:
      "학생의 학습 방식을 존중해도 무난하지만, 친구 관계나 외부 활동이 학습 흐름을 방해하지 않도록 점검이 필요합니다.",
    path: "SKY, 의·치·한의대, 자연과학, 공학, 수의학 계열과 잘 맞습니다.",
    danger: "적극적인 성향 때문에 학습보다 관계와 활동에 에너지가 분산될 수 있습니다.",
    talk:
      "‘지금의 리듬만 잘 지키면 충분히 좋은 결과로 이어질 수 있어’라는 식의 안정감 있는 대화가 좋습니다.",
    color: "#0891b2",
  },
  pROS: {
    title: "(수동적) 이과 모범형",
    subtitle: "4%~10% 미만",
    summary: "성실함과 인내심을 바탕으로 상위권을 안정적으로 유지하는 유형입니다.",
    strategy:
      "개념 정리와 실수 관리, 시험 불안 조절이 중요하며, 보다 적극적인 활동 경험과 리더십 기회를 함께 쌓으면 성장 폭이 커집니다.",
    parent:
      "실력은 충분하지만 자기표현과 존재감이 약할 수 있으므로, 안정감을 해치지 않는 선에서 경험의 폭을 넓혀주는 것이 좋습니다.",
    path: "SKY, 지방의대, 자연과학, 공학, 수의학, 약학 계열과 잘 맞습니다.",
    danger: "실수 하나에 흔들리면 멘탈 영향이 큰 편이라, 쉬운 부분에서의 실수 관리가 중요합니다.",
    talk: "‘네가 차분히 쌓아온 힘이 크다, 이제 그 강점을 조금 더 드러내 보자’는 식의 대화가 좋습니다.",
    color: "#0284c7",
  },
  PRMf: {
    title: "이과 뺀질이형",
    subtitle: "20% 미만",
    summary:
      "수학·과학 등 특정 과목에서는 강점을 보이지만, 흥미 없는 과목은 쉽게 놓칠 수 있는 유형입니다.",
    strategy:
      "절대 학습시간 확보, 감독이 있는 환경, 선호 과목의 성과를 전체 학습 동기로 연결하는 구조가 필요합니다.",
    parent:
      "자유도가 큰 환경보다 책임감이 생기는 환경이 더 적합합니다. 결과물 중심 경험이 학습 전체를 끌어올리는 데 도움이 됩니다.",
    path: "이공계열, 논술·정시 전략, IT 분야 사업·연구·CEO 계열과 연결될 수 있습니다.",
    danger: "좋아하는 과목만 밀고 나가다 전체 성적의 균형이 무너질 수 있습니다.",
    talk: "‘짧게라도 좋으니, 끝까지 가는 힘을 같이 만들어보자’는 식의 대화가 좋습니다.",
    color: "#7c3aed",
  },
  EROF: {
    title: "외향적 이과뺀질형",
    subtitle: "20% 미만",
    summary:
      "관심 있는 과목에서는 번뜩이는 성과를 보이지만, 주변 환경의 영향을 크게 받는 유형입니다.",
    strategy:
      "통제적 환경, 선택과 집중, 소규모 팀 속 책임감 경험이 효과적이며, 관심 분야의 구체적 결과물이 전체 성적 향상에 시너지를 줄 수 있습니다.",
    parent:
      "환경에 따라 결과 차이가 커질 수 있어, 학습 공간과 함께하는 집단을 신중히 선택하는 것이 중요합니다.",
    path: "자유전공, 자연과학, 건축, IT 마케팅, 이공계 연구 계열과 잘 맞습니다.",
    danger: "많은 일을 시작하지만 끝맺음이 약해 성과가 분산될 수 있습니다.",
    talk: "‘환경을 잘 고르면 네 강점이 훨씬 크게 드러날 수 있어’라는 식의 코칭이 효과적입니다.",
    color: "#9333ea",
  },
  PROS: {
    title: "이과 잠재성장형",
    subtitle: "70% 내외",
    summary:
      "현재 강점이 선명하게 드러나지 않았더라도, 기초를 차분히 쌓을수록 성장 가능성이 커지는 유형입니다.",
    strategy:
      "선행보다 내신 중심으로 접근하고, 한 과목씩 성취 경험을 만드는 방식이 효과적입니다. 절대 시간보다 집중 시간을 늘리는 전략이 중요합니다.",
    parent:
      "비교보다 작은 성공 경험의 축적이 중요합니다. 선호 과목에서 자신감을 회복하게 하면 전체 학습에도 긍정적인 영향을 줄 수 있습니다.",
    path: "간호, 사범, 이과대학, 교사·간호사·물리치료사·약사 계열과 잘 맞습니다.",
    danger: "막연한 목표만 세우면 쉽게 지치거나 포기할 수 있어, 단계적 목표 설계가 필요합니다.",
    talk: "‘이번에는 이 한 가지를 끝내보자’처럼 작고 분명한 목표를 제시하는 대화가 효과적입니다.",
    color: "#ea580c",
  },
  ECMf: {
    title: "문과 창의적영재형",
    subtitle: "1% 미만",
    summary:
      "문과 성향의 창의성과 표현력이 매우 강하며, 차별화된 결과물을 만들 가능성이 높은 유형입니다.",
    strategy:
      "관심 분야의 심화 학습과 함께 특기·논술·대회·동아리 결과물을 꾸준히 쌓는 방식이 잘 맞습니다.",
    parent:
      "다름을 교정하려 하기보다, 개성과 창의성이 실제 성과로 연결되도록 구조를 만들어주는 것이 중요합니다.",
    path: "어문, 언론정보, 연극영화, 광고, 방송PD, 게임기획 계열과 잘 맞습니다.",
    danger: "산만함과 엉뚱함이 강점이 되기도 하지만, 실행 리듬이 무너지면 결과가 불안정해질 수 있습니다.",
    talk: "‘네 생각을 결과물로 보여줄 방법을 같이 찾아보자’는 접근이 좋습니다.",
    color: "#db2777",
  },
  ECMs: {
    title: "문과 모범형 영재형",
    subtitle: "2% 미만",
    summary:
      "전교권 수준의 안정된 성과와 자기관리 능력을 함께 갖춘 이상적인 문과 영재형입니다.",
    strategy:
      "학생 스스로도 잘 이끌어가는 편이므로 신뢰를 기반으로 하되, 선행·심화와 체력·멘탈 관리까지 함께 챙기면 완성도가 높아집니다.",
    parent:
      "과한 개입보다 신뢰와 점검이 적합합니다. 우수한 멘토와의 간헐적 코칭이 효과적일 수 있습니다.",
    path: "SKY, 한의대(문과), 경영·행정·신문방송·법조·외교관 계열과 잘 맞습니다.",
    danger: "완벽주의와 부담감이 누적될 경우 번아웃 위험이 있습니다.",
    talk: "‘지금도 충분히 잘 가고 있고, 네 속도를 믿는다’는 메시지가 중요합니다.",
    color: "#2563eb",
  },
  ECoS: {
    title: "내성적 문과영재형",
    subtitle: "3% 미만",
    summary: "언어·외국어 영역의 강점과 깊이 있는 사고를 함께 지닌 문과 상위권 유형입니다.",
    strategy:
      "심화·선행 학습과 토론·발표 기회를 함께 주되, 계획을 실제 행동으로 연결하는 실천 습관을 보완하는 것이 중요합니다.",
    parent:
      "조용하지만 수준이 높은 편입니다. 겉으로 드러나지 않는 실행 부족을 세심하게 관리해주면 크게 성장할 수 있습니다.",
    path: "SKY, 어문, 정치외교, 신문방송, 법조, 언론, 외교관 계열과 잘 맞습니다.",
    danger: "실력에 비해 실행력이 떨어지면 결과가 기대만큼 드러나지 않을 수 있습니다.",
    talk: "‘생각의 깊이는 충분하니, 이제 그걸 실천으로 연결해보자’는 식의 대화가 효과적입니다.",
    color: "#7c3aed",
  },
  pCOS: {
    title: "(내성적) 문과 모범형",
    subtitle: "4%~10% 미만",
    summary: "자기주도성과 계획 실행의 균형이 좋은 내성적 상위권 문과형입니다.",
    strategy: "내신 최상위권 유지, 시험 불안 관리, 개념 정리, 규칙적인 멘토링이 효과적입니다.",
    parent: "지나친 간섭보다 정기적인 대화와 점검이 적합합니다. 차분한 성향을 해치지 않는 방식이 좋습니다.",
    path: "SKY, 경영, 경제, 행정, 교대, 법조, 교수, 고위직 공무원 계열과 잘 맞습니다.",
    danger: "내성적 성향 때문에 도움 요청 시점을 놓칠 수 있습니다.",
    talk: "‘혼자 감당하지 말고, 막히는 지점을 같이 보자’는 태도가 좋습니다.",
    color: "#0284c7",
  },
  eCOS: {
    title: "문과모범형B",
    subtitle: "4%~10% 미만",
    summary: "상위권 성적을 안정적으로 유지하면서 리더십과 대외 활동 역량도 함께 갖춘 유형입니다.",
    strategy: "내신 유지와 활동 경험을 균형 있게 관리하면 강점이 잘 살아납니다. 시험 불안 관리도 중요합니다.",
    parent: "학습 방식은 비교적 안정적이므로, 멘탈과 리듬 유지에 집중해서 도와주는 것이 좋습니다.",
    path: "SKY, 서·성·한, 정치외교, 경영, 신문방송, 기자, PD, 외교관, 정치인 계열과 잘 맞습니다.",
    danger: "관계와 활동 에너지가 큰 만큼, 자신의 학습 리듬이 흐트러질 수 있습니다.",
    talk: "‘리더십도 좋지만, 네 페이스를 먼저 지키는 게 중요해’라는 식의 대화가 효과적입니다.",
    color: "#059669",
  },
  PCMs: {
    title: "(외향적) 문과뺀질이형",
    subtitle: "20% 미만",
    summary: "관심 과목에서는 강점을 보이지만, 관계 에너지와 분위기의 영향을 크게 받는 유형입니다.",
    strategy: "관심 과목 결과물을 만들어 동기로 삼고, 균형 잡힌 과목 관리와 절대 학습시간 확보가 필요합니다.",
    parent: "분위기에 휩쓸리지 않도록 관리형 환경을 만들어 주는 것이 중요합니다. 말보다 행동 점검이 더 효과적입니다.",
    path: "신문방송, 정치, 호텔경영, PD, 엔터테인먼트, 통역, 여행 관련 분야와 잘 맞습니다.",
    danger: "자기통제가 약해질 경우 공부보다 관계와 분위기에 더 많은 에너지를 쓸 수 있습니다.",
    talk: "‘얼마나 했는지 숫자와 결과로 같이 확인해보자’는 방식이 좋습니다.",
    color: "#9333ea",
  },
  PCmF: {
    title: "(내향적) 문과 뺀질이",
    subtitle: "20% 미만",
    summary: "조용하지만 관심 분야에는 강하게 몰입하며, 학습 균형과 마무리 능력이 핵심인 유형입니다.",
    strategy:
      "통제적 환경, 절대 학습시간 확보, 관심 분야 성과물을 전체 성적 향상의 발판으로 활용하는 것이 중요합니다.",
    parent:
      "겉으로 드러나지 않아 방심하기 쉽지만, 조용히 흐트러질 수 있어 세심한 관찰과 점검이 필요합니다.",
    path: "자유전공, 철학, 애니메이션, 사학, 문헌정보, 방송·도서·창작 관련 분야와 잘 맞습니다.",
    danger: "시작은 하지만 끝맺음이 약해 성과로 연결되지 못할 수 있습니다.",
    talk: "‘조용히 잘하고 있는 것도 좋지만, 끝까지 간 걸 함께 확인하자’는 식의 대화가 좋습니다.",
    color: "#a21caf",
  },
  PCOF: {
    title: "문과 잠재성장형",
    subtitle: "70% 내외",
    summary:
      "현재 강점이 뚜렷하게 드러나지 않은 상태일 수 있지만, 차분한 기반 위에서 성장 가능성이 큰 유형입니다.",
    strategy:
      "선행보다 내신 중심 학습이 적합하며, 선호 과목에서 먼저 성취감을 만들고 단계적 목표를 통해 자신감을 회복하는 것이 중요합니다.",
    parent:
      "비교보다 성취 경험의 축적이 우선입니다. 작은 성공을 반복적으로 경험하게 해주는 것이 가장 효과적입니다.",
    path: "아동, 심리, 사범, 사회복지, 유치원교사, 상담, 교육 관련 계열과 잘 맞습니다.",
    danger: "구체적 목표 의식이 부족하면 막연한 계획만 세우고 쉽게 지칠 수 있습니다.",
    talk: "‘이번엔 어디까지 해냈는지 같이 확인하자’처럼 작고 구체적인 성취를 짚어주는 대화가 좋습니다.",
    color: "#ea580c",
  },
  ErMS: {
    title: "문·이과 혼합 영재형",
    subtitle: "4% 미만",
    summary: "문·이과 전 영역을 두루 소화할 수 있는 융합형 상위권 영재입니다.",
    strategy: "전 과목을 고르게 유지하면서도, 시작한 일을 결과물로 연결하는 훈련이 중요합니다.",
    parent:
      "산만함과 독특함을 약점으로 보기보다, 강점으로 연결될 수 있도록 마무리와 집중만 잘 도와주는 것이 좋습니다.",
    path: "자유전공, 국제통상, 통계, 건축, 행정, 외교, 한의학, 예술 융합 계열과 잘 맞습니다.",
    danger: "관심사가 넓어 선택과 집중이 흐려질 수 있습니다.",
    talk: "‘잘하는 게 많은 만큼, 우선순위를 같이 정해보자’는 식의 대화가 효과적입니다.",
    color: "#0f766e",
  },
  erOS: {
    title: "문·이과 혼합 모범형",
    subtitle: "10% 미만",
    summary: "문·이과를 모두 무난하게 해내며 실리적으로 성과를 쌓는 안정형 상위권입니다.",
    strategy: "내신, 활동, 시험 리듬을 균형 있게 유지하면 가장 효율적으로 성장할 수 있습니다.",
    parent: "적극적인 성향으로 인해 활동과 관계 에너지가 커질 수 있으니, 학습 리듬만 잘 잡아주면 좋습니다.",
    path: "사회과학, 경제, 자연과학, 한의학, 수의학, 통계, 공무원, 교사, 변호사 계열과 잘 맞습니다.",
    danger: "다 잘하려다 체력과 집중력이 먼저 떨어질 수 있습니다.",
    talk: "‘잘하고 있는 것 중 꼭 챙길 것만 남기자’는 식의 정리형 대화가 좋습니다.",
    color: "#0891b2",
  },
  PrmS: {
    title: "문·이과 혼합 수동적모범형",
    subtitle: "10% 미만",
    summary: "성실성과 안정감으로 꾸준한 상위권을 지키는 혼합형 학생입니다.",
    strategy: "개념 정리, 시험 불안 관리, 보다 적극적인 대외 활동 경험이 성장 포인트입니다.",
    parent: "실력은 있으나 자기주장이 약할 수 있어, 리더십과 발표 경험을 조금씩 쌓게 해주는 것이 좋습니다.",
    path: "경영, 경제, 응용통계, 회계, 간호, 교대, 약사, 공무원, 회계사, 작가 계열과 잘 맞습니다.",
    danger: "실력에 비해 존재감이 약해 기회를 놓칠 수 있습니다.",
    talk: "‘네가 해온 걸 드러내는 연습도 중요한 실력이다’라고 말해주는 것이 좋습니다.",
    color: "#0284c7",
  },
  PrMF: {
    title: "문·이과 혼합 뺀질이형",
    subtitle: "20% 미만",
    summary: "관심 과목만 잘하는 편차형이지만, 융합적 재능과 아이디어가 살아 있는 유형입니다.",
    strategy:
      "균형 잡힌 과목 관리, 감독이 있는 환경, 관심 분야 결과물을 전체 성적으로 연결하는 전략이 중요합니다.",
    parent:
      "통제적 환경과 마무리 점검이 필요합니다. 시작은 빠르지만 끝까지 가는 힘을 만들어주는 것이 핵심입니다.",
    path: "자유전공, 건축, 자연과학, 철학, 어문, 방송 관련 직종, 프리랜서 계열과 잘 맞습니다.",
    danger: "분야를 넘나드는 재능이 오히려 산만함으로 보일 수 있습니다.",
    talk: "‘재능은 충분하니, 이제 끝까지 연결하는 힘을 같이 만들자’는 식의 대화가 효과적입니다.",
    color: "#7c3aed",
  },
  PrOF: {
    title: "융합 잠재성장형",
    subtitle: "70% 내외",
    summary:
      "현재 특별히 두드러진 과목이 없더라도, 생활 속 훈련과 경험에 따라 성장 폭이 크게 달라질 수 있는 유형입니다.",
    strategy:
      "선행보다 내신 중심으로 접근하고, 선택과 집중을 통해 작은 성취 경험을 반복적으로 만드는 것이 중요합니다.",
    parent:
      "막연한 기대보다 단계적 목표가 필요합니다. 선호 과목에서 자신감을 얻으면 다른 과목으로도 확장될 가능성이 높습니다.",
    path: "심리, 사범, 사회복지, 건축, 간호, 식품영양, 의상, 상담·교육·영양 관련 분야와 잘 맞습니다.",
    danger: "구체적 목표가 없으면 쉽게 무기력해질 수 있어, 구조화된 루틴이 필요합니다.",
    talk: "‘오늘은 이 한 가지를 끝내보자’처럼 아주 작고 선명한 목표를 주는 대화가 효과적입니다.",
    color: "#ea580c",
  },
  DEFAULT: {
    title: "학습성향 분석 결과",
    subtitle: "기본 리포트",
    summary: "현재 입력된 응답을 바탕으로 가장 가까운 학습 성향으로 분류한 결과입니다.",
    strategy: "기본 학습 루틴을 먼저 안정화하고, 강점 과목을 중심으로 성취 경험을 늘리는 것이 좋습니다.",
    parent: "아이의 성향을 바꾸려 하기보다, 현재 방식에 맞는 환경과 전략을 함께 찾는 접근이 효과적입니다.",
    path: "상세 결과 DB 확장에 따라 더 정밀한 추천으로 연결될 수 있습니다.",
    danger: "강점이 선명하지 않을수록 비교의 영향을 더 크게 받을 수 있습니다.",
    talk: "‘네 방식에 맞는 방법을 같이 찾아가자’는 접근이 좋습니다.",
    color: "#475569",
  },
};

const CHARACTER_META: Record<string, CharacterMeta> = {
  ERMS: { label: "창의 연구자", tagline: "깊이 있는 탐구와 독창성이 빛나는 최상위 이과형", emoji: "🧠", image: "/characters/ERMS.png", aura: "from-blue-500/25 via-sky-400/10 to-cyan-300/20" },
  ERMF: { label: "몰입 발명가", tagline: "좋아하는 분야에 압도적으로 빠져드는 영재형", emoji: "⚡", image: "/characters/ERMF.png", aura: "from-teal-500/25 via-emerald-400/10 to-cyan-300/20" },
  eROS: { label: "엘리트 플래너", tagline: "성실함과 자기관리가 돋보이는 안정형 상위권", emoji: "📘", image: "/characters/eROS.png", aura: "from-sky-500/25 via-cyan-400/10 to-blue-300/20" },
  pROS: { label: "차분한 성취가", tagline: "묵직하게 쌓아 올리는 실속형 상위권", emoji: "🛡️", image: "/characters/pROS.png", aura: "from-cyan-500/25 via-sky-400/10 to-indigo-300/20" },
  PRMf: { label: "자유로운 문제해결사", tagline: "관심 분야에서 번뜩이는 재능을 터뜨리는 편차형", emoji: "🎯", image: "/characters/PRMf.png", aura: "from-violet-500/25 via-fuchsia-400/10 to-purple-300/20" },
  EROF: { label: "에너지 크리에이터", tagline: "사람과 환경 속에서 아이디어가 살아나는 활동형", emoji: "🚀", image: "/characters/EROF.png", aura: "from-purple-500/25 via-fuchsia-400/10 to-pink-300/20" },
  PROS: { label: "성장 새싹", tagline: "작은 성취를 쌓을수록 크게 성장하는 잠재형", emoji: "🌱", image: "/characters/PROS.png", aura: "from-orange-500/25 via-amber-400/10 to-yellow-300/20" },
  ECMf: { label: "감각 스토리텔러", tagline: "표현력과 창의성이 돋보이는 문과 창의형", emoji: "🎨", image: "/characters/ECMf.png", aura: "from-pink-500/25 via-rose-400/10 to-fuchsia-300/20" },
  ECMs: { label: "품격 있는 우등생", tagline: "안정성과 완성도를 동시에 갖춘 문과 영재형", emoji: "👑", image: "/characters/ECMs.png", aura: "from-blue-500/25 via-indigo-400/10 to-sky-300/20" },
  ECoS: { label: "깊이형 사색가", tagline: "조용하지만 강한 사고력과 언어 감각을 지닌 유형", emoji: "📚", image: "/characters/ECoS.png", aura: "from-violet-500/25 via-indigo-400/10 to-purple-300/20" },
  pCOS: { label: "정교한 실천가", tagline: "차분하고 정교하게 계획을 현실로 만드는 유형", emoji: "🧩", image: "/characters/pCOS.png", aura: "from-cyan-500/25 via-blue-400/10 to-slate-300/20" },
  eCOS: { label: "리더형 모범생", tagline: "성적과 대외 역량을 균형 있게 이끄는 유형", emoji: "🌟", image: "/characters/eCOS.png", aura: "from-emerald-500/25 via-teal-400/10 to-green-300/20" },
  PCMs: { label: "무드 드라이버", tagline: "분위기와 관계 에너지 속에서 움직이는 외향형", emoji: "🎤", image: "/characters/PCMs.png", aura: "from-purple-500/25 via-pink-400/10 to-fuchsia-300/20" },
  PCmF: { label: "조용한 몰입러", tagline: "겉은 조용하지만 좋아하는 일엔 강하게 빠지는 유형", emoji: "🌙", image: "/characters/PCmF.png", aura: "from-fuchsia-500/25 via-purple-400/10 to-violet-300/20" },
  PCOF: { label: "따뜻한 성장형", tagline: "작은 성공을 발판 삼아 천천히 커지는 문과 잠재형", emoji: "☀️", image: "/characters/PCOF.png", aura: "from-orange-500/25 via-yellow-400/10 to-amber-300/20" },
  ErMS: { label: "융합 설계자", tagline: "문·이과를 넘나드는 통합적 사고를 가진 융합형", emoji: "🧭", image: "/characters/ErMS.png", aura: "from-teal-500/25 via-sky-400/10 to-indigo-300/20" },
  erOS: { label: "균형 운영자", tagline: "실리와 균형을 바탕으로 안정적으로 성장하는 유형", emoji: "⚖️", image: "/characters/erOS.png", aura: "from-sky-500/25 via-teal-400/10 to-cyan-300/20" },
  PrmS: { label: "차곡차곡 성과형", tagline: "꾸준함으로 결과를 만들어내는 혼합 모범형", emoji: "🏅", image: "/characters/PrmS.png", aura: "from-blue-500/25 via-cyan-400/10 to-slate-300/20" },
  PrMF: { label: "융합 아이디어러", tagline: "재능은 넓고, 마무리 훈련이 중요한 융합 편차형", emoji: "💡", image: "/characters/PrMF.png", aura: "from-violet-500/25 via-indigo-400/10 to-fuchsia-300/20" },
  PrOF: { label: "가능성 탐험가", tagline: "생활 속 경험이 쌓일수록 잠재력이 열리는 성장형", emoji: "🌈", image: "/characters/PrOF.png", aura: "from-orange-500/25 via-amber-400/10 to-rose-300/20" },
  DEFAULT: { label: "성향 분석 캐릭터", tagline: "현재 응답을 바탕으로 가장 가까운 성향을 분석했어요.", emoji: "✨", image: "/characters/default.png", aura: "from-slate-500/25 via-slate-300/10 to-sky-300/20" },
};

const CHARACTER_PROMPTS: Record<string, PromptMeta> = {
  ERMS: { base: "cute but premium Korean educational character, clean background, soft lighting, high detail, 2D illustration, modern animation style, character centered, no text, white or gradient background", detail: "genius young scientist student, slightly messy hair, holding glowing formula hologram, confident eyes, blue tone, futuristic lab vibe" },
  ERMF: { base: "cute but premium Korean educational character, clean background, soft lighting, high detail, 2D illustration, modern animation style, character centered, no text, white or gradient background", detail: "focused student deeply immersed in experiment, sparks of light around, intense eyes, teal color theme, innovation energy" },
  eROS: { base: "cute but premium Korean educational character, clean background, soft lighting, high detail, 2D illustration, modern animation style, character centered, no text, white or gradient background", detail: "organized top student with neat uniform, holding planner and books, calm smile, sky blue theme, clean and reliable mood" },
  pROS: { base: "cute but premium Korean educational character, clean background, soft lighting, high detail, 2D illustration, modern animation style, character centered, no text, white or gradient background", detail: "quiet diligent student, tidy desk, slightly shy expression, soft blue tone, calm and stable personality" },
  PRMf: { base: "cute but premium Korean educational character, clean background, soft lighting, high detail, 2D illustration, modern animation style, character centered, no text, white or gradient background", detail: "smart but relaxed student, hoodie style, holding math notebook casually, playful confident smile, purple tone" },
  EROF: { base: "cute but premium Korean educational character, clean background, soft lighting, high detail, 2D illustration, modern animation style, character centered, no text, white or gradient background", detail: "energetic outgoing student, dynamic pose, pointing forward, bright purple pink gradient, charismatic vibe" },
  PROS: { base: "cute but premium Korean educational character, clean background, soft lighting, high detail, 2D illustration, modern animation style, character centered, no text, white or gradient background", detail: "young student with small glowing seed in hands, hopeful expression, warm orange light, growth concept" },
  ECMf: { base: "cute but premium Korean educational character, clean background, soft lighting, high detail, 2D illustration, modern animation style, character centered, no text, white or gradient background", detail: "artistic student holding notebook and pen, dreamy expression, pink tone, creative aura around" },
  ECMs: { base: "cute but premium Korean educational character, clean background, soft lighting, high detail, 2D illustration, modern animation style, character centered, no text, white or gradient background", detail: "elegant top student, confident posture, holding book, royal blue tone, intelligent and composed" },
  ECoS: { base: "cute but premium Korean educational character, clean background, soft lighting, high detail, 2D illustration, modern animation style, character centered, no text, white or gradient background", detail: "quiet deep thinker student reading book, soft purple tone, calm and intellectual mood" },
  pCOS: { base: "cute but premium Korean educational character, clean background, soft lighting, high detail, 2D illustration, modern animation style, character centered, no text, white or gradient background", detail: "organized quiet student writing notes carefully, gentle blue tone, precise and thoughtful" },
  eCOS: { base: "cute but premium Korean educational character, clean background, soft lighting, high detail, 2D illustration, modern animation style, character centered, no text, white or gradient background", detail: "bright and confident student leader, smiling, slightly extroverted, green tone, balanced personality" },
  PCMs: { base: "cute but premium Korean educational character, clean background, soft lighting, high detail, 2D illustration, modern animation style, character centered, no text, white or gradient background", detail: "expressive student speaking or presenting, lively expression, pink-purple tone, social energy" },
  PCmF: { base: "cute but premium Korean educational character, clean background, soft lighting, high detail, 2D illustration, modern animation style, character centered, no text, white or gradient background", detail: "quiet creative student with headphones, relaxed pose, violet tone, introverted but unique vibe" },
  PCOF: { base: "cute but premium Korean educational character, clean background, soft lighting, high detail, 2D illustration, modern animation style, character centered, no text, white or gradient background", detail: "warm and kind student, soft sunlight glow, yellow tone, gentle growth concept" },
  ErMS: { base: "cute but premium Korean educational character, clean background, soft lighting, high detail, 2D illustration, modern animation style, character centered, no text, white or gradient background", detail: "balanced genius student, half science half art elements around, teal tone, dual intelligence" },
  erOS: { base: "cute but premium Korean educational character, clean background, soft lighting, high detail, 2D illustration, modern animation style, character centered, no text, white or gradient background", detail: "balanced and practical student, holding books and tablet, calm expression, blue green tone" },
  PrmS: { base: "cute but premium Korean educational character, clean background, soft lighting, high detail, 2D illustration, modern animation style, character centered, no text, white or gradient background", detail: "steady hardworking student, holding notebook tightly, humble smile, soft blue tone" },
  PrMF: { base: "cute but premium Korean educational character, clean background, soft lighting, high detail, 2D illustration, modern animation style, character centered, no text, white or gradient background", detail: "creative flexible student with light bulb idea, relaxed posture, purple blue tone, clever vibe" },
  PrOF: { base: "cute but premium Korean educational character, clean background, soft lighting, high detail, 2D illustration, modern animation style, character centered, no text, white or gradient background", detail: "student looking at rainbow light, curious expression, soft orange pink gradient, growth and exploration" },
  DEFAULT: { base: "cute but premium Korean educational character, clean background, soft lighting, high detail, 2D illustration, modern animation style, character centered, no text, white or gradient background", detail: "smart Korean student character, warm smile, clean white gradient background, premium educational app mascot" },
};

const CODE_TO_RESULT_KEY: Record<string, string> = {
  ERMS: "ERMS",
  ERMs: "ERMS",
  eRMS: "ERMS",

  ERMF: "ERMF",
  ERMf: "ERMF",
  ERmF: "ERMF",
  ERmf: "ERMF",
  eRMF: "ERMF",
  eRMf: "ERMF",

  eROS: "eROS",
  eRoS: "eROS",
  EROS: "eROS",
  EROs: "eROS",
  ERoS: "eROS",
  ERos: "eROS",

  pROS: "pROS",
  pRoS: "pROS",
  pRMS: "pROS",
  pRmS: "pROS",

  PRMF: "PRMf",
  PRMf: "PRMf",
  PRmF: "PRMf",
  PRmf: "PRMf",
  PRMs: "PRMf",
  pRMs: "PRMf",
  pRMF: "PRMf",
  pRMf: "PRMf",
  pRmF: "PRMf",
  pRmf: "PRMf",
  pRoF: "PRMf",

  EROF: "EROF",
  ERoF: "EROF",
  ERof: "EROF",
  eROF: "EROF",
  eROf: "EROF",
  eRoF: "EROF",
  eRof: "EROF",
  eRmf: "EROF",

  PROF: "PROS",
  PROf: "PROS",
  PROS: "PROS",
  PROs: "PROS",
  PRoF: "PROS",
  PRof: "PROS",
  PRoS: "PROS",
  PRos: "PROS",
  PRMS: "PROS",
  PRmS: "PROS",
  PRms: "PROS",
  pROF: "PROS",
  pROf: "PROS",
  pROs: "PROS",
  pRos: "PROS",
  pRof: "PROS",
  pRms: "PROS",
  eROs: "PROS",
  eRos: "PROS",

  ECMF: "ECMf",
  ECMf: "ECMf",

  ECMS: "ECMs",
  eCMS: "ECMs",

  ECOS: "ECoS",
  ECOs: "ECoS",
  ECoS: "ECoS",
  ECos: "ECoS",
  ECmS: "ECoS",
  ECms: "ECoS",
  eCmS: "ECoS",
  eCms: "ECoS",
  pCMS: "ECoS",
  ECoF: "ECoS",
  ECmf: "ECoS",
  ECMs: "ECoS",
  eCMs: "ECoS",

  pCOS: "pCOS",
  pCoS: "pCOS",
  pCmS: "pCOS",

  eCoS: "eCOS",
  eCos: "eCOS",
  eCOS: "eCOS",
  ECOf: "eCOS",

  PCMF: "PCMs",
  PCMf: "PCMs",
  pCMF: "PCMs",
  pCMf: "PCMs",
  pCMs: "PCMs",
  ECmF: "PCMs",
  ECOF: "PCMs",
  ECof: "PCMs",
  eCOF: "PCMs",
  eCOf: "PCMs",
  eCoF: "PCMs",
  eCof: "PCMs",

  PCmF: "PCmF",
  PCmf: "PCmF",
  PCms: "PCmF",
  pCmF: "PCmF",
  pCmf: "PCmF",
  PCoF: "PCmF",
  PCof: "PCmF",
  pCoF: "PCmF",

  PCOF: "PCOF",
  PCOf: "PCOF",
  PCOS: "PCOF",
  PCOs: "PCOF",
  PCoS: "PCOF",
  PCos: "PCOF",
  PCMS: "PCOF",
  PCmS: "PCOF",
  pCOF: "PCOF",
  pCOf: "PCOF",
  pCOs: "PCOF",
  pCos: "PCOF",
  pCms: "PCOF",
  pCof: "PCOF",
  eCOs: "PCOF",

  ErMS: "ErMS",
  ErMs: "ErMS",
  EcMS: "ErMS",
  EcMs: "ErMS",
  erMS: "ErMS",
  ecMS: "ErMS",
  ErMF: "ErMS",
  ErMf: "ErMS",
  ErmF: "ErMS",
  Ermf: "ErMS",
  EcMF: "ErMS",
  EcMf: "ErMS",
  EcmF: "ErMS",
  Ecmf: "ErMS",
  erMF: "ErMS",
  erMf: "ErMS",
  ecMF: "ErMS",
  ecMf: "ErMS",

  ErOS: "erOS",
  ErOs: "erOS",
  EroS: "erOS",
  Eros: "erOS",
  EcOS: "erOS",
  EcOs: "erOS",
  EcoS: "erOS",
  Ecos: "erOS",
  erOS: "erOS",
  eroS: "erOS",
  ecOS: "erOS",
  ecoS: "erOS",
  ErmS: "erOS",
  Erms: "erOS",
  ermS: "erOS",
  erms: "erOS",
  EcmS: "erOS",
  Ecms: "erOS",
  ecmS: "erOS",
  ecms: "erOS",
  ErOf: "erOS",
  EcOf: "erOS",

  PrMS: "PrmS",
  PrmS: "PrmS",
  Prms: "PrmS",
  prMS: "PrmS",

  PrMF: "PrMF",
  PrMf: "PrMF",
  PrmF: "PrMF",
  Prmf: "PrMF",

  PrOF: "PrOF",
  PrOf: "PrOF",
  ProF: "PrOF",
  Prof: "PrOF",
  prOF: "PrOF",
  prOf: "PrOF",
  proF: "PrOF",
  prof: "PrOF",
  erOF: "PrOF",
  erOf: "PrOF",
  eroF: "PrOF",
  erof: "PrOF",
};

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

function getAxisProfile(scores: Record<string, number>): AxisProfile {
  return {
    social: normalizeAxis(scores.P, scores.E),
    judgment: normalizeAxis(scores.R, scores.C),
    track: normalizeAxis(scores.M, scores.O),
    style: normalizeAxis(scores.F, scores.S),
  };
}

function scoreLabel(value: number) {
  if (value >= 4.5) return "매우 높음";
  if (value >= 3.5) return "높음";
  if (value >= 2.5) return "보통";
  return "낮음";
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

  const formatLetter = (letter: string, diff: number) =>
    diff <= 1 ? letter.toLowerCase() : letter.toUpperCase();

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

function resolveResult(scores: Record<string, number>): ResolvedResult {
  const display = buildDisplayCode(scores);
  const key = CODE_TO_RESULT_KEY[display.code] || "DEFAULT";

  return {
    key,
    code: display.code,
    diffText: display.diffText,
    fullCode: display.full,
  };
}

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

function toFiveScalePair(left: number, right: number) {
  const total = left + right;
  if (total === 0) {
    return { leftValue: 2.5, rightValue: 2.5 };
  }

  const leftValue = (left / total) * 5;
  const rightValue = (right / total) * 5;

  return {
    leftValue: Number(leftValue.toFixed(1)),
    rightValue: Number(rightValue.toFixed(1)),
  };
}

function getCharacterPrompt(resultKey: string) {
  const prompt = CHARACTER_PROMPTS[resultKey] || CHARACTER_PROMPTS.DEFAULT;
  return `${prompt.base}, ${prompt.detail}`;
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    window.alert("복사됐어요.");
  } catch {
    window.alert("복사에 실패했어요. 직접 선택해서 복사해 주세요.");
  }
}

function generatePrintableReport({
  report,
  resultCode,
  axes,
}: {
  report: Report;
  resultCode: string;
  axes: {
    name: string;
    left: string;
    right: string;
    leftValue: number;
    rightValue: number;
  }[];
}) {
  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  return `
    <!doctype html>
    <html lang="ko">
      <head>
        <meta charset="utf-8" />
        <title>학습성향 리포트</title>
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            font-family: Arial, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif;
            background: #f8fafc;
            color: #0f172a;
          }
          .wrap {
            max-width: 980px;
            margin: 0 auto;
            padding: 32px 24px 56px;
          }
          .hero {
            border-radius: 28px;
            padding: 32px;
            color: white;
            background: linear-gradient(135deg, ${report.color} 0%, #0f172a 85%);
          }
          .badge {
            display: inline-block;
            padding: 8px 14px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 800;
            letter-spacing: .14em;
            background: rgba(255,255,255,.14);
            margin-right: 8px;
          }
          h1,h2,h3,p { margin: 0; }
          .title { font-size: 34px; font-weight: 900; margin-top: 18px; }
          .subtitle { font-size: 16px; opacity: .9; margin-top: 8px; }
          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 18px;
            margin-top: 22px;
          }
          .card {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 22px;
            padding: 20px;
            margin-top: 18px;
          }
          .card h3 {
            font-size: 14px;
            letter-spacing: .16em;
            color: #64748b;
            margin-bottom: 10px;
          }
          .card p {
            font-size: 15px;
            line-height: 1.8;
            color: #334155;
          }
          .axis-row {
            margin-bottom: 18px;
          }
          .axis-head {
            display: flex;
            justify-content: space-between;
            font-size: 14px;
            font-weight: 700;
            margin-bottom: 8px;
          }
          .bar {
            height: 12px;
            border-radius: 999px;
            overflow: hidden;
            background: #e2e8f0;
            display: flex;
          }
          .left {
            background: linear-gradient(90deg, #cbd5e1 0%, ${report.color} 100%);
          }
          .right {
            background: linear-gradient(90deg, ${report.color} 0%, #0f172a 100%);
          }
          @media print {
            body { background: white; }
            .wrap { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="wrap">
          <div class="hero">
            <div>
              <span class="badge">LEARNING REPORT</span>
              <span class="badge">${escapeHtml(resultCode)}</span>
            </div>
            <div class="title">${escapeHtml(report.title)}</div>
            <div class="subtitle">${escapeHtml(report.subtitle)}</div>
            <p style="margin-top:18px; line-height:1.9; font-size:15px; opacity:.94;">
              ${escapeHtml(report.summary)}
            </p>
          </div>

          <div class="grid">
            <div class="card">
              <h3>학습 전략</h3>
              <p>${escapeHtml(report.strategy)}</p>
            </div>
            <div class="card">
              <h3>부모 코칭 포인트</h3>
              <p>${escapeHtml(report.parent)}</p>
            </div>
            <div class="card">
              <h3>진로 방향</h3>
              <p>${escapeHtml(report.path)}</p>
            </div>
            <div class="card">
              <h3>주의할 패턴</h3>
              <p>${escapeHtml(report.danger)}</p>
            </div>
          </div>

          <div class="card">
            <h3>핵심 축 분석</h3>
            ${axes
              .map((axis) => {
                const total = axis.leftValue + axis.rightValue || 5;
                const leftPct = `${(axis.leftValue / total) * 100}%`;
                const rightPct = `${(axis.rightValue / total) * 100}%`;
                return `
                  <div class="axis-row">
                    <div class="axis-head">
                      <span>${escapeHtml(axis.name)} · ${escapeHtml(axis.left)}</span>
                      <span>${escapeHtml(axis.right)}</span>
                    </div>
                    <div class="bar">
                      <div class="left" style="width:${leftPct}"></div>
                      <div class="right" style="width:${rightPct}"></div>
                    </div>
                  </div>
                `;
              })
              .join("")}
          </div>

          <div class="card">
            <h3>대화 제안</h3>
            <p>${escapeHtml(report.talk)}</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function printReport(html: string) {
  const win = window.open("", "_blank", "width=1100,height=900");
  if (!win) {
    window.alert("팝업이 차단되어 있어요. 팝업 허용 후 다시 시도해 주세요.");
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
  }, 250);
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#f8fafc_44%,#eef2ff_100%)] text-slate-900">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </div>
    </main>
  );
}

function HeroBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-extrabold tracking-[0.16em] text-white/85 backdrop-blur">
      {children}
    </span>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-3 overflow-hidden rounded-full bg-slate-200">
      <div
        className="h-full rounded-full bg-gradient-to-r from-sky-500 to-slate-900 transition-all duration-300"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function ChoiceButton({
  label,
  active,
  onClick,
  disabled = false,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-[24px] border px-5 py-5 text-left transition-all ${
        active
          ? "border-slate-900 bg-slate-900 text-white shadow-[0_18px_40px_rgba(15,23,42,0.22)]"
          : "border-slate-200 bg-white text-slate-800 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
      } ${disabled ? "pointer-events-none opacity-70" : ""}`}
    >
      <div className="text-lg font-black tracking-tight">{label}</div>
      <div className={`mt-2 text-sm ${active ? "text-white/80" : "text-slate-500"}`}>
        가장 가까운 응답을 선택해 주세요.
      </div>
    </button>
  );
}

function SectionCard({
  title,
  desc,
  children,
  accentColor,
}: {
  title: string;
  desc?: string;
  children: ReactNode;
  accentColor?: string;
}) {
  return (
    <section
      className="rounded-[30px] border bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] backdrop-blur"
      style={{
        borderColor: accentColor ? hexToRgba(accentColor, 0.16) : "rgba(226,232,240,1)",
        boxShadow: accentColor
          ? `0 18px 60px ${hexToRgba(accentColor, 0.08)}`
          : "0 18px 60px rgba(15,23,42,0.06)",
      }}
    >
      <div className="mb-5">
        <div className="text-xs font-extrabold tracking-[0.16em] text-slate-400">
          SECTION
        </div>
        <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
          {title}
        </h3>
        {desc ? (
          <p className="mt-2 text-sm leading-7 text-slate-500">{desc}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function AxisCard({
  name,
  left,
  right,
  leftValue,
  rightValue,
  color,
}: {
  name: string;
  left: string;
  right: string;
  leftValue: number;
  rightValue: number;
  color: string;
}) {
  const total = leftValue + rightValue || 5;
  const leftPercent = `${(leftValue / total) * 100}%`;
  const rightPercent = `${(rightValue / total) * 100}%`;

  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-5">
      <div className="text-sm font-black tracking-tight text-slate-900">{name}</div>

      <div className="mt-4 flex items-center justify-between text-sm font-bold text-slate-500">
        <span>{left}</span>
        <span>{right}</span>
      </div>

      <div className="mt-3 grid grid-cols-[1fr_10px_1fr] items-center">
        <div className="h-3 overflow-hidden rounded-full bg-slate-200">
          <div
            className="ml-auto h-full rounded-full"
            style={{
              width: leftPercent,
              background: `linear-gradient(90deg, #cbd5e1 0%, ${color} 100%)`,
            }}
          />
        </div>
        <div className="relative h-3">
          <div className="absolute left-1/2 top-[-2px] h-4 w-[2px] -translate-x-1/2 rounded-full bg-slate-300" />
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full"
            style={{
              width: rightPercent,
              background: `linear-gradient(90deg, ${color} 0%, #0f172a 100%)`,
            }}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center">
          <div className="text-[11px] font-extrabold tracking-[0.16em] text-slate-400">
            LEFT
          </div>
          <div className="mt-1 text-sm font-black text-slate-900">
            {scoreLabel(leftValue)}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center">
          <div className="text-[11px] font-extrabold tracking-[0.16em] text-slate-400">
            RIGHT
          </div>
          <div className="mt-1 text-sm font-black text-slate-900">
            {scoreLabel(rightValue)}
          </div>
        </div>
      </div>
    </div>
  );
}

function CharacterSpotlight({
  report,
  meta,
  code,
}: {
  report: Report;
  meta: CharacterMeta;
  code: string;
}) {
  const hasImage = Boolean(meta.image);

  return (
    <div
      className="relative overflow-hidden rounded-[32px] border p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.16)]"
      style={{
        background: `linear-gradient(135deg, ${report.color} 0%, #0f172a 88%)`,
        borderColor: "rgba(255,255,255,0.12)",
      }}
    >
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${meta.aura}`} />
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-8 h-48 w-48 rounded-full bg-white/10 blur-2xl" />

      <div className="relative z-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <div className="flex flex-wrap gap-3">
            <HeroBadge>RESULT TYPE</HeroBadge>
            <HeroBadge>코드 {code}</HeroBadge>
            <HeroBadge>{meta.label}</HeroBadge>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/14 text-3xl shadow-inner shadow-white/10">
              {meta.emoji}
            </div>
            <div>
              <div className="text-sm font-bold uppercase tracking-[0.2em] text-white/65">
                학습성향 결과
              </div>
              <h2 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">
                {report.title}
              </h2>
            </div>
          </div>

          <p className="mt-5 text-lg font-bold leading-8 text-white/90">
            {meta.tagline}
          </p>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/78">
            {report.summary}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[22px] border border-white/12 bg-white/10 p-4 backdrop-blur">
              <div className="text-[11px] font-extrabold tracking-[0.16em] text-white/55">
                RESULT TITLE
              </div>
              <div className="mt-2 text-base font-black text-white">
                {report.title}
              </div>
              <div className="mt-1 text-sm font-semibold text-white/70">
                {report.subtitle}
              </div>
            </div>

            <div className="rounded-[22px] border border-white/12 bg-white/10 p-4 backdrop-blur">
              <div className="text-[11px] font-extrabold tracking-[0.16em] text-white/55">
                CHARACTER LABEL
              </div>
              <div className="mt-2 text-base font-black text-white">
                {meta.label}
              </div>
              <div className="mt-1 text-sm font-semibold text-white/70">
                {code}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <div className="relative flex h-[280px] w-full max-w-[280px] items-center justify-center rounded-[30px] border border-white/12 bg-white/10 p-4 backdrop-blur">
            {hasImage ? (
              <img
                src={meta.image}
                alt={meta.label}
                className="h-full w-full rounded-[24px] object-cover"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center rounded-[24px] bg-white/8 text-center">
                <div className="text-6xl">{meta.emoji}</div>
                <div className="mt-4 text-lg font-black text-white">
                  {meta.label}
                </div>
                <div className="mt-2 px-4 text-sm leading-6 text-white/70">
                  캐릭터 이미지가 준비되면 이 영역에 표시됩니다.
                </div>
              </div>
            )}

            <div className="pointer-events-none absolute inset-x-8 bottom-3 h-8 rounded-full bg-black/20 blur-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

function PromptCard({
  resultKey,
  reportColor,
}: {
  resultKey: string;
  reportColor: string;
}) {
  const prompt = getCharacterPrompt(resultKey);
  const mjPrompt = `${prompt}, full body character sheet, premium educational mascot, high detail, clean composition --ar 3:4 --stylize 250`;

  return (
    <SectionCard
      title="캐릭터 프롬프트"
      desc="캐릭터 일러스트 제작용 프롬프트를 바로 복사할 수 있어요."
      accentColor={reportColor}
    >
      <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 text-sm leading-7 text-slate-700">
        {prompt}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => copyText(prompt)}
          className="rounded-full px-4 py-2 text-sm font-black text-white transition hover:-translate-y-0.5"
          style={{
            background: `linear-gradient(135deg, ${reportColor} 0%, #0f172a 100%)`,
          }}
        >
          기본 프롬프트 복사
        </button>

        <button
          type="button"
          onClick={() => copyText(mjPrompt)}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50"
        >
          Midjourney 버전 복사
        </button>
      </div>
    </SectionCard>
  );
}

function ScoreSummary({
  scores,
}: {
  scores: Record<string, number>;
}) {
  const items = [
    { label: "E", value: scores.E },
    { label: "P", value: scores.P },
    { label: "R", value: scores.R },
    { label: "C", value: scores.C },
    { label: "M", value: scores.M },
    { label: "O", value: scores.O },
    { label: "S", value: scores.S },
    { label: "F", value: scores.F },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-[20px] border border-slate-200 bg-slate-50/70 p-4 text-center"
        >
          <div className="text-xs font-extrabold tracking-[0.16em] text-slate-400">
            {item.label}
          </div>
          <div className="mt-2 text-xl font-black text-slate-900">
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function ResultScreen({
  answers,
  onRestart,
}: {
  answers: number[];
  onRestart: () => void;
}) {
  const scores = useMemo(() => makeScores(answers), [answers]);
  const axisProfile = useMemo(() => getAxisProfile(scores), [scores]);
  const resolved = useMemo(() => resolveResult(scores), [scores]);
  const report = RESULT_DB[resolved.key] || RESULT_DB.DEFAULT;
  const characterMeta = CHARACTER_META[resolved.key] || CHARACTER_META.DEFAULT;

  const axes = useMemo(() => {
    const social = toFiveScalePair(scores.P, scores.E);
    const judgment = toFiveScalePair(scores.R, scores.C);
    const track = toFiveScalePair(scores.M, scores.O);
    const style = toFiveScalePair(scores.F, scores.S);

    return [
      { name: "대인 성향", left: "수동적", right: "외향적", leftValue: social.leftValue, rightValue: social.rightValue },
      { name: "판단 방식", left: "원리형", right: "규범형", leftValue: judgment.leftValue, rightValue: judgment.rightValue },
      { name: "진행 성향", left: "자유형", right: "계획형", leftValue: track.leftValue, rightValue: track.rightValue },
      { name: "실행 스타일", left: "유연형", right: "완수형", leftValue: style.leftValue, rightValue: style.rightValue },
    ];
  }, [scores]);

  const accentSoft = hexToRgba(report.color, 0.08);
  const accentBorder = hexToRgba(report.color, 0.15);

  const printableHtml = useMemo(
    () =>
      generatePrintableReport({
        report,
        resultCode: resolved.fullCode,
        axes,
      }),
    [report, resolved.fullCode, axes]
  );

  return (
    <Shell>
      <div className="grid gap-6">
        <CharacterSpotlight report={report} meta={characterMeta} code={resolved.code} />

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="grid gap-6">
            <SectionCard
              title="핵심 축 분석"
              desc="성향의 방향성과 강도를 보기 쉽게 정리했어요."
              accentColor={report.color}
            >
              <div className="grid gap-4">
                {axes.map((axis) => (
                  <AxisCard
                    key={axis.name}
                    name={axis.name}
                    left={axis.left}
                    right={axis.right}
                    leftValue={axis.leftValue}
                    rightValue={axis.rightValue}
                    color={report.color}
                  />
                ))}
              </div>

              <div
                className="mt-5 rounded-[22px] border p-4 text-sm leading-7"
                style={{
                  background: accentSoft,
                  borderColor: accentBorder,
                }}
              >
                <div className="font-black text-slate-900">프로파일 요약</div>
                <div className="mt-2 text-slate-700">
                  사회성 {axisProfile.social.toFixed(2)} · 판단 {axisProfile.judgment.toFixed(2)} · 진행{" "}
                  {axisProfile.track.toFixed(2)} · 실행 {axisProfile.style.toFixed(2)}
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="원점수 요약"
              desc="엑셀 채점표 기준 축별 합산 점수예요."
              accentColor={report.color}
            >
              <ScoreSummary scores={scores} />

              <div className="mt-5 rounded-[22px] border border-slate-200 bg-slate-50/70 p-4 text-sm leading-7 text-slate-700">
                <div className="font-black text-slate-900">표시 코드</div>
                <div className="mt-2">{resolved.fullCode}</div>
              </div>
            </SectionCard>

            <PromptCard resultKey={resolved.key} reportColor={report.color} />
          </div>

          <div className="grid gap-6">
            <SectionCard
              title="결과 해석"
              desc="유형 설명과 실제 적용 방향을 함께 확인해 보세요."
              accentColor={report.color}
            >
              <div className="grid gap-4">
                <InfoItem title="유형명" value={`${report.title} · ${report.subtitle}`} />
                <InfoItem title="핵심 설명" value={report.summary} />
                <InfoItem title="학습 전략" value={report.strategy} />
                <InfoItem title="부모 코칭" value={report.parent} />
                <InfoItem title="진로 방향" value={report.path} />
                <InfoItem title="주의 패턴" value={report.danger} />
                <InfoItem title="대화 제안" value={report.talk} />
              </div>
            </SectionCard>

            <SectionCard
              title="활용하기"
              desc="출력하거나 다시 검사할 수 있어요."
              accentColor={report.color}
            >
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => printReport(printableHtml)}
                  className="rounded-full px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5"
                  style={{
                    background: `linear-gradient(135deg, ${report.color} 0%, #0f172a 100%)`,
                  }}
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

              <div className="mt-5 rounded-[22px] border border-slate-200 bg-slate-50/70 p-4 text-sm leading-7 text-slate-600">
                상담용 체험판으로도 활용할 수 있도록 결과 문구를 정리해 두었습니다.
              </div>
            </SectionCard>

            <SectionCard title="이런 분께 추천" desc="학생·학부모 상담용 체험판으로 사용하기 좋아요.">
              <div className="space-y-3 text-sm leading-7 text-slate-600">
                <p>• 아이의 성향을 단순 성격이 아니라 학습 방향으로 보고 싶은 경우</p>
                <p>• 부모 상담용으로 정리된 결과 문구가 필요한 경우</p>
                <p>• PDF로 저장해서 활용하고 싶은 경우</p>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </Shell>
  );
}

function LandingScreen({ onStart }: { onStart: () => void }) {
  const highlights = [
    { label: "검사 문항", value: `${QUESTIONS.length}문항` },
    { label: "예상 소요", value: "약 5~7분" },
    { label: "결과 제공", value: "학부모 신뢰형 리포트" },
  ];

  const trustPoints = [
    "학생의 응답을 바탕으로 학습 성향과 실행 패턴을 분석합니다.",
    "결과 해석뿐 아니라 학습 전략과 부모 코칭 포인트까지 함께 제공합니다.",
    "직관적인 2지선다 방식으로 부담 없이 시작할 수 있습니다.",
  ];

  const process = [
    {
      step: "01",
      title: "응답 진행",
      desc: "학생이 문항에 따라 직관적으로 응답합니다.",
    },
    {
      step: "02",
      title: "성향 분석",
      desc: "응답 데이터를 바탕으로 학습 태도와 행동 패턴을 정리합니다.",
    },
    {
      step: "03",
      title: "결과 리포트",
      desc: "유형 해석, 학습 전략, 부모 코칭 방향을 한 번에 제공합니다.",
    },
  ];

  return (
    <Shell>
      <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="relative overflow-hidden rounded-[36px] border border-slate-200 bg-white px-7 py-8 shadow-[0_28px_90px_rgba(15,23,42,0.08)] sm:px-10 sm:py-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.08),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.94))]" />

          <div className="relative">
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-[11px] font-extrabold tracking-[0.16em] text-sky-700">
                STUDY TYPE ANALYSIS
              </span>
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-extrabold tracking-[0.16em] text-slate-600">
                학부모 신뢰형 리포트
              </span>
            </div>

            <div className="mt-7 max-w-3xl">
              <p className="text-sm font-extrabold tracking-[0.18em] text-slate-400">
                LEARNING PROFILE TEST
              </p>

              <h1 className="mt-3 text-4xl font-black leading-[1.12] tracking-[-0.03em] text-slate-950 sm:text-5xl">
                학습성향
                <br />
                정밀 진단 검사
              </h1>

              <p className="mt-5 max-w-2xl text-[16px] leading-8 text-slate-600 sm:text-[17px]">
                학생의 응답을 바탕으로 학습 방식, 판단 습관, 실행 패턴,
                성장 가능성을 분석하고
                <span className="font-bold text-slate-900">
                  {" "}
                  결과 해석 · 학습 전략 · 부모 코칭 포인트
                </span>
                를 한눈에 정리한 리포트로 제공합니다.
              </p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {highlights.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[24px] border border-slate-200 bg-white/90 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
                >
                  <div className="text-[11px] font-extrabold tracking-[0.16em] text-slate-400">
                    {item.label}
                  </div>
                  <div className="mt-2 text-lg font-black tracking-tight text-slate-900">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-[28px] border border-slate-200 bg-slate-50/90 p-5">
              <div className="text-[11px] font-extrabold tracking-[0.16em] text-slate-400">
                WHY THIS TEST
              </div>

              <div className="mt-4 grid gap-3">
                {trustPoints.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-[18px] bg-white px-4 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
                  >
                    <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-black text-white">
                      ✓
                    </div>
                    <p className="text-sm font-semibold leading-6 text-slate-700">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onStart}
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-7 py-3.5 text-sm font-black text-white shadow-[0_16px_40px_rgba(15,23,42,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800"
              >
                검사 시작하기
              </button>

              <div className="text-sm font-semibold text-slate-500">
                빠르게 시작하고 결과는 바로 확인할 수 있습니다.
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-900 p-7 text-white shadow-[0_24px_80px_rgba(2,6,23,0.18)]">
            <div className="text-xs font-extrabold tracking-[0.18em] text-white/55">
              REPORT PREVIEW
            </div>

            <h2 className="mt-3 text-[28px] font-black leading-[1.25] tracking-[-0.03em]">
              결과는 단순한 유형명이 아니라
              <br />
              해석 중심 리포트입니다
            </h2>

            <p className="mt-4 text-sm leading-7 text-white/75">
              학생의 성향을 이해하기 쉽게 정리하고, 실제 학습 상황에서
              적용할 수 있는 방향까지 함께 제안합니다.
            </p>

            <div className="mt-6 space-y-3">
              <div className="rounded-[22px] border border-white/10 bg-white/10 p-4 backdrop-blur">
                <div className="text-[11px] font-extrabold tracking-[0.16em] text-white/55">
                  INCLUDED
                </div>
                <div className="mt-2 text-sm font-bold leading-6 text-white/90">
                  유형 해석 · 학습 전략 · 부모 코칭 · 진로 방향 · 주의 패턴
                </div>
              </div>

              <div className="rounded-[22px] border border-white/10 bg-white/10 p-4 backdrop-blur">
                <div className="text-[11px] font-extrabold tracking-[0.16em] text-white/55">
                  RECOMMENDED FOR
                </div>
                <div className="mt-2 text-sm font-bold leading-6 text-white/90">
                  학생 성향을 더 정확히 이해하고, 상담형 결과 리포트를 함께
                  보고 싶은 학부모와 학생
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
            <div className="mb-5">
              <div className="text-xs font-extrabold tracking-[0.16em] text-slate-400">
                HOW IT WORKS
              </div>
              <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                진행 방식
              </h3>
            </div>

            <div className="grid gap-3">
              {process.map((item) => (
                <div
                  key={item.step}
                  className="flex items-start gap-4 rounded-[24px] border border-slate-200 bg-slate-50/80 p-4"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-sm font-black text-white">
                    {item.step}
                  </div>

                  <div>
                    <div className="text-base font-black tracking-tight text-slate-900">
                      {item.title}
                    </div>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

function InfoItem({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
      <div className="text-xs font-extrabold tracking-[0.16em] text-slate-400">
        {title}
      </div>
      <div className="mt-2 text-sm font-semibold leading-6 text-slate-700">
        {value}
      </div>
    </div>
  );
}

function TestScreen({
  currentIndex,
  answers,
  onAnswer,
  onPrev,
  isTransitioning,
}: {
  currentIndex: number;
  answers: number[];
  onAnswer: (value: number) => void;
  onPrev: () => void;
  isTransitioning: boolean;
}) {
  const safeIndex = Math.min(Math.max(currentIndex, 0), QUESTIONS.length - 1);
  const progress = Math.round(((safeIndex + 1) / QUESTIONS.length) * 100);
  const selected = answers[safeIndex] ?? null;

  return (
    <Shell>
      <div className="mx-auto max-w-3xl">
        <div className="rounded-[34px] border border-white/80 bg-white/90 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-extrabold tracking-[0.18em] text-slate-400">
                QUESTION
              </div>
              <div className="mt-2 text-lg font-black text-slate-900">
                {safeIndex + 1} / {QUESTIONS.length}
              </div>
            </div>

            <div className="min-w-[180px] flex-1 sm:max-w-xs">
              <ProgressBar value={progress} />
              <div className="mt-2 text-right text-xs font-bold text-slate-500">
                {progress}% 진행
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-[30px] bg-gradient-to-br from-slate-50 to-sky-50 p-6 sm:p-8">
            <div className="text-sm font-bold uppercase tracking-[0.2em] text-sky-600">
              문항
            </div>
            <p className="mt-4 text-2xl font-black leading-[1.55] tracking-tight text-slate-900 sm:text-[30px]">
              {QUESTIONS[safeIndex] ?? "문항을 불러오는 중입니다."}
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {CHOICES.map((choice) => (
              <ChoiceButton
                key={choice.label}
                active={selected === choice.value}
                label={choice.label}
                disabled={isTransitioning}
                onClick={() => onAnswer(choice.value)}
              />
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onPrev}
              disabled={safeIndex === 0 || isTransitioning}
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              이전 문항
            </button>

            <div className="text-sm font-semibold text-slate-500">
              가장 가까운 응답을 선택해 주세요.
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

export default function Page() {
  const [step, setStep] = useState<Step>("landing");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [answers, setAnswers] = useState<number[]>(() =>
    Array(QUESTIONS.length).fill(-1)
  );

  const answeredCount = useMemo(
    () => answers.filter((answer) => answer !== -1).length,
    [answers]
  );
  const isComplete = answeredCount === QUESTIONS.length;

  const handleStart = () => {
    setStep("test");
  };

  const handleAnswer = (value: number) => {
    if (isTransitioning) return;
    if (currentIndex < 0 || currentIndex >= QUESTIONS.length) return;

    setIsTransitioning(true);

    setAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = value;
      return next;
    });

    const isLastQuestion = currentIndex === QUESTIONS.length - 1;

    if (isLastQuestion) {
      setTimeout(() => {
        setStep("result");
        setIsTransitioning(false);
      }, 120);
      return;
    }

    setTimeout(() => {
      setCurrentIndex((prev) => Math.min(prev + 1, QUESTIONS.length - 1));
      setIsTransitioning(false);
    }, 120);
  };

  const handlePrev = () => {
    if (isTransitioning) return;
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleRestart = () => {
    setAnswers(Array(QUESTIONS.length).fill(-1));
    setCurrentIndex(0);
    setIsTransitioning(false);
    setStep("landing");
  };

  if (step === "landing") {
    return <LandingScreen onStart={handleStart} />;
  }

  if (step === "test" || !isComplete) {
    return (
      <TestScreen
        currentIndex={currentIndex}
        answers={answers}
        onAnswer={handleAnswer}
        onPrev={handlePrev}
        isTransitioning={isTransitioning}
      />
    );
  }

  return <ResultScreen answers={answers} onRestart={handleRestart} />;
}