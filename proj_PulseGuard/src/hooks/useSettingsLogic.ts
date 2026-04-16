import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import * as DocumentPicker from 'expo-document-picker';
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
      if (!records || records.length === 0) {
        Alert.alert('提示', '暂无数据可导出');
        return;
      }
      let csvContent = '\uFEFF时间,收缩压,舒张压,心率,手臂,备注,是否汇总\n';
      records.forEach(r => {
        const safeNote = (r.note || '').replace(/"/g, '""');
        csvContent += `${r.created_at},${r.systolic},${r.diastolic},${r.pulse},${r.arm},"${safeNote}",${r.is_avg_group ? '是' : '否'}\n`;
      });
      const fileName = `pulseguard_export_${Date.now()}.csv`;
      const fileUri = FileSystem.cacheDirectory + fileName;
      await FileSystem.writeAsStringAsync(fileUri, csvContent, { encoding: FileSystem.EncodingType.UTF8 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, { mimeType: 'text/csv', dialogTitle: '导出血压数据' });
      } else {
        Alert.alert('错误', '设备不支持分享');
      }
    } catch (error: any) {
      Alert.alert('导出失败', `原因: ${error?.message || '未知错误'}`);
    }
  };

  /**
   * 备份原始 SQLite 数据库文件
   */
  const backupDatabase = async () => {
    try {
      const dbDir = `${FileSystem.documentDirectory}SQLite/`;
      const dbUri = `${dbDir}pulseguard.db`;
      const fileInfo = await FileSystem.getInfoAsync(dbUri);
      if (!fileInfo.exists) {
        Alert.alert('提示', '尚未发现数据库文件，请先录入一条测量记录。');
        return;
      }
      const cacheUri = FileSystem.cacheDirectory + 'pulseguard_backup.db';
      await FileSystem.copyAsync({ from: dbUri, to: cacheUri });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(cacheUri, { dialogTitle: '备份数据库文件', mimeType: 'application/octet-stream' });
      } else {
        Alert.alert('错误', '设备不支持分享');
      }
    } catch (error: any) {
      Alert.alert('备份失败', `原因: ${error?.message || '访问受限'}`);
    }
  };

  /**
   * 恢复数据库备份
   */
  const restoreDatabase = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/octet-stream',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const selectedFile = result.assets[0];
      
      // 安全检查：确认文件格式 (SQLite 头部校验或简单后缀检查)
      if (!selectedFile.name.endsWith('.db')) {
        Alert.alert('错误', '请选择正确的 .db 数据库备份文件');
        return;
      }

      Alert.alert(
        "确认恢复", 
        "恢复操作将覆盖当前手机上的所有数据，且不可撤销。确定要继续吗？",
        [
          { text: "取消", style: "cancel" },
          { 
            text: "确定覆盖", 
            style: "destructive",
            onPress: async () => {
              const dbDir = `${FileSystem.documentDirectory}SQLite/`;
              const dbUri = `${dbDir}pulseguard.db`;

              // 1. 确保目录存在
              const dirInfo = await FileSystem.getInfoAsync(dbDir);
              if (!dirInfo.exists) {
                await FileSystem.makeDirectoryAsync(dbDir, { intermediates: true });
              }

              // 2. 覆盖文件
              await FileSystem.copyAsync({
                from: selectedFile.uri,
                to: dbUri
              });

              Alert.alert("恢复成功", "数据已成功导入。请彻底退出并重新打开应用，以刷新显示内容。");
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Restore error:', error);
      Alert.alert('恢复失败', `原因: ${error?.message || '文件操作异常'}`);
    }
  };

  return { exportCSV, backupDatabase, restoreDatabase };
};
