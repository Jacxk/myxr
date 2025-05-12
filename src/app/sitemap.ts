import { env } from "~/env";
import { LEGAL_LAST_UPDATED } from "~/utils/constants";

export default async function sitemap() {
  const routes = [""].map((route) => ({
    url: `${env.NEXT_PUBLIC_BASE_URL}${route}`,
    lastModified: new Date(),
  }));

  const legalPages = ["/legal/dmca", "/legal/privacy", "/legal/terms"].map(
    (route) => ({
      url: `${env.NEXT_PUBLIC_BASE_URL}${route}`,
      lastModified:
        LEGAL_LAST_UPDATED[
          route
            .split("/")
            .pop()
            ?.toUpperCase() as keyof typeof LEGAL_LAST_UPDATED
        ],
    }),
  );

  return [...routes, ...legalPages];
}
