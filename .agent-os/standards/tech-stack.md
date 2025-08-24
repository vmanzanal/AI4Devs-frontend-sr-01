# Tech Stack

## Context

Global tech stack defaults for Agent OS projects, overridable in project-specific `.agent-os/product/tech-stack.md`.

- **Frontend Framework**: React (latest stable, bootstrapped with Create React App or Vite)
- **Language (frontend)**: TypeScript (latest stable)
- **Backend Framework**: Express.js
- **Language (backend)**: TypeScript (latest stable)
- **ORM / Database Client**: Prisma
- **Primary Database**: PostgreSQL (latest stable)
- **Node.js Version**: 22 LTS
- **Package Manager**: npm or yarn (choose per project; default: npm)
- **Build Tool**: Vite (preferred for new projects) or CRA (legacy support)
- **CSS Framework**: TailwindCSS (latest stable)
- **UI Components**: shadcn/ui + Lucide React (icons)
- **Font Provider**: Google Fonts
- **Font Loading**: Self-hosted for performance
- **Application Hosting**: Vercel / Netlify (frontend), Render / Railway / DigitalOcean (backend)
- **Database Hosting**: Supabase / PlanetScale / DigitalOcean Managed PostgreSQL
- **Asset Storage**: Amazon S3 (if required)
- **CDN**: Cloudflare (preferred) or Vercel built-in
- **CI/CD Platform**: GitHub Actions (default) or alternative (Bitbucket Pipelines / GitLab CI)
- **CI/CD Trigger**: Push to `main` / `staging` branches
- **Tests**: Unit + Integration tests run before deployment
- **Production Environment**: `main` branch
- **Staging Environment**: `staging` branch
