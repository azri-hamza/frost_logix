# AGENTS.md — AI Assistant Development Standards

Development standards and coding patterns for AI assistants (Claude Code, OpenCode, etc.) 
working on the Frost Logix project

# Frost Logix — Project Context & Development Standards

## Monorepo Structure

- **Monorepo tool:** Nx 22.5.3 with pnpm workspaces
- **Package manager:** pnpm (always use `-w` flag for root installs)

## Frontend (apps/web)

- **Framework:** Angular 20.3.17 — standalone components only, no NgModules
- **Change detection:** Zoneless (`provideZonelessChangeDetection()`) — no zone.js
- **Reactivity:** Signals (`signal`, `computed`, `effect`, `afterNextRender`) — no lifecycle hooks like `ngOnInit`
- **Build tool:** `@angular/build:application` (esbuild, NOT webpack or Vite)
- **Styling:** Tailwind CSS v4 + Spartan UI (shadcn-like components for Angular)
- **HTTP:** `provideHttpClient(withFetch())`
- **Template syntax:** New control flow (`@if`, `@for`, `@switch`) — never use `*ngIf` or `*ngFor`
- **Import alias for UI lib:** `@frost-logix/ui`
- **PostCSS config:** `.postcssrc.json` at project root (NOT `postcss.config.js`)
- **Proxy config:** `apps/web/proxy.conf.json` for local dev, `apps/web/proxy.docker.json` for Docker

## Backend (apps/api)

- **Framework:** NestJS 11
- **Language:** TypeScript
- **ORM:** Prisma 6 with PostgreSQL
- **Global API prefix:** `/api` (all routes are under `/api`)
- **Runtime:** Node.js 20

## Database

- **Database:** PostgreSQL 16
- **ORM:** Prisma 6.19.2
- **Migrations:** Use `prisma migrate deploy` (never `prisma migrate dev`) in production/Docker
- **Schema location:** `prisma/schema.prisma`

## Shared Types

- **Package:** `@frost-logix/shared-types`
- **Usage:** Shared between frontend and backend (DTOs, interfaces)

## UI Library

- **Component library:** Spartan UI — Angular port of shadcn/ui
- **Two-layer architecture:**
  - `@spartan-ng/brain` (npm): Accessible primitives (install via package manager)
  - `@spartan-ng/helm` (copy-paste): Styled components (copy to `libs/ui/`)
- **Local UI lib:** Components in `libs/ui/` wrap brain primitives with helm styling
- **Styling:** Tailwind CSS v4 utility classes + CSS variables in `apps/web/src/styles.css`
- **Theme:** Neutral theme using OKLCH color format
- **Import alias:** `@frost-logix/ui` (for local UI lib components)

## Docker Setup

- **Services:** postgres, api, nginx
- **nginx:** Serves Angular SPA and proxies `/api` requests to NestJS
- **Environment:** Variables in `.env` file at project root

## Development Commands

```bash
pnpm dev                                           # start both api and web
pnpm nx serve api                                  # start only api
pnpm nx serve web                                  # start only web
docker compose up postgres -d                      # start only postgres for local dev
pnpm nx run web:build:production                   # production build
pnpm nx g @spartan-ng/cli:ui button --project=web  # add spartan component
```

---

# Development Standards

## 1. Angular & TypeScript Standards

### 1.1 Component Architecture
- **Always standalone:** `standalone: true` in `@Component` decorator
- **Dependency injection:** Use `inject()` function, never constructor parameters
- **State management:** Signals exclusively (`signal`, `computed`, `effect`)
- **Lifecycle:** Use `afterNextRender()` for initialization—never `ngOnInit`
- **Change detection:** Zoneless with `provideZonelessChangeDetection()`

```typescript
import { Component, signal, inject, afterNextRender } from '@angular/core';
import { MyService } from './my.service';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CommonModule],
  template: `<p>{{ message() }}</p>`,
})
export class ExampleComponent {
  private readonly service = inject(MyService);
  
  message = signal('Loading...');

  constructor() {
    afterNextRender(() => {
      this.loadData();
    });
  }

  private loadData(): void {
    this.service.getData().subscribe({
      next: (data) => this.message.set(data),
      error: (error) => console.error('Load failed:', error),
    });
  }
}
```

