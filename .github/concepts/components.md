# Component Patterns

## Base Component Structure

Components should follow these base patterns:

```typescript
interface ComponentProps {
  required: string
  optional?: string
}

export function Component({ required, optional = "default" }: ComponentProps) {
  return (...)
}
```

## Form Components

```typescript
export function FormComponent() {
  const form = useForm<z.infer<typeof Schema>>({
    resolver: zodResolver(Schema),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="fieldName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Label</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
```

## Data Table Components

Use the DataTable component pattern for listing data:

```typescript
export function DataTableComponent() {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchableColumns={[]}
      filterableColumns={[]}
    />
  );
}
```

## UI Component Patterns

### shadcn/ui Extensions

```typescript
const Component = React.forwardRef<HTMLElementType, ComponentProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("base-styles more-styles additional-variants", className)}
      {...props}
    />
  )
);
Component.displayName = "Component";
```

### Theme Integration

```typescript
// Using cn utility for class merging
import { cn } from "@/lib/utils"

// Using CSS variables for theming
className={cn(
  "bg-background text-foreground",
  "dark:bg-dark-background dark:text-dark-foreground"
)}
```

### Mobile-First Design

```typescript
className={cn(
  "w-full p-2",                    // Base styles
  "sm:w-auto sm:p-4",             // Small screens
  "md:w-[500px] md:p-6",          // Medium screens
  "lg:w-[800px] lg:p-8"           // Large screens
)}
```

## Hook Patterns

### Custom Hook Structure

```typescript
export function useCustomHook(params: HookParams) {
  const [state, setState] = useState(initialState);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Effect logic
  }, [params]);

  const handleAction = useCallback(() => {
    // Action logic
  }, [params]);

  return {
    state,
    error,
    isLoading,
    handleAction,
  };
}
```

### Error Handling

```typescript
export function useDataFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network error");
      setData(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    }
  };

  return { data, error, fetchData };
}
```

## Utility Function Patterns

### Type Guards

```typescript
export function isErrorWithMessage(
  error: unknown
): error is { message: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as Record<string, unknown>).message === "string"
  );
}
```

### String Utilities

```typescript
export function toTitleCase(str: string = "") {
  return str
    .replace(/([A-Z])/g, " $1")
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
    .trim();
}
```

### Class Name Utilities

```typescript
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```
