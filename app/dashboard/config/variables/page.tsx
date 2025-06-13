import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { VariablesList } from "@/components/config/variables-list";
import { getGlobalVariables } from "@/actions/variables";

export default async function VariablesPage() {
  const result = await getGlobalVariables();
  const variables = result.success && result.data ? result.data : [];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h3 className="text-lg font-medium">Global Variables</h3>
        <p className="text-sm text-muted-foreground">
          Configure system-wide variables available to all flows.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Variable Management</CardTitle>
          <CardDescription>
            Manage your global variables that are available across all flows.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VariablesList initialVariables={variables} context="global" />
        </CardContent>
      </Card>
    </div>
  );
}
