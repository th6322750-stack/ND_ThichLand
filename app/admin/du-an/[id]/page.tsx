export default async function AdminDuAnEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <main>TODO Task 10 — admin project edit ({id})</main>;
}
