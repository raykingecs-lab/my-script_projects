import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

/**
 * Metadata for biomarkers (e.g., LDL, TG).
 */
export const metricsDefinition = sqliteTable('metrics_definition', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  aliases: text('aliases', { mode: 'json' }).$type<string[]>(), // Array of aliases like ["低密度脂蛋白", "LDL"]
  unit: text('unit').notNull(),
  // For easier querying, we use explicit min/max fields for ref range
  refRangeMin: real('ref_range_min'),
  refRangeMax: real('ref_range_max'),
  // Additional metadata as JSON
  metadata: text('metadata', { mode: 'json' }).$type<Record<string, any>>(),
});

/**
 * Individual lab results.
 */
export const healthRecords = sqliteTable('health_records', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  metricId: integer('metric_id')
    .notNull()
    .references(() => metricsDefinition.id),
  value: real('value').notNull(),
  recordedAt: integer('recorded_at', { mode: 'timestamp' }).notNull(), // Unix timestamp
  source: text('source').default('manual'), // e.g., "OCR Scan", "2026 Spring Checkup"
  sourceImgUri: text('source_img_uri'),
});

/**
 * Daily biometrics logs (weight, body fat, heart rate, etc.).
 */
export const biometrics = sqliteTable('biometrics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  type: text('type').notNull(), // e.g., "weight", "body_fat", "heart_rate"
  value: real('value').notNull(),
  recordedAt: integer('recorded_at', { mode: 'timestamp' }).notNull(),
});
