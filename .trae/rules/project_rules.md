### Clean Code & Best Practices

- **ALWAYS** prioritize readability, maintainability, and simplicity.
- Follow established design patterns (e.g., Separation of Concerns, DRY - Don't Repeat Yourself).
- Write self-documenting code through clear variable names, function names, and minimal comments (comments should explain _why_, not _what_).
- Keep functions and components small and focused on a single responsibility.
- Refactor regularly to improve code quality and reduce technical debt.

### Export Patterns

- **ALWAYS** use `export const` for named exports that export const declarations
- Prefer named exports over default exports for better tree-shaking and IDE support
- Use descriptive names that clearly indicate the purpose of the exported item

```typescript
// ✅ Good
export const UserProfile = () => { ... }
export const useUserData = () => { ... }
export const API_ENDPOINTS = { ... }

// ❌ Avoid
export default function UserProfile() { ... }
const UserProfile = () => { ... }
export default UserProfile
```

### Custom Hooks Strategy

- **ALWAYS** create custom hooks for components to separate logic (state, side effects, data fetching in client components) from presentation.
- Custom hooks should handle:
- State management
- Side effects (useEffect)
- Client-side data fetching (if necessary, see Data Fetching Strategy)
- Business logic relevant to the UI
- Keep components focused on rendering and user interactions.

```typescript
// ✅ Good - Custom hook for client-side logic/fetching
export const useUserProfileClient = (userId: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Client-side fetch logic (e.g., for interactive components)
  }, [userId]);

  return { user, loading, refetch: () => {} };
};

// ✅ Good - Component using the hook (likely a Client Component)
('use client');
import { useUserProfileClient } from '@/features/user/hooks'; // Example hook location

export const UserProfile = ({ userId }: { userId: string }) => {
  const { user, loading } = useUserProfileClient(userId);

  if (loading) return <div>Loading...</div>;
  return <div>{user?.name}</div>;
};
```

### URL Parameter Handling with nuqs

- **ALWAYS** use `nuqs` library for URL parameter handling in Client Components.
- Prefer type-safe parameter parsing.
- Use `useQueryState` for single parameters and `useQueryStates` for multiple parameters.
- Implement proper fallback values and validation.

```typescript
"use client";
import { useQueryState, parseAsString, parseAsInteger } from "nuqs";

// ✅ Good - Single parameter in a Client Component
export const useSearchQuery = () => {
  return useQueryState("q", parseAsString.withDefault(""));
};
```

### Server Actions with Zod + next-safe-action

- **ALWAYS** use Zod for server action input validation.
- **ALWAYS** use `next-safe-action` for server action protection and error handling.
- Define clear input/output schemas.
- Implement proper error handling and user feedback.
- Server actions are ideal for mutating data on the server from client interactions.

```typescript
import { z } from "zod";
import { createSafeAction } from "next-safe-action";
import { userService } from "../services"; // Call services from actions

// ✅ Good - Schema definition
export const CreateUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  age: z.number().min(18, "Must be at least 18 years old"),
});

// ✅ Good - Safe action
export const createUserAction = createSafeAction(
  CreateUserSchema,
  async (data) => {
    // Call business logic from service
    const user = await userService.createUserWithProfile(data);
    return { success: true, user };
  },
);
```

## Data Fetching Strategy

### Prioritize Fetching in Server Components

- **ALWAYS** try to fetch data in Server Components whenever possible.
- This leverages the server environment for direct database access (via ORM queries) or internal API calls, improving performance, SEO, and security.
- Pass fetched data down to Client Components as props.
- Only fetch data in Client Components when it's required for interactive UI updates (e.g., pagination, filtering, real-time data, or data dependent on client-side state/events).

```typescript
// ✅ Good - Fetching data in a Server Component (Page or Layout)
// app/users/page.tsx
import { getUsers } from '@/features/user/queries'; // Server-side query
import { UserList } from './user-list'; // Client Component

export default async function UsersPage() {
  const users = await getUsers(); // Fetch data on the server

  return (
    <div>
      <h1>Users</h1>
      <UserList users={users} /> {/* Pass data to Client Component */}
    </div>
  );
}

// ✅ Good - Client Component receiving data as props
// app/users/user-list.tsx
('use client');
import type { User } from '@/features/user/types'; // Import type

export const UserList = ({ users }: { users: User[] }) => {
  // Client-side logic for displaying/interacting with users
  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
};
```

## SOLID Principles

Applying SOLID principles leads to more maintainable, flexible, and scalable code.

### 1. Single Responsibility Principle (SRP)

_A module, class, or function should have only one reason to change._

- **Application:** Our feature-based structure embodies SRP. Each folder (`actions`, `queries`, `services`, `schemas`, `types`) and often each file within them, has a single, well-defined responsibility.
- `actions`: Handle server-side mutations triggered by clients.
- `queries`: Handle data retrieval from the data source.
- `services`: Encapsulate business logic and orchestrate operations.
- `schemas.ts`: Define data validation rules.
- `types.ts`: Define data structures.
- **Benefit:** Changes to data validation don't affect business logic, changes to data fetching don't affect server actions, etc. This reduces the risk of introducing bugs and makes the codebase easier to understand and modify.

### 2. Open/Closed Principle (OCP)

_Software entities should be open for extension, but closed for modification._

- **Application:** Design modules and functions so that new functionality can be added without altering existing, working code. This can be achieved through:
- **Composition:** Building new features by combining existing services or queries.
- **Configuration:** Allowing behavior to be modified via configuration rather than code changes.
- **Strategy Pattern:** Defining interfaces (via types) for different implementations (e.g., different payment gateways) and injecting the desired strategy.
- **Example:** If you have a `notificationService`, instead of modifying its core sending function to add SMS, you could define a `NotificationChannel` type and have separate modules/functions for email and SMS that adhere to this type. The `notificationService` would then accept and use instances of `NotificationChannel`.

```typescript
// features/notifications/types.ts
export type NotificationChannel = {
  send: (to: string, message: string) => Promise<void>;
};

// features/notifications/services/email-channel.ts
import type { NotificationChannel } from "../types";
export const emailChannel: NotificationChannel = {
  send: async (to, message) => {
    console.log(`Sending email to ${to}: ${message}`);
    // Email sending logic
  },
};

// features/notifications/services/sms-channel.ts
import type { NotificationChannel } from "../types";
export const smsChannel: NotificationChannel = {
  send: async (to, message) => {
    console.log(`Sending SMS to ${to}: ${message}`);
    // SMS sending logic
  },
};

// features/notifications/services/notification-service.ts
import type { NotificationChannel } from "../types";

export const notificationService = {
  async notify(channel: NotificationChannel, to: string, message: string) {
    await channel.send(to, message); // Uses the channel abstraction
  },
};

// Usage (Open for extension - add new channels without changing notify function)
import {
  notificationService,
  emailChannel,
  smsChannel,
} from "@/features/notifications";

await notificationService.notify(
  emailChannel,
  "test@example.com",
  "Hello via Email",
);
await notificationService.notify(smsChannel, "+1234567890", "Hello via SMS");
```

### 3. Liskov Substitution Principle (LSP)

_Objects of a superclass should be replaceable with objects of a subclass without affecting the correctness of the program._ (In TypeScript, this often translates to type compatibility and predictable behavior when substituting different implementations of a type contract).

- **Application:** When using types (`type` aliases), ensure that any concrete implementation used where that type is expected behaves as the type suggests. If you define a `UserRepository` type, any object implementing `UserRepository` should be usable interchangeably without breaking the consuming code.
- **Benefit:** Enables easier refactoring, testing (e.g., substituting mock implementations), and future changes to underlying data sources or services.

### 4. Interface Segregation Principle (ISP)

_Clients should not be forced to depend upon interfaces that they do not use._ (In TypeScript, this applies to designing focused `type` aliases).

- **Application:** Define granular `type` aliases in `types.ts` that represent specific pieces of data or functionality needed by different parts of the application, rather than large, all-encompassing types.
- **Example:** Instead of one giant `User` type with every possible field, create `UserProfile`, `UserCredentials`, `UserSummary`, etc., and use intersection types (`&`) or utility types (`Pick`, `Omit`) to compose them where needed.
- **Benefit:** Reduces coupling and makes code easier to understand, as components/functions only see the data shapes they actually interact with.

```typescript
// features/user/types.ts
export type UserBasicInfo = {
  id: string;
  name: string;
  email: string;
};

export type UserAuditInfo = {
  createdAt: Date;
  updatedAt: Date;
};

export type UserRole = {
  role: "admin" | "user";
};

// Composed type for full user data
export type User = UserBasicInfo & UserAuditInfo & UserRole;

// Type for creating a new user (omits generated fields)
export type CreateUserInput = Omit<User, "id" | "createdAt" | "updatedAt">;

// A component/function only needing basic info can import just that type:
// import type { UserBasicInfo } from '@/features/user/types';
```

### 5. Dependency Inversion Principle (DIP)

_High-level modules should not depend on low-level modules. Both should depend on abstractions. Abstractions should not depend on details. Details should depend on abstractions._

- **Application:**
- **Depend on Types/Abstractions:** High-level services (`userService`) should depend on the _contracts_ (types or function signatures) defined for lower-level modules (`queries`), not the specific implementation details within the query functions themselves. While direct imports are used in our structure, the reliance is conceptually on the function signature and return type.
- **Inject Dependencies:** For more complex scenarios or easier testing, consider passing dependencies (like instances of services or configuration objects) into functions or constructors rather than hardcoding imports.
- **Example:** The `userService` depends on the `getUserById` function from the `queries` module. The "abstraction" is the function signature `(id: string) => Promise<User | null>`. The `userService` doesn't need to know _how_ `getUserById` fetches the user (whether it's from a database, cache, or external API), only _what_ it does and _what_ it returns (as defined by its signature and the `User` type).

