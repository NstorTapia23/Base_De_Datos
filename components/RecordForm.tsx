import { FieldConfig } from "@/lib/table-config";

export function RecordForm({
  fields,
  record,
  foreignKeyOptions,
}: {
  fields: FieldConfig[];
  record?: Record<string, unknown>;
  foreignKeyOptions?: Record<string, { id: number; display: string }[]>;
}) {
  const editableFields = fields.filter((f) => f.editable !== false && f.columnName !== "id" && f.columnName !== "fecha_ingreso");

  return (
    <div className="space-y-4">
      {editableFields.map((field) => (
        <div key={field.columnName}>
          <label
            htmlFor={field.columnName}
            className="mb-1 block text-sm font-medium text-zinc-700"
          >
            {field.label}
            {field.required && <span className="text-red-400 ml-0.5">*</span>}
            {field.helpText && <p className="text-xs text-zinc-400 mt-0.5">{field.helpText}</p>}
          </label>
          {field.type === "select" && field.foreignKey ? (
            <select
              id={field.columnName}
              name={field.columnName}
              defaultValue={record ? String(record[field.columnName] ?? "") : ""}
              required={field.required}
              className="w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
            >
              <option value="">-- Seleccionar --</option>
              {(foreignKeyOptions?.[field.foreignKey.slug] ?? []).map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.display}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={field.columnName}
              name={field.columnName}
              type={field.type === "number" ? "number" : "text"}
              defaultValue={record ? String(record[field.columnName] ?? "") : ""}
              required={field.required}
              className="w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none"
            />
          )}
        </div>
      ))}
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          className="rounded bg-zinc-800 px-4 py-2 text-sm text-white hover:bg-zinc-700"
        >
          {record ? "Actualizar" : "Crear"}
        </button>
        <a
          href=".."
          className="rounded border border-zinc-300 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
        >
          Cancelar
        </a>
      </div>
    </div>
  );
}
