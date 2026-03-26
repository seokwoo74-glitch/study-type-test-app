"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

type Step = "landing" | "form" | "test" | "result";

type StudentInfo = {
  name: string;
  grade: string;
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
  aura: string;
};

type SubmissionRecord = {
  id: string;
  createdAt: string;
  student: StudentInfo;
  answers: number[];
  resultKey: string;
  resultCode: string;
  reportTitle: string;
  scores: Record<string, number>;
};

const STORAGE_KEY = "study_type_submissions_v1";

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
      "자기주도성이 강하므로 학생의 의견을 중심으로 학습 방향을 설계하되, 내신·대회·전형 정보를 균형 있게 관리하는 것이 좋습니다.",
    parent:
      "통제보다 신뢰와 지원이 효과적입니다. 수준이 맞는 집단에서 더 크게 성장할 가능성이 높습니다.",
    path: "서울대, 카이스트, 포항공대, 의학·공학·자연과학 계열과 잘 맞습니다.",
    danger: "맞지 않는 환경에서는 흥미가 급격히 떨어질 수 있습니다.",
    talk: "‘왜 그렇게 생각했는지 설명해볼래?’ 같은 질문형 대화가 효과적입니다.",
    color: "#2563eb",
  },
  ERMF: {
    title: "이과 영재형",
    subtitle: "3% 미만",
    summary:
      "특정 과목에서 매우 높은 성취 가능성을 보이며, 관심 분야에서는 압도적 몰입을 보일 수 있는 유형입니다.",
    strategy:
      "관심 과목의 강점을 유지하면서도 시작한 일을 성과물로 연결할 수 있도록 고른 학습과 마무리 습관을 설계하는 것이 중요합니다.",
    parent: "흥미 중심 몰입이 강해 균형 잡힌 학습 리듬 관리가 필요합니다.",
    path: "수학, 물리, 전자, 발명, IT·연구 계열과 잘 맞습니다.",
    danger: "마무리와 꾸준함이 약해지면 성과가 불안정해질 수 있습니다.",
    talk: "‘잘하는 걸 살리면서 끝까지 연결해보자’는 접근이 효과적입니다.",
    color: "#0f766e",
  },
  eROS: {
    title: "이과모범형",
    subtitle: "4%~10% 미만",
    summary: "이과 성향과 자기관리 능력이 함께 강한 안정형 상위권입니다.",
    strategy:
      "내신과 모의고사를 고르게 관리하며 시험 불안과 외부 활동 리듬만 잘 조절하면 강점을 꾸준히 유지할 수 있습니다.",
    parent: "친구 관계와 외부 활동이 학습 흐름을 방해하지 않도록 점검이 필요합니다.",
    path: "SKY, 의·치·한의대, 자연과학, 공학, 수의학 계열과 잘 맞습니다.",
    danger: "관계와 활동에 에너지가 분산될 수 있습니다.",
    talk: "‘지금의 리듬만 지키면 충분히 좋은 결과로 이어질 수 있어’라는 대화가 좋습니다.",
    color: "#0891b2",
  },
  pROS: {
    title: "(수동적) 이과 모범형",
    subtitle: "4%~10% 미만",
    summary: "성실함과 인내심을 바탕으로 상위권을 안정적으로 유지하는 유형입니다.",
    strategy:
      "개념 정리와 실수 관리, 시험 불안 조절이 중요하며 적극적 경험을 조금씩 넓히는 것이 좋습니다.",
    parent: "안정감을 해치지 않는 선에서 경험의 폭을 넓혀주는 것이 좋습니다.",
    path: "SKY, 지방의대, 자연과학, 공학, 수의학, 약학 계열과 잘 맞습니다.",
    danger: "실수 하나에 멘탈 영향이 큰 편입니다.",
    talk: "‘차분히 쌓아온 힘이 크다’는 식의 대화가 좋습니다.",
    color: "#0284c7",
  },
  PRMF: {
    title: "이과 뺀질이형",
    subtitle: "20% 미만",
    summary:
      "특정 과목에서는 강점을 보이지만 흥미 없는 과목은 쉽게 놓칠 수 있는 유형입니다.",
    strategy:
      "절대 학습시간 확보, 감독이 있는 환경, 선호 과목의 성과를 전체 학습 동기로 연결하는 구조가 필요합니다.",
    parent: "자유도보다 책임감이 생기는 환경이 더 적합합니다.",
    path: "이공계열, 논술·정시 전략, IT 분야와 연결될 수 있습니다.",
    danger: "좋아하는 과목만 밀고 나가다 전체 균형이 무너질 수 있습니다.",
    talk: "‘짧게라도 끝까지 가는 힘을 같이 만들어보자’는 식의 대화가 좋습니다.",
    color: "#7c3aed",
  },
  EROF: {
    title: "외향적 이과뺀질형",
    subtitle: "20% 미만",
    summary:
      "관심 있는 과목에서는 번뜩이는 성과를 보이지만 주변 환경의 영향을 크게 받는 유형입니다.",
    strategy: "통제적 환경, 선택과 집중, 책임감 경험이 효과적입니다.",
    parent: "학습 공간과 함께하는 집단을 신중히 선택하는 것이 중요합니다.",
    path: "자유전공, 자연과학, 건축, IT 마케팅, 이공계 연구 계열과 잘 맞습니다.",
    danger: "많은 일을 시작하지만 끝맺음이 약할 수 있습니다.",
    talk: "‘환경을 잘 고르면 강점이 훨씬 크게 드러날 수 있어’라는 코칭이 효과적입니다.",
    color: "#9333ea",
  },
  PROS: {
    title: "이과 잠재성장형",
    subtitle: "70% 내외",
    summary:
      "현재 강점이 선명하게 드러나지 않았더라도 기초를 차분히 쌓을수록 성장 가능성이 커지는 유형입니다.",
    strategy:
      "선행보다 내신 중심으로 접근하고 한 과목씩 성취 경험을 만드는 방식이 효과적입니다.",
    parent: "비교보다 작은 성공 경험의 축적이 중요합니다.",
    path: "간호, 사범, 이과대학, 교사·간호사·물리치료사·약사 계열과 잘 맞습니다.",
    danger: "막연한 목표만 세우면 쉽게 지칠 수 있습니다.",
    talk: "‘이번에는 이 한 가지를 끝내보자’처럼 작고 분명한 목표가 효과적입니다.",
    color: "#ea580c",
  },
  ECMF: {
    title: "문과 창의적영재형",
    subtitle: "1% 미만",
    summary:
      "문과 성향의 창의성과 표현력이 매우 강하며 차별화된 결과물을 만들 가능성이 높은 유형입니다.",
    strategy: "관심 분야 심화 학습과 결과물 축적이 잘 맞습니다.",
    parent: "다름을 교정하기보다 강점이 성과로 연결되게 도와주는 것이 중요합니다.",
    path: "어문, 언론정보, 연극영화, 광고, 방송PD, 게임기획 계열과 잘 맞습니다.",
    danger: "실행 리듬이 무너지면 결과가 불안정해질 수 있습니다.",
    talk: "‘네 생각을 결과물로 보여줄 방법을 같이 찾아보자’는 접근이 좋습니다.",
    color: "#db2777",
  },
  ECMS: {
    title: "문과 모범형 영재형",
    subtitle: "2% 미만",
    summary:
      "안정된 성과와 자기관리 능력을 함께 갖춘 이상적인 문과 영재형입니다.",
    strategy: "신뢰를 기반으로 하되 체력·멘탈 관리까지 함께 챙기면 좋습니다.",
    parent: "과한 개입보다 신뢰와 점검이 적합합니다.",
    path: "SKY, 경영·행정·신문방송·법조·외교관 계열과 잘 맞습니다.",
    danger: "완벽주의와 부담감이 누적될 수 있습니다.",
    talk: "‘지금도 충분히 잘 가고 있어’라는 메시지가 중요합니다.",
    color: "#2563eb",
  },
  ECOS: {
    title: "내성적 문과영재형",
    subtitle: "3% 미만",
    summary:
      "언어·외국어 영역의 강점과 깊이 있는 사고를 함께 지닌 문과 상위권 유형입니다.",
    strategy: "심화 학습과 실천 습관을 함께 보완하는 것이 중요합니다.",
    parent: "겉으로 드러나지 않는 실행 부족을 세심하게 관리해주면 크게 성장할 수 있습니다.",
    path: "정치외교, 신문방송, 법조, 언론, 외교관 계열과 잘 맞습니다.",
    danger: "실행력이 떨어지면 결과가 기대만큼 드러나지 않을 수 있습니다.",
    talk: "‘깊이는 충분하니 이제 실천으로 연결해보자’는 대화가 효과적입니다.",
    color: "#7c3aed",
  },
  PCOF: {
    title: "문과 잠재성장형",
    subtitle: "70% 내외",
    summary: "차분한 기반 위에서 성장 가능성이 큰 유형입니다.",
    strategy:
      "선행보다 내신 중심 학습이 적합하며 작은 성취를 반복적으로 만드는 것이 중요합니다.",
    parent: "비교보다 성취 경험의 축적이 우선입니다.",
    path: "아동, 심리, 사범, 사회복지, 상담, 교육 관련 계열과 잘 맞습니다.",
    danger: "막연한 계획만 세우고 쉽게 지칠 수 있습니다.",
    talk: "‘이번엔 어디까지 해냈는지 같이 확인하자’는 대화가 좋습니다.",
    color: "#ea580c",
  },
  DEFAULT: {
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
};

