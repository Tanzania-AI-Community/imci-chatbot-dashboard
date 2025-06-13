import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { NodeEditor } from "@/components/flow/node-editor";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Trash, Plus, Search, Edit } from "lucide-react";
import { createNode, updateNode, deleteNode } from "@/actions/nodes";
import { getAllVariablesForFlow } from "@/actions/variables";
import { Node } from "@/types/nodes";
import { Variable } from "@/types/variables";

interface NodesTabProps {
  nodes: Node[];
  flowVersionId: string;
}

const getNodeBadgeClass = () => {
  // Since we only have "question" type now
  return "bg-blue-50 text-blue-700 border-blue-200";
};

export function NodesTab({
  nodes: initialNodes,
  flowVersionId,
}: NodesTabProps) {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState<"create" | "edit">("create");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [flowVariables, setFlowVariables] = useState<Variable[]>([]);

  const selectedNode = nodes.find((node) => node.id === selectedNodeId);

  // Fetch flow variables on component mount
  useEffect(() => {
    const fetchVariables = async () => {
      try {
        const response = await getAllVariablesForFlow(flowVersionId);
        if (response.success && response.data) {
          setFlowVariables(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch variables:", error);
      }
    };

    fetchVariables();
  }, [flowVersionId]);

  const handleNodeSelect = (nodeId: string) => {
    setSelectedNodeId(nodeId);
  };

  const handleAddNode = async (node: Node) => {
    try {
      const response = await createNode({
        ...node,
        flow_version_id: flowVersionId,
      });
      if (response.success) {
        setNodes((prev) => [...prev, response.data!]);
        toast.success("Node added successfully");
        setIsDialogOpen(false);
      } else {
        toast.error(response.error || "Failed to add node");
      }
    } catch (error) {
      toast.error("An unexpected error occurred while adding the node");
    }
  };

  const handleUpdateNode = async (node: Node) => {
    try {
      const response = await updateNode(node.id, node);
      if (response.success) {
        setNodes((prev) => prev.map((n) => (n.id === node.id ? node : n)));
        toast.success("Node updated successfully");
        setIsDialogOpen(false);
      } else {
        toast.error(response.error || "Failed to update node");
      }
    } catch (error) {
      toast.error("An unexpected error occurred while updating the node");
    }
  };

  const handleDeleteNode = async (nodeId: string) => {
    try {
      const response = await deleteNode(nodeId);
      if (response.success) {
        setNodes((prev) => prev.filter((node) => node.id !== nodeId));
        setSelectedNodeId(null);
        toast.success("Node deleted successfully");
      } else {
        toast.error(response.error || "Failed to delete node");
      }
    } catch (error) {
      toast.error("An unexpected error occurred while deleting the node");
    }
  };

  // Filter nodes based on search query
  const filteredNodes = nodes.filter(
    (node) =>
      node.node_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.content?.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full">
      {/* Left panel - Nodes list */}
      <div className="flex w-1/3 flex-col border-r">
        <div className="border-b p-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search nodes..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="space-y-1 p-2">
            {filteredNodes.map((node) => (
              <div
                key={node.id}
                className={`flex cursor-pointer items-center rounded-md p-2 ${
                  selectedNodeId === node.id ? "bg-muted" : "hover:bg-muted/50"
                }`}
                onClick={() => handleNodeSelect(node.id)}
              >
                <Search className="size-4 text-blue-500" />
                <div className="ml-2 flex-1 truncate">
                  <div className="font-medium">{node.node_id}</div>
                  {node.content?.text && (
                    <div className="truncate text-sm text-muted-foreground">
                      {node.content.text.length > 30
                        ? node.content.text.substring(0, 30) + "..."
                        : node.content.text}
                    </div>
                  )}
                </div>
                <Badge
                  variant="outline"
                  className={`ml-2 ${getNodeBadgeClass()}`}
                >
                  Q
                </Badge>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="border-t p-4">
          <Button
            className="w-full"
            size="sm"
            onClick={() => {
              setEditMode("create");
              setIsDialogOpen(true);
            }}
          >
            <Plus className="mr-2 size-4" /> Add Node
          </Button>
        </div>
      </div>

      {/* Right panel - Node details */}
      <div className="flex flex-1 flex-col">
        {selectedNode ? (
          <ScrollArea className="flex-1 p-4">
            <div className="mx-auto max-w-3xl space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">
                    {selectedNode.node_id}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Type:{" "}
                    <Badge className={getNodeBadgeClass()}>Question</Badge>
                  </p>
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditMode("edit");
                      setIsDialogOpen(true);
                    }}
                  >
                    <Edit className="mr-2 size-4" /> Edit Node
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteNode(selectedNode.id)}
                  >
                    <Trash className="mr-2 size-4" /> Delete Node
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Node Content Preview */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Question</Label>
                  <div className="rounded-md border p-3">
                    {selectedNode.content?.text || ""}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Options</Label>
                  <div className="space-y-2">
                    {selectedNode.content?.options?.map((option, index) => (
                      <div
                        key={index}
                        className="space-y-2 rounded-md border p-3"
                      >
                        <div>
                          <Label>Text:</Label>
                          <div className="text-sm">{option.text}</div>
                        </div>

                        {option.variables && option.variables.length > 0 && (
                          <div>
                            <Label>Variable Changes:</Label>
                            <div className="space-y-1">
                              {option.variables.map(
                                (varAssignment, varIndex) => {
                                  const variable = flowVariables.find(
                                    (v) => v.id === varAssignment.id
                                  );
                                  return (
                                    <div
                                      key={varIndex}
                                      className="flex items-center gap-2 text-sm"
                                    >
                                      <span className="font-medium">
                                        {variable?.name || varAssignment.id}:
                                      </span>
                                      <span>{String(varAssignment.value)}</span>
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-medium">No node selected</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Select a node from the list to view details
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Node Editor Dialog */}
      <Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogTitle asChild>
            <VisuallyHidden>
              {editMode === "create" ? "Create New Node" : "Edit Node"}
            </VisuallyHidden>
          </DialogTitle>
          <NodeEditor
            mode={editMode}
            initialNode={editMode === "edit" ? selectedNode : undefined}
            onSave={editMode === "create" ? handleAddNode : handleUpdateNode}
            flowVariables={flowVariables}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
