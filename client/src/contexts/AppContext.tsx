/**
 * 日本极简主义 - 应用状态管理
 * 使用 React Context 管理全局状态
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { UserConfig, AppState } from '@/../../shared/types';
import { loadAppState, saveConfig, saveDepartures, markInitialized } from '@/lib/storage';

interface AppContextType {
  state: AppState;
  updateConfig: (config: UserConfig) => void;
  toggleDeparture: (date: string) => void;
  initialize: () => void;
  resetApp: () => void;
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

  // 标记初始化完成
  const initialize = () => {
    markInitialized();
    setState(prev => ({ ...prev, isInitialized: true }));
  };

  // 重置应用
  const resetApp = () => {
    localStorage.clear();
    setState({
      config: null,
      departures: {},
      isInitialized: false
    });
  };

  return (
    <AppContext.Provider value={{ state, updateConfig, toggleDeparture, initialize, resetApp }}>
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
