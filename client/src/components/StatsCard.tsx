/**
 * 日本极简主义 - 统计卡片组件
 * 展示关键数据的精致卡片
 */

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  status?: 'safe' | 'warning' | 'critical';
  icon?: ReactNode;
  className?: string;
}

export function StatsCard({ title, value, subtitle, status, icon, className }: StatsCardProps) {
  return (
    <div
      className={cn(
        'bg-card border border-border p-6 space-y-4 transition-all duration-500 hover:shadow-sm',
        status === 'safe' && 'border-l-4 border-l-secondary',
        status === 'warning' && 'border-l-4 border-l-primary',
        status === 'critical' && 'border-l-4 border-l-accent',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground font-normal">{title}</p>
          <p className="text-3xl font-mono font-medium text-foreground">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground leading-relaxed">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="opacity-60">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
