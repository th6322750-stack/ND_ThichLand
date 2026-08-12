export default async function DuAnDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <main>TODO Task 06 — project detail ({slug})</main>;
}
