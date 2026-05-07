"use client";

import { useState, useEffect, useCallback } from "react";

interface UseMetricsOptions {
  refreshInterval?: number;
  enabled?: boolean;
}

interface MetricsResponse<T = any> {
  current: T | null;
  history: T[];
  summary: any;
  peaks: any;
  metadata: {
    time_range: string;
    live: boolean;
    data_points: number;
    generated_at: string;
  };
}

export function useMetrics<T = any>(
  timeRange: string = "hour", 
  live: boolean = false,
  options: UseMetricsOptions = {}
) {
  const [data, setData] = useState<MetricsResponse<T> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { refreshInterval = live ? 30000 : 0, enabled = true } = options;

  const fetchMetrics = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/admin/metrics?range=${timeRange}&live=${live}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Add authentication headers if needed
            // "Authorization": `Bearer ${token}`
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch metrics");
      }

      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      console.error("Error fetching metrics:", err);
    } finally {
      setLoading(false);
    }
  }, [timeRange, live, enabled]);

  // Initial fetch
  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Set up interval for live mode
  useEffect(() => {
    if (!live || !refreshInterval || !enabled) return;

    const interval = setInterval(fetchMetrics, refreshInterval);
    return () => clearInterval(interval);
  }, [live, refreshInterval, fetchMetrics, enabled]);

  return {
    data,
    loading,
    error,
    refetch: fetchMetrics,
  };
}

// Additional hooks for specific metrics
export function useCurrentMetrics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/metrics/current", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch current metrics");
      }

      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      console.error("Error fetching current metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentMetrics();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchCurrentMetrics,
  };
}

export function useMetricsSummary(timeRange: string = "hour") {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/metrics/summary?range=${timeRange}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch metrics summary");
      }

      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      console.error("Error fetching metrics summary:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [timeRange]);

  return {
    data,
    loading,
    error,
    refetch: fetchSummary,
  };
}
