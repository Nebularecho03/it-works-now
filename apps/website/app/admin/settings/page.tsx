"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Palette,
  Menu,
  Grid,
  ShieldCheck,
  Database,
  RefreshCw,
  Download,
  Upload,
  Save,
  Bell,
  User,
  Plus,
  Key,
  Activity,
  Globe,
  FileText,
  BarChart3,
  Zap,
  Target,
  Check,
  AlertCircle,
  Info,
  X,
  MoreVertical,
  Moon,
  Sun,
  Monitor,
  Smartphone,
  Tablet,
  Laptop
} from "lucide-react";

interface SettingsData {
  siteName: string;
  siteUrl: string;
  adminEmail: string;
  timezone: string;
  dateFormat: string;
  language: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    mode: 'light' | 'dark' | 'auto';
    fontFamily: string;
    fontSize: string;
  };
  notifications: {
    emailNotifications: boolean;
    browserNotifications: boolean;
    systemAlerts: boolean;
    weeklyReports: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    ipWhitelist: string[];
    loginAttempts: number;
  };
  backup: {
    autoBackup: boolean;
    backupFrequency: string;
    retentionPeriod: string;
    backupLocation: string;
  };
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'security' | 'backup' | 'integrations'>('general');
  const [settings, setSettings] = useState<SettingsData>({
    siteName: 'Stephen Asatsa Website',
    siteUrl: 'https://stephenasatsa.com',
    adminEmail: 'admin@stephenasatsa.com',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    language: 'en',
    theme: {
      primaryColor: '#10b981',
      secondaryColor: '#6366f1',
      accentColor: '#22c55e',
      mode: 'light',
      fontFamily: 'Inter',
      fontSize: '16'
    },
    notifications: {
      emailNotifications: true,
      browserNotifications: true,
      systemAlerts: true,
      weeklyReports: false
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      ipWhitelist: ['127.0.0.1', '::1'],
      loginAttempts: 5
    },
    backup: {
      autoBackup: true,
      backupFrequency: 'daily',
      retentionPeriod: '30days',
      backupLocation: '/backups'
    }
  });

  const handleSave = () => {
    // Save settings to backend
    console.log('Saving settings...');
  };

  const handleBackup = () => {
    console.log('Initiating backup...');
  };

  const handleRestore = () => {
    console.log('Restoring from backup...');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <Settings className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-slate-900">Settings</h1>
                <p className="text-sm text-slate-600">Configure system preferences and options</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'general' 
              ? 'border-b-2 border-emerald-500 text-emerald-600' 
              : 'border-b-2 border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Globe className="w-4 h-4 mr-2" />
          General
        </button>
        
        <button
          onClick={() => setActiveTab('appearance')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'appearance' 
              ? 'border-b-2 border-emerald-500 text-emerald-600' 
              : 'border-b-2 border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Palette className="w-4 h-4 mr-2" />
          Appearance
        </button>
        
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'security' 
              ? 'border-b-2 border-emerald-500 text-emerald-600' 
              : 'border-b-2 border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4 mr-2" />
          Security
        </button>
        
        <button
          onClick={() => setActiveTab('backup')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'backup' 
              ? 'border-b-2 border-emerald-500 text-emerald-600' 
              : 'border-b-2 border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Database className="w-4 h-4 mr-2" />
          Backup
        </button>
        
        <button
          onClick={() => setActiveTab('integrations')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'integrations' 
              ? 'border-b-2 border-emerald-500 text-emerald-600' 
              : 'border-b-2 border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Zap className="w-4 h-4 mr-2" />
          Integrations
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4">General Settings</h3>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Site Name</label>
                  <Input
                    value={settings.siteName}
                    onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Site URL</label>
                  <Input
                    value={settings.siteUrl}
                    onChange={(e) => setSettings(prev => ({ ...prev, siteUrl: e.target.value }))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Admin Email</label>
                  <Input
                    type="email"
                    value={settings.adminEmail}
                    onChange={(e) => setSettings(prev => ({ ...prev, adminEmail: e.target.value }))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Timezone</label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => setSettings(prev => ({ ...prev, timezone: e.target.value }))}
                    className="w-full"
                  >
                    <option value="UTC">UTC</option>
                    <option value="EST">Eastern Time (EST)</option>
                    <option value="PST">Pacific Time (PST)</option>
                    <option value="CST">Central Time (CST)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Date Format</label>
                  <select
                    value={settings.dateFormat}
                    onChange={(e) => setSettings(prev => ({ ...prev, dateFormat: e.target.value }))}
                    className="w-full"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Language</label>
                  <select
                    value={settings.language}
                    onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full"
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Appearance Settings */}
        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Appearance Settings</h3>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Theme Mode</label>
                  <div className="flex items-center gap-4">
                    <Button
                      variant={settings.theme.mode === 'light' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSettings(prev => ({ ...prev, theme: { ...prev.theme, mode: 'light' }}))}
                    >
                      <Sun className="w-4 h-3 mr-1" />
                      Light
                    </Button>
                    
                    <Button
                      variant={settings.theme.mode === 'dark' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSettings(prev => ({ ...prev, theme: { ...prev.theme, mode: 'dark' }}))}
                    >
                      <Moon className="w-4 h-3 mr-1" />
                      Dark
                    </Button>
                    
                    <Button
                      variant={settings.theme.mode === 'auto' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSettings(prev => ({ ...prev, theme: { ...prev.theme, mode: 'auto' }}))}
                    >
                      <Monitor className="w-4 h-3 mr-1" />
                      Auto
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Primary Color</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={settings.theme.primaryColor}
                      onChange={(e) => setSettings(prev => ({ ...prev, theme: { ...prev.theme, primaryColor: e.target.value }}))}
                      className="flex-1"
                    />
                    <div 
                      className="w-8 h-8 rounded border-2 border-slate-200"
                      style={{ backgroundColor: settings.theme.primaryColor }}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Secondary Color</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={settings.theme.secondaryColor}
                      onChange={(e) => setSettings(prev => ({ ...prev, theme: { ...prev.theme, secondaryColor: e.target.value }}))}
                      className="flex-1"
                    />
                    <div 
                      className="w-8 h-8 rounded border-2 border-slate-200"
                      style={{ backgroundColor: settings.theme.secondaryColor }}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Accent Color</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={settings.theme.accentColor}
                      onChange={(e) => setSettings(prev => ({ ...prev, theme: { ...prev.theme, accentColor: e.target.value }}))}
                      className="flex-1"
                    />
                    <div 
                      className="w-8 h-8 rounded border-2 border-slate-200"
                      style={{ backgroundColor: settings.theme.accentColor }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Security Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="flex items-center text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={settings.security.twoFactorAuth}
                      onChange={(e) => setSettings(prev => ({ 
                        ...prev, 
                        security: { ...prev.security, twoFactorAuth: e.target.checked } 
                      }))}
                      className="mr-2"
                    />
                    Two-Factor Authentication
                  </label>
                  <p className="text-xs text-slate-500 ml-6">Enable 2FA for enhanced security</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Session Timeout (minutes)</label>
                  <Input
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => setSettings(prev => ({ 
                      ...prev, 
                      security: { ...prev.security, sessionTimeout: parseInt(e.target.value) } 
                      }))}
                    className="w-full"
                  />
                  <p className="text-xs text-slate-500">Automatically log out users after inactivity</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Login Attempts</label>
                  <Input
                    type="number"
                    value={settings.security.loginAttempts}
                    onChange={(e) => setSettings(prev => ({ 
                      ...prev, 
                      security: { ...prev.security, loginAttempts: parseInt(e.target.value) } 
                      }))}
                    className="w-full"
                  />
                  <p className="text-xs text-slate-500">Maximum failed login attempts before lockout</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">IP Whitelist</label>
                  <div className="space-y-2">
                    {settings.security.ipWhitelist.map((ip, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={ip}
                          onChange={(e) => {
                            const newWhitelist = [...settings.security.ipWhitelist];
                            newWhitelist[index] = e.target.value;
                            setSettings(prev => ({ 
                              ...prev, 
                              security: { ...prev.security, ipWhitelist: newWhitelist } 
                            }));
                          }}
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newWhitelist = settings.security.ipWhitelist.filter((_, i) => i !== index);
                            setSettings(prev => ({ 
                              ...prev, 
                              security: { ...prev.security, ipWhitelist: newWhitelist } 
                            }));
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSettings(prev => ({ 
                        ...prev, 
                        security: { ...prev.security, ipWhitelist: [...prev.security.ipWhitelist, ''] } 
                      }))}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add IP
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Backup Settings */}
        {activeTab === 'backup' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Backup Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="flex items-center text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={settings.backup.autoBackup}
                      onChange={(e) => setSettings(prev => ({ 
                        ...prev, 
                        backup: { ...prev.backup, autoBackup: e.target.checked } 
                      }))}
                      className="mr-2"
                    />
                    Automatic Backup
                  </label>
                  <p className="text-xs text-slate-500 ml-6">Enable daily automatic backups</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Backup Frequency</label>
                  <select
                    value={settings.backup.backupFrequency}
                    onChange={(e) => setSettings(prev => ({ 
                      ...prev, 
                      backup: { ...prev.backup, backupFrequency: e.target.value } 
                      }))}
                    className="w-full"
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Retention Period</label>
                  <select
                    value={settings.backup.retentionPeriod}
                    onChange={(e) => setSettings(prev => ({ 
                      ...prev, 
                      backup: { ...prev.backup, retentionPeriod: e.target.value } 
                      }))}
                    className="w-full"
                  >
                    <option value="7days">7 Days</option>
                    <option value="30days">30 Days</option>
                    <option value="90days">90 Days</option>
                    <option value="1year">1 Year</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Backup Location</label>
                  <Input
                    value={settings.backup.backupLocation}
                    onChange={(e) => setSettings(prev => ({ 
                      ...prev, 
                      backup: { ...prev.backup, backupLocation: e.target.value } 
                      }))}
                    className="w-full"
                  />
                  <p className="text-xs text-slate-500">Directory path for backup files</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {/* Test settings */}}
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Test Settings
          </Button>
          
          <Button
            variant="default"
            size="sm"
            onClick={handleSave}
          >
            <Save className="w-3 h-3 mr-1" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
