import { db } from "~/server/db";

export const ReportMutations = {
  createReport: async (userId: string, soundId: string, reason: string) => {
    const report = await db.soundReport.create({
      data: { userId, soundId, reason },
    });
    return report;
  },
};
