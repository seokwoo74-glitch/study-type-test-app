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

  scores?: Record<string, number> | null;
  answers?: unknown;
  result_payload?: JsonObject | null;
  summary?: string | null;
  recommendation?: string | null;

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

function getPayloadValue(row: TestResultRow, key: string): unknown {
  if (!row.result_payload || typeof row.result_payload !== "object") return undefined;
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

function getSearchBlob(row: TestResultRow): string {
  return [
    String(row.id),
    getName(row),
    getSchool(row),
    getGrade(row),
    getPhone(row),
    getResultCode(row),
    getResultTitle(row),
    row.created_at ?? "",
  ]
    .join(" ")
    .toLowerCase();
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
  ]);

  return [headers, ...lines]
    .map((line) => line.map(escapeCSV).join(","))
    .join("\n");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeScores(value: unknown): Record<string, number> | null {
  if (!isRecord(value)) return null;

  const result: Record<string, number> = {};

  for (const [key, raw] of Object.entries(value)) {
    if (typeof raw === "number" && Number.isFinite(raw)) {
      result[key] = raw;
      continue;
    }

    if (typeof raw === "string" && raw.trim()) {
      const parsed = Number(raw);
      if (Number.isFinite(parsed)) {
        result[key] = parsed;
      }
    }
  }

  return Object.keys(result).length > 0 ? result : null;
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-sm font-medium text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-bold text-slate-900 break-words">{value}</div>
      {sub ? <div className="mt-1 text-xs text-slate-400">{sub}</div> : null}
    </div>
  );
}

