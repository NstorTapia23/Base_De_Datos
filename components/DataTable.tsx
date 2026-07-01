"use client";

import { useState } from "react";
import Link from "next/link";
import { FieldConfig } from "@/lib/table-config";
import { deleteRecord, checkDependencies } from "@/lib/queries";
import { Modal } from "./Modal";

type ModalState = {
  variant: "alert" | "confirm";
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
} | null;

export function DataTable({
  tableName,
  data,
  fields,
}: {
  tableName: string;
  data: Record<string, unknown>[];
  fields: FieldConfig[];
}) {
  const [modal, setModal] = useState<ModalState>(null);
  const displayFields = fields.filter((f) => f.columnName !== "id");

  function closeModal() {
    setModal(null);
  }

  async function handleDelete(id: number) {
    const deps = await checkDependencies(tableName, id);
    if (deps.length > 0) {
      const msg =
        "Este registro está siendo usado en:\n" +
        deps.map((d) => `  \u2022 ${d.label}: ${d.count} registro(s)`).join("\n") +
        "\n\nElimine esas referencias primero.";
      setModal({
        variant: "alert",
        title: "Registro en uso",
        message: msg,
        onCancel: closeModal,
      });
      return;
    }

    setModal({
      variant: "confirm",
      title: "Confirmar eliminación",
      message: "¿Está seguro de que desea eliminar este registro?",
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      onConfirm: async () => {
        closeModal();
        const result = await deleteRecord(tableName, id);
        if (!result.success) {
          setModal({
            variant: "alert",
            title: "Error",
            message: result.error,
            onCancel: closeModal,
          });
          return;
        }
        window.location.href =
          `/admin/${tableName}?op=DELETE&sqlText=${encodeURIComponent(result.sql.sql)}&sqlParams=${encodeURIComponent(JSON.stringify(result.sql.params))}`;
      },
      onCancel: closeModal,
    });
  }

  return (
    <>
      <div className="overflow-x-auto rounded border border-zinc-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-zinc-50 text-left">
              <th className="px-4 py-2.5 font-medium text-zinc-500 text-xs uppercase">ID</th>
              {displayFields.map((f) => (
                <th key={f.columnName} className="px-4 py-2.5 font-medium text-zinc-500 text-xs uppercase">
                  {f.label}
                </th>
              ))}
              <th className="px-4 py-2.5 font-medium text-zinc-500 text-xs uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {data.length === 0 && (
              <tr>
                <td colSpan={displayFields.length + 2} className="px-4 py-8 text-center text-zinc-400">
                  No hay registros
                </td>
              </tr>
            )}
            {data.map((row) => (
              <tr key={row.id as string} className="hover:bg-zinc-50">
                <td className="px-4 py-2.5 font-mono text-xs text-zinc-400">{String(row.id ?? "")}</td>
                {displayFields.map((f) => (
                  <td key={f.columnName} className="px-4 py-2.5 text-zinc-700">
                    {String(row[f.columnName] ?? "")}
                  </td>
                ))}
                <td className="px-4 py-2.5">
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/${tableName}/${row.id}`}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(Number(row.id))}
                      className="text-xs text-red-500 hover:underline cursor-pointer"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal
          open
          variant={modal.variant}
          title={modal.title}
          message={modal.message}
          confirmText={modal.confirmText}
          cancelText={modal.cancelText}
          onConfirm={modal.onConfirm}
          onCancel={modal.onCancel}
        />
      )}
    </>
  );
}
