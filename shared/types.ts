// 签证类型
export type VisaType = '5-year' | '10-year';

// 用户配置数据
export interface UserConfig {
  visaType: VisaType;
  arrivalDate: string; // ISO 8601 format: YYYY-MM-DD
  targetILRDate?: string; // 计算得出的永居申请日期
}

// 离境记录
export interface DepartureRecord {
  date: string; // ISO 8601 format: YYYY-MM-DD
  isDeparture: boolean; // true = 离境, false = 在英国
}

// 滚动12个月窗口统计
export interface Rolling12MonthStats {
  startDate: string;
  endDate: string;
  departureDays: number;
  isCompliant: boolean; // 是否符合 ≤180 天规则
  riskLevel: 'safe' | 'warning' | 'critical'; // safe: <150, warning: 150-180, critical: >180
}

// 永居资格状态
export interface ILRStatus {
  isEligible: boolean;
  daysUntilILR: number;
  currentRollingDays: number; // 当前最严格的滚动12个月离境天数
  violations: Rolling12MonthStats[]; // 所有违规的12个月窗口
  warnings: Rolling12MonthStats[]; // 所有临界风险的12个月窗口
}

// 推荐的出境时间
export interface RecommendedDeparture {
  suggestedDate: string;
  maxDuration: number; // 建议的最长离境天数
  reason: string;
}

// 应用状态
export interface AppState {
  config: UserConfig | null;
  departures: Record<string, boolean>; // key: YYYY-MM-DD, value: isDeparture
  isInitialized: boolean;
}
