import { env } from "~/env";
import { LEGAL_LAST_UPDATED } from "~/utils/constants";

const lastModified = new Date();

export default async function sitemap() {
  const routes = ["", "/upload"].map((route) => ({
    url: `${env.NEXT_PUBLIC_BASE_URL}${route}`,
    lastModified,
  }));

  const sitemaps = ["/sound/sitemap.xml", "/user/sitemap.xml"].map((route) => ({
    url: `${env.NEXT_PUBLIC_BASE_URL}${route}`,
    lastModified,
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

  return [...routes, ...legalPages, ...sitemaps];
}
