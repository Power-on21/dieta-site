# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Site de dieta personalizada com login, cálculo de TMB e plano alimentar balanceado.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Auth**: Replit Auth (OIDC with PKCE) via openid-client
- **Frontend**: React + Vite + Tailwind + Shadcn UI + Framer Motion

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server
│   └── diet-app/           # React + Vite frontend (previewPath: /)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   ├── db/                 # Drizzle ORM schema + DB connection
│   └── replit-auth-web/    # Auth hook (useAuth) for browser
├── scripts/
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Features

### Diet App (`artifacts/diet-app`)
- Landing page with "Entrar com Google" login button
- Profile page: form to enter age, gender, weight, height, activity level, goal, dietary restrictions
- Plan page: personalized diet plan with TMB, TDEE, macros and 5 meals/day
- All in Brazilian Portuguese

### API Endpoints
- `GET /api/auth/user` — current user session
- `GET /api/login` — OIDC login flow start
- `GET /api/callback` — OIDC callback
- `GET /api/logout` — session logout
- `GET /api/diet/profile` — get user diet profile
- `PUT /api/diet/profile` — save/update diet profile (calculates TMB, TDEE, target calories)
- `GET /api/diet/plan` — get personalized diet plan with 5 meals

### TMB Calculation (Mifflin-St Jeor)
- Men: (10 × weight_kg) + (6.25 × height_cm) − (5 × age) + 5
- Women: (10 × weight_kg) + (6.25 × height_cm) − (5 × age) − 161
- TDEE = TMB × activity multiplier (1.2 to 1.9)
- Goals: lose (-500 cal), maintain, gain (+300 cal)
- Macros: 30% protein, 45% carbs, 25% fat

## DB Schema

- `sessions` — Replit Auth session store
- `users` — Replit Auth user store
- `diet_profiles` — User diet profiles with TMB/TDEE/target calories

## Packages

### `artifacts/api-server` (`@workspace/api-server`)
Express 5 API server with auth and diet routes.

### `artifacts/diet-app` (`@workspace/diet-app`)
React + Vite frontend with:
- `@workspace/replit-auth-web` for useAuth()
- `@workspace/api-client-react` for generated hooks
- wouter for routing, framer-motion for animations

### `lib/replit-auth-web` (`@workspace/replit-auth-web`)
Browser auth hook. Exports `useAuth()` with user, isLoading, isAuthenticated, login, logout.
