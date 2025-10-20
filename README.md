# Calendar App

A React + Vite calendar application with user authentication and note-taking functionality.

## Features

- User authentication (sign up/sign in)
- Personal calendar view
- Add notes to specific dates
- Edit user profile (display name)
- Responsive design

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up Supabase database:
   - Go to your Supabase project SQL Editor
   - Run the SQL from `SUPABASE_SETUP.sql`

3. Run the development server:
```bash
npm run dev
```

## Database Schema

- **profiles**: User profiles with display names
- **calendar_notes**: Notes associated with specific dates

## Technologies

- React 18
- TypeScript
- Vite
- Supabase (Authentication & Database)
- React Router
