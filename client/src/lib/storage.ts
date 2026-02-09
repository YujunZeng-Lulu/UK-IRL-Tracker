/**
 * 本地存储管理 - localStorage 封装
 * 所有数据存储在用户浏览器本地,无需服务器
 */

import type { UserConfig, AppState, DeparturePeriod } from '@/../../shared/types';

const STORAGE_KEYS = {
  CONFIG: 'ilr-tracker-config',
  DEPARTURES: 'ilr-tracker-departures',
  PERIODS: 'ilr-tracker-periods',
  INITIALIZED: 'ilr-tracker-initialized'
} as const;

/**
 * 保存用户配置
 */
export function saveConfig(config: UserConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save config:', error);
  }
}

/**
 * 读取用户配置
 */
export function loadConfig(): UserConfig | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CONFIG);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load config:', error);
    return null;
  }
}

/**
 * 保存离境记录
 */
export function saveDepartures(departures: Record<string, boolean>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DEPARTURES, JSON.stringify(departures));
  } catch (error) {
    console.error('Failed to save departures:', error);
  }
}

/**
 * 读取离境记录
 */
export function loadDepartures(): Record<string, boolean> {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DEPARTURES);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Failed to load departures:', error);
    return {};
  }
}

/**
 * 标记应用已初始化
 */
export function markInitialized(): void {
  localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
}

/**
 * 检查应用是否已初始化
 */
export function isInitialized(): boolean {
  return localStorage.getItem(STORAGE_KEYS.INITIALIZED) === 'true';
}

/**
 * 保存离境时间段
 */
export function saveDeparturePeriods(periods: DeparturePeriod[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PERIODS, JSON.stringify(periods));
  } catch (error) {
    console.error('Failed to save departure periods:', error);
  }
}

/**
 * 读取离境时间段
 */
export function loadDeparturePeriods(): DeparturePeriod[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PERIODS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load departure periods:', error);
    return [];
  }
}

/**
 * 加载完整的应用状态
 */
export function loadAppState(): AppState {
  return {
    config: loadConfig(),
    departures: loadDepartures(),
    departurePeriods: loadDeparturePeriods(),
    isInitialized: isInitialized()
  };
}

/**
 * 清除所有数据(重置应用)
 */
export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}

/**
 * 导出数据为JSON(用于备份)
 */
export function exportData(): string {
  const state = loadAppState();
  return JSON.stringify(state, null, 2);
}

/**
 * 从JSON导入数据(用于恢复)
 */
export function importData(jsonStr: string): boolean {
  try {
    const state: AppState = JSON.parse(jsonStr);
    
    if (state.config) {
      saveConfig(state.config);
    }
    
    if (state.departures) {
      saveDepartures(state.departures);
    }
    
    if (state.departurePeriods) {
      saveDeparturePeriods(state.departurePeriods);
    }
    
    if (state.isInitialized) {
      markInitialized();
    }
    
    return true;
  } catch (error) {
    console.error('Failed to import data:', error);
    return false;
  }
}
