# Project Brief & Design System

## Design Vibe
- **Aesthetic:** Clean, SaaS, Minimal, Professional.
- **Colors:** Black, White, Electric Blue (#2563EB).
- **Font:** Inter (Sans-serif).
- **Layout:** Single-column focus, ample whitespace.

## Coding Conventions
- **Components:** Use `npx shadcn-ui@latest add [component]`. Do not build custom UI if a Shadcn component exists.
- **Server Actions:** Create new actions in `app/actions/[feature].ts`. Return `{ success: boolean, data: any, error: string }`.
- **Environment:** Access keys via `process.env`. Never hardcode keys.

## Anti-Patterns
- Avoid "Wall of text" outputs. Use Cards and badges.
- Avoid "Credit Anxiety." Reassure user it is free.
