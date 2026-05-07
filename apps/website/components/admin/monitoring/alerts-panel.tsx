"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";

interface CurrentMetrics {
  cpu_usage: number;
  ram_usage: number;
  disk_usage: number;
  disk_free: number;
  network_sent: number;
  network_received: number;
  uptime_seconds: number;
}

interface PeaksData {
  cpu: { cpu_usage: number; recorded_at: string } | null;
  ram: { ram_usage: number; recorded_at: string } | null;
  disk: { disk_usage: number; recorded_at: string } | null;
}

interface AlertsPanelProps {
  current: CurrentMetrics | null;
  peaks: PeaksData;
}

interface Alert {
  type: 'warning' | 'critical' | 'info';
  title: string;
  description: string;
  icon: React.ReactNode;
}

export function AlertsPanel({ current, peaks }: AlertsPanelProps) {
  const generateAlerts = (): Alert[] => {
    if (!current) return [];

    const alerts: Alert[] = [];

    // CPU Alerts
    if (current.cpu_usage >= 90) {
      alerts.push({
        type: 'critical',
        title: 'Critical CPU Usage',
        description: `CPU usage is at ${current.cpu_usage.toFixed(1)}%, which is critically high.`,
        icon: <AlertTriangle className="w-5 h-5 text-red-600" />
      });
    } else if (current.cpu_usage >= 80) {
      alerts.push({
        type: 'warning',
        title: 'High CPU Usage',
        description: `CPU usage is at ${current.cpu_usage.toFixed(1)}%, which is elevated.`,
        icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />
      });
    }

    // RAM Alerts
    if (current.ram_usage >= 90) {
      alerts.push({
        type: 'critical',
        title: 'Critical RAM Usage',
        description: `RAM usage is at ${current.ram_usage.toFixed(1)}%, which is critically high.`,
        icon: <AlertTriangle className="w-5 h-5 text-red-600" />
      });
    } else if (current.ram_usage >= 85) {
      alerts.push({
        type: 'warning',
        title: 'High RAM Usage',
        description: `RAM usage is at ${current.ram_usage.toFixed(1)}%, which is elevated.`,
        icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />
      });
    }

    // Disk Alerts
    if (current.disk_usage >= 95) {
      alerts.push({
        type: 'critical',
        title: 'Critical Disk Usage',
        description: `Disk usage is at ${current.disk_usage.toFixed(1)}%, with only ${current.disk_free.toFixed(1)} GB free.`,
        icon: <AlertTriangle className="w-5 h-5 text-red-600" />
      });
    } else if (current.disk_usage >= 85) {
      alerts.push({
        type: 'warning',
        title: 'High Disk Usage',
        description: `Disk usage is at ${current.disk_usage.toFixed(1)}%, with ${current.disk_free.toFixed(1)} GB free.`,
        icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />
      });
    }

    // Peak Usage Alerts
    if (peaks.cpu && peaks.cpu.cpu_usage >= 95) {
      alerts.push({
        type: 'warning',
        title: 'CPU Peak Detected',
        description: `CPU peaked at ${peaks.cpu.cpu_usage.toFixed(1)}% during this period.`,
        icon: <Info className="w-5 h-5 text-blue-600" />
      });
    }

    if (peaks.ram && peaks.ram.ram_usage >= 95) {
      alerts.push({
        type: 'warning',
        title: 'RAM Peak Detected',
        description: `RAM peaked at ${peaks.ram.ram_usage.toFixed(1)}% during this period.`,
        icon: <Info className="w-5 h-5 text-blue-600" />
      });
    }

    // System Health Info
    if (alerts.length === 0) {
      alerts.push({
        type: 'info',
        title: 'System Healthy',
        description: 'All system metrics are within normal ranges.',
        icon: <CheckCircle className="w-5 h-5 text-green-600" />
      });
    }

    return alerts;
  };

  const alerts = generateAlerts();

  const getAlertVariant = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return 'destructive';
      case 'warning':
        return 'secondary';
      case 'info':
        return 'default';
      default:
        return 'default';
    }
  };

  const getAlertBorderClass = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'info':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-slate-200 bg-slate-50';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-emerald-600" />
          System Alerts
        </h3>
        <Badge variant="outline" className="text-xs">
          {alerts.length} {alerts.length === 1 ? 'alert' : 'alerts'}
        </Badge>
      </div>

      <div className="space-y-3">
        {alerts.map((alert, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${getAlertBorderClass(alert.type)}`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {alert.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-slate-900">
                    {alert.title}
                  </h4>
                  <Badge variant={getAlertVariant(alert.type)} className="text-xs">
                    {alert.type}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600">
                  {alert.description}
                </p>
              </div>
            </div>
          </div>
        ))}

        {alerts.length === 0 && (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <p className="text-slate-600">No alerts at this time</p>
          </div>
        )}
      </div>
    </Card>
  );
}
