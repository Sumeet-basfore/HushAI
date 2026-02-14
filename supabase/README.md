# Supabase Migration for Research Data

This document describes the migration from filesystem-based storage to Supabase for research sessions.

## Setup Instructions

### 1. Create Supabase Project
- Go to [supabase.com](https://supabase.com) and create a new project
- Note down your project URL and anon key

### 2. Configure Environment Variables
Update your `.env.local` file with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run Database Schema
In your Supabase project's SQL Editor, run the SQL from `supabase/schema.sql`. This will:

- Create the `research_sessions` table
- Set up indexes for performance
- Enable Row Level Security (RLS)
- Create policies for user data isolation
- Add automatic `updated_at` timestamp updates

### 4. Test the Implementation

After setup, test by:
1. Starting your Next.js app: `npm run dev`
2. Creating a research session through the UI
3. Verifying data appears in Supabase dashboard

## Schema Details

### research_sessions Table

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT (PK) | Unique session identifier |
| query | TEXT | The search query |
| source_types | TEXT[] | Array of source types (news, blogs, etc.) |
| results | JSONB | Array of research sources |
| user_id | TEXT | User identifier (nullable) |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### Security

- **RLS Enabled**: Row Level Security is active on the table
- **User Isolation**: Users can only access their own sessions
- **Anonymous Support**: Sessions with `user_id = NULL` are accessible to all

## Migration Notes

- Old filesystem storage is no longer used
- Existing data in `research_data/sessions/` is not migrated (as per requirements)
- The API interface remains unchanged - no frontend changes needed
