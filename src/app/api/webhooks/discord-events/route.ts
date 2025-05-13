import type {
  APIGuild,
  APIWebhookEvent,
  APIWebhookEventApplicationAuthorizedData,
} from "discord-api-types/v10";
import {
  ApplicationWebhookEventType,
  ApplicationWebhookType,
} from "discord-api-types/v10";
import { NextResponse } from "next/server";
import nacl from "tweetnacl";
import { env } from "~/env";
import { GuildMutation } from "~/utils/db/mutations/guild";

export async function POST(req: Request) {
  const body = await req.text();

  const signature = req.headers.get("X-Signature-Ed25519");
  const timestamp = req.headers.get("X-Signature-Timestamp");

  if (!signature || !timestamp) {
    return NextResponse.json(
      { error: "Missing signature or timestamp" },
      { status: 400 },
    );
  }

  const rawPayload = timestamp + body;

  if (!verifySignature(signature, rawPayload)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const { type, event } = JSON.parse(body) as APIWebhookEvent;

  if (type === ApplicationWebhookType.Ping) {
    return new NextResponse(null, { status: 204 });
  } else {
    const { guild } = event.data as APIWebhookEventApplicationAuthorizedData;
    if (
      event.type === ApplicationWebhookEventType.ApplicationAuthorized &&
      guild
    ) {
      await GuildMutation.upsertGuild({
        id: guild.id,
        name: guild.name,
      } as APIGuild);
    }
    return NextResponse.json({}, { status: 200 });
  }
}

function verifySignature(signature: string, payload: string): boolean {
  const signatureBuffer = Buffer.from(signature, "hex");
  const publicKey = Buffer.from(env.DISCORD_PUBLIC_KEY, "hex");

  const message = Buffer.from(payload);

  return nacl.sign.detached.verify(message, signatureBuffer, publicKey);
}
