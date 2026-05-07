"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SessionGuard } from "@/components/admin/session-guard";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Search,
  RefreshCw,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Mail
  Shield
  Trash2
  Download
  Calendar
  Clock
  Activity
} from "lucide-react";

interface User {
  email: string;
  name: string;
  role: string;
  status: string;
  created_at: string;
  last_login: string;
  failed_login_attempts: number;
  account_locked_until: string;
}

interface PasswordResetData {
  email: string;
  reset_token: string;
  reset_expires: string;
  new_password: string;
  confirm_password: string;
}

function AdminPasswordManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetData, setResetData] = useState<PasswordResetData | null>(null);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/users");
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users || []);
      } else {
        setMessage("Failed to load users");
      }
    } catch (error) {
      setMessage("Error loading users");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (email: string, forceReset: boolean = false) => {
    try {
      setLoading(true);
      setMessage("");
      
      const response = await fetch("/api/admin/reset-user-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess(true);
        setMessage(forceReset ? "User must change password on next login" : "Password reset email sent");
      } else {
        setMessage(data.error || "Failed to reset password");
      }
    } catch (error) {
      setMessage("Error resetting password");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUnlockAccount = async (email: string) => {
    try {
      const response = await fetch("/api/admin/unlock-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess(true);
        setMessage("Account unlocked successfully");
        loadUsers(); // Refresh users list
      } else {
        setMessage(data.error || "Failed to unlock account");
      }
    } catch (error) {
      setMessage("Error unlocking account");
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
          <span className="ml-2 text-slate-600">Loading password management...</span>
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
              <Users className="w-8 h-8 text-emerald-600" />
              Password Management
            </h1>
            <p className="text-slate-600 mt-2">
              Manage user accounts and reset passwords
            </p>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadUsers()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Users
          </Button>
        </div>

        {/* Password Reset */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-3">
              <Lock className="w-5 h-5 text-emerald-600" />
              Password Reset
            </h3>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  User Email
                </label>
                <input
                  type="email"
                  value={resetData?.email || ""}
                  onChange={(e) => setResetData({ ...resetData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="user@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={resetData?.new_password || ""}
                  onChange={(e) => setResetData({ ...resetData, new_password: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter new password"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={resetData?.confirm_password || ""}
                  onChange={(e) => setResetData({ ...resetData, confirm_password: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Confirm new password"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={() => resetData?.email && handlePasswordReset(resetData.email)}
                disabled={!resetData?.email || !resetData?.new_password || resetData?.new_password !== resetData?.confirm_password}
                className="flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Send Reset Email
              </Button>
              
              <Button
                variant="outline"
                onClick={() => resetData?.email && handlePasswordReset(resetData.email, true)}
                disabled={!resetData?.email}
                className="flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Force Reset on Next Login
              </Button>
            </div>
          </div>
          
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

        {/* Users List */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-3">
              <Users className="w-5 h-5 text-emerald-600" />
              User Accounts
            </h3>
            
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search users by email or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredUsers.map((user) => (
              <div key={user.email} className="flex items-center justify-between py-3 border-b border-slate-100">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{user.name}</p>
                      <p className="text-sm text-slate-600">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="text-right space-y-2">
                    <Badge variant={user.status === "active" ? "default" : "secondary"} className="text-xs">
                      {user.status}
                    </Badge>
                    
                    {user.account_locked_until && (
                      <Badge variant="destructive" className="text-xs ml-2">
                        <Lock className="w-3 h-3" />
                        Locked
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => user.account_locked_until && handleUnlockAccount(user.email)}
                    disabled={!user.account_locked_until}
                    className="flex items-center gap-2"
                  >
                    <Unlock className="w-4 h-4" />
                    Unlock
                  </Button>
                </div>
              </div>
            ))}
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <Users className="w-8 h-8 text-slate-400" />
                <p className="text-slate-600 mt-2">No users found</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}

export default function AdminPasswordManagementPage() {
  return (
    <SessionGuard>
      <AdminPasswordManagement />
    </SessionGuard>
  );
}
