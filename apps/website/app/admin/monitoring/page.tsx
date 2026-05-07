"use client";

import { useState, useEffect } from "react";
import { SessionGuard } from "@/components/admin/session-guard";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MetricsChart } from "@/components/admin/monitoring/metrics-chart";
import { TimeFilter } from "@/components/admin/monitoring/time-filter";
import { MetricsCards } from "@/components/admin/monitoring/metrics-cards";
import { AlertsPanel } from "@/components/admin/monitoring/alerts-panel";
import { useMetrics } from "@/hooks/use-metrics";
import {
  Activity,
  Cpu,
  HardDrive,
  Network,
  Clock,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Download,
  Settings
} from "lucide-react";

interface MetricData {
  cpu_usage: number;
  ram_usage: number;
  disk_usage: number;
  disk_free: number;
  network_sent: number;
  network_received: number;
  uptime_seconds: number;
  recorded_at: string;
}

interface MetricsResponse {
  current: MetricData | null;
  history: MetricData[];
  summary: {
    avg_cpu: number;
    max_cpu: number;
    min_cpu: number;
    avg_ram: number;
    max_ram: number;
    min_ram: number;
    avg_disk: number;
    max_disk: number;
    min_disk: number;
    data_points: number;
  };
  peaks: {
    cpu: { cpu_usage: number; recorded_at: string } | null;
    ram: { ram_usage: number; recorded_at: string } | null;
    disk: { disk_usage: number; recorded_at: string } | null;
  };
  metadata: {
    time_range: string;
    live: boolean;
    data_points: number;
    generated_at: string;
  };
}

function MonitoringDashboard() {
  const [timeRange, setTimeRange] = useState<string>("hour");
  const [liveMode, setLiveMode] = useState<boolean>(false);
  const [refreshInterval, setRefreshInterval] = useState<number>(30000); // 30 seconds
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  
  const { 
    data: metricsData, 
    loading, 
    error, 
    refetch 
  } = useMetrics<MetricsResponse>(timeRange, liveMode);

  // Auto-refresh for live mode
  useEffect(() => {
    if (!liveMode) return;

    const interval = setInterval(() => {
      refetch();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [liveMode, refreshInterval, refetch]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleExport = () => {
    if (!metricsData?.history) return;
    
    const csv = [
      ['Timestamp', 'CPU %', 'RAM %', 'Disk %', 'Disk Free GB', 'Network Sent MB', 'Network Received MB', 'Uptime Seconds'],
      ...metricsData.history.map((item: any) => [
        item.recorded_at,
        item.cpu_usage.toFixed(2),
        item.ram_usage.toFixed(2),
        item.disk_usage.toFixed(2),
        item.disk_free.toFixed(2),
        item.network_sent.toFixed(2),
        item.network_received.toFixed(2),
        item.uptime_seconds
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `server-metrics-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading && !metricsData) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
          <span className="ml-2 text-slate-600">Loading monitoring data...</span>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <AlertTriangle className="w-8 h-8 text-red-600" />
          <span className="ml-2 text-slate-600">Error loading monitoring data: {error}</span>
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
              <Activity className="w-8 h-8 text-emerald-600" />
              Server Monitoring
            </h1>
            <p className="text-slate-600 mt-2">
              Real-time system performance monitoring and analytics
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Live Mode Toggle */}
            <Button
              variant={liveMode ? "default" : "outline"}
              size="sm"
              onClick={() => setLiveMode(!liveMode)}
              className="flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              {liveMode ? "Live" : "Static"}
            </Button>
            
            {/* Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            {/* Export Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={!metricsData?.history?.length}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Time Filter */}
        <TimeFilter
          value={timeRange}
          onChange={setTimeRange}
          options={[
            { value: "60m", label: "Last 60 Minutes" },
            { value: "hour", label: "Last Hour" },
            { value: "day", label: "Last 24 Hours" },
            { value: "week", label: "Last Week" },
            { value: "month", label: "Last Month" }
          ]}
        />

        {/* Current Metrics Cards */}
        {metricsData?.current && (
          <MetricsCards 
            current={metricsData.current} 
            summary={metricsData.summary}
            peaks={metricsData.peaks}
          />
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CPU & RAM Chart */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-emerald-600" />
                CPU & RAM Usage
              </h3>
              <Badge variant="outline" className="text-xs">
                {metricsData?.metadata?.data_points || 0} data points
              </Badge>
            </div>
            <MetricsChart
              data={metricsData?.history || []}
              metrics={['cpu_usage', 'ram_usage']}
              colors={['#10b981', '#3b82f6']}
              labels={['CPU %', 'RAM %']}
              timeRange={timeRange}
            />
          </Card>

          {/* Disk Usage Chart */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-emerald-600" />
                Disk Usage
              </h3>
              <Badge variant="outline" className="text-xs">
                {metricsData?.current?.disk_free?.toFixed(1) || 0} GB free
              </Badge>
            </div>
            <MetricsChart
              data={metricsData?.history || []}
              metrics={['disk_usage']}
              colors={['#f59e0b']}
              labels={['Disk %']}
              timeRange={timeRange}
            />
          </Card>

          {/* Network Chart */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Network className="w-5 h-5 text-emerald-600" />
                Network Traffic
              </h3>
              <Badge variant="outline" className="text-xs">
                MB
              </Badge>
            </div>
            <MetricsChart
              data={metricsData?.history || []}
              metrics={['network_sent', 'network_received']}
              colors={['#8b5cf6', '#ec4899']}
              labels={['Sent', 'Received']}
              timeRange={timeRange}
            />
          </Card>

          {/* System Summary */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                Performance Summary
              </h3>
            </div>
            
            <div className="space-y-4">
              {metricsData?.summary && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Average CPU</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {metricsData.summary.avg_cpu.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Average RAM</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {metricsData.summary.avg_ram.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Peak CPU</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {metricsData.summary.max_cpu.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Peak RAM</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {metricsData.summary.max_ram.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-200">
                    <p className="text-sm text-slate-600">
                      Data Points: <span className="font-semibold">{metricsData.summary.data_points}</span>
                    </p>
                    <p className="text-sm text-slate-600">
                      Uptime: <span className="font-semibold">
                        {Math.floor((metricsData.current?.uptime_seconds || 0) / 86400)}d {Math.floor(((metricsData.current?.uptime_seconds || 0) % 86400) / 3600)}h
                      </span>
                    </p>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>

        {/* Alerts Panel */}
        <AlertsPanel 
          current={metricsData?.current}
          peaks={metricsData?.peaks}
        />
      </div>
    </AdminLayout>
  );
}

export default function MonitoringPage() {
  return (
    <SessionGuard>
      <MonitoringDashboard />
    </SessionGuard>
  );
}
