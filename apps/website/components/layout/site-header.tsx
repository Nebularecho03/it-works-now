"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Facebook, Twitter, Instagram, Linkedin, Zap, Activity, CheckCircle, XCircle } from "lucide-react";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { siteContent } from "@/lib/content/site-content";
import { SiteSidebar } from "./site-sidebar";

// Get Scholars Forge URL - works in both development and production
const getScholarsUrl = () => {
  // Use environment variable if set
  if (process.env.NEXT_PUBLIC_SCHOLARS_FORGE_URL) {
    return process.env.NEXT_PUBLIC_SCHOLARS_FORGE_URL;
  }
  
  // Fallback to path-based routing for single domain
  // For production with subdomain, set NEXT_PUBLIC_SCHOLARS_FORGE_URL
  return '/scholars';
};

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/research-hub", label: "Research Hub" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

interface UserSession {
  email: string;
  name?: string;
  role: string;
  timestamp: number;
  token: string;
}

export function SiteHeader() {
  const pathname = usePathname();
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState("/");
  const [scholarsUrl, setScholarsUrl] = useState('http://localhost:4500');
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    setScholarsUrl(getScholarsUrl());
  }, []);

  useEffect(() => {
    // Check for user session in localStorage
    const session = localStorage.getItem("userSession");
    if (session) {
      try {
        const parsedSession = JSON.parse(session);
        // Check if session is not older than 24 hours
        const sessionAge = Date.now() - parsedSession.timestamp;
        if (sessionAge < 24 * 60 * 60 * 1000) {
          setUserSession(parsedSession);
        } else {
          // Session expired, remove it
          localStorage.removeItem("userSession");
          localStorage.removeItem("authToken");
        }
      } catch (error) {
        // Invalid session, remove it
        localStorage.removeItem("userSession");
        localStorage.removeItem("authToken");
      }
    }
    setLoading(false);
  }, []);

  // Validate session by checking backend connectivity
  useEffect(() => {
    if (userSession) {
      fetch('http://localhost:8000/api/health')
        .then(res => {
          if (!res.ok) {
            // Backend not responding, clear session
            localStorage.removeItem("userSession");
            localStorage.removeItem("authToken");
            setUserSession(null);
          }
        })
        .catch(() => {
          // Backend unreachable, keep session but show warning
          console.warn('Admin backend not reachable');
        });
    }
  }, [userSession]);

  // Check backend status periodically
  useEffect(() => {
    const checkBackend = async () => {
      setBackendStatus('checking');
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/health`);
        if (response.ok) {
          setBackendStatus('online');
        } else {
          setBackendStatus('offline');
        }
      } catch {
        setBackendStatus('offline');
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const isSignedIn = !!userSession;

  const handleSignOut = () => {
    localStorage.removeItem("userSession");
    localStorage.removeItem("authToken");
    setUserSession(null);
    // Redirect to home page
    window.location.href = "/";
  };

  // Don't render header on admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container-shell flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border-2 border-background"></div>
              </div>
              <div className="font-display text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Dr. Stephen Asatsa
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              {links.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button 
                asChild 
                size="sm"
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0"
              >
                <a href={siteContent.contact.bookingUrl} target="_blank" rel="noopener noreferrer">
                  Book Now
                </a>
              </Button>
              <Button 
                asChild 
                size="sm" 
                variant="outline"
                className="border-purple-500/30 text-purple-700 hover:bg-purple-50"
              >
                {isSignedIn ? (
                  <div className="flex items-center gap-2">
                    <Link href="/admin">Admin Panel</Link>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSignOut();
                      }}
                      className="ml-2 text-xs text-purple-600 hover:text-purple-800"
                    >
                      (Sign Out)
                    </button>
                  </div>
                ) : (
                  <Link href="/admin-signup">Stephen Asatsa Sign In</Link>
                )}
              </Button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 hover:bg-muted transition-all duration-200 hover:scale-105"
              >
                <Menu className="h-4 w-4" />
                <span className="sr-only">Menu</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Cool Sidebar */}
      <SiteSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        currentPath={currentPath}
      />
    </>
  );
}
