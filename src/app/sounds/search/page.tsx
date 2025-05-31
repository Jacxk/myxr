import { notFound } from "next/navigation";
import type { z } from "zod";
import { SoundsSearchClient } from "~/components/sound/sounds-search-client";
import { env } from "~/env";
import { api } from "~/trpc/server";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; type?: string }>;
}) {
  const params = await searchParams;
  const query = params.query ?? "";
  const type = params.type ?? "normal";

  const title = `Search Results for "${query}" - myxr Sounds`;
  const description = `Find and discover sounds matching "${query}". Browse through the collection of sounds for your Discord guild.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `${env.NEXT_PUBLIC_BASE_URL}/sounds/search?query=${query}&type=${type}`,
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "myxr Sound Search",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.jpg"],
    },
    alternates: {
      canonical: `${env.NEXT_PUBLIC_BASE_URL}/sounds/search?query=${query}&type=${type}`,
    },
  };
}

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
