/**
 * 日本极简主义设计 - 核心计算逻辑
 * 精确、克制、可靠的离境天数计算引擎
 */

import type { Rolling12MonthStats, ILRStatus, RecommendedDeparture, VisaType } from '@/../../shared/types';

/**
 * 计算两个日期之间的天数差(包含起始和结束日)
 */
export function daysBetween(start: Date, end: Date): number {
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * 计算指定日期范围内的离境天数
 * @param departures 离境记录 { 'YYYY-MM-DD': true/false }
 * @param startDate 起始日期
 * @param endDate 结束日期
 */
export function calculateDepartureDays(
  departures: Record<string, boolean>,
  startDate: Date,
  endDate: Date
): number {
  let count = 0;
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const dateKey = formatDate(current);
    if (departures[dateKey] === true) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
}

/**
 * 扫描所有可能的连续12个月窗口,找出离境天数
 * 这是核心算法:对每一天作为起点,计算未来12个月的离境天数
 */
export function scanRolling12Months(
  departures: Record<string, boolean>,
  arrivalDate: Date,
  visaType: VisaType
): Rolling12MonthStats[] {
  const results: Rolling12MonthStats[] = [];
  const today = new Date();
  const endScanDate = visaType === '5-year' 
    ? new Date(arrivalDate.getTime() + 5 * 365 * 24 * 60 * 60 * 1000)
    : new Date(arrivalDate.getTime() + 10 * 365 * 24 * 60 * 60 * 1000);
  
  // 只扫描到今天或目标日期(取较早者)
  const scanLimit = today < endScanDate ? today : endScanDate;
  
  const current = new Date(arrivalDate);
  
  while (current <= scanLimit) {
    const windowEnd = new Date(current);
    windowEnd.setFullYear(windowEnd.getFullYear() + 1);
    windowEnd.setDate(windowEnd.getDate() - 1); // 12个月后的前一天
    
    const departureDays = calculateDepartureDays(departures, current, windowEnd);
    const isCompliant = departureDays <= 180;
    
    let riskLevel: 'safe' | 'warning' | 'critical';
    if (departureDays > 180) {
      riskLevel = 'critical';
    } else if (departureDays >= 150) {
      riskLevel = 'warning';
    } else {
      riskLevel = 'safe';
    }
    
    results.push({
      startDate: formatDate(current),
      endDate: formatDate(windowEnd),
      departureDays,
      isCompliant,
      riskLevel
    });
    
    // 移动到下一天
    current.setDate(current.getDate() + 1);
  }
  
  return results;
}

/**
 * 计算永居资格状态
 */
export function calculateILRStatus(
  departures: Record<string, boolean>,
  arrivalDate: Date,
  visaType: VisaType
): ILRStatus {
  const rollingStats = scanRolling12Months(departures, arrivalDate, visaType);
  
  const violations = rollingStats.filter(s => s.riskLevel === 'critical');
  const warnings = rollingStats.filter(s => s.riskLevel === 'warning');
  
  // 找出当前最严格的滚动12个月离境天数
  const currentRollingDays = Math.max(...rollingStats.map(s => s.departureDays), 0);
  
  // 计算距离永居的天数
  const yearsRequired = visaType === '5-year' ? 5 : 10;
  const targetDate = new Date(arrivalDate);
  targetDate.setFullYear(targetDate.getFullYear() + yearsRequired);
  
  const today = new Date();
  const daysUntilILR = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  // 判断是否符合资格(无违规记录)
  const isEligible = violations.length === 0 && daysUntilILR <= 0;
  
  return {
    isEligible,
    daysUntilILR: Math.max(daysUntilILR, 0),
    currentRollingDays,
    violations,
    warnings
  };
}

/**
 * 推荐最优出境时间
 * 策略:找到未来12个月内,离境天数最少的窗口
 */
export function recommendNextDeparture(
  departures: Record<string, boolean>,
  arrivalDate: Date,
  visaType: VisaType
): RecommendedDeparture | null {
  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setMonth(futureDate.getMonth() + 3); // 未来3个月内
  
  let bestDate: Date | null = null;
  let maxAllowedDays = 0;
  
  const current = new Date(today);
  current.setDate(current.getDate() + 1); // 从明天开始
  
  while (current <= futureDate) {
    // 计算如果从这一天开始离境,12个月窗口内还有多少余额
    const windowStart = new Date(current);
    windowStart.setFullYear(windowStart.getFullYear() - 1);
    windowStart.setDate(windowStart.getDate() + 1);
    
    const existingDays = calculateDepartureDays(departures, windowStart, current);
    const allowedDays = 180 - existingDays;
    
    if (allowedDays > maxAllowedDays) {
      maxAllowedDays = allowedDays;
      bestDate = new Date(current);
    }
    
    current.setDate(current.getDate() + 1);
  }
  
  if (!bestDate || maxAllowedDays <= 0) {
    return null;
  }
  
  return {
    suggestedDate: formatDate(bestDate),
    maxDuration: maxAllowedDays,
    reason: `在此日期离境,12个月滚动窗口内最多可离境 ${maxAllowedDays} 天`
  };
}

/**
 * 格式化日期为 YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 解析 YYYY-MM-DD 字符串为 Date
 */
export function parseDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00');
}

/**
 * 获取月份的所有日期
 */
export function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const date = new Date(year, month, 1);
  
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  
  return days;
}

/**
 * 获取日期所在月份的第一天是星期几 (0=Sunday, 6=Saturday)
 */
export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}
