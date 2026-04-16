import * as SQLite from 'expo-sqlite';

export interface BPRecord {
  id?: number;
  group_id: string;
  systolic: number;
  diastolic: number;
  pulse: number;
  arm: 'L' | 'R';
  note?: string;
  created_at: string;
  is_avg_group: boolean;
}

const dbName = 'pulseguard.db';
let dbInstance: SQLite.SQLiteDatabase | null = null;

/**
 * 数据库单例初始化逻辑
 */
export const initDatabase = async () => {
  if (dbInstance) return dbInstance;

  try {
    const db = await SQLite.openDatabaseAsync(dbName);
    
    // 初始化表结构
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS bp_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        group_id TEXT NOT NULL,
        systolic INTEGER NOT NULL,
        diastolic INTEGER NOT NULL,
        pulse INTEGER NOT NULL,
        arm TEXT NOT NULL,
        note TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_avg_group INTEGER DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS reminders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        time TEXT NOT NULL,
        s_enabled INTEGER DEFAULT 1
      );
    `);
    
    dbInstance = db;
    return db;
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};

const mapRecord = (r: any): BPRecord => ({
  ...r,
  is_avg_group: r.is_avg_group === 1 || r.is_avg_group === true || r.is_avg_group === '1'
});

export const insertRecord = async (db: SQLite.SQLiteDatabase, record: BPRecord) => {
  const isAvg = record.is_avg_group ? 1 : 0;
  return await db.runAsync(
    `INSERT INTO bp_records (group_id, systolic, diastolic, pulse, arm, note, created_at, is_avg_group) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      record.group_id, 
      Number(record.systolic), 
      Number(record.diastolic), 
      Number(record.pulse), 
      record.arm, 
      record.note || '', 
      record.created_at || new Date().toISOString(), 
      isAvg
    ]
  );
};

export const getLatestByArm = async (db: SQLite.SQLiteDatabase, arm: 'L' | 'R') => {
  const r = await db.getFirstAsync<any>(
    'SELECT * FROM bp_records WHERE is_avg_group = 1 AND arm = ? ORDER BY created_at DESC LIMIT 1',
    [arm]
  );
  return r ? mapRecord(r) : null;
};

export const getWeeklyRange = async (db: SQLite.SQLiteDatabase) => {
  return await db.getFirstAsync<{ max_sys: number; min_sys: number; max_dia: number; min_dia: number }>(
    `SELECT 
      MAX(systolic) as max_sys, MIN(systolic) as min_sys,
      MAX(diastolic) as max_dia, MIN(diastolic) as min_dia
     FROM bp_records 
     WHERE is_avg_group = 1 
     AND created_at >= date('now', 'weekday 0', '-7 days')`
  );
};

// 获取清晨均值 (06:00 - 10:59 本地时间)
export const getMorningAverage = async (db: SQLite.SQLiteDatabase) => {
  return await db.getFirstAsync<{ avg_sys: number; avg_dia: number }>(
    `SELECT AVG(systolic) as avg_sys, AVG(diastolic) as avg_dia
     FROM bp_records
     WHERE is_avg_group = 1
     AND strftime('%H', datetime(created_at, 'localtime')) BETWEEN '06' AND '10'
     AND created_at >= date('now', 'weekday 0', '-7 days')`
  );
};

export const getAllRecords = async (db: SQLite.SQLiteDatabase) => {
  const records = await db.getAllAsync<any>(
    'SELECT * FROM bp_records ORDER BY created_at DESC'
  );
  return records.map(mapRecord);
};

export const getHistoryForChart = async (db: SQLite.SQLiteDatabase) => {
  const records = await db.getAllAsync<any>(
    'SELECT * FROM bp_records WHERE is_avg_group = 1 ORDER BY created_at ASC'
  );
  return records.map(mapRecord);
};

export const getWeeklyAveragesByArm = async (db: SQLite.SQLiteDatabase) => {
  const results = await db.getAllAsync<{ arm: string; avg_sys: number; avg_dia: number }>(
    `SELECT arm, AVG(systolic) as avg_sys, AVG(diastolic) as avg_dia 
     FROM bp_records 
     WHERE is_avg_group = 1 
     AND created_at >= date('now', 'weekday 0', '-7 days')
     GROUP BY arm`
  );
  return results;
};

// 获取本周 vs 上周均值 (用于环比分析)
export const getComparisonStats = async (db: SQLite.SQLiteDatabase) => {
  const currentWeek = await db.getFirstAsync<{ avg_sys: number; avg_dia: number }>(
    "SELECT AVG(systolic) as avg_sys, AVG(diastolic) as avg_dia FROM bp_records WHERE is_avg_group = 1 AND created_at >= date('now', 'weekday 0', '-7 days')"
  );
  const lastWeek = await db.getFirstAsync<{ avg_sys: number }>(
    "SELECT AVG(systolic) as avg_sys FROM bp_records WHERE is_avg_group = 1 AND created_at >= date('now', 'weekday 0', '-14 days') AND created_at < date('now', 'weekday 0', '-7 days')"
  );
  return {
    thisWeekAvg: currentWeek?.avg_sys || 0,
    thisWeekDiaAvg: currentWeek?.avg_dia || 0,
    lastWeekAvg: lastWeek?.avg_sys || 0,
  };
};

// --- 历史记录模块相关方法 ---

// 获取按日期分组的汇总数据
export const getHistoryGroupedByDate = async (db: SQLite.SQLiteDatabase) => {
  return await db.getAllAsync<any>(`
    SELECT 
      date(created_at) as date,
      AVG(systolic) as day_avg_sys,
      AVG(diastolic) as day_avg_dia,
      COUNT(*) as count
    FROM bp_records 
    WHERE is_avg_group = 1 
    GROUP BY date(created_at)
    ORDER BY date DESC
  `);
};

// 获取某一天内的所有汇总记录
export const getSummariesByDate = async (db: SQLite.SQLiteDatabase, dateStr: string) => {
  return await db.getAllAsync<BPRecord>(
    'SELECT * FROM bp_records WHERE is_avg_group = 1 AND date(created_at) = ? ORDER BY created_at DESC',
    [dateStr]
  );
};

// 获取某一组的所有原始明细
export const getRawDetailsByGroupId = async (db: SQLite.SQLiteDatabase, groupId: string) => {
  return await db.getAllAsync<BPRecord>(
    'SELECT * FROM bp_records WHERE is_avg_group = 0 AND group_id = ? ORDER BY id ASC',
    [groupId]
  );
};

// 删除一组记录
export const deleteGroup = async (db: SQLite.SQLiteDatabase, groupId: string) => {
  return await db.runAsync('DELETE FROM bp_records WHERE group_id = ?', [groupId]);
};
