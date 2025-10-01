import React from 'react';
import { Badge } from './ui/badge';
import { Clock, CheckCircle, AlertTriangle, Info } from 'lucide-react';

interface Activity {
  id: string;
  message: string;
  time: string;
  status: 'success' | 'info' | 'pending' | 'warning';
}

interface ActivityFeedProps {
  activities: Activity[];
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No recent activities
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-1">
            {getStatusIcon(activity.status)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground">{activity.message}</p>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-muted-foreground">{activity.time}</span>
              <Badge 
                variant="secondary" 
                className={`text-xs ${getStatusColor(activity.status)}`}
              >
                {activity.status}
              </Badge>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityFeed;
