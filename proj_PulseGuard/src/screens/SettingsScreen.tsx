import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Theme } from '../constants/Theme';
import { ScaledText } from '../components/common/ScaledText';
import { useSettingsLogic } from '../hooks/useSettingsLogic';
import { Ionicons } from '@expo/vector-icons';

export const SettingsScreen = () => {
  const { exportCSV, backupDatabase, restoreDatabase } = useSettingsLogic();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ScaledText bold type="title" style={styles.header}>设置与备份</ScaledText>

      {/* 导出数据大卡片 */}
      <View style={styles.section}>
        <ScaledText bold type="body" style={styles.sectionTitle}>数据管理</ScaledText>
        
        <TouchableOpacity style={styles.bigButton} onPress={exportCSV}>
          <Ionicons name="document-text-outline" size={32} color={Theme.colors.primary} />
          <View style={styles.buttonTextContainer}>
            <ScaledText bold>导出血压明细 (CSV)</ScaledText>
            <ScaledText type="caption" color={Theme.colors.textSecondary}>
              生成 Excel 可读表格，支持发送给医生
            </ScaledText>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.bigButton, { marginTop: 20 }]} onPress={backupDatabase}>
          <Ionicons name="cloud-upload-outline" size={32} color={Theme.colors.success} />
          <View style={styles.buttonTextContainer}>
            <ScaledText bold>全量备份数据库</ScaledText>
            <ScaledText type="caption" color={Theme.colors.textSecondary}>
              导出原始 .db 文件，用于备份数据
            </ScaledText>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.bigButton, { marginTop: 20 }]} onPress={restoreDatabase}>
          <Ionicons name="cloud-download-outline" size={32} color={Theme.colors.primary} />
          <View style={styles.buttonTextContainer}>
            <ScaledText bold>恢复数据库备份</ScaledText>
            <ScaledText type="caption" color={Theme.colors.textSecondary}>
              选择已有的 .db 文件恢复历史数据
            </ScaledText>
          </View>
        </TouchableOpacity>
      </View>

      {/* 关于信息 */}
      <View style={styles.aboutCard}>
        <ScaledText bold type="body">脉安 (PulseGuard)</ScaledText>
        <ScaledText type="caption" color={Theme.colors.textSecondary} style={{marginTop: 10}}>
          版本：V1.1.2
        </ScaledText>
        <ScaledText type="caption" color={Theme.colors.textSecondary}>
          本应用为Ray个人作品，所有数据均存储在您的手机本地，绝不上传云端，保护隐私。
        </ScaledText>
      </View>

      <View style={styles.footer}>
        <ScaledText type="caption" color={Theme.colors.textSecondary} center>
          © 2026 脉安健康 - 老年人专属健康卫士
        </ScaledText>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  content: {
    padding: Theme.spacing.md,
    paddingBottom: 40,
  },
  header: {
    marginVertical: Theme.spacing.lg,
  },
  section: {
    marginBottom: Theme.spacing.xl,
  },
  sectionTitle: {
    marginBottom: Theme.spacing.md,
  },
  bigButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.white,
    padding: Theme.spacing.lg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonTextContainer: {
    marginLeft: Theme.spacing.md,
    flex: 1,
  },
  aboutCard: {
    backgroundColor: Theme.colors.card,
    padding: Theme.spacing.lg,
    borderRadius: 20,
    marginTop: 40,
  },
  footer: {
    marginTop: 60,
    paddingHorizontal: Theme.spacing.md,
  }
});
