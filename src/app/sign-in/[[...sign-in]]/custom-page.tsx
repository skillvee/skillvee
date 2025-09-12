"use client";

import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import Link from "next/link";

export default function CustomSignInPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setLoading(true);
    setError("");

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/job-description");
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: "oauth_google" | "oauth_linkedin") => {
    if (!isLoaded) return;
    
    try {
      await signIn.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/job-description",
      });
    } catch (err) {
      console.error("OAuth error:", err);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-10">
          <h1 className="text-2xl font-semibold text-center mb-2">
            Sign in to Skillvee
          </h1>
          <p className="text-gray-500 text-center mb-8">
            Welcome back! Please sign in to continue
          </p>

          {/* Social Login Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => handleOAuth("oauth_google")}
              className="flex-1 flex items-center justify-center gap-2 border border-gray-200 rounded-lg py-2.5 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-gray-700 font-medium">Google</span>
            </button>
            <button
              onClick={() => handleOAuth("oauth_linkedin")}
              className="flex-1 flex items-center justify-center gap-2 border border-gray-200 rounded-lg py-2.5 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#0A66C2" d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
              </svg>
              <span className="text-gray-700 font-medium">LinkedIn</span>
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-400">or</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors"
                placeholder="Enter your email address"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors"
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-800 hover:bg-gray-900 text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              {loading ? "Signing in..." : "Continue →"}
            </Button>
          </form>

          <p className="text-center mt-8 text-gray-500">
            Don't have an account?{" "}
            <Link href="/sign-up" className="text-gray-900 font-semibold hover:underline">
              Sign up
            </Link>
          </p>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
              Secured by{" "}
              <svg className="w-4 h-4" viewBox="0 0 53 18" fill="none">
                <path d="M15.022 5.348a1.105 1.105 0 011.58 0l.717.733a1.156 1.156 0 010 1.614l-7.018 7.175a1.105 1.105 0 01-1.58 0l-3.31-3.384a1.156 1.156 0 010-1.614l.717-.733a1.105 1.105 0 011.58 0l1.813 1.854a.553.553 0 00.79 0l5.711-5.645z" fill="#6b7280"/>
                <path d="M23.516 14.476c1.022 0 1.856-.211 2.502-.633.654-.422 1.135-1.03 1.444-1.825h1.674c-.374 1.217-1.034 2.153-1.978 2.807-.945.654-2.145.98-3.602.98-1.23 0-2.31-.264-3.24-.791-.93-.528-1.65-1.282-2.16-2.261-.51-.98-.765-2.13-.765-3.45 0-1.304.255-2.446.765-3.425.51-.987 1.226-1.745 2.147-2.274.929-.536 2.005-.804 3.227-.804 1.214 0 2.266.26 3.155.778.897.519 1.584 1.238 2.062 2.157.477.92.716 1.96.716 3.123 0 .251-.008.476-.024.673h-9.77v.022c.024.861.203 1.595.536 2.2.34.598.81 1.055 1.406 1.372.605.309 1.31.463 2.115.463zm3.71-5.71c-.024-.77-.203-1.425-.536-1.966a3.052 3.052 0 00-1.332-1.23c-.559-.285-1.21-.427-1.952-.427-.75 0-1.41.142-1.978.427a3.162 3.162 0 00-1.345 1.23c-.325.532-.5 1.176-.524 1.93v.037h7.667zM32.93 14.464V9.582c0-.725.146-1.346.44-1.862.292-.524.703-.922 1.233-1.193.537-.28 1.163-.42 1.877-.42.373 0 .738.04 1.095.122.365.08.684.203.957.37l-.488 1.558a2.636 2.636 0 00-.659-.28 2.576 2.576 0 00-.734-.11c-.772 0-1.375.236-1.807.707-.423.471-.635 1.139-.635 2.003v3.987h1.796v1.461h-5.783v-1.461h1.709zM41.663 14.464V2.586h-1.71V1.125h3.797v7.617l-.122 1.315h.122c.342-.626.834-1.11 1.477-1.45.65-.341 1.41-.512 2.277-.512.862 0 1.622.187 2.28.56a3.84 3.84 0 011.533 1.608c.366.699.549 1.529.549 2.49v3.711h1.71v1.461h-5.507v-1.461h1.71V10.86c0-.903-.236-1.606-.708-2.108-.471-.503-1.138-.754-2-.754-.65 0-1.217.154-1.7.463a3.024 3.024 0 00-1.126 1.303c-.268.56-.402 1.213-.402 1.96v2.74h1.71v1.461h-5.507v-1.461h1.797z" fill="#6b7280"/>
              </svg>
              clerk
            </p>
            <p className="text-xs text-orange-500 font-medium mt-1">Development mode</p>
          </div>
        </div>
      </div>
    </div>
  );
}