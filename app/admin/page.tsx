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

export default function AdminPage() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [rows, setRows] = useState<TestResultRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = sessionStorage.getItem("admin-auth-ok");
    if (saved === "yes") setIsAuthed(true);
  }, []);

  async function fetchResults() {
    if (!supabase) return;

    setLoading(true);
    const { data } = await supabase
      .from("test_results")
      .select("*")
      .order("created_at", { ascending: false });

    const safe = Array.isArray(data) ? (data as TestResultRow[]) : [];
    setRows(safe);
    if (safe.length > 0) setSelectedId(safe[0].id);
    setLoading(false);
  }

  useEffect(() => {
    if (isAuthed) fetchResults();
  }, [isAuthed]);

  function handleLogin() {
    if (password === adminPassword) {
      sessionStorage.setItem("admin-auth-ok", "yes");
      setIsAuthed(true);
    } else {
      alert("비밀번호 틀림");
    }
  }

  const selectedRow =
    rows.find((r) => r.id === selectedId) ?? rows[0] ?? null;

  // ✅ 핵심 수정 (절대 안터짐)
  const selectedScores = selectedRow
    ? normalizeScores(selectedRow.scores) ??
      normalizeScores(getPayloadValue(selectedRow, "scores")) ??
      null
    : null;

  if (!isAuthed) {
    return (
      <div className="p-10">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호"
          className="border p-2"
        />
        <button onClick={handleLogin} className="ml-2 border px-4 py-2">
          로그인
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">관리자 페이지</h1>

      {loading ? (
        <div>로딩중...</div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {/* 리스트 */}
          <div>
            {rows.map((row) => (
              <div
                key={String(row.id)}
                onClick={() => setSelectedId(row.id)}
                className="border p-3 mb-2 cursor-pointer"
              >
                <div>{getName(row)}</div>
                <div>{getResultTitle(row)}</div>
                <div>{formatDate(row.created_at)}</div>
              </div>
            ))}
          </div>

          {/* 상세 */}
          <div>
            {selectedRow && (
              <div>
                <div>이름: {getName(selectedRow)}</div>
                <div>유형: {getResultTitle(selectedRow)}</div>

                <div className="mt-4">
                  <div className="font-bold">점수</div>
                  {selectedScores ? (
                    Object.entries(selectedScores).map(([k, v]) => (
                      <div key={k}>
                        {k}: {v}
                      </div>
                    ))
                  ) : (
                    <div>점수 없음</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}