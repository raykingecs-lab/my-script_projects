import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import * as DocumentPicker from 'expo-document-picker';
import * as Print from 'expo-print';
import { initDatabase, getAllRecords, setMetadata, getMetadata } from '../database/db';
import { Alert } from 'react-native';

export const useSettingsLogic = () => {
  
  /**
   * 导出血压明细为 PDF
   */
  const exportPDF = async () => {
    try {
      const db = await initDatabase();
      const records = await getAllRecords(db);
      if (!records || records.length === 0) {
        Alert.alert('提示', '暂无数据可导出');
        return;
      }

      // 构建 HTML 报表内容
      const rows = records.map(r => {
        const date = new Date(r.created_at);
        const dateStr = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        const isHigh = r.systolic >= 140 || r.diastolic >= 90;
        
        return `
          <tr>
            <td>${dateStr} ${timeStr}</td>
            <td style="color: ${isHigh ? '#ff453a' : '#333'}; font-weight: ${isHigh ? 'bold' : 'normal'}">
              ${r.systolic} / ${r.diastolic}
            </td>
            <td>${r.pulse}</td>
            <td>${r.arm === 'L' ? '左手' : '右手'}</td>
            <td>${r.note || '-'}</td>
          </tr>
        `;
      }).join('');

      const htmlContent = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; color: #333; }
              h1 { color: #007aff; text-align: center; margin-bottom: 30px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 12px; text-align: left; font-size: 14px; }
              th { backgroundColor: #f8f9fa; font-weight: bold; }
              tr:nth-child(even) { background-color: #fafafa; }
              .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
              .status-hint { font-size: 12px; color: #ff453a; margin-bottom: 10px; }
            </style>
          </head>
          <body>
            <h1>脉安 (PulseGuard) 血压测量报告</h1>
            <p style="text-align: right; font-size: 12px;">导出时间: ${new Date().toLocaleString()}</p>
            <p class="status-hint">* 注：加粗红色数值表示超过 140/90 mmHg 警戒线</p>
            <table>
              <thead>
                <tr>
                  <th>测量时间</th>
                  <th>血压 (mmHg)</th>
                  <th>心率 (bpm)</th>
                  <th>部位</th>
                  <th>备注</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
            <div class="footer">
              报告由“脉安”应用自动生成。请遵医嘱，数据仅供参考。
            </div>
          </body>
        </html>
      `;

      // 生成 PDF
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      
      // 定制文件名
      const now = new Date();
      const dateStr = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;
      const customName = `PulseGuard_血压报告_${dateStr}.pdf`;
      const newUri = FileSystem.cacheDirectory + customName;

      // 移动文件到新路径（带自定义名称）
      await FileSystem.moveAsync({
        from: uri,
        to: newUri
      });

      // 分享文件
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(newUri, { UTI: '.pdf', mimeType: 'application/pdf', dialogTitle: '分享血压报告' });
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
        
        // 成功分享后记录时间
        const db = await initDatabase();
        await setMetadata(db, 'last_backup_time', new Date().toISOString());
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

              const dirInfo = await FileSystem.getInfoAsync(dbDir);
              if (!dirInfo.exists) {
                await FileSystem.makeDirectoryAsync(dbDir, { intermediates: true });
              }

              await FileSystem.copyAsync({
                from: selectedFile.uri,
                to: dbUri
              });

              Alert.alert("恢复成功", "数据已成功导入。请彻底退出并重新打开应用。");
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Restore error:', error);
      Alert.alert('恢复失败', `原因: ${error?.message || '文件操作异常'}`);
    }
  };

  const getLastBackupTime = async () => {
    const db = await initDatabase();
    return await getMetadata(db, 'last_backup_time');
  };

  return { exportPDF, backupDatabase, restoreDatabase, getLastBackupTime };
};
