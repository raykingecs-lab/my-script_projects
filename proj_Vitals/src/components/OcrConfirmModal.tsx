import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Modal, Portal, Text, TextInput, Button, Surface, IconButton } from 'react-native-paper';
import { ParsedHealthMetric } from '../types/health';
import { db } from '../db/client';
import { healthRecords } from '../db/schema';

interface Props {
  visible: boolean;
  initialResults: ParsedHealthMetric[];
  onDismiss: () => void;
  onSaveComplete: () => void;
}

export const OcrConfirmModal: React.FC<Props> = ({ visible, initialResults, onDismiss, onSaveComplete }) => {
  const [results, setResults] = useState<ParsedHealthMetric[]>([]);

  useEffect(() => {
    if (visible) {
      setResults(initialResults);
    }
  }, [visible, initialResults]);

  const updateValue = (id: string, newValue: string) => {
    const floatValue = parseFloat(newValue) || 0;
    setResults(prev => prev.map(item => item.id === id ? { ...item, value: floatValue } : item));
  };

  const removeResult = (id: string) => {
    setResults(prev => prev.filter(item => item.id !== id));
  };

  const handleSave = async () => {
    try {
      const recordsToInsert = results.map(r => ({
        metricId: r.metricId,
        value: r.value,
        recordedAt: new Date(),
        source: 'OCR Scan',
      }));

      if (recordsToInsert.length > 0) {
        await db.insert(healthRecords).values(recordsToInsert);
      }
      onSaveComplete();
    } catch (err) {
      console.error('Failed to save health records:', err);
    }
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.container}>
        <Surface style={styles.surface} elevation={2}>
          <Text variant="headlineSmall" style={styles.title}>Confirm Results</Text>
          <ScrollView style={styles.scrollArea}>
            {results.map((item) => (
              <View key={item.id} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text variant="labelLarge">{item.name}</Text>
                  <Text variant="bodySmall" style={styles.sourceText}>{item.sourceText}</Text>
                </View>
                <View style={styles.itemActions}>
                  <TextInput
                    mode="outlined"
                    dense
                    keyboardType="numeric"
                    value={item.value.toString()}
                    onChangeText={(val) => updateValue(item.id!, val)}
                    style={styles.input}
                  />
                  <Text variant="bodyMedium" style={styles.unit}>{item.unit}</Text>
                  <IconButton icon="close-circle-outline" size={20} onPress={() => removeResult(item.id!)} />
                </View>
              </View>
            ))}
            {results.length === 0 && (
              <Text style={styles.emptyText}>No metrics found in text.</Text>
            )}
          </ScrollView>
          <View style={styles.actions}>
            <Button mode="text" onPress={onDismiss}>Cancel</Button>
            <Button mode="contained" onPress={handleSave} disabled={results.length === 0}>
              Save Records
            </Button>
          </View>
        </Surface>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  surface: {
    padding: 20,
    width: '100%',
    maxWidth: 500,
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  title: {
    marginBottom: 16,
  },
  scrollArea: {
    maxHeight: 400,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemInfo: {
    flex: 1,
  },
  sourceText: {
    color: '#666',
    fontStyle: 'italic',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    width: 80,
    backgroundColor: '#fff',
  },
  unit: {
    marginLeft: 8,
    width: 60,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 8,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 20,
    color: '#999',
  },
});
