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

const RESULT_DB: Record<string, Report> = {
  ERMS: {
    title: "이과 창의적영재형",
    subtitle: "1% 미만",
    summary: "이과적 두뇌와 창의적 사고가 매우 뛰어나며, 상위권을 넘어 특출한 성취 가능성을 지닌 유형입니다.",
    strategy: "자기주도성이 강하므로 학생의 의견을 중심으로 학습 방향을 설계하되, 내신·대회·전형 정보를 균형 있게 관리하는 것이 좋습니다. 선행·심화 학습과 결과물 중심 활동이 잘 맞습니다.",
    parent: "통제보다 신뢰와 지원이 효과적입니다. 일반적인 학습 환경보다 수준이 맞는 집단에서 더 크게 성장할 가능성이 높습니다.",
    path: "서울대, 카이스트, 포항공대, 의학·공학·자연과학 계열과 잘 맞습니다.",
    danger: "개인적 특성이 강해 일반적인 학습 분위기와 맞지 않을 수 있으며, 맞지 않는 환경에서는 흥미가 크게 떨어질 수 있습니다.",
    talk: "‘왜 그렇게 생각했는지 설명해볼래?’처럼 사고를 확장시키는 질문형 대화가 효과적입니다.",
    color: "#2563eb",
  },
  ERMF: {
    title: "이과 영재형",
    subtitle: "3% 미만",
    summary: "특정 과목에서 매우 높은 성취 가능성을 보이며, 관심 분야에서는 압도적 몰입을 보일 수 있는 유형입니다.",
    strategy: "관심 과목의 강점을 유지하면서도 시작한 일을 성과물로 연결할 수 있도록 고른 학습과 마무리 습관을 함께 설계하는 것이 중요합니다.",
    parent: "흥미 중심의 몰입이 강한 유형이므로 균형 잡힌 스펙 관리와 학습 리듬 유지에 도움을 주는 것이 좋습니다.",
    path: "수학, 물리, 전자, 발명, IT·연구 계열과 잘 맞습니다.",
    danger: "흥미가 넓고 시작이 빠른 만큼, 마무리와 꾸준함이 약해지면 성과가 불안정해질 수 있습니다.",
    talk: "‘잘하는 걸 살리면서, 끝까지 연결되는 경험을 같이 만들어보자’는 접근이 효과적입니다.",
    color: "#0f766e",
  },
  eROS: {
    title: "이과모범형",
    subtitle: "4%~10% 미만",
    summary: "이과 성향과 자기관리 능력이 함께 강한 유형으로, 안정적인 상위권 전략이 잘 맞습니다.",
    strategy: "내신과 모의고사를 고르게 관리하며, 시험 불안과 외부 활동으로 인한 리듬 흔들림만 잘 조절하면 강점을 꾸준히 유지할 수 있습니다.",
    parent: "학생의 학습 방식을 존중해도 무난하지만, 친구 관계나 외부 활동이 학습 흐름을 방해하지 않도록 점검이 필요합니다.",
    path: "SKY, 의·치·한의대, 자연과학, 공학, 수의학 계열과 잘 맞습니다.",
    danger: "적극적인 성향 때문에 학습보다 관계와 활동에 에너지가 분산될 수 있습니다.",
    talk: "‘지금의 리듬만 잘 지키면 충분히 좋은 결과로 이어질 수 있어’라는 식의 안정감 있는 대화가 좋습니다.",
    color: "#0891b2",
  },
  pROS: {
    title: "(수동적) 이과 모범형",
    subtitle: "4%~10% 미만",
    summary: "성실함과 인내심을 바탕으로 상위권을 안정적으로 유지하는 유형입니다.",
    strategy: "개념 정리와 실수 관리, 시험 불안 조절이 중요하며, 보다 적극적인 활동 경험과 리더십 기회를 함께 쌓으면 성장 폭이 커집니다.",
    parent: "실력은 충분하지만 자기표현과 존재감이 약할 수 있으므로, 안정감을 해치지 않는 선에서 경험의 폭을 넓혀주는 것이 좋습니다.",
    path: "SKY, 지방의대, 자연과학, 공학, 수의학, 약학 계열과 잘 맞습니다.",
    danger: "실수 하나에 흔들리면 멘탈 영향이 큰 편이라, 쉬운 부분에서의 실수 관리가 중요합니다.",
    talk: "‘네가 차분히 쌓아온 힘이 크다, 이제 그 강점을 조금 더 드러내 보자’는 식의 대화가 좋습니다.",
    color: "#0284c7",
  },
  PRMf: {
    title: "이과 뺀질이형",
    subtitle: "20% 미만",
    summary: "수학·과학 등 특정 과목에서는 강점을 보이지만, 흥미 없는 과목은 쉽게 놓칠 수 있는 유형입니다.",
    strategy: "절대 학습시간 확보, 감독이 있는 환경, 선호 과목의 성과를 전체 학습 동기로 연결하는 구조가 필요합니다.",
    parent: "자유도가 큰 환경보다 책임감이 생기는 환경이 더 적합합니다. 결과물 중심 경험이 학습 전체를 끌어올리는 데 도움이 됩니다.",
    path: "이공계열, 논술·정시 전략, IT 분야 사업·연구·CEO 계열과 연결될 수 있습니다.",
    danger: "좋아하는 과목만 밀고 나가다 전체 성적의 균형이 무너질 수 있습니다.",
    talk: "‘짧게라도 좋으니, 끝까지 가는 힘을 같이 만들어보자’는 식의 대화가 좋습니다.",
    color: "#7c3aed",
  },
  EROF: {
    title: "외향적 이과뺀질형",
    subtitle: "20% 미만",
    summary: "관심 있는 과목에서는 번뜩이는 성과를 보이지만, 주변 환경의 영향을 크게 받는 유형입니다.",
    strategy: "통제적 환경, 선택과 집중, 소규모 팀 속 책임감 경험이 효과적이며, 관심 분야의 구체적 결과물이 전체 성적 향상에 시너지를 줄 수 있습니다.",
    parent: "환경에 따라 결과 차이가 커질 수 있어, 학습 공간과 함께하는 집단을 신중히 선택하는 것이 중요합니다.",
    path: "자유전공, 자연과학, 건축, IT 마케팅, 이공계 연구 계열과 잘 맞습니다.",
    danger: "많은 일을 시작하지만 끝맺음이 약해 성과가 분산될 수 있습니다.",
    talk: "‘환경을 잘 고르면 네 강점이 훨씬 크게 드러날 수 있어’라는 식의 코칭이 효과적입니다.",
    color: "#9333ea",
  },
  PROS: {
    title: "이과 잠재성장형",
    subtitle: "70% 내외",
    summary: "현재 강점이 선명하게 드러나지 않았더라도, 기초를 차분히 쌓을수록 성장 가능성이 커지는 유형입니다.",
    strategy: "선행보다 내신 중심으로 접근하고, 한 과목씩 성취 경험을 만드는 방식이 효과적입니다. 절대 시간보다 집중 시간을 늘리는 전략이 중요합니다.",
    parent: "비교보다 작은 성공 경험의 축적이 중요합니다. 선호 과목에서 자신감을 회복하게 하면 전체 학습에도 긍정적인 영향을 줄 수 있습니다.",
    path: "간호, 사범, 이과대학, 교사·간호사·물리치료사·약사 계열과 잘 맞습니다.",
    danger: "막연한 목표만 세우면 쉽게 지치거나 포기할 수 있어, 단계적 목표 설계가 필요합니다.",
    talk: "‘이번에는 이 한 가지를 끝내보자’처럼 작고 분명한 목표를 제시하는 대화가 효과적입니다.",
    color: "#ea580c",
  },
  ECMf: {
    title: "문과 창의적영재형",
    subtitle: "1% 미만",
    summary: "문과 성향의 창의성과 표현력이 매우 강하며, 차별화된 결과물을 만들 가능성이 높은 유형입니다.",
    strategy: "관심 분야의 심화 학습과 함께 특기·논술·대회·동아리 결과물을 꾸준히 쌓는 방식이 잘 맞습니다.",
    parent: "다름을 교정하려 하기보다, 개성과 창의성이 실제 성과로 연결되도록 구조를 만들어주는 것이 중요합니다.",
    path: "어문, 언론정보, 연극영화, 광고, 방송PD, 게임기획 계열과 잘 맞습니다.",
    danger: "산만함과 엉뚱함이 강점이 되기도 하지만, 실행 리듬이 무너지면 결과가 불안정할 수 있습니다.",
    talk: "‘네 생각을 결과물로 보여줄 방법을 같이 찾아보자’는 접근이 좋습니다.",
    color: "#db2777",
  },
  ECMs: {
    title: "문과 모범형 영재형",
    subtitle: "2% 미만",
    summary: "전교권 수준의 안정된 성과와 자기관리 능력을 함께 갖춘 이상적인 문과 영재형입니다.",
    strategy: "학생 스스로도 잘 이끌어가는 편이므로 신뢰를 기반으로 하되, 선행·심화와 체력·멘탈 관리까지 함께 챙기면 완성도가 높아집니다.",
    parent: "과한 개입보다 신뢰와 점검이 적합합니다. 우수한 멘토와의 간헐적 코칭이 효과적일 수 있습니다.",
    path: "SKY, 한의대(문과), 경영·행정·신문방송·법조·외교관 계열과 잘 맞습니다.",
    danger: "완벽주의와 부담감이 누적될 경우 번아웃 위험이 있습니다.",
    talk: "‘지금도 충분히 잘 가고 있고, 네 속도를 믿는다’는 메시지가 중요합니다.",
    color: "#2563eb",
  },
  ECoS: {
    title: "내성적 문과영재형",
    subtitle: "3% 미만",
    summary: "언어·외국어 영역의 강점과 깊이 있는 사고를 함께 지닌 문과 상위권 유형입니다.",
    strategy: "심화·선행 학습과 토론·발표 기회를 함께 주되, 계획을 실제 행동으로 연결하는 실천 습관을 보완하는 것이 중요합니다.",
    parent: "조용하지만 수준이 높은 편입니다. 겉으로 드러나지 않는 실행 부족을 세심하게 관리해주면 크게 성장할 수 있습니다.",
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
    strategy: "통제적 환경, 절대 학습시간 확보, 관심 분야 성과물을 전체 성적 향상의 발판으로 활용하는 것이 중요합니다.",
    parent: "겉으로 드러나지 않아 방심하기 쉽지만, 조용히 흐트러질 수 있어 세심한 관찰과 점검이 필요합니다.",
    path: "자유전공, 철학, 애니메이션, 사학, 문헌정보, 방송·도서·창작 관련 분야와 잘 맞습니다.",
    danger: "시작은 하지만 끝맺음이 약해 성과로 연결되지 못할 수 있습니다.",
    talk: "‘조용히 잘하고 있는 것도 좋지만, 끝까지 간 걸 함께 확인하자’는 식의 대화가 좋습니다.",
    color: "#a21caf",
  },
  PCOF: {
    title: "문과 잠재성장형",
    subtitle: "70% 내외",
    summary: "현재 강점이 뚜렷하게 드러나지 않은 상태일 수 있지만, 차분한 기반 위에서 성장 가능성이 큰 유형입니다.",
    strategy: "선행보다 내신 중심 학습이 적합하며, 선호 과목에서 먼저 성취감을 만들고 단계적 목표를 통해 자신감을 회복하는 것이 중요합니다.",
    parent: "비교보다 성취 경험의 축적이 우선입니다. 작은 성공을 반복적으로 경험하게 해주는 것이 가장 효과적입니다.",
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
    parent: "산만함과 독특함을 약점으로 보기보다, 강점으로 연결될 수 있도록 마무리와 집중만 잘 도와주는 것이 좋습니다.",
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
    strategy: "균형 잡힌 과목 관리, 감독이 있는 환경, 관심 분야 결과물을 전체 성적으로 연결하는 전략이 중요합니다.",
    parent: "통제적 환경과 마무리 점검이 필요합니다. 시작은 빠르지만 끝까지 가는 힘을 만들어주는 것이 핵심입니다.",
    path: "자유전공, 건축, 자연과학, 철학, 어문, 방송 관련 직종, 프리랜서 계열과 잘 맞습니다.",
    danger: "분야를 넘나드는 재능이 오히려 산만함으로 보일 수 있습니다.",
    talk: "‘재능은 충분하니, 이제 끝까지 연결하는 힘을 같이 만들자’는 식의 대화가 효과적입니다.",
    color: "#7c3aed",
  },
  PrOF: {
    title: "융합 잠재성장형",
    subtitle: "70% 내외",
    summary: "현재 특별히 두드러진 과목이 없더라도, 생활 속 훈련과 경험에 따라 성장 폭이 크게 달라질 수 있는 유형입니다.",
    strategy: "선행보다 내신 중심으로 접근하고, 선택과 집중을 통해 작은 성취 경험을 반복적으로 만드는 것이 중요합니다.",
    parent: "막연한 기대보다 단계적 목표가 필요합니다. 선호 과목에서 자신감을 얻으면 다른 과목으로도 확장될 가능성이 높습니다.",
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
    const map = SCORE_MAP[idx] || {};
    Object.entries(map).forEach(([key, value]) => {
      total[key] += Number(value) * answer;
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

function axisSummary(left: string, right: string, leftValue: number, rightValue: number) {
  return `${left} ${scoreLabel(leftValue)} / ${right} ${scoreLabel(rightValue)}`;
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
    socialWinner: socialLetter,
    judgmentWinner: judgmentLetter,
    trackWinner: trackLetter,
    styleWinner: styleLetter,
    socialDiff,
    judgmentDiff,
    trackDiff,
    styleDiff,
  };
}

function resolveResult(scores: Record<string, number>): ResolvedResult {
  const display = buildDisplayCode(scores);

  const {
    socialWinner,
    judgmentWinner,
    trackWinner,
    styleWinner,
    socialDiff,
    judgmentDiff,
    trackDiff,
    styleDiff,
  } = display;

  const isMajor = (n: number) => n > 2;
  const isStrong = (n: number) => n >= 8;

  const socialMajor = isMajor(socialDiff);
  const judgmentMajor = isMajor(judgmentDiff);
  const trackMajor = isMajor(trackDiff);
  const styleMajor = isMajor(styleDiff);

  let key = "DEFAULT";

  if (!trackMajor) {
    if (!styleMajor) {
      key = "PrOF";
    } else if (styleWinner === "S") {
      key = socialWinner === "E" ? "erOS" : "PrmS";
    } else {
      key = socialWinner === "E" && judgmentWinner === "C" ? "ErMS" : "PrMF";
    }
  } else if (trackWinner === "O") {
    if (styleWinner === "S" && styleMajor) {
      if (socialWinner === "E" && socialMajor) {
        key = "eROS";
      } else if (socialWinner === "P" && socialMajor) {
        key = "pROS";
      } else {
        key = "PROS";
      }
    } else if (styleWinner === "F" && styleMajor) {
      if (
        socialWinner === "E" &&
        judgmentWinner === "C" &&
        socialMajor &&
        judgmentMajor &&
        isStrong(trackDiff)
      ) {
        key = "ERMS";
      } else if (
        socialWinner === "P" &&
        judgmentWinner === "C" &&
        judgmentMajor &&
        trackDiff >= 5
      ) {
        key = "ERMF";
      } else if (socialWinner === "E" && socialMajor) {
        key = "EROF";
      } else {
        key = "PRMf";
      }
    } else {
      if (socialWinner === "E" && judgmentWinner === "C" && socialMajor) {
        key = "ERMF";
      } else if (socialWinner === "P") {
        key = "PRMf";
      } else {
        key = "PROS";
      }
    }
  } else {
    if (styleWinner === "S" && styleMajor) {
      if (
        socialWinner === "E" &&
        judgmentWinner === "R" &&
        socialMajor &&
        judgmentMajor &&
        isStrong(trackDiff)
      ) {
        key = "ECMs";
      } else if (
        socialWinner === "P" &&
        judgmentWinner === "R" &&
        judgmentMajor &&
        trackDiff >= 5
      ) {
        key = "ECoS";
      } else if (socialWinner === "P") {
        key = "pCOS";
      } else if (socialWinner === "E") {
        key = "eCOS";
      } else {
        key = "PCOF";
      }
    } else if (styleWinner === "F" && styleMajor) {
      if (
        socialWinner === "E" &&
        judgmentWinner === "R" &&
        socialMajor &&
        judgmentMajor &&
        isStrong(trackDiff)
      ) {
        key = "ECMf";
      } else if (socialWinner === "E") {
        key = "PCMs";
      } else if (socialWinner === "P") {
        key = "PCmF";
      } else {
        key = "ECMf";
      }
    } else {
      if (socialWinner === "E" && judgmentWinner === "R") {
        key = "ECMf";
      } else if (socialWinner === "P") {
        key = "PCmF";
      } else {
        key = "PCOF";
      }
    }
  }

  return {
    key,
    code: display.code,
    diffText: display.diffText,
    fullCode: display.full,
  };
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

  const hexToRgb = (hex: string) => {
    const normalized = hex.replace("#", "");
    const full =
      normalized.length === 3
        ? normalized
            .split("")
            .map((c) => c + c)
            .join("")
        : normalized;

    const num = parseInt(full, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  };

  const rgb = hexToRgb(report.color);
  const softTint = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.10)`;
  const softBorder = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.20)`;

  const axisBar = (leftValue: number, rightValue: number) => {
    const leftPercent = Math.max(0, Math.min(100, (leftValue / 5) * 100));
    const rightPercent = Math.max(0, Math.min(100, (rightValue / 5) * 100));

    return `
      <div class="axis-track">
        <div class="axis-half">
          <div class="axis-fill left" style="width:${leftPercent}%"></div>
        </div>
        <div class="axis-divider"></div>
        <div class="axis-half">
          <div class="axis-fill right" style="width:${rightPercent}%"></div>
        </div>
      </div>
    `;
  };

  const axisCards = axes
    .map(
      (axis) => `
      <div class="axis-card">
        <div class="axis-top">
          <div class="axis-name">${escapeHtml(axis.name)}</div>
          <div class="axis-chip">${escapeHtml(
            axisSummary(axis.left, axis.right, axis.leftValue, axis.rightValue)
          )}</div>
        </div>

        <div class="axis-label-row">
          <span>${escapeHtml(axis.left)}</span>
          <span>${escapeHtml(axis.right)}</span>
        </div>

        ${axisBar(axis.leftValue, axis.rightValue)}

        <div class="axis-score-row">
          <div class="axis-score-box">
            <div class="axis-score-title">LEFT</div>
            <div class="axis-score-value">${escapeHtml(scoreLabel(axis.leftValue))}</div>
          </div>
          <div class="axis-score-box">
            <div class="axis-score-title">RIGHT</div>
            <div class="axis-score-value">${escapeHtml(scoreLabel(axis.rightValue))}</div>
          </div>
        </div>
      </div>
    `
    )
    .join("");

  const section = (title: string, body: string, index: string) => `
    <section class="section-card">
      <div class="section-head">
        <div class="section-index">${index}</div>
        <h2>${escapeHtml(title)}</h2>
      </div>
      <p>${escapeHtml(body)}</p>
    </section>
  `;

  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <title>학습성향 결과 리포트</title>
        <style>
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            margin: 0;
            padding: 0;
            background: #eef4fb;
            color: #0f172a;
            font-family: "Pretendard", "Apple SD Gothic Neo", "Malgun Gothic", Arial, sans-serif;
          }
          body {
            line-height: 1.7;
          }
          .page {
            width: 100%;
            max-width: 1120px;
            margin: 0 auto;
            padding: 28px;
          }
          .shell {
            background:
              radial-gradient(circle at top left, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.10), transparent 28%),
              radial-gradient(circle at bottom right, rgba(15, 23, 42, 0.07), transparent 26%),
              linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
            border: 1px solid rgba(226, 232, 240, 0.95);
            border-radius: 34px;
            overflow: hidden;
            box-shadow: 0 24px 80px rgba(15, 23, 42, 0.10);
          }
          .hero {
            position: relative;
            overflow: hidden;
            padding: 34px 36px 30px;
            background: linear-gradient(135deg, ${report.color} 0%, #0f172a 100%);
            color: #ffffff;
          }
          .hero:before {
            content: "";
            position: absolute;
            right: -80px;
            top: -80px;
            width: 240px;
            height: 240px;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.10);
            filter: blur(6px);
          }
          .hero:after {
            content: "";
            position: absolute;
            left: -60px;
            bottom: -100px;
            width: 220px;
            height: 220px;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.07);
          }
          .hero-inner {
            position: relative;
            z-index: 1;
          }
          .badge-row {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 18px;
          }
          .badge {
            display: inline-flex;
            align-items: center;
            border-radius: 999px;
            padding: 8px 14px;
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 0.08em;
            background: rgba(255,255,255,0.12);
            border: 1px solid rgba(255,255,255,0.16);
          }
          .hero h1 {
            margin: 0;
            font-size: 34px;
            line-height: 1.22;
            font-weight: 900;
            letter-spacing: -0.03em;
          }
          .hero-sub {
            margin-top: 10px;
            font-size: 14px;
            font-weight: 600;
            color: rgba(255,255,255,0.82);
          }
          .hero-summary {
            margin-top: 22px;
            padding: 18px 20px;
            border-radius: 22px;
            background: rgba(255,255,255,0.09);
            border: 1px solid rgba(255,255,255,0.14);
            font-size: 15px;
            line-height: 1.9;
            color: rgba(255,255,255,0.94);
          }
          .content {
            padding: 26px;
          }
          .meta-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 14px;
            margin-bottom: 18px;
          }
          .meta-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 22px;
            padding: 18px;
          }
          .meta-label {
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.14em;
            color: #64748b;
            margin-bottom: 10px;
          }
          .meta-value {
            font-size: 18px;
            font-weight: 900;
            color: #0f172a;
            line-height: 1.45;
          }
          .result-emphasis {
            background: ${softTint};
            border: 1px solid ${softBorder};
            color: ${report.color};
            border-radius: 999px;
            padding: 7px 12px;
            font-size: 12px;
            font-weight: 800;
            display: inline-flex;
            align-items: center;
            gap: 8px;
          }
          .axis-wrap {
            margin-top: 22px;
            margin-bottom: 22px;
          }
          .block-title {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            margin-bottom: 14px;
          }
          .block-title h2 {
            margin: 0;
            font-size: 22px;
            font-weight: 900;
            letter-spacing: -0.02em;
            color: #0f172a;
          }
          .block-title .desc {
            font-size: 13px;
            color: #64748b;
            font-weight: 600;
          }
          .axis-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 14px;
          }
          .axis-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 24px;
            padding: 18px;
            box-shadow: 0 8px 26px rgba(15, 23, 42, 0.04);
          }
          .axis-top {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-bottom: 14px;
          }
          .axis-name {
            font-size: 16px;
            font-weight: 900;
            color: #0f172a;
          }
          .axis-chip {
            display: inline-flex;
            align-self: flex-start;
            border-radius: 999px;
            padding: 6px 11px;
            font-size: 11px;
            font-weight: 800;
            color: #475569;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
          }
          .axis-label-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            font-size: 13px;
            font-weight: 700;
            color: #64748b;
          }
          .axis-track {
            position: relative;
            display: grid;
            grid-template-columns: 1fr 10px 1fr;
            align-items: center;
            gap: 0;
            margin-bottom: 14px;
          }
          .axis-half {
            height: 12px;
            border-radius: 999px;
            background: #e2e8f0;
            overflow: hidden;
            position: relative;
          }
          .axis-half:first-child .axis-fill {
            margin-left: auto;
          }
          .axis-divider {
            width: 10px;
            height: 12px;
            position: relative;
          }
          .axis-divider:before {
            content: "";
            position: absolute;
            left: 50%;
            top: -3px;
            transform: translateX(-50%);
            width: 2px;
            height: 18px;
            border-radius: 999px;
            background: #cbd5e1;
          }
          .axis-fill {
            height: 100%;
            border-radius: 999px;
          }
          .axis-fill.left {
            background: linear-gradient(90deg, #cbd5e1 0%, ${report.color} 100%);
          }
          .axis-fill.right {
            background: linear-gradient(90deg, ${report.color} 0%, #0f172a 100%);
          }
          .axis-score-row {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
          }
          .axis-score-box {
            border-radius: 18px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 12px 14px;
            text-align: center;
          }
          .axis-score-title {
            font-size: 11px;
            letter-spacing: 0.14em;
            font-weight: 800;
            color: #94a3b8;
          }
          .axis-score-value {
            margin-top: 6px;
            font-size: 15px;
            font-weight: 900;
            color: #0f172a;
          }
          .sections {
            display: grid;
            gap: 14px;
          }
          .section-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 24px;
            padding: 22px 22px 20px;
            box-shadow: 0 10px 28px rgba(15, 23, 42, 0.04);
          }
          .section-head {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;
          }
          .section-index {
            width: 34px;
            height: 34px;
            border-radius: 14px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 900;
            background: ${softTint};
            color: ${report.color};
            border: 1px solid ${softBorder};
            flex-shrink: 0;
          }
          .section-card h2 {
            margin: 0;
            font-size: 19px;
            font-weight: 900;
            color: #0f172a;
            letter-spacing: -0.02em;
          }
          .section-card p {
            margin: 0;
            font-size: 14px;
            line-height: 1.95;
            color: #334155;
            white-space: pre-wrap;
          }
          .footer {
            margin-top: 18px;
            display: flex;
            justify-content: space-between;
            gap: 12px;
            align-items: center;
            border-top: 1px solid #e2e8f0;
            padding-top: 16px;
            color: #64748b;
            font-size: 12px;
            font-weight: 600;
          }
          .footer strong {
            color: #0f172a;
          }
          @page {
            size: A4;
            margin: 14mm;
          }
          @media print {
            html, body {
              background: #ffffff;
            }
            .page {
              max-width: none;
              padding: 0;
            }
            .shell {
              border: none;
              box-shadow: none;
              border-radius: 0;
            }
            .hero,
            .axis-card,
            .section-card,
            .meta-card {
              break-inside: avoid;
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="shell">
            <div class="hero">
              <div class="hero-inner">
                <div class="badge-row">
                  <div class="badge">학부모용 정밀 분석 리포트</div>
                  <div class="badge">결과 코드 ${escapeHtml(resultCode)}</div>
                </div>

                <h1>${escapeHtml(report.title)}</h1>
                <div class="hero-sub">${escapeHtml(report.subtitle)}</div>

                <div class="hero-summary">
                  ${escapeHtml(report.summary)}
                </div>
              </div>
            </div>

            <div class="content">
              <div class="meta-grid">
                <div class="meta-card">
                  <div class="meta-label">RESULT TYPE</div>
                  <div class="meta-value">${escapeHtml(report.title)}</div>
                </div>
                <div class="meta-card">
                  <div class="meta-label">GUIDE</div>
                  <div class="meta-value">학습 전략 · 부모 코칭 · 진로 방향</div>
                </div>
                <div class="meta-card">
                  <div class="meta-label">REPORT NOTE</div>
                  <div class="meta-value">
                    <span class="result-emphasis">성향에 맞는 전략 제안형 리포트</span>
                  </div>
                </div>
              </div>

              <div class="axis-wrap">
                <div class="block-title">
                  <h2>핵심 축 분석</h2>
                  <div class="desc">성향의 강약을 보기 쉽게 정리했습니다.</div>
                </div>

                <div class="axis-grid">
                  ${axisCards}
                </div>
              </div>

              <div class="sections">
                ${section("학습 전략", report.strategy, "01")}
                ${section("부모 코칭", report.parent, "02")}
                ${section("진로 · 학교 방향", report.path, "03")}
                ${section("주의 패턴", report.danger, "04")}
                ${section("추천 대화 방식", report.talk, "05")}
              </div>

              <div class="footer">
                <div><strong>학습성향 결과 리포트</strong></div>
                <div>본 리포트는 응답 결과를 바탕으로 자동 생성되었습니다.</div>
              </div>
            </div>
          </div>
        </div>

        <script>
          window.onload = function () {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-200/80">
      <div
        className="h-full rounded-full bg-gradient-to-r from-sky-500 via-cyan-500 to-violet-500 transition-all duration-500"
        style={{ width: `${value}%` }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent)]" />
    </div>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur">
      <div className="mb-4 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold tracking-[0.16em] text-slate-500">
        SECTION
      </div>
      <h3 className="text-xl font-black tracking-tight text-slate-900">{title}</h3>
      <div className="mt-4 text-[15px] leading-8 text-slate-600">{children}</div>
    </div>
  );
}

function LandingScreen({ onStart }: { onStart: () => void }) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.14),transparent_30%),linear-gradient(180deg,#f8fafc_0%,#eef6ff_45%,#f8fafc_100%)]" />
      <div className="relative mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-12 lg:px-10 lg:py-16">
        <div className="overflow-hidden rounded-[36px] border border-white/70 bg-white/80 shadow-[0_24px_90px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="grid items-center gap-10 p-6 md:p-10 lg:grid-cols-[1.18fr_0.82fr] lg:p-12">
            <div>
              <div className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-4 py-1.5 text-sm font-semibold text-sky-700">
                학부모 신뢰형 학습성향검사
              </div>

              <h1 className="mt-6 text-[2.6rem] font-black leading-[1.18] tracking-[-0.04em] text-slate-900 md:text-[3.5rem]">
                우리 아이의
                <br />
                <span className="bg-gradient-to-r from-sky-700 via-cyan-600 to-violet-600 bg-clip-text text-transparent">
                  공부 방식과 성장 방향
                </span>
                을
                <br />
                더 정교하게 확인하세요
              </h1>

              <p className="mt-6 max-w-2xl text-[1.02rem] leading-8 text-slate-600 md:text-lg">
                80문항 기반으로 아이의 학습 성향, 실행 스타일, 사고 특성,
                부모 코칭 포인트, 진로 방향까지 한 번에 정리된 결과 리포트를 제공합니다.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4">
                  <div className="text-sm font-semibold text-slate-500">검사 구성</div>
                  <div className="mt-2 text-2xl font-black text-slate-900">80문항</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4">
                  <div className="text-sm font-semibold text-slate-500">응답 방식</div>
                  <div className="mt-2 text-2xl font-black text-slate-900">그렇다 / 아니다</div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4">
                  <div className="text-sm font-semibold text-slate-500">결과 제공</div>
                  <div className="mt-2 text-2xl font-black text-slate-900">PDF 리포트</div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={onStart}
                  className="rounded-2xl bg-gradient-to-r from-sky-700 to-violet-600 px-7 py-4 text-base font-bold text-white shadow-lg shadow-sky-200/50 transition hover:-translate-y-0.5"
                >
                  무료 검사 시작하기
                </button>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-lg">
                <div className="text-sm font-semibold text-slate-500">이런 분께 잘 맞아요</div>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
                  <li>• 아이의 성향을 단순 성격이 아니라 학습 방향으로 보고 싶은 경우</li>
                  <li>• 부모 상담용으로 정리된 결과 문구가 필요한 경우</li>
                  <li>• PDF로 저장해서 활용하고 싶은 경우</li>
                </ul>
              </div>

              <div className="rounded-[30px] border border-slate-200 bg-gradient-to-br from-sky-50 to-violet-50 p-6 shadow-lg">
                <div className="text-sm font-semibold text-slate-500">검사 특징</div>
                <div className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
                  <p>• 80문항 기반으로 보다 세밀하게 성향을 분석합니다.</p>
                  <p>• 결과 코드는 E-P / R-C / M-O / S-F 차이로 표시됩니다.</p>
                  <p>• 결과 화면은 인쇄 및 PDF 저장용 리포트로 활용할 수 있습니다.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_12px_40px_rgba(15,23,42,0.05)] backdrop-blur">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-100 text-lg font-black text-sky-700">
              1
            </div>
            <h3 className="text-xl font-black text-slate-900">직관적인 검사</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              각 문항에 대해 그렇다 / 아니다로 빠르게 응답할 수 있어 부담 없이 진행됩니다.
            </p>
          </div>

          <div className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_12px_40px_rgba(15,23,42,0.05)] backdrop-blur">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-100 text-lg font-black text-cyan-700">
              2
            </div>
            <h3 className="text-xl font-black text-slate-900">정밀 코드 분석</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              E-P / R-C / M-O / S-F 점수 차이를 기반으로 결과 코드를 만들고, 그 코드로 유형을 직접 매핑합니다.
            </p>
          </div>

          <div className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_12px_40px_rgba(15,23,42,0.05)] backdrop-blur">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-100 text-lg font-black text-violet-700">
              3
            </div>
            <h3 className="text-xl font-black text-slate-900">상담형 리포트</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              학습 전략, 부모 코칭, 진로 방향, 주의 패턴까지 한 번에 확인할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function TestScreen({
  currentIndex,
  progress,
  onReset,
  onAnswer,
}: {
  currentIndex: number;
  progress: number;
  onReset: () => void;
  onAnswer: (value: number) => void;
}) {
  return (
    <section className="mx-auto max-w-4xl px-5 py-8 md:px-8 md:py-12 lg:px-10">
      <div className="overflow-hidden rounded-[34px] border border-white/70 bg-white/85 p-6 shadow-[0_18px_70px_rgba(15,23,42,0.08)] backdrop-blur md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-semibold text-sky-700">학습성향 정밀 검사</div>
            <div className="mt-2 text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
              문항 {currentIndex + 1} / {QUESTIONS.length}
            </div>
            <div className="mt-1 text-sm text-slate-500">
              현재 문항에 가장 가까운 응답을 선택해 주세요.
            </div>
          </div>

          <button
            onClick={onReset}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
          >
            처음으로
          </button>
        </div>

        <div className="mt-6">
          <ProgressBar value={progress} />
          <div className="mt-2 text-right text-sm font-semibold text-slate-500">
            {Math.round(progress)}%
          </div>
        </div>

        <div className="mt-8 rounded-[30px] border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 md:p-8">
          <div className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-4 py-1.5 text-sm font-bold text-sky-700">
            QUESTION
          </div>

          <h2 className="mt-5 text-2xl font-black leading-relaxed tracking-tight text-slate-900 md:text-3xl md:leading-[1.6]">
            {QUESTIONS[currentIndex]}
          </h2>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {CHOICES.map((choice, idx) => (
            <button
              key={choice.label}
              onClick={() => onAnswer(choice.value)}
              className={
                idx === 0
                  ? "rounded-[26px] border border-sky-200 bg-gradient-to-r from-sky-600 to-violet-600 px-6 py-6 text-center text-lg font-black text-white shadow-lg shadow-sky-200/50 transition hover:-translate-y-0.5"
                  : "rounded-[26px] border border-slate-200 bg-white px-6 py-6 text-center text-lg font-black text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50"
              }
            >
              <div className="text-sm font-semibold opacity-80">
                {idx === 0 ? "선택 1" : "선택 2"}
              </div>
              <div className="mt-1">{choice.label}</div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function ResultScreen({
  report,
  resolved,
  axes,
  onDownloadPdf,
  onReset,
}: {
  report: Report;
  resolved: ResolvedResult;
  axes: {
    name: string;
    left: string;
    right: string;
    leftValue: number;
    rightValue: number;
  }[];
  onDownloadPdf: () => void;
  onReset: () => void;
}) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-12 lg:px-10">
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-[34px] border border-white/70 bg-white/88 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur">
            <div
              className="px-6 py-10 text-white md:px-8"
              style={{
                background: `linear-gradient(135deg, ${report.color} 0%, #0f172a 100%)`,
              }}
            >
              <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm font-semibold text-white/90">
                무료 결과 리포트
              </div>
              <h1 className="mt-5 text-3xl font-black tracking-tight md:text-4xl">
                {report.title}
              </h1>
              <div className="mt-2 text-sm text-white/75">
                결과 코드 {resolved.fullCode} · {report.subtitle}
              </div>
              <p className="mt-5 rounded-2xl border border-white/10 bg-white/10 p-5 text-[15px] leading-8 text-white/90">
                {report.summary}
              </p>
            </div>

            <div className="p-6 md:p-8">
              <div className="grid gap-4">
                {axes.map((axis) => (
                  <div
                    key={axis.name}
                    className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5"
                  >
                    <div className="flex items-center justify-between gap-3 text-sm font-bold text-slate-500">
                      <span>{axis.left}</span>
                      <span className="rounded-full bg-white px-3 py-1 text-slate-700 ring-1 ring-slate-200">
                        {axis.name}
                      </span>
                      <span>{axis.right}</span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-white px-4 py-4 text-center ring-1 ring-slate-200">
                        <div className="text-xs font-semibold tracking-[0.14em] text-slate-400">
                          LEFT
                        </div>
                        <div className="mt-2 text-base font-black text-slate-800">
                          {scoreLabel(axis.leftValue)}
                        </div>
                      </div>
                      <div className="rounded-2xl bg-white px-4 py-4 text-center ring-1 ring-slate-200">
                        <div className="text-xs font-semibold tracking-[0.14em] text-slate-400">
                          RIGHT
                        </div>
                        <div className="mt-2 text-base font-black text-slate-800">
                          {scoreLabel(axis.rightValue)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={onDownloadPdf}
                  className="rounded-2xl bg-gradient-to-r from-sky-700 to-violet-600 px-6 py-4 text-sm font-black text-white shadow-lg shadow-sky-200/50 transition hover:-translate-y-0.5"
                >
                  PDF 저장
                </button>
                <button
                  onClick={onReset}
                  className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                >
                  다시 검사하기
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <SectionCard title="학습 전략">{report.strategy}</SectionCard>
          <SectionCard title="부모 코칭">{report.parent}</SectionCard>
          <SectionCard title="진로 · 학교 방향">{report.path}</SectionCard>
          <SectionCard title="주의 패턴">{report.danger}</SectionCard>
          <SectionCard title="추천 대화 방식">{report.talk}</SectionCard>
        </div>
      </div>
    </section>
  );
}

export default function Page() {
  const [step, setStep] = useState<Step>("landing");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  const progress = useMemo(() => (answers.length / QUESTIONS.length) * 100, [answers.length]);
  const scores = useMemo(() => makeScores(answers), [answers]);
  const resolved = useMemo(() => resolveResult(scores), [scores]);
  const report = RESULT_DB[resolved.key] || RESULT_DB.DEFAULT;

  const axes = useMemo(() => {
    const profile = getAxisProfile(scores);

    const axisPair = (value: number) => {
      const magnitude = Math.abs(value);

      const strong =
        magnitude >= 1.2 ? 4.8 :
        magnitude >= 0.6 ? 3.8 :
        magnitude >= 0.2 ? 3.0 : 2.6;

      const weak =
        magnitude >= 1.2 ? 2.0 :
        magnitude >= 0.6 ? 2.4 :
        magnitude >= 0.2 ? 2.8 : 3.0;

      return { strong, weak };
    };

    const socialPair = axisPair(profile.social);
    const trackPair = axisPair(profile.track);
    const judgmentPair = axisPair(profile.judgment);
    const stylePair = axisPair(profile.style);

    return [
      {
        name: "적극성",
        left: "내향",
        right: "외향",
        leftValue: profile.social < 0 ? socialPair.strong : socialPair.weak,
        rightValue: profile.social >= 0 ? socialPair.strong : socialPair.weak,
      },
      {
        name: "학습 결",
        left: "문과",
        right: "이과",
        leftValue: profile.track < 0 ? trackPair.strong : trackPair.weak,
        rightValue: profile.track >= 0 ? trackPair.strong : trackPair.weak,
      },
      {
        name: "판단 방식",
        left: "감정",
        right: "사고",
        leftValue: profile.judgment < 0 ? judgmentPair.strong : judgmentPair.weak,
        rightValue: profile.judgment >= 0 ? judgmentPair.strong : judgmentPair.weak,
      },
      {
        name: "실행 스타일",
        left: "자유",
        right: "책임",
        leftValue: profile.style < 0 ? stylePair.strong : stylePair.weak,
        rightValue: profile.style >= 0 ? stylePair.strong : stylePair.weak,
      },
    ];
  }, [scores]);

  const startTest = () => {
    setStep("test");
    setCurrentIndex(0);
    setAnswers([]);
  };

  const handleAnswer = (value: number) => {
    const next = [...answers, value];
    setAnswers(next);

    if (currentIndex === QUESTIONS.length - 1) {
      setStep("result");
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const resetAll = () => {
    setStep("landing");
    setCurrentIndex(0);
    setAnswers([]);
  };

  const handleDownloadPdf = () => {
    generatePrintableReport({
      report,
      resultCode: resolved.fullCode,
      axes,
    });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.08),_transparent_30%),linear-gradient(180deg,#f8fafc_0%,#eef6ff_45%,#f8fafc_100%)] text-slate-900">
      {step === "landing" && <LandingScreen onStart={startTest} />}

      {step === "test" && (
        <TestScreen
          currentIndex={currentIndex}
          progress={progress}
          onReset={resetAll}
          onAnswer={handleAnswer}
        />
      )}

      {step === "result" && (
        <ResultScreen
          report={report}
          resolved={resolved}
          axes={axes}
          onDownloadPdf={handleDownloadPdf}
          onReset={resetAll}
        />
      )}
    </div>
  );
}