const CHARACTER_META: Record<string, CharacterMeta> = {
  ERMS: { label: "창의 연구자", tagline: "깊이 있는 탐구와 독창성이 빛나는 최상위 이과형", emoji: "🧠", aura: "from-blue-500/25 via-sky-400/10 to-cyan-300/20" },
  ERMF: { label: "몰입 발명가", tagline: "좋아하는 분야에 압도적으로 빠져드는 영재형", emoji: "⚡", aura: "from-teal-500/25 via-emerald-400/10 to-cyan-300/20" },
  eROS: { label: "엘리트 플래너", tagline: "성실함과 자기관리가 돋보이는 안정형 상위권", emoji: "📘", aura: "from-sky-500/25 via-cyan-400/10 to-blue-300/20" },
  pROS: { label: "차분한 성취가", tagline: "묵직하게 쌓아 올리는 실속형 상위권", emoji: "🛡️", aura: "from-cyan-500/25 via-sky-400/10 to-indigo-300/20" },
  PRMF: { label: "자유로운 문제해결사", tagline: "관심 분야에서 번뜩이는 재능을 터뜨리는 편차형", emoji: "🎯", aura: "from-violet-500/25 via-fuchsia-400/10 to-purple-300/20" },
  EROF: { label: "에너지 크리에이터", tagline: "사람과 환경 속에서 아이디어가 살아나는 활동형", emoji: "🚀", aura: "from-purple-500/25 via-fuchsia-400/10 to-pink-300/20" },
  PROS: { label: "성장 새싹", tagline: "작은 성취를 쌓을수록 크게 성장하는 잠재형", emoji: "🌱", aura: "from-orange-500/25 via-amber-400/10 to-yellow-300/20" },
  ECMF: { label: "감각 스토리텔러", tagline: "표현력과 창의성이 돋보이는 문과 창의형", emoji: "🎨", aura: "from-pink-500/25 via-rose-400/10 to-fuchsia-300/20" },
  ECMS: { label: "품격 있는 우등생", tagline: "안정성과 완성도를 동시에 갖춘 문과 영재형", emoji: "👑", aura: "from-blue-500/25 via-indigo-400/10 to-sky-300/20" },
  ECOS: { label: "깊이형 사색가", tagline: "조용하지만 강한 사고력과 언어 감각을 지닌 유형", emoji: "📚", aura: "from-violet-500/25 via-indigo-400/10 to-purple-300/20" },
  PCOF: { label: "따뜻한 성장형", tagline: "작은 성공을 발판 삼아 천천히 커지는 문과 잠재형", emoji: "☀️", aura: "from-orange-500/25 via-yellow-400/10 to-amber-300/20" },
  DEFAULT: { label: "성향 분석 캐릭터", tagline: "현재 응답을 바탕으로 가장 가까운 성향을 분석했어요.", emoji: "✨", aura: "from-slate-500/25 via-slate-300/10 to-sky-300/20" },
};