```typescript
// features/user/services/user-service.ts
import { getUserById } from "../queries"; // Depending on the query function signature/contract
import type { CreateUserInput, User } from "../types"; // Depending on types (abstractions)

export const userService = {
  async createUserWithProfile(data: CreateUserInput): Promise<User> {
    // ... logic ...
  },

  async validateUserAccess(
    userId: string,
    resourceId: string,
  ): Promise<boolean> {
    const user = await getUserById(userId); // Using the query function via its contract
    // ... validation logic ...
  },
};
```

- **Benefit:** Decouples modules, making them easier to test, replace, and manage.

## Feature-Based Structure

### Directory Structure

```
src/
├── app/                          # App Router pages (Server & Client Components, Data Fetching)
├── components/                   # Reusable UI components (Prefer Client Components unless static)
│   ├── ui/                      # Base UI components
│   └── common/                  # Shared feature components
├── features/                    # Feature-based modules (Aligned with SRP)
│   ├── user/                    # User feature
│   │   ├── actions/             # Server actions (for mutations from client) - SRP
│   │   │   ├── create-user.ts
│   │   │   ├── update-user.ts
│   │   │   └── index.ts         # Export all actions
│   │   ├── queries/             # ORM queries / Data access (used by Server Components & Services) - SRP, DIP
│   │   │   ├── get-user.ts
│   │   │   ├── get-users.ts
│   │   │   └── index.ts         # Export all queries
│   │   ├── services/            # Business operations (used by Actions & Server Components) - SRP, OCP, DIP
│   │   │   ├── user-service.ts
│   │   │   ├── auth-service.ts
│   │   │   └── index.ts         # Export all services
│   │   ├── schemas.ts           # Zod validation schemas - SRP
│   │   ├── types.ts             # Type definitions - SRP, ISP, LSP
│   │   └── index.ts             # Export everything from feature
│   ├── product/                 # Product feature
│   │   ├── actions/
│   │   ├── queries/
│   │   ├── services/
│   │   ├── schemas.ts
│   │   ├── types.ts
│   │   └── index.ts
│   └── order/                   # Order feature
│       ├── actions/
│       ├── queries/
│       ├── services/
│       ├── schemas.ts
│       ├── types.ts
│       └── index.ts
├── hooks/                       # Global custom hooks (Primarily for Client Components) - SRP
├── lib/                         # Utilities and configurations (Server & Client compatible)
└── types/                       # Global type definitions (if needed) - SRP, ISP, LSP
```

