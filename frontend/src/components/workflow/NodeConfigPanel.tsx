import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Node } from "reactflow";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { nodeMeta } from "./nodeMeta";
import { NodeType } from "../../services/workflowService";

interface Props {
  node: Node<{ label: string; type: NodeType; config: Record<string, unknown> }> | null;
  onClose: () => void;
  onChange: (id: string, label: string, config: Record<string, unknown>) => void;
  onDelete: (id: string) => void;
}

// Node configuration is intentionally a raw JSON editor: each node type has
// a different config shape (see backend/src/workflow-engine/nodes/*), and a
// generic editor here avoids maintaining 15 bespoke forms while still
// letting power users wire up {{trigger.field}} template bindings directly.
export function NodeConfigPanel({ node, onClose, onChange, onDelete }: Props) {
  const [label, setLabel] = useState("");
  const [configText, setConfigText] = useState("{}");
  const [jsonError, setJsonError] = useState("");

  useEffect(() => {
    if (node) {
      setLabel(node.data.label);
      setConfigText(JSON.stringify(node.data.config || {}, null, 2));
      setJsonError("");
    }
  }, [node]);

  if (!node) return null;
  const meta = nodeMeta[node.data.type];

  function save() {
    try {
      const parsed = JSON.parse(configText);
      onChange(node!.id, label, parsed);
      setJsonError("");
    } catch {
      setJsonError("Invalid JSON");
    }
  }

  return (
    <aside className="w-80 flex-shrink-0 overflow-y-auto border-l border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 backdrop-blur-lg p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: meta.color }}>{meta.label}</p>
          <p className="text-xs text-slate-400">{meta.description}</p>
        </div>
        <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><X className="h-4 w-4" /></button>
      </div>

      <Input label="Node label" value={label} onChange={(e) => setLabel(e.target.value)} className="mb-4" />

      <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">
        Config (JSON — supports {"{{trigger.field}}"} and {"{{nodeId.field}}"} bindings)
      </label>
      <textarea
        value={configText}
        onChange={(e) => setConfigText(e.target.value)}
        rows={12}
        spellCheck={false}
        className="input-base font-mono text-xs leading-relaxed"
      />
      {jsonError && <p className="mt-1 text-xs text-red-500">{jsonError}</p>}

      <div className="mt-4 flex gap-2">
        <Button onClick={save} className="flex-1">Apply</Button>
        <Button variant="danger" onClick={() => onDelete(node!.id)}>Delete</Button>
      </div>
    </aside>
  );
}
