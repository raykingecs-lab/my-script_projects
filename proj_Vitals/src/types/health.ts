export interface ParsedHealthMetric {
  id?: string; // Temporary ID for list keys
  metricId: number;
  name: string;
  value: number;
  unit: string;
  sourceText?: string;
}

export interface MetricDefinition {
  id: number;
  name: string;
  aliases: string[];
  unit: string;
}
