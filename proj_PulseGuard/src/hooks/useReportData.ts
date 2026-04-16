import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { initDatabase, getHistoryForChart, BPRecord } from '../database/db';

export const useReportData = () => {
  const [sysData, setSysData] = useState<any[]>([]);
  const [diaData, setDiaData] = useState<any[]>([]);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);

  const formatData = useCallback(async () => {
    try {
      const db = await initDatabase();
      const records = await getHistoryForChart(db);

      // 过滤逻辑
      const filteredRecords = filter 
        ? records.filter(r => r.note && r.note.includes(filter)) 
        : records;

      const formattedSys = filteredRecords.map((r: BPRecord) => {
        const date = new Date(r.created_at);
        // JS 的 getHours() 会根据当前设备时区自动转换，因此这里是正确的本地小时
        const hour = date.getHours();
        
        let iconType = '';
        if (hour >= 6 && hour <= 10) iconType = 'sun';
        else if (hour >= 20 || hour <= 2) iconType = 'moon';

        return {
          value: r.systolic,
          label: `${date.getMonth() + 1}/${date.getDate()}`,
          iconType,
          hasNote: !!(r.note && r.note.trim()),
          fullNote: r.note || '',
          dateStr: `${date.getMonth() + 1}/${date.getDate()}`,
          timeStr: `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
          diastolicValue: r.diastolic,
          isSys: true // 标识这是收缩压数据点
        };
      });

      const formattedDia = filteredRecords.map((r: BPRecord) => ({
        value: r.diastolic,
        isDia: true // 标识这是舒张压数据点
      }));

      const list = records.map((r: BPRecord) => {
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
  }, [filter]);

  useFocusEffect(
    useCallback(() => {
      formatData();
    }, [formatData])
  );

  return { sysData, diaData, historyList, loading, filter, setFilter };
};
