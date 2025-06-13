# Page Creation Guide

## Basic Page Structure

```typescript
// app/dashboard/flows/[flowId]/page.tsx
interface PageProps {
  params: { flowId: string };
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function FlowPage(props: PageProps) {
  const { flowId } = props.params;
  const searchParams = await props.searchParams;
  const queryParams = flowSearchParamsCache.parse(searchParams);
  const flowDataPromise = getFlowData(flowId, queryParams);

  return (
    <div className="flex min-h-screen w-full flex-col p-2">
      <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0">
        <React.Suspense fallback={<FlowEditorSkeleton />}>
          <FlowEditor flowDataPromise={flowDataPromise} />
        </React.Suspense>
      </main>
    </div>
  );
}
```

## Search Params Validation

In `lib/validators.ts`:

```typescript
export const flowSearchParamsCache = createSearchParamsCache({
  version: parseAsInteger.withDefault(1),
  view: parseAsStringEnum(["editor", "preview", "rules"]),
  isDraft: parseAsBoolean.withDefault(true),
});
```

## Route Organization

- Place under `app/dashboard/`
- Common routes:
  - `/dashboard` - Main dashboard
  - `/dashboard/flows` - Flow management
  - `/dashboard/flows/[flowId]` - Flow editor/preview
  - `/dashboard/flows/[flowId]/versions` - Version management
  - `/dashboard/config` - Global configuration
  - `/dashboard/settings` - User settings
- Always include:
  - loading.tsx for loading states
  - error.tsx for error handling
  - layout.tsx for section-specific layouts
