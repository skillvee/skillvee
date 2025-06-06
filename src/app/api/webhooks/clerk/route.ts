import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";

import { env } from "~/env";
import { db } from "~/server/db";

type ClerkWebhookEvent = {
  type: string;
  data: {
    id: string;
    email_addresses: Array<{
      email_address: string;
      id: string;
    }>;
    first_name: string | null;
    last_name: string | null;
    profile_image_url: string;
    public_metadata: {
      role?: "admin" | "interviewer";
    };
  };
};

export async function POST(req: NextRequest) {
  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occurred -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.text();

  // If there are no headers, error out
  if (!env.CLERK_WEBHOOK_SECRET) {
    console.error("CLERK_WEBHOOK_SECRET not found");
    return new Response("Error occurred -- webhook secret not configured", {
      status: 500,
    });
  }

  // Create a new Svix instance with your secret.
  const wh = new Webhook(env.CLERK_WEBHOOK_SECRET);

  let evt: ClerkWebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as ClerkWebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occurred", {
      status: 400,
    });
  }

  const { type, data } = evt;
  
  try {
    switch (type) {
      case "user.created":
        await handleUserCreated(data);
        break;
      case "user.updated":
        await handleUserUpdated(data);
        break;
      case "user.deleted":
        await handleUserDeleted(data);
        break;
      default:
        console.log(`Unhandled webhook type: ${type}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response("Error occurred", { status: 500 });
  }
}

async function handleUserCreated(data: ClerkWebhookEvent["data"]) {
  const email = data.email_addresses[0]?.email_address;
  
  if (!email) {
    console.error("No email found in user.created webhook");
    return;
  }

  // Default to INTERVIEWER role, can be changed to ADMIN via Clerk metadata
  const role = data.public_metadata?.role === "admin" ? "ADMIN" : "INTERVIEWER";

  await db.user.create({
    data: {
      clerkId: data.id,
      email,
      firstName: data.first_name,
      lastName: data.last_name,
      profileImage: data.profile_image_url,
      role: role,
    },
  });

  console.log(`User created: ${email} with role: ${role}`);
}

async function handleUserUpdated(data: ClerkWebhookEvent["data"]) {
  const email = data.email_addresses[0]?.email_address;
  
  if (!email) {
    console.error("No email found in user.updated webhook");
    return;
  }

  // Update role if changed in Clerk metadata
  const role = data.public_metadata?.role === "admin" ? "ADMIN" : "INTERVIEWER";

  await db.user.update({
    where: { clerkId: data.id },
    data: {
      email,
      firstName: data.first_name,
      lastName: data.last_name,
      profileImage: data.profile_image_url,
      role: role,
    },
  });

  console.log(`User updated: ${email} with role: ${role}`);
}

async function handleUserDeleted(data: ClerkWebhookEvent["data"]) {
  // Soft delete - set deletedAt timestamp
  await db.user.update({
    where: { clerkId: data.id },
    data: {
      deletedAt: new Date(),
    },
  });

  console.log(`User soft deleted: ${data.id}`);
}