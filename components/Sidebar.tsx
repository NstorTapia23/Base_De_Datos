import Link from "next/link";
import { tableOrder, tableConfigs } from "@/lib/table-config";

export function Sidebar({ active }: { active?: string }) {
  return (
    <aside className="w-64 shrink-0 border-r border-zinc-200 bg-white">
      <div className="p-4 border-b border-zinc-200">
        <Link href="/admin" className="text-lg font-bold text-zinc-800">
          Admin BD
        </Link>
        <p className="text-xs text-zinc-400 mt-0.5">Gestión de Tesis</p>
      </div>
      <nav className="p-2">
        <Link
          href="/admin"
          className={`block rounded px-3 py-2 text-sm mb-0.5 ${
            !active ? "bg-zinc-100 font-medium text-zinc-900" : "text-zinc-600 hover:bg-zinc-50"
          }`}
        >
          Dashboard
        </Link>
        {tableOrder.map((slug) => {
          const config = tableConfigs[slug];
          return (
            <Link
              key={slug}
              href={`/admin/${slug}`}
              className={`block rounded px-3 py-2 text-sm mb-0.5 ${
                active === slug
                  ? "bg-zinc-100 font-medium text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              {config.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
