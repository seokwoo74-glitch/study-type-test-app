"use client";

import { useEffect, useMemo, useState } from "react";

type RawSubmission = any;

type AdminSubmission = {
  id: string;
  createdAt: string;
  student: {
    name: string;
    school: string;
    grade: string;
    phone: string;
  };
  resultKey: string;
  resultCode: string;
  reportTitle: string;
  answers: number[];
  scores: Record<string, number>;
};

function normalizeSubmission(row: RawSubmission): AdminSubmission {
  return {
    id: String(row?.id ?? ""),
    createdAt: String(row?.createdAt ?? row?.created_at ?? ""),
    student: {
      name: String(row?.student?.name ?? row?.student_name ?? ""),
      school: String(row?.student?.school ?? row?.school ?? ""),
      grade: String(row?.student?.grade ?? row?.grade ?? ""),
      phone: String(row?.student?.phone ?? row?.phone ?? ""),
    },
    resultKey: String(row?.resultKey ?? row?.result_key ?? ""),
    resultCode: String(row?.resultCode ?? row?.result_code ?? ""),
    reportTitle: String(row?.reportTitle ?? row?.report_title ?? ""),
    answers: Array.isArray(row?.answers) ? row.answers : [],
    scores:
      row?.scores && typeof row.scores === "object" && !Array.isArray(row.scores)
        ? row.scores
        : {},
  };
}

function formatDate(value: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("ko-KR");
}

function formatDateTime(value: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("ko-KR");
}

function scoreEntries(scores: Record<string, number>) {
  return Object.entries(scores).sort((a, b) => b[1] - a[1]);
}

