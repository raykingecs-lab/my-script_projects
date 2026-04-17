import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, Dimensions, TouchableOpacity, Modal } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { Theme } from '../constants/Theme';
import { ScaledText } from '../components/common/ScaledText';
import { useReportData, TimeRange } from '../hooks/useReportData';
import { getBPStatus } from '../utils/healthUtils';

const screenWidth = Dimensions.get('window').width;
const QUICK_FILTERS = ['服药后', '刚运动', '感冒中', '情绪波动'];
const TIME_RANGES: { label: string; value: TimeRange }[] = [
  { label: '7天明细', value: '7days' },
  { label: '30天趋势', value: '30days' },
  { label: '全部趋势', value: 'all' },
];

export const ReportsScreen = () => {
  const { sysData, diaData, historyList, loading, filter, setFilter, timeRange, setTimeRange } = useReportData();
  const [selectedPoint, setSelectedGroup] = useState<any>(null);

  // 动态计算间距，使图表宽度始终固定为屏幕宽度，实现零滚动适配
  const chartConfig = useMemo(() => {
    const count = sysData.length;
    const availableWidth = screenWidth - 95; 
    const spacing = count > 1 ? availableWidth / (count - 1) : availableWidth;

    return {
      spacing: Math.max(spacing, 6), 
      isDense: count > 15,
    };
  }, [sysData.length]);

  // 核心优化：使用 labelComponent 彻底解决 4/... 的截断问题
  const processedSysData = useMemo(() => {
    const count = sysData.length;
    if (count === 0) return [];

    const renderLabel = (label: string) => (
      <View style={{ width: 60, marginLeft: -25, alignItems: 'center', justifyContent: 'center' }}>
        <ScaledText type="caption" style={{ fontSize: 10, color: Theme.colors.textSecondary }}>{label}</ScaledText>
      </View>
    );

    if (timeRange === '7days') {
      let lastDate = '';
      return sysData.map((item, index) => {
        const isNewDay = index === 0 || item.dateStr !== lastDate;
        if (isNewDay) {
          lastDate = item.dateStr;
          return { 
            ...item, 
            label: ' ', // 必须保留一个空格，否则 labelComponent 可能不渲染
            labelComponent: () => renderLabel(item.dateStr) 
          };
        }
        return { ...item, label: ' ' };
      });
    } else {
      if (count <= 8) return sysData.map(item => ({ ...item, label: ' ', labelComponent: () => renderLabel(item.dateStr) }));
      const step = Math.ceil(count / 6);
      return sysData.map((item, index) => {
        const isFirst = index === 0;
        const isLast = index === count - 1;
        const isStep = index % step === 0;
        const tooCloseToLast = (count - 1 - index) < (step * 0.6);
        if (isFirst || isLast || (isStep && !tooCloseToLast)) {
          return { ...item, label: ' ', labelComponent: () => renderLabel(item.dateStr) };
        }
        return { ...item, label: ' ' };
      });
    }
  }, [sysData, timeRange]);

  if (loading && sysData.length === 0) return <View style={styles.center}><ActivityIndicator size="large" color={Theme.colors.primary} /></View>;

  const renderDataPointIcon = (item: any) => {
    if (chartConfig.isDense && !selectedPoint) return null;
    if (item.iconType === 'sun') return <ScaledText style={styles.sunMoonIcon}>☀️</ScaledText>;
    if (item.iconType === 'moon') return <ScaledText style={styles.sunMoonIcon}>🌙</ScaledText>;
    return null;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ScaledText bold type="title" style={styles.header}>数据分析</ScaledText>

      {/* 视图切换 */}
      <View style={styles.rangeSection}>
        {TIME_RANGES.map((r) => (
          <TouchableOpacity 
            key={r.value} 
            style={[styles.rangeTab, timeRange === r.value && styles.rangeTabActive]} 
            onPress={() => setTimeRange(r.value)}
          >
            <ScaledText type="caption" bold={timeRange === r.value} color={timeRange === r.value ? Theme.colors.primary : '#666'}>
              {r.label}
            </ScaledText>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity 
            style={[styles.filterChip, !filter && styles.filterChipActive]} 
            onPress={() => setFilter(null)}
          >
            <ScaledText type="caption" color={!filter ? '#fff' : '#666'}>全部数据</ScaledText>
          </TouchableOpacity>
          {QUICK_FILTERS.map(f => (
            <TouchableOpacity 
              key={f} 
              style={[styles.filterChip, filter === f && styles.filterChipActive]} 
              onPress={() => setFilter(f)}
            >
              <ScaledText type="caption" color={filter === f ? '#fff' : '#666'}>{f}</ScaledText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {sysData.length > 0 ? (
        <View style={styles.chartCard}>
          <View style={styles.legend}>
            <View style={[styles.dot, { backgroundColor: Theme.colors.danger }]} />
            <ScaledText type="caption">收缩压 (均值)</ScaledText>
            <View style={[styles.dot, { backgroundColor: Theme.colors.primary, marginLeft: 15 }]} />
            <ScaledText type="caption">舒张压 (均值)</ScaledText>
          </View>

          <LineChart
            areaChart
            curved
            data={processedSysData}
            data2={diaData}
            height={220}
            width={screenWidth - 80}
            spacing={chartConfig.spacing}
            initialSpacing={25}
            color1={Theme.colors.danger}
            color2={Theme.colors.primary}
            startFillColor1={Theme.colors.danger}
            startFillColor2={Theme.colors.primary}
            startOpacity={0.2}
            endOpacity={0.05}
            thickness={3}
            hideDataPoints={chartConfig.isDense}
            dataPointsColor1={Theme.colors.danger}
            dataPointsColor2={Theme.colors.primary}
            renderDataPointIcon={(item: any) => renderDataPointIcon(item)}
            onPress={(item: any) => setSelectedGroup(item)}
            xAxisLabelTextStyle={{ fontSize: 9, color: Theme.colors.textSecondary }}
            yAxisOffset={50}
            maxValue={150}
            noOfSections={5}
            stepValue={30}
            mostRecentValue={true}
            yAxisColor="transparent"
            xAxisColor={Theme.colors.border}
            showReferenceLine1
            referenceLine1Position={140}
            referenceLine1Config={{ 
              color: 'rgba(255, 69, 58, 0.6)', 
              dashArray: [6, 4],
              thickness: 2,
              labelText: '140',
              labelTextStyle: { fontSize: 9, color: '#ff453a', fontWeight: 'bold' }
            }}
            showReferenceLine2
            referenceLine2Position={90}
            referenceLine2Config={{ 
              color: 'rgba(0, 122, 255, 0.6)', 
              dashArray: [6, 4],
              thickness: 2,
              labelText: '90',
              labelTextStyle: { fontSize: 9, color: '#007aff', fontWeight: 'bold' }
            }}
          />
          
          <View style={styles.tipBox}>
            <ScaledText type="caption" color={Theme.colors.textSecondary}>
              {timeRange === '7days' ? '💡 7天视图展示每次测量的具体波动。' : '💡 30天/全部视图已自动合并每日平均值，展示平滑趋势。'}
            </ScaledText>
          </View>
        </View>
      ) : (
        <View style={styles.emptyCard}>
          {loading ? <ActivityIndicator color={Theme.colors.primary} /> : <ScaledText center color={Theme.colors.textSecondary}>暂无符合条件的数据</ScaledText>}
        </View>
      )}

      <ScaledText bold type="body" style={styles.sectionTitle}>最近明细记录</ScaledText>
      {historyList.map((item, index) => {
        const status = getBPStatus(item.systolic, item.diastolic);
        return (
          <View key={index} style={styles.historyRow}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <ScaledText bold type="body">{item.systolic}/{item.diastolic}</ScaledText>
                <ScaledText type="caption" color={Theme.colors.textSecondary}> mmHg</ScaledText>
              </View>
              <ScaledText type="caption" color={Theme.colors.textSecondary}>
                {item.dateLabel} {item.timeLabel} · {item.arm === 'L' ? '左手' : '右手'}
              </ScaledText>
              {item.note ? <ScaledText type="caption" color={Theme.colors.primary} style={{ marginTop: 4 }}>备注：{item.note}</ScaledText> : null}
            </View>
            <View style={[styles.statusTag, { backgroundColor: status.bg }]}>
               <ScaledText type="caption" bold color={status.color}>{status.label}</ScaledText>
            </View>
          </View>
        );
      })}

      <Modal visible={!!selectedPoint} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSelectedGroup(null)}>
          <View style={styles.tooltipCard}>
            <ScaledText bold type="body" color={Theme.colors.primary}>{selectedPoint?.dateStr} {selectedPoint?.timeStr}</ScaledText>
            <ScaledText bold type="title" style={{ marginVertical: 10 }}>{selectedPoint?.value}/{selectedPoint?.diastolicValue} mmHg</ScaledText>
            {selectedPoint?.fullNote ? (
              <>
                <View style={styles.tooltipDivider} />
                <ScaledText type="body">备注：{selectedPoint.fullNote}</ScaledText>
              </>
            ) : null}
            <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedGroup(null)}>
              <ScaledText color="#fff" bold>知道了</ScaledText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  content: { padding: Theme.spacing.md, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { marginTop: Theme.spacing.lg, marginBottom: 15 },
  rangeSection: { flexDirection: 'row', backgroundColor: '#eee', borderRadius: 14, padding: 4, marginBottom: 20 },
  rangeTab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  rangeTabActive: { backgroundColor: '#fff', borderRadius: 10, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  filterSection: { marginBottom: 20 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: Theme.colors.card, marginRight: 8, borderWidth: 1, borderColor: '#eee' },
  filterChipActive: { backgroundColor: Theme.colors.primary, borderColor: Theme.colors.primary },
  chartCard: { backgroundColor: Theme.colors.white, padding: Theme.spacing.md, borderRadius: 24, elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, marginBottom: 20 },
  legend: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  sunMoonIcon: { fontSize: 14, marginTop: -25 },
  tipBox: { marginTop: 15, borderTopWidth: 1, borderTopColor: '#f5f5f5', paddingTop: 10 },
  emptyCard: { height: 220, justifyContent: 'center', backgroundColor: Theme.colors.card, borderRadius: 24 },
  sectionTitle: { marginVertical: 15 },
  historyRow: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: Theme.colors.white, borderRadius: 16, marginBottom: 10, elevation: 2 },
  statusTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  tooltipCard: { width: '85%', backgroundColor: '#fff', padding: 30, borderRadius: 28, elevation: 15 },
  tooltipDivider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 15 },
  closeBtn: { marginTop: 25, backgroundColor: Theme.colors.primary, padding: 16, borderRadius: 18, alignItems: 'center' }
});