### 1.2 Template Syntax
- **Control flow:** Always use new syntax: `@if`, `@for`, `@switch`, `@case`
- **Never use:** `*ngIf`, `*ngFor`, `*ngSwitch`, `[ngSwitch]`
- **Track in loops:** Required for optimal performance

```typescript
// ✅ CORRECT
@for (item of items(); track item.id) {
  <div>{{ item.name }}</div>
}

@if (isLoading()) {
  <p>Loading...</p>
} @else {
  <p>Done</p>
}

// ❌ AVOID
*ngFor="let item of items"
*ngIf="isLoading"
```

### 1.3 Type Safety
- **No `any` types**—use specific types or generics
- **Import DTOs** from `@frost-logix/shared-types`
- **Strict TypeScript:** `strict: true` in tsconfig.json
- **Readonly properties:** Use `readonly` or `DeepReadonly<T>` for immutables

```typescript
import { ProductDto, CreateProductDto } from '@frost-logix/shared-types';

products = signal<ProductDto[]>([]);
newProduct: CreateProductDto = { name: '', unit: 'kg' };

// Avoid null in signals when possible
editingProduct = signal<ProductDto | null>(null);

// Safe checks
if (this.editingProduct()) {
  // TypeScript knows it's not null here
}
```

### 1.4 Async & Error Handling
- **Always handle errors** in Observable subscriptions
- **Pattern:** `subscribe({ next, error, complete })`
- **Never silently fail** on API calls

```typescript
this.service.createProduct(data).subscribe({
  next: (product) => {
    this.products.update((current) => [...current, product]);
  },
  error: (error) => {
    console.error('Failed to create product:', error);
    // Optionally show toast/alert to user
  },
});
```

### 1.5 Immutable Signal Updates
```typescript
// Add item
this.items.update((current) => [...current, newItem]);

// Remove item
this.items.update((current) => current.filter((item) => item.id !== id));

// Update item
this.items.update((current) =>
  current.map((item) => (item.id === id ? updated : item))
);

// Replace entire state
this.items.set(newArray);
```

### 1.6 Naming Conventions
- **Components:** PascalCase + `Page` suffix for routes (e.g., `ProductsPage`)
- **Methods:** camelCase, descriptive verbs (e.g., `loadProducts`, `deleteProductById`)
- **Signals:** camelCase (e.g., `isLoading`, `products`, `editingProduct`)
- **Private fields:** `private readonly` with dependency injection via `inject()`
- **Constants:** UPPER_SNAKE_CASE

```typescript
private readonly productsService = inject(ProductsService);

products = signal<ProductDto[]>([]);
isLoading = signal(false);
editingProduct = signal<ProductDto | null>(null);

loadProducts(): void { }
deleteProductById(id: string): void { }
```

---

## 2. Spartan UI Component Standards

### 2.1 Core Principles
- **Always use Spartan components** instead of custom HTML/Tailwind utilities
- **Spartan uses two-layer architecture:**
  - `@spartan-ng/brain` (installed via npm): Handles ARIA, keyboard navigation, focus management
  - `@spartan-ng/helm` (copied to project): Styled Tailwind classes you can customize
- **Our project:** Local components in `libs/ui/` wrap brain primitives with helm styling
- **Import from:** `@frost-logix/ui` (local) or `@spartan-ng/helm/*` (direct from npm)
- **Documentation:** https://www.spartan.ng/components
- **Do NOT mix:** Spartan directives + inline Tailwind on same element

### 2.2 Common Components

#### Buttons
```typescript
// ✅ CORRECT
<button hlmBtn variant="default">Primary</button>
<button hlmBtn variant="outline" size="sm">Secondary</button>
<button hlmBtn variant="destructive">Delete</button>
<button hlmBtn variant="ghost">Tertiary</button>

// Import
import { HlmButtonImports } from '@spartan-ng/helm/button';
```
- **Variants:** `default`, `outline`, `secondary`, `destructive`, `ghost`
- **Sizes:** `default`, `sm`, `lg`
- **States:** `:disabled`, `:hover`, `:active` (Spartan handles styling)