export default function AdminPage() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [rows, setRows] = useState<TestResultRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [selectedId, setSelectedId] = useState<string | number | null>(null);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("전체");
  const [dateFilter, setDateFilter] = useState("전체");
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest");

  useEffect(() => {
    const saved = window.sessionStorage.getItem("admin-auth-ok");
    if (saved === "yes") {
      setIsAuthed(true);
    }
  }, []);

  async function fetchResults() {
    try {
      setLoading(true);
      setFetchError("");

      if (!supabase) {
        throw new Error(
          "Supabase 환경변수가 없습니다. NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY를 확인해 주세요."
        );
      }

      const { data, error } = await supabase
        .from("test_results")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const safeData = Array.isArray(data) ? (data as TestResultRow[]) : [];
      setRows(safeData);

      if (safeData.length > 0 && selectedId == null) {
        setSelectedId(safeData[0].id);
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
    if (!isAuthed) return;
    void fetchResults();
  }, [isAuthed]);

  function handleLogin() {
    if (!adminPassword) {
      setPasswordError(
        "NEXT_PUBLIC_ADMIN_PASSWORD 값이 없습니다. .env.local 또는 Vercel 환경변수에 추가해 주세요."
      );
      return;
    }

    if (password === adminPassword) {
      window.sessionStorage.setItem("admin-auth-ok", "yes");
      setIsAuthed(true);
      setPasswordError("");
      return;
    }

    setPasswordError("비밀번호가 올바르지 않습니다.");
  }

  function handleLogout() {
    window.sessionStorage.removeItem("admin-auth-ok");
    setIsAuthed(false);
    setPassword("");
    setRows([]);
    setSelectedId(null);
  }

  const uniqueTypes = useMemo(() => {
    const types = rows
      .map((row) => getResultTitle(row))
      .filter((v) => v !== "-");

    return ["전체", ...Array.from(new Set(types))];
  }, [rows]);

  const filteredRows = useMemo(() => {
    let list = [...rows];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((row) => getSearchBlob(row).includes(q));
    }

    if (typeFilter !== "전체") {
      list = list.filter((row) => getResultTitle(row) === typeFilter);
    }

    if (dateFilter !== "전체") {
      const now = new Date();

      list = list.filter((row) => {
        if (!row.created_at) return false;

        const created = new Date(row.created_at);
        if (Number.isNaN(created.getTime())) return false;

        const diffMs = now.getTime() - created.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        if (dateFilter === "오늘") {
          return created.toDateString() === now.toDateString();
        }

        if (dateFilter === "7일") {
          return diffDays <= 7;
        }

        if (dateFilter === "30일") {
          return diffDays <= 30;
        }

        return true;
      });
    }

    list.sort((a, b) => {
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
      return sortOrder === "latest" ? bTime - aTime : aTime - bTime;
    });

    return list;
  }, [rows, search, typeFilter, dateFilter, sortOrder]);

  const selectedRow = useMemo(() => {
    return (
      filteredRows.find((row) => row.id === selectedId) ??
      filteredRows[0] ??
      null
    );
  }, [filteredRows, selectedId]);

  useEffect(() => {
    if (!selectedRow && filteredRows.length > 0) {
      setSelectedId(filteredRows[0].id);
      return;
    }

    if (selectedRow && selectedId !== selectedRow.id) {
      setSelectedId(selectedRow.id);
    }
  }, [filteredRows, selectedRow, selectedId]);

  const stats = useMemo(() => {
    const total = rows.length;

    const today = rows.filter((row) => {
      if (!row.created_at) return false;
      const d = new Date(row.created_at);
      if (Number.isNaN(d.getTime())) return false;
      return d.toDateString() === new Date().toDateString();
    }).length;

    const typeCountMap = new Map<string, number>();

    for (const row of rows) {
      const key = getResultTitle(row);
      if (!key || key === "-") continue;
      typeCountMap.set(key, (typeCountMap.get(key) ?? 0) + 1);
    }

    const topTypes = [...typeCountMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return { total, today, topTypes };
  }, [rows]);

  async function handleDelete(id: string | number) {
    const ok = window.confirm("이 결과를 삭제할까요?");
    if (!ok) return;

    try {
      if (!supabase) {
        throw new Error("Supabase 설정이 없습니다.");
      }

      const { error } = await supabase.from("test_results").delete().eq("id", id);

      if (error) throw error;

      const nextRows = rows.filter((row) => row.id !== id);
      setRows(nextRows);

      if (selectedId === id) {
        setSelectedId(nextRows[0]?.id ?? null);
      }
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
    a.download = `test_results_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();

    URL.revokeObjectURL(url);
  }

  if (!isAuthed) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          <div className="mb-6 text-center">
            <div className="text-sm font-semibold tracking-wide text-indigo-600">
              ADMIN
            </div>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              관리자 페이지
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              비밀번호를 입력해야 접근할 수 있어요.
            </p>
          </div>

          <div className="space-y-3">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleLogin();
              }}
              placeholder="관리자 비밀번호"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500"
            />
            <button
              onClick={handleLogin}
              className="w-full rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:opacity-90"
            >
              로그인
            </button>
          </div>

          {passwordError ? (
            <p className="mt-4 text-sm text-red-500">{passwordError}</p>
          ) : null}
        </div>
      </main>
    );
  }

  const selectedScores =
    normalizeScores(selectedRow?.scores) ??
    normalizeScores(getPayloadValue(selectedRow as TestResultRow, "scores")) ??
    null;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              학습성향 검사 관리자페이지
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              응답 목록 확인, 검색, 삭제, CSV 다운로드가 가능합니다.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => void fetchResults()}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              새로고침
            </button>
            <button
              onClick={handleDownloadCSV}
              className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              CSV 다운로드
            </button>
            <button
              onClick={handleLogout}
              className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              로그아웃
            </button>
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <StatCard label="총 응답 수" value={stats.total} />
          <StatCard label="오늘 응답 수" value={stats.today} />
          <StatCard
            label="가장 많은 유형 TOP3"
            value={
              stats.topTypes.length > 0
                ? stats.topTypes.map(([name, count]) => `${name} (${count})`).join(" / ")
                : "-"
            }
          />
        </div>

        <div className="mb-6 grid gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="이름 / 학교 / 코드 / 날짜 검색"
            className="rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
          />

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
          >
            {uniqueTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
          >
            <option value="전체">전체 기간</option>
            <option value="오늘">오늘</option>
            <option value="7일">최근 7일</option>
            <option value="30일">최근 30일</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "latest" | "oldest")}
            className="rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
          >
            <option value="latest">최신순</option>
            <option value="oldest">오래된순</option>
          </select>
        </div>

        {fetchError ? (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
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
                            <div className="text-base font-bold text-slate-900">
                              {getName(row)}
                            </div>
                            <div className="mt-1 text-sm text-slate-500">
                              {getSchool(row)}
                              {getGrade(row) !== "-" ? ` · ${getGrade(row)}` : ""}
                            </div>
                          </div>

                          <div className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                            {getResultCode(row)}
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

                  <div className="rounded-2xl border border-slate-200 p-4">
                    <div className="mb-3 text-sm font-bold text-slate-900">
                      점수 / 원본 데이터
                    </div>

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
                      <div className="text-sm text-slate-500">
                        저장된 scores 데이터가 없거나 형식이 다릅니다.
                      </div>
                    )}

                    <details className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <summary className="cursor-pointer text-sm font-semibold text-slate-700">
                        원본 JSON 보기
                      </summary>
                      <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words text-xs text-slate-700">
                        {JSON.stringify(selectedRow, null, 2)}
                      </pre>
                    </details>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => void handleDelete(selectedRow.id)}
                      className="rounded-2xl bg-red-500 px-4 py-3 text-sm font-semibold text-white hover:opacity-90"
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