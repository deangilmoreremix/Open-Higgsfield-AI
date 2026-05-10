import React, { useState, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../stores/StoreProvider';
import { Eye, Clock, Users, SignOut, Trophy, ChevronDown, ChevronUp, MousePointer, ArrowUp, ArrowDown, BarChart3, Fire } from 'lucide-react';
import clsx from 'clsx';

const timeRanges = [
  { id: '1d', name: 'Last 24 Hours', days: 1 },
  { id: '7d', name: 'Last 7 Days', days: 7 },
  { id: '30d', name: 'Last 30 Days', days: 30 },
  { id: '90d', name: 'Last 90 Days', days: 90 },
  { id: '1y', name: 'Last Year', days: 365 }
];

const metrics = [
  { id: 'pageViews', name: 'Page Views', icon: Eye, color: '#007bff' },
  { id: 'sessions', name: 'Sessions', icon: Clock, color: '#28a745' },
  { id: 'users', name: 'Users', icon: Users, color: '#6f42c1' },
  { id: 'bounceRate', name: 'Bounce Rate', icon: SignOut, color: '#dc3545' },
  { id: 'conversions', name: 'Conversions', icon: Trophy, color: '#ffc107' }
];

const segments = [
  { id: 'all', name: 'All Users', count: 12543 },
  { id: 'new', name: 'New Users', count: 4231 },
  { id: 'returning', name: 'Returning Users', count: 8312 },
  { id: 'premium', name: 'Premium Users', count: 1567 },
  { id: 'mobile', name: 'Mobile Users', count: 4423 },
  { id: 'desktop', name: 'Desktop Users', count: 7321 }
];

// Mock data
const analyticsData = {
  overview: {
    totalUsers: 12543,
    totalSessions: 18765,
    totalPageViews: 45231,
    avgSessionDuration: 245,
    bounceRate: 42.3,
    conversionRate: 8.7
  },
  timeSeries: [
    { date: '2024-01-01', pageViews: 1200, sessions: 890, users: 756, conversions: 45 },
    { date: '2024-01-02', pageViews: 1350, sessions: 945, users: 812, conversions: 52 },
    { date: '2024-01-03', pageViews: 1180, sessions: 876, users: 723, conversions: 38 },
    { date: '2024-01-04', pageViews: 1420, sessions: 1023, users: 876, conversions: 61 },
    { date: '2024-01-05', pageViews: 1380, sessions: 987, users: 834, conversions: 55 },
    { date: '2024-01-06', pageViews: 1520, sessions: 1089, users: 923, conversions: 68 },
    { date: '2024-01-07', pageViews: 1650, sessions: 1156, users: 987, conversions: 72 }
  ],
  topPages: [
    { path: '/', views: 8420, uniqueViews: 6543, avgTime: 180, bounceRate: 35.2 },
    { path: '/products', views: 5230, uniqueViews: 4123, avgTime: 245, bounceRate: 28.7 },
    { path: '/about', views: 3450, uniqueViews: 2890, avgTime: 156, bounceRate: 52.1 },
    { path: '/contact', views: 2890, uniqueViews: 2456, avgTime: 134, bounceRate: 48.9 },
    { path: '/blog', views: 4120, uniqueViews: 3456, avgTime: 298, bounceRate: 31.4 }
  ],
  userBehavior: {
    deviceTypes: [
      { type: 'Desktop', percentage: 58.3, sessions: 10923 },
      { type: 'Mobile', percentage: 35.2, sessions: 6589 },
      { type: 'Tablet', percentage: 6.5, sessions: 1213 }
    ],
    userJourney: [
      { step: 'Homepage', users: 10000, dropoff: 0 },
      { step: 'Product Page', users: 6500, dropoff: 35 },
      { step: 'Add to Cart', users: 2800, dropoff: 57 },
      { step: 'Checkout', users: 1800, dropoff: 36 },
      { step: 'Purchase', users: 872, dropoff: 52 }
    ]
  },
  realtime: {
    activeUsers: 127,
    currentPageViews: 23,
    conversions: 3,
    topPages: [
      { path: '/', activeUsers: 45 },
      { path: '/products', activeUsers: 32 },
      { path: '/blog', activeUsers: 18 },
      { path: '/contact', activeUsers: 12 }
    ]
  }
};

const BehavioralAnalytics = observer(() => {
  const store = useStore();
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('pageViews');
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [selectedHeatmapType, setSelectedHeatmapType] = useState('clicks');

  const chartData = useMemo(() => {
    return analyticsData.timeSeries.map(point => ({
      date: new Date(point.date).toLocaleDateString(),
      value: point[selectedMetric]
    }));
  }, [selectedMetric]);

  const metricData = useMemo(() => {
    const currentMetric = metrics.find(m => m.id === selectedMetric);
    const latestData = analyticsData.timeSeries[analyticsData.timeSeries.length - 1];
    const previousData = analyticsData.timeSeries[analyticsData.timeSeries.length - 2];
    const change = previousData ? ((latestData[selectedMetric] - previousData[selectedMetric]) / previousData[selectedMetric] * 100) : 0;

    return {
      value: latestData[selectedMetric],
      change: change.toFixed(1),
      color: currentMetric.color,
      icon: currentMetric.icon,
      name: currentMetric.name
    };
  }, [selectedMetric]);

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPercentage = (value) => {
    return value.toFixed(1) + '%';
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="p-5 bg-white border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Behavioral Analytics</h2>
          <div className="flex gap-4 items-center">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              {timeRanges.map(range => (
                <option key={range.id} value={range.id}>{range.name}</option>
              ))}
            </select>

            <select
              value={selectedSegment}
              onChange={(e) => setSelectedSegment(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              {segments.map(segment => (
                <option key={segment.id} value={segment.id}>
                  {segment.name} ({formatNumber(segment.count)})
                </option>
              ))}
            </select>

            <button
              className={clsx(
                'px-4 py-2 border rounded-md text-sm flex items-center gap-2 transition-colors',
                showHeatmap ? 'bg-blue-500 text-white border-blue-500' : 'bg-white border-gray-300 hover:bg-gray-50'
              )}
              onClick={() => setShowHeatmap(!showHeatmap)}
            >
              <Fire size={16} /> Heatmap
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Main Metric */}
        <div className="p-5 bg-white border-b">
          <div className="flex items-center gap-4 mb-6">
            <div
              className="w-15 h-15 rounded-xl flex items-center justify-center text-white"
              style={{ backgroundColor: metricData.color }}
            >
              <metricData.icon size={24} />
            </div>
            <div>
              <div className="text-4xl font-bold text-gray-900">{formatNumber(metricData.value)}</div>
              <div className="text-lg text-gray-600">{metricData.name}</div>
              <div className={clsx('text-sm font-medium', parseFloat(metricData.change) > 0 ? 'text-green-600' : 'text-red-600')}>
                {parseFloat(metricData.change) > 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                {Math.abs(metricData.change)}%
              </div>
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users size={16} className="text-blue-500" />
                <span className="text-sm font-medium text-gray-700">Total Users</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.overview.totalUsers)}</div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={16} className="text-blue-500" />
                <span className="text-sm font-medium text-gray-700">Avg. Session</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{formatTime(analyticsData.overview.avgSessionDuration)}</div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <SignOut size={16} className="text-red-500" />
                <span className="text-sm font-medium text-gray-700">Bounce Rate</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{formatPercentage(analyticsData.overview.bounceRate)}</div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Trophy size={16} className="text-yellow-500" />
                <span className="text-sm font-medium text-gray-700">Conversion</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{formatPercentage(analyticsData.overview.conversionRate)}</div>
            </div>
          </div>
        </div>

        {/* Metric Selector & Chart */}
        <div className="p-5 bg-white border-b">
          <div className="flex gap-2 mb-4 flex-wrap">
            {metrics.map(metric => {
              const Icon = metric.icon;
              return (
                <button
                  key={metric.id}
                  className={clsx(
                    'px-4 py-2 border-2 rounded-full text-sm flex items-center gap-2 transition-all',
                    selectedMetric === metric.id
                      ? 'border-blue-500 bg-blue-50 text-blue-600'
                      : 'border-gray-200 hover:border-blue-500 hover:bg-gray-50'
                  )}
                  onClick={() => setSelectedMetric(metric.id)}
                >
                  <Icon size={16} /> {metric.name}
                </button>
              );
            })}
          </div>

          <div className="h-72 border border-gray-200 rounded-lg flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Interactive Chart</p>
              <p className="text-sm">Chart visualization would be rendered here</p>
            </div>
          </div>
        </div>

        {/* Panels */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-2 gap-5 mb-5">
            {/* Top Pages */}
            <div className="bg-white rounded-lg p-5 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Top Pages</h3>
              <div className="space-y-3">
                {analyticsData.topPages.map((page, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-blue-500">{page.path}</span>
                      <span className="text-sm text-gray-600">
                        {formatNumber(page.views)} views • {formatTime(page.avgTime)} avg • {formatPercentage(page.bounceRate)} bounce
                      </span>
                    </div>
                    <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(page.views / analyticsData.topPages[0].views) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* User Journey */}
            <div className="bg-white rounded-lg p-5 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">User Journey</h3>
              <div className="space-y-4">
                {analyticsData.userBehavior.userJourney.map((step, index) => (
                  <div key={index} className="relative">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 bg-gray-50 p-3 rounded-md">
                        <div className="font-medium">{step.step}</div>
                        <div className="text-sm text-gray-600">{formatNumber(step.users)} users</div>
                      </div>
                      {index > 0 && (
                        <div className="text-red-500 text-sm font-medium">
                          -{formatPercentage(step.dropoff)}
                        </div>
                      )}
                    </div>
                    {index < analyticsData.userBehavior.userJourney.length - 1 && (
                      <div className="absolute left-1/2 top-full transform -translate-x-1/2 text-gray-400 z-10">
                        <ChevronDown size={16} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Device Breakdown */}
            <div className="bg-white rounded-lg p-5 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Device Breakdown</h3>
              <div className="space-y-3">
                {analyticsData.userBehavior.deviceTypes.map((device, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{device.type}</span>
                      <span className="text-gray-600">{formatPercentage(device.percentage)}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${device.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Real-time Activity */}
            <div className="bg-white rounded-lg p-5 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Real-time Activity</h3>
              <div className="space-y-4 mb-4">
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-md">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-md flex items-center justify-center">
                    <Users size={16} />
                  </div>
                  <div>
                    <div className="font-bold text-xl">{analyticsData.realtime.activeUsers}</div>
                    <div className="text-sm text-gray-600">Active Users</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-md">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-md flex items-center justify-center">
                    <Eye size={16} />
                  </div>
                  <div>
                    <div className="font-bold text-xl">{analyticsData.realtime.currentPageViews}</div>
                    <div className="text-sm text-gray-600">Page Views/min</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-md">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-md flex items-center justify-center">
                    <Trophy size={16} />
                  </div>
                  <div>
                    <div className="font-bold text-xl">{analyticsData.realtime.conversions}</div>
                    <div className="text-sm text-gray-600">Conversions</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Popular Pages Right Now</h4>
                {analyticsData.realtime.topPages.map((page, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-blue-500">{page.path}</span>
                    <span className="text-sm text-gray-600">{page.activeUsers} users</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Heatmap Panel */}
          {showHeatmap && (
            <div className="bg-white rounded-lg shadow-sm mb-5">
              <div className="p-5 border-b">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Heatmap Analysis</h3>
                  <select
                    value={selectedHeatmapType}
                    onChange={(e) => setSelectedHeatmapType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="clicks">Click Heatmap</option>
                    <option value="scroll">Scroll Depth</option>
                    <option value="attention">Attention Map</option>
                  </select>
                </div>
              </div>

              <div className="p-5">
                {selectedHeatmapType === 'clicks' && (
                  <div>
                    <div className="h-48 border border-gray-200 rounded-lg flex items-center justify-center bg-gray-50 mb-4">
                      <div className="text-center text-gray-500">
                        <MousePointer size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="text-lg">Click Heatmap Visualization</p>
                        <p className="text-sm">Hotspots would be displayed here</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-3">Top Click Elements</h4>
                      {[
                        { element: 'header-logo', clicks: 245 },
                        { element: 'nav-menu', clicks: 189 },
                        { element: 'hero-cta', clicks: 156 }
                      ].map((item, index) => (
                        <div key={index} className="flex justify-between py-2 border-b border-gray-50">
                          <span className="font-medium">{item.element}</span>
                          <span className="text-gray-600">{item.clicks} clicks</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedHeatmapType === 'scroll' && (
                  <div>
                    <div className="space-y-3">
                      {[
                        { depth: '25%', users: 8567, percentage: 100 },
                        { depth: '50%', users: 6234, percentage: 72.8 },
                        { depth: '75%', users: 4123, percentage: 48.1 },
                        { depth: '100%', users: 2345, percentage: 27.4 }
                      ].map((depth, index) => (
                        <div key={index} className="flex items-center gap-4">
                          <span className="w-12 text-sm font-medium">{depth.depth}</span>
                          <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${depth.percentage}%` }}
                            />
                          </div>
                          <span className="w-20 text-sm text-gray-600 text-right">{formatNumber(depth.users)} users</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default BehavioralAnalytics;
