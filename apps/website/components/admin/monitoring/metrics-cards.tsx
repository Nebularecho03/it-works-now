"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Cpu,
  HardDrive,
  Network,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity
} from "lucide-react";

interface CurrentMetrics {
  cpu_usage: number;
  ram_usage: number;
  disk_usage: number;
  disk_free: number;
  network_sent: number;
  network_received: number;
  uptime_seconds: number;
}

interface MetricsSummary {
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
}

interface PeaksData {
  cpu: { cpu_usage: number; recorded_at: string } | null;
  ram: { ram_usage: number; recorded_at: string } | null;
  disk: { disk_usage: number; recorded_at: string } | null;
}

interface MetricsCardsProps {
  current: CurrentMetrics;
  summary: MetricsSummary;
  peaks: PeaksData;
}

export function MetricsCards({ current, summary, peaks }: MetricsCardsProps) {
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const getUsageColor = (usage: number) => {
    if (usage >= 80) return "text-red-600";
    if (usage >= 60) return "text-yellow-600";
    return "text-green-600";
  };

  const getUsageBadgeVariant = (usage: number) => {
    if (usage >= 80) return "destructive";
    if (usage >= 60) return "secondary";
    return "default";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* CPU Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-slate-900">CPU</h3>
          </div>
          <Badge variant={getUsageBadgeVariant(current.cpu_usage)} className="text-xs">
            {current.cpu_usage.toFixed(1)}%
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Current</span>
            <span className={`font-semibold ${getUsageColor(current.cpu_usage)}`}>
              {current.cpu_usage.toFixed(1)}%
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Average</span>
            <span className="text-sm font-medium text-slate-700">
              {summary.avg_cpu.toFixed(1)}%
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Peak</span>
            <span className="text-sm font-medium text-slate-700">
              {summary.max_cpu.toFixed(1)}%
            </span>
          </div>
        </div>
      </Card>

      {/* RAM Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-slate-900">RAM</h3>
          </div>
          <Badge variant={getUsageBadgeVariant(current.ram_usage)} className="text-xs">
            {current.ram_usage.toFixed(1)}%
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Current</span>
            <span className={`font-semibold ${getUsageColor(current.ram_usage)}`}>
              {current.ram_usage.toFixed(1)}%
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Average</span>
            <span className="text-sm font-medium text-slate-700">
              {summary.avg_ram.toFixed(1)}%
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Peak</span>
            <span className="text-sm font-medium text-slate-700">
              {summary.max_ram.toFixed(1)}%
            </span>
          </div>
        </div>
      </Card>

      {/* Disk Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-slate-900">Disk</h3>
          </div>
          <Badge variant={getUsageBadgeVariant(current.disk_usage)} className="text-xs">
            {current.disk_usage.toFixed(1)}%
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Used</span>
            <span className={`font-semibold ${getUsageColor(current.disk_usage)}`}>
              {current.disk_usage.toFixed(1)}%
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Free</span>
            <span className="text-sm font-medium text-slate-700">
              {current.disk_free.toFixed(1)} GB
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Average</span>
            <span className="text-sm font-medium text-slate-700">
              {summary.avg_disk.toFixed(1)}%
            </span>
          </div>
        </div>
      </Card>

      {/* Network & Uptime Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-slate-900">Network</h3>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Sent</span>
            <span className="text-sm font-medium text-slate-700">
              {current.network_sent.toFixed(1)} MB
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Received</span>
            <span className="text-sm font-medium text-slate-700">
              {current.network_received.toFixed(1)} MB
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Uptime</span>
            <span className="text-sm font-medium text-slate-700">
              {formatUptime(current.uptime_seconds)}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