#### Alert Dialog (Confirmations)
```typescript
// ✅ CORRECT - One dialog per trigger (scoped)
<hlm-alert-dialog>
  <button hlmAlertDialogTrigger hlmBtn variant="destructive">
    Delete
  </button>
  <hlm-alert-dialog-content *hlmAlertDialogPortal="let ctx">
    <hlm-alert-dialog-header>
      <h2 hlmAlertDialogTitle>Delete Product</h2>
      <p hlmAlertDialogDescription>
        Are you sure? This action cannot be undone.
      </p>
    </hlm-alert-dialog-header>
    <hlm-alert-dialog-footer>
      <button
        hlmAlertDialogCancel
        hlmBtn
        variant="outline"
        (click)="ctx.close()"
      >
        Cancel
      </button>
      <button
        hlmAlertDialogAction
        hlmBtn
        variant="destructive"
        (click)="deleteProduct(productId); ctx.close()"
      >
        Delete
      </button>
    </hlm-alert-dialog-footer>
  </hlm-alert-dialog-content>
</hlm-alert-dialog>

// Import
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
```
- **Context is essential:** Capture `let ctx` to access `ctx.close()`
- **Portal directive:** `*hlmAlertDialogPortal` renders dialog in document body
- **Scoping:** Each trigger owns its dialog content—use for row-level actions
- **Do NOT:** Create manual modal overlays or use `z-50` + fixed positioning

#### Dialog (Complex Forms/Content)
```typescript
<hlm-dialog>
  <button hlmDialogTrigger hlmBtn>Open Form</button>
  <hlm-dialog-content *hlmDialogPortal="let ctx">
    <hlm-dialog-header>
      <h2 hlmDialogTitle>Edit Product</h2>
    </hlm-dialog-header>
    <div class="space-y-4">
      <!-- Form fields -->
    </div>
    <hlm-dialog-footer>
      <button hlmBtn variant="outline" (click)="ctx.close()">Close</button>
      <button hlmBtn (click)="save(); ctx.close()">Save</button>
    </hlm-dialog-footer>
  </hlm-dialog-content>
</hlm-dialog>

// Import
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
```

#### Form Inputs
```typescript
// ✅ CORRECT
<label hlmLabel for="product-name">Product Name</label>
<input
  id="product-name"
  hlmInput
  placeholder="Enter name"
  [(ngModel)]="productName"
  type="text"
/>

<textarea hlmTextarea placeholder="Description"></textarea>

<select hlmNativeSelect [(ngModel)]="unit">
  <option value="kg">Kilogram</option>
  <option value="piece">Piece</option>
</select>

// Imports
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { HlmNativeSelectImports } from '@spartan-ng/helm/native-select';
```

#### Tables
```typescript
// ✅ CORRECT - Semantic with Spartan
<table hlmTable>
  <thead hlmTableHead>
    <tr hlmTableRow>
      <th hlmTableHeader>Name</th>
      <th hlmTableHeader>Status</th>
      <th hlmTableHeader>Actions</th>
    </tr>
  </thead>
  <tbody hlmTableBody>
    @for (product of products(); track product.id) {
      <tr hlmTableRow>
        <td hlmTableCell>{{ product.name }}</td>
        <td hlmTableCell>
          @if (product.is_active) {
            <span class="text-green-500">Active</span>
          } @else {
            <span class="text-red-500">Inactive</span>
          }
        </td>
        <td hlmTableCell>
          <button hlmBtn size="sm" variant="outline">Edit</button>
        </td>
      </tr>
    }
  </tbody>
</table>

// Import
import { HlmTableImports } from '@spartan-ng/helm/table';
```

### 2.3 Dialog Context Pattern (Critical)
Always capture and use dialog context for proper control:

```typescript
// Dialog content needs *hlmAlertDialogPortal or *hlmDialogPortal
<hlm-alert-dialog-content *hlmAlertDialogPortal="let ctx">
  <!-- Portal directive makes ctx available -->
  <hlm-alert-dialog-header>
    <h2 hlmAlertDialogTitle>Confirm Action</h2>
    <p hlmAlertDialogDescription>Are you sure?</p>
  </hlm-alert-dialog-header>
  <hlm-alert-dialog-footer>
    <!-- Use ctx.close() to dismiss dialog -->
    <button (click)="ctx.close()">Cancel</button>
    <button (click)="action(); ctx.close()">Confirm</button>
  </hlm-alert-dialog-footer>
</hlm-alert-dialog-content>
```

