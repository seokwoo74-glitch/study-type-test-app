"use client";

import { useEffect, useMemo, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

const supabase = createBrowserSupabaseClient();

type ResultPayload = {
  version?: number;
  submittedAt?: string;
  student?: {
    name?: string;
    grade?: string;
    school?: string;
    phone?: string;
  };
  result?: {
    key?: string;
    code?: string;
    fullCode?: string;
    diffText?: string;
    title?: string;
    subtitle?: string;
    summary?: string;
    strategy?: string;
    parent?: string;
    path?: string;
    danger?: string;
    talk?: string;
    color?: string;
  };
  scores?: {
    E?: number;
    P?: number;
    R?: number;
    C?: number;
    M?: number;
    O?: number;
    S?: number;
    F?: number;
  };
  diffs?: {
    social?: number;
    judgment?: number;
    track?: number;
    style?: number;
  };
  meta?: {
    testType?: "elementary" | "high" | null;
    totalAnswered?: number;
    totalQuestions?: number;
  };
};

type Row = {
  id: string | number;
  created_at?: string | null;

  student_name?: string | null;
  grade?: string | null;
  school?: string | null;
  phone?: string | null;

  result_code?: string | null;
  result_full_code?: string | null;
  result_title?: string | null;
  result_subtitle?: string | null;

  e_score?: number | null;
  p_score?: number | null;
  r_score?: number | null;
  c_score?: number | null;
  m_score?: number | null;
  o_score?: number | null;
  s_score?: number | null;
  f_score?: number | null;

  is_consulted?: boolean | null;
  memo?: string | null;

  result_payload?: ResultPayload | null;
};

type NormalizedPayload = {
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
    testType: "elementary" | "high" | null;
    totalAnswered: number;
    totalQuestions: number;
  };
};

const ADMIN_FALLBACK_REPORTS: Record<
  string,
  {
    title: string;
    subtitle: string;
    summary: string;
    strategy: string;
    parent: string;
    path: string;
    danger: string;
    talk: string;
    color: string;
  }
