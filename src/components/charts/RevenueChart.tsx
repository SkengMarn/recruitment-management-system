import React from 'react';
import { Card, CardContent } from '../ui/card';

const RevenueChart: React.FC = () => {
  // Mock data for demonstration
  const mockData = [
    { month: 'Jan', revenue: 45000 },
    { month: 'Feb', revenue: 52000 },
    { month: 'Mar', revenue: 48000 },
    { month: 'Apr', revenue: 61000 },
    { month: 'May', revenue: 55000 },
    { month: 'Jun', revenue: 67000 },
  ];

  const maxRevenue = Math.max(...mockData.map(d => d.revenue));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-6 gap-2">
        {mockData.map((item, index) => (
          <div key={index} className="text-center">
            <div className="h-32 flex items-end justify-center mb-2">
              <div 
                className="bg-primary w-8 rounded-t"
                style={{ 
                  height: `${(item.revenue / maxRevenue) * 100}%`,
                  minHeight: '20px'
                }}
              />
            </div>
            <div className="text-xs text-muted-foreground">{item.month}</div>
            <div className="text-xs font-medium">
              {(item.revenue / 1000).toFixed(0)}K
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center text-sm text-muted-foreground">
        Monthly Revenue Trends (UGX)
      </div>
    </div>
  );
};

export default RevenueChart;
