"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Settings,
  TestTube,
  CheckCircle,
  AlertCircle,
  Save,
  RefreshCw,
  Globe,
  Shield,
  Key,
  Eye,
  EyeOff
} from "lucide-react";
import { api } from "@/components/api/client";

interface EmailSettings {
  provider: 'gmail' | 'outlook' | 'smtp' | 'none';
  smtp_host?: string;
  smtp_port?: number;
  smtp_username?: string;
  smtp_password?: string;
  smtp_use_tls?: boolean;
  gmail_client_id?: string;
  gmail_client_secret?: string;
  gmail_refresh_token?: string;
  outlook_client_id?: string;
  outlook_client_secret?: string;
  outlook_refresh_token?: string;
  from_email?: string;
  from_name?: string;
  reply_to_email?: string;
  enabled: boolean;
}

export default function EmailSettingsPage() {
  const router = useRouter();

  // Check authentication on mount
  useEffect(() => {
    const session = localStorage.getItem('userSession');
    if (!session) {
      router.push('/admin-signup');
      return;
    }
    try {
      const parsed = JSON.parse(session);
      const sessionAge = Date.now() - parsed.timestamp;
      if (sessionAge > 24 * 60 * 60 * 1000) {
        localStorage.removeItem('userSession');
        localStorage.removeItem('authToken');
        router.push('/admin-signup');
        return;
      }
    } catch {
      localStorage.removeItem('userSession');
      localStorage.removeItem('authToken');
      router.push('/admin-signup');
      return;
    }
  }, [router]);

  const [settings, setSettings] = useState<EmailSettings>({
    provider: 'none',
    enabled: false
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    loadEmailSettings();
  }, []);

  const loadEmailSettings = async () => {
    try {
      const response = await api.get('/api/admin/email-settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error("Failed to load email settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await api.put('/api/admin/email-settings', settings);
      if (response.ok) {
        setTestResult({ success: true, message: "Email settings saved successfully!" });
      } else {
        const data = await response.json();
        setTestResult({ success: false, message: data.detail || "Failed to save settings" });
      }
    } catch (error) {
      console.error("Failed to save email settings:", error);
      setTestResult({ success: false, message: "Failed to save settings" });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const response = await api.post('/api/admin/email-settings/test', {
        provider: settings.provider,
        ...settings
      });
      if (response.ok) {
        const data = await response.json();
        setTestResult({ success: true, message: "Test email sent successfully!" });
      } else {
        const data = await response.json();
        setTestResult({ success: false, message: data.detail || "Test failed" });
      }
    } catch (error) {
      console.error("Failed to test email:", error);
      setTestResult({ success: false, message: "Test failed" });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading email settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Email Settings</h1>
          <p className="text-slate-600">Configure email providers and server settings</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleTest} disabled={testing}>
            <TestTube className="w-4 h-4 mr-2" />
            {testing ? "Testing..." : "Test Configuration"}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>

      {/* Test Result */}
      {testResult && (
        <Card className={`p-4 border ${
          testResult.success 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {testResult.success ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <span className={`font-medium ${
              testResult.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {testResult.message}
            </span>
          </div>
        </Card>
      )}

      {/* Email Provider Selection */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-600" />
          Email Provider
        </h2>
        
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { id: 'none', name: 'No Email Provider', description: 'Disable email notifications' },
            { id: 'gmail', name: 'Gmail', description: 'Use Gmail for sending emails' },
            { id: 'outlook', name: 'Microsoft Outlook', description: 'Use Outlook for sending emails' },
            { id: 'smtp', name: 'Custom SMTP', description: 'Use your own SMTP server' }
          ].map((provider: { id: string; name: string; description: string }) => (
            <div
              key={provider.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                settings.provider === provider.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSettings({ ...settings, provider: provider.id as any })}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  settings.provider === provider.id ? 'bg-blue-600' : 'bg-gray-400'
                }`}>
                  <Mail className={`w-4 h-4 text-white`} />
                </div>
                <div>
                  <h3 className="font-semibold">{provider.name}</h3>
                  <p className="text-sm text-gray-600">{provider.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* SMTP Configuration */}
      {settings.provider === 'smtp' && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            SMTP Server Configuration
          </h2>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Host</label>
              <Input
                value={settings.smtp_host || ''}
                onChange={(e) => setSettings({ ...settings, smtp_host: e.target.value })}
                placeholder="smtp.gmail.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
              <Input
                type="number"
                value={settings.smtp_port || ''}
                onChange={(e) => setSettings({ ...settings, smtp_port: parseInt(e.target.value) })}
                placeholder="587"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <Input
                value={settings.smtp_username || ''}
                onChange={(e) => setSettings({ ...settings, smtp_username: e.target.value })}
                placeholder="your-email@gmail.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={settings.smtp_password || ''}
                  onChange={(e) => setSettings({ ...settings, smtp_password: e.target.value })}
                  placeholder="Your SMTP password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={settings.smtp_use_tls || false}
                  onChange={(e) => setSettings({ ...settings, smtp_use_tls: e.target.checked })}
                  className="rounded"
                />
                Use TLS/SSL
              </label>
            </div>
          </div>
        </Card>
      )}

      {/* Gmail Configuration */}
      {settings.provider === 'gmail' && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <Mail className="w-4 h-4 text-white" />
            </div>
            Gmail API Configuration
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Client ID</label>
              <Input
                value={settings.gmail_client_id || ''}
                onChange={(e) => setSettings({ ...settings, gmail_client_id: e.target.value })}
                placeholder="your-gmail-client-id"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Client Secret</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={settings.gmail_client_secret || ''}
                  onChange={(e) => setSettings({ ...settings, gmail_client_secret: e.target.value })}
                  placeholder="your-gmail-client-secret"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            {settings.gmail_refresh_token && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Refresh Token</label>
                <Input
                  value={settings.gmail_refresh_token}
                  readOnly
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500">Auto-generated token</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Outlook Configuration */}
      {settings.provider === 'outlook' && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Mail className="w-4 h-4 text-white" />
            </div>
            Microsoft Outlook Configuration
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Client ID</label>
              <Input
                value={settings.outlook_client_id || ''}
                onChange={(e) => setSettings({ ...settings, outlook_client_id: e.target.value })}
                placeholder="your-outlook-client-id"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Client Secret</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={settings.outlook_client_secret || ''}
                  onChange={(e) => setSettings({ ...settings, outlook_client_secret: e.target.value })}
                  placeholder="your-outlook-client-secret"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            {settings.outlook_refresh_token && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Refresh Token</label>
                <Input
                  value={settings.outlook_refresh_token}
                  readOnly
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500">Auto-generated token</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* General Settings */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          General Email Settings
        </h2>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Email</label>
            <Input
              type="email"
              value={settings.from_email || ''}
              onChange={(e) => setSettings({ ...settings, from_email: e.target.value })}
              placeholder="noreply@stephenasatsa.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Name</label>
            <Input
              value={settings.from_name || ''}
              onChange={(e) => setSettings({ ...settings, from_name: e.target.value })}
              placeholder="Dr. Stephen Asatsa"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Reply-to Email</label>
            <Input
              type="email"
              value={settings.reply_to_email || ''}
              onChange={(e) => setSettings({ ...settings, reply_to_email: e.target.value })}
              placeholder="admin@stephenasatsa.com"
            />
            <p className="text-xs text-gray-500">Email address where replies should be sent</p>
          </div>
        </div>
        
        <div className="mt-4">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
              className="rounded"
            />
            Enable Email Notifications
          </label>
        </div>
      </Card>

      {/* Status */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          Configuration Status
        </h2>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center gap-2">
            <Badge className={settings.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
              {settings.enabled ? 'Enabled' : 'Disabled'}
            </Badge>
            <span className="text-sm text-gray-600">Email notifications</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className={
              settings.provider !== 'none' && settings.enabled
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }>
              {settings.provider !== 'none' && settings.enabled ? 'Configured' : 'Not Configured'}
            </Badge>
            <span className="text-sm text-gray-600">Email provider</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