> = {
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
  EROS: {
    title: "이과모범형",
    subtitle: "4%~10% 미만",
    summary:
      "이과 성향과 자기관리 능력이 함께 강한 유형으로, 안정적인 상위권 전략이 잘 맞습니다.",
    strategy:
      "내신과 모의고사를 고르게 관리하며 시험 불안과 외부 활동으로 인한 리듬 흔들림만 잘 조절하면 강점을 꾸준히 유지할 수 있습니다.",
    parent:
      "학생의 학습 방식을 존중해도 무난하지만, 친구 관계나 외부 활동이 학습 흐름을 방해하지 않도록 점검이 필요합니다.",
    path: "SKY, 의·치·한의대, 자연과학, 공학, 수의학 계열과 잘 맞습니다.",
    danger:
      "적극적인 성향 때문에 학습보다 관계와 활동에 에너지가 분산될 수 있습니다.",
    talk: "‘지금의 리듬만 지키면 충분히 좋은 결과로 이어질 수 있어’라는 대화가 좋습니다.",
    color: "#0891b2",
  },
  PRMF: {
    title: "이과 뺀질이형",
    subtitle: "20% 미만",
    summary:
      "수학·과학 등 특정 과목에서는 강점을 보이지만, 흥미 없는 과목은 쉽게 놓칠 수 있는 유형입니다.",
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
      "관심 있는 과목에서는 번뜩이는 성과를 보이지만, 주변 환경의 영향을 크게 받는 유형입니다.",
    strategy: "통제적 환경, 선택과 집중, 책임감 경험이 효과적입니다.",
    parent:
      "환경에 따라 결과 차이가 커질 수 있어 학습 공간과 함께하는 집단을 신중히 선택하는 것이 중요합니다.",
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
    parent:
      "겉으로 드러나지 않는 실행 부족을 세심하게 관리해주면 크게 성장할 수 있습니다.",
    path: "정치외교, 신문방송, 법조, 언론, 외교관 계열과 잘 맞습니다.",
    danger: "실행력이 떨어지면 결과가 기대만큼 드러나지 않을 수 있습니다.",
    talk: "‘깊이는 충분하니 이제 실천으로 연결해보자’는 대화가 효과적입니다.",
    color: "#7c3aed",
  },
  PCOS: {
    title: "(내성적) 문과 모범형",
    subtitle: "4%~10% 미만",
    summary:
      "자기주도성과 계획 실행의 균형이 좋은 내성적 상위권 문과형입니다.",
    strategy:
      "내신 최상위권 유지, 시험 불안 관리, 개념 정리, 규칙적인 멘토링이 효과적입니다.",
    parent: "지나친 간섭보다 정기적인 대화와 점검이 적합합니다.",
    path: "경영, 경제, 행정, 교대, 법조 계열과 잘 맞습니다.",
    danger: "도움 요청 시점을 놓칠 수 있습니다.",
    talk: "‘혼자 감당하지 말고 막히는 지점을 같이 보자’는 태도가 좋습니다.",
    color: "#0284c7",
  },
  PCMS: {
    title: "(외향적) 문과뺀질이형",
    subtitle: "20% 미만",
    summary:
      "관심 과목에서는 강점을 보이지만 관계 에너지와 분위기의 영향을 크게 받는 유형입니다.",
    strategy:
      "관심 과목 결과물을 동기로 삼고 균형 잡힌 과목 관리와 절대 학습시간 확보가 필요합니다.",
    parent: "분위기에 휩쓸리지 않도록 관리형 환경을 만들어 주는 것이 중요합니다.",
    path: "신문방송, 정치, 호텔경영, PD, 엔터테인먼트 계열과 잘 맞습니다.",
    danger: "공부보다 관계와 분위기에 에너지를 더 쓸 수 있습니다.",
    talk: "‘얼마나 했는지 숫자와 결과로 확인해보자’는 방식이 좋습니다.",
    color: "#9333ea",
  },
  PCMF: {
    title: "(내향적) 문과 뺀질이",
    subtitle: "20% 미만",
    summary:
      "조용하지만 관심 분야에는 강하게 몰입하며, 학습 균형과 마무리 능력이 핵심인 유형입니다.",
    strategy:
      "통제적 환경, 절대 학습시간 확보, 관심 분야 성과물을 전체 성적 향상의 발판으로 활용하는 것이 중요합니다.",
    parent:
      "겉으로 드러나지 않아 방심하기 쉽지만 조용히 흐트러질 수 있어 세심한 관찰이 필요합니다.",
    path: "자유전공, 철학, 애니메이션, 사학, 문헌정보 계열과 잘 맞습니다.",
    danger: "마무리가 약해 성과로 연결되지 못할 수 있습니다.",
    talk: "‘끝까지 간 걸 함께 확인하자’는 식의 대화가 좋습니다.",
    color: "#a21caf",
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
    summary:
      "현재 입력된 응답을 바탕으로 가장 가까운 학습 성향으로 분류한 결과입니다.",
    strategy:
      "기본 학습 루틴을 먼저 안정화하고 강점 과목 중심으로 성취 경험을 늘리는 것이 좋습니다.",
    parent: "현재 방식에 맞는 환경과 전략을 함께 찾는 접근이 효과적입니다.",
    path: "상세 결과 DB 확장에 따라 더 정밀한 추천으로 연결될 수 있습니다.",
    danger: "강점이 선명하지 않을수록 비교의 영향을 더 크게 받을 수 있습니다.",
    talk: "‘네 방식에 맞는 방법을 같이 찾아가자’는 접근이 좋습니다.",
    color: "#475569",
  },
};

