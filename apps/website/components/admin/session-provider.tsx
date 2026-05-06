"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

/**
 * Session Provider for Admin Panel Authentication
 * 
 * Provides secure session management with automatic keep-alive functionality.
 * Integrates with Flask session manager for authentication state.
 * 
 * Features:
 * - Automatic session validation on page visibility changes
 * - Keep-alive pings every 2 minutes to maintain session
 * - Secure session ID storage in localStorage
 * - Graceful handling of session expiration
 * - Integration with Flask backend API
 */

type User = {
  username: string;
  displayName: string;
  role: string;
  mfaConfigured: boolean;
};

type SessionContextType = {
  user: User | null;
  sessionId: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  keepAlive: () => Promise<void>;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

// Flask backend URL - configurable via environment variable
const FLASK_SESSION_URL = process.env.NEXT_PUBLIC_FLASK_SESSION_URL || "http://localhost:5001";

export function SessionProvider({ children }: { children: ReactNode }) {
  // Session state management
  const [user, setUser] = useState<User | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [keepAliveInterval, setKeepAliveInterval] = useState<NodeJS.Timeout | null>(null);

  // Authentication state derived from user and session
  const isAuthenticated = !!user && !!sessionId;

  // Check session on mount and page visibility changes
  useEffect(() => {
    checkSession();
    
    const handleVisibilityChange = () => {
      // Re-validate session when page becomes visible (user returns to tab)
      if (document.visibilityState === 'visible' && isAuthenticated) {
        checkSession();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isAuthenticated]);

  // Setup keep-alive interval when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Ping Flask server every 2 minutes to maintain session
      const interval = setInterval(() => {
        keepAlive();
      }, 2 * 60 * 1000); // Every 2 minutes
      
      setKeepAliveInterval(interval);
    } else {
      // Clean up interval when not authenticated
      if (keepAliveInterval) {
        clearInterval(keepAliveInterval);
        setKeepAliveInterval(null);
      }
    }

    // Cleanup function for component unmount
    return () => {
      if (keepAliveInterval) {
        clearInterval(keepAliveInterval);
      }
    };
  }, [isAuthenticated]);

  const checkSession = async () => {
    const storedSessionId = localStorage.getItem('admin_session_id');
    if (!storedSessionId) {
      setUser(null);
      setSessionId(null);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${FLASK_SESSION_URL}/api/admin/check-session`, {
        method: 'GET',
        headers: {
          'X-Session-ID': storedSessionId,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          setUser(data.user);
          setSessionId(storedSessionId);
        } else {
          // Session invalid, clear it
          localStorage.removeItem('admin_session_id');
          setUser(null);
          setSessionId(null);
        }
      } else {
        // Session check failed, clear it
        localStorage.removeItem('admin_session_id');
        setUser(null);
      }
    } catch (error) {
      console.error('Session check failed:', error);
      // On network error, don't automatically log out
      // Let user try again manually
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      const response = await fetch(`${FLASK_SESSION_URL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.authenticated) {
          setUser(data.user);
          const newSessionId = response.headers.get('X-Session-ID');
          if (newSessionId) {
            setSessionId(newSessionId);
            localStorage.setItem('admin_session_id', newSessionId);
          }
          setLoading(false);
          return true;
        }
      }
      
      setLoading(false);
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      setLoading(false);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    if (!sessionId) return;

    try {
      await fetch(`${FLASK_SESSION_URL}/api/admin/logout`, {
        method: 'POST',
        headers: {
          'X-Session-ID': sessionId,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // Always clear local session regardless of API call success
      localStorage.removeItem('admin_session_id');
      setUser(null);
      setSessionId(null);
      if (keepAliveInterval) {
        clearInterval(keepAliveInterval);
        setKeepAliveInterval(null);
      }
    }
  };

  const keepAlive = async (): Promise<void> => {
    if (!sessionId) return;

    try {
      await fetch(`${FLASK_SESSION_URL}/api/admin/keep-alive`, {
        method: 'POST',
        headers: {
          'X-Session-ID': sessionId,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Keep-alive failed:', error);
      // Don't automatically log out on keep-alive failure
      // Let the next session check handle it
    }
  };

  return (
    <SessionContext.Provider
      value={{
        user,
        sessionId,
        isAuthenticated,
        loading,
        login,
        logout,
        keepAlive,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
