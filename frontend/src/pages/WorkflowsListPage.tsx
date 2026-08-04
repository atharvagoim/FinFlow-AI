import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "../components/layout/AppLayout";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge, statusColor } from "../components/ui/Badge";
import { listWorkflows, createWorkflow, generateWorkflowFromPrompt } from "../services/workflowService";
import { formatDate } from "../utils/format";
import { Plus, Sparkles, GitBranch, Loader2 } from "lucide-react";
import { v4 as uuid } from "uuid";

export default function WorkflowsListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: workflows, isLoading } = useQuery({ queryKey: ["workflows"], queryFn: listWorkflows });
  const [prompt, setPrompt] = useState("");

  const createBlank = useMutation({
    mutationFn: () =>
      createWorkflow({
        name: "Untitled Workflow",
        status: "draft",
        triggerType: "manual",
        nodes: [{ id: uuid(), type: "trigger", label: "Trigger", position: { x: 0, y: 150 }, config: {} }],
        edges: [],
      }),
    onSuccess: (wf) => navigate(`/workflows/${wf._id}`),
  });

  const generate = useMutation({
    mutationFn: () => generateWorkflowFromPrompt(prompt),
    onSuccess: (wf) => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      navigate(`/workflows/${wf._id}`);
    },
  });

  return (
    <AppLayout title="Workflow Builder">
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-brand-600" />
          <p className="font-medium text-sm">Describe an automation and let AI build it</p>
        </div>
        <div className="flex gap-2">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder='e.g. "Whenever an invoice above ₹50,000 is created, request manager approval and notify Slack"'
            className="input-base flex-1"
          />
          <Button onClick={() => generate.mutate()} disabled={!prompt.trim()} loading={generate.isPending}>
            <Sparkles className="h-4 w-4" /> Generate
          </Button>
          <Button variant="secondary" onClick={() => createBlank.mutate()} loading={createBlank.isPending}>
            <Plus className="h-4 w-4" /> Blank workflow
          </Button>
        </div>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-brand-600" /></div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workflows?.map((wf) => (
            <Card key={wf._id} className="cursor-pointer" onClick={() => navigate(`/workflows/${wf._id}`)}>
              <div className="flex items-start justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                  <GitBranch className="h-4.5 w-4.5" />
                </div>
                <Badge color={statusColor(wf.status)}>{wf.status}</Badge>
              </div>
              <p className="mt-3 font-display font-semibold text-slate-800 dark:text-slate-100">{wf.name}</p>
              <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{wf.description || "No description"}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                <span>{wf.nodes.length} nodes</span>
                <span>Updated {formatDate(wf.updatedAt)}</span>
              </div>
            </Card>
          ))}
          {workflows?.length === 0 && <p className="text-sm text-slate-400">No workflows yet — create one above.</p>}
        </div>
      )}
    </AppLayout>
  );
}
