import { createClient } from "@/app/lib/supabase/server";

export default async function TesteSupabasePage() {
  const supabase = await createClient();

  const { data, error } = await supabase.from("planos").select("*");

  return (
    <div style={{ padding: 20 }}>
      <h1>Teste Supabase</h1>
      <pre>{JSON.stringify({ data, error }, null, 2)}</pre>
    </div>
  );
}