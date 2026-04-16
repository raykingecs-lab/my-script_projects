import React, { useState } from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  TextInput
} from 'react-native';
import { Theme } from '../constants/Theme';
import { ScaledText } from '../components/common/ScaledText';
import { Stepper } from '../components/common/Stepper';
import { useBPRecords } from '../hooks/useBPRecords';

// 快捷标签定义
const QUICK_NOTES = ['服药后', '刚运动', '感冒中', '情绪波动'];

interface LocalRecord {
  id: string;
  systolic: number;
  diastolic: number;
  pulse: number;
}

export const DataEntryScreen = () => {
  const { saveMeasurementGroup, isReady } = useBPRecords();

  // 当前状态
  const [systolic, setSystolic] = useState(120);
  const [diastolic, setDiastolic] = useState(80);
  const [pulse, setPulse] = useState(60); 
  const [arm, setArm] = useState<'L' | 'R'>('L');
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [customNote, setCustomNote] = useState(''); 
  
  // 本次测量组的暂存明细
  const [measurements, setMeasurements] = useState<LocalRecord[]>([]);

  // 添加单次测量到列表
  const addMeasurement = () => {
    const newRecord: LocalRecord = {
      id: Date.now().toString(),
      systolic,
      diastolic,
      pulse
    };
    setMeasurements([newRecord, ...measurements]);
  };

  // 删除单次测量
  const removeMeasurement = (id: string) => {
    setMeasurements(measurements.filter(m => m.id !== id));
  };

  // 切换标签
  const toggleNote = (note: string) => {
    if (selectedNotes.includes(note)) {
      setSelectedNotes(selectedNotes.filter(n => n !== note));
    } else {
      setSelectedNotes([...selectedNotes, note]);
    }
  };

  // 保存逻辑
  const handleFinalSave = async () => {
    if (!isReady) return;
    const allNotes = [...selectedNotes];
    if (customNote.trim()) allNotes.push(customNote.trim());

    const success = await saveMeasurementGroup(measurements, arm, allNotes);
    
    if (success) {
      Alert.alert("保存成功", "血压数据已安全存入本地", [
        { text: "确定", onPress: () => {
          setMeasurements([]);
          setSelectedNotes([]);
          setCustomNote('');
        }}
      ]);
    } else {
      Alert.alert("保存失败", "请检查存储空间或重试");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ScaledText bold type="title" style={styles.header}>录入血压</ScaledText>

      {/* 1. 核心录入区 */}
      <View style={styles.card}>
        <Stepper 
          label="收缩压 (高压)" 
          value={systolic} 
          onValueChange={setSystolic} 
          min={60} max={220} 
        />
        <Stepper 
          label="舒张压 (低压)" 
          value={diastolic} 
          onValueChange={setDiastolic} 
          min={40} max={150} 
        />
        <Stepper 
          label="心率" 
          value={pulse} 
          onValueChange={setPulse} 
          min={30} max={200} 
          unit="次/分"
        />
      </View>

      {/* 2. 手臂选择 */}
      <View style={styles.section}>
        <ScaledText type="caption" color={Theme.colors.textSecondary}>测量手臂</ScaledText>
        <View style={styles.row}>
          {(['L', 'R'] as const).map(item => (
            <TouchableOpacity 
              key={item}
              style={[
                styles.chip, 
                arm === item && styles.chipActive
              ]}
              onPress={() => setArm(item)}
            >
              <ScaledText color={arm === item ? Theme.colors.white : Theme.colors.text}>
                {item === 'L' ? '左手' : '右手'}
              </ScaledText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 3. 操作按钮 (已移动到此处) */}
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

      {/* 4. 状态备注 (已更名) */}
      <View style={styles.section}>
        <ScaledText type="caption" color={Theme.colors.textSecondary}>状态备注（可选）</ScaledText>
        <View style={styles.tagRow}>
          {QUICK_NOTES.map(note => (
            <TouchableOpacity 
              key={note}
              style={[
                styles.tag, 
                selectedNotes.includes(note) && styles.tagActive
              ]}
              onPress={() => toggleNote(note)}
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

      {/* 5. 明细列表展示 */}
      {measurements.length > 0 && (
        <View style={styles.section}>
          <ScaledText type="caption" color={Theme.colors.textSecondary}>本次测量明细 ({measurements.length}次)</ScaledText>
          {measurements.map((item) => (
            <View key={item.id} style={styles.recordItem}>
              <ScaledText>{item.systolic}/{item.diastolic} <ScaledText type="caption">脉搏:{item.pulse}</ScaledText></ScaledText>
              <TouchableOpacity onPress={() => removeMeasurement(item.id)}>
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
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  content: {
    padding: Theme.spacing.md,
    paddingBottom: 60,
  },
  header: {
    marginVertical: Theme.spacing.lg,
  },
  card: {
    backgroundColor: Theme.colors.card,
    borderRadius: 24,
    paddingVertical: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
  },
  section: {
    marginBottom: Theme.spacing.lg,
  },
  row: {
    flexDirection: 'row',
    marginTop: Theme.spacing.sm,
  },
  chip: {
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.xl,
    borderRadius: 16,
    backgroundColor: Theme.colors.card,
    marginRight: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  chipActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Theme.spacing.sm,
  },
  tag: {
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: 12,
    backgroundColor: Theme.colors.white,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginRight: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
  },
  tagActive: {
    backgroundColor: Theme.colors.textSecondary,
    borderColor: Theme.colors.textSecondary,
  },
  customNoteInput: {
    marginTop: Theme.spacing.md,
    backgroundColor: Theme.colors.card,
    borderRadius: 12,
    padding: Theme.spacing.md,
    fontSize: 20,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    color: Theme.colors.text,
  },
  recordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    padding: Theme.spacing.md,
    borderRadius: 12,
    marginTop: Theme.spacing.xs,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Theme.spacing.xs,
  },
  primaryButton: {
    flex: 1.5,
    backgroundColor: Theme.colors.primary,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Theme.spacing.md,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: Theme.colors.white,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Theme.colors.primary,
  },
  buttonDisabled: {
    backgroundColor: Theme.colors.border,
  }
});
