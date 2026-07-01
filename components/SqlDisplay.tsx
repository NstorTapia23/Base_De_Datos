export function SqlDisplay({ sql, params }: { sql: string; params: unknown[] }) {
  return (
    <details className="mt-2 text-xs" open>
      <summary className="cursor-pointer font-mono text-zinc-500 hover:text-zinc-800">
        SQL generado
      </summary>
      <pre className="mt-1 overflow-x-auto rounded border border-zinc-200 bg-zinc-50 p-3 font-mono text-xs text-zinc-700">
        <code>{sql}</code>
        {params.length > 0 && (
          <span className="block mt-1 text-zinc-400">
            -- Parámetros: [{params.map((p) => JSON.stringify(p)).join(", ")}]
          </span>
        )}
      </pre>
    </details>
  );
}
