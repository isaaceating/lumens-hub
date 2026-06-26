# Legacy block removal plan

Current status:

- Lessons tab is now rendered through `LessonsTabLayout`.
- Materials and Quiz have dedicated editor pages.
- `builder/template.tsx` no longer injects lesson action buttons.
- `builder/template.tsx` still hides the legacy editor area temporarily.

Next manual cleanup target:

```txt
src/app/admin/training/[programId]/builder/page.tsx
```

## Remove unused import

Remove:

```tsx
import BuilderPage from "../page";
```

## Remove legacy block near the bottom

Find the block containing:

```tsx
Legacy advanced editor area
```

Remove the full wrapper that contains:

```tsx
<BuilderPage />
```

## Update top description copy

Replace wording like:

```txt
Advanced settings still use the legacy editor below.
```

With:

```txt
Program, Sections, Courses, Lessons, Materials, Quiz, and Structure are now live in the new builder.
```

## After manual cleanup

Then `builder/template.tsx` can be simplified to:

```tsx
import type { ReactNode } from "react";

export default function BuilderTemplate({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
```

## Test checklist

```bash
npm run build
```

Then test:

- Builder loads
- Program tab
- Sections tab
- Courses tab
- Lessons tab
- Materials editor
- Quiz editor
- Structure tab
