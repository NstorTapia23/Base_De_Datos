import { notFound, redirect } from "next/navigation";
import { tableConfigs } from "@/lib/table-config";
import { listRecords, createRecord, getForeignKeyOptions, type SqlInfo } from "@/lib/queries";
import { DataTable } from "@/components/DataTable";
import { RecordForm } from "@/components/RecordForm";
import { SqlDisplay } from "@/components/SqlDisplay";

export default async function TableListPage({
  params,
  searchParams,
}: {
  params: Promise<{ tableName: string }>;
  searchParams: Promise<{ op?: string; sqlText?: string; sqlParams?: string }>;
}) {
  const { tableName } = await params;
  const config = tableConfigs[tableName];
  if (!config) notFound();

  const sp = await searchParams;
  const lastOp: { op: string; sql: SqlInfo } | null =
    sp.op && sp.sqlText
      ? {
          op: sp.op,
          sql: {
            sql: sp.sqlText,
            params: sp.sqlParams ? JSON.parse(sp.sqlParams) : [],
          },
        }
      : null;

  const { data, sql } = await listRecords(tableName);

  const fkFields = config.fields.filter(
    (f) => f.foreignKey && f.editable !== false
  );

  const fkOptions: Record<string, { id: number; display: string }[]> = {};
  for (const fkField of fkFields) {
    if (fkField.foreignKey) {
      fkOptions[fkField.foreignKey.slug] = await getForeignKeyOptions(
        fkField.foreignKey.slug,
        fkField.foreignKey
      );
    }
  }

  async function handleCreate(formData: FormData) {
    "use server";
    const { sql } = await createRecord(tableName, formData);
    redirect(
      `/admin/${tableName}?op=INSERT&sqlText=${encodeURIComponent(sql.sql)}&sqlParams=${encodeURIComponent(JSON.stringify(sql.params))}`
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-800 mb-6">{config.label}</h1>

      {lastOp && (
        <div className="mb-6 rounded border border-blue-200 bg-blue-50 p-4">
          <p className="text-xs font-semibold text-blue-700 mb-1">
            Última operación: {lastOp.op}
          </p>
          <SqlDisplay sql={lastOp.sql.sql} params={lastOp.sql.params} />
        </div>
      )}

      <DataTable tableName={tableName} data={data} fields={config.fields} />
      <SqlDisplay sql={sql.sql} params={sql.params} />

      <details className="mt-8" open>
        <summary className="cursor-pointer text-base font-semibold text-zinc-700 mb-4">
          Crear nuevo registro
        </summary>
        <div className="rounded border border-zinc-200 bg-white p-6">
          <form action={handleCreate}>
            <RecordForm fields={config.fields} foreignKeyOptions={fkOptions} />
          </form>
        </div>
      </details>
    </div>
  );
}
