export default async function ChoThueDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <main>TODO Task 05 — rental detail ({slug})</main>;
}
