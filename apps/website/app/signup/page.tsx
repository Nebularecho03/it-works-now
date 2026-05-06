"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { UserPlus, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, ChevronUp, ChevronDown, Building, GraduationCap, MapPin, Linkedin, Globe } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/components/api/client";

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/account";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    institution: "",
    researchInterests: "",
    bio: "",
    location: "",
    academicTitle: "",
    department: "",
    degree: "",
    linkedinProfile: "",
    personalWebsite: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Name is required");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!formData.password) {
      setError("Password is required");
      return false;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }
    if (!/[A-Z]/.test(formData.password)) {
      setError("Password must contain at least one uppercase letter");
      return false;
    }
    if (!/[a-z]/.test(formData.password)) {
      setError("Password must contain at least one lowercase letter");
      return false;
    }
    if (!/\d/.test(formData.password)) {
      setError("Password must contain at least one number");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/api/auth/signup', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        institution: formData.institution.trim() || undefined,
        researchInterests: formData.researchInterests.trim() || undefined,
        bio: formData.bio.trim() || undefined,
        location: formData.location.trim() || undefined,
        academicTitle: formData.academicTitle.trim() || undefined,
        department: formData.department.trim() || undefined,
        degree: formData.degree.trim() || undefined,
        linkedinProfile: formData.linkedinProfile.trim() || undefined,
        personalWebsite: formData.personalWebsite.trim() || undefined
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and redirect
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("userSession", JSON.stringify({
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
          timestamp: Date.now(),
          token: data.token
        }));
        
        setSuccess(true);
        setTimeout(() => {
          router.push(callbackUrl);
        }, 1500);
      } else {
        setError(data.detail || "Failed to create account");
      }
    } catch (error) {
      console.error("Signup error:", error);
      setError("Unable to connect to server. Please try again.");
    }
    
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="p-8 shadow-xl border-border/50 bg-white/90 backdrop-blur-sm text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">Account Created!</h2>
            <p className="text-muted-foreground mb-6">
              Your account has been created successfully. Redirecting to your dashboard...
            </p>
            <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title Section */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Create Account</h1>
          <p className="text-muted-foreground">Join the Stephen Asatsa website community</p>
        </div>

        {/* Sign Up Form */}
        <Card className="p-8 shadow-xl border-border/50 bg-white/90 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-foreground flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Full Name
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="h-11 border-border/70 focus:border-primary/50"
                required
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="h-11 border-border/70 focus:border-primary/50"
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  className="h-11 pr-10 border-border/70 focus:border-primary/50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Must be 8+ characters with uppercase, lowercase, and numbers
              </p>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className="h-11 pr-10 border-border/70 focus:border-primary/50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Optional Information Toggle */}
            <div className="pt-4 border-t border-border/50">
              <button
                type="button"
                onClick={() => setShowOptionalFields(!showOptionalFields)}
                className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                <span>Optional Information</span>
                {showOptionalFields ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showOptionalFields && (
                <div className="mt-4 space-y-4 pt-4 border-t border-border/50">
                  {/* Institution */}
                  <div className="space-y-2">
                    <label htmlFor="institution" className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      Institution
                    </label>
                    <Input
                      id="institution"
                      name="institution"
                      type="text"
                      value={formData.institution}
                      onChange={handleChange}
                      placeholder="Your institution or organization"
                      className="h-11 border-border/70 focus:border-primary/50"
                    />
                  </div>

                  {/* Research Interests */}
                  <div className="space-y-2">
                    <label htmlFor="researchInterests" className="text-sm font-medium text-foreground flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" />
                      Research Interests
                    </label>
                    <Input
                      id="researchInterests"
                      name="researchInterests"
                      type="text"
                      value={formData.researchInterests}
                      onChange={handleChange}
                      placeholder="e.g., Machine Learning, Bioinformatics"
                      className="h-11 border-border/70 focus:border-primary/50"
                    />
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <label htmlFor="bio" className="text-sm font-medium text-foreground flex items-center gap-2">
                      <UserPlus className="w-4 h-4" />
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Tell us about yourself (max 500 characters)"
                      className="w-full min-h-[80px] px-3 py-2 text-sm border border-border/70 rounded-md focus:border-primary/50 focus:outline-none resize-none"
                      maxLength={500}
                    />
                    <p className="text-xs text-muted-foreground text-right">{formData.bio.length}/500</p>
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <label htmlFor="location" className="text-sm font-medium text-foreground flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Location
                    </label>
                    <Input
                      id="location"
                      name="location"
                      type="text"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="City, Country"
                      className="h-11 border-border/70 focus:border-primary/50"
                    />
                  </div>

                  {/* Academic Title */}
                  <div className="space-y-2">
                    <label htmlFor="academicTitle" className="text-sm font-medium text-foreground flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" />
                      Academic Title
                    </label>
                    <Input
                      id="academicTitle"
                      name="academicTitle"
                      type="text"
                      value={formData.academicTitle}
                      onChange={handleChange}
                      placeholder="Dr., Prof., Mr., Mrs., etc."
                      className="h-11 border-border/70 focus:border-primary/50"
                    />
                  </div>

                  {/* Department */}
                  <div className="space-y-2">
                    <label htmlFor="department" className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      Department
                    </label>
                    <Input
                      id="department"
                      name="department"
                      type="text"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="Your department"
                      className="h-11 border-border/70 focus:border-primary/50"
                    />
                  </div>

                  {/* Degree */}
                  <div className="space-y-2">
                    <label htmlFor="degree" className="text-sm font-medium text-foreground flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" />
                      Degree
                    </label>
                    <Input
                      id="degree"
                      name="degree"
                      type="text"
                      value={formData.degree}
                      onChange={handleChange}
                      placeholder="PhD, Masters, Bachelors, etc."
                      className="h-11 border-border/70 focus:border-primary/50"
                    />
                  </div>

                  {/* LinkedIn Profile */}
                  <div className="space-y-2">
                    <label htmlFor="linkedinProfile" className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Linkedin className="w-4 h-4" />
                      LinkedIn Profile
                    </label>
                    <Input
                      id="linkedinProfile"
                      name="linkedinProfile"
                      type="url"
                      value={formData.linkedinProfile}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/in/yourprofile"
                      className="h-11 border-border/70 focus:border-primary/50"
                    />
                  </div>

                  {/* Personal Website */}
                  <div className="space-y-2">
                    <label htmlFor="personalWebsite" className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Personal Website
                    </label>
                    <Input
                      id="personalWebsite"
                      name="personalWebsite"
                      type="url"
                      value={formData.personalWebsite}
                      onChange={handleChange}
                      placeholder="https://yourwebsite.com"
                      className="h-11 border-border/70 focus:border-primary/50"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex items-center gap-2">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Create Account
                  </>
                )}
              </span>
            </Button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link 
                href="/signin" 
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </Card>

        {/* Back to Site */}
        <div className="mt-6 text-center">
          <Link 
            href="/" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
          >
            ← Back to main site
          </Link>
        </div>
      </div>
    </div>
  );
}
