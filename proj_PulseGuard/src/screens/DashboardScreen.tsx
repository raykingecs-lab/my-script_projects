import React from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Theme } from '../constants/Theme';
import { ScaledText } from '../components/common/ScaledText';
import { useDashboardStats } from '../hooks/useDashboardStats';

export const DashboardScreen = () => {
  const { latestL, latestR, range, morningAvg, conclusion, loading, getStatusColor } = useDashboardStats();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  const getColor = () => {
    const lColor = latestL ? getStatusColor(latestL.systolic, latestL.diastolic) : Theme.colors.success;
    const rColor = latestR ? getStatusColor(latestR.systolic, latestR.diastolic) : Theme.colors.success;
    if (lColor === Theme.colors.danger || rColor === Theme.colors.danger) return Theme.colors.danger;
    if (lColor === Theme.colors.warning || rColor === Theme.colors.warning) return Theme.colors.warning;
    return Theme.colors.success;
  };

  const heroBgColor = (!latestL && !latestR) ? Theme.colors.card : getColor();

  const renderHeroValue = (label: string, record: any) => (
    <View style={styles.heroSubSection}>
      <View style={styles.heroLabelRow}>
        <ScaledText bold type="caption" color={Theme.colors.white}>{label}</ScaledText>
      </View>
      {record ? (
        <View style={styles.heroValueRow}>
          <ScaledText bold type="title" color={Theme.colors.white} style={styles.heroNumber}>
            {record.systolic}/{record.diastolic}
          </ScaledText>
          <ScaledText type="body" color={Theme.colors.white} style={{ marginLeft: 8 }}>
            mmHg
          </ScaledText>
        </View>
      ) : (
        <ScaledText type="body" color={Theme.colors.white} style={{ opacity: 0.8 }}>
          暂无数据
        </ScaledText>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ScaledText bold type="title" style={styles.header}>脉安 (PulseGuard)</ScaledText>

      {/* 1. 状态英雄位 */}
      <View style={[styles.heroCard, { backgroundColor: heroBgColor }]}>
        <ScaledText bold type="caption" color={Theme.colors.white} style={{ marginBottom: 16 }}>
          最新一次测量 (左/右手)
        </ScaledText>
        {renderHeroValue("左手测量", latestL)}
        <View style={styles.heroHorizontalDivider} />
        {renderHeroValue("右手测量", latestR)}
      </View>

      {/* 2. 健康结论区 (环比对比结论) */}
      <View style={[styles.infoCard, { borderColor: Theme.colors.primary, borderWidth: 1 }]}>
        <ScaledText bold type="caption" color={Theme.colors.primary}>本周健康分析结论</ScaledText>
        <ScaledText bold type="body" style={{ marginTop: 8, lineHeight: 32 }}>
          {conclusion}
        </ScaledText>
      </View>

      {/* 3. 清晨风险监测 */}
      <View style={styles.infoCard}>
        <ScaledText type="caption" color={Theme.colors.textSecondary}>清晨血压均值 (06:00-10:00)</ScaledText>
        <ScaledText bold type="body" color={morningAvg.avg_sys >= 135 ? Theme.colors.danger : Theme.colors.text}>
          {morningAvg.avg_sys > 0 ? `${morningAvg.avg_sys}/${morningAvg.avg_dia} mmHg` : '本周暂未监测到'}
        </ScaledText>
      </View>

      {/* 4. 本周波动范围 (基本盘参考，移至末尾) */}
      <View style={styles.infoCard}>
        <ScaledText type="caption" color={Theme.colors.textSecondary}>本周波动范围 (最低~最高)</ScaledText>
        {range.max_sys > 0 ? (
          <ScaledText bold type="body">
            {range.min_sys}/{range.min_dia} ~ {range.max_sys}/{range.max_dia}
          </ScaledText>
        ) : (
          <ScaledText type="body">数据不足</ScaledText>
        )}
      </View>

      {/* 提示信息 */}
      <View style={styles.tipContainer}>
        <ScaledText type="caption" color={Theme.colors.textSecondary} center>
          提示：左右手臂血压差异超过 20 mmHg 建议咨询医生。
        </ScaledText>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  content: { padding: Theme.spacing.md, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { marginVertical: Theme.spacing.lg },
  heroCard: {
    padding: Theme.spacing.lg,
    borderRadius: 28,
    minHeight: 220,
    justifyContent: 'center',
    marginBottom: Theme.spacing.lg,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  heroSubSection: { paddingVertical: 8 },
  heroLabelRow: { marginBottom: 4 },
  heroValueRow: { flexDirection: 'row', alignItems: 'baseline' },
  heroNumber: { fontSize: 42 },
  heroHorizontalDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 12,
  },
  infoCard: {
    backgroundColor: Theme.colors.card,
    padding: Theme.spacing.lg,
    borderRadius: 20,
    marginBottom: Theme.spacing.md,
  },
  tipContainer: { marginTop: Theme.spacing.xl, paddingHorizontal: Theme.spacing.md }
});
