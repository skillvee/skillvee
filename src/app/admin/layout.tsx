import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "~/server/db";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  // Redirect to sign-in if not authenticated
  if (!userId) {
    redirect("/sign-in?redirect_url=" + encodeURIComponent("/admin"));
  }

  // Check if user exists and has admin role
  let user = await db.user.findUnique({
    where: { 
      clerkId: userId,
      deletedAt: null,
    },
    select: {
      id: true,
      role: true,
    },
  });

  // If user doesn't exist in database, check if this is the first user
  if (!user) {
    const userCount = await db.user.count({ where: { deletedAt: null } });
    
    // If this is the first user, create them as admin
    if (userCount === 0) {
      // We need user's email from Clerk to create the user
      // For now, redirect to a setup page that will handle user creation
      redirect("/admin/setup");
    } else {
      // Not first user and doesn't exist in database
      redirect("/unauthorized?message=" + encodeURIComponent("User account not found. Please contact an administrator."));
    }
  }

  // If user exists but doesn't have admin role, redirect to unauthorized
  if (user.role !== "ADMIN") {
    redirect("/unauthorized?message=" + encodeURIComponent("Admin access required"));
  }

  return <>{children}</>;
}