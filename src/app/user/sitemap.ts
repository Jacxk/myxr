import { type MetadataRoute } from "next";
import { env } from "~/env";
import { UserQuery } from "~/utils/db/queries/user";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const users = await UserQuery.getAllUsersIds();

  return users.map((user) => ({
    url: `${env.NEXT_PUBLIC_BASE_URL}/user/${user.id}`,
    lastModified: user.updatedAt,
  }));
}
