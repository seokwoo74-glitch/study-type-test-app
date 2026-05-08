import type { Metadata } from "next";
import ResultScreen from "@/components/shared-result-screen";
import { supabaseAdmin } from "@/lib/supabase/admin";

type PageProps = {
  params: { id: string };
};

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://study-type-test-app-zbmw.vercel.app";

// 🔥 카카오 / 링크 썸네일용
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = params;

  const { data } = await supabaseAdmin
    .from("test_results")
    .select("result_payload")
    .eq("id", id)
    .single();

  const payload = data?.result_payload as any;

  const title = payload?.result?.title
    ? `${payload.result.title} · 학습성향 검사 결과`
    : "학습성향 검사 결과";

  const description =
    payload?.result?.summary ||
    "우리 아이 학습성향을 분석한 결과를 확인해보세요.";

  const url = `${SITE_URL}/result/${id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "학습성향 검사",
      images: [
        {
          url: `${SITE_URL}/og.png`, // 🔥 public/og.png
          width: 1200,
          height: 630,
          alt: "학습성향 검사 결과",
        },
      ],
      type: "website",
    },
  };
}

// 🔥 실제 페이지
export default async function Page({ params }: PageProps) {
  const { id } = params;

  const { data, error } = await supabaseAdmin
    .from("test_results")
    .select("result_payload")
    .eq("id", id)
    .single();

  if (error || !data?.result_payload) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="rounded-[28px] bg-white p-8 text-center shadow-xl">
          <h1 className="text-xl font-black text-slate-900">
            결과를 찾을 수 없습니다
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            링크가 잘못되었거나 삭제된 결과입니다.
          </p>
        </div>
      </main>
    );
  }

  const payload = data.result_payload;
  const shareUrl = `${SITE_URL}/result/${id}`;

  return (
    <ResultScreen
      payload={payload}
      shareUrl={shareUrl}
      restartLabel="처음으로"
    />
  );
}