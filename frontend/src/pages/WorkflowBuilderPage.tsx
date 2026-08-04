import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactFlow, {
  addEdge, applyNodeChanges, applyEdgeChanges, Background, Controls, MiniMap,
  Connection, Edge, Node, NodeChange, EdgeChange, ReactFlowProvider, ReactFlowInstance,
} from "reactflow";
import "reactflow/dist/style.css";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { v4 as uuid } from "uuid";
import { ArrowLeft, Save, Play, ListChecks } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Badge, statusColor } from "../components/ui/Badge";
import { NodePalette } from "../components/workflow/NodePalette";
import { NodeConfigPanel } from "../components/workflow/NodeConfigPanel";
import { nodeTypesMap } from "../components/workflow/FlowNode";
import { nodeMeta, branchingNodeTypes } from "../components/workflow/nodeMeta";
import {
  getWorkflow, createWorkflow, updateWorkflow, triggerWorkflow, listExecutions,
  NodeType, WorkflowNode, WorkflowEdge,
} from "../services/workflowService";

function toFlowNode(n: WorkflowNode): Node {
  return { id: n.id, type: "finflowNode", position: n.position, data: { label: n.label, type: n.type, config: n.config } };
}
function fromFlowNode(n: Node): WorkflowNode {
  return { id: n.id, type: n.data.type, label: n.data.label, position: n.position, config: n.data.config || {} };
}

function BuilderCanvas() {
  const { id } = useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

  const [name, setName] = useState("Untitled Workflow");
  const [status, setStatus] = useState<"draft" | "active" | "paused" | "archived">("draft");
  const [triggerType, setTriggerType] = useState<"manual" | "event" | "webhook" | "schedule">("manual");
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const { data: workflow } = useQuery({ queryKey: ["workflow", id], queryFn: () => getWorkflow(id!), enabled: !isNew });

  useEffect(() => {
    if (workflow) {
      setName(workflow.name);
      setStatus(workflow.status as any);
      setTriggerType(workflow.triggerType as any);
      setNodes(workflow.nodes.map(toFlowNode));
      setEdges(workflow.edges.map((e) => ({
        id: e.id, source: e.source, target: e.target, sourceHandle: e.sourceHandle,
        label: e.sourceHandle, animated: true,
        style: { stroke: e.sourceHandle === "false" ? "#ef4444" : e.sourceHandle === "true" ? "#10b981" : "#94a3b8" },
      })));
    } else if (isNew) {
      const trigger = { id: uuid(), type: "trigger" as NodeType, label: "Trigger", position: { x: 40, y: 200 }, config: {} };
      setNodes([toFlowNode(trigger)]);
    }
  }, [workflow, isNew]);

  const { data: executions } = useQuery({ queryKey: ["executions", id], queryFn: () => listExecutions(id), enabled: !isNew, refetchInterval: 5000 });

  const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);

  const onConnect = useCallback((connection: Connection) => {
    // Edge validation: don't allow self-loops or duplicate connections on the same handle.
    if (connection.source === connection.target) return;
    setEdges((eds) => {
      const exists = eds.some((e) => e.source === connection.source && e.target === connection.target && e.sourceHandle === connection.sourceHandle);
      if (exists) return eds;
      const color = connection.sourceHandle === "false" ? "#ef4444" : connection.sourceHandle === "true" ? "#10b981" : "#94a3b8";
      return addEdge({ ...connection, animated: true, label: connection.sourceHandle, style: { stroke: color } }, eds);
    });
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const type = event.dataTransfer.getData("application/finflow-node") as NodeType;
    if (!type || !rfInstance || !wrapperRef.current) return;
    const bounds = wrapperRef.current.getBoundingClientRect();
    const position = rfInstance.screenToFlowPosition({ x: event.clientX - bounds.left, y: event.clientY - bounds.top });
    const newNode: Node = {
      id: uuid(), type: "finflowNode", position,
      data: { label: nodeMeta[type].label, type, config: {} },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [rfInstance]);

  const selectedNode = useMemo(() => nodes.find((n) => n.id === selectedNodeId) || null, [nodes, selectedNodeId]);

  function updateNodeConfig(nodeId: string, label: string, config: Record<string, unknown>) {
    setNodes((nds) => nds.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, label, config } } : n)));
  }
  function deleteNode(nodeId: string) {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    setSelectedNodeId(null);
  }

  const savePayload = () => ({
    name, status, triggerType,
    nodes: nodes.map(fromFlowNode),
    edges: edges.map((e) => ({ id: e.id, source: e.source!, target: e.target!, sourceHandle: e.sourceHandle || undefined })),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (isNew) {
        const created = await createWorkflow(savePayload());
        return created;
      }
      return updateWorkflow(id!, savePayload());
    },
    onSuccess: (wf) => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      if (isNew) navigate(`/workflows/${wf._id}`, { replace: true });
      else queryClient.invalidateQueries({ queryKey: ["workflow", id] });
    },
  });

  const runMutation = useMutation({
    mutationFn: () => triggerWorkflow(id!, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["executions", id] }),
  });

  return (
    <div className="flex h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg px-5 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/workflows")} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="!w-64 font-display font-semibold" />
          <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="input-base !w-32 !py-2">
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="archived">Archived</option>
          </select>
          <select value={triggerType} onChange={(e) => setTriggerType(e.target.value as any)} className="input-base !w-32 !py-2">
            <option value="manual">Manual</option>
            <option value="event">Event</option>
            <option value="webhook">Webhook</option>
            <option value="schedule">Schedule</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <Button variant="secondary" onClick={() => runMutation.mutate()} loading={runMutation.isPending}>
              <Play className="h-4 w-4" /> Run
            </Button>
          )}
          <Button onClick={() => saveMutation.mutate()} loading={saveMutation.isPending}>
            <Save className="h-4 w-4" /> Save
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <NodePalette />

        <div ref={wrapperRef} className="flex-1" onDrop={onDrop} onDragOver={(e) => e.preventDefault()}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setRfInstance}
            onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            onPaneClick={() => setSelectedNodeId(null)}
            nodeTypes={nodeTypesMap}
            fitView
          >
            <Background gap={20} color="#cbd5e1" />
            <Controls />
            <MiniMap pannable zoomable className="!bg-white dark:!bg-slate-900" />
          </ReactFlow>
        </div>

        {selectedNode ? (
          <NodeConfigPanel node={selectedNode as any} onClose={() => setSelectedNodeId(null)} onChange={updateNodeConfig} onDelete={deleteNode} />
        ) : (
          !isNew && (
            <aside className="w-80 flex-shrink-0 overflow-y-auto border-l border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 backdrop-blur-lg p-5">
              <div className="mb-3 flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-brand-600" />
                <p className="text-sm font-semibold">Recent Executions</p>
              </div>
              <div className="space-y-2">
                {executions?.map((ex: any) => (
                  <div key={ex._id} className="rounded-xl border border-slate-100 dark:border-slate-800 p-3">
                    <div className="flex items-center justify-between">
                      <Badge color={statusColor(ex.status)}>{ex.status}</Badge>
                      <span className="text-xs text-slate-400">{ex.triggeredBy}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{new Date(ex.createdAt).toLocaleString()}</p>
                  </div>
                ))}
                {(!executions || executions.length === 0) && <p className="text-xs text-slate-400">No runs yet. Click Run to execute this workflow.</p>}
              </div>
            </aside>
          )
        )}
      </div>
    </div>
  );
}

export default function WorkflowBuilderPage() {
  return (
    <ReactFlowProvider>
      <BuilderCanvas />
    </ReactFlowProvider>
  );
}
