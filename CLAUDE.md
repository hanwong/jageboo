# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**자영업자 장부** (Jageboo) - A mobile-first expense/income tracking app for solo business owners to record transactions in 5 seconds and instantly view their operating profit.

**Tech Stack:**

- Next.js 15+ (App Router + Turbopack)
- React 19 + TypeScript 5
- TailwindCSS v4 + shadcn/ui (new-york style)
- Supabase Auth (Google OAuth) + PostgreSQL
- React Hook Form + Zod
- pnpm package manager

## Development Commands

```bash
# Development
pnpm dev                 # Start dev server with Turbopack (localhost:3000)
pnpm build              # Production build
pnpm start              # Start production server

# Code Quality
pnpm typecheck          # TypeScript type checking
pnpm lint               # ESLint check
pnpm lint:fix           # Auto-fix ESLint issues
pnpm format             # Format with Prettier
pnpm format:check       # Check formatting
pnpm check-all          # Run all checks (typecheck + lint + format:check)

# Git Hooks
# Pre-commit hook runs: eslint --fix, prettier --write on staged files
```

## Architecture Overview

### Next.js 15 App Router Structure

This project uses **App Router only** (not Pages Router). All routes live in the `app/` directory:

```
app/
├── layout.tsx              # Root layout (ThemeProvider, fonts, metadata)
├── page.tsx                # Home/dashboard page
├── globals.css             # Global styles + TailwindCSS v4
├── auth/                   # Authentication routes
│   ├── login/             # Login page
│   ├── sign-up/           # Sign-up page
│   ├── confirm/           # Email confirmation route handler
│   ├── forgot-password/   # Password reset request
│   └── update-password/   # Password reset form
└── protected/             # Auth-required routes
    ├── layout.tsx         # Protected layout (auth check)
    └── page.tsx           # Protected dashboard

Future routes (per ROADMAP.md):
├── income/new/            # Income entry form
├── expense/new/           # Expense entry form
├── transaction/[id]/edit/ # Transaction edit
├── recurring/[id]/edit/   # Recurring transaction edit
└── settings/              # Settings & recurring management
```

### Supabase Authentication

**Server-side authentication pattern:**

```typescript
// Always create a new client per request (important for Fluid compute)
import { createClient } from '@/lib/supabase/server'

export default async function Page() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  // ...
}
```

**Client-side authentication:**

```typescript
import { createClient } from '@/lib/supabase/client'

export function Component() {
  const supabase = createClient()
  // ...
}
```

**Key files:**

- `lib/supabase/server.ts` - Server-side client (uses cookies)
- `lib/supabase/client.ts` - Client-side client
- `lib/supabase/proxy.ts` - Proxy for session refresh

### Component Organization

```
components/
├── ui/                    # shadcn/ui base components (Button, Input, etc.)
├── layout/                # Layout components (AppLayout, BottomNav)
├── navigation/            # Navigation components
├── sections/              # Page sections (Hero, Features)
├── providers/             # Context providers (ThemeProvider)
├── transaction/           # Transaction-related components
├── recurring/             # Recurring transaction components
├── dashboard/             # Dashboard components (ProfitDisplay, SummaryCard)
└── common/                # Shared components (DatePicker, ConfirmDialog)
```

**Path Aliases:**

- `@/components` → `components/`
- `@/lib` → `lib/`
- `@/ui` → `components/ui/`
- `@/hooks` → `hooks/`

### Next.js 15 Critical Patterns

#### 1. Async Request APIs (Breaking Change)

```typescript
// ✅ REQUIRED in Next.js 15
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { id } = await params // Must await
  const query = await searchParams // Must await
  const cookieStore = await cookies() // Must await
  const headersList = await headers() // Must await
}

// ❌ FORBIDDEN: Synchronous access
export default function Page({ params }: { params: { id: string } }) {
  // This will error in Next.js 15
}
```

#### 2. Server Components First

