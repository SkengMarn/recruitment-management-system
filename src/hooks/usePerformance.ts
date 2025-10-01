import { useEffect, useCallback, useRef } from 'react';
import { apiCache } from '../utils/performance';

// Performance monitoring hook
export const usePerformance = (componentName: string) => {
  const startTime = useRef<number>(Date.now());
  
  useEffect(() => {
    // Mark component mount
    if (performance.mark) {
      performance.mark(`${componentName}-start`);
    }
    
    return () => {
      // Mark component unmount and measure
      if (performance.mark && performance.measure) {
        performance.mark(`${componentName}-end`);
        performance.measure(
          `${componentName}-duration`,
          `${componentName}-start`,
          `${componentName}-end`
        );
      }
    };
  }, [componentName]);

  const logPerformance = useCallback((action: string, duration?: number) => {
    const actualDuration = duration || (Date.now() - startTime.current);
    console.log(`[Performance] ${componentName} - ${action}: ${actualDuration}ms`);
  }, [componentName]);

  return { logPerformance };
};

// API caching hook
export const useCachedAPI = <T>(
  key: string,
  apiCall: () => Promise<T>,
  dependencies: any[] = []
) => {
  const fetchData = useCallback(async (): Promise<T> => {
    // Check cache first
    const cached = apiCache.get(key);
    if (cached) {
      console.log(`[Cache] Hit for ${key}`);
      return cached;
    }

    // Fetch from API
    console.log(`[Cache] Miss for ${key}, fetching...`);
    const data = await apiCall();
    
    // Cache the result
    apiCache.set(key, data);
    return data;
  }, [key, apiCall, ...dependencies]);

  return fetchData;
};

// Debounced search hook
export const useDebouncedSearch = (
  searchFn: (query: string) => void,
  delay: number = 300
) => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedSearch = useCallback((query: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      searchFn(query);
    }, delay);
  }, [searchFn, delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedSearch;
};

// Intersection Observer hook for lazy loading
export const useIntersectionObserver = (
  callback: () => void,
  options: IntersectionObserverInit = {}
) => {
  const targetRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            callback();
          }
        });
      },
      {
        threshold: 0.1,
        ...options
      }
    );

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [callback, options]);

  return targetRef;
};

// Performance metrics collection
export const usePerformanceMetrics = () => {
  const collectMetrics = useCallback(() => {
    if (!performance.getEntriesByType) return null;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');

    const metrics = {
      // Core Web Vitals approximation
      domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
      loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart,
      firstPaint: paint.find(entry => entry.name === 'first-paint')?.startTime,
      firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime,
      
      // Network timing
      dnsLookup: navigation?.domainLookupEnd - navigation?.domainLookupStart,
      tcpConnect: navigation?.connectEnd - navigation?.connectStart,
      serverResponse: navigation?.responseEnd - navigation?.requestStart,
      
      // Resource loading
      totalResources: performance.getEntriesByType('resource').length,
      totalSize: performance.getEntriesByType('resource').reduce((total, resource: any) => {
        return total + (resource.transferSize || 0);
      }, 0)
    };

    return metrics;
  }, []);

  const logMetrics = useCallback(() => {
    const metrics = collectMetrics();
    if (metrics) {
      console.group('🚀 Performance Metrics');
      console.log('DOM Content Loaded:', metrics.domContentLoaded?.toFixed(2), 'ms');
      console.log('Load Complete:', metrics.loadComplete?.toFixed(2), 'ms');
      console.log('First Paint:', metrics.firstPaint?.toFixed(2), 'ms');
      console.log('First Contentful Paint:', metrics.firstContentfulPaint?.toFixed(2), 'ms');
      console.log('DNS Lookup:', metrics.dnsLookup?.toFixed(2), 'ms');
      console.log('Server Response:', metrics.serverResponse?.toFixed(2), 'ms');
      console.log('Total Resources:', metrics.totalResources);
      console.log('Total Size:', (metrics.totalSize / 1024).toFixed(2), 'KB');
      console.groupEnd();
    }
  }, [collectMetrics]);

  return { collectMetrics, logMetrics };
};