### 2.4 Styling Rules
- **Do NOT mix:** Spartan component directives + inline Tailwind on same element
- **Layout:** Use Tailwind utilities (grid, flex, space-y-*, gap-*, p-*, m-*)
- **Components:** Use Spartan directives (hlmBtn, hlmInput, hlmTable, etc.)
- **Theme variables:** Spartan uses CSS variables—always respect theme system

```typescript
// ✅ CORRECT
<div class="grid gap-4 md:grid-cols-3">
  <input hlmInput placeholder="Name" />
  <input hlmInput placeholder="Email" />
  <button hlmBtn variant="default">Submit</button>
</div>

// ❌ AVOID - Raw Tailwind on form inputs
<input class="px-3 py-2 rounded border border-border" />

// ❌ AVOID - Mixed directive + Tailwind classes on component
<button hlmBtn class="px-4 py-2 bg-blue-500">Submit</button>
```

---

## 3. State Management Patterns

### 3.1 Signals for Local State
```typescript
// Simple state
isLoading = signal(false);
selectedId = signal<string | null>(null);

// Collections
products = signal<ProductDto[]>([]);
users = signal<UserDto[]>([]);

// Computed state (derived)
activeProducts = computed(() =>
  this.products().filter((p) => p.is_active)
);

// Effects (side effects)
effect(() => {
  const id = this.selectedId();
  if (id) {
    this.loadProductDetails(id);
  }
});
```

### 3.2 Form State Management
- **Simple forms:** Use two-way binding with `[(ngModel)]`
- **Complex forms:** Use `ReactiveFormsModule` with `FormBuilder`
- **Always validate** before submission

```typescript
// Simple form
newProduct: CreateProductDto = {
  name: '',
  name_ar: '',
  unit: 'kg',
};

createProduct(): void {
  // Validate
  if (!this.newProduct.name?.trim()) {
    console.error('Product name is required');
    return;
  }

  // Submit
  this.service.create(this.newProduct).subscribe({
    next: (product) => {
      this.products.update((current) => [...current, product]);
      this.newProduct = { name: '', name_ar: '', unit: 'kg' };
    },
    error: (error) => console.error('Creation failed:', error),
  });
}
```

### 3.3 Modal/Dialog State Pattern
```typescript
// ❌ AVOID - Multiple signals for modal state
editingProduct = signal<ProductDto | null>(null);
productToDelete = signal<ProductDto | null>(null);
showDeleteConfirm = signal(false);

// ✅ CORRECT - Use Spartan dialog context
// Dialog handles open/close state via *hlmAlertDialogPortal
// No extra signals needed
```

---

## 4. API & Service Patterns

### 4.1 Service Injection
```typescript
private readonly productsService = inject(ProductsService);
private readonly httpClient = inject(HttpClient);
private readonly router = inject(Router);
```

### 4.2 HTTP Error Handling
```typescript
this.service.getData().subscribe({
  next: (data) => {
    this.state.set(data);
  },
  error: (error) => {
    console.error('Failed to load data:', error);
    // Show toast/snackbar to user if needed
  },
  complete: () => {
    // Optional: cleanup after completion
  },
});
```

### 4.3 Data Update Patterns
```typescript
// Create
this.service.create(newItem).subscribe({
  next: (created) => {
    this.items.update((current) => [...current, created]);
  },
  error: (error) => console.error('Create failed:', error),
});

// Update
this.service.update(id, data).subscribe({
  next: (updated) => {
    this.items.update((current) =>
      current.map((item) => (item.id === updated.id ? updated : item))
    );
  },
  error: (error) => console.error('Update failed:', error),
});

// Delete
this.service.delete(id).subscribe({
  next: () => {
    this.items.update((current) => current.filter((item) => item.id !== id));
  },
  error: (error) => console.error('Delete failed:', error),
});
```

---

## 5. Code Quality & Best Practices

### 5.1 Comments & Documentation
- Prefer self-documenting code
- Add comments only for non-obvious logic
- Document business logic and complex algorithms

