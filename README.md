
# 📚 StudyChampAI

> Your AI-powered learning assistant – Built with React Native, Supabase, and cutting-edge LLMs like Gemini 2.5 & DeepSeek.

![React Native](https://img.shields.io/badge/React%20Native-2025-blue?logo=react)
![Supabase](https://img.shields.io/badge/Supabase-Realtime-green?logo=supabase)
![Expo](https://img.shields.io/badge/Expo-Router-black?logo=expo)
![License](https://img.shields.io/github/license/yourusername/studychampai)

---

## 🧠 What is StudyChampAI?

**StudyChampAI** is an AI-driven mobile app that personalizes student learning through:

- AI Chat (Text + Voice)
- Flashcards
- Notes & YouTube integration
- Doubt solving via Doubtnut
- Smart calendar-based study planner

---

## 🚀 Features

- 🔐 **Supabase Auth** (Email/password based)
- 🧑‍🏫 **LLM Chat Interface** (Choose from Gemini or DeepSeek)
- 🎤 **Voice Interaction** (via Expo Speech/Voice)
- 🎥 **Courses & Doubts Hub** (YouTube + Notes + Flashcards)
- 🧠 **AI Flashcard Generator**
- 🗓️ **Smart Planner with Calendar**
- ✍️ **Whiteboard** (Tablet-only drawing support)
- 📥 **Supabase Data Storage** for all user sessions, notes, planners

---

## 🛠 Tech Stack

| Layer           | Tech Used                           |
|----------------|--------------------------------------|
| Frontend        | React Native + TypeScript           |
| Routing         | Expo Router                         |
| Backend/Auth    | Supabase                            |
| AI Models       | Gemini 2.5 Flash, DeepSeek-v1 & R1  |
| Voice Input     | Expo Speech / OS APIs               |
| State Management| Zustand / Redux Toolkit (optional)  |

---

## 📲 Screenshots

> _(Add actual screenshots or GIFs here of the app interface)_

---

## 📦 Project Structure

```bash
/app
├── (auth)             # Login/Signup screens
├── (chat)             # Multi-style chat UI
├── (coursedoubts)     # Tabbed content (notes, flashcards, etc.)
├── splash.tsx         # Splash screen
├── planner.tsx        # Smart planner
├── whiteboard.tsx     # Tablet-only whiteboard
/components
/supabase              # Supabase client & queries
/assets
```

---

## 🧪 Getting Started (Dev Setup)

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/studychampai.git
cd studychampai
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env` file and add:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run the app
```bash
npx expo start
```

---

## 🔐 Supabase Setup

- Enable **Email Auth** in Supabase
- Create tables:
  - `users`, `chats`, `planners`, `flashcards`, `notes`, `questions`
- Store session tokens using `expo-secure-store` or AsyncStorage

---

## 📦 Building APK (Android)

> Make sure you’ve configured `eas.json`

```bash
npx expo install eas-cli
eas build:configure
eas build -p android
```

---

## 🌐 Deployment

Coming soon: Deploy on Play Store with auto updates via EAS Update.

---

## 🧾 License

MIT License © 2025 [Partha Sarathi Dey](https://github.com/parthasarthidey)

---

## 🙌 Acknowledgements

- [Supabase](https://supabase.com)
- [Gemini API](https://ai.google.dev)
- [DeepSeek](https://deepseek.com)
- [Doubtnut](https://www.doubtnut.com)
- [Expo](https://expo.dev)

---
