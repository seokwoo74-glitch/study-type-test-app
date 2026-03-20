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
  { F: 1 }, { F: 5 }, { E: 5 }, { C: 3 }, { R: 5 }, { C: 5 }, { M: 5 }, { M: 5 }, { E: 3 }, { R: 5 },
  { C: 3 }, { M: 5 }, { E: 5 }, { P: 5 }, { R: 5 }, { P: 5 }, { P: 3 }, { C: 5 }, { P: 3 }, { P: 1 },
  { C: 5 }, { C: 5 }, { C: 5 }, { P: 5 }, { P: 5 }, { R: 5 }, { R: 1 }, { C: 5 }, { P: 5 }, { R: 3 },
  { C: 5 }, { E: 5 }, { C: 3 }, { R: 5 }, { R: 3 }, { C: 3 }, { C: 1 }, { C: 5 }, { P: 3 }, { R: 5 },
  { M: 5 }, { M: 5 }, { M: 5 }, { F: 5 }, { R: 3 }, { C: 5 }, { M: 5 }, { M: 3 }, { M: 3 }, { F: 3 },
  { F: 5 }, { F: 5 }, { F: 1 }, { E: 3 }, { R: 5 }, { C: 5 }, { M: 3 }, { F: 5 }, { E: 5 }, { E: 3 },
  { P: 5 }, { F: 5 }, { F: 3 }, { E: 5 }, { P: 5 }, { F: 5 }, { C: 3 }, { F: 5 }, { E: 3 }, { F: 3 },
  { C: 3 }, { F: 3 }, { F: 5 }, { P: 3 }, { P: 3 }, { F: 5 }, { F: 3 }, { P: 5 }, { M: 3 }, { F: 3 },
];

const CHOICES = [
  { label: "매우 그렇다", value: 5 },
  { label: "그렇다", value: 4 },
  { label: "보통", value: 3 },
  { label: "아니다", value: 2 },
  { label: "전혀 아니다", value: 1 },
];

