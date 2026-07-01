import { notFound, redirect } from "next/navigation";
import { tableConfigs } from "@/lib/table-config";
import { getRecord, updateRecord, getForeignKeyOptions } from "@/lib/queries";
import { RecordForm } from "@/components/RecordForm";
import { SqlDisplay } from "@/components/SqlDisplay";

export default async function EditRecordPage({
  params,
}: {
  params: Promise<{ tableName: string; id: string }>;
}) {
  const { tableName, id } = await params;
  const config = tableConfigs[tableName];
  if (!config) notFound();

  const recordId = Number(id);
  if (isNaN(recordId)) notFound();

  const { data: record, sql } = await getRecord(tableName, recordId);
  if (!record) notFound();

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

  async function handleUpdate(formData: FormData) {
    "use server";
    const { sql } = await updateRecord(tableName, recordId, formData);
    redirect(
      `/admin/${tableName}?op=UPDATE&sqlText=${encodeURIComponent(sql.sql)}&sqlParams=${encodeURIComponent(JSON.stringify(sql.params))}`
    );
  }

  return (
    <div>
      <div className="mb-6">
        <a
          href={`/admin/${tableName}`}
          className="text-sm text-zinc-400 hover:text-zinc-600"
        >
          &larr; Volver a {config.label}
        </a>
      </div>

      <h1 className="text-2xl font-bold text-zinc-800 mb-6">
        Editar {config.label} (#{recordId})
      </h1>

      <div className="rounded border border-zinc-200 bg-white p-6 max-w-lg">
        <form action={handleUpdate}>
          <RecordForm
            fields={config.fields}
            record={record}
            foreignKeyOptions={fkOptions}
          />
        </form>
      </div>

      <div className="mt-6">
        <p className="text-xs font-medium text-zinc-500 mb-1">
          Consulta SELECT del registro
        </p>
        <SqlDisplay sql={sql.sql} params={sql.params} />
      </div>
    </div>
  );
}
