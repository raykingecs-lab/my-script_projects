import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ScrollView } from 'react-native';
import { PaperProvider, MD3LightTheme, Text, ActivityIndicator, Button, TextInput, Snackbar } from 'react-native-paper';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { db } from './src/db/client';
import migrations from './drizzle/migrations';
import { useHealthOcr } from './src/hooks/useHealthOcr';
import { OcrConfirmModal } from './src/components/OcrConfirmModal';
import { seedMetrics } from './src/db/seed';
import { ParsedHealthMetric } from './src/types/health';

/**
 * Main application entry point.
 */
export default function App() {
  const { success, error } = useMigrations(db, migrations);
  const { parseRawText, isProcessing } = useHealthOcr();
  
  const [isDbReady, setIsDbReady] = useState(false);
  const [rawText, setRawText] = useState('低密度脂蛋白: 2.85 mmol/L\n甘油三酯: 1.25');
  const [ocrResults, setOcrResults] = useState<ParsedHealthMetric[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  useEffect(() => {
    if (success) {
      seedMetrics().then(() => setIsDbReady(true));
    }
  }, [success]);

  const handleProcessOcr = () => {
    const results = parseRawText(rawText);
    setOcrResults(results);
    setModalVisible(true);
  };

  const handleSaveComplete = () => {
    setModalVisible(false);
    setSnackbarVisible(true);
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text variant="headlineSmall">Migration Error</Text>
        <Text>{error.message}</Text>
      </View>
    );
  }

  if (!success || !isDbReady) {
    return (
      <View style={styles.container}>
        <ActivityIndicator animating={true} />
        <Text style={{ marginTop: 16 }}>Initializing Database...</Text>
      </View>
    );
  }

  return (
    <PaperProvider theme={MD3LightTheme}>
      <View style={styles.mainContainer}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text variant="headlineMedium" style={styles.title}>Vitals</Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            OCR Data Entry Demo
          </Text>

          <View style={styles.inputSection}>
            <Text variant="titleMedium" style={styles.label}>Paste Raw OCR Text:</Text>
            <TextInput
              mode="outlined"
              multiline
              numberOfLines={6}
              value={rawText}
              onChangeText={setRawText}
              placeholder="e.g. 甘油三酯 1.25 mmol/L"
              style={styles.textInput}
            />
            <Button 
              mode="contained" 
              onPress={handleProcessOcr} 
              loading={isProcessing}
              style={styles.button}
              icon="magnify"
            >
              Parse Text
            </Button>
          </View>
        </ScrollView>

        <OcrConfirmModal
          visible={modalVisible}
          initialResults={ocrResults}
          onDismiss={() => setModalVisible(false)}
          onSaveComplete={handleSaveComplete}
        />

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          action={{
            label: 'OK',
            onPress: () => setSnackbarVisible(false),
          }}
        >
          Records saved successfully!
        </Snackbar>

        <StatusBar style="auto" />
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontWeight: 'bold',
    color: '#1a1c1e',
  },
  subtitle: {
    color: '#44474e',
    marginBottom: 32,
  },
  inputSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    elevation: 1,
  },
  label: {
    marginBottom: 8,
  },
  textInput: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  button: {
    borderRadius: 8,
  },
});
