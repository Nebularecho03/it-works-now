"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SessionGuard } from "@/components/admin/session-guard";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Settings,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from "lucide-react";

interface UserData {
  email: string;
  name: string;
  role: string;
  created_at: string;
  last_login: string;
  status: string;
}

interface PasswordChangeData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

function AccountSettings() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    current_password: "",
    new_password: "",
    confirm_password: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Load user data
    const token = localStorage.getItem("auth_token");
    if (token) {
      fetchUserData();
    }
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/auth/me?token=" + token);
      const data = await response.json();
      
      if (data.user) {
        setUserData(data.user);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setSuccess(false);

    try {
      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify(passwordData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setMessage("Password changed successfully!");
        setPasswordData({
          current_password: "",
          new_password: "",
          confirm_password: ""
        });
        setShowPasswordForm(false);
      } else {
        setMessage(data.error || "Failed to change password");
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
      console.error("Password change error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!userData) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
          <span className="ml-2 text-slate-600">Loading account settings...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <User className="w-8 h-8 text-emerald-600" />
              Account Settings
            </h1>
            <p className="text-slate-600 mt-2">
              Manage your account settings and security preferences
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchUserData()}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* User Info Card */}
        {userData && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-600" />
                Account Information
              </h3>
              <Badge variant={userData.status === "active" ? "default" : "secondary"} className="text-xs">
                {userData.status}
              </Badge>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address
                  </label>
                  <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                    <p className="text-slate-900">{userData.email}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Display Name
                  </label>
                  <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                    <p className="text-slate-900">{userData.name}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Account Role
                  </label>
                  <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                    <Badge variant={userData.role === "admin" ? "default" : "secondary"}>
                      {userData.role}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Account Status
                  </label>
                  <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                    <Badge variant={userData.status === "active" ? "default" : "secondary"}>
                      {userData.status}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Member Since
                  </label>
                  <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                    <p className="text-slate-900">
                      {new Date(userData.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Last Login
                  </label>
                  <div className="p-3 bg-slate-50 rounded-md border border-slate-200">
                    <p className="text-slate-900">
                      {userData.last_login ? new Date(userData.last_login).toLocaleString() : "Never"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Password Change Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-600" />
              Change Password
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="flex items-center gap-2"
            >
              {showPasswordForm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showPasswordForm ? "Hide Form" : "Show Form"}
            </Button>
          </div>
          
          {showPasswordForm && (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.current_password}
                    onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  type="submit"
                  disabled={loading || !passwordData.current_password || !passwordData.new_password || passwordData.new_password !== passwordData.confirm_password}
                  className="flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Changing...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Change Password
                    </>
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPasswordForm(false)}
                  className="flex items-center gap-2"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
          
          {/* Messages */}
          {message && (
            <div className={`p-4 rounded-md border ${
              success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
            }`}>
              <div className="flex items-center gap-3">
                {success ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                )}
                <span className="text-sm font-medium">
                  {message}
                </span>
              </div>
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}

export default function AccountSettingsPage() {
  return (
    <SessionGuard>
      <AccountSettings />
    </SessionGuard>
  );
}
