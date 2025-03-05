import { NextResponse } from "next/server";
import nacl from "tweetnacl";
import { env } from "~/env";
import { db } from "~/server/db";

enum DataType {
  APPLICATION_AUTHORIZED = "APPLICATION_AUTHORIZED",
  ENTITLEMENT_CREATE = "ENTITLEMENT_CREATE",
  QUEST_USER_ENROLLMENT = "QUEST_USER_ENROLLMENT",
}

interface WebhookData {
  type?: number;
  event: {
    type: DataType;
    timestamp: Date;
    data: {
      guild?: {
        id: string;
      };
      user: object;
    };
  };
}

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

  const { type, event } = JSON.parse(body) as WebhookData;
  const { guild } = event.data;

  if (type === 0) {
    return new NextResponse(null, { status: 204 });
  } else {
    if (event.type === DataType.APPLICATION_AUTHORIZED && guild) {
      await db.guild.create({
        data: {
          id: guild.id,
          // TODO: Remove this field and only use the ID
          name: "",
        },
      });
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
