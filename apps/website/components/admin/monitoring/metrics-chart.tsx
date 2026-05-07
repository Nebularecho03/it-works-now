"use client";

import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";

interface MetricsChartProps {
  data: Array<{
    recorded_at: string;
    [key: string]: any;
  }>;
  metrics: string[];
  colors: string[];
  labels: string[];
  timeRange: string;
  height?: number;
}

export function MetricsChart({
  data,
  metrics,
  colors,
  labels,
  timeRange,
  height = 300
}: MetricsChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !data.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, height);

    // Prepare data
    const padding = { top: 20, right: 20, bottom: 40, left: 60 };
    const chartWidth = rect.width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Find min and max values for scaling
    let minValue = Infinity;
    let maxValue = -Infinity;

    metrics.forEach(metric => {
      data.forEach(item => {
        const value = item[metric];
        if (value !== null && value !== undefined) {
          minValue = Math.min(minValue, value);
          maxValue = Math.max(maxValue, value);
        }
      });
    });

    // Add some padding to the range
    const range = maxValue - minValue;
    minValue = Math.max(0, minValue - range * 0.1);
    maxValue = maxValue + range * 0.1;

    // Draw grid lines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);

    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();

      // Y-axis labels
      const value = maxValue - (maxValue - minValue) * (i / 5);
      ctx.fillStyle = '#64748b';
      ctx.font = '12px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(value.toFixed(1), padding.left - 10, y + 4);
    }

    // Vertical grid lines
    const timeSteps = getTimeSteps(timeRange);
    timeSteps.forEach((_, index) => {
      const x = padding.left + (chartWidth / (timeSteps.length - 1)) * index;
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, padding.top + chartHeight);
      ctx.stroke();
    });

    ctx.setLineDash([]);

    // Draw lines for each metric
    metrics.forEach((metric, metricIndex) => {
      ctx.strokeStyle = colors[metricIndex];
      ctx.lineWidth = 2;
      ctx.beginPath();

      data.forEach((item, index) => {
        const value = item[metric];
        if (value === null || value === undefined) return;

        const x = padding.left + (chartWidth / (data.length - 1)) * index;
        const y = padding.top + chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();

      // Draw data points
      data.forEach((item, index) => {
        const value = item[metric];
        if (value === null || value === undefined) return;

        const x = padding.left + (chartWidth / (data.length - 1)) * index;
        const y = padding.top + chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight;

        ctx.fillStyle = colors[metricIndex];
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
      });
    });

    // Draw legend
    ctx.font = '12px system-ui';
    labels.forEach((label, index) => {
      const legendX = padding.left + index * 100;
      const legendY = height - 10;

      // Color box
      ctx.fillStyle = colors[index];
      ctx.fillRect(legendX, legendY - 8, 12, 12);

      // Label
      ctx.fillStyle = '#475569';
      ctx.textAlign = 'left';
      ctx.fillText(label, legendX + 16, legendY + 2);
    });

    // Draw x-axis time labels
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'center';
    timeSteps.forEach((step, index) => {
      const x = padding.left + (chartWidth / (timeSteps.length - 1)) * index;
      ctx.fillText(step, x, height - 15);
    });

  }, [data, metrics, colors, labels, timeRange, height]);

  const getTimeSteps = (range: string): string[] => {
    switch (range) {
      case '60m':
        return Array.from({ length: 7 }, (_, i) => `-${60 - i * 10}m`);
      case 'hour':
        return Array.from({ length: 7 }, (_, i) => `-${60 - i * 10}m`);
      case 'day':
        return Array.from({ length: 7 }, (_, i) => `-${24 - i * 4}h`);
      case 'week':
        return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      case 'month':
        return ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      default:
        return [];
    }
  };

  return (
    <div className="w-full">
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{ height: `${height}px` }}
      />
    </div>
  );
}
