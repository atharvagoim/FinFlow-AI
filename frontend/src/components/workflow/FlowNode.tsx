import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { nodeMeta, branchingNodeTypes } from "./nodeMeta";
import { NodeType } from "../../services/workflowService";

function FlowNodeComponent({ data, selected }: NodeProps<{ label: string; type: NodeType }>) {
  const meta = nodeMeta[data.type];
  const Icon = meta.icon;
  const isBranching = branchingNodeTypes.includes(data.type);

  return (
    <div
      className={`min-w-[190px] rounded-xl border bg-white dark:bg-slate-900 shadow-md transition-shadow ${
        selected ? "border-brand-500 ring-2 ring-brand-500/30" : "border-slate-200 dark:border-slate-700"
      }`}
    >
      {data.type !== "trigger" && <Handle type="target" position={Position.Left} className="!bg-slate-400 !w-2.5 !h-2.5" />}

      <div className="flex items-center gap-2.5 px-3.5 py-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-white" style={{ backgroundColor: meta.color }}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{data.label}</p>
          <p className="truncate text-[11px] uppercase tracking-wide text-slate-400">{meta.label}</p>
        </div>
      </div>

      {isBranching ? (
        <>
          <Handle type="source" position={Position.Right} id="true" style={{ top: "35%" }} className="!bg-emerald-500 !w-2.5 !h-2.5" />
          <Handle type="source" position={Position.Right} id="false" style={{ top: "70%" }} className="!bg-red-500 !w-2.5 !h-2.5" />
          <div className="flex justify-between px-3 pb-1.5 text-[10px] font-medium">
            <span className="text-emerald-600">true</span>
            <span className="text-red-500">false</span>
          </div>
        </>
      ) : (
        <Handle type="source" position={Position.Right} className="!bg-slate-400 !w-2.5 !h-2.5" />
      )}
    </div>
  );
}

export const FlowNode = memo(FlowNodeComponent);
export const nodeTypesMap = { finflowNode: FlowNode };