const RESULT_DB: Record<string, Report> = {
  ERMS: {
    title: "이과 창의적 영재형",
    subtitle: "상위 1% 미만",
    summary: "이과적 두뇌와 창의적 사고가 매우 뛰어난 유형입니다.",
    strategy: "학생 주도 학습이 잘 맞고, 선행·심화 학습과 대회·경시 등 결과물 중심 활동이 효과적입니다.",
    parent: "통제보다 지원이 중요합니다. 일반 학생들과 다소 결이 다를 수 있어 맞는 학습 집단을 찾는 것이 좋습니다.",
    path: "서울대, 카이스트, 포항공대, 의학·공학·자연과학 계열에 강점이 있습니다.",
    danger: "수준이 맞지 않는 수업 환경에서는 흥미를 잃기 쉽고, 또래와 결이 안 맞으면 학습 의욕이 떨어질 수 있습니다.",
    talk: "‘왜 그렇게 생각했는지 설명해볼래?’처럼 사고를 확장시키는 질문이 좋습니다.",
    color: "#2563eb",
  },
  ERMF: {
    title: "이과 영재형",
    subtitle: "상위 3% 미만",
    summary: "특정 과목에서 압도적 성과를 보일 수 있는 유형입니다.",
    strategy: "관심 과목은 깊게, 전체 과목은 균형 있게 관리해야 강점이 실제 성과로 이어집니다.",
    parent: "산만함과 시작만 많은 패턴을 관리해 주는 것이 중요합니다.",
    path: "수학, 물리, 전자, 발명, IT·연구 계열에 강점이 있습니다.",
    danger: "좋아하는 과목만 밀고 나가다 다른 과목이 무너질 수 있습니다.",
    talk: "‘잘하는 걸 살리면서, 다른 과목은 어떻게 최소선 지킬지 같이 정하자’가 좋습니다.",
    color: "#0f766e",
  },
  eROS: {
    title: "이과 모범형",
    subtitle: "상위 4~10% 미만",
    summary: "적극성과 계획성이 함께 있어 일반고에서도 상위권 전략이 잘 통하는 유형입니다.",
    strategy: "내신 안정성과 학교 활동의 균형을 맞추며 시험 불안을 관리하는 것이 중요합니다.",
    parent: "친구·외부 활동으로 공부 리듬이 흔들리지 않도록 페이스 조절을 도와주세요.",
    path: "SKY·의대·자연과학·공학·약학 계열과 잘 맞습니다.",
    danger: "과하게 완벽하려다 시험 불안이 커질 수 있습니다.",
    talk: "‘지금도 잘하고 있고, 실수만 줄이면 된다’는 식의 안정감 주는 말이 효과적입니다.",
    color: "#0891b2",
  },
  pROS: {
    title: "수동적 이과 모범형",
    subtitle: "상위 4~10% 미만",
    summary: "성실함과 인내심으로 상위권을 유지하는 안정형 이과 학생입니다.",
    strategy: "개념 정리와 실수 관리, 적극적 교내 활동 경험을 함께 쌓을 때 더 크게 성장합니다.",
    parent: "리더십 경험과 자신감 형성을 도와주되, 과한 압박보다는 안정감을 유지해 주세요.",
    path: "지방의대·SKY·자연과학·수의학·약학 계열과 잘 맞습니다.",
    danger: "실력은 있는데 자기표현이 약해 기회를 놓칠 수 있습니다.",
    talk: "‘네 생각도 충분히 가치 있어’라는 메시지를 자주 주는 것이 좋습니다.",
    color: "#0284c7",
  },
  PRMf: {
    title: "이과 뺀질이형",
    subtitle: "상위 20% 미만",
    summary: "수학·과학처럼 좋아하는 과목은 잘하지만, 흥미 없는 과목은 쉽게 놓치는 편입니다.",
    strategy: "절대 학습시간 확보, 감독이 있는 환경, 선호 과목 성과를 다른 과목 동기로 연결하는 전략이 필요합니다.",
    parent: "자유도가 큰 환경보다 관리와 책임감이 살아나는 환경이 더 적합합니다.",
    path: "논술·정시·이공계열, IT 분야 사업·연구·CEO 등으로 연결될 수 있습니다.",
    danger: "‘머리는 좋은데 안 한다’는 말을 반복해서 들으면 자존감이 흔들릴 수 있습니다.",
    talk: "‘짧게라도 해보자, 대신 끝까지 해보자’처럼 시작과 마무리에 초점을 두는 말이 좋습니다.",
    color: "#7c3aed",
  },
  EROF: {
    title: "외향적 이과 뺀질형",
    subtitle: "상위 20% 미만",
    summary: "자신 있는 과목에서는 번뜩이지만 주변 분위기에 크게 영향을 받는 유형입니다.",
    strategy: "선택과 집중, 소규모 팀 책임감 경험, 끝맺음 훈련이 중요합니다.",
    parent: "친구·환경의 영향을 많이 받으므로 학습 공간과 함께 다니는 집단을 신중히 선택해 주세요.",
    path: "건축, 자연과학, 자유전공, IT 마케팅·이공계 CEO·연구 계열과 잘 맞습니다.",
    danger: "주변 분위기에 따라 공부 루틴이 쉽게 무너질 수 있습니다.",
    talk: "‘환경을 바꾸면 훨씬 더 잘할 수 있다’는 식의 환경 코칭이 좋습니다.",
    color: "#9333ea",
  },
  PROS: {
    title: "이과 진주형",
    subtitle: "70% 내외",
    summary: "특출난 강점은 아직 약하지만, 차분히 다지면 뒤늦게 크게 성장할 수 있는 대기만성형입니다.",
    strategy: "선행보다 내신 중심, 한 과목씩 성과를 내며 자신감 회복, 집중 시간 확보가 핵심입니다.",
    parent: "막연한 기대보다 단계적 목표를 쪼개서 달성 경험을 주는 것이 가장 중요합니다.",
    path: "간호·사범·이과대학, 교사·간호사·물리치료사·약사 계열과 잘 맞습니다.",
    danger: "비교를 많이 당하면 시작 자체를 포기할 수 있습니다.",
    talk: "‘이번 주는 이 한 개만 해보자’처럼 작은 성공을 설계하는 말이 좋습니다.",
    color: "#ea580c",
  },
  ECMf: {
    title: "문과 창의적 영재형",
    subtitle: "상위 1% 미만",
    summary: "문과 성향의 창의성과 표현력이 매우 강한 상위권 잠재력 유형입니다.",
    strategy: "특기·논술·대회·동아리 결과물과 함께 관심 과목 심화가 학습 만족도를 크게 높입니다.",
    parent: "다름을 교정하려 하기보다, 강점이 사회적 성과로 연결되게 구조를 만들어 주세요.",
    path: "어문·언론정보·연극영화·게임기획·광고·방송PD 계열과 잘 맞습니다.",
    danger: "재능은 큰데 실행 리듬이 무너지면 결과가 불안정해질 수 있습니다.",
    talk: "‘네 생각을 결과물로 보여줄 방법을 같이 찾아보자’가 가장 좋습니다.",
    color: "#db2777",
  },
  ECMs: {
    title: "문과 모범형 영재형",
    subtitle: "상위 2% 미만",
    summary: "전교권 수준의 안정된 성과와 자기관리 역량을 함께 가진 이상적 문과 영재형입니다.",
    strategy: "학생이 스스로 잘 가는 편이므로 선행·심화와 체계적 스펙 관리가 효율적입니다.",
    parent: "부모는 믿어주되, 체력과 멘탈을 꾸준히 점검하는 정도가 가장 좋습니다.",
    path: "SKY, 한의대(문과), 경영·행정·신문방송·법조·외교관 계열과 잘 맞습니다.",
    danger: "완벽주의와 부담감이 누적되면 번아웃으로 이어질 수 있습니다.",
    talk: "‘지금도 충분히 잘 가고 있다’는 신뢰 메시지가 중요합니다.",
    color: "#2563eb",
  },
  ECoS: {
    title: "내성적 문과 영재형",
    subtitle: "상위 3% 미만",
    summary: "언어·외국어 상위권과 내면의 깊이가 강한 문과형 영재입니다.",
    strategy: "심화·선행 학습과 토론·발표 기회를 함께 주되, 실천 습관을 보완하는 것이 중요합니다.",
    parent: "조용하지만 수준이 높은 아이일 수 있어, 실행 부족만 잘 관리하면 크게 성장합니다.",
    path: "SKY, 어문·정치외교·신문방송, 법조인·언론인·외교관 계열과 잘 맞습니다.",
    danger: "겉으로 얌전해 보여도 속으로는 부담이 클 수 있습니다.",
    talk: "‘천천히 말해도 괜찮아, 네 생각을 듣고 싶어’가 효과적입니다.",
    color: "#7c3aed",
  },
  pCOS: {
    title: "문과 모범형A",
    subtitle: "상위 4~10% 미만",
    summary: "자기주도성과 계획 실행이 조화를 이루는 내성적 상위권 문과형입니다.",
    strategy: "내신 안정, 시험 불안 관리, 규칙적인 멘토링이 효과적입니다.",
    parent: "지나친 간섭보다 정기적인 대화와 개념 점검으로 안정감을 주는 방식이 좋습니다.",
    path: "경영·경제·행정·교대, 교수·법조·고위직 공무원 계열과 잘 맞습니다.",
    danger: "스스로 감당하려다가 도움 요청 시점을 놓칠 수 있습니다.",
    talk: "‘어디가 막히는지 같이 보자’처럼 동행하는 태도가 좋습니다.",
    color: "#0284c7",
  },
  eCOS: {
    title: "문과 모범형B",
    subtitle: "상위 4~10% 미만",
    summary: "상위권 성적을 안정적으로 유지하면서 리더십과 대외 활동까지 가능한 유형입니다.",
    strategy: "내신 유지와 함께 활동 경험을 균형 있게 관리하면 강점이 잘 살아납니다.",
    parent: "시험 불안만 흔들리지 않게 잡아주면 학습 방식은 학생 의견을 신뢰해도 좋습니다.",
    path: "SKY·서성한, 정치외교·경영·신문방송, 기자·PD·외교관·정치인 계열과 잘 맞습니다.",
    danger: "사람 챙기느라 정작 본인 루틴이 흔들릴 수 있습니다.",
    talk: "‘리더십도 좋지만 네 리듬을 먼저 지키자’가 필요합니다.",
    color: "#059669",
  },
  PCMs: {
    title: "외향적 문과 뺀질이형",
    subtitle: "상위 20% 미만",
    summary: "친구·관계 에너지가 크고 특정 과목에는 강하지만 자기통제가 어렵기 쉬운 유형입니다.",
    strategy: "관심 과목 결과물을 만들어 동기로 삼고, 균형 잡힌 공부 시간과 감독 환경을 확보해야 합니다.",
    parent: "분위기에 휩쓸리지 않도록 관리형 환경을 만들어 주세요. 말보다 실천 점검이 중요합니다.",
    path: "신문방송·정치·호텔경영, 방송국 PD·엔터테인먼트·통역·여행 분야와 잘 맞습니다.",
    danger: "말과 계획은 많은데 실제 공부 시간이 부족해질 수 있습니다.",
    talk: "‘얼마나 했는지 숫자로 같이 보자’처럼 행동 확인 중심이 좋습니다.",
    color: "#9333ea",
  },
  PCmF: {
    title: "내향적 문과 뺀질이형",
    subtitle: "상위 20% 미만",
    summary: "조용해 보여도 관심 분야에는 강하고, 끝맺음과 균형 관리가 핵심인 유형입니다.",
    strategy: "통제적 환경과 물리적 공부 시간 확보, 관심 분야 성과물을 전체 성적 상승의 발판으로 써야 합니다.",
    parent: "겉으로 티가 덜 나서 방심하기 쉽습니다. 조용히 흐트러질 수 있어 세심한 관찰이 중요합니다.",
    path: "철학·애니메이션·사학·문헌정보·자유전공, 방송·도서·창작 관련 분야와 잘 맞습니다.",
    danger: "혼자 둬도 괜찮아 보이지만 실제로는 루틴이 무너지기 쉽습니다.",
    talk: "‘조용히 하고 있는 것도 좋지만, 끝까지 간 걸 같이 확인하자’가 좋습니다.",
    color: "#a21caf",
  },
  PCOF: {
    title: "문과 진주형",
    subtitle: "70% 내외",
    summary: "특별히 잘하는 과목은 아직 없지만, 발견 시점에 따라 가능성이 커지는 대기만성형입니다.",
    strategy: "선호 과목 중심으로 먼저 성취감을 만들고, 내신 위주로 단계적 목표를 설계하는 것이 중요합니다.",
    parent: "비교보다 동기부여와 자신감 회복이 우선입니다. 작은 성공이 쌓이면 변화 폭이 큽니다.",
    path: "아동·심리·사범·사회복지, 유치원교사·상담사·교사 계열과 잘 맞습니다.",
    danger: "잘 안 되는 경험이 쌓이면 ‘나는 원래 안 돼’로 굳어질 수 있습니다.",
    talk: "‘이번엔 여기까지 해낸 게 중요해’처럼 성취를 구체적으로 짚어주세요.",
    color: "#ea580c",
  },
  ErMS: {
    title: "문·이과 혼합 영재형",
    subtitle: "상위 4% 미만",
    summary: "문·이과 전 영역을 두루 소화할 수 있는 융합형 상위권 영재입니다.",
    strategy: "전과목 고른 학습과 함께, 시작한 일을 끝까지 성과물로 연결하는 훈련이 중요합니다.",
    parent: "산만함과 독특함이 강점으로 남을 수 있도록 마무리와 집중만 잘 도와주세요.",
    path: "자유전공·국제통상·통계·건축·행정, 외교관·건축가·한의사·예술가 계열과 잘 맞습니다.",
    danger: "관심사가 넓어 선택과 집중이 흐려질 수 있습니다.",
    talk: "‘하고 싶은 게 많을수록 우선순위를 같이 정하자’가 효과적입니다.",
    color: "#0f766e",
  },
  erOS: {
    title: "문·이과 혼합 모범형",
    subtitle: "상위 10% 미만",
    summary: "문·이과를 모두 무난하게 해내며 실리적으로 성과를 쌓는 안정형 상위권입니다.",
    strategy: "내신·활동·시험 리듬을 고르게 유지하면 가장 효율적으로 성장합니다.",
    parent: "친구·활동 때문에 학습 리듬이 깨지지 않도록 페이스만 잡아주세요.",
    path: "사회과학·경제·자연과학·한의학·통계, 공무원·교사·수의사·변호사 계열과 잘 맞습니다.",
    danger: "다 잘하려다 체력이 먼저 떨어질 수 있습니다.",
    talk: "‘잘하고 있는 것 중 꼭 챙길 것만 남기자’가 좋습니다.",
    color: "#0891b2",
  },
  PrmS: {
    title: "문·이과 혼합 수동적 모범형",
    subtitle: "상위 10% 미만",
    summary: "성실성과 안정감으로 꾸준한 상위권을 지키는 혼합형 학생입니다.",
    strategy: "개념 정리와 시험 불안 관리, 보다 적극적인 대외 활동 경험이 성장 포인트입니다.",
    parent: "실력은 있으나 자기주장이 약할 수 있어, 리더십과 발표 경험을 조금씩 쌓게 해 주세요.",
    path: "경영·경제·회계·응용통계·교대·간호, 공무원·약사·회계사·작가 계열과 잘 맞습니다.",
    danger: "실력에 비해 존재감이 약해 기회를 놓칠 수 있습니다.",
    talk: "‘네가 한 걸 드러내는 연습도 실력이다’라고 말해 주세요.",
    color: "#0284c7",
  },
  PrMF: {
    title: "문·이과 혼합 뺀질이형",
    subtitle: "상위 20% 미만",
    summary: "관심 과목만 잘하는 편차형이지만 융합적 재능과 아이디어가 살아 있는 유형입니다.",
    strategy: "균형 잡힌 과목 관리와 물리적 학습시간 확보, 관심 분야 결과물 만들기가 핵심입니다.",
    parent: "통제적 환경과 감독이 필요합니다. 시작은 잘하지만 끝맺음이 약할 수 있어 마무리 점검이 중요합니다.",
    path: "자유전공·건축·자연과학·어문·철학, PD·프리랜서·건축가 계열과 잘 맞습니다.",
    danger: "분야를 넘나드는 재능이 오히려 산만함으로 보일 수 있습니다.",
    talk: "‘재능은 충분하니, 이제 끝까지 가는 힘만 만들자’가 좋습니다.",
    color: "#7c3aed",
  },
  PrOF: {
    title: "문·이과 혼합 진주형",
    subtitle: "70% 내외",
    summary: "특별한 관심 과목은 아직 약하지만, 생활 속 훈련을 통해 뒤늦게 크게 성장할 수 있는 유형입니다.",
    strategy: "내신 중심, 선택과 집중, 정해진 시간 안에 학습량을 마무리하는 습관이 가장 중요합니다.",
    parent: "막연한 목표보다 단계적 목표를 제시하고, 선호 과목부터 자신감을 붙여 주세요.",
    path: "심리·사범·사회복지·건축·간호·식품영양, 상담·교육·영양·의류 분야와 잘 맞습니다.",
    danger: "무기력해 보일 수 있지만, 사실은 작은 성공 경험 부족인 경우가 많습니다.",
    talk: "‘오늘은 이 한 가지만 끝내자’처럼 아주 작고 선명한 목표가 중요합니다.",
    color: "#ea580c",
  },
  DEFAULT: {
    title: "학습성향 분석 결과",
    subtitle: "기본 리포트",
    summary: "현재 입력된 점수를 바탕으로 가장 가까운 유형으로 분류된 결과입니다.",
    strategy: "기본 학습 루틴을 먼저 안정화하고, 강점 과목을 중심으로 성취 경험을 늘리는 것이 좋습니다.",
    parent: "아이의 성향을 바꾸려 하기보다 맞는 환경을 찾는 접근이 효과적입니다.",
    path: "상세 결과 DB 확장에 따라 더 정밀한 추천이 이어질 수 있습니다.",
    danger: "강점이 선명하지 않을수록 비교의 영향을 더 크게 받을 수 있습니다.",
    talk: "‘네 방식에 맞는 방법을 같이 찾자’라는 접근이 좋습니다.",
    color: "#475569",
  },
};

