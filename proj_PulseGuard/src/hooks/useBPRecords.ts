import { useState, useEffect } from 'react';
import * as SQLite from 'expo-sqlite';
import { initDatabase, insertRecord } from '../database/db';

export const useBPRecords = () => {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);

  useEffect(() => {
    initDatabase().then(setDb).catch(console.error);
  }, []);

  /**
   * 保存一组测量数据 (支持多手臂混合录入)
   */
  const saveMeasurementGroup = async (
    measurements: Array<{ systolic: number; diastolic: number; pulse: number; arm: 'L' | 'R' }>,
    notes: string[]
  ) => {
    if (!db || measurements.length === 0) return false;

    try {
      const groupId = `G_${Date.now()}`;
      const createdAt = new Date().toISOString();
      const noteString = notes.join(', ');

      // 1. 插入所有原始明细记录
      for (const m of measurements) {
        await insertRecord(db, {
          group_id: groupId,
          systolic: m.systolic,
          diastolic: m.diastolic,
          pulse: m.pulse,
          arm: m.arm, // 使用记录自带的手臂属性
          note: noteString,
          created_at: createdAt,
          is_avg_group: false,
        });
      }

      // 2. 按手臂分组并计算平均值
      const armsPresent = Array.from(new Set(measurements.map(m => m.arm)));

      for (const currentArm of armsPresent) {
        const armMeasurements = measurements.filter(m => m.arm === currentArm);
        const count = armMeasurements.length;
        
        const avgSys = Math.round(armMeasurements.reduce((acc, cur) => acc + cur.systolic, 0) / count);
        const avgDia = Math.round(armMeasurements.reduce((acc, cur) => acc + cur.diastolic, 0) / count);
        const avgPulse = Math.round(armMeasurements.reduce((acc, cur) => acc + cur.pulse, 0) / count);

        // 3. 为每个手臂插入一条对应的汇总记录
        await insertRecord(db, {
          group_id: groupId,
          systolic: avgSys,
          diastolic: avgDia,
          pulse: avgPulse,
          arm: currentArm,
          note: noteString,
          created_at: createdAt,
          is_avg_group: true,
        });
      }

      return true;
    } catch (error) {
      console.error('Failed to save group:', error);
      return false;
    }
  };

  return {
    saveMeasurementGroup,
    isReady: !!db
  };
};
