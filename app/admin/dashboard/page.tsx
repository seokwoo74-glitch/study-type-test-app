"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

const supabase = createBrowserSupabaseClient();

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
      if (!Number.isNaN(num)) result[key] = num;
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

function isTopTierType(title: string): boolean {
  return (
    title.includes("영재형") ||
    title.includes("창의적영재형") ||
    title.includes("문·이과 혼합 영재형") ||
    title.includes("모범형 영재형")
  );
}

function isRareType(title: string): boolean {
  return (
    title.includes("1% 미만") ||
    title.includes("2% 미만") ||
    title.includes("3% 미만") ||
    title.includes("영재형")
  );
}

function getStatusLabel(status?: string | null): string {
  return status ?? "미상담";
}

function getStatusBadgeClass(status?: string | null): string {
  const safe = getStatusLabel(status);
  if (safe === "상담완료") {
    return "border border-emerald-200 bg-emerald-100 text-emerald-700";
  }
  if (safe === "상담예정") {
    return "border border-amber-200 bg-amber-100 text-amber-700";
  }
  return "border border-rose-200 bg-rose-100 text-rose-700";
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
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-bold text-slate-900">{value}</div>
      {sub ? <div className="mt-2 text-xs text-slate-400">{sub}</div> : null}
    </div>
  );
}