```typescript
// ❌ Obvious comment—avoid
// Increment the count
count++;

// ✅ Necessary comment—explains intent
// Optimistic update: update UI immediately, rollback on error
this.items.update((current) => [...current, newItem]);
this.service.create(newItem).subscribe({
  error: () => this.items.update((current) => current.slice(0, -1)),
});
```

### 5.2 Validation & Input Sanitization
- Validate user input before API submission
- Validate server-side always
- Sanitize HTML content with `DomSanitizer`

```typescript
createProduct(): void {
  // Client-side validation
  if (!this.newProduct.name?.trim()) {
    console.error('Product name is required');
    return;
  }

  if (this.newProduct.name.length > 255) {
    console.error('Product name too long');
    return;
  }

  // Server will validate again
  this.service.create(this.newProduct).subscribe({
    // ...
  });
}
```

### 5.3 Performance Optimization
- **Use `track` in loops** to prevent unnecessary re-renders
- **Leverage computed** for derived state
- **Lazy load** features and components
- **Code splitting:** Use Angular's router-level code splitting

```typescript
// ✅ CORRECT
@for (item of items(); track item.id) {
  <div>{{ item.name }}</div>
}

// ❌ AVOID
@for (item of items()) {
  <div>{{ item.name }}</div>
}
```

---

## 6. NestJS Backend Standards

### 6.1 API Route Structure
- **Global prefix:** `/api` — all routes start with this
- **Pattern:** `/api/products`, `/api/users`, etc.
- **Versioning:** Use path versioning if needed: `/api/v1/products`

```typescript
// ✅ CORRECT - Prefix already applied globally
@Controller('products')
export class ProductsController {
  @Get()
  findAll() { }  // Route: GET /api/products

  @Post()
  create() { }   // Route: POST /api/products

  @Put(':id')
  update() { }   // Route: PUT /api/products/:id

  @Delete(':id')
  delete() { }   // Route: DELETE /api/products/:id
}
```

### 6.2 Error Handling
```typescript
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    if (exception instanceof BadRequestException) {
      return response.status(400).json({
        statusCode: 400,
        message: exception.getResponse(),
      });
    }

    return response.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
    });
  }
}
```

### 6.3 Request Validation
```typescript
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @IsString()
  @IsNotEmpty()
  unit: string;
}
```

---

## 7. Project Structure

```
apps/
├── web/                          # Angular frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/       # Reusable UI components
│   │   │   │   ├── product-form/
│   │   │   │   └── product-table/
│   │   │   ├── pages/            # Page-level components
│   │   │   │   ├── products.page.ts
│   │   │   │   └── dashboard.page.ts
│   │   │   ├── services/         # Business logic & API calls
│   │   │   │   ├── products.service.ts
│   │   │   │   └── auth.service.ts
│   │   │   ├── guards/           # Route guards
│   │   │   │   └── auth.guard.ts
│   │   │   ├── interceptors/     # HTTP interceptors
│   │   │   │   └── auth.interceptor.ts
│   │   │   ├── app.routes.ts     # Route definitions
│   │   │   └── app.config.ts     # Global providers
│   │   └── styles/               # Global styles
│   ├── proxy.conf.json           # Dev proxy config
│   └── proxy.docker.json         # Docker proxy config
│
├── api/                          # NestJS backend
│   ├── src/
│   │   ├── app/
│   │   │   ├── products/
│   │   │   │   ├── products.controller.ts
│   │   │   │   ├── products.service.ts
│   │   │   │   └── dto/
│   │   │   ├── users/
│   │   │   ├── auth/
│   │   │   └── filters/          # Exception filters
│   │   └── main.ts
│   └── Dockerfile
│
└── shared/
    └── types/                    # @frost-logix/shared-types
        ├── products.ts
        ├── users.ts
        └── auth.ts

libs/
├── ui/                          # @frost-logix/ui - Spartan components
│   ├── src/
│   │   ├── lib/
│   │   │   ├── button/
│   │   │   ├── dialog/
│   │   │   └── table/
│   │   └── index.ts
│   └── project.json
```

---

## 8. Coding Rules — ALWAYS FOLLOW THESE