export default function AdminPage() {
  const [items, setItems] = useState<AdminSubmission[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [statusText, setStatusText] = useState("불러오는 중...");
  const [errorText, setErrorText] = useState("");

  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);

  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "";

  useEffect(() => {
    const saved = sessionStorage.getItem("admin-auth");
    if (saved === "ok") {
      setAuthorized(true);
    }
    setCheckingAuth(false);
  }, []);

  async function loadItems() {
    try {
      setLoading(true);
      setErrorText("");
      setStatusText("불러오는 중...");

      const res = await fetch("/api/submissions", {
        method: "GET",
        cache: "no-store",
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "목록 조회 중 오류가 발생했습니다.");
      }

      const normalized = Array.isArray(data?.items)
        ? data.items.map(normalizeSubmission)
        : [];

      setItems(normalized);

      if (normalized.length > 0) {
        setSelectedId((prev) => prev || normalized[0].id);
      } else {
        setSelectedId("");
      }

      setStatusText("준비 완료");
    } catch (error) {
      console.error(error);
      setErrorText("목록 조회 중 오류가 발생했습니다.");
      setStatusText("조회 실패");
      alert("목록 조회 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!authorized) return;
    loadItems();
  }, [authorized]);

  function handleLogin() {
    if (!ADMIN_PASSWORD) {
      setLoginError("관리자 비밀번호 환경변수가 설정되지 않았습니다.");
      return;
    }

    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("admin-auth", "ok");
      setAuthorized(true);
      setLoginError("");
      setPassword("");
    } else {
      setLoginError("비밀번호가 올바르지 않습니다.");
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("admin-auth");
    setAuthorized(false);
    setPassword("");
    setLoginError("");
  }

  const filteredItems = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return items;

    return items.filter((item) => {
      const haystack = [
        item.student.name,
        item.student.school,
        item.student.grade,
        item.student.phone,
        item.reportTitle,
        item.resultCode,
        item.resultKey,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(keyword);
    });
  }, [items, query]);

  const selected =
    filteredItems.find((item) => item.id === selectedId) ||
    items.find((item) => item.id === selectedId) ||
    filteredItems[0] ||
    null;

  const latestDate = filteredItems[0]?.createdAt || items[0]?.createdAt || "";

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#eef4fb_100%)] flex items-center justify-center px-4">
        <div className="rounded-[28px] border border-white/80 bg-white/90 px-8 py-10 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="text-xl font-black text-slate-900">확인 중...</div>
        </div>
      </main>
    );
  }

  if (!authorized) {
    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#eef4fb_100%)] flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-[32px] border border-white/80 bg-white/90 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="inline-flex rounded-full bg-indigo-100 px-4 py-2 text-sm font-black text-indigo-700">
            관리자 로그인
          </div>

          <h1 className="mt-5 text-3xl font-black text-slate-900">비밀번호 입력</h1>
          <p className="mt-3 text-base leading-7 text-slate-500">
            관리자 페이지는 비밀번호를 입력해야 접근할 수 있습니다.
          </p>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleLogin();
            }}
            placeholder="비밀번호 입력"
            className="mt-6 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-base font-semibold text-slate-700 outline-none placeholder:text-slate-400 focus:border-slate-400"
          />

          {loginError ? (
            <div className="mt-3 text-sm font-semibold text-rose-500">
              {loginError}
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleLogin}
            className="mt-6 w-full rounded-full bg-slate-900 px-5 py-4 text-base font-black text-white transition hover:bg-slate-800"
          >
            로그인
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#eef4fb_100%)] text-slate-900">
      <div className="mx-auto max-w-[1440px] px-5 py-8 md:px-8">
        <section className="rounded-[36px] border border-white/80 bg-white/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur md:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="inline-flex rounded-full bg-indigo-100 px-5 py-2 text-sm font-black text-indigo-700">
                관리자 전용
              </div>
              <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-900 md:text-6xl">
                학습성향검사 관리자
              </h1>
              <p className="mt-4 text-lg leading-8 text-slate-500">
                모든 기기에서 저장된 학생 결과를 조회합니다.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={loadItems}
                className="rounded-full border border-slate-200 bg-white px-6 py-3 text-base font-black text-slate-700 transition hover:bg-slate-50"
              >
                새로고침
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-slate-200 bg-white px-6 py-3 text-base font-black text-slate-700 transition hover:bg-slate-50"
              >
                로그아웃
              </button>
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
              <div className="text-sm font-black tracking-[0.18em] text-slate-400">TOTAL</div>
              <div className="mt-3 text-5xl font-black text-slate-900">{items.length}</div>
              <div className="mt-3 text-sm text-slate-500">저장된 전체 결과</div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
              <div className="text-sm font-black tracking-[0.18em] text-slate-400">FILTERED</div>
              <div className="mt-3 text-5xl font-black text-slate-900">{filteredItems.length}</div>
              <div className="mt-3 text-sm text-slate-500">현재 검색 결과</div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
              <div className="text-sm font-black tracking-[0.18em] text-slate-400">LATEST</div>
              <div className="mt-3 text-2xl font-black text-slate-900">
                {latestDate ? formatDateTime(latestDate) : "-"}
              </div>
              <div className="mt-3 text-sm text-slate-500">가장 최근 검사 시각</div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
              <div className="text-sm font-black tracking-[0.18em] text-slate-400">STATUS</div>
              <div className="mt-3 text-2xl font-black text-slate-900">
                {loading ? "불러오는 중..." : statusText}
              </div>
              <div className="mt-3 text-sm text-slate-500">서버 연결 상태</div>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-8 xl:grid-cols-[1.45fr_0.95fr]">
          <section className="rounded-[32px] border border-white/80 bg-white/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur md:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <h2 className="text-4xl font-black tracking-tight text-slate-900">결과 목록</h2>

              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="이름, 학교, 학년, 전화번호, 결과유형 검색"
                className="w-full max-w-[560px] rounded-[20px] border border-slate-200 bg-slate-50 px-5 py-4 text-lg font-semibold text-slate-700 outline-none placeholder:text-slate-400 focus:border-slate-400"
              />
            </div>

            <div className="mt-6 overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50">
              <div className="grid grid-cols-[1.1fr_1fr_1fr_1fr_1fr_1.5fr_1fr] gap-2 border-b border-slate-200 px-4 py-5 text-center text-sm font-black text-slate-500 md:px-6">
                <div>날짜</div>
                <div>이름</div>
                <div>학교</div>
                <div>학년</div>
                <div>유형</div>
                <div>결과코드</div>
                <div>관리</div>
              </div>

              {errorText ? (
                <div className="px-6 py-12 text-center text-base font-semibold text-rose-500">
                  {errorText}
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="px-6 py-16 text-center text-2xl font-medium text-slate-400">
                  저장된 결과가 없거나 검색 결과가 없습니다.
                </div>
              ) : (
                <div>
                  {filteredItems.map((item) => {
                    const active = selected?.id === item.id;

                    return (
                      <div
                        key={item.id}
                        className={`grid grid-cols-[1.1fr_1fr_1fr_1fr_1fr_1.5fr_1fr] items-center gap-2 border-b border-slate-200 px-4 py-5 text-center text-sm md:px-6 ${
                          active ? "bg-indigo-50/70" : "bg-white"
                        }`}
                      >
                        <div className="font-semibold text-slate-700">
                          {formatDate(item.createdAt)}
                        </div>
                        <div className="font-semibold text-slate-700">
                          {item.student.name || "-"}
                        </div>
                        <div className="font-semibold text-slate-700">
                          {item.student.school || "-"}
                        </div>
                        <div className="font-semibold text-slate-700">
                          {item.student.grade || "-"}
                        </div>
                        <div className="font-semibold text-slate-700">
                          {item.reportTitle || item.resultKey || "-"}
                        </div>
                        <div className="font-semibold text-slate-700">
                          {item.resultCode || "-"}
                        </div>
                        <div>
                          <button
                            type="button"
                            onClick={() => setSelectedId(item.id)}
                            className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
                          >
                            상세보기
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[32px] border border-white/80 bg-white/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur md:p-8">
            <h2 className="text-4xl font-black tracking-tight text-slate-900">상세 정보</h2>

            {!selected ? (
              <div className="mt-8 rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 py-20 text-center text-2xl font-medium text-slate-400">
                선택된 결과가 없습니다.
              </div>
            ) : (
              <div className="mt-8 grid gap-5">
                <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
                  <div className="text-sm font-black tracking-[0.18em] text-slate-400">
                    학생 정보
                  </div>
                  <div className="mt-5 space-y-3 text-xl font-semibold text-slate-800">
                    <div>이름 <span className="font-black">·</span> {selected.student.name || "-"}</div>
                    <div>학교 <span className="font-black">·</span> {selected.student.school || "-"}</div>
                    <div>학년 <span className="font-black">·</span> {selected.student.grade || "-"}</div>
                    <div>전화번호 <span className="font-black">·</span> {selected.student.phone || "-"}</div>
                  </div>
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
                  <div className="text-sm font-black tracking-[0.18em] text-slate-400">
                    결과 정보
                  </div>
                  <div className="mt-5 space-y-3 text-xl font-semibold text-slate-800">
                    <div>유형명 <span className="font-black">·</span> {selected.reportTitle || selected.resultKey || "-"}</div>
                    <div>결과코드 <span className="font-black">·</span> {selected.resultCode || "-"}</div>
                    <div>저장시각 <span className="font-black">·</span> {formatDateTime(selected.createdAt)}</div>
                    <div>응답 수 <span className="font-black">·</span> {selected.answers.length}</div>
                  </div>
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
                  <div className="text-sm font-black tracking-[0.18em] text-slate-400">
                    점수 정보
                  </div>

                  {scoreEntries(selected.scores).length === 0 ? (
                    <div className="mt-5 text-lg font-semibold text-slate-400">점수 데이터가 없습니다.</div>
                  ) : (
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {scoreEntries(selected.scores).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4"
                        >
                          <span className="text-lg font-black text-slate-700">{key}</span>
                          <span className="text-xl font-black text-slate-900">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
                  <div className="text-sm font-black tracking-[0.18em] text-slate-400">
                    원본 응답
                  </div>
                  <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-8 text-slate-700 break-all">
                    {selected.answers.length > 0 ? JSON.stringify(selected.answers) : "-"}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}