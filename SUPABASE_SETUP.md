# Supabase Setup Guide

This guide will help you set up Supabase for the TimiTime application.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Node.js and npm installed

## Step 1: Create a Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in your project details
4. Wait for the project to be set up

## Step 2: Create the Tasks Table

Run the following SQL in your Supabase SQL Editor:

```sql
-- Create the tasks table
create table tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  duration integer not null, -- duration in minutes
  due_date timestamp with time zone not null,
  flexibility integer not null default 0, -- days the task can be delayed
  completed boolean default false,
  is_recurring boolean default false, -- whether the task repeats
  recurrence_pattern text, -- daily, weekly, monthly, yearly
  recurrence_interval integer default 1, -- every X days/weeks/months/years
  recurrence_end_date timestamp with time zone, -- optional end date for recurring tasks
  parent_task_id uuid references tasks(id), -- reference to the original recurring task
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table tasks enable row level security;

-- Create policies
create policy "Users can view their own tasks"
  on tasks for select
  using (auth.uid() = user_id);

create policy "Users can create their own tasks"
  on tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own tasks"
  on tasks for update
  using (auth.uid() = user_id);

create policy "Users can delete their own tasks"
  on tasks for delete
  using (auth.uid() = user_id);

-- Create index for performance
create index tasks_user_id_idx on tasks(user_id);
create index tasks_due_date_idx on tasks(due_date);
create index tasks_duration_idx on tasks(duration);
create index tasks_parent_task_id_idx on tasks(parent_task_id);
create index tasks_is_recurring_idx on tasks(is_recurring);

-- Create function to automatically update updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
create trigger update_tasks_updated_at before update on tasks
  for each row execute procedure update_updated_at_column();
```

## Step 3: Get Your API Keys

1. Go to Project Settings > API
2. Copy your Project URL and anon/public key
3. Create a `.env` file in the root of your project (copy from `.env.example`)
4. Add your credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=your-project-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Step 4: Configure Authentication

1. Go to Authentication > Providers in your Supabase dashboard
2. Enable Email provider
3. Configure email templates if desired
4. (Optional) Configure other OAuth providers

## Step 5: Test Your Setup

1. Run the app with `npm start`
2. Create a test account using the Sign Up flow
3. Check your email for verification (if enabled)
4. Log in and create a test task

## Database Schema

### Tasks Table

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Foreign key to auth.users |
| title | text | Task title |
| duration | integer | Duration in minutes |
| due_date | timestamp | When the task is due |
| flexibility | integer | Days the task can be delayed (e.g., 0, 1, 2, 3) |
| completed | boolean | Whether the task is completed |
| is_recurring | boolean | Whether the task repeats |
| recurrence_pattern | text | Frequency: 'daily', 'weekly', 'monthly', 'yearly' |
| recurrence_interval | integer | Every X days/weeks/months/years (default: 1) |
| recurrence_end_date | timestamp | Optional end date for recurring tasks |
| parent_task_id | uuid | Reference to the original recurring task (for instances) |
| created_at | timestamp | When the task was created |
| updated_at | timestamp | When the task was last updated |

## Security

- Row Level Security (RLS) is enabled to ensure users can only access their own tasks
- Authentication is required for all database operations
- API keys are stored securely using expo-secure-store on native platforms

## Troubleshooting

### "Invalid API key" error
- Double-check your `.env` file has the correct values
- Ensure the environment variables start with `EXPO_PUBLIC_`
- Restart the Expo development server after changing `.env`

### "Cannot read property 'session' of undefined"
- Make sure you're using the `useAuth` hook inside a component wrapped with `AuthProvider`

### Authentication not working
- Check your Supabase project settings for authentication configuration
- Verify email confirmation is not required, or check your email for confirmation links
- Check the Supabase logs in the dashboard for errors
