# ⚡ Life Saver AI - The Autonomous Productivity Companion

> *An autonomous, AI-powered productivity companion that dynamically schedules tasks, manages deadlines, and provides a distraction-free deep work environment.*

---

## 🚀 The Problem
Modern students and professionals face a continuous battle against cognitive overload and deadline paralysis. Static calendars and manual checklists fail to adapt to dynamic schedules, leading to decision fatigue, missed deadlines, and severe burnout. Users do not need another list to manage; they require an intelligent system that thinks ahead and dynamically organizes their workload.

## 💡 The Solution
Life Saver AI is a context-aware productivity agent designed to mitigate deadline stress. By leveraging advanced generative AI, the application analyzes task complexity, automatically breaks down large goals into actionable subtasks, and mathematically schedules them into a dynamic weekly calendar. 

It pairs this autonomous planning with a **Deep Work Focus Mode**—a visually immersive, distraction-free environment featuring a built-in Pomodoro timer and on-demand AI assistance to keep users anchored to their current objective.

---

## ✨ Key Features

* **Agentic Auto-Planning:** Utilizes custom scheduling algorithms to anchor AI-generated subtasks to real-world deadlines, instantly reorganizing your weekly calendar.
* **Overdue Task Protection:** Intelligently recognizes missed deadlines and dynamically reschedules past-due work to the current day to prevent schedule gaps.
* **Deep Work Focus Mode:** A full-screen, distraction-free zone featuring a glowing Pomodoro timer, actionable subtask checklists, and a dedicated AI assistant.
* **Real-Time State Synchronization:** Built on immutable React state patterns ensuring that database updates reflect instantly across the analytics dashboard and calendar without page reloads.
* **Interactive Workload Analytics:** A dynamic dashboard that visualizes priority breakdowns, daily completion streaks, and acts as an accomplishment counter.

---

## 🛠️ Tech Stack

**Core Infrastructure:**
* **Frontend:** Next.js (React), Tailwind CSS
* **Backend:** Next.js Server Actions, Node.js
* **Database:** Prisma ORM, SQLite/PostgreSQL

**Google Technologies Utilized:**
* **Google Gemini API:** Powers the core intelligence of the application, responsible for natural language processing, dynamic task breakdown, and the interactive Productivity Assistant.
* **Google Cloud Platform (GCP):** Utilized for the deployment, hosting, and global delivery of the live web application.

---

## 💻 Getting Started (Local Development)

First, clone the repository and install the dependencies:

```bash
npm install
# or
yarn install
```

Set up your environment variables by creating a `.env` file in the root directory:

```env
DATABASE_URL="file:./dev.db"
GEMINI_API_KEY="your_google_gemini_api_key_here"
```

Initialize the database:

```bash
npx prisma db push
```

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application in action.
