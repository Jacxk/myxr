import { notFound } from "next/navigation";
import type { z } from "zod";
import { SoundsSearchClient } from "~/components/sound/sounds-search-client";
import { api } from "~/trpc/server";

export default async function SoundsSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; type?: string }>;
}) {
  const params = await searchParams;
  const query = params.query ?? "";
  const type = (params.type ?? "normal") as z.infer<
    z.ZodEnum<["normal", "tag"]>
  >;

  if (!query) return notFound();

  const initialData = await api.sound.search({
    query,
    type,
  });

  return (
    <>
      <title>{`${query} - Search`}</title>
      <SoundsSearchClient initialData={initialData} query={query} type={type} />
    </>
  );
}
