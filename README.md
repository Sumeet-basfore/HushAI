# Next.js AI-Powered Application

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app), enhanced with AI integration capabilities and a comprehensive development framework.

## Project Overview

This application combines modern web development practices with AI integration, featuring:
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- Supabase database integration
- AI agents and automation tools
- Automated testing and documentation generation

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Project Structure

```
├── agent_docs/           # AI agent documentation and specifications
│   ├── product_requirements.md
│   ├── project_brief.md
│   ├── tech_stack.md
│   └── testing.md
├── docs/                 # Additional documentation
│   ├── PRD.md
│   └── TDD.md
├── public/               # Static assets
├── src/
│   ├── app/             # Next.js app router pages
│   ├── components/      # React components
│   └── lib/             # Utility functions
├── supabase/            # Database schema and configuration
├── .agent/              # AI agent configurations
└── .codex/              # Code intelligence configurations
```

## Key Features

- **AI Integration**: Includes AI agents for automated documentation, testing, and development assistance
- **Database**: Supabase integration for real-time database capabilities
- **Automated Testing**: Comprehensive test suite with automated generation
- **Documentation**: AI-powered documentation generation and maintenance
- **Modern Stack**: Built with the latest Next.js features including Server Components and Actions

## Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Configure your Supabase credentials in `.env.local`

3. Install dependencies:
   ```bash
   npm install
   ```

## Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run linter

## AI Agent Capabilities

The project includes several AI-powered tools and agents:

- **Product Requirements Document (PRD)** generator
- **Technical Design Document (TDD)** creator
- **Testing** strategy generator
- **Documentation** automation
- **Code Review** assistance

These agents are configured in the `.agent` and `.codex` directories.

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

For Supabase integration, make sure to configure your production environment variables appropriately.

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Supabase Documentation](https://supabase.com/docs) - learn about the database platform
- [Tailwind CSS](https://tailwindcss.com) - utility-first CSS framework

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
