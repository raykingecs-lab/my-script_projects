import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { initDatabase, getLatestByArm, getWeeklyRange, getMorningAverage, getComparisonStats, BPRecord } from '../database/db';
import { Theme } from '../constants/Theme';

export const useDashboardStats = () => {
  const [latestL, setLatestL] = useState<BPRecord | null>(null);
  const [latestR, setLatestR] = useState<BPRecord | null>(null);
  const [range, setRange] = useState({ max_sys: 0, min_sys: 0, max_dia: 0, min_dia: 0 });
  const [morningAvg, setMorningAvg] = useState({ avg_sys: 0, avg_dia: 0 });
  const [conclusion, setConclusion] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const db = await initDatabase();
      
      const [lRec, rRec, weeklyRange, morning, comp] = await Promise.all([
        getLatestByArm(db, 'L'),
        getLatestByArm(db, 'R'),
        getWeeklyRange(db),
        getMorningAverage(db),
        getComparisonStats(db),
      ]);

      setLatestL(lRec);
      setLatestR(rRec);
      if (weeklyRange) setRange(weeklyRange);
      if (morning) setMorningAvg({ avg_sys: Math.round(morning.avg_sys), avg_dia: Math.round(morning.avg_dia) });

      // --- 升级版结论生成逻辑 ---
      if (comp.thisWeekAvg && comp.thisWeekDiaAvg) {
        const avgSys = Math.round(comp.thisWeekAvg);
        const avgDia = Math.round(comp.thisWeekDiaAvg);
        
        // A. 数值与评价
        let statusText = '';
        if (avgSys >= 140 || avgDia >= 90) statusText = '已达到高血压预警线';
        else if (avgSys >= 130 || avgDia >= 80) statusText = '处于正常高值区间';
        else if (avgSys < 120 && avgDia < 80) statusText = '处于理想水平';
        else statusText = '处于正常范围';

        let text = `本周平均血压 ${avgSys}/${avgDia}，${statusText}。`;
        
        // B. 环比部分
        if (comp.lastWeekAvg > 0) {
          const diff = Math.round(comp.thisWeekAvg - comp.lastWeekAvg);
          if (diff > 0) text += `比上周升高了 ${diff}。`;
          else if (diff < 0) text += `比上周下降了 ${Math.abs(diff)}。`;
        }

        // C. 风险预警 (二选一)
        if (morning && morning.avg_sys >= 135) {
          text += `清晨血压偏高，建议规律作息。`;
        } else if (weeklyRange && (weeklyRange.max_sys - weeklyRange.min_sys) > 30) {
          text += `近期波动较大，请多休息。`;
        } else {
          text += `整体状况稳健，请继续保持。`;
        }
        
        setConclusion(text);
      } else {
        setConclusion('暂无足够数据生成结论，请继续录入。');
      }

      setLoading(false);
    } catch (error) {
      console.error('Fetch stats error:', error);
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  const getStatusColor = (sys: number, dia: number) => {
    if (sys >= 140 || dia >= 90) return Theme.colors.danger;
    if (sys >= 130 || dia >= 80) return Theme.colors.warning;
    return Theme.colors.success;
  };

  return { latestL, latestR, range, morningAvg, conclusion, loading, getStatusColor };
};