```typescript
// ✅ Default: Server Component (can fetch data directly)
export default async function Dashboard() {
  const data = await fetchData()
  return <div>{data}</div>
}

// ✅ Client Component: Only when interactivity needed
'use client'
export function InteractiveChart() {
  const [state, setState] = useState()
  // ...
}
```

#### 3. Server Actions with React 19

```typescript
// app/actions/transactions.ts
'use server'

export async function createTransactionAction(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  // Always validate on server with Zod
  const validated = schema.safeParse({
    amount: formData.get('amount'),
  })

  if (!validated.success) {
    return { success: false, errors: validated.error.flatten() }
  }

  // Perform action
  await db.insert(validated.data)

  return { success: true }
}
```

```typescript
// components/transaction-form.tsx
'use client'

import { useActionState } from 'react'

export function TransactionForm() {
  const [state, formAction, isPending] = useActionState(
    createTransactionAction,
    { success: false }
  )

  return (
    <form action={formAction}>
      {/* ... */}
    </form>
  )
}
```

## Database Schema (Supabase PostgreSQL)

### Transaction Table

```sql
- id: UUID (PK)
- user_id: UUID (FK → auth.users)
- type: ENUM ('income', 'expense')
- amount: DECIMAL(10, 2)
- date: DATE
- memo: VARCHAR(50), nullable
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### DailySummary Table (Performance Optimization)

```sql
- id: UUID (PK)
- user_id: UUID (FK → auth.users)
- date: DATE (UNIQUE per user)
- total_income: DECIMAL(10, 2)
- total_expense: DECIMAL(10, 2)
- net_profit: DECIMAL(10, 2)
- updated_at: TIMESTAMP
```

### RecurringTransaction Table

```sql
- id: UUID (PK)
- user_id: UUID (FK → auth.users)
- type: ENUM ('income', 'expense')
- amount: DECIMAL(10, 2)
- memo: VARCHAR(100), nullable
- frequency: ENUM ('weekly', 'monthly')
- start_date: DATE
- end_date: DATE, nullable
- last_generated_at: DATE, nullable
- is_active: BOOLEAN (default: true)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**Important:** All tables must have Row Level Security (RLS) policies to ensure users can only access their own data.

## Form Handling Pattern (React Hook Form + Zod + Server Actions)

### Complete Form Flow

1. **Define Zod Schema**

```typescript
// lib/schemas/transaction.ts
import { z } from 'zod'

export const transactionSchema = z.object({
  amount: z.number().positive('금액은 0보다 커야 합니다'),
  date: z.date(),
  memo: z.string().max(50).optional(),
})

export type TransactionFormData = z.infer<typeof transactionSchema>
```

2. **Create Server Action**

```typescript
// app/actions/transactions.ts
'use server'

export async function createTransaction(
  prevState: ActionResult,
  formData: FormData
) {
  // Server-side validation
  const validated = transactionSchema.safeParse({
    amount: Number(formData.get('amount')),
    date: new Date(formData.get('date') as string),
    memo: formData.get('memo'),
  })

  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
    }
  }

  // Database operation
  const supabase = await createClient()
  await supabase.from('transactions').insert(validated.data)

  return { success: true }
}
```

3. **Build Form Component**

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useActionState } from 'react'

export function TransactionForm() {
  const [state, formAction, isPending] = useActionState(
    createTransaction,
    { success: false }
  )

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: { date: new Date() },
    mode: 'onChange', // Real-time validation
  })

  // Sync server errors to form
  useEffect(() => {
    if (state.errors) {
      Object.entries(state.errors).forEach(([field, messages]) => {
        form.setError(field as any, { message: messages[0] })
      })
    }
  }, [state.errors])

  const onSubmit = (data: TransactionFormData) => {
    const formData = new FormData()
    formData.append('amount', String(data.amount))
    formData.append('date', data.date.toISOString())
    if (data.memo) formData.append('memo', data.memo)
    formAction(formData)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields */}
      </form>
    </Form>
  )
}
```

## Styling Guidelines

### TailwindCSS v4 + shadcn/ui

- Use **new-york** style variant for all shadcn/ui components
- Mobile-first design (primary target is mobile)
- Use `cn()` utility from `@/lib/utils` for conditional classes
- Follow shadcn/ui color system (uses CSS variables)

```typescript
import { cn } from '@/lib/utils'

