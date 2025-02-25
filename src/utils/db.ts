import { db } from "~/server/db";

export const discordAuthorization = async (id: string) => {
  const user = await db.account.findFirst({
    where: { userId: id },
    select: { access_token: true, token_type: true },
  });

  if (user?.token_type?.toLowerCase() !== "bearer") {
    throw new Error("Invalid token type");
  }

  return `Bearer ${user?.access_token}`;
};
