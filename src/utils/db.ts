import { db } from "~/server/db";

const soundInclude = {
  createdBy: {
    select: {
      image: true,
      name: true,
      role: true,
      removed: true,
      id: true,
    },
  },
};

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

export const getSounds = async ({
  take,
  skip,
}: {
  take?: number;
  skip?: number;
} = {}) => {
  return await db.sound.findMany({
    orderBy: { createdAt: "desc" },
    take,
    skip,
    include: soundInclude,
  });
};

export const getSoundsFromUser = async (id: string) => {
  return await db.sound.findMany({
    orderBy: { createdAt: "desc" },
    where: { createdById: id },
    include: soundInclude,
  });
};

export const updateAccessToken = async (
  userId: string,
  data: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  },
) => {
  const discordAccount = await db.account.findFirst({
    where: { userId, provider: "discord" },
  });
  await db.account.update({
    where: {
      provider_providerAccountId: {
        providerAccountId: discordAccount?.providerAccountId!,
        provider: "discord",
      },
    },
    data,
  });
};

export const getUserTokenAndExpiration = async (
  userId: string,
): Promise<{
  expires_at?: number;
  refresh_token?: string;
  expired?: boolean;
}> => {
  const data = await db.account.findFirst({
    where: {
      userId,
    },
    select: { expires_at: true, refresh_token: true },
  });

  const expires_at = data?.expires_at!;
  const expired = Math.floor(Date.now() / 1000) >= data?.expires_at!;
  const refresh_token = data?.refresh_token!;

  return {
    expires_at,
    refresh_token,
    expired,
  };
};

export const getDatabaseSession = (sessionId: string) => {
  return db.session.findFirst({
    where: { sessionToken: sessionId },
  });
};
