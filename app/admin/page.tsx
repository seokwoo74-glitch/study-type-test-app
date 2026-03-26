"use client";

import { useEffect, useMemo, useState } from "react";

type SubmissionRecord = {
  id: string;
  createdAt: string;
  student: {
    name: string;
    grade: string;
    phone: string;
  };
  answers: number[];
  resultKey: string;
  resultCode: string;
  reportTitle: string;
  scores: Record<string, number>;
};

const STORAGE_KEY = "study_type_submissions_v1";
const ADMIN_PASSWORD = "1234";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(
    date.getDate()
  ).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAuthed, setIsAuthed] = useState(false);
  const [records, setRecords] = useState<SubmissionRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthed) return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: SubmissionRecord[] = raw ? JSON.parse(raw) : [];
    setRecords(parsed);
  }, [isAuthed]);

  const selected = useMemo(
    () => records.find((item) => item.id === selectedId) ?? null,
    [records, selectedId]
  );

  const totalCount = records.length;
  const latestCount = records.slice(0, 5).length;

  const resultStats = useMemo(() => {
    const map = new Map<string, number>();
    records.forEach((item) => {
      map.set(item.reportTitle, (map.get(item.reportTitle) ?? 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [records]);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthed(true);
      return;
    }
    window.alert("비밀번호가 올바르지 않습니다.");
  };

  const handleReset = () => {
    const ok = window.confirm("저장된 검사 결과를 모두 삭제할까요?");
    if (!ok) return;
    window.localStorage.removeItem(STORAGE_KEY);
    setRecords([]);
    setSelectedId(null);
  };

  if (!isAuthed) {
    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#f8fafc_44%,#eef2ff_100%)] px-4 py-10 text-slate-900">
        <div className="mx-auto max-w-xl rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="text-xs font-extrabold tracking-[0.18em] text-slate-400">
            ADMIN LOGIN
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
            관리자 페이지
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            기본형 관리자 페이지입니다. 현재는 간단한 비밀번호로 접근하며,
            실제 운영 시에는 Supabase Auth 같은 인증 방식으로 바꾸는 걸 추천합니다.
          </p>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-black text-slate-700">
              관리자 비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-slate-400"
              placeholder="비밀번호 입력"
            />
          </div>

          <button
            type="button"
            onClick={handleLogin}
            className="mt-5 rounded-full bg-slate-900 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800"
          >
            로그인
          </button>

          <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-500">
            테스트용 기본 비밀번호: <span className="font-black text-slate-700">1234</span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#f8fafc_44%,#eef2ff_100%)] px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-extrabold tracking-[0.18em] text-slate-400">
              ADMIN DASHBOARD
            </div>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
              학습성향 관리자 페이지
            </h1>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-black text-red-600 transition hover:bg-red-50"
            >
              결과 전체 삭제
            </button>
            <button
              type="button"
              onClick={() => setIsAuthed(false)}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50"
            >
              로그아웃
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
            <div className="text-xs font-extrabold tracking-[0.16em] text-slate-400">
              TOTAL SUBMISSIONS
            </div>
            <div className="mt-3 text-3xl font-black text-slate-950">{totalCount}</div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
            <div className="text-xs font-extrabold tracking-[0.16em] text-slate-400">
              RECENT LIST
            </div>
            <div className="mt-3 text-3xl font-black text-slate-950">{latestCount}</div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
            <div className="text-xs font-extrabold tracking-[0.16em] text-slate-400">
              DATA SOURCE
            </div>
            <div className="mt-3 text-lg font-black text-slate-950">localStorage 기본형</div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-extrabold tracking-[0.16em] text-slate-400">
                  SUBMISSIONS
                </div>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                  검사 결과 목록
                </h2>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-left text-xs font-extrabold tracking-[0.14em] text-slate-400">
                    <th className="px-3">이름</th>
                    <th className="px-3">학년</th>
                    <th className="px-3">전화번호</th>
                    <th className="px-3">결과</th>
                    <th className="px-3">검사일시</th>
                    <th className="px-3">보기</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="rounded-2xl bg-slate-50 px-4 py-10 text-center text-sm font-semibold text-slate-500">
                        아직 저장된 검사 결과가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    records.map((item) => (
                      <tr key={item.id} className="rounded-2xl bg-slate-50 text-sm font-semibold text-slate-700">
                        <td className="rounded-l-2xl px-3 py-4">{item.student.name}</td>
                        <td className="px-3 py-4">{item.student.grade}</td>
                        <td className="px-3 py-4">{item.student.phone}</td>
                        <td className="px-3 py-4">{item.reportTitle}</td>
                        <td className="px-3 py-4">{formatDate(item.createdAt)}</td>
                        <td className="rounded-r-2xl px-3 py-4">
                          <button
                            type="button"
                            onClick={() => setSelectedId(item.id)}
                            className="rounded-full bg-slate-900 px-3 py-2 text-xs font-black text-white"
                          >
                            상세보기
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
              <div className="text-xs font-extrabold tracking-[0.16em] text-slate-400">
                MANAGEMENT
              </div>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                관리자 메뉴
              </h2>

              <div className="mt-5 grid gap-3">
                <div className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-700">
                  결과 조회
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-700">
                  문항 관리 (다음 단계)
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-700">
                  결과 문구 관리 (다음 단계)
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-700">
                  프롬프트 관리 (다음 단계)
                </div>
              </div>
            </div>

            <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
              <div className="text-xs font-extrabold tracking-[0.16em] text-slate-400">
                RESULT STATS
              </div>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                유형별 통계
              </h2>

              <div className="mt-5 grid gap-3">
                {resultStats.length === 0 ? (
                  <div className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">
                    아직 통계 데이터가 없습니다.
                  </div>
                ) : (
                  resultStats.map(([title, count]) => (
                    <div
                      key={title}
                      className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-700"
                    >
                      <span>{title}</span>
                      <span>{count}건</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
              <div className="text-xs font-extrabold tracking-[0.16em] text-slate-400">
                DETAIL VIEW
              </div>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                선택한 결과 상세
              </h2>

              {!selected ? (
                <div className="mt-5 rounded-2xl bg-slate-50 p-5 text-sm font-semibold text-slate-500">
                  왼쪽 목록에서 결과 하나를 선택해 주세요.
                </div>
              ) : (
                <div className="mt-5 grid gap-3">
                  <div className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-700">
                    이름: {selected.student.name}
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-700">
                    학년: {selected.student.grade}
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-700">
                    전화번호: {selected.student.phone}
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-700">
                    결과 유형: {selected.reportTitle}
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-700">
                    결과 코드: {selected.resultCode}
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-700">
                    검사일시: {formatDate(selected.createdAt)}
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-700">
                    응답 수: {selected.answers.length}개
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}