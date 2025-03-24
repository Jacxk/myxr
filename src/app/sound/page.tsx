import { api } from "~/trpc/server";

export default async function ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { page = "1", tag = "", q = "" } = await searchParams;
  const data = await api.sound.search({
    type: !tag ? "Normal" : "Tag",
    query: q || tag,
  });

  return <span>{data.map((s) => s.name)}</span>;
}
