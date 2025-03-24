import { api } from "~/trpc/server";

export default async function ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { page = "1", sort = "asc", q = "" } = await searchParams;
  const data = await api.sound.search(q);

  return <span>{data.map((s) => s.name)}</span>;
}
