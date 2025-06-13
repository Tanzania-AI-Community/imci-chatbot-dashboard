"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function ApiIntegrationForm() {
  const [apiEndpoint, setApiEndpoint] = useState(
    "https://api.example.com/imci"
  );
  const [apiKey, setApiKey] = useState("");

  const handleSave = () => {
    toast.success("API settings have been saved successfully.");
  };

  const handleTestConnection = () => {
    toast.promise(new Promise((resolve) => setTimeout(resolve, 2000)), {
      loading: "Testing connection...",
      success: "Connection successful!",
      error: "Connection failed. Please check your settings.",
    });
  };

  return (
    <form className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="api-endpoint">API Endpoint</Label>
        <Input
          id="api-endpoint"
          value={apiEndpoint}
          onChange={(e) => setApiEndpoint(e.target.value)}
        />
        <p className="text-sm text-muted-foreground">
          The URL where flow configurations will be deployed
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="api-key">API Key</Label>
        <Input
          id="api-key"
          type="password"
          placeholder="••••••••••••••••"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        <p className="text-sm text-muted-foreground">
          Authentication key for the API
        </p>
      </div>

      <div className="flex space-x-4">
        <Button variant="outline" onClick={handleTestConnection}>
          Test Connection
        </Button>
        <Button onClick={handleSave}>Save Settings</Button>
      </div>
    </form>
  );
}
