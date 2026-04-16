import React, { useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { Theme } from '../../constants/Theme';
import { ScaledText } from './ScaledText';

interface StepperProps {
  label: string;
  value: number;
  onValueChange: (newValue: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  label,
  value,
  onValueChange,
  min = 30,
  max = 250,
  step = 1,
  unit = 'mmHg'
}) => {
  const timer = useRef<NodeJS.Timeout | null>(null);

  const handleIncrement = () => {
    if (value < max) onValueChange(value + step);
  };

  const handleDecrement = () => {
    if (value > min) onValueChange(value - step);
  };

  const startTimer = (action: () => void) => {
    action();
    timer.current = setInterval(action, 150);
  };

  const stopTimer = () => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  };

  return (
    <View style={styles.container}>
      <ScaledText type="caption" color={Theme.colors.textSecondary} style={styles.label}>
        {label} ({unit})
      </ScaledText>
      
      <View style={styles.stepperRow}>
        <TouchableOpacity
          activeOpacity={0.6}
          onPressIn={() => startTimer(handleDecrement)}
          onPressOut={stopTimer}
          style={[styles.button, { backgroundColor: '#F0F0F0' }]}
        >
          <ScaledText bold type="hero" style={styles.buttonText}>−</ScaledText>
        </TouchableOpacity>

        <View style={styles.valueDisplay}>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={value.toString()}
            onChangeText={(text) => {
              const num = parseInt(text, 10);
              if (!isNaN(num)) onValueChange(num);
              else if (text === '') onValueChange(0);
            }}
            allowFontScaling={false}
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.6}
          onPressIn={() => startTimer(handleIncrement)}
          onPressOut={stopTimer}
          style={[styles.button, { backgroundColor: Theme.colors.primary }]}
        >
          <ScaledText bold type="hero" color={Theme.colors.white} style={styles.buttonText}>+</ScaledText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.md,
  },
  label: {
    marginBottom: Theme.spacing.sm,
    marginLeft: Theme.spacing.xs,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Theme.colors.card,
    borderRadius: 20,
    padding: Theme.spacing.xs,
    elevation: 3,
  },
  button: {
    width: 80,
    height: 80,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    lineHeight: 50,
  },
  valueDisplay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    fontSize: Theme.fontSize.hero,
    fontWeight: 'bold',
    color: Theme.colors.primary,
    textAlign: 'center',
    width: '100%',
  }
});
