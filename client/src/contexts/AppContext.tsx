/**
 * 日本极简主义 - 应用上下文
 * 管理全局状态和本地存储
 */

import { createContext, useContext, useState, ReactNode } from 'react';
import {
  loadAppState,
  saveConfig,
  saveDepartures,
  markInitialized,
  clearAllData,
} from '@/lib/storage';
import type { AppState, UserConfig } from '@/../../shared/types';

interface AppContextType {
  state: AppState;
  updateConfig: (config: UserConfig) => void;
  toggleDeparture: (date: string) => void;
  batchToggleDepartures: (dates: string[]) => void;
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

  // 标记初始化完成
  const initialize = () => {
    markInitialized();
    setState(prev => ({ ...prev, initialized: true }));
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
