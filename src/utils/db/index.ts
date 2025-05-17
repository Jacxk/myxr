import "server-only";

import { db } from "~/server/db";

export const discordAuthorization = async (id: string) => {
  const user = await db.account.findFirst({
    where: { userId: id },
    select: { accessToken: true },
  });

  return `Bearer ${user?.accessToken}`;
};
