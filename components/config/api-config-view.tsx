"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ApiConfigView() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>API Endpoints</CardTitle>
          <CardDescription>
            Configure the API endpoints for external integration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="baseUrl" className="text-right">
              Base URL
            </Label>
            <Input
              id="baseUrl"
              defaultValue="https://api.imci.example.com/v1"
              className="col-span-3"
              placeholder="https://api.example.com"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="flowsPath" className="text-right">
              Flows Path
            </Label>
            <Input
              id="flowsPath"
              defaultValue="/flows"
              className="col-span-3"
              placeholder="/flows"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="variablesPath" className="text-right">
              Variables Path
            </Label>
            <Input
              id="variablesPath"
              defaultValue="/variables"
              className="col-span-3"
              placeholder="/variables"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="testingPath" className="text-right">
              Testing Path
            </Label>
            <Input
              id="testingPath"
              defaultValue="/testing"
              className="col-span-3"
              placeholder="/testing"
            />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Authentication</CardTitle>
          <CardDescription>
            Configure API authentication settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="apiKey" className="text-right">
              API Key
            </Label>
            <Input
              id="apiKey"
              type="password"
              defaultValue="••••••••••••••••"
              className="col-span-3"
              placeholder="Enter API key"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
