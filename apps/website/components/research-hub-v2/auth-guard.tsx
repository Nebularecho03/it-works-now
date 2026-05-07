"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Lock, Mail, ArrowRight, Eye, EyeOff } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: "USER" | "ADMIN" | "RESEARCHER";
  fallback?: React.ReactNode;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: "GUEST" | "USER" | "PREMIUM" | "ADMIN" | "ASSISTANT";
  subscription: "FREE" | "PREMIUM";
}

export default function AuthGuard({ children, requiredRole = "USER", fallback }: AuthGuardProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
    showPassword: false
  });
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/research-hub-v2/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setLoading(false);
      } else {
        setUser(null);
        setLoading(false);
        setShowLogin(true);
      }
    } catch (error) {
      setUser(null);
      setLoading(false);
      setShowLogin(true);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/research-hub-v2/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginForm.email,
          password: loginForm.password
        })
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setShowLogin(false);
        setLoginForm({ email: "", password: "", showPassword: false });
      } else {
        alert('Login failed. Please check your credentials.');
      }
    } catch (error) {
      alert('Login error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const hasRequiredRole = (userRole: string, required: string): boolean => {
    const roleHierarchy = {
      'GUEST': 0,
      'USER': 1,
      'PREMIUM': 2,
      'RESEARCHER': 2,
      'ADMIN': 3,
      'ASSISTANT': 3
    };
    
    return roleHierarchy[userRole as keyof typeof roleHierarchy] >= roleHierarchy[required as keyof typeof roleHierarchy];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  // User is not authenticated
  if (!user) {
    if (showLogin) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h2>
                <p className="text-gray-600">Please sign in to access this feature</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={loginForm.showPassword ? "text" : "password"}
                      value={loginForm.password}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setLoginForm(prev => ({ ...prev, showPassword: !prev.showPassword }))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {loginForm.showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded border-gray-300" />
                    <span className="text-sm text-gray-600">Remember me</span>
                  </label>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </div>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <button 
                    onClick={() => router.push('/research-hub-v2/auth/register')}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Sign up
                  </button>
                </p>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4 text-center p-8">
          <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to access this content</p>
          <Button onClick={() => setShowLogin(true)}>
            <User className="w-4 h-4 mr-2" />
            Sign In to Continue
          </Button>
        </Card>
      </div>
    );
  }

  // User doesn't have required role
  if (!hasRequiredRole(user.role, requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4 text-center p-8">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-600 mb-4">
            This feature requires {requiredRole} access or higher.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Current Role:</strong> {user.role}<br />
              <strong>Required:</strong> {requiredRole}<br />
              <strong>Subscription:</strong> {user.subscription}
            </p>
          </div>
          <div className="space-y-3">
            {user.subscription === "FREE" && requiredRole !== "USER" && (
              <Button 
                onClick={() => router.push('/research-hub-v2/user/subscriptions')}
                className="w-full"
              >
                Upgrade to Premium
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              className="w-full"
            >
              Go Back
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // User has access - render children
  return <>{children}</>;
}
