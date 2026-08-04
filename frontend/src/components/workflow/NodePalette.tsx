import { nodeMeta, nodeTypesList } from "./nodeMeta";

// Drag source for the canvas. On dragstart we stash the node type in
// dataTransfer so the canvas's onDrop handler knows what to instantiate.
export function NodePalette() {
  function onDragStart(e: React.DragEvent, type: string) {
    e.dataTransfer.setData("application/finflow-node", type);
    e.dataTransfer.effectAllowed = "move";
  }

  return (
    <aside className="w-64 flex-shrink-0 overflow-y-auto border-r border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-lg p-4">
      <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Nodes</p>
      <div className="space-y-1.5">
        {nodeTypesList.map((type) => {
          const meta = nodeMeta[type];
          const Icon = meta.icon;
          return (
            <div
              key={type}
              draggable
              onDragStart={(e) => onDragStart(e, type)}
              className="flex cursor-grab items-center gap-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/60 px-3 py-2.5 text-sm shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md active:cursor-grabbing"
              title={meta.description}
            >
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-white" style={{ backgroundColor: meta.color }}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <span className="font-medium text-slate-700 dark:text-slate-200">{meta.label}</span>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
