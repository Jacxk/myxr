import "server-only";

import { db } from "~/server/db";

export const ReportQuery = {
  getReportsFromUser: (userId: string) => {
    return db.soundReport.findMany({
      where: { userId },
      include: { sound: true },
      orderBy: { createdAt: "desc" },
    });
  },
  getReport: (userId: string, soundId: string) => {
    return db.soundReport.findFirst({
      where: { userId, soundId },
    });
  },
};
