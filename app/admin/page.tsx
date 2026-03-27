"use client";

import { useMemo, useState } from "react";

type StudentInfo = {
  name: string;
  grade: string;
  school: string;
  phone: string;
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
const ADMIN_PASSWORD = "3797";

function readSubmissions(): SubmissionRecord[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function getScoreSummary(scores: Record<string, number>) {
  const keys = ["E", "P", "R", "C", "M", "O", "S", "F"] as const;
  return keys.map((key) => `${key} ${scores[key] ?? 0}`).join(" · ");
}

export default function AdminPage() {
  const [isAuth, setIsAuth] = useState(false);
  const [password, setPassword] = useState("");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const submissions = useMemo(() => readSubmissions(), [refreshKey]);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return submissions;

    return submissions.filter((item) => {
      const name = item.student?.name?.toLowerCase() ?? "";
      const school = item.student?.school?.toLowerCase() ?? "";
      const grade = item.student?.grade?.toLowerCase() ?? "";
      const phone = item.student?.phone?.toLowerCase() ?? "";
      const title = item.reportTitle?.toLowerCase() ?? "";
      const code = item.resultCode?.toLowerCase() ?? "";

      return (
        name.includes(keyword) ||
        school.includes(keyword) ||
        grade.includes(keyword) ||
        phone.includes(keyword) ||
        title.includes(keyword) ||
        code.includes(keyword)
      );
    });
  }, [query, submissions]);

  const selected = useMemo(() => {
    if (!selectedId) return filtered[0] ?? null;
    return filtered.find((item) => item.id === selectedId) ?? filtered[0] ?? null;
  }, [filtered, selectedId]);

  const handleDeleteOne = (id: string) => {
    if (typeof window === "undefined") return;
    const next = submissions.filter((item) => item.id !== id);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSelectedId(null);
    setRefreshKey((prev) => prev + 1);
  };

  const handleDeleteAll = () => {
    if (typeof window === "undefined") return;
    const ok = window.confirm("저장된 결과를 모두 삭제할까요?");
    if (!ok) return;

    window.localStorage.removeItem(STORAGE_KEY);
    setSelectedId(null);
    setRefreshKey((prev) => prev + 1);
  };

  if (!isAuth) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-xl">
          <h1 className="mb-2 text-2xl font-black text-slate-900">관리자 로그인</h1>
          <p className="mb-5 text-sm leading-6 text-slate-500">
            관리자 페이지에 접근하려면 비밀번호를 입력해 주세요.
          </p>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (password === ADMIN_PASSWORD) {
                  setIsAuth(true);
                } else {
                  alert("비밀번호 틀림");
                }
              }
            }}
            placeholder="비밀번호 입력"
            className="mb-4 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400"
          />

          <button
            type="button"
            onClick={() => {
              if (password === ADMIN_PASSWORD) {
                setIsAuth(true);
              } else {
                alert("비밀번호 틀림");
              }
            }}
            className="w-full rounded-2xl bg-black px-4 py-3 text-base font-bold text-white transition hover:bg-slate-800"
          >
            로그인
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-sky-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-[32px] border border-white/70 bg-white/90 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="inline-flex rounded-full bg-indigo-100 px-4 py-1 text-sm font-black text-indigo-700">
                관리자 전용
              </span>
              <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-900">
                학습성향검사 관리자
              </h1>
              <p className="mt-3 text-base leading-7 text-slate-600">
                로컬에 저장된 학생 결과를 검색하고, 상세 내용을 확인하는 페이지입니다.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setRefreshKey((prev) => prev + 1)}
                className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
              >
                새로고침
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAuth(false);
                  setPassword("");
                }}
                className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
              >
                로그아웃
              </button>
              <button
                type="button"
                onClick={handleDeleteAll}
                className="rounded-full bg-slate-900 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800"
              >
                전체 삭제
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="text-xs font-black tracking-[0.18em] text-slate-400">TOTAL</div>
              <div className="mt-2 text-3xl font-black text-slate-900">{submissions.length}</div>
              <div className="mt-2 text-sm text-slate-500">저장된 전체 결과</div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="text-xs font-black tracking-[0.18em] text-slate-400">FILTERED</div>
              <div className="mt-2 text-3xl font-black text-slate-900">{filtered.length}</div>
              <div className="mt-2 text-sm text-slate-500">현재 검색 결과</div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="text-xs font-black tracking-[0.18em] text-slate-400">LATEST</div>
              <div className="mt-2 text-lg font-black text-slate-900">
                {submissions[0] ? formatDate(submissions[0].createdAt) : "-"}
              </div>
              <div className="mt-2 text-sm text-slate-500">가장 최근 검사 시각</div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="text-xs font-black tracking-[0.18em] text-slate-400">SELECTED</div>
              <div className="mt-2 text-lg font-black text-slate-900">
                {selected?.student?.name || "-"}
              </div>
              <div className="mt-2 text-sm text-slate-500">현재 선택된 학생</div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-black text-slate-900">결과 목록</h2>

              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="이름, 학교, 학년, 전화번호, 결과유형 검색"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400 md:max-w-md"
              />
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500">
                저장된 결과가 없거나 검색 결과가 없습니다.
              </div>
            ) : (
              <div className="overflow-hidden rounded-3xl border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse text-sm">
                    <thead className="bg-slate-50 text-left text-slate-500">
                      <tr>
                        <th className="px-4 py-4 font-black">날짜</th>
                        <th className="px-4 py-4 font-black">이름</th>
                        <th className="px-4 py-4 font-black">학교</th>
                        <th className="px-4 py-4 font-black">학년</th>
                        <th className="px-4 py-4 font-black">유형</th>
                        <th className="px-4 py-4 font-black">결과코드</th>
                        <th className="px-4 py-4 font-black">관리</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((item) => {
                        const active = selected?.id === item.id;

                        return (
                          <tr
                            key={item.id}
                            className={`border-t border-slate-200 ${
                              active ? "bg-indigo-50/60" : "bg-white"
                            }`}
                          >
                            <td className="px-4 py-4 font-medium text-slate-600">
                              {formatDate(item.createdAt)}
                            </td>
                            <td className="px-4 py-4 font-black text-slate-900">
                              {item.student?.name || "-"}
                            </td>
                            <td className="px-4 py-4 text-slate-700">
                              {item.student?.school || "-"}
                            </td>
                            <td className="px-4 py-4 text-slate-700">
                              {item.student?.grade || "-"}
                            </td>
                            <td className="px-4 py-4 text-slate-700">
                              {item.reportTitle || "-"}
                            </td>
                            <td className="px-4 py-4 font-mono text-xs text-slate-500">
                              {item.resultCode || "-"}
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => setSelectedId(item.id)}
                                  className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-50"
                                >
                                  상세보기
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteOne(item.id)}
                                  className="rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-black text-rose-700 transition hover:bg-rose-100"
                                >
                                  삭제
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
            <h2 className="text-2xl font-black text-slate-900">상세 정보</h2>

            {!selected ? (
              <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500">
                선택된 결과가 없습니다.
              </div>
            ) : (
              <div className="mt-6 grid gap-4">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="text-xs font-black tracking-[0.18em] text-slate-400">
                    학생 정보
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-slate-700">
                    <div><span className="font-black text-slate-900">이름</span> · {selected.student?.name || "-"}</div>
                    <div><span className="font-black text-slate-900">학교</span> · {selected.student?.school || "-"}</div>
                    <div><span className="font-black text-slate-900">학년</span> · {selected.student?.grade || "-"}</div>
                    <div><span className="font-black text-slate-900">전화번호</span> · {selected.student?.phone || "-"}</div>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="text-xs font-black tracking-[0.18em] text-slate-400">
                    결과 정보
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-slate-700">
                    <div><span className="font-black text-slate-900">유형명</span> · {selected.reportTitle || "-"}</div>
                    <div><span className="font-black text-slate-900">결과코드</span> · {selected.resultCode || "-"}</div>
                    <div><span className="font-black text-slate-900">저장시각</span> · {formatDate(selected.createdAt)}</div>
                    <div><span className="font-black text-slate-900">문항 응답수</span> · {selected.answers?.length || 0}개</div>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="text-xs font-black tracking-[0.18em] text-slate-400">
                    원점수 요약
                  </div>
                  <div className="mt-3 text-sm leading-7 text-slate-700">
                    {getScoreSummary(selected.scores || {})}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}