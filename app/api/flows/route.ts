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

    const providedApiKey = authHeader.substring(7); // Remove "Bearer " prefix

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

    // Transform the data to match the JSON viewer format
    const flowsData = result.data.map((item) => ({
      meta: {
        id: item.version.flow_id,
        name: item.version.flow_name,
        description: null, // We don't have flow description in version data
        status: item.version.status,
        created_at: item.version.created_at,
        updated_at: null, // We don't have updated_at in version data
      },
      version: {
        id: item.version.id,
        number: item.version.version_number,
        status: item.version.status,
        created_at: item.version.created_at,
        published_at: item.version.published_at,
      },
      entry_conditions: item.version.entry_conditions || [],
      variables: item.variables.map((variable: any) => ({
        id: variable.id,
        name: variable.name,
        type: variable.type,
        description: variable.description ?? undefined,
        default_value: variable.default_value,
        is_global: variable.is_global,
      })),
      diagnoses: item.diagnoses.map((diagnosis: any) => ({
        id: diagnosis.id,
        name: diagnosis.name,
        description: diagnosis.description ?? undefined,
        conditions:
          diagnosis.conditions?.map((condition: any) => ({
            id: condition.id,
            operator: condition.operator,
            value: condition.value,
            logical_operator: condition.logical_operator,
            variable_id: condition.variable_id,
          })) || [],
        medications:
          diagnosis.medications?.map((medication: any) => ({
            id: medication.id,
            name: medication.medication?.name,
            dosage: medication.dosage,
            duration: medication.duration,
            instructions: medication.instructions,
          })) || [],
        advice:
          diagnosis.advice?.map((advice: any) => ({
            id: advice.id,
            content: advice.advice_text,
            category: advice.category,
            priority: advice.priority,
          })) || [],
      })),
      nodes: item.nodes.map((node: any) => ({
        id: node.id,
        type: node.type,
        content: node.content,
        next: node.next,
        conditions: node.conditions,
        variables: node.variables,
      })),
      conditions: item.conditions.map((condition: any) => ({
        id: condition.id,
        operator: condition.operator,
        value: condition.value,
        logical_operator: condition.logical_operator,
        variable_id: condition.variable_id,
        type: condition.type,
        reference_id: condition.reference_id,
      })),
    }));

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
