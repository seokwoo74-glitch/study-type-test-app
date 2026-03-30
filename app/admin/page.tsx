"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
);

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "";

type Row = Record<string, any>;

function pick(...v: any[]) {
  return v.find((x) => typeof x === "string" && x.trim()) ?? "-";
}

function getTitle(r: Row) {
  return pick(r.result_title, r.title, r.result_type);
}

function getName(r: Row) {
  return pick(r.name, r.student_name);
}

function formatDate(d?: string) {
  if (!d) return "-";
  return new Date(d).toLocaleString("ko-KR");
}

export default function AdminPage() {
  const [auth, setAuth] = useState(false);
  const [pw, setPw] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [selected, setSelected] = useState<Row | null>(null);

  // 필터 상태
  const [search, setSearch] = useState("");
  const [type, setType] = useState("전체");
  const [sort, setSort] = useState("latest");

  // 로그인 유지
  useEffect(() => {
    if (sessionStorage.getItem("admin-ok") === "yes") {
      setAuth(true);
    }
  }, []);

  // 데이터 불러오기
  async function load() {
    const { data } = await supabase
      .from("test_results")
      .select("*")
      .order("created_at", { ascending: false });

    const list = data ?? [];
    setRows(list);
    setSelected(list[0] ?? null);
  }

  useEffect(() => {
    if (auth) load();
  }, [auth]);

  function login() {
    if (pw === ADMIN_PASSWORD) {
      sessionStorage.setItem("admin-ok", "yes");
      setAuth(true);
    } else {
      alert("비밀번호 틀림");
    }
  }

  // 필터링
  const filtered = useMemo(() => {
    let list = [...rows];

    if (search) {
      list = list.filter((r) =>
        JSON.stringify(r).toLowerCase().includes(search.toLowerCase())
      );
    }

    if (type !== "전체") {
      list = list.filter((r) => getTitle(r) === type);
    }

    list.sort((a, b) => {
      const t1 = new Date(a.created_at ?? "").getTime();
      const t2 = new Date(b.created_at ?? "").getTime();
      return sort === "latest" ? t2 - t1 : t1 - t2;
    });

    return list;
  }, [rows, search, type, sort]);

  // 통계
  const stats = useMemo(() => {
    const total = rows.length;

    const today = rows.filter((r) => {
      if (!r.created_at) return false;
      return (
        new Date(r.created_at).toDateString() ===
        new Date().toDateString()
      );
    }).length;

    const map = new Map<string, number>();
    rows.forEach((r) => {
      const t = getTitle(r);
      if (t !== "-") map.set(t, (map.get(t) ?? 0) + 1);
    });

    const top = [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([k, v]) => `${k}(${v})`)
      .join(" / ");

    return { total, today, top };
  }, [rows]);

  if (!auth) {
    return (
      <div className="p-10">
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="관리자 비밀번호"
          className="border p-2"
        />
        <button onClick={login} className="ml-2 border px-4 py-2">
          로그인
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold">관리자 대시보드</h1>

      {/* 통계 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="border p-4">총 응답: {stats.total}</div>
        <div className="border p-4">오늘: {stats.today}</div>
        <div className="border p-4">TOP: {stats.top || "-"}</div>
      </div>

      {/* 필터 */}
      <div className="flex gap-3">
        <input
          placeholder="검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2"
        />

        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option>전체</option>
          {[...new Set(rows.map(getTitle))].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>

        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="latest">최신순</option>
          <option value="oldest">오래된순</option>
        </select>
      </div>

      {/* 리스트 + 상세 */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          {filtered.map((r) => (
            <div
              key={r.id}
              onClick={() => setSelected(r)}
              className="border p-3 mb-2 cursor-pointer"
            >
              <div>{getName(r)}</div>
              <div>{getTitle(r)}</div>
              <div>{formatDate(r.created_at)}</div>
            </div>
          ))}
        </div>

        <div>
          {selected && (
            <div className="border p-4">
              <div>이름: {getName(selected)}</div>
              <div>유형: {getTitle(selected)}</div>
              <div>날짜: {formatDate(selected.created_at)}</div>

              <pre className="mt-4 text-xs">
                {JSON.stringify(selected, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}