<div className={cn(
  "base-classes",
  condition && "conditional-classes"
)} />
```

### Installing shadcn/ui Components

```bash
npx shadcn@latest add [component-name]
# Example: npx shadcn@latest add button
```

## File Naming Conventions

- **Components:** `kebab-case.tsx` (e.g., `transaction-card.tsx`)
- **Component Names:** `PascalCase` (e.g., `TransactionCard`)
- **Folders:** `kebab-case` (e.g., `transaction/`)
- **Utilities:** `kebab-case.ts` (e.g., `date-utils.ts`)
- **Never use:** `snake_case` or `PascalCase` for files

## Development Workflow (from ROADMAP.md)

1. **Read the PRD**: Check `docs/PRD.md` for feature requirements
2. **Check ROADMAP**: Review `docs/ROADMAP.md` for current phase and tasks
3. **Implement Feature**: Follow the task breakdown in ROADMAP
4. **Test Changes**: Run `pnpm check-all` before committing
5. **Update ROADMAP**: Mark tasks as complete using `/update-roadmap` skill

## Key Development Guidelines

### Performance

- Use Server Components by default (faster initial load)
- Only add `'use client'` when state/effects/event handlers needed
- Use `<Suspense>` for slow-loading content with loading UI
- Implement DailySummary caching to avoid expensive aggregations

### Security

- **Always validate on server** - never trust client-side validation
- Use Row Level Security (RLS) in Supabase
- All authenticated routes must check user session
- Sanitize user inputs before database operations

### Mobile-First UX

- Touch-friendly button sizes (minimum 44x44px)
- Auto-focus on input fields for fast entry
- Swipe gestures for delete actions
- Bottom navigation for thumb reach
- **Goal: 5-second transaction entry time**

### Code Quality

- Run `pnpm check-all` before commits (enforced by pre-commit hook)
- TypeScript strict mode enabled
- No `any` types without explicit reason
- Keep functions under 50 lines when possible
- One component per file

## Environment Variables

Required in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=         # Supabase project URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=  # Supabase anon/publishable key
```

## Common Pitfalls to Avoid

1. **Don't use Pages Router** - This is an App Router-only project
2. **Don't skip server validation** - Always validate with Zod on server
3. **Don't create client unnecessarily** - Prefer Server Components
4. **Don't use old Next.js 14 patterns** - Use async params/searchParams
5. **Don't forget RLS policies** - All data access must be user-scoped
6. **Don't use `any` type** - Leverage Zod's `z.infer<>` for type safety

## Documentation References

- `docs/PRD.md` - Complete product requirements
- `docs/ROADMAP.md` - Development roadmap and task breakdown
- `docs/guides/nextjs-15.md` - Next.js 15 specific patterns
- `docs/guides/project-structure.md` - Folder organization rules
- `docs/guides/forms-react-hook-form.md` - Comprehensive form patterns
- `docs/guides/styling-guide.md` - TailwindCSS + shadcn/ui guidelines
- `docs/guides/component-patterns.md` - React component best practices

## Quick Reference: MVP Features

**Phase 1 (Current):** Authentication + Project Structure

- F000: Google OAuth Login (Supabase)
- F009: Auto-login (session persistence)
- F014: Logout functionality
- F015: User profile display

**Phase 2:** UI/UX with dummy data

- All screen layouts
- Transaction input forms
- Dashboard with period tabs
- Recurring transaction UI

**Phase 3:** Core functionality

- Supabase database setup
- Server Actions for CRUD operations
- Real-time profit calculation
- Transaction management
- Recurring transaction automation

**Phase 4:** Polish

- PWA setup
- Performance optimization
- Vercel deployment
