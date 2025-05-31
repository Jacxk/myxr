import type { MetadataRoute } from "next";
import { env } from "~/env";
import { LEGAL_LAST_UPDATED } from "~/utils/constants";
import { SoundQuery } from "~/utils/db/queries/sound";
import { UserQuery } from "~/utils/db/queries/user";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date().toISOString();

  // Static routes
  const routes = ["", "/upload"].map((route) => ({
    url: `${env.NEXT_PUBLIC_BASE_URL}${route}`,
    lastModified: currentDate,
    changeFreq: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  // Legal pages
  const legalPages = ["/legal/dmca", "/legal/privacy", "/legal/terms"].map(
    (route) => ({
      url: `${env.NEXT_PUBLIC_BASE_URL}${route}`,
      lastModified:
        LEGAL_LAST_UPDATED[
          route
            .split("/")
            .pop()
            ?.toUpperCase() as keyof typeof LEGAL_LAST_UPDATED
        ] || currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }),
  );

  // Dynamic user pages
  const users = await UserQuery.getAllUsersIds();
  const userPages = users.map((user) => ({
    url: `${env.NEXT_PUBLIC_BASE_URL}/user/${user.id}`,
    lastModified: user.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Dynamic sound pages
  const sounds = await SoundQuery.getAllSoundsIds();
  const soundPages = sounds.map((sound) => ({
    url: `${env.NEXT_PUBLIC_BASE_URL}/sound/${sound.id}`,
    lastModified: sound.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...routes, ...legalPages, ...userPages, ...soundPages];
}
