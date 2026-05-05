'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  Users, 
  Activity, 
  BarChart3, 
  Check, 
  TrendingUp, 
  Calendar, 
  MessageSquare 
} from 'lucide-react';

// Mock data
const analyticsData = {
  totalVisitors: 15234,
  pageViews: 89234,
  uniqueVisitors: 12456,
  bounceRate: 32.5,
  topPages: [
    { path: '/research', views: 4523, percentage: 35.2 },
    { path: '/about', views: 3214, percentage: 25.1 },
    { path: '/contact', views: 2145, percentage: 16.8 },
    { path: '/blog', views: 1876, percentage: 14.7 }
  ],
  trafficSources: [
    { source: 'Organic Search', visitors: 8234, percentage: 54.1 },
    { source: 'Direct Traffic', visitors: 4567, percentage: 30.0 },
    { source: 'Social Media', visitors: 1876, percentage: 12.3 },
    { source: 'Referral', visitors: 567, percentage: 3.7 }
  ]
};

const formatNumber = (num: number) => {
  return num.toLocaleString();
};

const formatPercentage = (num: number) => {
  return `${num.toFixed(1)}%`;
};

export default function AnalyticsPage() {
  const [activeSection, setActiveSection] = useState('overview');

  return (
    <div className="container-shell space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
          <p className="text-slate-600">Monitor your website performance and user behavior</p>
          <div className="flex items-center gap-2">
            <Tabs value={activeSection} onValueChange={setActiveSection}>
              <TabsList value="overview">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="traffic">Traffic</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          {activeSection === 'overview' && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {/* Key Metrics */}
              <Card className="p-6">
                <CardHeader>
                  <CardTitle>Key Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-emerald-600">{formatNumber(analyticsData.totalVisitors)}</div>
                      <div className="text-sm text-slate-600">Total Visitors</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{formatNumber(analyticsData.pageViews)}</div>
                      <div className="text-sm text-slate-600">Page Views</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600">{formatNumber(analyticsData.uniqueVisitors)}</div>
                      <div className="text-sm text-slate-600">Unique Visitors</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-600">{analyticsData.bounceRate}%</div>
                      <div className="text-sm text-slate-600">Bounce Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Pages */}
              <Card className="p-6">
                <CardHeader>
                  <CardTitle>Top Pages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData.topPages.map((page, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-slate-900">{page.path}</span>
                            <Badge variant="outline" className="text-xs">
                              {formatPercentage(page.percentage)}
                            </Badge>
                          </div>
                          <div className="text-sm text-slate-600">{formatNumber(page.views)} views</div>
                        </div>
                        
                        <div className="text-sm text-slate-600">
                          {index === 0 && <TrendingUp className="w-3 h-3 text-green-600 mr-1" />}
                          {index < 3 ? `Top ${index + 1} of ${analyticsData.topPages.length}` : `Top ${index + 1} of ${analyticsData.topPages.length}`}
                          Trending
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Traffic Sources */}
              <Card className="p-6">
                <CardHeader>
                  <CardTitle>Traffic Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData.trafficSources.map((source, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 text-slate-600" />
                            <span className="text-sm font-medium text-slate-900">{source.source}</span>
                            <Badge variant="outline" className="text-xs">
                              {formatPercentage(source.percentage)}
                            </Badge>
                          </div>
                          <div className="text-sm text-slate-600">{formatNumber(source.visitors)} visitors</div>
                        </div>
                        
                        <div className="text-sm text-slate-600">
                          {index === 0 && <TrendingUp className="w-3 h-3 text-green-600 mr-1" />}
                          {index < 3 ? `Top ${index + 1} of ${analyticsData.trafficSources.length}` : `Top ${index + 1} of ${analyticsData.trafficSources.length}`}
                          Trending
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
