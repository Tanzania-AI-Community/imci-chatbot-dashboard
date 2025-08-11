import { NextResponse } from "next/server";
import { getAllPublishedFlowVersionsWithData } from "@/actions/flow-versions";
import { getEncryptedApiKey } from "@/actions/api-config";
import { validateApiKey } from "@/lib/api-auth";

export async function GET(request: Request) {
  try {
    // Extract API key from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization header" },
        { status: 401 }
      );
    }

    const providedApiKey = authHeader.substring(7);

    // Get the stored encrypted API key
    const encryptedApiKey = await getEncryptedApiKey();
    if (!encryptedApiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    // Validate the provided API key
    const isValidKey = validateApiKey(providedApiKey, encryptedApiKey);
    if (!isValidKey) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    // Fetch all published flow versions with complete data
    const result = await getAllPublishedFlowVersionsWithData();

    if (!result.success || !result.data) {
      return NextResponse.json(
        { error: result.error || "Failed to fetch flow data" },
        { status: 500 }
      );
    }

    // Transform the data to match the Flow Editor's JSON view structure
    const flowsData = result.data.map((item: any) => {
      const version = {
        id: item.version.id,
        status: item.version.status,
        version_number: item.version.version_number,
        entry_conditions: item.version.entry_conditions || [],
        created_at: item.version.created_at,
        published_at: item.version.published_at,
        flow_name: item.version.flow_name,
      };

      // Compose the flowData object
      const flowData = {
        nodes: item.nodes.map((node: any) => ({
          id: node.id,
          type: node.type,
          content: node.content,
          next: node.next,
          conditions: node.conditions,
          variables: node.variables,
        })),
        variables: item.variables.map((variable: any) => ({
          id: variable.id,
          name: variable.name,
          type: variable.type,
          description: variable.description ?? undefined,
          default_value: variable.default_value,
          is_global: variable.is_global,
        })),
        conditions: [
          // Entry conditions (type: 'entry')
          ...(item.version.entry_conditions || []).map((c: any) => ({
            ...c,
            type: "entry",
          })),
          // Other conditions (type: 'diagnosis' or as provided)
          ...(item.conditions || []).map((c: any) => ({
            ...c,
            type: c.type || "diagnosis",
          })),
        ],
        diagnoses: item.diagnoses.map((diagnosis: any) => ({
          ...diagnosis,
          conditions: (diagnosis.conditions || []).map((c: any) => ({
            ...c,
            operator: c.operator,
            type: c.type || "diagnosis",
          })),
          medications: (diagnosis.medications || []).map((m: any) => ({
            ...m,
            medication: m.medication ? { name: m.medication.name } : undefined,
          })),
          advice: (diagnosis.advice || []).map((a: any) => ({
            ...a,
            category: a.category ?? null,
          })),
        })),
        flow: {
          id: item.version.flow_id,
          name: item.version.flow_name,
          description: item.version.flow_description ?? null,
          status: item.version.status,
          created_at: item.version.created_at,
          updated_at: item.version.updated_at ?? null,
        },
      };

      return { version, flowData };
    });

    return NextResponse.json({
      success: true,
      data: flowsData,
      timestamp: new Date().toISOString(),
      total_flows: flowsData.length,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
