import { getFlowById } from "@/actions/flows";
import { getOrCreateFlowVersion } from "@/actions/flow-versions";
import { FlowHeader } from "@/components/flow/flow-header";
import { FlowEditor } from "@/components/flow/flow-editor";

interface PageProps {
  params: Promise<{ flowId: string }>;
}

export default async function FlowPage({ params }: PageProps) {
  const { flowId } = await params;

  const result = await getFlowById(flowId);

  if (!result.success || !result.data) {
    return <div>Flow not found</div>;
  }

  const flow = result.data;

  // Get or create flow version
  const versionResult = await getOrCreateFlowVersion(flowId);
  const latestVersion = versionResult.success ? versionResult.data : null;

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 p-6 pb-0">
        <FlowHeader flow={flow} />
      </div>
      <div className="min-h-0 flex-1 p-6">
        <FlowEditor flow={flow} latestVersionId={latestVersion?.id} />
      </div>
    </div>
  );
}
