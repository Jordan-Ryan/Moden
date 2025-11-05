import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import {
  isHealthKitAvailable,
  checkHealthKitPermissions,
  requestHealthKitPermissions,
  getHealthDataForDate,
  DailyHealthData,
} from '../utils/healthKit';

type HealthContextValue = {
  date: Date;
  loading: boolean;
  error: string | null;
  permissionsGranted: boolean;
  data: DailyHealthData | null;
  refresh: () => Promise<void>;
  setDate: (d: Date) => void;
  moveDay: (delta: number) => void;
};

const HealthContext = createContext<HealthContextValue | undefined>(undefined);

export const useHealth = (): HealthContextValue => {
  const ctx = useContext(HealthContext);
  if (!ctx) throw new Error('useHealth must be used within HealthProvider');
  return ctx;
};

export const HealthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [date, setDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [data, setData] = useState<DailyHealthData | null>(null);

  const ensurePermissions = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== 'ios' || !isHealthKitAvailable()) {
      setError('HealthKit is unavailable on this device.');
      return false;
    }
    const has = await checkHealthKitPermissions();
    if (has) return true;
    const granted = await requestHealthKitPermissions();
    return granted || (await checkHealthKitPermissions());
  }, []);

  const load = useCallback(async (targetDate: Date) => {
    try {
      setLoading(true);
      setError(null);
      const ok = await ensurePermissions();
      setPermissionsGranted(ok);
      if (!ok) return;
      const d = await getHealthDataForDate(targetDate);
      if (!d) throw new Error('No data returned');
      setData(d);
    } catch (e) {
      console.error('Failed to load health data', e);
      setError('Failed to load health data');
    } finally {
      setLoading(false);
    }
  }, [ensurePermissions]);

  const refresh = useCallback(async () => {
    await load(date);
  }, [date, load]);

  const moveDay = useCallback((delta: number) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + delta);
    setDate(newDate);
  }, [date]);

  useEffect(() => {
    load(date);
  }, [date, load]);

  const value = useMemo<HealthContextValue>(() => ({
    date,
    loading,
    error,
    permissionsGranted,
    data,
    refresh,
    setDate,
    moveDay,
  }), [date, loading, error, permissionsGranted, data, refresh, setDate, moveDay]);

  return <HealthContext.Provider value={value}>{children}</HealthContext.Provider>;
};


