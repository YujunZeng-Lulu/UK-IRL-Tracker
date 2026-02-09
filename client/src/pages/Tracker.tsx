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
import { Button } from '@/components/ui/button';
import { 
  calculateILRStatus, 
  parseDate, 
  recommendNextDeparture,
  scanRolling12Months 
} from '@/lib/calculator';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function Tracker() {
  const { state, resetApp } = useApp();
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
        <div className="container py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-medium text-foreground">英国永居离境追踪</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {config.visaType === '5-year' ? '5 年永居路线' : '10 年长期居住路线'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <DataManagement />
            <Button
              variant="outline"
              size="sm"
              onClick={resetApp}
              className="text-xs"
            >
              重置
            </Button>
          </div>
        </div>
      </header>

      {/* 主内容区域 - 垂直流动 */}
      <main className="container py-12 space-y-16 max-w-4xl mx-auto">
        
        {/* 关键统计数据 */}
        <section className="space-y-6">
          <h2 className="text-xl font-medium border-b border-border pb-3">核心数据</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatsCard
              title="距离永居申请"
              value={ilrStatus.daysUntilILR}
              subtitle={ilrStatus.daysUntilILR > 0 ? `还需 ${ilrStatus.daysUntilILR} 天` : '已满足时间要求'}
              status={ilrStatus.daysUntilILR > 365 ? 'safe' : ilrStatus.daysUntilILR > 0 ? 'warning' : 'safe'}
              icon={<CalendarIcon className="w-8 h-8 text-muted-foreground" />}
            />
            
            <StatsCard
              title="当前滚动 12 个月最高离境天数"
              value={ilrStatus.currentRollingDays}
              subtitle={`上限 180 天,剩余 ${Math.max(0, 180 - ilrStatus.currentRollingDays)} 天`}
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
                {mostCriticalWindow.riskLevel === 'critical' ? '⚠️ 违规警告' : '⚠️ 临界风险'}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                在 {mostCriticalWindow.startDate} 至 {mostCriticalWindow.endDate} 期间,
                您的离境天数为 {mostCriticalWindow.departureDays} 天
                {mostCriticalWindow.riskLevel === 'critical' && ',已超过 180 天上限'}
              </p>
            </div>
          )}

          {/* 推荐出境时间 */}
          {recommendation && (
            <div className="p-6 border border-secondary bg-secondary/5">
              <p className="text-sm font-medium mb-2">💡 最优出境建议</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                建议在 {recommendation.suggestedDate} 之后出境,
                最多可离境 {recommendation.maxDuration} 天而不超过滚动 12 个月限制
              </p>
            </div>
          )}
        </section>

        {/* 日历视图 */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-xl font-medium">离境日期标记</h2>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevMonth}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleToday}
                className="font-mono text-xs"
              >
                今天
              </Button>
              <Button
                variant="outline"
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
              <span>在英国</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-primary/20 border border-primary" />
              <span>离境</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 ring-2 ring-secondary" />
              <span>今天</span>
            </div>
          </div>
        </section>

        {/* 详细统计 */}
        <section className="space-y-6">
          <h2 className="text-xl font-medium border-b border-border pb-3">风险窗口详情</h2>
          <DetailedStats />
        </section>

        {/* 合规声明 */}
        <section className="pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            本工具基于英国 Home Office 公布的通用规则进行计算,仅用于辅助判断离境天数与永居资格风险,
            不构成法律意见。最终决定权归英国移民局所有。
          </p>
        </section>

      </main>
    </div>
  );
}
