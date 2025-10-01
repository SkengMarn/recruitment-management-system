import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { 
  Activity, 
  Zap, 
  Clock, 
  Wifi, 
  HardDrive,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';

interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstPaint: number;
  firstContentfulPaint: number;
  networkLatency: number;
  memoryUsage: number;
  resourceCount: number;
  totalSize: number;
}

const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const collectMetrics = () => {
    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      const resources = performance.getEntriesByType('resource');

      // Memory usage (if available)
      const memory = (performance as any).memory;

      const newMetrics: PerformanceMetrics = {
        loadTime: navigation?.loadEventEnd - navigation?.fetchStart || 0,
        domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.fetchStart || 0,
        firstPaint: paint.find(entry => entry.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
        networkLatency: navigation?.responseStart - navigation?.requestStart || 0,
        memoryUsage: memory ? memory.usedJSHeapSize / 1024 / 1024 : 0, // MB
        resourceCount: resources.length,
        totalSize: resources.reduce((total: number, resource: any) => {
          return total + (resource.transferSize || 0);
        }, 0) / 1024 // KB
      };

      setMetrics(newMetrics);
    } catch (error) {
      console.error('Error collecting performance metrics:', error);
    }
  };

  useEffect(() => {
    // Collect initial metrics after page load
    const timer = setTimeout(collectMetrics, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(collectMetrics, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getPerformanceScore = (value: number, thresholds: { good: number; poor: number }) => {
    if (value <= thresholds.good) return { score: 'good', color: 'bg-green-500' };
    if (value <= thresholds.poor) return { score: 'needs-improvement', color: 'bg-yellow-500' };
    return { score: 'poor', color: 'bg-red-500' };
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatSize = (kb: number) => {
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="bg-white shadow-lg"
        >
          <Activity className="h-4 w-4 mr-2" />
          Performance
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <CardTitle className="text-sm">Performance Monitor</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setAutoRefresh(!autoRefresh)}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                <RefreshCw className={`h-3 w-3 ${autoRefresh ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                onClick={() => setIsVisible(false)}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
          </div>
          <CardDescription className="text-xs">
            Real-time performance metrics
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {metrics ? (
            <>
              {/* Core Web Vitals */}
              <div className="space-y-2">
                <h4 className="text-xs font-medium flex items-center">
                  <Zap className="h-3 w-3 mr-1" />
                  Core Metrics
                </h4>
                
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span>Load Time</span>
                    <div className="flex items-center space-x-2">
                      <span>{formatTime(metrics.loadTime)}</span>
                      <div className={`w-2 h-2 rounded-full ${
                        getPerformanceScore(metrics.loadTime, { good: 2500, poor: 4000 }).color
                      }`} />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>First Paint</span>
                    <div className="flex items-center space-x-2">
                      <span>{formatTime(metrics.firstPaint)}</span>
                      <div className={`w-2 h-2 rounded-full ${
                        getPerformanceScore(metrics.firstPaint, { good: 1800, poor: 3000 }).color
                      }`} />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>FCP</span>
                    <div className="flex items-center space-x-2">
                      <span>{formatTime(metrics.firstContentfulPaint)}</span>
                      <div className={`w-2 h-2 rounded-full ${
                        getPerformanceScore(metrics.firstContentfulPaint, { good: 1800, poor: 3000 }).color
                      }`} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Network & Resources */}
              <div className="space-y-2">
                <h4 className="text-xs font-medium flex items-center">
                  <Wifi className="h-3 w-3 mr-1" />
                  Network & Resources
                </h4>
                
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Network Latency</span>
                    <span>{formatTime(metrics.networkLatency)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Resources</span>
                    <span>{metrics.resourceCount} files</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Total Size</span>
                    <span>{formatSize(metrics.totalSize)}</span>
                  </div>
                </div>
              </div>

              {/* Memory Usage */}
              {metrics.memoryUsage > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-medium flex items-center">
                    <HardDrive className="h-3 w-3 mr-1" />
                    Memory Usage
                  </h4>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>JS Heap</span>
                      <span>{metrics.memoryUsage.toFixed(1)} MB</span>
                    </div>
                    <Progress 
                      value={Math.min((metrics.memoryUsage / 100) * 100, 100)} 
                      className="h-1"
                    />
                  </div>
                </div>
              )}

              {/* Performance Score */}
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">Overall Score</span>
                  <Badge 
                    variant={
                      metrics.loadTime < 2500 ? 'default' :
                      metrics.loadTime < 4000 ? 'secondary' : 'destructive'
                    }
                    className="text-xs"
                  >
                    {metrics.loadTime < 2500 ? 'Good' :
                     metrics.loadTime < 4000 ? 'Needs Work' : 'Poor'}
                  </Badge>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 pt-2">
                <Button
                  onClick={collectMetrics}
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs h-7"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Refresh
                </Button>
                <Button
                  onClick={() => console.log('Performance Metrics:', metrics)}
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs h-7"
                >
                  <Info className="h-3 w-3 mr-1" />
                  Log
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Collecting metrics...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceMonitor;