### Feature Structure Rules (Reiterated with SOLID context)

#### 1. Actions Folder (SRP)

Contains server actions for the feature. These are typically called from Client Components to perform server-side mutations. They should call into `services` or `queries`.

```typescript
// features/user/actions/create-user.ts
import { createSafeAction } from "next-safe-action";
import { CreateUserSchema } from "../schemas"; // Depends on Schema (DIP)
import { userService } from "../services"; // Depends on Service (DIP)

export const createUserAction = createSafeAction(
  CreateUserSchema,
  async (data) => {
    // Call business logic from service
    const user = await userService.createUserWithProfile(data);
    return { success: true, user };
  },
);
```

#### 2. Queries Folder (SRP, DIP)

Contains ORM queries and data access logic. These are primarily used by Server Components and Services to fetch data directly from the database. They represent the low-level data access details that higher-level services depend on via their type/function signature contracts.

```typescript
// features/user/queries/get-user.ts
import { db } from "@/lib/db"; // Server-side database client (low-level detail)
import type { User } from "../types"; // Depends on Type (Abstraction - DIP)

export const getUserById = async (id: string): Promise<User | null> => {
  // Direct database access - use only in Server Components or Services
  return await db.user.findUnique({
    where: { id },
    include: { profile: true },
  });
};
```

