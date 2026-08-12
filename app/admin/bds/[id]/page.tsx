export default async function AdminBdsEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <main>TODO Task 09 — admin BĐS edit ({id})</main>;
}
