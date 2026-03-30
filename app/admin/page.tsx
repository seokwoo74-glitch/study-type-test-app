"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "";

const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

type JsonObject = Record<string, unknown>;

type TestResultRow = {
  id: string | number;
  created_at?: string | null;

  name?: string | null;
  student_name?: string | null;
  school?: string | null;
  grade?: string | null;
  phone?: string | null;
  parent_phone?: string | null;

  result_code?: string | null;
  result_title?: string | null;
  result_type?: string | null;
  code?: string | null;
  title?: string | null;
  type_code?: string | null;

  consult_status?: string | null;
  admin_memo?: string | null;
  is_priority?: boolean | null;

  scores?: unknown;
  result_payload?: JsonObject | null;

  [key: string]: unknown;
};

function formatDate(value?: string | null): string {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("ko-KR");
}

function pickText(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return "-";
}

function getPayloadValue(
  row: TestResultRow | null | undefined,
  key: string
): unknown {
  if (!row || !row.result_payload || typeof row.result_payload !== "object") {
    return undefined;
  }
  return row.result_payload[key];
}

function getName(row: TestResultRow): string {
  return pickText(
    row.name,
    row.student_name,
    getPayloadValue(row, "name"),
    getPayloadValue(row, "student_name")
  );
}

function getSchool(row: TestResultRow): string {
  return pickText(row.school, getPayloadValue(row, "school"));
}

function getGrade(row: TestResultRow): string {
  return pickText(row.grade, getPayloadValue(row, "grade"));
}

function getPhone(row: TestResultRow): string {
  return pickText(
    row.phone,
    row.parent_phone,
    getPayloadValue(row, "phone"),
    getPayloadValue(row, "parent_phone")
  );
}

function getResultCode(row: TestResultRow): string {
  return pickText(
    row.result_code,
    row.code,
    row.type_code,
    getPayloadValue(row, "result_code"),
    getPayloadValue(row, "code")
  );
}

function getResultTitle(row: TestResultRow): string {
  return pickText(
    row.result_title,
    row.result_type,
    row.title,
    getPayloadValue(row, "result_title"),
    getPayloadValue(row, "title")
  );
}

function normalizeScores(value: unknown): Record<string, number> | null {
  if (typeof value !== "object" || value === null) return null;

  const result: Record<string, number> = {};

  for (const [key, raw] of Object.entries(value)) {
    if (typeof raw === "number") {
      result[key] = raw;
    } else if (typeof raw === "string") {
      const num = Number(raw);
      if (!isNaN(num)) result[key] = num;
    }
  }

  return Object.keys(result).length > 0 ? result : null;
}

