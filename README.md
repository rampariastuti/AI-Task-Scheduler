# ⚡ TaskAI: The Intelligent SaaS Ecosystem

TaskAI is a premium, multi-role task management platform that leverages **Google Gemini 1.5 Flash** to provide real-time tactical feedback and automated priority escalation. Designed with a "Deep Night" glassmorphic aesthetic, it offers a high-performance environment for Admins, Managers, and Users.

---

## 🚀 Key Features

### 🤖 Gemini-Powered Intelligence
- **Tactical Feedback:** The AI analyzes pending workloads and generates strategic action plans for users.
- **Priority Escalation:** Automatic detection of approaching deadlines ( < 24h) with visual "Escalated" status indicators.

### 👥 Role-Based Architecture
- **Admin Console:** Real-time system heuristics, user counts, and global efficiency tracking using Recharts.
- **Manager Command:** Global task oversight with the ability to search team members and assign missions directly.
- **User Workspace:** Personal task management with AI-driven daily insights.

### 🎨 Premium UI/UX
- **Aesthetic:** Deep-space theme with glassmorphism, backdrop blurs, and satin finishes.
- **Animations:** Fluid transitions and layout changes powered by Framer Motion.
- **Responsiveness:** Fully optimized for mobile, tablet, and desktop viewports.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (Turbopack)
- **Database/Auth:** Firebase (Firestore & Authentication)
- **AI Engine:** Google Gemini AI SDK
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Data Visualization:** Recharts

---

## ⚙️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/shreythakkar2056/ai-task-scheduler.git]
   cd ai-task-scheduler
2.**Install dependencies:**


    npm install
3. **.env.local**
    # Firebase Client Configuration
    NEXT_PUBLIC_FIREBASE_API_KEY="XYZ"
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="XYZ"
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="XYZ"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="XYZ"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="XYZ"
    NEXT_PUBLIC_FIREBASE_APP_ID="XYZ"

    # AI Configuration
    NEXT_PUBLIC_GEMINI_API_KEY=add api key
4 ** run**
    npm run dev
