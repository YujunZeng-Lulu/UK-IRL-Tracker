/**
 * 日本极简主义 - 日历组件
 * 横向滚动的长卷轴式日历
 */

import { useApp } from '@/contexts/AppContext';
import { formatDate, getDaysInMonth, getFirstDayOfMonth, parseDate } from '@/lib/calculator';
import { cn } from '@/lib/utils';

interface CalendarProps {
  year: number;
  month: number;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

export function Calendar({ year, month }: CalendarProps) {
  const { state, toggleDeparture } = useApp();
  const days = getDaysInMonth(year, month);
  const firstDayOfWeek = getFirstDayOfMonth(year, month);
  
  // 计算需要的空白格子数
  const emptyDays = Array(firstDayOfWeek).fill(null);
  
  const today = new Date();
  const todayStr = formatDate(today);
  
  const arrivalDate = state.config?.arrivalDate ? parseDate(state.config.arrivalDate) : null;

  return (
    <div className="space-y-4">
      {/* 月份标题 */}
      <div className="flex items-baseline space-x-4 pb-2 border-b border-border">
        <h3 className="text-xl font-medium">
          {year} 年 {month + 1} 月
        </h3>
      </div>

      {/* 星期标题 */}
      <div className="grid grid-cols-7 gap-2">
        {WEEKDAYS.map((day, index) => (
          <div
            key={index}
            className="text-center text-xs text-muted-foreground font-normal py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* 日期网格 */}
      <div className="grid grid-cols-7 gap-2">
        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} />
        ))}
        
        {days.map((date) => {
          const dateStr = formatDate(date);
          const isDeparture = state.departures[dateStr] === true;
          const isToday = dateStr === todayStr;
          const isBeforeArrival = arrivalDate && date < arrivalDate;
          const isFuture = date > today;
          const isDisabled = isBeforeArrival || isFuture;

          return (
            <button
              key={dateStr}
              onClick={() => !isDisabled && toggleDeparture(dateStr)}
              disabled={isDisabled}
              className={cn(
                'aspect-square flex items-center justify-center text-sm font-mono transition-all duration-500',
                'hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring',
                isDisabled && 'opacity-30 cursor-not-allowed hover:scale-100',
                !isDisabled && !isDeparture && 'bg-card hover:bg-muted',
                isDeparture && 'bg-primary/20 border border-primary text-primary',
                isToday && 'ring-2 ring-secondary'
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