const CODE_TO_RESULT_KEY: Record<string, string> = {
  ERMS: "ERMS",
  ERMF: "ERMF",
  EROS: "eROS",
  eROS: "eROS",
  pROS: "pROS",
  PRMF: "PRMF",
  PROF: "PROS",
  PROS: "PROS",
  ECMF: "ECMF",
  ECMS: "ECMS",
  ECOS: "ECOS",
  PCOF: "PCOF",
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
  const mappedKey = CODE_TO_RESULT_KEY[display.code] ?? "DEFAULT";

  return {
    key: mappedKey,
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

function saveSubmission(record: SubmissionRecord) {
  if (typeof window === "undefined") return;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const parsed: SubmissionRecord[] = raw ? JSON.parse(raw) : [];
  parsed.unshift(record);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
}

function generatePrintableReport({
  report,
  resultCode,
  student,
  axes,
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
          body { margin: 0; font-family: Arial, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif; background: #f8fafc; color: #0f172a; }
          .wrap { max-width: 980px; margin: 0 auto; padding: 32px 24px 56px; }
          .hero { border-radius: 28px; padding: 32px; color: white; background: linear-gradient(135deg, ${report.color} 0%, #0f172a 85%); }
          .badge { display:inline-block; padding:8px 14px; border-radius:999px; font-size:12px; font-weight:800; letter-spacing:.14em; background:rgba(255,255,255,.14); margin-right:8px; }
          .grid { display:grid; grid-template-columns:1fr 1fr; gap:18px; margin-top:22px; }
          .card { background:white; border:1px solid #e2e8f0; border-radius:22px; padding:20px; margin-top:18px; }
          .card h3 { font-size:14px; letter-spacing:.16em; color:#64748b; margin-bottom:10px; }
          .card p { font-size:15px; line-height:1.8; color:#334155; margin:0; }
        </style>
      </head>
      <body>
        <div class="wrap">
          <div class="hero">
            <div>
              <span class="badge">LEARNING REPORT</span>
              <span class="badge">${escapeHtml(resultCode)}</span>
            </div>
            <h1 style="margin:18px 0 0; font-size:34px;">${escapeHtml(report.title)}</h1>
            <p style="margin-top:10px; font-size:16px;">${escapeHtml(report.subtitle)}</p>
            <p style="margin-top:18px; line-height:1.9; font-size:15px; opacity:.94;">${escapeHtml(report.summary)}</p>
            <p style="margin-top:18px; line-height:1.8; font-size:14px; opacity:.9;">이름: ${escapeHtml(student.name)} / 학년: ${escapeHtml(student.grade)} / 전화번호: ${escapeHtml(student.phone)}</p>
          </div>

          <div class="grid">
            <div class="card"><h3>학습 전략</h3><p>${escapeHtml(report.strategy)}</p></div>
            <div class="card"><h3>부모 코칭</h3><p>${escapeHtml(report.parent)}</p></div>
            <div class="card"><h3>진로 방향</h3><p>${escapeHtml(report.path)}</p></div>
            <div class="card"><h3>주의 패턴</h3><p>${escapeHtml(report.danger)}</p></div>
          </div>

          <div class="card">
            <h3>대화 제안</h3>
            <p>${escapeHtml(report.talk)}</p>
          </div>

          <div class="card">
            <h3>축 분석 요약</h3>
            ${axes
              .map(
                (axis) =>
                  `<p style="margin-bottom:10px;">${escapeHtml(axis.name)} · ${escapeHtml(axis.left)} ${axis.leftValue} / ${escapeHtml(axis.right)} ${axis.rightValue}</p>`
              )
              .join("")}
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
      }}
    >
      <div className="mb-5">
        <div className="text-xs font-extrabold tracking-[0.16em] text-slate-400">
          SECTION
        </div>
        <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
          {title}
        </h3>
        {desc ? <p className="mt-2 text-sm leading-7 text-slate-500">{desc}</p> : null}
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
  student,
}: {
  report: Report;
  meta: CharacterMeta;
  code: string;
  student: StudentInfo;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-[32px] border p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.16)]"
      style={{
        background: `linear-gradient(135deg, ${report.color} 0%, #0f172a 88%)`,
        borderColor: "rgba(255,255,255,0.12)",
      }}
    >
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${meta.aura}`} />
      <div className="relative z-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <div className="flex flex-wrap gap-3">
            <HeroBadge>RESULT TYPE</HeroBadge>
            <HeroBadge>코드 {code}</HeroBadge>
            <HeroBadge>{meta.label}</HeroBadge>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/14 text-3xl">
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
                학생 정보
              </div>
              <div className="mt-2 text-base font-black text-white">
                {student.name}
              </div>
              <div className="mt-1 text-sm font-semibold text-white/70">
                {student.grade} / {student.phone}
              </div>
            </div>

            <div className="rounded-[22px] border border-white/12 bg-white/10 p-4 backdrop-blur">
              <div className="text-[11px] font-extrabold tracking-[0.16em] text-white/55">
                결과 코드
              </div>
              <div className="mt-2 text-base font-black text-white">
                {code}
              </div>
              <div className="mt-1 text-sm font-semibold text-white/70">
                {report.subtitle}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <div className="flex h-[280px] w-full max-w-[280px] flex-col items-center justify-center rounded-[30px] border border-white/12 bg-white/10 p-4 backdrop-blur text-center">
            <div className="text-6xl">{meta.emoji}</div>
            <div className="mt-4 text-lg font-black text-white">{meta.label}</div>
            <div className="mt-2 px-4 text-sm leading-6 text-white/70">
              {meta.tagline}
            </div>
          </div>
        </div>
      </div>
    </div>
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

function LandingScreen({ onStart }: { onStart: () => void }) {
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

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onStart}
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-7 py-3.5 text-sm font-black text-white shadow-[0_16px_40px_rgba(15,23,42,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800"
              >
                검사 시작하기
              </button>

              <div className="text-sm font-semibold text-slate-500">
                먼저 학생 기본 정보를 입력한 뒤 검사를 시작합니다.
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
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
            <div className="mb-5">
              <div className="text-xs font-extrabold tracking-[0.16em] text-slate-400">
                INFO
              </div>
              <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                진행 전 입력 정보
              </h3>
            </div>

            <div className="grid gap-3 text-sm font-semibold text-slate-700">
              <div className="rounded-2xl bg-slate-50 p-4">이름</div>
              <div className="rounded-2xl bg-slate-50 p-4">학년</div>
              <div className="rounded-2xl bg-slate-50 p-4">전화번호</div>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

function StudentFormScreen({
  student,
  onChange,
  onBack,
  onSubmit,
}: {
  student: StudentInfo;
  onChange: (field: keyof StudentInfo, value: string) => void;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const isValid =
    student.name.trim().length > 0 &&
    student.grade.trim().length > 0 &&
    student.phone.trim().length > 0;

  return (
    <Shell>
      <div className="mx-auto max-w-3xl">
        <SectionCard
          title="학생 정보 입력"
          desc="검사 시작 전 이름, 학년, 전화번호를 입력해 주세요."
        >
          <div className="grid gap-4">
            <div>
              <label className="mb-2 block text-sm font-black text-slate-700">
                이름
              </label>
              <input
                value={student.name}
                onChange={(e) => onChange("name", e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-slate-400"
                placeholder="예: 김민준"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-black text-slate-700">
                학년
              </label>
              <input
                value={student.grade}
                onChange={(e) => onChange("grade", e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-slate-400"
                placeholder="예: 중2 / 고1"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-black text-slate-700">
                전화번호
              </label>
              <input
                value={student.phone}
                onChange={(e) => onChange("phone", e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-slate-400"
                placeholder="예: 010-1234-5678"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onBack}
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
            >
              이전으로
            </button>

            <button
              type="button"
              onClick={onSubmit}
              disabled={!isValid}
              className="rounded-full bg-slate-900 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              검사 시작하기
            </button>
          </div>
        </SectionCard>
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
  student,
}: {
  currentIndex: number;
  answers: number[];
  onAnswer: (value: number) => void;
  onPrev: () => void;
  isTransitioning: boolean;
  student: StudentInfo;
}) {
  const safeIndex = Math.min(Math.max(currentIndex, 0), QUESTIONS.length - 1);
  const progress = Math.round(((safeIndex + 1) / QUESTIONS.length) * 100);
  const selected = answers[safeIndex] ?? null;

  return (
    <Shell>
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 rounded-[24px] border border-slate-200 bg-white/90 px-5 py-4 text-sm font-semibold text-slate-700 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
          {student.name} / {student.grade} / {student.phone}
        </div>

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

function ResultScreen({
  answers,
  onRestart,
  student,
}: {
  answers: number[];
  onRestart: () => void;
  student: StudentInfo;
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

  const printableHtml = useMemo(
    () =>
      generatePrintableReport({
        report,
        resultCode: resolved.fullCode,
        student,
        axes,
      }),
    [report, resolved.fullCode, student, axes]
  );

  return (
    <Shell>
      <div className="grid gap-6">
        <CharacterSpotlight
          report={report}
          meta={characterMeta}
          code={resolved.code}
          student={student}
        />

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
                  background: hexToRgba(report.color, 0.08),
                  borderColor: hexToRgba(report.color, 0.15),
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
            </SectionCard>
          </div>

          <div className="grid gap-6">
            <SectionCard
              title="결과 해석"
              desc="유형 설명과 실제 적용 방향을 함께 확인해 보세요."
              accentColor={report.color}
            >
              <div className="grid gap-4">
                <InfoItem title="이름" value={student.name} />
                <InfoItem title="학년" value={student.grade} />
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
            </SectionCard>
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
  const [hasSavedResult, setHasSavedResult] = useState(false);

  const [student, setStudent] = useState<StudentInfo>({
    name: "",
    grade: "",
    phone: "",
  });

  const [answers, setAnswers] = useState<number[]>(() =>
    Array(QUESTIONS.length).fill(-1)
  );

  const answeredCount = useMemo(
    () => answers.filter((answer) => answer !== -1).length,
    [answers]
  );
  const isComplete = answeredCount === QUESTIONS.length;

  const scores = useMemo(() => makeScores(answers), [answers]);
  const resolved = useMemo(() => resolveResult(scores), [scores]);
  const report = RESULT_DB[resolved.key] || RESULT_DB.DEFAULT;

  useEffect(() => {
    if (step !== "result" || hasSavedResult) return;
    if (!isComplete) return;

    const record: SubmissionRecord = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      student,
      answers,
      resultKey: resolved.key,
      resultCode: resolved.code,
      reportTitle: report.title,
      scores,
    };

    saveSubmission(record);
    setHasSavedResult(true);
  }, [step, hasSavedResult, isComplete, student, answers, resolved, report, scores]);

  const handleStart = () => {
    setStep("form");
  };

  const handleStudentChange = (field: keyof StudentInfo, value: string) => {
    setStudent((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFormSubmit = () => {
    if (!student.name.trim() || !student.grade.trim() || !student.phone.trim()) {
      window.alert("이름, 학년, 전화번호를 모두 입력해 주세요.");
      return;
    }
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
    setHasSavedResult(false);
    setStudent({
      name: "",
      grade: "",
      phone: "",
    });
    setStep("landing");
  };

  if (step === "landing") {
    return <LandingScreen onStart={handleStart} />;
  }

  if (step === "form") {
    return (
      <StudentFormScreen
        student={student}
        onChange={handleStudentChange}
        onBack={() => setStep("landing")}
        onSubmit={handleFormSubmit}
      />
    );
  }

  if (step === "test" || !isComplete) {
    return (
      <TestScreen
        currentIndex={currentIndex}
        answers={answers}
        onAnswer={handleAnswer}
        onPrev={handlePrev}
        isTransitioning={isTransitioning}
        student={student}
      />
    );
  }

  return (
    <ResultScreen
      answers={answers}
      onRestart={handleRestart}
      student={student}
    />
  );
}