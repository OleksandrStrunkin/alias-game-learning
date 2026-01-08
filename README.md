# 🎙️ Alias Online

A fully synchronized, multiplayer "Alias" (Taboo) game built for real-time play with friends. This project focuses on seamless state synchronization across multiple devices using a modern tech stack.

## ✨ Key Features

* **Real-time Synchronization:** Powered by Supabase Realtime. Timer, scores, and game pauses are synced instantly across all connected players.
* **Customizable Game Rules:** Host can adjust round duration (60s - 180s) and select difficulty levels (A2, B1, B2).
* **Smart Pause System:** Ability to pause the game at any moment. The remaining time is preserved and synchronized for all participants.
* **Responsive Design:** A sleek, dark-themed UI optimized for both mobile and desktop browsers.
* **Dynamic Word Sources:** Supports both a local PostgreSQL word database and external API integration.

## 🛠 Tech Stack

* **Frontend Framework:** [Next.js 14](https://nextjs.org/) (App Router)
* **Language:** TypeScript
* **State Management:** [Zustand](https://docs.pmnd.rs/zustand/) (with custom Supabase sync logic)
* **Backend/Database:** [Supabase](https://supabase.com/) (PostgreSQL + Realtime CDC)
* **Styling:** Tailwind CSS + Framer Motion

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone [https://github.com/your-username/catherine-alias.git](https://github.com/your-username/catherine-alias.git)
cd catherine-alias

2. Install dependencies
Bash

npm install
3. Environment Setup
Create a .env.local file in the root directory and add your Supabase credentials:

Фрагмент коду

NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
4. Database Configuration
Create a table named lobbies in your Supabase project:

id: int8 (Primary Key)

code: text (Unique) — The room entry code.

game_state: jsonb — Holds the entire synchronized game object.

created_at: timestamp

Crucial: Enable Realtime for the lobbies table under Database -> Replication -> supabase_realtime.

5. Run the development server
Bash

npm run dev
🎮 How to Play
Create a Game: Click "Create Game" to generate a unique 4-digit room code.

Join: Friends enter the code and create their team names.

Configure: The host selects categories and sets the timer.

Describe: When it's your turn, hit "Start Round" and describe the words appearing on the screen without using the word itself!

🏗 Synchronization Architecture
The project follows a "Single Source of Truth" model:

Any action (pausing, scoring, skipping) updates the local Zustand store.

The updated state is pushed to the Supabase JSONB column via an UPDATE query.

All other clients listen for changes via PostgreSQL Change Data Capture (CDC).

Upon receiving an update, clients trigger syncFromSupabase to merge the new state while preserving local-only identifiers like myPlayerId.

📄 License
This project is open-source and available under the MIT License.