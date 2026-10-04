# M Diet 🥗

> **M Diet** is an AI-powered calorie, nutrition, hydration, weight-management, and activity-tracking web application inspired by the workflow of MyFitnessPal, but with a much simpler, intelligent, Apple-style AI-first experience.

---

## ✨ Features

- **Apple-Style Design Language**: Minimal, spacious, elegant, smooth, and highly responsive with Sky Blue (`#0284c7`), pure white cards, and neutral gray surfaces (`#f5f5f7`).
- **Step-by-Step Onboarding**: Smooth card-based wizard (`01 ─── 02 ─── 03...`) collecting essential biometrics and goals.
- **AI Personalized Plan Generation**: Sends biometrics to Gemini to calculate 2–3 structured nutritional frameworks (`Balanced Fat Loss`, `High Protein Optimization`, `Calm & Sustainable`).
- **Dynamic Calorie Balance System**:
  - Deterministic arithmetic engine (Target kcal, Consumed `+`, Burned `-`, Net, Remaining).
  - Macronutrient breakdown (Protein, Carbs, Fat).
- **Dual Food Logging**:
  1. **Camera Food Scan**: Live device camera capture or photo upload $\to$ preview with `✓ Use Photo` / `✕ Retake` $\to$ Gemini multimodal vision analysis $\to$ `"Does this look right?"` confirmation card $\to$ user confirms `✓ I ate this`.
  2. **Manual Natural Language Input**: Describe meals in plain English (e.g. *"2 eggs and 2 slices of toast"*) $\to$ Gemini parses nutritional items $\to$ confirmation card $\to$ user confirms `✓ I ate this`.
- **Daily Food Log Timeline**: Grouped into Breakfast, Lunch, Dinner, and Snacks with instant edit and delete.
- **Hydration Tracker**: Dedicated water section with visual rising fluid animation, quick increments (`+250ml`, `+500ml`, `+750ml`, `+1L`), custom inputs, and `ml ⇋ L` unit toggle.
- **Step Tracking**: Animated circular progress ring, deterministic distance and calorie estimation based on height & weight, and manual step logging.
- **Scientific Exercise Tracking**: Log Walking, Running, Cycling, Gym, Swimming, Strength Training, HIIT, Yoga, etc., with deterministic MET calculations.
- **Progress & Analytics**: 7-day, 30-day, and 90-day timeframes featuring Apple Health style calorie intake vs. target charts and weight trajectory analytics.
- **Structured AI Recommendations**: Non-chatbot intelligence layer that detects adherence patterns and offers structured interactive cards to update targets.
- **Client-Side Local Storage**: Complete offline persistence across reloads using keys:
  - `mDiet_user`
  - `mDiet_plan`
  - `mDiet_foodLogs`
  - `mDiet_exerciseLogs`
  - `mDiet_water`
  - `mDiet_weightHistory`
  - `mDiet_steps`
  - `mDiet_settings`
- **Zero API Key Leakage**: `GEMINI_API_KEY` is loaded strictly server-side via Next.js API routes (`/api/gemini/*`).

---

## 🚀 Getting Started

### 1. Configure your Gemini API Key
Open `.env.local` and replace the placeholder with your Gemini API key:

```env
GEMINI_API_KEY=YOUR_ACTUAL_GEMINI_API_KEY
```

> **Note**: Even without an API key, M Diet operates with a built-in deterministic clinical nutrition engine so you can preview all features immediately.

### 2. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production

```bash
npm run build
npm start
```
# MDiet-AI
