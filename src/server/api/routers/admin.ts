import { z } from "zod";
import { getAllReports, takeActionOnReport } from "~/utils/db";
import { adminProtectedProcedure, createTRPCRouter } from "../trpc";

export const adminRouter = createTRPCRouter({
  reports: adminProtectedProcedure.query(async () => {
    return getAllReports();
  }),
  reportAction: adminProtectedProcedure
    .input(
      z.object({
        reportId: z.string(),
        actionTaken: z.enum([
          "DELETED",
          "IN_PROGRESS",
          "NO_ACTION_REQUIRED",
          "FLAGGED_FOR_REVIEW",
          "RESOLVED",
        ]),
        actionText: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { reportId, actionTaken, actionText } = input;

      return takeActionOnReport(reportId, actionTaken, actionText);
    }),
});
