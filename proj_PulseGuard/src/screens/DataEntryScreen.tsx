import React, { useState } from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  TextInput,
  Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Theme } from '../constants/Theme';
import { ScaledText } from '../components/common/ScaledText';
import { Stepper } from '../components/common/Stepper';
import { useBPRecords } from '../hooks/useBPRecords';

const QUICK_NOTES = ['服药后', '刚运动', '感冒中', '情绪波动'];

interface LocalRecord {
  id: string;
  systolic: number;
  diastolic: number;
  pulse: number;
  arm: 'L' | 'R';
}

export const DataEntryScreen = () => {
  const { saveMeasurementGroup, isReady } = useBPRecords();

  const [systolic, setSystolic] = useState(120);
  const [diastolic, setDiastolic] = useState(80);
  const [pulse, setPulse] = useState(60); 
  const [arm, setArm] = useState<'L' | 'R'>('L');
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [customNote, setCustomNote] = useState(''); 
  const [measurements, setMeasurements] = useState<LocalRecord[]>([]);

  // 补录时间状态
  const [manualDate, setManualDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');

  /**
   * 核心交互：分步选择日期和时间
   */
  const onDateChange = (event: any, selectedDate?: Date) => {
    // 1. 如果是点击“取消”
    if (event.type === 'dismissed') {
      setShowPicker(false);
      return;
    }

    // 2. 只有在确定选择后处理逻辑
    if (selectedDate) {
      if (selectedDate > new Date()) {
        setShowPicker(false);
        Alert.alert("提示", "不能选择未来的时间。");
        return;
      }

      // 如果当前是日期模式，则记录日期并切换到时间模式
      if (pickerMode === 'date') {
        setManualDate(selectedDate);
        if (Platform.OS === 'android') {
          setShowPicker(false);
          // Android 需要延迟一下再弹第二个，防止 UI 冲突
          setTimeout(() => {
            setPickerMode('time');
            setShowPicker(true);
          }, 100);
        } else {
          setPickerMode('time');
        }
      } else {
        // 如果当前是时间模式，则记录最终结果并关闭
        setManualDate(selectedDate);
        setShowPicker(false);
        setPickerMode('date'); // 重置回日期模式
      }
    }
  };

  const handleOpenPicker = () => {
    setPickerMode('date');
    setShowPicker(true);
  };

  const addMeasurement = () => {
    const newRecord: LocalRecord = {
      id: Date.now().toString(),
      systolic,
      diastolic,
      pulse,
      arm: arm 
    };
    setMeasurements([newRecord, ...measurements]);
  };

  const handleFinalSave = async () => {
    if (!isReady) return;
    const allNotes = [...selectedNotes];
    if (customNote.trim()) allNotes.push(customNote.trim());

    const success = await saveMeasurementGroup(measurements, allNotes, manualDate.toISOString());
    
    if (success) {
      Alert.alert("保存成功", "血压数据已录入", [
        { text: "确定", onPress: () => {
          setMeasurements([]);
          setSelectedNotes([]);
          setCustomNote('');
          setManualDate(new Date()); 
        }}
      ]);
    } else {
      Alert.alert("保存失败", "请检查存储空间或重试");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ScaledText bold type="title" style={styles.header}>录入血压</ScaledText>

      {/* 测量时间选择器 */}
      <View style={styles.dateSelector}>
        <ScaledText type="caption" color={Theme.colors.textSecondary}>测量时间：</ScaledText>
        <TouchableOpacity style={styles.timeBox} onPress={handleOpenPicker}>
          <ScaledText bold color={Theme.colors.primary}>
            {manualDate.toLocaleDateString()} {manualDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </ScaledText>
          <ScaledText type="caption" color={Theme.colors.primary} style={{ marginLeft: 10 }}>[修改]</ScaledText>
        </TouchableOpacity>
      </View>

      {showPicker && (
        <DateTimePicker
          value={manualDate}
          mode={pickerMode}
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          maximumDate={new Date()}
        />
      )}

      {/* --- 其余 UI 逻辑保持不变 --- */}
      <View style={styles.card}>
        <Stepper label="收缩压 (高压)" value={systolic} onValueChange={setSystolic} min={60} max={220} />
        <Stepper label="舒张压 (低压)" value={diastolic} onValueChange={setDiastolic} min={40} max={150} />
        <Stepper label="心率" value={pulse} onValueChange={setPulse} min={30} max={200} unit="次/分" />
      </View>

      <View style={styles.section}>
        <ScaledText type="caption" color={Theme.colors.textSecondary}>测量手臂</ScaledText>
        <View style={styles.row}>
          {(['L', 'R'] as const).map(item => (
            <TouchableOpacity 
              key={item}
              style={[styles.chip, arm === item && styles.chipActive]}
              onPress={() => setArm(item)}
            >
              <ScaledText color={arm === item ? Theme.colors.white : Theme.colors.text}>
                {item === 'L' ? '左手' : '右手'}
              </ScaledText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={[styles.buttonRow, { marginBottom: Theme.spacing.lg }]}>
        <TouchableOpacity style={styles.secondaryButton} onPress={addMeasurement}>
          <ScaledText bold color={Theme.colors.primary}>+ 记一次</ScaledText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.primaryButton, (measurements.length === 0 || !isReady) && styles.buttonDisabled]} 
          onPress={handleFinalSave}
          disabled={measurements.length === 0 || !isReady}
        >
          <ScaledText bold color={Theme.colors.white}>完成保存</ScaledText>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <ScaledText type="caption" color={Theme.colors.textSecondary}>状态备注（可选）</ScaledText>
        <View style={styles.tagRow}>
          {QUICK_NOTES.map(note => (
            <TouchableOpacity 
              key={note}
              style={[styles.tag, selectedNotes.includes(note) && styles.tagActive]}
              onPress={() => {
                if (selectedNotes.includes(note)) setSelectedNotes(selectedNotes.filter(n => n !== note));
                else setSelectedNotes([...selectedNotes, note]);
              }}
            >
              <ScaledText type="caption" color={selectedNotes.includes(note) ? Theme.colors.white : Theme.colors.textSecondary}>
                {note}
              </ScaledText>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={styles.customNoteInput}
          placeholder="补充其他说明..."
          placeholderTextColor={Theme.colors.textSecondary}
          value={customNote}
          onChangeText={setCustomNote}
          allowFontScaling={false}
        />
      </View>

      {measurements.length > 0 && (
        <View style={styles.section}>
          <ScaledText type="caption" color={Theme.colors.textSecondary}>本次待保存记录 ({measurements.length}次)</ScaledText>
          {measurements.map((item) => (
            <View key={item.id} style={styles.recordItem}>
              <View style={{ flex: 1 }}>
                <ScaledText>{item.systolic}/{item.diastolic} <ScaledText type="caption">脉搏:{item.pulse}</ScaledText></ScaledText>
                <ScaledText type="caption" color={Theme.colors.primary}>{item.arm === 'L' ? '左手测量' : '右手测量'}</ScaledText>
              </View>
              <TouchableOpacity onPress={() => setMeasurements(measurements.filter(m => m.id !== item.id))}>
                <ScaledText color={Theme.colors.danger}>删除</ScaledText>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  content: { padding: Theme.spacing.md, paddingBottom: 60 },
  header: { marginVertical: Theme.spacing.lg },
  dateSelector: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, backgroundColor: '#f5f5f5', padding: 15, borderRadius: 15 },
  timeBox: { flexDirection: 'row', alignItems: 'center' },
  card: { backgroundColor: Theme.colors.card, borderRadius: 24, paddingVertical: Theme.spacing.md, marginBottom: Theme.spacing.lg },
  section: { marginBottom: Theme.spacing.lg },
  row: { flexDirection: 'row', marginTop: Theme.spacing.sm },
  chip: { paddingVertical: Theme.spacing.md, paddingHorizontal: Theme.spacing.xl, borderRadius: 16, backgroundColor: Theme.colors.card, marginRight: Theme.spacing.md, borderWidth: 1, borderColor: Theme.colors.border },
  chipActive: { backgroundColor: Theme.colors.primary, borderColor: Theme.colors.primary },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: Theme.spacing.sm },
  tag: { paddingVertical: Theme.spacing.sm, paddingHorizontal: Theme.spacing.md, borderRadius: 12, backgroundColor: Theme.colors.white, borderWidth: 1, borderColor: Theme.colors.border, marginRight: Theme.spacing.sm, marginBottom: Theme.spacing.sm },
  tagActive: { backgroundColor: Theme.colors.textSecondary, borderColor: Theme.colors.textSecondary },
  customNoteInput: { marginTop: Theme.spacing.md, backgroundColor: Theme.colors.card, borderRadius: 12, padding: Theme.spacing.md, fontSize: 20, borderWidth: 1, borderColor: Theme.colors.border, color: Theme.colors.text },
  recordItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F9F9F9', padding: Theme.spacing.md, borderRadius: 12, marginTop: Theme.spacing.xs },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Theme.spacing.xs },
  primaryButton: { flex: 1.5, backgroundColor: Theme.colors.primary, height: 80, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginLeft: Theme.spacing.md },
  secondaryButton: { flex: 1, backgroundColor: Theme.colors.white, height: 80, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Theme.colors.primary },
  buttonDisabled: { backgroundColor: Theme.colors.border }
});