function BarList({
  items,
}: {
  items: Array<{ label: string; value: number }>;
}) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const width = `${(item.value / max) * 100}%`;

        return (
          <div key={item.label}>
            <div className="mb-1 flex items-center justify-between gap-3 text-sm">
              <span className="truncate font-medium text-slate-700">
                {item.label}
              </span>
              <span className="shrink-0 text-slate-500">{item.value}</span>
            </div>
            <div className="h-3 rounded-full bg-slate-100">
              <div
                className="h-3 rounded-full bg-slate-900 transition-all"
                style={{ width }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();

  const [authChecking, setAuthChecking] = useState(true);
  const [adminEmail, setAdminEmail] = useState("");

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
    async function checkAuth() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const allowedEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
        .split(",")
        .map((v) => v.trim().toLowerCase())
        .filter(Boolean);

      const userEmail = session?.user?.email?.toLowerCase() ?? "";

      if (!session || !userEmail || !allowedEmails.includes(userEmail)) {
        router.replace("/admin/login");
        return;
      }

      setAdminEmail(userEmail);
      setAuthChecking(false);
    }

    void checkAuth();
  }, [router]);

  async function fetchResults() {
    try {
      setLoading(true);
      setFetchError("");

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
    if (!authChecking) {
      void fetchResults();
    }
  }, [authChecking]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
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
        (row) => getStatusLabel(row.consult_status) === statusFilter
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

  const selectedScores = selectedRow
    ? normalizeScores(selectedRow.scores) ??
      normalizeScores(getPayloadValue(selectedRow, "scores")) ??
      null
    : null;

  const dashboard = useMemo(() => {
    const total = rows.length;
    const unConsulted = rows.filter(
      (row) => getStatusLabel(row.consult_status) === "미상담"
    ).length;
    const consulted = rows.filter(
      (row) => getStatusLabel(row.consult_status) === "상담완료"
    ).length;
    const scheduled = rows.filter(
      (row) => getStatusLabel(row.consult_status) === "상담예정"
    ).length;
    const priority = rows.filter((row) => row.is_priority === true).length;

    const today = rows.filter((row) => {
      if (!row.created_at) return false;
      const d = new Date(row.created_at);
      return d.toDateString() === new Date().toDateString();
    }).length;

    const byTypeMap = new Map<string, number>();
    for (const row of rows) {
      const title = getResultTitle(row);
      if (!title || title === "-") continue;
      byTypeMap.set(title, (byTypeMap.get(title) ?? 0) + 1);
    }

    const typeDistribution = [...byTypeMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([label, value]) => ({ label, value }));

    const recent7Days = Array.from({ length: 7 }).map((_, idx) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - idx));

      const label = `${date.getMonth() + 1}/${date.getDate()}`;
      const value = rows.filter((row) => {
        if (!row.created_at) return false;
        const d = new Date(row.created_at);
        return d.toDateString() === date.toDateString();
      }).length;

      return { label, value };
    });

    const priorityCandidates = [...rows]
      .filter((row) => {
        const title = getResultTitle(row);
        const status = getStatusLabel(row.consult_status);

        return (
          row.is_priority === true ||
          status === "미상담" ||
          isTopTierType(title) ||
          isRareType(title)
        );
      })
      .sort((a, b) => {
        const aScore =
          (a.is_priority ? 100 : 0) +
          (getStatusLabel(a.consult_status) === "미상담" ? 30 : 0) +
          (isTopTierType(getResultTitle(a)) ? 20 : 0) +
          (isRareType(getResultTitle(a)) ? 10 : 0);

        const bScore =
          (b.is_priority ? 100 : 0) +
          (getStatusLabel(b.consult_status) === "미상담" ? 30 : 0) +
          (isTopTierType(getResultTitle(b)) ? 20 : 0) +
          (isRareType(getResultTitle(b)) ? 10 : 0);

        return bScore - aScore;
      })
      .slice(0, 8);

    const topTierCount = rows.filter((row) =>
      isTopTierType(getResultTitle(row))
    ).length;

    const rareTypeCount = rows.filter((row) =>
      isRareType(getResultTitle(row))
    ).length;

    const memoRows = [...rows]
      .filter(
        (row) => typeof row.admin_memo === "string" && row.admin_memo.trim()
      )
      .sort((a, b) => {
        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bTime - aTime;
      })
      .slice(0, 10);

    const schoolMap = new Map<string, number>();
    for (const row of rows) {
      const school = getSchool(row);
      if (!school || school === "-") continue;
      schoolMap.set(school, (schoolMap.get(school) ?? 0) + 1);
    }

    const schoolStats = [...schoolMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([label, value]) => ({ label, value }))
      .slice(0, 10);

    return {
      total,
      unConsulted,
      consulted,
      scheduled,
      priority,
      today,
      typeDistribution,
      recent7Days,
      priorityCandidates,
      topTierCount,
      rareTypeCount,
      memoRows,
      schoolStats,
    };
  }, [rows]);

  async function updateRow(
    id: string | number,
    patch: Partial<TestResultRow>
  ) {
    try {
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
    a.download = `test_results_dashboard_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    a.click();

    URL.revokeObjectURL(url);
  }

  if (authChecking) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          권한 확인 중...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
              Admin Dashboard
            </div>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              학습성향 검사 관리자
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              상담 관리, 메모, 유형 분석, 학교별 통계를 한 번에 볼 수 있어요.
            </p>
            <p className="mt-2 text-xs text-slate-400">로그인: {adminEmail}</p>
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

        <div className="grid gap-4 md:grid-cols-6">
          <StatCard label="총 응답" value={dashboard.total} />
          <StatCard label="오늘 응답" value={dashboard.today} />
          <StatCard label="미상담" value={dashboard.unConsulted} />
          <StatCard label="상담예정" value={dashboard.scheduled} />
          <StatCard label="상담완료" value={dashboard.consulted} />
          <StatCard label="중요 표시" value={dashboard.priority} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-900">유형 분포</h2>
              <p className="mt-1 text-sm text-slate-500">
                현재 가장 많이 나온 유형을 확인해 보세요.
              </p>
            </div>

            {dashboard.typeDistribution.length === 0 ? (
              <div className="text-sm text-slate-500">데이터가 없습니다.</div>
            ) : (
              <BarList items={dashboard.typeDistribution.slice(0, 8)} />
            )}
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-900">최근 7일 응답</h2>
              <p className="mt-1 text-sm text-slate-500">
                최근 일주일 응답 흐름입니다.
              </p>
            </div>

            <BarList items={dashboard.recent7Days} />
          </section>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-900">학교별 통계</h2>
              <p className="mt-1 text-sm text-slate-500">
                어떤 학교에서 응답이 많이 들어왔는지 보여줘요.
              </p>
            </div>

            {dashboard.schoolStats.length === 0 ? (
              <div className="text-sm text-slate-500">학교 데이터가 없습니다.</div>
            ) : (
              <BarList items={dashboard.schoolStats} />
            )}
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-900">빠른 인사이트</h2>
              <p className="mt-1 text-sm text-slate-500">
                관리자 입장에서 바로 볼 핵심 숫자예요.
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm text-slate-500">영재형 / 상위권 유형 수</div>
                <div className="mt-2 text-2xl font-bold text-slate-900">
                  {dashboard.topTierCount}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm text-slate-500">희소 유형 수</div>
                <div className="mt-2 text-2xl font-bold text-slate-900">
                  {dashboard.rareTypeCount}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm text-slate-500">지금 바로 상담 추천</div>
                <div className="mt-2 text-base font-semibold text-slate-900">
                  {dashboard.priorityCandidates[0]
                    ? `${getName(dashboard.priorityCandidates[0])} · ${getResultTitle(
                        dashboard.priorityCandidates[0]
                      )}`
                    : "없음"}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-900">최근 메모 목록</h2>
              <p className="mt-1 text-sm text-slate-500">
                저장된 메모를 한눈에 확인할 수 있어요.
              </p>
            </div>

            {dashboard.memoRows.length === 0 ? (
              <div className="text-sm text-slate-500">저장된 메모가 없습니다.</div>
            ) : (
              <div className="space-y-3">
                {dashboard.memoRows.map((row) => (
                  <button
                    key={String(row.id)}
                    onClick={() => setSelectedId(row.id)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left hover:bg-slate-100"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold text-slate-900">
                        {getName(row)}
                      </div>
                      <div
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
                          row.consult_status
                        )}`}
                      >
                        {getStatusLabel(row.consult_status)}
                      </div>
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      {getResultTitle(row)}
                    </div>
                    <div className="mt-2 line-clamp-2 text-sm text-slate-700">
                      {row.admin_memo}
                    </div>
                    <div className="mt-2 text-xs text-slate-400">
                      {formatDate(row.created_at)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-900">상담 우선 리스트</h2>
              <p className="mt-1 text-sm text-slate-500">
                중요 표시, 미상담, 영재형/희소 유형을 우선으로 보여줘요.
              </p>
            </div>

            {dashboard.priorityCandidates.length === 0 ? (
              <div className="text-sm text-slate-500">표시할 대상이 없습니다.</div>
            ) : (
              <div className="space-y-3">
                {dashboard.priorityCandidates.map((row) => (
                  <button
                    key={String(row.id)}
                    onClick={() => setSelectedId(row.id)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left hover:bg-slate-100"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-slate-900">
                            {getName(row)}
                          </span>
                          {row.is_priority ? (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                              중요
                            </span>
                          ) : null}
                          {isTopTierType(getResultTitle(row)) ? (
                            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                              상위권
                            </span>
                          ) : null}
                          {isRareType(getResultTitle(row)) ? (
                            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                              희소유형
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-1 text-sm text-slate-600">
                          {getResultTitle(row)}
                        </div>
                        <div className="mt-1 text-xs text-slate-400">
                          {getSchool(row)}
                          {getGrade(row) !== "-" ? ` · ${getGrade(row)}` : ""}
                          {" · "}
                          {formatDate(row.created_at)}
                        </div>
                      </div>

                      <div
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
                          row.consult_status
                        )}`}
                      >
                        {getStatusLabel(row.consult_status)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-900">필터</h2>
            </div>

            <div className="grid gap-3">
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
          </section>
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
                            <div className="flex flex-wrap items-center gap-2">
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

                          <div
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
                              row.consult_status
                            )}`}
                          >
                            {getStatusLabel(row.consult_status)}
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
                <div className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 p-4">
                      <div className="mb-2 text-sm font-bold text-slate-900">
                        기본 정보
                      </div>
                      <div className="space-y-2 text-sm text-slate-600">
                        <div><span className="font-semibold text-slate-800">이름:</span> {getName(selectedRow)}</div>
                        <div><span className="font-semibold text-slate-800">학교:</span> {getSchool(selectedRow)}</div>
                        <div><span className="font-semibold text-slate-800">학년:</span> {getGrade(selectedRow)}</div>
                        <div><span className="font-semibold text-slate-800">연락처:</span> {getPhone(selectedRow)}</div>
                        <div><span className="font-semibold text-slate-800">검사일시:</span> {formatDate(selectedRow.created_at)}</div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 p-4">
                      <div className="mb-2 text-sm font-bold text-slate-900">
                        결과 정보
                      </div>
                      <div className="space-y-2 text-sm text-slate-600">
                        <div><span className="font-semibold text-slate-800">결과 코드:</span> {getResultCode(selectedRow)}</div>
                        <div><span className="font-semibold text-slate-800">결과명:</span> {getResultTitle(selectedRow)}</div>
                        <div><span className="font-semibold text-slate-800">행 ID:</span> {String(selectedRow.id)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 p-4">
                      <div className="mb-2 text-sm font-bold text-slate-900">
                        상담 상태
                      </div>
                      <select
                        value={getStatusLabel(selectedRow.consult_status)}
                        onChange={(e) =>
                          void updateRow(selectedRow.id, {
                            consult_status: e.target.value,
                          })
                        }
                        disabled={saving}
                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none"
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
                    <div className="mt-3 flex flex-wrap gap-2">
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

                      <button
                        onClick={() => void handleDelete(selectedRow.id)}
                        disabled={saving}
                        className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white"
                      >
                        응답 삭제
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
                            <div className="mt-2 text-2xl font-bold text-slate-900">
                              {value}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-slate-500">
                        저장된 점수 데이터가 없습니다.
                      </div>
                    )}
                  </div>

                  <details className="rounded-2xl border border-slate-200 p-4">
                    <summary className="cursor-pointer text-sm font-bold text-slate-900">
                      원본 데이터 보기
                    </summary>
                    <pre className="mt-4 overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs leading-6 text-slate-100">
{JSON.stringify(selectedRow, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}