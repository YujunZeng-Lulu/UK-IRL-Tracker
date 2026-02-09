/**
 * 日本极简主义 - 详细统计组件
 * 展示所有滚动 12 个月窗口的详细数据
 */

import { useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { scanRolling12Months, parseDate } from '@/lib/calculator';
import { cn } from '@/lib/utils';

export function DetailedStats() {
  const { state } = useApp();
  const config = state.config!;
  const arrivalDate = parseDate(config.arrivalDate);
  
  const rollingStats = useMemo(() => {
    return scanRolling12Months(state.departures, arrivalDate, config.visaType);
  }, [state.departures, arrivalDate, config.visaType]);
  
  // 只显示有风险的窗口
  const riskyWindows = rollingStats.filter(s => s.riskLevel !== 'safe');
  
  if (riskyWindows.length === 0) {
    return (
      <div className="p-8 text-center border border-secondary bg-secondary/5">
        <p className="text-sm text-muted-foreground">
          ✓ 所有滚动 12 个月窗口均符合要求
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        共发现 {riskyWindows.length} 个需要关注的时间窗口
      </p>
      
      <div className="space-y-3">
        {riskyWindows.slice(0, 10).map((window, index) => (
          <div
            key={index}
            className={cn(
              'p-4 border-l-4 transition-all duration-300',
              window.riskLevel === 'critical' && 'border-l-accent bg-accent/5',
              window.riskLevel === 'warning' && 'border-l-primary bg-primary/5'
            )}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-mono text-muted-foreground">
                  {window.startDate} ~ {window.endDate}
                </p>
                <p className="text-sm">
                  离境天数: <span className="font-mono font-medium">{window.departureDays}</span> 天
                </p>
              </div>
              <div className={cn(
                'px-3 py-1 text-xs',
                window.riskLevel === 'critical' && 'bg-accent/20 text-accent',
                window.riskLevel === 'warning' && 'bg-primary/20 text-primary'
              )}>
                {window.riskLevel === 'critical' ? '违规' : '临界'}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {riskyWindows.length > 10 && (
        <p className="text-xs text-muted-foreground text-center">
          仅显示前 10 个窗口
        </p>
      )}
    </div>
  );
}
