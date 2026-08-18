Discipline Protocol

A full-stack productivity and social accountability application designed to track daily schedules, manage tasks, and foster peer mentorship. Built with a focus on seamless user experience, data persistence, and secure social networking.

Live Demo: https://schedule-tracker-fawn.vercel.app/

Repository: https://github.com/fetehadin/scheduleTracker
Core Architecture

    Frontend: React, Vite, Tailwind CSS

    Backend & Database: Supabase (PostgreSQL, Auth, Row-Level Security)

    Deployment: Vercel

Key Capabilities

    Hybrid Data Persistence: Seamless local-to-cloud migration. Users can operate locally via browser storage, with automatic synchronization to the PostgreSQL backend upon authentication.

    Custom Authentication Flow: Secure Supabase Auth integration supporting both traditional email verification and direct username login via secure SQL remote procedure calls (RPC).

    Social Grid System: Peer-to-peer networking utilizing case-insensitive username lookups. Users can manage incoming connection requests and access their peers' active dashboards in an isolated, read-only state.

    Mentorship Engine: A dedicated database architecture allowing users to leave day-specific, actionable feedback on their peers' schedules to drive social accountability.

    Dynamic Analytics: Automated daily score calculations based on allocated task hours versus completion percentages, paired with scalable week and day pagination filters.

Local Environment Setup

    Clone the repository:
    Bash

    git clone https://github.com/fetehadin/scheduleTracker.git

    Navigate to the project directory and install dependencies:
    Bash

    cd scheduleTracker
    npm install

    Create a .env file in the root directory and configure your Supabase credentials:
    Code snippet

    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

    Start the local development server:
    Bash

    npm run dev