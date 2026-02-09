/**
 * 日期工具函数库
 * 用于处理日期计算、格式化和比较
 */

/**
 * 给日期加上指定天数
 * @param dateStr - YYYY-MM-DD 格式的日期字符串
 * @param days - 要加的天数(可以是负数)
 * @returns YYYY-MM-DD 格式的新日期字符串
 */
export function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

/**
 * 计算两个日期之间的天数差
 * @param startDate - YYYY-MM-DD 格式的开始日期
 * @param endDate - YYYY-MM-DD 格式的结束日期
 * @returns 天数差(包含起止日期)
 */
export function daysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // 包含起止日期
}

/**
 * 判断两个日期是否连续(相差1天)
 * @param date1 - YYYY-MM-DD 格式的日期1
 * @param date2 - YYYY-MM-DD 格式的日期2
 * @returns 是否连续
 */
export function areConsecutive(date1: string, date2: string): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return diffDays === 1;
}

/**
 * 判断日期是否在时间段内
 * @param date - YYYY-MM-DD 格式的日期
 * @param startDate - YYYY-MM-DD 格式的开始日期
 * @param endDate - YYYY-MM-DD 格式的结束日期
 * @returns 是否在时间段内
 */
export function isDateInRange(date: string, startDate: string, endDate: string): boolean {
  return date >= startDate && date <= endDate;
}

/**
 * 获取日期的前一天
 * @param dateStr - YYYY-MM-DD 格式的日期字符串
 * @returns YYYY-MM-DD 格式的前一天日期
 */
export function getPreviousDay(dateStr: string): string {
  return addDays(dateStr, -1);
}

/**
 * 获取日期的后一天
 * @param dateStr - YYYY-MM-DD 格式的日期字符串
 * @returns YYYY-MM-DD 格式的后一天日期
 */
export function getNextDay(dateStr: string): string {
  return addDays(dateStr, 1);
}

/**
 * 生成日期范围内的所有日期
 * @param startDate - YYYY-MM-DD 格式的开始日期
 * @param endDate - YYYY-MM-DD 格式的结束日期
 * @returns 日期数组
 */
export function getDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  let currentDate = startDate;
  
  while (currentDate <= endDate) {
    dates.push(currentDate);
    currentDate = getNextDay(currentDate);
  }
  
  return dates;
}
