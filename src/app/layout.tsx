import "~/styles/globals.css";
import "~/styles/clerk-custom.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";

import { TRPCReactProvider } from "~/trpc/react";
import AnimationProvider from "~/components/animation-provider";

export const metadata: Metadata = {
  title: "SkillVee - AI-Powered Data Science Interview Practice",
  description: "Turn interview prep into real job offers. Practice with realistic, AI-powered interviews tailored to your target roles and unlock new job opportunities through our partner network.",
  icons: [
    { rel: "icon", url: "/Skillvee favicon.png" },
    { rel: "apple-touch-icon", url: "/Skillvee webclip.png" },
  ],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${geist.variable}`}>
        <body>
          <TRPCReactProvider>
            <AnimationProvider>
              {children}
            </AnimationProvider>
          </TRPCReactProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
