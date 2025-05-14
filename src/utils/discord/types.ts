export interface DiscordError {
  message: string;
  code: number;
}

export const DiscordPermission = {
  MANAGE_GUILD_EXPRESSIONS: 1 << 30,
} as const;

export type DiscordPermissionValue =
  (typeof DiscordPermission)[keyof typeof DiscordPermission];

export type CreateSoundParams = {
  guildId: string;
  name: string;
  emoji: string;
  sound: string;
};
