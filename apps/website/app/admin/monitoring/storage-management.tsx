"use client";

import { useState, useEffect } from "react";
import { SessionGuard } from "@/components/admin/session-guard";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Database,
  HardDrive,
  Clock,
  Settings,
  Trash2,
  RefreshCw,
  Download,
  TrendingUp,
  Calendar,
  AlertTriangle
} from "lucide-react";

interface StorageStats {
  database_size_bytes: number;
  database_size_mb: number;
  tables: Array<{
    table_name: string;
    record_count: number;
    earliest: string;
    latest: string;
  }>;
  growth_trend: Array<{
    date: string;
    daily_count: number;
  }>;
  total_records: number;
}

interface RetentionSettings {
  raw_retention_days: number;
  hourly_retention_days: number;
  daily_retention_days: number;
  cleanup_time: string;
  enabled: boolean;
}

interface CleanupHistory {
  action_type: string;
  records_deleted: number;
  execution_time_ms: number;
  executed_at: string;
  status: string;
  notes: string;
}

function StorageManagement() {
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);
  const [retentionSettings, setRetentionSettings] = useState<RetentionSettings | null>(null);
  const [cleanupHistory, setCleanupHistory] = useState<CleanupHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  useEffect(() => {
    loadStorageData();
  }, []);

  const loadStorageData = async () => {
    try {
      // Load storage overview
      const storageResponse = await fetch('/api/admin/storage/overview');
      const storageData = await storageResponse.json();
      if (storageData.success) {
        setStorageStats(storageData.data);
      }

      // Load retention settings
      const settingsResponse = await fetch('/api/admin/retention/settings');
      const settingsData = await settingsResponse.json();
      if (settingsData.success) {
        setRetentionSettings(settingsData.data);
      }

      // Load cleanup history
      const historyResponse = await fetch('/api/admin/retention/logs');
      const historyData = await historyResponse.json();
      if (historyData.success) {
        setCleanupHistory(historyData.data);
      }
    } catch (error) {
      console.error('Error loading storage data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsUpdate = async (newSettings: Partial<RetentionSettings>) => {
    setIsUpdatingSettings(true);
    try {
      const response = await fetch('/api/admin/retention/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSettings),
      });

      const data = await response.json();
      if (data.success) {
        setRetentionSettings({ ...retentionSettings, ...newSettings });
      }
    } catch (error) {
      console.error('Error updating settings:', error);
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const handleCleanup = async (dryRun: boolean = false) => {
    try {
      const response = await fetch('/api/admin/retention/cleanup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dry_run }),
      });

      const data = await response.json();
      if (data.success) {
        // Reload storage data after cleanup
        await loadStorageData();
      }
    } catch (error) {
      console.error('Error running cleanup:', error);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const size = sizes[Math.min(i, sizes.length - 1)];
    const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
    return `${formattedSize} ${size}`;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
          <span className="ml-2 text-slate-600">Loading storage management...</span>
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
              <Database className="w-8 h-8 text-emerald-600" />
              Storage Management
            </h1>
            <p className="text-slate-600 mt-2">
              Manage data retention, cleanup policies, and monitor storage usage
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadStorageData()}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Storage Overview */}
        {storageStats && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-600" />
                  Database Size
                </h3>
              </div>
              
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-slate-900">
                    {storageStats.database_size_mb.toFixed(2)} MB
                  </p>
                  <p className="text-sm text-slate-600">
                    {formatBytes(storageStats.database_size_bytes)}
                  </p>
                </div>
                
                <div className="pt-4 border-t border-slate-200">
                  <p className="text-sm text-slate-600 mb-2">Total Records: {storageStats.total_records.toLocaleString()}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <HardDrive className="w-5 h-5 text-emerald-600" />
                  Table Statistics
                </h3>
              </div>
              
              <div className="space-y-3">
                {storageStats.tables.map((table) => (
                  <div key={table.table_name} className="flex items-center justify-between py-2 border-b border-slate-100">
                    <div>
                      <p className="font-medium text-slate-900">{table.table_name}</p>
                      <p className="text-sm text-slate-600">
                        {table.record_count.toLocaleString()} records
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs">
                        {table.latest ? 'Active' : 'No Data'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  Growth Trend
                </h3>
              </div>
              
              <div className="space-y-2">
                {storageStats.growth_trend.slice(0, 7).map((day) => (
                  <div key={day.date} className="flex items-center justify-between py-1">
                    <span className="text-sm text-slate-600">{day.date}</span>
                    <span className="text-sm font-medium text-slate-900">
                      {day.daily_count.toLocaleString()} records
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Retention Settings */}
        {retentionSettings && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-emerald-600" />
                Retention Settings
              </h3>
              <Badge variant={retentionSettings.enabled ? "default" : "secondary"} className="text-xs">
                {retentionSettings.enabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Raw Data Retention (days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={retentionSettings.raw_retention_days}
                  onChange={(e) => handleSettingsUpdate({ raw_retention_days: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Hourly Data Retention (days)
                </label>
                <input
                  type="number"
                  min="7"
                  max="90"
                  value={retentionSettings.hourly_retention_days}
                  onChange={(e) => handleSettingsUpdate({ hourly_retention_days: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Daily Data Retention (days)
                </label>
                <input
                  type="number"
                  min="30"
                  max="365"
                  value={retentionSettings.daily_retention_days}
                  onChange={(e) => handleSettingsUpdate({ daily_retention_days: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Cleanup Time (HH:MM)
                </label>
                <input
                  type="text"
                  pattern="[0-9]{2}:[0-5]{2}"
                  value={retentionSettings.cleanup_time}
                  onChange={(e) => handleSettingsUpdate({ cleanup_time: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="cleanup-enabled"
                  checked={retentionSettings.enabled}
                  onChange={(e) => handleSettingsUpdate({ enabled: e.target.checked })}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded"
                />
                <label htmlFor="cleanup-enabled" className="text-sm font-medium text-slate-700">
                  Enable automatic cleanup
                </label>
              </div>
            </div>
            
            <div className="mt-6 flex items-center gap-3">
              <Button
                onClick={() => handleSettingsUpdate(retentionSettings)}
                disabled={isUpdatingSettings}
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                {isUpdatingSettings ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </Card>
        )}

        {/* Cleanup Controls */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-emerald-600" />
              Cleanup Operations
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={() => handleCleanup(true)}
              className="flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              Dry Run Cleanup
            </Button>
            
            <Button
              onClick={() => handleCleanup(false)}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Run Cleanup Now
            </Button>
          </div>
        </Card>

        {/* Cleanup History */}
        {cleanupHistory.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                Cleanup History
              </h3>
              <Badge variant="outline" className="text-xs">
                Last {cleanupHistory.length} operations
              </Badge>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {cleanupHistory.map((entry, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-slate-100">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={entry.status === 'success' ? 'default' : 
                                entry.status === 'failed' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {entry.action_type}
                      </Badge>
                      <span className="text-sm text-slate-600">
                        {entry.records_deleted} records deleted
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(entry.executed_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={entry.status === 'success' ? 'default' : 
                                entry.status === 'failed' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {entry.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}

export default function StorageManagementPage() {
  return (
    <SessionGuard>
      <StorageManagement />
    </SessionGuard>
  );
}
