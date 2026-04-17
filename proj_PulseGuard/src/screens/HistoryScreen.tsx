import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Modal } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Theme } from '../constants/Theme';
import { ScaledText } from '../components/common/ScaledText';
import { initDatabase, getHistoryGroupedByDate, getSummariesByDate, getRawDetailsByGroupId, deleteGroup, BPRecord } from '../database/db';
import { useSettingsLogic } from '../hooks/useSettingsLogic';
import { getBPStatus } from '../utils/healthUtils';

export const HistoryScreen = () => {
  const { exportPDF } = useSettingsLogic();
  const [groupedData, setGroupedData] = useState<any[]>([]);
  const [expandedDates, setExpandedDates] = useState<string[]>([]);
  const [dayDetails, setDayDetails] = useState<Record<string, BPRecord[]>>({});
  const [loading, setLoading] = useState(true);

  // 详情页 Modal 状态
  const [showDetail, setShowDetail] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<{ id: string, date: string, time: string } | null>(null);
  const [rawDetails, setRawDetails] = useState<BPRecord[]>([]);

  const fetchHistory = useCallback(async () => {
    try {
      const db = await initDatabase();
      const summary = await getHistoryGroupedByDate(db);
      setGroupedData(summary);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchHistory(); }, [fetchHistory]));

  const toggleDate = async (dateStr: string) => {
    const isExpanded = expandedDates.includes(dateStr);
    if (isExpanded) {
      setExpandedDates(expandedDates.filter(d => d !== dateStr));
    } else {
      const db = await initDatabase();
      const records = await getSummariesByDate(db, dateStr);
      setDayDetails(prev => ({ ...prev, [dateStr]: records }));
      setExpandedDates([...expandedDates, dateStr]);
    }
  };

  const openDetail = async (groupId: string, date: string, time: string) => {
    const db = await initDatabase();
    const details = await getRawDetailsByGroupId(db, groupId);
    setRawDetails(details);
    setSelectedGroup({ id: groupId, date, time });
    setShowDetail(true);
  };

  const handleDelete = (groupId: string) => {
    Alert.alert("删除", "确定删除本次测量吗？", [
      { text: "取消" },
      { text: "删除", style: 'destructive', onPress: async () => {
        const db = await initDatabase();
        await deleteGroup(db, groupId);
        fetchHistory();
      }}
    ]);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={Theme.colors.primary} /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ScaledText bold type="title">历史记录</ScaledText>
        <TouchableOpacity style={styles.exportBtn} onPress={exportPDF}>
          <ScaledText bold color={Theme.colors.primary}>导出报告 (PDF)</ScaledText>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {groupedData.length === 0 ? (
          <ScaledText center style={{ marginTop: 100 }}>暂无历史数据</ScaledText>
        ) : (
          groupedData.map((day) => {
            const isDayExpanded = !!expandedDates.includes(day.date);
            const dayStatus = getBPStatus(day.day_avg_sys, day.day_avg_dia);
            
            return (
              <View key={day.date} style={styles.dateSection}>
                <TouchableOpacity style={styles.dateHeader} onPress={() => toggleDate(day.date)}>
                  <View style={{ flex: 1 }}>
                    <ScaledText bold>{day.date}</ScaledText>
                    <ScaledText type="caption" color={Theme.colors.textSecondary}>
                      日均值 {Math.round(day.day_avg_sys)}/{Math.round(day.day_avg_dia)} | {day.count}次
                    </ScaledText>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={[styles.miniStatus, { backgroundColor: dayStatus.color }]} />
                    <ScaledText color={Theme.colors.primary} style={{ marginRight: 4, marginLeft: 8 }}>
                      {isDayExpanded ? "收起" : "点击展开"}
                    </ScaledText>
                    <ScaledText color={Theme.colors.primary}>{isDayExpanded ? "▲" : "▼"}</ScaledText>
                  </View>
                </TouchableOpacity>

                {isDayExpanded && dayDetails[day.date]?.map((rec) => {
                   const timeStr = new Date(rec.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                   const status = getBPStatus(rec.systolic, rec.diastolic);
                   
                   return (
                    <View key={rec.id} style={styles.recordItem}>
                      <TouchableOpacity 
                        style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }} 
                        onPress={() => openDetail(rec.group_id, day.date, timeStr)}
                      >
                        <View style={{ flex: 1 }}>
                          <ScaledText bold>{timeStr} · {rec.systolic}/{rec.diastolic} mmHg</ScaledText>
                          <ScaledText type="caption" color={Theme.colors.textSecondary}>
                            {rec.arm === 'L' ? '左手' : '右手'} {rec.note ? ` | ${rec.note}` : ''}
                          </ScaledText>
                        </View>
                        <View style={[styles.listStatusTag, { backgroundColor: status.bg }]}>
                           <ScaledText type="caption" bold color={status.color}>{status.label}</ScaledText>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDelete(rec.group_id)} style={styles.deleteBtn}>
                        <ScaledText color="#ccc" type="caption">删除</ScaledText>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* 三级详情 Modal */}
      <Modal visible={showDetail} animationType="slide" transparent={false}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowDetail(false)}>
              <ScaledText color={Theme.colors.primary} bold>← 返回</ScaledText>
            </TouchableOpacity>
            <ScaledText bold>原始测量明细</ScaledText>
            <View style={{ width: 40 }} />
          </View>
          
          <ScrollView style={{ padding: 20 }}>
            <ScaledText bold type="title">{selectedGroup?.date}</ScaledText>
            <ScaledText type="caption" style={{ marginBottom: 30 }}>测量时间：{selectedGroup?.time}</ScaledText>

            <View style={styles.detailCard}>
              {rawDetails.map((item, index) => (
                <View key={index} style={styles.detailRow}>
                  <View style={styles.indexDot}><ScaledText color="#fff" type="caption">{index+1}</ScaledText></View>
                  <View style={{ marginLeft: 15 }}>
                    <ScaledText bold>{item.systolic}/{item.diastolic} mmHg</ScaledText>
                    <ScaledText type="caption" color="#666">脉搏: {item.pulse} 次/分</ScaledText>
                  </View>
                </View>
              ))}
            </View>
            
            <View style={{ marginTop: 40 }}>
              <ScaledText center type="caption" color="#999">以上为本次测量的多次原始记录。</ScaledText>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, marginTop: 40 },
  exportBtn: { backgroundColor: '#E3F2FD', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  content: { padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  dateSection: { marginBottom: 12, backgroundColor: '#f9f9f9', borderRadius: 16, overflow: 'hidden', elevation: 1 },
  dateHeader: { padding: 16, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee' },
  recordItem: { padding: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  deleteBtn: { paddingLeft: 15, paddingVertical: 10 },
  miniStatus: { width: 8, height: 8, borderRadius: 4 },
  listStatusTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginRight: 10 },
  // Modal 样式
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, marginTop: 40, borderBottomWidth: 1, borderBottomColor: '#eee' },
  detailCard: { backgroundColor: '#f5f5f5', padding: 20, borderRadius: 20 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  indexDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: Theme.colors.primary, justifyContent: 'center', alignItems: 'center' }
});
