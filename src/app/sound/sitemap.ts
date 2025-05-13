import { MetadataRoute } from "next";
import { env } from "~/env";
import { SoundQuery } from "~/utils/db/queries/sound";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sounds = await SoundQuery.getAllSoundsIds();

  return sounds.map((sound) => ({
    url: `${env.NEXT_PUBLIC_BASE_URL}/sound/${sound.id}`,
    lastModified: sound.updatedAt,
  }));
}
