"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "./session-provider";

/**
 * Session Guard Component for Admin Route Protection
 * 
 * Provides automatic authentication checking and redirects for admin pages.
 * Wraps components to ensure only authenticated users can access them.
 * 
 * Features:
 * - Automatic session validation on component mount
 * - Redirect to Flask login if not authenticated
 * - Customizable fallback UI
 * - Loading state handling
 * - Integration with SessionProvider context
 */

interface SessionGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

const FLASK_SESSION_URL = process.env.NEXT_PUBLIC_FLASK_SESSION_URL || "http://localhost:5001";

export function SessionGuard({ children, fallback }: SessionGuardProps) {
  const { isAuthenticated, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Redirect to Next.js admin signup page if not authenticated
      router.push('/admin-signup');
    }
  }, [isAuthenticated, loading, router]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Show fallback UI if not authenticated
  if (!isAuthenticated) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-4">Please log in to access this page.</p>
          <button
            onClick={() => {
              router.push('/admin-signup');
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Render protected content if authenticated
  return <>{children}</>;
}
