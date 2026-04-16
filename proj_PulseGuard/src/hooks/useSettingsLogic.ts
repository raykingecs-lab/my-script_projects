import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { initDatabase, getAllRecords } from '../database/db';
import { Alert } from 'react-native';

export const useSettingsLogic = () => {
  
  /**
   * 导出所有数据为 CSV
   */
  const exportCSV = async () => {
    try {
      const db = await initDatabase();
      const records = await getAllRecords(db);
      
      if (records.length === 0) {
        Alert.alert('提示', '暂无数据可导出');
        return;
      }

      // 1. 生成 CSV 内容 (UTF-8 with BOM for Excel compatibility)
      let csvContent = '\uFEFF时间,收缩压,舒张压,心率,手臂,备注,是否汇总\n';
      records.forEach(r => {
        csvContent += `${r.created_at},${r.systolic},${r.diastolic},${r.pulse},${r.arm},"${r.note || ''}",${r.is_avg_group ? '是' : '否'}\n`;
      });

      // 2. 写入临时文件
      const fileName = `pulseguard_export_${Date.now()}.csv`;
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(fileUri, csvContent, { encoding: FileSystem.EncodingType.UTF8 });

      // 3. 分享
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, { mimeType: 'text/csv', dialogTitle: '导出血压数据' });
      } else {
        Alert.alert('错误', '设备不支持分享');
      }
    } catch (error) {
      console.error('Export CSV error:', error);
      Alert.alert('错误', '导出失败，请重试');
    }
  };

  /**
   * 备份原始 SQLite 数据库文件
   */
  const backupDatabase = async () => {
    try {
      // 默认 SQLite 数据库路径 (Expo 标准路径)
      const dbUri = `${FileSystem.documentDirectory}SQLite/pulseguard.db`;
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(dbUri, { dialogTitle: '备份数据库文件' });
      } else {
        Alert.alert('错误', '设备不支持分享');
      }
    } catch (error) {
      console.error('Backup error:', error);
      Alert.alert('错误', '备份失败，请检查数据库是否已初始化');
    }
  };

  return { exportCSV, backupDatabase };
};
