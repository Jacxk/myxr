export type DiscordErrorType = {
  message: string;
  code: number;
};

export class DiscordError extends Error {
  code: number;

  constructor(code: number, message: string) {
    super(message);
    this.name = "DiscordError";
    this.code = code;
  }
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