const CODE_ALIASES: Record<string, string> = {
  ERMS: "ERMS",
  ERMs: "ERMS",
  ERMF: "ERMF",
  ERMf: "ERMF",
  EROS: "eROS",
  ERoS: "eROS",
  eROS: "eROS",
  pROS: "pROS",
  pRoS: "pROS",
  PRMF: "PRMf",
  PRMf: "PRMf",
  pRMF: "PRMf",
  pRMf: "PRMf",
  EROF: "EROF",
  ERoF: "EROF",
  eROF: "EROF",
  eRof: "EROF",
  PROF: "PROS",
  PROf: "PROS",
  PROS: "PROS",
  PRos: "PROS",
  ECMF: "ECMf",
  ECMf: "ECMf",
  eCMF: "ECMf",
  eCMf: "ECMf",
  ECMS: "ECMs",
  ECMs: "ECMs",
  eCMS: "ECMs",
  eCMs: "ECMs",
  ECOS: "ECoS",
  ECOs: "ECoS",
  ECoS: "ECoS",
  ECos: "ECoS",
  pCOS: "pCOS",
  pCoS: "pCOS",
  eCOS: "eCOS",
  eCos: "eCOS",
  PCMS: "PCMs",
  PCMs: "PCMs",
  PCmF: "PCmF",
  PCmf: "PCmF",
  pCmF: "PCmF",
  pCmf: "PCmF",
  PCOS: "PCOF",
  PCOs: "PCOF",
  PCOF: "PCOF",
  pCOF: "PCOF",
  ErMS: "ErMS",
  ErMs: "ErMS",
  EcMS: "ErMS",
  EcMs: "ErMS",
  erMS: "ErMS",
  ecMS: "ErMS",
  erMF: "ErMS",
  ecMF: "ErMS",
  erOS: "erOS",
  eroS: "erOS",
  ecOS: "erOS",
  ecoS: "erOS",
  ErmS: "erOS",
  EcmS: "erOS",
  PrmS: "PrmS",
  PcmS: "PrmS",
  prMS: "PrmS",
  pcmS: "PrmS",
  PrMF: "PrMF",
  PrMf: "PrMF",
  PcmF: "PrMF",
  pcoF: "PrMF",
  erOF: "PrMF",
  ecoF: "PrMF",
  PrOF: "PrOF",
  PrOf: "PrOF",
  PcoF: "PrOF",
  prOF: "PrOF",
  pcOF: "PrOF",
};

