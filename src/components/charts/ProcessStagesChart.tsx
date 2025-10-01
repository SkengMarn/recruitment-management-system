import React from 'react';
import { Progress } from '../ui/progress';

interface ProcessStage {
  name: string;
  count: number;
  percentage?: number;
}

interface ProcessStagesChartProps {
  data: ProcessStage[];
}

const ProcessStagesChart: React.FC<ProcessStagesChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No process stage data available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((stage, index) => (
        <div key={index} className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">{stage.name}</span>
            <span className="text-sm text-muted-foreground">
              {stage.count} candidates
            </span>
          </div>
          <Progress 
            value={stage.percentage || (stage.count / Math.max(...data.map(d => d.count)) * 100)} 
            className="h-2"
          />
        </div>
      ))}
    </div>
  );
};

export default ProcessStagesChart;