function toCSV(rows: TestResultRow[]): string {
  const headers = [
    "id",
    "created_at",
    "name",
    "school",
    "grade",
    "phone",
    "result_code",
    "result_title",
    "consult_status",
    "is_priority",
    "admin_memo",
  ];

  const escapeCSV = (value: unknown): string => {
    const str = String(value ?? "");
    if (str.includes('"') || str.includes(",") || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines = rows.map((row) => [
    row.id,
    row.created_at ?? "",
    getName(row),
    getSchool(row),
    getGrade(row),
    getPhone(row),
    getResultCode(row),
    getResultTitle(row),
    row.consult_status ?? "미상담",
    row.is_priority ? "중요" : "",
    row.admin_memo ?? "",
  ]);

  return [headers, ...lines]
    .map((line) => line.map(escapeCSV).join(","))
    .join("\n");
}

export default function AdminPage() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [password, setPassword] = useState("");

  const [rows, setRows] = useState<TestResultRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState("");

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("전체");
  const [statusFilter, setStatusFilter] = useState("전체");
  const [priorityFilter, setPriorityFilter] = useState("전체");
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest");

  const [memoDraft, setMemoDraft] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem("admin-auth-ok");
    if (saved === "yes") setIsAuthed(true);
  }, []);

  async function fetchResults() {
    try {
      setLoading(true);
      setFetchError("");

      if (!supabase) {
        throw new Error("Supabase 환경변수가 없습니다.");
      }

      const { data, error } = await supabase
        .from("test_results")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const safe = Array.isArray(data) ? (data as TestResultRow[]) : [];
      setRows(safe);

      if (safe.length > 0) {
        setSelectedId((prev) => prev ?? safe[0].id);
      } else {
        setSelectedId(null);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "데이터를 불러오지 못했습니다.";
      setFetchError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAuthed) {
      void fetchResults();
    }
  }, [isAuthed]);

  function handleLogin() {
    if (password === adminPassword) {
      sessionStorage.setItem("admin-auth-ok", "yes");
      setIsAuthed(true);
      return;
    }
    window.alert("비밀번호가 올바르지 않습니다.");
  }

  function handleLogout() {
    sessionStorage.removeItem("admin-auth-ok");
    setIsAuthed(false);
    setPassword("");
    setRows([]);
    setSelectedId(null);
  }

  const uniqueTypes = useMemo(() => {
    const arr = rows
      .map((row) => getResultTitle(row))
      .filter((v) => v !== "-");
    return ["전체", ...Array.from(new Set(arr))];
  }, [rows]);

  const filteredRows = useMemo(() => {
    let list = [...rows];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((row) =>
        JSON.stringify(row).toLowerCase().includes(q)
      );
    }

    if (typeFilter !== "전체") {
      list = list.filter((row) => getResultTitle(row) === typeFilter);
    }

    if (statusFilter !== "전체") {
      list = list.filter(
        (row) => (row.consult_status ?? "미상담") === statusFilter
      );
    }

    if (priorityFilter === "중요만") {
      list = list.filter((row) => row.is_priority === true);
    }

    list.sort((a, b) => {
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
      return sortOrder === "latest" ? bTime - aTime : aTime - bTime;
    });

    return list;
  }, [rows, search, typeFilter, statusFilter, priorityFilter, sortOrder]);

  const selectedRow = useMemo(() => {
    return (
      filteredRows.find((row) => row.id === selectedId) ??
      rows.find((row) => row.id === selectedId) ??
      filteredRows[0] ??
      rows[0] ??
      null
    );
  }, [filteredRows, rows, selectedId]);

  useEffect(() => {
    setMemoDraft(selectedRow?.admin_memo ?? "");
  }, [selectedRow]);

  const stats = useMemo(() => {
    const total = rows.length;
    const unConsulted = rows.filter(
      (row) => (row.consult_status ?? "미상담") === "미상담"
    ).length;
    const priority = rows.filter((row) => row.is_priority === true).length;

    return { total, unConsulted, priority };
  }, [rows]);

  const selectedScores = selectedRow
    ? normalizeScores(selectedRow.scores) ??
      normalizeScores(getPayloadValue(selectedRow, "scores")) ??
      null
    : null;

  async function updateRow(
    id: string | number,
    patch: Partial<TestResultRow>
  ) {
    try {
      if (!supabase) throw new Error("Supabase 설정이 없습니다.");
      setSaving(true);

      const { error } = await supabase
        .from("test_results")
        .update(patch)
        .eq("id", id);

      if (error) throw error;

      setRows((prev) =>
        prev.map((row) => (row.id === id ? { ...row, ...patch } : row))
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "저장에 실패했습니다.";
      window.alert(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string | number) {
    const ok = window.confirm("이 응답을 삭제할까요?");
    if (!ok) return;

    try {
      if (!supabase) throw new Error("Supabase 설정이 없습니다.");

      const { error } = await supabase.from("test_results").delete().eq("id", id);
      if (error) throw error;

      const next = rows.filter((row) => row.id !== id);
      setRows(next);
      setSelectedId(next[0]?.id ?? null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "삭제에 실패했습니다.";
      window.alert(message);
    }
  }

  function handleDownloadCSV() {
    const csv = toCSV(filteredRows);
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `test_results_consult_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    a.click();

    URL.revokeObjectURL(url);
  }

  if (!isAuthed) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          <h1 className="mb-6 text-center text-3xl font-bold text-slate-900">
            관리자 로그인
          </h1>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleLogin();
            }}
            placeholder="관리자 비밀번호"
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
          />

          <button
            onClick={handleLogin}
            className="mt-3 w-full rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white"
          >
            로그인
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              관리자 대시보드
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              상담 상태, 메모, 중요 표시까지 관리할 수 있어요.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => void fetchResults()}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
            >
              새로고침
            </button>
            <button
              onClick={handleDownloadCSV}
              className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
            >
              CSV 다운로드
            </button>
            <button
              onClick={handleLogout}
              className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              로그아웃
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">총 응답</div>
            <div className="mt-2 text-3xl font-bold text-slate-900">
              {stats.total}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">미상담</div>
            <div className="mt-2 text-3xl font-bold text-slate-900">
              {stats.unConsulted}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">중요 표시</div>
            <div className="mt-2 text-3xl font-bold text-slate-900">
              {stats.priority}
            </div>
          </div>
        </div>

        <div className="grid gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-5">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="검색"
            className="rounded-2xl border border-slate-300 px-4 py-3 outline-none"
          />

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-2xl border border-slate-300 px-4 py-3 outline-none"
          >
            {uniqueTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-2xl border border-slate-300 px-4 py-3 outline-none"
          >
            <option value="전체">전체 상태</option>
            <option value="미상담">미상담</option>
            <option value="상담예정">상담예정</option>
            <option value="상담완료">상담완료</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-2xl border border-slate-300 px-4 py-3 outline-none"
          >
            <option value="전체">전체 중요도</option>
            <option value="중요만">중요만</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "latest" | "oldest")}
            className="rounded-2xl border border-slate-300 px-4 py-3 outline-none"
          >
            <option value="latest">최신순</option>
            <option value="oldest">오래된순</option>
          </select>
        </div>

        {fetchError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {fetchError}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-lg font-bold text-slate-900">
                응답 목록 ({filteredRows.length})
              </h2>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-3">
              {loading ? (
                <div className="p-4 text-sm text-slate-500">불러오는 중...</div>
              ) : filteredRows.length === 0 ? (
                <div className="p-4 text-sm text-slate-500">
                  조건에 맞는 결과가 없습니다.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredRows.map((row) => {
                    const active = selectedRow?.id === row.id;

                    return (
                      <button
                        key={String(row.id)}
                        onClick={() => setSelectedId(row.id)}
                        className={`w-full rounded-2xl border p-4 text-left transition ${
                          active
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="text-base font-bold text-slate-900">
                                {getName(row)}
                              </div>
                              {row.is_priority ? (
                                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                                  중요
                                </span>
                              ) : null}
                            </div>

                            <div className="mt-1 text-sm text-slate-500">
                              {getSchool(row)}
                              {getGrade(row) !== "-" ? ` · ${getGrade(row)}` : ""}
                            </div>
                          </div>

                          <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                            {row.consult_status ?? "미상담"}
                          </div>
                        </div>

                        <div className="mt-3 text-sm font-medium text-slate-700">
                          {getResultTitle(row)}
                        </div>

                        <div className="mt-2 text-xs text-slate-400">
                          {formatDate(row.created_at)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-lg font-bold text-slate-900">상세 보기</h2>
            </div>

            <div className="p-5">
              {!selectedRow ? (
                <div className="text-sm text-slate-500">선택된 응답이 없습니다.</div>
              ) : (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="text-xs font-semibold text-slate-500">이름</div>
                      <div className="mt-1 text-lg font-bold text-slate-900">
                        {getName(selectedRow)}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="text-xs font-semibold text-slate-500">검사일시</div>
                      <div className="mt-1 text-lg font-bold text-slate-900">
                        {formatDate(selectedRow.created_at)}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="text-xs font-semibold text-slate-500">학교 / 학년</div>
                      <div className="mt-1 text-lg font-bold text-slate-900">
                        {getSchool(selectedRow)}
                        {getGrade(selectedRow) !== "-" ? ` / ${getGrade(selectedRow)}` : ""}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="text-xs font-semibold text-slate-500">연락처</div>
                      <div className="mt-1 text-lg font-bold text-slate-900">
                        {getPhone(selectedRow)}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="text-xs font-semibold text-slate-500">결과 코드</div>
                      <div className="mt-1 text-lg font-bold text-slate-900">
                        {getResultCode(selectedRow)}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="text-xs font-semibold text-slate-500">결과 유형</div>
                      <div className="mt-1 text-lg font-bold text-slate-900">
                        {getResultTitle(selectedRow)}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 p-4">
                      <div className="mb-2 text-sm font-bold text-slate-900">
                        상담 상태
                      </div>
                      <select
                        value={selectedRow.consult_status ?? "미상담"}
                        onChange={(e) =>
                          void updateRow(selectedRow.id, {
                            consult_status: e.target.value,
                          })
                        }
                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none"
                        disabled={saving}
                      >
                        <option value="미상담">미상담</option>
                        <option value="상담예정">상담예정</option>
                        <option value="상담완료">상담완료</option>
                      </select>
                    </div>

                    <div className="rounded-2xl border border-slate-200 p-4">
                      <div className="mb-2 text-sm font-bold text-slate-900">
                        중요 표시
                      </div>
                      <button
                        onClick={() =>
                          void updateRow(selectedRow.id, {
                            is_priority: !(selectedRow.is_priority ?? false),
                          })
                        }
                        disabled={saving}
                        className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
                          selectedRow.is_priority
                            ? "bg-amber-500 text-white"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {selectedRow.is_priority ? "중요 ON" : "중요 OFF"}
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-4">
                    <div className="mb-2 text-sm font-bold text-slate-900">
                      관리자 메모
                    </div>
                    <textarea
                      value={memoDraft}
                      onChange={(e) => setMemoDraft(e.target.value)}
                      rows={6}
                      placeholder="상담 전 체크사항, 학부모 반응, 후속조치 등을 적어두세요."
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none"
                    />
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() =>
                          void updateRow(selectedRow.id, {
                            admin_memo: memoDraft,
                          })
                        }
                        disabled={saving}
                        className="rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white"
                      >
                        메모 저장
                      </button>

                      <button
                        onClick={() => setMemoDraft(selectedRow.admin_memo ?? "")}
                        disabled={saving}
                        className="rounded-2xl bg-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
                      >
                        되돌리기
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-4">
                    <div className="mb-3 text-sm font-bold text-slate-900">점수</div>

                    {selectedScores ? (
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {Object.entries(selectedScores).map(([key, value]) => (
                          <div
                            key={key}
                            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                          >
                            <div className="text-xs font-semibold uppercase text-slate-500">
                              {key}
                            </div>
                            <div className="mt-1 text-2xl font-bold text-slate-900">
                              {value}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-slate-500">점수 데이터 없음</div>
                    )}
                  </div>

                  <details className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <summary className="cursor-pointer text-sm font-semibold text-slate-700">
                      원본 JSON 보기
                    </summary>
                    <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words text-xs text-slate-700">
                      {JSON.stringify(selectedRow, null, 2)}
                    </pre>
                  </details>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => void handleDelete(selectedRow.id)}
                      className="rounded-2xl bg-red-500 px-4 py-3 text-sm font-semibold text-white"
                    >
                      이 응답 삭제
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}