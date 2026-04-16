import { db } from './client';
import { metricsDefinition } from './schema';
import { eq } from 'drizzle-orm';

/**
 * Seed basic metrics if they don't exist.
 */
export async function seedMetrics() {
  const existing = await db.select().from(metricsDefinition);
  
  if (existing.length === 0) {
    await db.insert(metricsDefinition).values([
      {
        id: 1,
        name: 'LDL-C',
        aliases: ['低密度脂蛋白', 'LDL', 'Low Density Lipoprotein'],
        unit: 'mmol/L',
      },
      {
        id: 2,
        name: 'TG',
        aliases: ['甘油三酯', 'Triglycerides'],
        unit: 'mmol/L',
      },
    ]);
  }
}
