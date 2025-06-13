"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateApiConfig } from "@/actions/api-config";

interface ApiConfig {
  apiKey: string;
  baseUrl: string;
}

interface ApiConfigFormProps {
  initialData: ApiConfig;
}

export function ApiConfigForm({ initialData }: ApiConfigFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiKey, setApiKey] = useState(initialData.apiKey);
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await updateApiConfig({ apiKey });
      if (!result.success) {
        throw new Error(result.error);
      }
      toast.success("API configuration updated successfully");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update API configuration"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="baseUrl" className="text-right">
          Base URL
        </Label>
        <Input
          id="baseUrl"
          value={initialData.baseUrl}
          className="col-span-3"
          disabled
          readOnly
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="apiKey" className="text-right">
          API Key
        </Label>
        <div className="col-span-3">
          <Input
            id="apiKey"
            type={showApiKey ? "text" : "password"}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your API key"
            disabled={isSubmitting}
          />
          <button
            type="button"
            onClick={() => setShowApiKey(!showApiKey)}
            className="absolute right-2 top-2 text-sm text-muted-foreground"
          >
            {showApiKey ? "Hide" : "Show"}
          </button>
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
