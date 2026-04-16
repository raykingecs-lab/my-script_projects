import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { initDatabase, getHistoryForChart, BPRecord } from '../database/db';

export type TimeRange = '7days' | '30days' | 'all';

export const useReportData = () => {
  const [sysData, setSysData] = useState<any[]>([]);
  const [diaData, setDiaData] = useState<any[]>([]);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('7days');

  const formatData = useCallback(async () => {
    try {
      setLoading(true);
      const db = await initDatabase();
      const allRecords = await getHistoryForChart(db);

      // 1. 时间跨度过滤
      let filteredByTime = allRecords;
      if (timeRange !== 'all') {
        const now = new Date();
        const days = timeRange === '7days' ? 7 : 30;
        const cutoff = new Date(now.setDate(now.getDate() - days));
        filteredByTime = allRecords.filter(r => new Date(r.created_at) >= cutoff);
      }

      // 2. 备注过滤
      const filteredRecords = filter 
        ? filteredByTime.filter(r => r.note && r.note.includes(filter)) 
        : filteredByTime;

      // 3. 数据处理逻辑：7天展示原始数据，30天/全部展示日平均值
      let displayRecords: any[] = [];
      
      if (timeRange === '7days') {
        displayRecords = filteredRecords.map(r => ({
          systolic: r.systolic,
          diastolic: r.diastolic,
          date: new Date(r.created_at),
          raw: r
        }));
      } else {
        // 按日期聚合
        const grouped: { [key: string]: { sys: number[], dia: number[], date: Date } } = {};
        filteredRecords.forEach(r => {
          const d = new Date(r.created_at);
          const dateStr = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
          if (!grouped[dateStr]) grouped[dateStr] = { sys: [], dia: [], date: d };
          grouped[dateStr].sys.push(r.systolic);
          grouped[dateStr].dia.push(r.diastolic);
        });

        displayRecords = Object.values(grouped).map(g => ({
          systolic: Math.round(g.sys.reduce((a, b) => a + b, 0) / g.sys.length),
          diastolic: Math.round(g.dia.reduce((a, b) => a + b, 0) / g.dia.length),
          date: g.date,
          isAggregated: true
        }));
      }

      const formattedSys = displayRecords.map((r: any) => {
        const date = r.date;
        const hour = date.getHours();
        
        let iconType = '';
        if (!r.isAggregated) {
          if (hour >= 6 && hour <= 10) iconType = 'sun';
          else if (hour >= 20 || hour <= 2) iconType = 'moon';
        }

        return {
          value: r.systolic,
          label: `${date.getMonth() + 1}/${date.getDate()}`,
          iconType,
          dateStr: `${date.getMonth() + 1}/${date.getDate()}`,
          timeStr: r.isAggregated ? '全天平均' : `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
          diastolicValue: r.diastolic,
          fullNote: r.raw?.note || '',
        };
      });

      const formattedDia = displayRecords.map((r: any) => ({
        value: r.diastolic,
      }));

      // 列表依然展示明细
      const list = filteredRecords.slice(-30).map((r: BPRecord) => {
        const date = new Date(r.created_at);
        return {
          ...r,
          dateLabel: `${date.getMonth() + 1}/${date.getDate()}`,
          timeLabel: `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
        };
      }).reverse();

      setSysData(formattedSys);
      setDiaData(formattedDia);
      setHistoryList(list);
      setLoading(false);
    } catch (error) {
      console.error('Report data error:', error);
      setLoading(false);
    }
  }, [filter, timeRange]);

  useFocusEffect(
    useCallback(() => {
      formatData();
    }, [formatData])
  );

  return { sysData, diaData, historyList, loading, filter, setFilter, timeRange, setTimeRange };
};
