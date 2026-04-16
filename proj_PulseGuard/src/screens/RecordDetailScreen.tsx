import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Theme } from '../constants/Theme';
import { ScaledText } from '../components/common/ScaledText';
import { initDatabase, getRawDetailsByGroupId, BPRecord } from '../database/db';

export const RecordDetailScreen = ({ route }: any) => {
  const { groupId, dateLabel, timeLabel } = route.params;
  const [details, setRawDetails] = useState<BPRecord[]>([]);

  useEffect(() => {
    initDatabase().then(db => {
      getRawDetailsByGroupId(db, groupId).then(setRawDetails);
    });
  }, [groupId]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ScaledText bold type="title">{dateLabel}</ScaledText>
      <ScaledText type="caption" color={Theme.colors.textSecondary} style={{ marginBottom: 20 }}>
        记录时间：{timeLabel}
      </ScaledText>

      <View style={styles.card}>
        <ScaledText bold style={{ marginBottom: 15 }}>本次测量的原始明细</ScaledText>
        {details.map((item, index) => (
          <View key={item.id} style={styles.detailRow}>
            <View style={styles.indexCircle}>
              <ScaledText bold type="caption" color={Theme.colors.white}>{index + 1}</ScaledText>
            </View>
            <View style={{ flex: 1, marginLeft: 15 }}>
              <ScaledText bold>{item.systolic}/{item.diastolic} <ScaledText type="caption">mmHg</ScaledText></ScaledText>
              <ScaledText type="caption" color={Theme.colors.textSecondary}>心率: {item.pulse} 次/分</ScaledText>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.tipCard}>
        <ScaledText type="caption" color={Theme.colors.textSecondary}>
          注：汇总记录是由以上原始数据计算出的平均值得来。
        </ScaledText>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  content: { padding: Theme.spacing.md },
  card: { backgroundColor: Theme.colors.card, padding: Theme.spacing.lg, borderRadius: 24 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  indexCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: Theme.colors.primary, justifyContent: 'center', alignItems: 'center' },
  tipCard: { marginTop: 30, padding: Theme.spacing.md }
});
