import "server-only";
import { DatabaseNotificationHandler } from "~/lib/notifications/handlers/DatabaseNotificationHandler";
import { NotificationService } from "~/lib/notifications/NotificationService";

const milestoneNotificationService = new NotificationService();
milestoneNotificationService.addHandler(new DatabaseNotificationHandler());

export enum MilestoneType {
  DOWNLOADS = "DOWNLOADS",
  LIKES = "LIKES",
  USAGE = "USAGE",
  SHARES = "SHARES",
}

const MILESTONE_THRESHOLDS = {
  [MilestoneType.DOWNLOADS]: [10, 50, 100, 500, 1000, 5000, 10000],
  [MilestoneType.LIKES]: [5, 25, 50, 100, 500, 1000, 5000],
  [MilestoneType.USAGE]: [10, 50, 100, 500, 1000, 5000, 10000],
  [MilestoneType.SHARES]: [5, 25, 50, 100, 500, 1000, 5000],
};

export const checkSoundMilestone = (
  current: number,
  sound: {
    createdById: string;
    name: string;
  },
  type: MilestoneType,
) => {
  const milestone = MILESTONE_THRESHOLDS[type].find(
    (threshold) => current >= threshold,
  );

  if (milestone) {
    void milestoneNotificationService.notify({
      userId: sound.createdById,
      title: `Milestone Reached! 🎉`,
      description: `Your sound "${sound.name}" has reached ${milestone} ${type.toLowerCase()}!`,
      createdAt: new Date(),
    });
  }
};
