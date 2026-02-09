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

  // 切换离境状态
  const toggleDeparture = (date: string) => {
    const newDepartures = { ...state.departures };
    
    if (newDepartures[date]) {
      delete newDepartures[date];
    } else {
      newDepartures[date] = true;
    }
    
    saveDepartures(newDepartures);
    setState(prev => ({ ...prev, departures: newDepartures }));
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