#### 3. Services Folder (SRP, OCP, DIP)

Contains business logic and operations. This layer orchestrates queries, actions, and external interactions. Services depend on queries and other services via their defined contracts/types (DIP). They should be designed to be extendable (OCP).

```typescript
// features/user/services/user-service.ts
import { getUserById, createUser } from "../queries"; // Depends on Queries (via contracts - DIP)
import type { CreateUserInput, User } from "../types"; // Depends on Types (Abstractions - DIP, LSP)

export const userService = {
  async createUserWithProfile(data: CreateUserInput): Promise<User> {
    // Business logic here (SRP)
    const user = await createUser(data);
    // Additional operations...
    return user;
  },

  async validateUserAccess(
    userId: string,
    resourceId: string,
  ): Promise<boolean> {
    const user = await getUserById(userId); // Using the query function via its contract
    // Access validation logic (SRP)
    return user?.role === "admin" || user?.id === resourceId;
  },
  // Methods here should be open for extension, closed for modification (OCP)
};
```

#### 4. Schemas File (SRP)

Contains all Zod validation schemas for the feature.

```typescript
// features/user/schemas.ts
import { z } from "zod";
// This file's single responsibility is schema definition.
```

#### 5. Types File (SRP, ISP, LSP)

Contains TypeScript type definitions for the feature. Design types to be focused (ISP) and ensure implementations adhere to type contracts (LSP). The file's single responsibility is type definition (SRP).

```typescript
// features/user/types.ts
// Define granular types (ISP)
export type User = {
  /* ... */
};
export type CreateUserInput = {
  /* ... */
};
// Ensure any 'User' object can be substituted where 'User' is expected (LSP)
```

#### 6. Feature Index File

Main export file for the entire feature.

```typescript
// features/user/index.ts
// This file's responsibility is to provide a clean export surface for the feature (SRP)
export * from "./actions";
export * from "./queries";
export * from "./services";
export * from "./schemas";
export * from "./types";
```

### Import Patterns

Imports should be clean and organized, pointing to the feature index or specific files when necessary. This supports DIP by depending on the module's exported contract rather than internal details.

```typescript
// ✅ Clean imports from features (preferred) - Depending on the feature's public API (DIP)
import {
  createUserAction, // Action (used in Client Components)
  getUserById, // Query (used in Server Components/Services)
  userService, // Service (used in Server Components/Actions)
  CreateUserSchema, // Schema (used in Actions/Client Forms)
  type User, // Type (used everywhere) - Depending on Abstraction (DIP)
} from "@/features/user";

// ✅ Specific imports when needed (e.g., for clarity or avoiding circular deps)
import { createUserAction } from "@/features/user/actions";
import { getUserById } from "@/features/user/queries";
import type { User } from "@/features/user/types"; // Explicitly depending on Type (Abstraction - DIP)
```

## Type vs Interface Rules

### Always Use `type` Instead of `interface`

- **NEVER** use `interface` - always use `type`.
- `type` provides better composition (`&`, `|`) and union capabilities, which supports ISP and LSP by allowing for more flexible and precise type definitions and compositions.

```typescript
// ✅ Good - Use type (Supports ISP, LSP)
export type User = {
  /* ... */
};
export type CreateUserInput = Omit<User, "id">;
export type UserWithProfile = User & { profile: Profile };

// ❌ Avoid - Don't use interface
interface User {
  /* ... */
}
```

## Naming Conventions

Consistent naming supports readability and maintainability, aligning with Clean Code principles and SRP.

### Files and Folders

- Feature folders: kebab-case (`user-management`, `order-processing`)
- Files: kebab-case (`create-user.ts`, `user-service.ts`, `types.ts`, `schemas.ts`)
- Components: PascalCase (`UserProfile.tsx`, `OrderSummary.tsx`)
- Hooks: camelCase with `use` prefix (`useUserData`, `useSearchFilters`)

### Code Elements

- Types: PascalCase (`User`, `CreateUserInput`, `ApiResponse`) - Supports ISP, LSP
- Functions/Variables: camelCase (`createUser`, `getUserById`, `userService`) - Supports SRP
- Constants: SCREAMING_SNAKE_CASE (`API_ENDPOINTS`, `DEFAULT_PAGE_SIZE`)
- Schemas: PascalCase with `Schema` suffix (`CreateUserSchema`, `UpdateUserSchema`) - Supports SRP

## Advanced Patterns

### Feature Hook Composition (Client-side) (SRP)

Client-side hooks should have a single responsibility related to UI logic and client-side data needs.

