export default async function TinTucDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <main>TODO Task 07 — news detail ({slug})</main>;
}
