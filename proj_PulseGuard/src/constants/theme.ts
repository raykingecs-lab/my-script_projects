export const COLORS = {
  primary: '#2196F3',
  background: '#FFFFFF',
  text: '#121212',
  textSecondary: '#616161',
  
  // 血压语义颜色 (PRD 2.0)
  normal: '#4CAF50', // 🟢 正常 (<120/80)
  preHigh: '#FFC107', // 🟡 正常高值 (130-139 / 80-89)
  high: '#F44336', // 🔴 高血压 (≥140/90)
  
  divider: '#EEEEEE',
  white: '#FFFFFF',
};

export const SIZES = {
  hero: 48,      // 状态英雄位
  title: 36,     // 关键数值
  body: 22,      // 正文 (PRD 要求不小于 18pt)
  caption: 18,   // 辅助文本
  radius: 12,
  padding: 20,
};

export const getBPStatusColor = (systolic: number, diastolic: number) => {
  if (systolic >= 140 || diastolic >= 90) return COLORS.high;
  if (systolic >= 130 || diastolic >= 80) return COLORS.preHigh;
  return COLORS.normal;
};