```typescript
// features/user/hooks/use-user-management-client.ts (Client Component Hook)
"use client";
import {
  useUserProfileClient,
  useUserPermissionsClient,
} from "@/features/user/hooks"; // Assuming client hooks are in a 'hooks' subfolder

export const useUserManagementClient = (userId: string) => {
  // Composing other client hooks (SRP)
  const { user, loading: userLoading } = useUserProfileClient(userId);
  const { permissions, loading: permissionsLoading } =
    useUserPermissionsClient(userId);

  const loading = userLoading || permissionsLoading;

  return {
    user,
    permissions,
    loading,
    canEdit: permissions.includes("user:edit"),
    canDelete: permissions.includes("user:delete"),
  };
};
```

### Cross-Feature Dependencies (DIP)

Services and Server Components can depend on queries and services from other features. This dependency should ideally be on the public API (exported functions/types) of the depended-upon feature, adhering to DIP.

```typescript
// features/order/services/order-service.ts
import { getUserById } from "@/features/user/queries"; // Depending on user queries via contract
import { getProductById } from "@/features/product/queries"; // Depending on product queries via contract

export const orderService = {
  async createOrder(userId: string, productId: string) {
    // Uses queries from other features via their contracts (DIP)
    const user = await getUserById(userId);
    const product = await getProductById(productId);

    if (!user || !product) {
      throw new Error("Invalid user or product");
    }

    // Create order logic using fetched data
  },
};
```

## Performance Optimizations

### Lazy Loading Client Features/Components

```typescript
// Lazy load client feature components
import { lazy } from "react";

export const UserManagementClient = lazy(
  () => import("@/features/user/components/UserManagementClient"),
);
export const ProductCatalogClient = lazy(
  () => import("@/features/product/components/ProductCatalogClient"),
);
```

### Selective Imports

```typescript
// ✅ Import only what you need - Supports ISP and reduces bundle size
import { createUserAction } from "@/features/user/actions";
import type { User } from "@/features/user/types"; // Import type specifically from types.ts

// ❌ Avoid importing everything - Violates ISP and can increase bundle size
import * as UserFeature from "@/features/user";
```

## Testing Considerations

### Testable Units (SRP, DIP)

- Write unit tests for `queries`, `services`, and `schemas`. Their focused responsibilities (SRP) make them easier to test in isolation.
- Write integration tests for `actions`.
- Write component tests for UI components.
- Design hooks to be easily testable by isolating logic.
- The dependency on abstractions (DIP) makes it easier to mock dependencies for testing.

## Security Best Practices

### Server Action Security (SRP)

Server actions have the single responsibility of handling mutations securely on the server.

```typescript
import { auth } from "@/lib/auth"; // Authentication utility
import { createSafeAction } from "next-safe-action";
import { z } from "zod";

const SomeSchema = z.object({
  /* ... */
});

export const protectedAction = createSafeAction(
  SomeSchema, // Input validation (SRP)
  async (data) => {
    const session = await auth(); // Authentication check (SRP)
    if (!session?.user) {
      throw new Error("Unauthorized"); // Throw error if not authenticated
    }

    // Protected logic here (SRP)
  },
);
```

- Always validate input data (Zod).
- Always check authentication and authorization on the server.

## Common Anti-Patterns to Avoid

❌ **Don't:**

- Use `interface` instead of `type`.
- Mix feature logic across different feature folders (Violates SRP).
- Import from nested paths when index.ts exists (Violates DIP by depending on internal structure).
- Create circular dependencies between features (Violates DIP and creates tight coupling).
- Put business logic directly in actions or queries (Violates SRP).
- Fetch data directly in Client Components if it can be done in a Server Component (Violates Data Fetching Strategy).
- Put database access logic directly in components (use queries/services) (Violates SRP, DIP).
- Write large, monolithic functions or components (Violates SRP).
- Skip input validation or authorization checks on the server (Security Anti-Pattern).
- Create large, unfocused type definitions (Violates ISP).

✅ **Do:**

- Use `type` for all type definitions (Supports ISP, LSP).
- Keep feature logic contained within feature boundaries (Supports SRP).
- Use index.ts files for clean imports (exporting types from types.ts) (Supports DIP).
- Design features to be independent or have clear dependencies (Supports DIP).
- Separate business logic into services layer (Supports SRP, OCP, DIP).
- **Fetch data in Server Components whenever possible.**
- Use queries/services for data access (Supports SRP, DIP).
- Write small, focused functions and components (Supports SRP).
- Always validate inputs and check authorization on the server (Security Best Practice).
- Design focused and composable type definitions (Supports ISP, LSP).
