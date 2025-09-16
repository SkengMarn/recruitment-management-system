import React from 'react';
import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from './tooltip';

interface InfoTooltipProps {
  content: string;
  className?: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ content, className = "" }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle className={`h-4 w-4 text-muted-foreground hover:text-primary cursor-help ${className}`} />
      </TooltipTrigger>
      <TooltipContent>
        <p className="max-w-xs text-sm">{content}</p>
      </TooltipContent>
    </Tooltip>
  );
};