function scoreAnswer(baseScore: number, answerValue: number) {
  return (baseScore * answerValue) / 5;
}

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
      total[key] += scoreAnswer(Number(value), answer);
    });
  });

  return total;
}

function buildCode(scores: Record<string, number>) {
  const first = scores.E >= 12 ? "E" : "p";
  const second =
    scores.R >= scores.C ? "R" : scores.C > scores.R && scores.M > scores.F ? "C" : "r";
  const third = scores.M >= scores.S ? "M" : "O";
  const fourth = scores.F >= scores.P ? "F" : "S";
  return `${first}${second}${third}${fourth}`;
}

function resolveResult(code: string, scores: Record<string, number>) {
  const aliasKey = CODE_ALIASES[code];
  if (aliasKey && RESULT_DB[aliasKey]) return { key: aliasKey, code };

  const science = scores.S;
  const creative = scores.M;
  const logic = scores.C;
  const empathy = scores.R;
  const structured = scores.P;
  const free = scores.F;
  const outward = scores.E;

  const trackGap = Math.abs(science - creative);
  const isOutgoing = outward >= 12;
  const isStructured = structured >= free;
  const isFeeling = empathy > logic;

  if (trackGap <= 2) {
    if (creative >= 11 && (isOutgoing || isFeeling)) return { key: "ErMS", code };
    if (isStructured) return { key: "PrmS", code };
    if (free >= structured + 1) return { key: "PrMF", code };
    return { key: "PrOF", code };
  }

  if (science > creative) {
    if (creative >= 11 && isStructured && isOutgoing) return { key: "ERMS", code };
    if (creative >= 10 && free > structured) return { key: "ERMF", code };
    if (structured >= free + 1.5) return { key: isOutgoing ? "eROS" : "pROS", code };
    if (free >= structured + 1.5) return { key: isOutgoing ? "EROF" : "PRMf", code };
    return { key: "PROS", code };
  }

  if (creative > science) {
    if (creative >= 12 && empathy >= logic) return { key: "ECMf", code };
    if (structured >= free + 1.5 && creative >= 10) return { key: isOutgoing ? "ECMs" : "pCOS", code };
    if (creative >= 10) return { key: "ECoS", code };
    if (free >= structured + 1.5) return { key: isOutgoing ? "PCMs" : "PCmF", code };
    return { key: "PCOF", code };
  }

  return { key: "DEFAULT", code };
}

