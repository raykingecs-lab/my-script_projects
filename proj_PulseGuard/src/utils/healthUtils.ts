/**
 * 根据血压数值获取健康状态及对应的色彩配置
 * 标准参考：收缩压 140 / 舒张压 90 为高血压门槛
 */
export const getBPStatus = (sys: number, dia: number) => {
  // 偏高 (红色)
  if (sys >= 140 || dia >= 90) {
    return { 
      label: '偏高', 
      color: '#ff453a', 
      bg: '#ffebee' 
    };
  }
  
  // 临界/预警 (橙色)
  if (sys >= 130 || dia >= 85) {
    return { 
      label: '临界', 
      color: '#ff9500', 
      bg: '#fff3e0' 
    };
  }
  
  // 正常 (绿色)
  return { 
    label: '正常', 
    color: '#4caf50', 
    bg: '#e8f5e9' 
  };
};
