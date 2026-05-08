import ResultScreen from "@/components/shared-result-screen";
import { supabaseAdmin } from "@/lib/supabase/admin";

export default async function Page({
  params,
}: {
  params: { id: string };
}) {
  const { data, error } = await supabaseAdmin
    .from("test_results")
    .select("result_payload")
    .eq("id", params.id)
    .single();

  if (error || !data?.result_payload) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-[28px] bg-white p-8 shadow">
          결과를 찾을 수 없습니다
        </div>
      </main>
    );
  }

  return (
    <ResultScreen
      payload={data.result_payload}
      restartLabel="처음으로"
    />
  );
}