### Angular & Frontend
- Use `inject()` instead of constructor injection
- Use signals for all reactive state
- Never use `*ngIf`, `*ngFor`, or `*ngSwitch` — always use `@if`, `@for`, `@switch`
- Always use `track` in `@for` loops
- Use `afterNextRender()` instead of `ngOnInit()`
- Never import from `@angular/core` utilities if zoneless (no NgZone)
- Always handle errors in Observable subscriptions
- Use Spartan UI components exclusively—never build custom modals
- Use dialog context (`let ctx`) for proper dialog state management

### Spartan UI
- **Alert Dialog:** Use for confirmations (destructive actions)
- **Dialog:** Use for complex forms/content
- **Always import:** `HlmButtonImports`, `HlmAlertDialogImports`, etc.
- **Never mix:** Spartan directives + inline Tailwind on same element
- **Always use:** `track` attribute in `@for` loops rendering list items
- **Always capture:** Dialog context with `*hlmAlertDialogPortal="let ctx"`
- **Never create:** Custom fixed-position modals with `z-50` + `inset-0`

### NestJS & Backend
- All endpoints start with `/api` (global prefix)
- Use DTOs for request validation
- Always validate at both client and server
- Return consistent error responses
- Log errors properly

### Database & Prisma
- Never delete files in `prisma/migrations/`
- Use `prisma migrate deploy` in production
- Define all relationships in schema.prisma

### Monorepo & Package Management
- Install packages with `pnpm add <package> -w` at workspace root
- Use Nx commands: `pnpm nx serve`, `pnpm nx build`
- Keep workspace clean—no duplicate dependencies

### Configuration Files
- `.postcssrc.json` for PostCSS (not `postcss.config.js`)
- `tailwind.config.js` if needed (or CSS-only in `styles.css`)
- Proxy configs: `proxy.conf.json` (dev), `proxy.docker.json` (Docker)

---

## 9. Quick Reference

| Task | Pattern | Notes |
|------|---------|-------|
| Create button | `<button hlmBtn variant="default">Label</button>` | Use `variant` & `size` |
| Delete confirmation | `<hlm-alert-dialog>` with destructive button | Use `*hlmAlertDialogPortal="let ctx"` |
| Complex dialog | `<hlm-dialog>` with form content | Same context pattern |
| Load data on init | `afterNextRender(() => this.load())` | Never use `ngOnInit` |
| Update signal | `this.state.update((current) => ...)` | Immutable updates |
| Render list | `@for (item of items(); track item.id)` | Always use `track` |
| Conditional render | `@if (condition()) { ... } @else { ... }` | New control flow |
| Form input | `<input hlmInput [(ngModel)]="value" />` | Use `hlmInput` directive |
| Table | `<table hlmTable>` with `hlmTableRow`, `hlmTableCell` | Semantic markup |
| Service injection | `private readonly service = inject(MyService)` | Use `inject()` |
| Error handling | `.subscribe({ next, error, complete })` | Always handle errors |
| HTTP call | `this.http.get<T>(url)` | Typed responses |
| API endpoint | `GET /api/products` | Global prefix applied |

---

## 10. AI Assistant Instructions

### When Generating Code:
1. **Follow this CLAUDE.md file exactly**
2. **Reference Spartan UI docs** at https://www.spartan.ng/components
3. **Enforce TypeScript strict mode**—no `any` types
4. **Always include error handling** on subscriptions
5. **Use signals** for state; RxJS for effects & HTTP
6. **Use Spartan components** for UI—never custom modals
7. **Use dialog context** (`let ctx`) for dialog control
8. **Add comments** only for non-obvious logic
9. **Validate input** before API submission
10. **Test assumptions**—ask for clarification on unclear requirements

### When Reviewing Code:
1. Check for Spartan component usage
2. Verify TypeScript strict typing
3. Ensure error handling on all subscriptions
4. Validate signal update patterns
5. Check dialog implementation uses context pattern
6. Verify accessibility (ARIA labels, semantic HTML)
7. Ensure no `*ngIf` or `*ngFor` in templates

---

**Last Updated:** 2026-04-26  
**Maintainer:** Development Team  
**Next Review:** When updating Angular/Spartan versions or adding new frameworks