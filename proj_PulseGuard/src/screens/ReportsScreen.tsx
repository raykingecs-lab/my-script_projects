import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, Dimensions, TouchableOpacity, Modal } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { Theme } from '../constants/Theme';
import { ScaledText } from '../components/common/ScaledText';
import { useReportData } from '../hooks/useReportData';

const screenWidth = Dimensions.get('window').width;
const QUICK_FILTERS = ['服药后', '刚运动', '感冒中', '情绪波动'];

export const ReportsScreen = () => {
  const { sysData, diaData, historyList, loading, filter, setFilter } = useReportData();
  const [selectedPoint, setSelectedGroup] = useState<any>(null);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={Theme.colors.primary} /></View>;

  // 仅保留太阳/月亮图标渲染
  const renderDataPointIcon = (item: any) => {
    if (item.iconType === 'sun') return <ScaledText style={styles.sunMoonIcon}>☀️</ScaledText>;
    if (item.iconType === 'moon') return <ScaledText style={styles.sunMoonIcon}>🌙</ScaledText>;
    return null;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ScaledText bold type="title" style={styles.header}>趋势报表</ScaledText>

      {/* 保留快速筛选功能 */}
      <View style={styles.filterSection}>
        <ScaledText type="caption" color={Theme.colors.textSecondary} style={{ marginBottom: 10 }}>数据快捷筛选：</ScaledText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity 
            style={[styles.filterChip, !filter && styles.filterChipActive]} 
            onPress={() => setFilter(null)}
          >
            <ScaledText type="caption" color={!filter ? '#fff' : '#666'}>全部记录</ScaledText>
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
            <ScaledText type="caption">收缩压 (高压)</ScaledText>
            <View style={[styles.dot, { backgroundColor: Theme.colors.primary, marginLeft: 20 }]} />
            <ScaledText type="caption">舒张压 (低压)</ScaledText>
          </View>

          <LineChart
            data={sysData}
            data2={diaData}
            height={260}
            width={screenWidth - 80}
            spacing={70}
            initialSpacing={30}
            color1={Theme.colors.danger}
            color2={Theme.colors.primary}
            thickness={4}
            dataPointsHeight={10}
            dataPointsWidth={10}
            dataPointsColor1={Theme.colors.danger}
            dataPointsColor2={Theme.colors.primary}
            renderDataPointIcon={(item: any) => renderDataPointIcon(item)}
            onPress={(item: any) => setSelectedGroup(item)}
            xAxisLabelTextStyle={{ fontSize: 14, color: Theme.colors.textSecondary }}
            maxValue={220}
            noOfSections={5}
            yAxisColor={Theme.colors.border}
            xAxisColor={Theme.colors.border}
          />
          
          <View style={styles.tipBox}>
            <ScaledText type="caption" color={Theme.colors.textSecondary}>
              提示：☀️/🌙 分别代表清晨和夜间。点击数据点可查看数值。
            </ScaledText>
          </View>
        </View>
      ) : (
        <View style={styles.emptyCard}><ScaledText center color={Theme.colors.textSecondary}>暂无符合条件的数据</ScaledText></View>
      )}

      {/* 下方列表依然保留备注的文字展示，供参考 */}
      <ScaledText bold type="body" style={styles.sectionTitle}>最近 30 条详细记录</ScaledText>
      {historyList.map((item, index) => (
        <View key={index} style={styles.historyRow}>
          <View style={{ flex: 1 }}>
            <ScaledText bold>{item.systolic}/{item.diastolic} mmHg</ScaledText>
            <ScaledText type="caption" color={Theme.colors.textSecondary}>
              {item.dateLabel} {item.timeLabel} · {item.arm === 'L' ? '左手' : '右手'}
            </ScaledText>
            {item.note ? <ScaledText type="caption" color={Theme.colors.primary}>备注：{item.note}</ScaledText> : null}
          </View>
        </View>
      ))}

      {/* 简易详情弹窗 */}
      <Modal visible={!!selectedPoint} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSelectedGroup(null)}>
          <View style={styles.tooltipCard}>
            <ScaledText bold type="body" color={Theme.colors.primary}>{selectedPoint?.dateStr} {selectedPoint?.timeStr}</ScaledText>
            <ScaledText bold type="title" style={{ marginVertical: 10 }}>{selectedPoint?.value}/{selectedPoint?.diastolicValue} mmHg</ScaledText>
            {selectedPoint?.fullNote && (
              <>
                <View style={styles.tooltipDivider} />
                <ScaledText type="body">{selectedPoint.fullNote}</ScaledText>
              </>
            )}
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
  header: { marginVertical: Theme.spacing.lg },
  filterSection: { marginBottom: 20 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Theme.colors.card, marginRight: 10, borderWidth: 1, borderColor: '#eee' },
  filterChipActive: { backgroundColor: Theme.colors.primary, borderColor: Theme.colors.primary },
  chartCard: { backgroundColor: Theme.colors.white, padding: Theme.spacing.md, borderRadius: 24, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, marginBottom: 20 },
  legend: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  sunMoonIcon: { fontSize: 16, marginTop: -30 }, // 原始定位方案
  tipBox: { marginTop: 20, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 10 },
  emptyCard: { height: 200, justifyContent: 'center', backgroundColor: Theme.colors.card, borderRadius: 20 },
  sectionTitle: { marginVertical: 15 },
  historyRow: { padding: 16, backgroundColor: Theme.colors.card, borderRadius: 12, marginBottom: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  tooltipCard: { width: '80%', backgroundColor: '#fff', padding: 25, borderRadius: 24, elevation: 10 },
  tooltipDivider: { height: 1, backgroundColor: '#eee', marginVertical: 15 },
  closeBtn: { marginTop: 25, backgroundColor: Theme.colors.primary, padding: 15, borderRadius: 15, alignItems: 'center' }
});
