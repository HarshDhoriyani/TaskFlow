# TaskFlow — Modern Team Task Board

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

A clean, responsive team task board web application designed for agile teams to plan, organize, and track work across customizable workflow stages.

Built with **React**, **TypeScript**, **Tailwind CSS**, and a **Node.js/Express** backend with seamless **dual-mode persistence** (Express REST API with automatic `localStorage` offline fallback).

---

## 🌐 Live Deployments

| Platform | Deployment Type | Live URL |
| :--- | :--- | :--- |
| **Vercel** | Production Frontend (Instant CDN + API Proxy) | **[https://taskflow-team-board.vercel.app](https://taskflow-team-board.vercel.app/)** |
| **Render** | Full-Stack Web Service (Express REST API + Frontend) | **[https://taskflow-l4p3.onrender.com](https://taskflow-l4p3.onrender.com/)** |

> Both deployments are live and synchronized to the same persistent backend!

---

## ✨ Features Checklist

| Requirement | Implementation Details | Status |
| :--- | :--- | :---: |
| **Three Columns** | **To do**, **In progress**, **Done** with task counters, column colors, and icons | ✅ |
| **Move Tasks** | Native HTML5 Drag & Drop + Accessible 1-click **"Move to →"** buttons for mobile/touch devices | ✅ |
| **Task Management** | Full CRUD: Create, View, Edit, and Delete tasks with safe confirmation dialogs | ✅ |
| **Task Attributes** | **Title**, **Description**, **Assignee** (with avatar & role), and **Due Date** | ✅ |
| **Overdue Highlighting** | Overdue tasks (incomplete tasks past due date) highlighted with warning badges, red accent borders, and pulsing alerts | ✅ |
| **Search by Title** | Real-time search with instant matching, character highlight, and quick clear | ✅ |
| **Filter by Assignee** | Dropdown filter to isolate tasks by team member or view all | ✅ |
| **Data Persistence** | Persistent across reloads via **Node.js/Express API** (JSON file store) + resilient browser **localStorage** fallback | ✅ |
| **Mobile Responsiveness** | Responsive layout + **Mobile Column Tabs** ("To do", "In progress", "Done", "All") + touch-friendly action buttons | ✅ |
| **UI Polish** | Dark/Light theme toggle, Quick Stats bar, animated toast alerts, keyboard shortcuts (`n` for new task, `Esc` to close) | ✅ |

---

## 🏗️ Architecture & Design Decisions

### 1. Dual-Persistence Architecture (Offline-First Resilient)
- **Primary:** RESTful API powered by Node.js & Express (`/api/tasks`, `/api/assignees`), persisting to disk (`server/data/tasks.json`).
- **Fallback:** Automatic browser `localStorage` synchronization. If the backend is unreachable (or when hosted statically on Vercel/Netlify), the app seamlessly switches to `localStorage` without errors or degradation.
- **Clean Slate:** No hardcoded dummy tasks or mock assignees. Team members and tasks are created on-the-fly dynamically with automatic avatar color generation and initials.

### 2. Mobile-First & Touch-Friendly Interactions
- While desktop users enjoy intuitive drag-and-drop between columns, mobile touchscreens often struggle with drag interactions.
- To provide a **5/5 UX on mobile**:
  - Each task card features a quick **"Move: → In progress / → Done"** button group.
  - A mobile tab bar allows switching between columns on smaller screens without horizontal clutter.
  - Generous 44px+ tap targets and adaptive layout across phones, tablets, and desktops.

### 3. Dynamic Overdue Date Engine
- Rather than static dates that can expire over time, initial demo tasks use dynamic relative date offsets (e.g., `Today - 2 days`, `Today`, `Today + 3 days`).
- Completed tasks (`Done` status) are never flagged as overdue even if their original due date was in the past.
- Clear visual hierarchy:
  - 🚨 **Overdue**: Crimson alert badge + red border accent + warning icon.
  - ⚡ **Due Today**: Amber badge indicating urgent focus.
  - 📅 **Upcoming**: Clean slate badge with formatted date.
  - ✅ **Done**: Emerald badge with completed checkmark.

### 4. Component Hierarchy & Code Quality
- Clean separation of concerns with TypeScript types, custom date utilities, and modular components:
  - `Navbar`: Header branding, search input, assignee filter, theme switch, reset action.
  - `StatsBar`: Quick overview cards (Total, To do, In progress, Done, Overdue with click-to-filter).
  - `Column`: Drop target, task container, column statistics, empty states.
  - `TaskCard`: Draggable task card with search highlighter, assignee chip, and action menu.
  - `TaskModal`: Accessible modal with validation for Create/Edit operations.
  - `DeleteConfirmModal`: Confirmation dialog to prevent accidental deletion.
  - `MobileColumnTabs`: Smooth tab switching for mobile viewports.
  - `ToastContainer`: Non-blocking feedback notifications.

---

## 🚀 Quickstart & Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd "Anatahq Intern"
   ```

2. **Install all dependencies:**
   ```bash
   npm install
   ```

### Running Locally

You can run the app in **Full-Stack Mode** (concurrent frontend + backend) or as **Frontend Standalone**:

#### Option A: Full-Stack Mode (Recommended)
Runs both the Vite React dev server (port 3000) and Express server (port 5000):
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

#### Option B: Frontend Only (LocalStorage Mode)
```bash
npm run dev:client
```
Open **[http://localhost:3000](http://localhost:3000)**. The app will persist all changes directly to browser `localStorage`.

#### Option C: Backend Server Only
```bash
npm run dev:server
```
Runs Express API at **[http://localhost:5000](http://localhost:5000)**.

---

## 📦 Production Build & Deployment

### Build Everything
```bash
npm run build
```
This builds the client assets into `client/dist` and compiles server TypeScript into `server/dist`.

### Start Production Server
```bash
npm start
```
Runs the Express server on port 5000, serving both the API and the compiled React SPA.

---

## 🌐 Deploy to Cloud Providers

### 1. Vercel (Frontend & CDN)
- **Live URL:** [https://taskflow-team-board.vercel.app](https://taskflow-team-board.vercel.app/)
- Configured with `vercel.json` for automatic proxying of `/api/*` requests to the Render backend.

### 2. Render (Full-Stack Backend Service)
- **Live URL:** [https://taskflow-l4p3.onrender.com](https://taskflow-l4p3.onrender.com/)
- Configured with `render.yaml` for automatic full-stack builds (`npm install && npm run build` -> `npm start`).

### 3. Netlify (Alternative Static Host)
- Fully compatible via the included `netlify.toml` build configuration.

---

## 🔌 API Reference (Express Backend)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check endpoint returning server uptime |
| `GET` | `/api/tasks` | Returns all tasks |
| `POST` | `/api/tasks` | Creates a new task |
| `GET` | `/api/tasks/:id` | Fetches a single task by ID |
| `PUT` | `/api/tasks/:id` | Updates an existing task |
| `PATCH` | `/api/tasks/:id/move` | Moves a task to a different status column |
| `DELETE`| `/api/tasks/:id` | Deletes a task |
| `GET` | `/api/assignees` | Returns team members |
| `POST` | `/api/reset` | Resets tasks to default demo dataset |

---

## 🎥 2-Minute Screen Recording Walkthrough Script

If you are submitting a 2-minute video walkthrough, here is an easy step-by-step checklist to cover every criterion:

1. **Overview (0:00 - 0:20)**:
   - Introduce TaskFlow: three columns (*To do*, *In progress*, *Done*), stats counter, and team assignees.
   - Point out the **Overdue Task highlight** on the past-due task (red alert badge + icon).
2. **Move Tasks (0:20 - 0:40)**:
   - Drag a task from *To do* to *In progress*.
   - Use the quick 1-click **"→ Done"** button to show accessible/mobile movement.
   - Show how the Stats counter updates in real time.
3. **Search & Filters (0:40 - 1:05)**:
   - Type a keyword (e.g. *"OAuth"*) in the search bar — show highlighted matched text in the title.
   - Filter by assignee (e.g. *"Marcus Chen"*).
   - Click the **"Overdue"** stats card to isolate only overdue tasks.
   - Click **"Clear Filters"** to restore the full view.
4. **Create, Edit & Delete (1:05 - 1:35)**:
   - Click **"+ New Task"**, fill in title, description, assignee, and set due date to yesterday — demonstrate how it immediately shows the overdue warning!
   - Edit the task, update status to *Done* — show how the overdue alert disappears because it is completed.
   - Delete the task with the confirmation dialog.
5. **Persistence & Mobile Responsiveness (1:35 - 2:00)**:
   - Reload the browser page (`F5`) to demonstrate that **all tasks remain intact**!
   - Open Chrome DevTools (`Ctrl+Shift+M`) to switch to Mobile View (e.g., iPhone 14 / Pixel).
   - Show the **Mobile Column Tabs** (*To do*, *In progress*, *Done*) and smooth mobile card buttons.
   - Toggle Dark/Light mode.

---

## 📂 Project Structure

```
Anatahq Intern/
├── client/                      # React Frontend Application
│   ├── public/                  # Static assets & icons
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── Column.tsx       # Column drop target & card list
│   │   │   ├── TaskCard.tsx     # Task card with overdue badges & quick moves
│   │   │   ├── TaskModal.tsx    # Create & Edit task dialog
│   │   │   ├── DeleteConfirmModal.tsx # Safe deletion prompt
│   │   │   ├── Navbar.tsx       # Search, filter, actions, theme toggle
│   │   │   ├── StatsBar.tsx     # Overview metrics & overdue quick filter
│   │   │   ├── MobileColumnTabs.tsx # Mobile column switcher
│   │   │   └── Toast.tsx        # Toast alert system
│   │   ├── data/
│   │   │   └── initialData.ts   # Realistic seed data & assignees
│   │   ├── services/
│   │   │   └── taskService.ts   # Dual-mode API & LocalStorage service
│   │   ├── types/
│   │   │   └── task.ts          # TypeScript domain models
│   │   ├── utils/
│   │   │   └── dateUtils.ts     # Overdue calculation & human date formatting
│   │   ├── App.tsx              # Main application coordinator
│   │   ├── index.css            # Tailwind CSS directives & animations
│   │   └── main.tsx             # React DOM root entry
│   ├── index.html               # HTML5 template
│   ├── package.json             # Frontend dependencies
│   ├── tailwind.config.js       # Tailwind theme configuration
│   ├── tsconfig.json            # Client TypeScript config
│   └── vite.config.ts           # Vite bundler & API proxy configuration
├── server/                      # Node.js / Express Backend
│   ├── src/
│   │   └── index.ts             # Express REST API & static file server
│   ├── data/                    # JSON disk persistence store
│   ├── package.json             # Backend dependencies
│   └── tsconfig.json            # Server TypeScript config
├── .gitignore                   # Git ignore patterns
├── render.yaml                  # Render fullstack blueprint
├── vercel.json                  # Vercel deployment configuration
├── package.json                 # Monorepo workspaces & root scripts
└── README.md                    # Comprehensive documentation
```

---

## ⚖️ License
MIT License. Created for the Team Task Board assignment.
