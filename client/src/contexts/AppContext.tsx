/**
 * 日本极简主义 - 应用上下文
 * 管理全局状态和本地存储
 */

import { createContext, useContext, useState, ReactNode } from 'react';
import {
  loadAppState,
  saveConfig,
  saveDepartures,
  saveDeparturePeriods,
  markInitialized,
  clearAllData,
} from '@/lib/storage';
import {
  getPreviousDay,
  getNextDay,
  daysBetween,
  getDateRange,
} from '@/lib/dateUtils';
import type { AppState, UserConfig, DeparturePeriod } from '@/../../shared/types';

interface AppContextType {
  state: AppState;
  updateConfig: (config: UserConfig) => void;
  toggleDeparture: (date: string) => void;
  batchToggleDepartures: (dates: string[]) => void;
  addDeparturePeriod: (startDate: string, endDate: string) => void;
  updateDeparturePeriod: (id: string, startDate: string, endDate: string) => void;
  deleteDeparturePeriod: (id: string) => void;
  initialize: () => void;
  reset: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadAppState());

  // 保存配置
  const updateConfig = (config: UserConfig) => {
    saveConfig(config);
    setState(prev => ({ ...prev, config }));
  };

  // 切换离境状态(支持智能聚合)
  const toggleDeparture = (date: string) => {
    const newDepartures = { ...state.departures };
    let newPeriods = [...state.departurePeriods];
    
    if (newDepartures[date]) {
      // 取消标记:需要处理时间段拆分
      delete newDepartures[date];
      
      // 查找包含此日期的时间段
      const periodIndex = newPeriods.findIndex(
        p => date >= p.startDate && date <= p.endDate
      );
      
      if (periodIndex !== -1) {
        const period = newPeriods[periodIndex];
        
        if (period.startDate === date && period.endDate === date) {
          // 场景1: 单日记录,直接删除
          newPeriods.splice(periodIndex, 1);
        } else if (period.startDate === date) {
          // 场景2: 取消起始日,缩短时间段
          const newStartDate = getNextDay(date);
          newPeriods[periodIndex] = {
            ...period,
            startDate: newStartDate,
            days: daysBetween(newStartDate, period.endDate),
          };
        } else if (period.endDate === date) {
          // 场景3: 取消结束日,缩短时间段
          const newEndDate = getPreviousDay(date);
          newPeriods[periodIndex] = {
            ...period,
            endDate: newEndDate,
            days: daysBetween(period.startDate, newEndDate),
          };
        } else {
          // 场景4: 取消中间日,拆分为两个时间段
          const period1EndDate = getPreviousDay(date);
          const period2StartDate = getNextDay(date);
          
          newPeriods[periodIndex] = {
            ...period,
            endDate: period1EndDate,
            days: daysBetween(period.startDate, period1EndDate),
          };
          
          newPeriods.push({
            id: `split-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            startDate: period2StartDate,
            endDate: period.endDate,
            days: daysBetween(period2StartDate, period.endDate),
            createdAt: new Date().toISOString(),
          });
        }
      }
    } else {
      // 标记:检查是否可以与现有时间段合并
      newDepartures[date] = true;
      
      const prevDay = getPreviousDay(date);
      const nextDay = getNextDay(date);
      
      // 查找与前一天或后一天相邻的时间段
      const prevPeriodIndex = newPeriods.findIndex(p => p.endDate === prevDay);
      const nextPeriodIndex = newPeriods.findIndex(p => p.startDate === nextDay);
      
      if (prevPeriodIndex !== -1 && nextPeriodIndex !== -1) {
        // 场景1: 连接两个时间段,合并为一个大时间段
        const prevPeriod = newPeriods[prevPeriodIndex];
        const nextPeriod = newPeriods[nextPeriodIndex];
        
        newPeriods[prevPeriodIndex] = {
          ...prevPeriod,
          endDate: nextPeriod.endDate,
          days: daysBetween(prevPeriod.startDate, nextPeriod.endDate),
        };
        
        // 删除被合并的后一个时间段
        newPeriods.splice(nextPeriodIndex, 1);
      } else if (prevPeriodIndex !== -1) {
        // 场景2: 扩展前一个时间段
        const prevPeriod = newPeriods[prevPeriodIndex];
        newPeriods[prevPeriodIndex] = {
          ...prevPeriod,
          endDate: date,
          days: daysBetween(prevPeriod.startDate, date),
        };
      } else if (nextPeriodIndex !== -1) {
        // 场景3: 扩展后一个时间段
        const nextPeriod = newPeriods[nextPeriodIndex];
        newPeriods[nextPeriodIndex] = {
          ...nextPeriod,
          startDate: date,
          days: daysBetween(date, nextPeriod.endDate),
        };
      } else {
        // 场景4: 创建新的单日记录
        newPeriods.push({
          id: `single-${date}-${Date.now()}`,
          startDate: date,
          endDate: date,
          days: 1,
          createdAt: new Date().toISOString(),
        });
      }
    }
    
    // 一次性更新所有状态
    saveDepartures(newDepartures);
    saveDeparturePeriods(newPeriods);
    setState(prev => ({ ...prev, departures: newDepartures, departurePeriods: newPeriods }));
  };

  // 批量切换离境状态
  const batchToggleDepartures = (dates: string[]) => {
    const newDepartures = { ...state.departures };
    
    dates.forEach(date => {
      if (!newDepartures[date]) {
        newDepartures[date] = true;
      }
    });
    
    saveDepartures(newDepartures);
    setState(prev => ({ ...prev, departures: newDepartures }));
  };

  // 添加离境时间段
  const addDeparturePeriod = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    const newPeriod: DeparturePeriod = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      startDate,
      endDate,
      days,
      createdAt: new Date().toISOString()
    };
    
    const newPeriods = [...state.departurePeriods, newPeriod];
    saveDeparturePeriods(newPeriods);
    setState(prev => ({ ...prev, departurePeriods: newPeriods }));
    
    // 同时批量标记日期
    const dates: string[] = [];
    const current = new Date(startDate);
    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    batchToggleDepartures(dates);
  };

  // 更新离境时间段
  const updateDeparturePeriod = (id: string, startDate: string, endDate: string) => {
    const periodIndex = state.departurePeriods.findIndex(p => p.id === id);
    if (periodIndex === -1) return;
    
    const oldPeriod = state.departurePeriods[periodIndex];
    
    // 删除旧时间段的标记
    const oldDates: string[] = [];
    const oldStart = new Date(oldPeriod.startDate);
    const oldEnd = new Date(oldPeriod.endDate);
    const current = new Date(oldStart);
    while (current <= oldEnd) {
      oldDates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    
    const newDepartures = { ...state.departures };
    oldDates.forEach(date => {
      delete newDepartures[date];
    });
    
    // 计算新天数
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // 更新时间段
    const updatedPeriod: DeparturePeriod = {
      ...oldPeriod,
      startDate,
      endDate,
      days
    };
    
    const newPeriods = [...state.departurePeriods];
    newPeriods[periodIndex] = updatedPeriod;
    
    // 添加新时间段的标记
    const newDates: string[] = [];
    const newCurrent = new Date(startDate);
    while (newCurrent <= end) {
      const dateStr = newCurrent.toISOString().split('T')[0];
      newDates.push(dateStr);
      newDepartures[dateStr] = true;
      newCurrent.setDate(newCurrent.getDate() + 1);
    }
    
    saveDeparturePeriods(newPeriods);
    saveDepartures(newDepartures);
    setState(prev => ({ ...prev, departurePeriods: newPeriods, departures: newDepartures }));
  };

  // 删除离境时间段
  const deleteDeparturePeriod = (id: string) => {
    const period = state.departurePeriods.find(p => p.id === id);
    if (!period) return;
    
    // 删除时间段的所有标记
    const dates: string[] = [];
    const start = new Date(period.startDate);
    const end = new Date(period.endDate);
    const current = new Date(start);
    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    
    const newDepartures = { ...state.departures };
    dates.forEach(date => {
      delete newDepartures[date];
    });
    
    const newPeriods = state.departurePeriods.filter(p => p.id !== id);
    
    saveDeparturePeriods(newPeriods);
    saveDepartures(newDepartures);
    setState(prev => ({ ...prev, departurePeriods: newPeriods, departures: newDepartures }));
  };

  // 标记初始化完成
  const initialize = () => {
    markInitialized();
    setState(prev => ({ ...prev, isInitialized: true }));
  };

  // 重置所有数据
  const reset = () => {
    clearAllData();
    setState(loadAppState());
  };

  return (
    <AppContext.Provider
      value={{
        state,
        updateConfig,
        toggleDeparture,
        batchToggleDepartures,
        addDeparturePeriod,
        updateDeparturePeriod,
        deleteDeparturePeriod,
        initialize,
        reset,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
