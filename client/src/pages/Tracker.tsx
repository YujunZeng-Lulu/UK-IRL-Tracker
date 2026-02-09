/**
 * 日本极简主义 - 主追踪页面
 * 垂直流动的单列布局
 */

import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Calendar } from '@/components/Calendar';
import { StatsCard } from '@/components/StatsCard';
import { DetailedStats } from '@/components/DetailedStats';
import { DataManagement } from '@/components/DataManagement';
import { DateRangeDialog } from '@/components/DateRangeDialog';
import DeparturePeriodList from '@/components/DeparturePeriodList';
import { Button } from '@/components/ui/button';
import { 
  calculateILRStatus, 
  parseDate, 
  recommendNextDeparture,
  scanRolling12Months 
} from '@/lib/calculator';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function Tracker() {
  const { state, reset: resetApp } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const config = state.config!;
  const arrivalDate = parseDate(config.arrivalDate);
  
  // 计算永居状态
  const ilrStatus = useMemo(() => {
    return calculateILRStatus(state.departures, arrivalDate, config.visaType);
  }, [state.departures, arrivalDate, config.visaType]);
  
  // 推荐出境时间
  const recommendation = useMemo(() => {
    return recommendNextDeparture(state.departures, arrivalDate, config.visaType);
  }, [state.departures, arrivalDate, config.visaType]);
  
  // 获取所有滚动窗口统计
  const rollingStats = useMemo(() => {
    return scanRolling12Months(state.departures, arrivalDate, config.visaType);
  }, [state.departures, arrivalDate, config.visaType]);
  
  // 找出当前最危险的窗口
  const mostCriticalWindow = useMemo(() => {
    return rollingStats.reduce((max, curr) => 
      curr.departureDays > max.departureDays ? curr : max
    , rollingStats[0]);
  }, [rollingStats]);

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航 */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-medium text-foreground">英国永居离境追踪 <span className="text-sm text-muted-foreground">UK ILR Tracker</span></h1>
            <p className="text-sm text-muted-foreground mt-1">
              {config.visaType === '5-year' ? '5 年永居路线 (5-Year Route)' : '10 年长期居住路线 (10-Year Route)'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <DateRangeDialog />
            <DataManagement />
            <Button
              variant="outline"
              size="sm"
              onClick={resetApp}
              className="text-xs"
            >
              重置 Reset
            </Button>
          </div>
        </div>
      </header>

      {/* 主内容区域 - 垂直流动 */}
      <main className="container py-12 space-y-16 max-w-4xl mx-auto">
        
        {/* 关键统计数据 */}
        <section className="space-y-6">
          <h2 className="text-xl font-medium border-b border-border pb-3">核心数据 <span className="text-sm text-muted-foreground">Key Metrics</span></h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatsCard
              title="距离永居申请 Days Until ILR"
              value={ilrStatus.daysUntilILR}
              subtitle={ilrStatus.daysUntilILR > 0 ? `还需 ${ilrStatus.daysUntilILR} 天 (${ilrStatus.daysUntilILR} days remaining)` : '已满足时间要求 (Time requirement met)'}
              status={ilrStatus.daysUntilILR > 365 ? 'safe' : ilrStatus.daysUntilILR > 0 ? 'warning' : 'safe'}
              icon={<CalendarIcon className="w-8 h-8 text-muted-foreground" />}
            />
            
            <StatsCard
              title="当前滚动 12 个月最高离境天数 Max Days in Rolling 12 Months"
              value={ilrStatus.currentRollingDays}
              subtitle={`上限 180 天,剩余 ${Math.max(0, 180 - ilrStatus.currentRollingDays)} 天 (Limit 180, ${Math.max(0, 180 - ilrStatus.currentRollingDays)} remaining)`}
              status={
                ilrStatus.currentRollingDays > 180 ? 'critical' :
                ilrStatus.currentRollingDays >= 150 ? 'warning' : 'safe'
              }
              icon={
                ilrStatus.currentRollingDays > 180 ? 
                  <AlertTriangle className="w-8 h-8 text-accent" /> :
                  <CheckCircle2 className="w-8 h-8 text-secondary" />
              }
            />
          </div>

          {/* 最危险窗口提示 */}
          {mostCriticalWindow && mostCriticalWindow.departureDays >= 150 && (
            <div className={`p-6 border-l-4 ${
              mostCriticalWindow.riskLevel === 'critical' ? 'border-l-accent bg-accent/5' :
              'border-l-primary bg-primary/5'
            }`}>
              <p className="text-sm font-medium mb-2">
                {mostCriticalWindow.riskLevel === 'critical' ? '⚠️ 违规警告 (Violation Warning)' : '⚠️ 临界风险 (Critical Risk)'}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                在 {mostCriticalWindow.startDate} 至 {mostCriticalWindow.endDate} 期间,
                您的离境天数为 {mostCriticalWindow.departureDays} 天
                {mostCriticalWindow.riskLevel === 'critical' && ',已超过 180 天上限 (exceeded 180-day limit)'}
                <br />
                <span className="text-xs">During {mostCriticalWindow.startDate} to {mostCriticalWindow.endDate}, you were absent for {mostCriticalWindow.departureDays} days</span>
              </p>
            </div>
          )}

          {/* 推荐出境时间 */}
          {recommendation && (
            <div className="p-6 border border-secondary bg-secondary/5">
              <p className="text-sm font-medium mb-2">💡 最优出境建议 (Optimal Departure Suggestion)</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                建议在 {recommendation.suggestedDate} 之后出境,
                最多可离境 {recommendation.maxDuration} 天而不超过滚动 12 个月限制
                <br />
                <span className="text-xs">Suggested to depart after {recommendation.suggestedDate}, max {recommendation.maxDuration} days without exceeding rolling 12-month limit</span>
              </p>
            </div>
          )}
        </section>

        {/* 日历视图 */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-xl font-medium">离境日期标记 <span className="text-sm text-muted-foreground">Departure Dates</span></h2>
            <div className="flex items-center space-x-3">
              {/* 年份选择器 */}
              <select
                value={currentDate.getFullYear()}
                onChange={(e) => {
                  const newDate = new Date(currentDate);
                  newDate.setFullYear(parseInt(e.target.value));
                  setCurrentDate(newDate);
                }}
                className="px-3 py-1.5 text-sm border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              >
                {Array.from({ length: 15 }, (_, i) => {
                  const year = new Date().getFullYear() - 10 + i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>

              {/* 月份选择器 */}
              <select
                value={currentDate.getMonth()}
                onChange={(e) => {
                  const newDate = new Date(currentDate);
                  newDate.setMonth(parseInt(e.target.value));
                  setCurrentDate(newDate);
                }}
                className="px-3 py-1.5 text-sm border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i}>
                    {i + 1} 月
                  </option>
                ))}
              </select>

              <div className="h-4 w-px bg-border" />

              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevMonth}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleToday}
                className="text-xs"
              >
                <CalendarIcon className="w-3 h-3 mr-2" />
                今天 Today
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNextMonth}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="bg-card border border-border p-8">
            <Calendar
              year={currentDate.getFullYear()}
              month={currentDate.getMonth()}
            />
          </div>

          <div className="flex items-center justify-center space-x-8 text-xs text-muted-foreground">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-card border border-border" />
              <span>在英国 (In UK)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-primary/20 border border-primary" />
              <span>离境 (Departed)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 ring-2 ring-secondary" />
              <span>今天 (Today)</span>
            </div>
          </div>
        </section>

        {/* 离境时间段列表 */}
        <section className="space-y-6">
          <h2 className="text-xl font-medium border-b border-border pb-3">离境记录管理 <span className="text-sm text-muted-foreground">Departure Records Management</span></h2>
          <DeparturePeriodList />
        </section>

        {/* 详细统计 */}
        <section className="space-y-6">
          <h2 className="text-xl font-medium border-b border-border pb-3">风险窗口详情 <span className="text-sm text-muted-foreground">Risk Window Details</span></h2>
          <DetailedStats />
        </section>

        {/* 合规声明 */}
        <section className="pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            本工具基于英国 Home Office 公布的通用规则进行计算,仅用于辅助判断离境天数与永居资格风险,
            不构成法律意见。最终决定权归英国移民局所有。
            <br />
            This tool calculates based on UK Home Office published general rules, for reference only. 
            Does not constitute legal advice. Final decision rests with UK immigration authorities.
          </p>
        </section>

      </main>
    </div>
  );
}