function scoreLabel(value: number) {
  if (value >= 4.5) return "매우 높음";
  if (value >= 3.5) return "높음";
  if (value >= 2.5) return "보통";
  return "낮음";
}

function generatePrintableReport({
  report,
  scores,
  resultCode,
}: {
  report: Report;
  scores: Record<string, number>;
  resultCode: string;
}) {
  const scoreHtml = Object.entries(scores)
    .map(
      ([key, value]) => `
        <div style="border:1px solid #e5e7eb;border-radius:12px;padding:12px;background:#f8fafc;text-align:center;">
          <div style="font-size:12px;color:#64748b;margin-bottom:6px;">${key}</div>
          <div style="font-size:22px;font-weight:700;color:#0f172a;">${value.toFixed(1)}</div>
        </div>
      `
    )
    .join("");

  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <title>학습성향 리포트</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            color: #111827;
            line-height: 1.7;
          }
          h1 { font-size: 30px; margin-bottom: 8px; }
          h2 { font-size: 20px; margin-top: 28px; margin-bottom: 10px; }
          .sub { color: #475569; margin-bottom: 24px; }
          .hero {
            background: #f8fafc;
            border: 1px solid #e5e7eb;
            border-radius: 20px;
            padding: 24px;
            margin-bottom: 24px;
          }
          .badge {
            display: inline-block;
            padding: 6px 10px;
            border-radius: 999px;
            background: #eff6ff;
            color: #2563eb;
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .box {
            border: 1px solid #e5e7eb;
            border-radius: 16px;
            padding: 18px;
            background: #ffffff;
            margin-top: 12px;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-top: 16px;
          }
          @media print {
            body { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="badge">학부모용 정밀 분석 리포트</div>
        <h1>${report.title}</h1>
        <div class="sub">결과 코드 ${resultCode} · ${report.subtitle}</div>

        <div class="hero">
          <strong>핵심 요약</strong><br />
          ${report.summary}
        </div>

        <h2>학습 전략</h2>
        <div class="box">${report.strategy}</div>

        <h2>부모 코칭</h2>
        <div class="box">${report.parent}</div>

        <h2>진로 · 학교 방향</h2>
        <div class="box">${report.path}</div>

        <h2>주의 패턴</h2>
        <div class="box">${report.danger}</div>

        <h2>추천 대화 방식</h2>
        <div class="box">${report.talk}</div>

        <h2>성향 점수 요약</h2>
        <div class="grid">${scoreHtml}</div>

        <script>
          window.onload = function() {
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
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
      <div className="h-full rounded-full bg-sky-600 transition-all" style={{ width: `${value}%` }} />
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
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <div className="mt-3 text-sm leading-7 text-slate-600">{children}</div>
    </div>
  );
}

function LandingScreen({
  onStart,
  onPreview,
}: {
  onStart: () => void;
  onPreview: () => void;
}) {
  return (
    <section className="relative overflow-hidden border-b bg-white">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-violet-50" />
      <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="mb-4 inline-flex rounded-full border border-sky-200 bg-sky-50 px-4 py-1 text-sm font-medium text-sky-700">
              학부모 신뢰형 학습성향검사 서비스
            </div>
            <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight lg:text-6xl">
              우리 아이의 <span className="text-sky-700">공부 방식</span>을
              <br />
              결과 리포트로 정확하게 보여주는 서비스
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              80문항 기반으로 아이의 학습 성향, 실행력, 사고방식, 진로 방향까지 한 번에 확인할 수 있습니다.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={onStart}
                className="rounded-2xl bg-sky-700 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-sky-200 transition hover:-translate-y-0.5"
              >
                무료 검사 시작하기
              </button>
              <button
                onClick={onPreview}
                className="rounded-2xl border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                결과 예시 보기
              </button>
            </div>
          </div>

          <div className="rounded-[32px] bg-slate-900 p-4 shadow-2xl shadow-slate-200">
            <div className="rounded-[24px] bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-500">검사 결과 미리보기</div>
                  <div className="text-2xl font-bold">문과 모범형 영재형</div>
                </div>
                <div className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                  상위권 잠재력
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-sm text-slate-500">학습 성향</div>
                  <div className="mt-2 text-lg font-semibold">문과 · 창의형</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-sm text-slate-500">행동 특성</div>
                  <div className="mt-2 text-lg font-semibold">영재형</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 sm:col-span-2">
                  <div className="text-sm text-slate-500">부모 코칭 한 줄 제안</div>
                  <div className="mt-2 text-lg font-semibold leading-7">
                    통제보다 방향 제시가 효과적이며, 결과물로 연결되는 프로젝트형 학습이 잘 맞습니다.
                  </div>
                </div>
              </div>
            </div>
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
    <section className="mx-auto max-w-3xl px-6 py-10 lg:px-10">
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium text-sky-700">학습성향 정밀 검사</div>
            <div className="mt-1 text-sm text-slate-500">
              문항 {currentIndex + 1} / {QUESTIONS.length}
            </div>
          </div>
          <button
            onClick={onReset}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            처음으로
          </button>
        </div>

        <div className="mt-5">
          <ProgressBar value={progress} />
        </div>

        <div className="mt-8 rounded-3xl bg-slate-50 p-6 lg:p-8">
          <div className="text-sm font-semibold text-slate-400">질문</div>
          <h2 className="mt-3 text-2xl font-bold leading-10 tracking-tight lg:text-3xl">
            {QUESTIONS[currentIndex]}
          </h2>
        </div>

        <div className="mt-8 grid gap-3">
          {CHOICES.map((choice) => (
            <button
              key={choice.label}
              onClick={() => onAnswer(choice.value)}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left text-base font-medium text-slate-700 transition hover:border-sky-300 hover:bg-sky-50"
            >
              {choice.label}
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
  scores,
  onDownloadPdf,
  onReset,
}: {
  report: Report;
  resolved: { key: string; code: string };
  axes: {
    name: string;
    left: string;
    right: string;
    leftValue: number;
    rightValue: number;
  }[];
  scores: Record<string, number>;
  onDownloadPdf: () => void;
  onReset: () => void;
}) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
      <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-6">
          <div className="rounded-[32px] bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-sky-700">무료 결과</div>
                <h1 className="mt-2 text-3xl font-bold tracking-tight" style={{ color: report.color }}>
                  {report.title}
                </h1>
                <div className="mt-2 text-sm text-slate-500">
                  결과 코드 {resolved.code} · {report.subtitle}
                </div>
              </div>
              <div className="rounded-2xl bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-700">
                기본 결과 제공
              </div>
            </div>

            <p className="mt-6 text-base leading-8 text-slate-600">{report.summary}</p>

            <div className="mt-8 grid gap-3">
              {axes.map((axis) => (
                <div key={axis.name} className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between text-sm font-medium text-slate-500">
                    <span>{axis.left}</span>
                    <span>{axis.name}</span>
                    <span>{axis.right}</span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white px-3 py-3 text-center text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
                      {scoreLabel(axis.leftValue)}
                    </div>
                    <div className="rounded-xl bg-white px-3 py-3 text-center text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
                      {scoreLabel(axis.rightValue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={onDownloadPdf}
                className="rounded-2xl bg-sky-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-800"
              >
                PDF 저장
              </button>
              <button
                onClick={onReset}
                className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                다시 검사하기
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <SectionCard title="학습 전략">{report.strategy}</SectionCard>
          <SectionCard title="부모 코칭">{report.parent}</SectionCard>
          <SectionCard title="진로 · 학교 방향">{report.path}</SectionCard>
          <SectionCard title="주의 패턴">{report.danger}</SectionCard>
          <SectionCard title="추천 대화 방식">{report.talk}</SectionCard>

          <SectionCard title="원점수 요약">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Object.entries(scores).map(([key, value]) => (
                <div key={key} className="rounded-2xl bg-slate-50 p-3 text-center">
                  <div className="text-xs font-semibold text-slate-400">{key}</div>
                  <div className="mt-1 text-lg font-bold text-slate-800">{value.toFixed(1)}</div>
                </div>
              ))}
            </div>
          </SectionCard>
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
  const typeCode = useMemo(() => buildCode(scores), [scores]);
  const resolved = useMemo(() => resolveResult(typeCode, scores), [typeCode, scores]);
  const report = RESULT_DB[resolved.key] || RESULT_DB.DEFAULT;

  const axes = useMemo(() => {
    const answeredCount = Math.max(answers.length, 1);
    return [
      {
        name: "적극성",
        left: "외향",
        right: "내향",
        leftValue: scores.E / answeredCount,
        rightValue: scores.P / answeredCount,
      },
      {
        name: "학습 결",
        left: "문과",
        right: "이과",
        leftValue: scores.M / answeredCount,
        rightValue: scores.S / answeredCount,
      },
      {
        name: "판단 방식",
        left: "감정",
        right: "사고",
        leftValue: scores.R / answeredCount,
        rightValue: scores.C / answeredCount,
      },
      {
        name: "실행 스타일",
        left: "자유",
        right: "책임",
        leftValue: scores.F / answeredCount,
        rightValue: scores.P / answeredCount,
      },
    ];
  }, [answers.length, scores]);

  const startTest = () => {
    setStep("test");
    setCurrentIndex(0);
    setAnswers([]);
  };

  const previewResult = () => {
    setStep("result");
    setAnswers(new Array(QUESTIONS.length).fill(3));
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
      scores,
      resultCode: resolved.code,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {step === "landing" && <LandingScreen onStart={startTest} onPreview={previewResult} />}

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
          scores={scores}
          onDownloadPdf={handleDownloadPdf}
          onReset={resetAll}
        />
      )}
    </div>
  );
}