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
  console.log("Webhook received:", new Date().toISOString());
  
  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("Missing svix headers:", { svix_id, svix_timestamp, svix_signature });
    return new Response("Error occurred -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.text();
  console.log("Webhook payload length:", payload.length);

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
    console.log("Webhook verified successfully, event type:", evt.type);
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
        console.log("Processing user.created event for:", data.id);
        await handleUserCreated(data);
        break;
      case "user.updated":
        console.log("Processing user.updated event for:", data.id);
        await handleUserUpdated(data);
        break;
      case "user.deleted":
        console.log("Processing user.deleted event for:", data.id);
        await handleUserDeleted(data);
        break;
      default:
        console.log(`Unhandled webhook type: ${type}`);
    }

    console.log("Webhook processed successfully");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    console.error("Stack trace:", error instanceof Error ? error.stack : 'No stack trace');
    return new Response("Error occurred", { status: 500 });
  }
}

async function handleUserCreated(data: ClerkWebhookEvent["data"]) {
  const email = data.email_addresses[0]?.email_address;
  
  if (!email) {
    console.error("No email found in user.created webhook", { data });
    throw new Error("No email found in webhook data");
  }

  // Default to INTERVIEWER role, can be changed to ADMIN via Clerk metadata
  const role = data.public_metadata?.role === "admin" ? "ADMIN" : "INTERVIEWER";

  console.log("Attempting to create user in database:", {
    clerkId: data.id,
    email,
    firstName: data.first_name,
    lastName: data.last_name,
    role,
  });

  try {
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { clerkId: data.id },
    });

    if (existingUser) {
      console.log("User already exists in database:", data.id);
      return;
    }

    const newUser = await db.user.create({
      data: {
        clerkId: data.id,
        email,
        firstName: data.first_name,
        lastName: data.last_name,
        profileImage: data.profile_image_url,
        role: role,
      },
    });

    console.log(`User created successfully in database:`, {
      id: newUser.id,
      clerkId: newUser.clerkId,
      email: newUser.email,
      role: newUser.role,
    });
  } catch (error) {
    console.error("Database error creating user:", error);
    console.error("User data:", {
      clerkId: data.id,
      email,
      firstName: data.first_name,
      lastName: data.last_name,
      role,
    });
    throw error;
  }
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