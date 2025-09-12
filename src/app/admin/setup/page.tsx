import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "~/server/db";

export default async function AdminSetupPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in?redirect_url=" + encodeURIComponent("/admin"));
  }

  // Check if this is truly the first user
  const userCount = await db.user.count({ where: { deletedAt: null } });
  
  if (userCount > 0) {
    redirect("/unauthorized?message=" + encodeURIComponent("Admin setup is only available for the first user"));
  }

  // Get user details from Clerk
  const client = await clerkClient();
  const clerkUser = await client.users.getUser(userId);

  if (!clerkUser.emailAddresses?.[0]?.emailAddress) {
    redirect("/unauthorized?message=" + encodeURIComponent("Valid email address required"));
  }

  // Create the first admin user
  await db.user.create({
    data: {
      clerkId: userId,
      email: clerkUser.emailAddresses[0].emailAddress,
      firstName: clerkUser.firstName || null,
      lastName: clerkUser.lastName || null,
      profileImage: clerkUser.imageUrl || null,
      role: "ADMIN",
    },
  });

  // Redirect to admin dashboard
  redirect("/admin?setup=complete");
}