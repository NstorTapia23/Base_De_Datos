import Link from "next/link";
import { getDashboardCounts } from "@/lib/queries";
import { tableOrder, tableConfigs } from "@/lib/table-config";
import { SqlDisplay } from "@/components/SqlDisplay";

export default async function AdminDashboard() {
  const { counts, sqlInfos } = await getDashboardCounts();

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-800 mb-6">Dashboard</h1>
      <p className="text-sm text-zinc-500 mb-6">
        Panel de administración educativa — Sistema de Gestión de Tesis
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {tableOrder.map((slug) => {
          const config = tableConfigs[slug];
          return (
            <Link
              key={slug}
              href={`/admin/${slug}`}
              className="rounded border border-zinc-200 bg-white p-4 hover:shadow-sm transition-shadow"
            >
              <div className="text-2xl font-bold text-zinc-800">{counts[slug] ?? 0}</div>
              <div className="text-sm text-zinc-500 mt-1">{config.label}</div>
            </Link>
          );
        })}
      </div>

      <details className="mt-6" open>
        <summary className="cursor-pointer text-sm font-medium text-zinc-600 hover:text-zinc-800 mb-3">
          Ver consultas SQL del Dashboard
        </summary>
        <div className="space-y-3">
          {tableOrder.map((slug) => (
            <div key={slug}>
              <p className="text-xs font-medium text-zinc-500 mb-1">{tableConfigs[slug].label}</p>
              <SqlDisplay sql={sqlInfos[slug].sql} params={sqlInfos[slug].params} />
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
