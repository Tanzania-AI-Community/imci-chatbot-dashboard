# State Management Concepts

## Zustand Store

### When to Use

- For complex global state that needs to be shared across components
- When you need persistent state with middleware
- For state that requires complex update logic
- When you need to share state between different parts of your application

### Implementation

```typescript
// ✅ Do - Create typed stores with proper structure
interface FlowState {
  flows: Flow[];
  currentFlow: Flow | null;
  setCurrentFlow: (flow: Flow) => void;
}

const useFlowStore = create<FlowState>((set) => ({
  flows: [],
  currentFlow: null,
  setCurrentFlow: (flow) => set({ currentFlow: flow }),
}));

// ❌ Don't - Create untyped stores or mix client/server state
const useStore = create((set) => ({
  data: null,
  fetchData: async () => {
    const res = await fetch("/api/data");
    set({ data: await res.json() });
  },
}));
```

## React Context

### When to Use

- For feature-specific state that doesn't need global access
- When you need to avoid prop drilling in a specific feature
- For dependency injection patterns
- When the state is only needed within a specific feature tree

### Implementation

```typescript
// ✅ Do - Create typed contexts with proper defaults
interface ThemeContext {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContext | null>(null)

export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setTheme] = useState<Theme>("light")
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// ❌ Don't - Create contexts without proper typing or error handling
const Context = createContext({})
```

## Local Component State

### When to Use

- For UI-specific state (open/closed, selected items, etc.)
- When state doesn't need to be shared with other components
- For form input values and validation states
- For temporary state that doesn't affect other components

### Implementation

```typescript
// ✅ Do - Use appropriate hooks for state management
function Form() {
  const [values, setValues] = useState<FormValues>({
    name: "",
    email: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // ... rest of component
}

// ❌ Don't - Use global state for component-specific state
function Form() {
  const { values, setValues } = useGlobalStore();
  // This makes the component tightly coupled to global state
}
```
