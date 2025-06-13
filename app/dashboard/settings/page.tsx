import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { ApiConfigForm } from "@/components/config/api-config-form";
import { getApiConfig } from "@/actions/api-config";

export default async function SettingsPage() {
  const result = await getApiConfig();
  const apiConfig = {
    apiKey: result.success && result.data ? result.data.apiKey : "",
    baseUrl: result.success && result.data ? result.data.baseUrl : "",
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="text-sm text-muted-foreground">
        Configure the settings for your IMCI dashboard.
      </p>
      <Card>
        <CardHeader>
          <h4 className="text-sm font-medium">API Settings</h4>
          <CardDescription>
            Manage API authentication and connection details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ApiConfigForm initialData={apiConfig} />
        </CardContent>
      </Card>
    </div>
  );
}
