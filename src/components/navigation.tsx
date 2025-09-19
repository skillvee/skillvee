"use client";

import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import { Menu, X } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

interface NavigationProps {
  currentPage?: string;
}

export default function Navigation({ currentPage }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen(!isOpen);

  // Create redirect URL for authentication
  const getRedirectUrl = () => {
    return encodeURIComponent(pathname);
  };

  const navLinks = [
    { href: "/companies", label: "Companies" },
    { href: "/pricing", label: "Pricing" },
    { href: "/faq", label: "FAQ" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-4 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Image 
            src="/skillvee-logo.png?v=2" 
            alt="SkillVee" 
            width={120} 
            height={32}
            className="object-contain"
            priority
          />
        </Link>

        {/* Desktop Navigation & Auth - Right Aligned */}
        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link 
              key={link.href}
              href={link.href} 
              className={`${
                currentPage === link.label.toLowerCase() 
                  ? "text-primary font-medium" 
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {link.label}
            </Link>
          ))}
          
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="outline">Dashboard</Button>
                </Link>
                <UserButton
                  appearance={{
                    variables: {
                      colorPrimary: "rgb(35, 124, 241)",
                      colorBackground: "#ffffff",
                      colorText: "#000000",
                    },
                    elements: {
                      userButtonBox: {
                        backgroundColor: "transparent",
                        border: "1px solid #e5e7eb",
                        borderRadius: "50%",
                        padding: "0",
                        transition: "all 0.15s ease",
                        "&:hover": {
                          borderColor: "rgb(35, 124, 241)",
                          boxShadow: "0 0 0 1px rgba(35, 124, 241, 0.1)",
                        },
                      },
                      userButtonTrigger: {
                        backgroundColor: "rgb(35, 124, 241)",
                        border: "none",
                        borderRadius: "50%",
                        padding: "0",
                        width: "32px",
                        height: "32px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      },
                      avatarBox: {
                        width: "32px",
                        height: "32px",
                        backgroundColor: "rgb(35, 124, 241)",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      },
                      avatarImage: {
                        borderRadius: "50%",
                        width: "100%",
                        height: "100%",
                      },
                      // For users without profile image (initials/fallback)
                      userPreviewMainIdentifier: {
                        color: "#000000",
                        backgroundColor: "transparent",
                        fontSize: "1rem",
                        fontWeight: "600",
                      },
                      userPreviewSecondaryIdentifier: {
                        color: "#6b7280",
                        backgroundColor: "transparent",
                        fontSize: "0.875rem",
                      },
                      // Dropdown/Popover styling
                      userButtonPopoverBox: {
                        backgroundColor: "#ffffff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "0.5rem",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                      },
                      userButtonPopoverCard: {
                        backgroundColor: "#ffffff",
                        borderRadius: "0.5rem",
                        padding: "1rem",
                      },
                      // Hide branding elements
                      footerPages: {
                        display: "none !important",
                        visibility: "hidden !important",
                        height: "0 !important",
                      },
                      footer: {
                        display: "none !important",
                        visibility: "hidden !important",
                        height: "0 !important",
                      },
                      badge: {
                        display: "none !important",
                        visibility: "hidden !important",
                        height: "0 !important",
                      },
                      userButtonPopoverFooter: {
                        display: "none !important",
                        visibility: "hidden !important",
                        height: "0 !important",
                      },
                    },
                  }}
                />
              </>
            ) : (
              <>
                <Link href={`/sign-in?redirect_url=${getRedirectUrl()}`}>
                  <Button variant="outline">Log in</Button>
                </Link>
                <Link href={`/sign-up?redirect_url=${getRedirectUrl()}`}>
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Sign up</Button>
                </Link>
              </>
            )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900 focus:ring-2 focus:ring-primary rounded-lg"
            aria-label="Toggle mobile menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-6 py-4 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block py-2 px-2 text-lg rounded-lg transition-colors ${
                  currentPage === link.label.toLowerCase()
                    ? "text-primary font-medium bg-primary/5"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            
            <div className="pt-4 border-t border-gray-200 space-y-4">
              {user ? (
                <div className="space-y-4">
                  <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full">Dashboard</Button>
                  </Link>
                  <UserButton
                    appearance={{
                      variables: {
                        colorPrimary: "rgb(35, 124, 241)",
                        colorBackground: "#ffffff",
                        colorText: "#000000",
                      },
                      elements: {
                        userButtonBox: {
                          backgroundColor: "transparent",
                          border: "1px solid #e5e7eb",
                          borderRadius: "50%",
                          padding: "0",
                          transition: "all 0.15s ease",
                          "&:hover": {
                            borderColor: "rgb(35, 124, 241)",
                            boxShadow: "0 0 0 1px rgba(35, 124, 241, 0.1)",
                          },
                        },
                        userButtonTrigger: {
                          backgroundColor: "rgb(35, 124, 241)",
                          border: "none",
                          borderRadius: "50%",
                          padding: "0",
                          width: "32px",
                          height: "32px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        },
                        avatarBox: {
                          width: "32px",
                          height: "32px",
                          backgroundColor: "rgb(35, 124, 241)",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        },
                        avatarImage: {
                          borderRadius: "50%",
                          width: "100%",
                          height: "100%",
                        },
                        // For users without profile image (initials/fallback)
                        userPreviewMainIdentifier: {
                          color: "#000000",
                          backgroundColor: "transparent",
                          fontSize: "1rem",
                          fontWeight: "600",
                        },
                        userPreviewSecondaryIdentifier: {
                          color: "#6b7280",
                          backgroundColor: "transparent",
                          fontSize: "0.875rem",
                        },
                        // Dropdown/Popover styling
                        userButtonPopoverBox: {
                          backgroundColor: "#ffffff",
                          border: "1px solid #e5e7eb",
                          borderRadius: "0.5rem",
                          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                        },
                        userButtonPopoverCard: {
                          backgroundColor: "#ffffff",
                          borderRadius: "0.5rem",
                          padding: "1rem",
                        },
                        // Hide branding elements
                        footerPages: {
                          display: "none !important",
                          visibility: "hidden !important",
                          height: "0 !important",
                        },
                        footer: {
                          display: "none !important",
                          visibility: "hidden !important",
                          height: "0 !important",
                        },
                        badge: {
                          display: "none !important",
                          visibility: "hidden !important",
                          height: "0 !important",
                        },
                        userButtonPopoverFooter: {
                          display: "none !important",
                          visibility: "hidden !important",
                          height: "0 !important",
                        },
                      },
                    }}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <Link href={`/sign-in?redirect_url=${getRedirectUrl()}`} onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full">Log in</Button>
                  </Link>
                  <Link href={`/sign-up?redirect_url=${getRedirectUrl()}`} onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Sign up</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}