function toNumber(value: unknown) {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function normalizeAdminCode(value?: string | null) {
  const clean = String(value ?? "")
    .replace(/[^A-Za-z]/g, "")
    .toUpperCase();

  if (!clean) return "DEFAULT";

  const map: Record<string, string> = {
    PRMS: "PROS",
    PROF: "PROS",
    PCOS: "PCOS",
    PCMS: "PCMS",
    PCOF: "PCOF",
    ERMS: "ERMS",
    ERMF: "ERMF",
    EROS: "EROS",
    EROF: "EROF",
    ECMF: "ECMF",
    ECMS: "ECMS",
    ECOS: "ECOS",
    PCMF: "PCMF",
  };

  return map[clean] || clean || "DEFAULT";
}

function getFallbackReport(row: Row) {
  const payloadKey = normalizeAdminCode(row.result_payload?.result?.key);
  const fullCode = normalizeAdminCode(row.result_full_code);
  const code = normalizeAdminCode(row.result_code);

  return (
    ADMIN_FALLBACK_REPORTS[payloadKey] ||
    ADMIN_FALLBACK_REPORTS[fullCode] ||
    ADMIN_FALLBACK_REPORTS[code] ||
    ADMIN_FALLBACK_REPORTS.DEFAULT
  );
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getPayloadFromRow(row: Row): NormalizedPayload {
  const payload =
    row.result_payload && Object.keys(row.result_payload).length > 0
      ? row.result_payload
      : {
          student: {
            name: row.student_name ?? "",
            grade: row.grade ?? "",
            school: row.school ?? "",
            phone: row.phone ?? "",
          },
          result: {
            title: row.result_title ?? "",
            subtitle: row.result_subtitle ?? "",
            code: row.result_code ?? "",
            fullCode: row.result_full_code ?? "",
          },
          scores: {
            E: row.e_score ?? 0,
            P: row.p_score ?? 0,
            R: row.r_score ?? 0,
            C: row.c_score ?? 0,
            M: row.m_score ?? 0,
            O: row.o_score ?? 0,
            S: row.s_score ?? 0,
            F: row.f_score ?? 0,
          },
        };

  const fallbackReport = getFallbackReport(row);

  const E = toNumber(payload.scores?.E ?? row.e_score);
  const P = toNumber(payload.scores?.P ?? row.p_score);
  const R = toNumber(payload.scores?.R ?? row.r_score);
  const C = toNumber(payload.scores?.C ?? row.c_score);
  const M = toNumber(payload.scores?.M ?? row.m_score);
  const O = toNumber(payload.scores?.O ?? row.o_score);
  const S = toNumber(payload.scores?.S ?? row.s_score);
  const F = toNumber(payload.scores?.F ?? row.f_score);

  const social = toNumber(payload.diffs?.social ?? Math.abs(E - P));
  const judgment = toNumber(payload.diffs?.judgment ?? Math.abs(R - C));
  const track = toNumber(payload.diffs?.track ?? Math.abs(M - O));
  const style = toNumber(payload.diffs?.style ?? Math.abs(S - F));

  return {
    version: toNumber(payload.version ?? 1),
    submittedAt: String(payload.submittedAt ?? row.created_at ?? ""),
    student: {
      name: String(payload.student?.name ?? row.student_name ?? ""),
      grade: String(payload.student?.grade ?? row.grade ?? ""),
      school: String(payload.student?.school ?? row.school ?? ""),
      phone: String(payload.student?.phone ?? row.phone ?? ""),
    },
    result: {
      key: String(payload.result?.key ?? row.result_code ?? "DEFAULT"),
      code: String(payload.result?.code ?? row.result_code ?? ""),
      fullCode: String(
        payload.result?.fullCode ??
          row.result_full_code ??
          payload.result?.code ??
          row.result_code ??
          ""
      ),
      diffText: String(payload.result?.diffText ?? ""),
      title: String(
        payload.result?.title ??
          row.result_title ??
          fallbackReport.title ??
          "결과명 없음"
      ),
      subtitle: String(
        payload.result?.subtitle ??
          row.result_subtitle ??
          fallbackReport.subtitle ??
          ""
      ),
      summary: String(payload.result?.summary ?? fallbackReport.summary ?? ""),
      strategy: String(payload.result?.strategy ?? fallbackReport.strategy ?? ""),
      parent: String(payload.result?.parent ?? fallbackReport.parent ?? ""),
      path: String(payload.result?.path ?? fallbackReport.path ?? ""),
      danger: String(payload.result?.danger ?? fallbackReport.danger ?? ""),
      talk: String(payload.result?.talk ?? fallbackReport.talk ?? ""),
      color: String(payload.result?.color ?? fallbackReport.color ?? "#6366f1"),
    },
    scores: { E, P, R, C, M, O, S, F },
    diffs: { social, judgment, track, style },
    meta: {
      testType: payload.meta?.testType === "high" ? "high" : "elementary",
      totalAnswered: toNumber(payload.meta?.totalAnswered ?? 0),
      totalQuestions: toNumber(payload.meta?.totalQuestions ?? 0),
    },
  };
}

function DetailSection({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  return (
    <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{title}</p>
      <p className="mt-3 whitespace-pre-line text-[15px] leading-7 text-slate-700">
        {content || "-"}
      </p>
    </section>
  );
}

function ScoreChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="text-xs font-semibold tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-2xl font-black text-slate-900">{value}</div>
    </div>
  );
}

function DiffChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <div className="text-xs font-semibold tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-xl font-extrabold text-slate-900">{value}</div>
    </div>
  );
}

function InfoMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="text-xs font-semibold text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function TestTypeBadge({
  testType,
}: {
  testType?: "elementary" | "high" | null;
}) {
  const isHigh = testType === "high";

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-black ${
        isHigh
          ? "bg-slate-900 text-white"
          : "bg-yellow-300 text-slate-900"
      }`}
    >
      {isHigh ? "고등용" : "초·중등용"}
    </span>
  );
}

function AdminResultPreview({
  row,
  editMemo,
  setEditMemo,
  editConsulted,
  setEditConsulted,
  isDirty,
  saving,
  saveMessage,
  onSave,
}: {
  row: Row;
  editMemo: string;
  setEditMemo: (value: string) => void;
  editConsulted: boolean;
  setEditConsulted: (value: boolean) => void;
  isDirty: boolean;
  saving: boolean;
  saveMessage: string;
  onSave: () => void;
}) {
  const payload = getPayloadFromRow(row);

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
        <div
          className="p-6 text-white"
          style={{
            background: `linear-gradient(135deg, ${payload.result.color} 0%, rgba(15,23,42,0.88) 100%)`,
          }}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">검사 결과</p>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <h2 className="text-3xl font-black tracking-tight">
                  {payload.result.title || "결과명 없음"}
                </h2>
                <TestTypeBadge testType={payload.meta.testType} />
              </div>

              <p className="mt-2 text-base font-medium text-white/85">
                {payload.result.subtitle || ""}
              </p>
            </div>

            <div className="rounded-2xl bg-white/12 px-4 py-3 backdrop-blur">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                Result Code
              </div>
              <div className="mt-1 text-2xl font-black">
                {payload.result.fullCode || payload.result.code || "-"}
              </div>
              <div className="mt-1 text-sm text-white/85">
                {payload.result.diffText || ""}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 border-t border-slate-200 p-6 md:grid-cols-4">
          <InfoMini label="이름" value={payload.student.name || "-"} />
          <InfoMini label="학년" value={payload.student.grade || "-"} />
          <InfoMini label="학교" value={payload.student.school || "-"} />
          <InfoMini label="연락처" value={payload.student.phone || "-"} />
        </div>
      </section>

      <DetailSection title="종합 해석" content={payload.result.summary} />

      <div className="grid gap-4 md:grid-cols-2">
        <DetailSection title="학습 전략" content={payload.result.strategy} />
        <DetailSection title="부모 코칭" content={payload.result.parent} />
        <DetailSection title="성장 경로" content={payload.result.path} />
        <DetailSection title="주의 포인트" content={payload.result.danger} />
      </div>

      <DetailSection title="대화 가이드" content={payload.result.talk} />

      <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-slate-500">축 점수</p>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <ScoreChip label="E" value={payload.scores.E} />
          <ScoreChip label="P" value={payload.scores.P} />
          <ScoreChip label="R" value={payload.scores.R} />
          <ScoreChip label="C" value={payload.scores.C} />
          <ScoreChip label="M" value={payload.scores.M} />
          <ScoreChip label="O" value={payload.scores.O} />
          <ScoreChip label="S" value={payload.scores.S} />
          <ScoreChip label="F" value={payload.scores.F} />
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <DiffChip label="사회성 축" value={payload.diffs.social} />
          <DiffChip label="판단 축" value={payload.diffs.judgment} />
          <DiffChip label="진로 축" value={payload.diffs.track} />
          <DiffChip label="학습 축" value={payload.diffs.style} />
        </div>
      </section>

      <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-slate-500">기록 정보</p>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <InfoMini label="저장 시각" value={formatDateTime(payload.submittedAt)} />
          <InfoMini
            label="검사 유형"
            value={payload.meta.testType === "high" ? "고등용" : "초·중등용"}
          />
          <InfoMini
            label="응답 수"
            value={
              payload.meta.totalQuestions > 0
                ? `${payload.meta.totalAnswered} / ${payload.meta.totalQuestions}`
                : "-"
            }
          />
          <InfoMini label="현재 상태" value={editConsulted ? "상담 완료" : "상담 전"} />
        </div>
      </section>

      <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500">상담 관리</p>
            <h3 className="mt-1 text-xl font-black text-slate-900">
              상담 완료 / 메모 저장
            </h3>
          </div>

          <button
            type="button"
            onClick={onSave}
            disabled={!isDirty || saving}
            className={`rounded-2xl px-5 py-3 text-sm font-bold text-white transition ${
              !isDirty || saving
                ? "cursor-not-allowed bg-slate-300"
                : "bg-slate-900 hover:translate-y-[-1px]"
            }`}
          >
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>

        <div className="mt-5 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
          <div>
            <p className="text-sm font-bold text-slate-900">상담 완료 처리</p>
            <p className="mt-1 text-xs text-slate-500">
              상담을 끝냈다면 완료 상태로 바꿔둘 수 있어요.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setEditConsulted(!editConsulted)}
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${
              editConsulted
                ? "bg-emerald-500 text-white"
                : "bg-slate-200 text-slate-700"
            }`}
          >
            {editConsulted ? "상담 완료" : "상담 전"}
          </button>
        </div>

        <div className="mt-5">
          <label className="text-sm font-semibold text-slate-600">상담 메모</label>
          <textarea
            value={editMemo}
            onChange={(e) => setEditMemo(e.target.value)}
            placeholder="상담 내용, 학부모 반응, 추후 안내사항 등을 적어두세요."
            className="mt-2 min-h-[160px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              isDirty
                ? "bg-amber-100 text-amber-700"
                : "bg-emerald-100 text-emerald-700"
            }`}
          >
            {isDirty ? "저장되지 않은 변경 있음" : "저장 완료 상태"}
          </span>

          {saveMessage ? (
            <span className="text-sm font-medium text-slate-600">{saveMessage}</span>
          ) : null}
        </div>
      </section>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | number | null>(null);

  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const [editMemo, setEditMemo] = useState("");
  const [editConsulted, setEditConsulted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "1234";

  useEffect(() => {
    const saved =
      typeof window !== "undefined"
        ? sessionStorage.getItem("admin-unlocked")
        : null;
    if (saved === "true") {
      setUnlocked(true);
    }
  }, []);

  useEffect(() => {
    if (!unlocked) return;

    let active = true;

    async function fetchRows() {
      try {
        setLoading(true);
        setError("");

        const { data, error } = await supabase
          .from("test_results")
          .select(
            `
            id,
            created_at,
            student_name,
            grade,
            school,
            phone,
            result_code,
            result_full_code,
            result_title,
            result_subtitle,
            e_score,
            p_score,
            r_score,
            c_score,
            m_score,
            o_score,
            s_score,
            f_score,
            is_consulted,
            memo,
            result_payload
          `
          )
          .order("created_at", { ascending: false });

        if (error) {
          console.error("[supabase select error]", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
          });
          throw new Error(error.message || "Supabase select failed");
        }

        const safeRows = (data ?? []) as Row[];

        if (!active) return;

        setRows(safeRows);
        setSelectedId((prev) => prev ?? safeRows[0]?.id ?? null);
      } catch (err) {
        if (err instanceof Error) {
          console.error("[admin fetchRows message]", err.message);
          console.error("[admin fetchRows stack]", err.stack);
        } else {
          console.error("[admin fetchRows unknown error]", err);
        }

        if (!active) return;
        setError("관리자 데이터를 불러오지 못했어요.");
      } finally {
        if (!active) return;
        setLoading(false);
      }
    }

    void fetchRows();

    return () => {
      active = false;
    };
  }, [unlocked]);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((row) => {
      const payload = getPayloadFromRow(row);
      const fields = [
        payload.student.name,
        payload.student.grade,
        payload.student.school,
        payload.student.phone,
        payload.result.title,
        payload.result.subtitle,
        payload.result.code,
        payload.result.fullCode,
        row.memo ?? "",
      ];

      return fields.some((value) => value.toLowerCase().includes(q));
    });
  }, [rows, query]);

  const selectedRow = useMemo(() => {
    return (
      filteredRows.find((row) => String(row.id) === String(selectedId)) ??
      filteredRows[0] ??
      null
    );
  }, [filteredRows, selectedId]);

  const consultedCount = useMemo(
    () => rows.filter((row) => Boolean(row.is_consulted)).length,
    [rows]
  );

  useEffect(() => {
    if (!selectedRow) {
      setEditMemo("");
      setEditConsulted(false);
      setSaveMessage("");
      return;
    }

    setEditMemo(selectedRow.memo ?? "");
    setEditConsulted(Boolean(selectedRow.is_consulted));
    setSaveMessage("");
  }, [selectedRow]);

  const isDirty = useMemo(() => {
    if (!selectedRow) return false;
    return (
      editMemo !== (selectedRow.memo ?? "") ||
      editConsulted !== Boolean(selectedRow.is_consulted)
    );
  }, [selectedRow, editMemo, editConsulted]);

  const handleUnlock = () => {
    if (password === adminPassword) {
      setUnlocked(true);
      setPasswordError("");
      sessionStorage.setItem("admin-unlocked", "true");
      return;
    }
    setPasswordError("비밀번호가 올바르지 않습니다.");
  };

  const handleLock = () => {
    setUnlocked(false);
    setPassword("");
    setPasswordError("");
    sessionStorage.removeItem("admin-unlocked");
  };

  const handleSave = async () => {
    if (!selectedRow) return;
    if (saving) return;

    try {
      setSaving(true);
      setSaveMessage("");

      const { data, error } = await supabase
        .from("test_results")
        .update({
          memo: editMemo,
          is_consulted: editConsulted,
        })
        .eq("id", selectedRow.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      const updatedRow = data as Row;

      setRows((prev) =>
        prev.map((row) =>
          String(row.id) === String(selectedRow.id)
            ? {
                ...row,
                memo: updatedRow.memo ?? editMemo,
                is_consulted: updatedRow.is_consulted ?? editConsulted,
              }
            : row
        )
      );

      setSaveMessage("저장되었습니다.");
    } catch (err) {
      console.error(err);
      setSaveMessage("저장에 실패했어요.");
    } finally {
      setSaving(false);
    }
  };

  if (!unlocked) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.12),transparent_36%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] px-4 py-10">
        <div className="mx-auto max-w-md">
          <div className="rounded-[32px] border border-white/70 bg-white/90 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur">
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-500">
                Admin Access
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
                관리자 페이지
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                관리자 비밀번호를 입력하면 결과 기록과 상세 리포트를 확인할 수 있어요.
              </p>
            </div>

            <div className="space-y-3">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleUnlock();
                }}
                placeholder="비밀번호 입력"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              />

              {passwordError ? (
                <p className="text-sm font-medium text-rose-500">{passwordError}</p>
              ) : null}

              <button
                type="button"
                onClick={handleUnlock}
                className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:translate-y-[-1px]"
              >
                관리자 입장
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm leading-6 text-indigo-900">
              현재 기본 비밀번호는{" "}
              <span className="font-extrabold">
                {process.env.NEXT_PUBLIC_ADMIN_PASSWORD ? "환경변수값" : "1234"}
              </span>
              입니다.
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_45%,#f8fafc_100%)]">
      <div className="mx-auto max-w-[1600px] px-4 py-6 md:px-6 lg:px-8">
        <section className="mb-6 rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-500">
                Learning Type Admin
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
                학습성향 관리자 대시보드
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                저장된 검사 결과를 확인하고, 옛날 데이터도 코드 기준으로 세부내용을 자동 복구합니다.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-4">
              <InfoMini label="전체 검사" value={`${rows.length}건`} />
              <InfoMini label="상담 완료" value={`${consultedCount}건`} />
              <InfoMini label="검색 결과" value={`${filteredRows.length}건`} />
              <button
                type="button"
                onClick={handleLock}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                잠금
              </button>
            </div>
          </div>
        </section>

        <section className="mb-5 rounded-[28px] border border-white/70 bg-white/90 p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="이름, 학교, 연락처, 결과코드, 결과명, 메모 검색"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            />
          </div>
        </section>

        {loading ? (
          <section className="rounded-[28px] border border-white/70 bg-white/90 p-10 text-center shadow-sm">
            <p className="text-base font-semibold text-slate-700">
              관리자 데이터를 불러오는 중입니다...
            </p>
          </section>
        ) : error ? (
          <section className="rounded-[28px] border border-rose-200 bg-rose-50 p-6 shadow-sm">
            <p className="font-semibold text-rose-600">{error}</p>
          </section>
        ) : filteredRows.length === 0 ? (
          <section className="rounded-[28px] border border-white/70 bg-white/90 p-10 text-center shadow-sm">
            <p className="text-base font-semibold text-slate-700">
              검색 결과가 없습니다.
            </p>
          </section>
        ) : (
          <section className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
            <aside className="rounded-[28px] border border-white/70 bg-white/90 p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-900">결과 목록</h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                  {filteredRows.length}건
                </span>
              </div>

              <div className="max-h-[72vh] space-y-3 overflow-y-auto pr-1">
                {filteredRows.map((row) => {
                  const payload = getPayloadFromRow(row);
                  const active = String(selectedRow?.id) === String(row.id);

                  return (
                    <button
                      key={String(row.id)}
                      type="button"
                      onClick={() => setSelectedId(row.id)}
                      className={`w-full rounded-[22px] border px-4 py-4 text-left transition ${
                        active
                          ? "border-indigo-400 bg-indigo-50 shadow-sm"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-base font-black text-slate-900">
                              {payload.student.name || "이름 없음"}
                            </p>
                            <TestTypeBadge testType={payload.meta.testType} />
                          </div>

                          <p className="mt-1 text-sm font-medium text-slate-500">
                            {payload.student.school || "-"} / {payload.student.grade || "-"}
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                            row.is_consulted
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {row.is_consulted ? "상담 완료" : "상담 전"}
                        </span>
                      </div>

                      <div className="mt-3">
                        <p className="text-sm font-bold text-slate-800">
                          {payload.result.title || "결과명 없음"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {payload.result.fullCode || payload.result.code || "-"}
                        </p>
                      </div>

                      <div className="mt-3 text-xs text-slate-500">
                        {formatDateTime(payload.submittedAt)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>

            <section className="min-w-0">
              {selectedRow ? (
                <AdminResultPreview
                  row={selectedRow}
                  editMemo={editMemo}
                  setEditMemo={setEditMemo}
                  editConsulted={editConsulted}
                  setEditConsulted={setEditConsulted}
                  isDirty={isDirty}
                  saving={saving}
                  saveMessage={saveMessage}
                  onSave={handleSave}
                />
              ) : null}
            </section>
          </section>
        )}
      </div>
    </main>
  );
}