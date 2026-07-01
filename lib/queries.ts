"use server";

import { db } from "@/DB";
import { pool } from "@/DB";
import { eq, sql } from "drizzle-orm";
import { tableConfigs, tableOrder, getReverseForeignKeys } from "./table-config";

function getTable(tableName: string) {
  const config = tableConfigs[tableName];
  if (!config) throw new Error(`Table "${tableName}" not found`);
  return config.table;
}

export type SqlInfo = { sql: string; params: unknown[] };

function buildJoinSql(tableName: string, whereId?: number): { text: string; params: unknown[] } {
  const config = tableConfigs[tableName];
  if (!config) throw new Error(`Table "${tableName}" not found`);

  const dbName = config.dbName ?? tableName;
  const selections: string[] = [];
  const joins: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 0;

  selections.push(`"${dbName}".*`);

  for (const field of config.fields) {
    if (field.foreignKey) {
      const refConfig = tableConfigs[field.foreignKey.slug];
      const refDbName = refConfig?.dbName ?? field.foreignKey.slug;
      const display = field.foreignKey.displayExpression ?? `"${refDbName}"."${field.foreignKey.displayField}"`;

      selections.push(`${display} as "${field.columnName}"`);
      joins.push(`LEFT JOIN "${refDbName}" ON "${dbName}"."${field.columnName}" = "${refDbName}".id`);
    }
  }

  let text = `SELECT ${selections.join(', ')} FROM "${dbName}" ${joins.join(' ')}`;

  if (whereId !== undefined) {
    paramIndex += 1;
    text += ` WHERE "${dbName}".id = $${paramIndex}`;
    params.push(whereId);
  }

  return { text, params };
}

export async function listRecords(tableName: string) {
  const { text, params } = buildJoinSql(tableName);
  const result = await pool.query(text, params);
  const rows = result.rows as Record<string, unknown>[];
  return { data: rows, sql: { sql: text, params } };
}

export async function getRecord(tableName: string, id: number) {
  const { text, params } = buildJoinSql(tableName, id);
  const result = await pool.query(text, params);
  const rows = result.rows as Record<string, unknown>[];
  return { data: rows[0], sql: { sql: text, params } };
}

export async function createRecord(tableName: string, formData: FormData) {
  const config = tableConfigs[tableName];
  const table = getTable(tableName);

  const values: Record<string, unknown> = {};
  for (const field of config.fields) {
    if (field.editable === false) continue;
    if (field.columnName === "id") continue;
    const val = formData.get(field.columnName);
    if (val !== null) {
      values[field.columnName] = field.type === "number" ? Number(val) : val;
    }
  }

  const query = db.insert(table).values(values).returning();
  const sqlInfo = query.toSQL();
  await query;

  return { sql: sqlInfo };
}

export async function updateRecord(tableName: string, id: number, formData: FormData) {
  const config = tableConfigs[tableName];
  const table = getTable(tableName);

  const values: Record<string, unknown> = {};
  for (const field of config.fields) {
    if (field.editable === false) continue;
    if (field.columnName === "id") continue;
    const val = formData.get(field.columnName);
    if (val !== null) {
      values[field.columnName] = field.type === "number" ? Number(val) : val;
    }
  }

  const query = db.update(table).set(values).where(eq(table.id, id)).returning();
  const sqlInfo = query.toSQL();
  await query;

  return { sql: sqlInfo };
}

export interface DependencyInfo {
  slug: string;
  label: string;
  count: number;
}

export async function checkDependencies(tableName: string, id: number): Promise<DependencyInfo[]> {
  const reverseMap = getReverseForeignKeys();
  const referencingTables = reverseMap[tableName];
  if (!referencingTables || referencingTables.length === 0) return [];

  const results: DependencyInfo[] = [];

  for (const ref of referencingTables) {
    const childConfig = tableConfigs[ref.childSlug];
    if (!childConfig) continue;
    const dbName = childConfig.dbName ?? ref.childSlug;
    const text = `SELECT COUNT(*) as cnt FROM "${dbName}" WHERE "${ref.fkColumnName}" = $1`;
    const { rows } = await pool.query(text, [id]);
    const count = Number(rows[0]?.cnt ?? 0);
    if (count > 0) {
      results.push({ slug: ref.childSlug, label: ref.childLabel, count });
    }
  }

  return results;
}

export async function deleteRecord(tableName: string, id: number) {
  const table = getTable(tableName);

  const query = db.delete(table).where(eq(table.id, id)).returning();
  const sqlInfo = query.toSQL();

  try {
    await query;
    return { success: true as const, sql: sqlInfo };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const isFKViolation =
      msg.includes("23503") || msg.toLowerCase().includes("foreign key");
    return {
      success: false as const,
      sql: sqlInfo,
      error: isFKViolation
        ? "No se puede eliminar este registro porque está siendo usado en otros registros."
        : `Error al eliminar: ${msg}`,
    };
  }
}

export async function getDashboardCounts() {
  const counts: Record<string, number> = {};
  const sqlInfos: Record<string, SqlInfo> = {};

  for (const slug of tableOrder) {
    const config = tableConfigs[slug];
    const query = db.select({ count: sql<number>`count(*)` }).from(config.table);
    sqlInfos[slug] = query.toSQL();
    const rows = (await query) as { count: number }[];
    const result = rows[0];
    counts[slug] = Number(result?.count ?? 0);
  }

  return { counts, sqlInfos };
}

export async function getForeignKeyOptions(slug: string, fkConfig?: { displayField: string; displayExpression?: string; optionsQuery?: string }) {
  const config = tableConfigs[slug];
  if (!config) return [];

  const dbName = config.dbName ?? slug;

  if (fkConfig?.optionsQuery) {
    const { rows } = await pool.query(fkConfig.optionsQuery);
    return rows.map((r: Record<string, unknown>) => ({
      id: Number(r.id),
      display: String(r.display ?? ""),
    }));
  }

  if (fkConfig) {
    const displayCol = fkConfig.displayExpression ?? `"${dbName}"."${fkConfig.displayField}"`;
    const { rows } = await pool.query(`SELECT id, ${displayCol} as display FROM "${dbName}"`);
    return rows.map((r: Record<string, unknown>) => ({
      id: Number(r.id),
      display: String(r.display ?? ""),
    }));
  }

  const displayField = config.fields.find((f) => f.editable !== false && f.columnName !== "id");
  const { rows } = await pool.query(`SELECT id, "${displayField?.columnName ?? "id"}" as display FROM "${dbName}"`);
  return rows.map((r: Record<string, unknown>) => ({
    id: Number(r.id),
    display: String(r.display ?? ""),
  }));
}
