import { useState, useCallback } from 'react';
import { ParsedHealthMetric } from '../types/health';

/**
 * Patterns for matching health metrics in raw text.
 * Format: [Metric Name, Metric ID, Alias Regex, Unit Regex]
 */
const OCR_PATTERNS: Array<[string, number, RegExp, string]> = [
  ['LDL-C', 1, /(?:LDL(?:-C)?|低密度脂蛋白)/i, 'mmol/L'],
  ['TG', 2, /(?:TG|甘油三酯)/i, 'mmol/L'],
];

// More generic regex to capture value and optional unit
// Looks for "Metric Name" followed by non-digits, then a decimal number, then optional unit
const VALUE_REGEX = /([\d]+\.[\d]+|[\d]+)\s*(mmol\/L|mg\/dL)?/i;

export function useHealthOcr() {
  const [isProcessing, setIsProcessing] = useState(false);

  const parseRawText = useCallback((rawText: string): ParsedHealthMetric[] => {
    setIsProcessing(true);
    const results: ParsedHealthMetric[] = [];
    
    // Split text into lines for easier matching
    const lines = rawText.split('\n');

    for (const line of lines) {
      for (const [name, id, aliasRegex, defaultUnit] of OCR_PATTERNS) {
        if (aliasRegex.test(line)) {
          // Find the value in the same line or nearby context
          const match = line.match(VALUE_REGEX);
          if (match) {
            const value = parseFloat(match[1]);
            const unit = match[2] || defaultUnit;
            
            results.push({
              id: `${id}-${Date.now()}-${results.length}`,
              metricId: id,
              name,
              value,
              unit,
              sourceText: line.trim(),
            });
            break; // Move to next line once matched
          }
        }
      }
    }

    setIsProcessing(false);
    return results;
  }, []);

  return { parseRawText, isProcessing };
}
