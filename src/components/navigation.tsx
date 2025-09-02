"use client";

import { useState } from "react";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import { Menu, X } from "lucide-react";
import { useUser } from "@clerk/nextjs";

interface NavigationProps {
  currentPage?: string;
}

export default function Navigation({ currentPage }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();

  const toggleMenu = () => setIsOpen(!isOpen);

  const navLinks = [
    { href: "/companies", label: "Companies" },
    { href: "/pricing", label: "Pricing" },
    { href: "/faq", label: "FAQ" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-4 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-8">
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
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className={`${
                  currentPage === link.label.toLowerCase() 
                    ? "text-blue-600 font-medium" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
              <UserButton />
            </div>
          ) : (
            <>
              <SignInButton mode="modal">
                <Button variant="outline">Log in</Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button className="bg-blue-600 hover:bg-blue-700">Sign up</Button>
              </SignUpButton>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900 focus:ring-2 focus:ring-blue-600 rounded-lg"
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
                    ? "text-blue-600 font-medium bg-blue-50"
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
                  <UserButton />
                </div>
              ) : (
                <div className="space-y-4">
                  <SignInButton mode="modal">
                    <Button variant="outline" className="w-full">Log in</Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">Sign up</Button>
                  </SignUpButton>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}