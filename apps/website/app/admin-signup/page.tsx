"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { Shield, Lock, Eye, EyeOff, AlertCircle, Zap, ShieldCheck, Activity, User, RefreshCw, LogIn, CheckCircle, XCircle, Brain, BookOpen, GraduationCap, Users, Award, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const FLASK_SESSION_URL = process.env.NEXT_PUBLIC_FLASK_SESSION_URL || "http://localhost:5001";

function AdminSignUpPageContent() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [passwordError, setPasswordError] = useState(false);

  // Check backend status with improved error handling
  useEffect(() => {
    const checkBackend = async (retryCount = 0) => {
      setBackendStatus('checking');
      try {
        const response = await fetch(`${FLASK_SESSION_URL}/api/admin/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(5000), // 5 second timeout
        });

        if (response.ok) {
          setBackendStatus('online');
        } else {
          setBackendStatus('offline');
        }
      } catch (error) {
        console.error('Backend health check failed:', error);
        
        // Implement exponential backoff retry
        if (retryCount < 3) {
          const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
          setTimeout(() => checkBackend(retryCount + 1), delay);
        } else {
          setBackendStatus('offline');
        }
      }
    };

    // Initial check
    checkBackend();
    
    // Set up periodic checks with longer intervals
    const interval = setInterval(() => checkBackend(0), 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setPasswordError(false);

    // Basic password validation
    if (!username.trim()) {
      setError("Username is required");
      setLoading(false);
      return;
    }
    
    if (!password.trim()) {
      setError("Password is required");
      setLoading(false);
      return;
    }
    
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setPasswordError(true);
      setLoading(false);
      return;
    }

    try {
      // Simple authentication (in production, this should call your backend API)
      const response = await fetch(`${FLASK_SESSION_URL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const payload = await response.json();

      if (response.ok && payload.authenticated) {
        const sessionId = response.headers.get('X-Session-ID');
        if (sessionId) {
          localStorage.setItem('admin_session_id', sessionId);
        }
        // Wait a moment for session to be stored, then redirect
        setTimeout(() => {
          router.push('/admin');
        }, 100);
      } else {
        setError(payload.error || payload.detail || 'Invalid username or password');
        setPasswordError(true);
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        setError("Cannot connect to backend server. Please ensure that Flask session manager is running.");
      } else if (error instanceof TypeError && error.message.includes("NetworkError")) {
        setError("Network error. Please check your connection and ensure that backend server is running.");
      } else {
        setError(`Login error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="w-full max-w-4xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          
          {/* Left Side - Hero Section */}
          <div className="text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-white/90 text-sm font-medium">Dr. Stephen Asatsa Portal</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
                  Dr. Stephen
                  <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Asatsa</span>
                </h1>
                <p className="text-xl text-white/70 font-medium">Admin Control Center</p>
              </div>
            </div>
            
            <p className="text-lg text-white/80 max-w-md">
              Manage your professional website with confidence. Psychology research, academic mentorship, and content management tools.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="group hover:scale-105 transition-all duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg group-hover:shadow-emerald-500/50">
                  <GraduationCap className="w-7 h-7 text-white" />
                </div>
                <p className="text-sm text-white/80 font-medium">Academic Excellence</p>
                <p className="text-xs text-white/60">Research & Teaching</p>
              </div>
              <div className="group hover:scale-105 transition-all duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg group-hover:shadow-blue-500/50">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <p className="text-sm text-white/80 font-medium">Professional Services</p>
                <p className="text-xs text-white/60">Psychology & Mentoring</p>
              </div>
              <div className="group hover:scale-105 transition-all duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg group-hover:shadow-purple-500/50">
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
                <p className="text-sm text-white/80 font-medium">Content Hub</p>
                <p className="text-xs text-white/60">Publications & Media</p>
              </div>
              <div className="group hover:scale-105 transition-all duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg group-hover:shadow-amber-500/50">
                  <Award className="w-7 h-7 text-white" />
                </div>
                <p className="text-sm text-white/80 font-medium">Achievements</p>
                <p className="text-xs text-white/60">Awards & Recognition</p>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="space-y-6">
            {/* Backend Status Indicator */}
            <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
              {backendStatus === 'checking' && (
                <>
                  <Activity className="w-4 h-4 text-yellow-400 animate-pulse" />
                  <span className="text-sm text-white/90">Checking backend connection...</span>
                </>
              )}
              {backendStatus === 'online' && (
                <>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-white/90">Backend Connected</span>
                </>
              )}
              {backendStatus === 'offline' && (
                <>
                  <XCircle className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-white/90">Backend Offline</span>
                </>
              )}
            </div>

            {/* Login Form Container */}
            <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 space-y-6">
              {/* Login Form */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur-xl opacity-30" />
                <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 space-y-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
                        <Brain className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <h1 className="font-display text-4xl font-bold text-white leading-tight">Welcome Back</h1>
                    <p className="text-white/80 mt-2">Dr. Stephen Asatsa Admin Portal</p>
                    <p className="text-white/60 text-sm mt-1">Enter your credentials to access your dashboard</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Username Field */}
                    <div>
                      <label htmlFor="username" className="text-sm font-medium text-white/90 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Username
                      </label>
                      <Input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="flex w-full border px-4 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-white file:font-medium placeholder:text-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 disabled:cursor-not-allowed disabled:opacity-50 h-12 bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-white/40 focus:ring-white/20 rounded-xl pr-12"
                        placeholder="Enter admin username"
                        required
                      />
                    </div>

                    {/* Password Field */}
                    <div>
                      <label htmlFor="password" className="text-sm font-medium text-white/90 flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Password
                        {passwordError && <span className="text-red-400 ml-2">*</span>}
                      </label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          id="password"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setPasswordError(false);
                          }}
                          className={`flex w-full border px-4 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-white file:font-medium placeholder:text-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 disabled:cursor-not-allowed disabled:opacity-50 h-12 bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-white/40 focus:ring-white/20 rounded-xl pr-12 ${passwordError ? 'border-red-400' : ''}`}
                          placeholder="Enter your password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/90 transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                      <div className="rounded-xl border border-red-400/30 bg-red-500/10 backdrop-blur-sm p-4">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="w-5 h-5 text-red-400" />
                          <span className="text-sm text-red-100">{error}</span>
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-14 bg-gradient-to-r from-blue-500 via-purple-600 to-blue-600 hover:from-blue-600 hover:via-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-lg group"
                    >
                      <span className="flex items-center gap-3">
                        {loading ? (
                          <>
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            Authenticating...
                          </>
                        ) : (
                          <>
                            <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                            Access Admin Dashboard
                          </>
                        )}
                      </span>
                    </Button>
                  </form>

                  {/* Back to Site */}
                  <div className="text-center pt-4 border-t border-white/10">
                    <Link 
                      href="/" 
                      className="text-sm text-white/70 hover:text-white/90 transition-colors inline-flex items-center gap-2"
                    >
                      ← Back to main site
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminSignUpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminSignUpPageContent />
    </Suspense>
  );
}