export default async function AdminTinTucEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <main>TODO Task 10 — admin news edit ({id})</main>;
}
