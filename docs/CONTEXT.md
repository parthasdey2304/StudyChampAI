# 📚 StudyChampAI – Developer Guide

An AI-powered educational mobile app to help students **study effectively, manage their roadmap, and resolve doubts**, using advanced AI models and voice-based chat interaction.

---

## 🚀 Tech Stack

| Feature              | Tech Used                                              |
| -------------------- | ------------------------------------------------------ |
| Framework            | React Native (via **Expo**)                            |
| Navigation           | **Expo Router**                                        |
| Frontend             | React Native with JavaScript, Expo and Expo Router     |
| UI Framework         | React Native Paper                                     |
| Backend/Auth/Storage | **Supabase**                                           |
| Voice Interaction    | `expo-speech`, `expo-av`, or OS-level                  |
| State Management     | Zustand / Redux Toolkit                                |
| AI Models            | **Gemini 2.5 Flash**, **DeepSeek-v1**, **DeepSeek-R1** |

---

## 🗄️ Database Schema

### users
| Column         | Type         | Description                  |
| -------------- | ------------ | ---------------------------- |
| id             | uuid (PK)    | User ID (auth)               |
| email          | text         | User email                   |
| name           | text         | Display name                 |
| avatar_url     | text         | Profile picture URL          |
| created_at     | timestamp    | Registration date            |

### chats
| Column         | Type         | Description                  |
| -------------- | ------------ | ---------------------------- |
| id             | uuid (PK)    | Chat message ID              |
| user_id        | uuid (FK)    | Reference to users           |
| message        | text         | Message content              |
| role           | text         | 'user' or 'ai'               |
| context        | jsonb        | Context (file, image, etc.)  |
| created_at     | timestamp    | Sent time                    |

### flashcards
| Column         | Type         | Description                  |
| -------------- | ------------ | ---------------------------- |
| id             | uuid (PK)    | Flashcard ID                 |
| user_id        | uuid (FK)    | Reference to users           |
| topic          | text         | Topic/subject                |
| question       | text         | Front of card                |
| answer         | text         | Back of card                 |
| status         | text         | 'new', 'learning', 'mastered'|
| created_at     | timestamp    | Creation date                |

### planners
| Column         | Type         | Description                  |
| -------------- | ------------ | ---------------------------- |
| id             | uuid (PK)    | Planner entry ID             |
| user_id        | uuid (FK)    | Reference to users           |
| title          | text         | Task/Module name             |
| due_date       | date         | Deadline                     |
| completed      | boolean      | Completion status            |
| created_at     | timestamp    | Creation date                |

### uploads
| Column         | Type         | Description                  |
| -------------- | ------------ | ---------------------------- |
| id             | uuid (PK)    | Upload ID                    |
| user_id        | uuid (FK)    | Reference to users           |
| file_url       | text         | File storage URL             |
| file_type      | text         | 'pdf', 'image', etc.         |
| context        | text         | Usage context (notes, chat)  |
| created_at     | timestamp    | Upload date                  |

### notes
| Column         | Type         | Description                  |
| -------------- | ------------ | ---------------------------- |
| id             | uuid (PK)    | Note ID                      |
| user_id        | uuid (FK)    | Reference to users           |
| topic          | text         | Topic                        |
| pdf_url        | text         | PDF file URL                 |
| created_at     | timestamp    | Creation date                |

### questions
| Column         | Type         | Description                  |
| -------------- | ------------ | ---------------------------- |
| id             | uuid (PK)    | Question ID                  |
| user_id        | uuid (FK)    | Reference to users           |
| topic          | text         | Topic                        |
| question       | text         | Question text                |
| answer         | text         | Answer text                  |
| type           | text         | 'mcq', 'short', 'long', etc. |
| created_at     | timestamp    | Creation date                |

---

## 📁 Optimal Folder Structure

```bash
/app
├── (auth)
│   ├── login.tsx
│   └── signup.tsx
├── (chat)
│   ├── index.tsx               # Main Chat UI
│   └── interface-1.tsx         # Alternate Chat UI (optional)
│   └── interface-2.tsx         # Alternate Chat UI (optional)
├── (coursedoubts)
│   ├── index.tsx               # Tabbed UI: YouTube, Notes, Flashcards, etc.
├── splash.tsx                  # Splash screen
├── planner.tsx                 # Smart Planner
├── whiteboard.tsx              # Tablet-only Whiteboard
/components
│   ├── ChatInterface.tsx
│   ├── FlashcardSwiper.tsx
│   ├── CourseTabs.tsx
│   ├── DoubtSearch.tsx
│   ├── VoiceAssistant.tsx
│   └── ...                     # Other reusable components
/hooks
│   └── useAuth.ts              # Auth logic
│   └── useChat.ts              # Chat logic
│   └── usePlanner.ts           # Planner logic
│   └── ...
/store
│   └── userStore.ts            # Zustand/Redux slices
│   └── chatStore.ts
│   └── plannerStore.ts
│   └── ...
/utils
│   └── api.ts                  # API helpers
│   └── constants.ts
│   └── helpers.ts
│   └── ...
/assets
│   └── images/
│   └── icons/
│   └── fonts/
│   └── ...
/types
│   └── index.ts                # TypeScript types/interfaces
/env
│   └── .env                    # Environment variables
```

---

## 🧭 App Navigation Structure
This is a sample you need not follow it read the entire content for this and make the directory structure accordingly.

```bash
/
├── (auth)
│   ├── login.tsx
│   └── signup.tsx
├── (app)
│   ├── chat.tsx
│   ├── coursedoubts.tsx
│   └── planner.tsx
│   └── whiteboard.tsx
└── components/
    ├── ChatInterface.tsx
    ├── FlashcardSwiper.tsx
    ├── CourseTabs.tsx
    ├── DoubtSearch.tsx
    └── VoiceAssistant.tsx
```

---

## 🧑‍💻 1. **Authentication (Login / Signup)**

* Place Login/Signup buttons at the **top right**.
* Once authenticated, replace with an **avatar icon**.
* On clicking the avatar:

  * Show **tooltip menu** with:

    * `📅 Smart Planner`
    * `🧻 Whiteboard` (only enabled on **tablets**)

> 🔐 Use Firebase Auth or Supabase Auth for secure login with email/password or OAuth.

---

## 💬 2. **Chat Interface**

* Inspired by **ChatGPT UI**
* Implement using a chat screen with the following capabilities:

  * 📥 Accept input on **what the user wants to study**
  * 🧠 Process topic using **Gemini 2.5 Flash** or **DeepSeek**
  * 🎤 Enable **voice-based interaction** using:

    * Expo Speech-to-Text
    * Google/Apple voice services
  * 📎 Accept image, PDF uploads (context for study)
  * 💡 Suggest switching to `Courses & Doubts` once material is ready
  * 🔁 Option to **switch from chat** to course/doubt interface via chat button

---

## 🧠 3. **Courses & Doubts Page (Tabs UI)**

Top tabs in this screen:

* `🎥 YouTube`
* `📄 Notes (PDF)`
* `🧠 Flashcards`
* `❓ Practice Questions`
* `🔎 Doubtnut Answers`

### Each tab features:

* **YouTube**:

  * Display relevant videos via YouTube API
* **Notes**:

  * Render AI-generated PDF notes (preview or download)
* **Flashcards**:

  * Flashcards with swipe gestures (via `react-native-deck-swiper`)
* **Questions**:

  * MCQs, Short/Long Answer, Numericals (if applicable)
* **Doubtnut Integration**:

  * Search Doubtnut.com with question string via scraping/API

> 💡 Implement **Skeleton Loading** in each tab while fetching data

---

## 📅 4. Smart Planner (Calendar + Roadmap)

Accessible from Avatar tooltip:

* 📍 Track subject roadmap & deadlines
* 🗓️ Create and manage **study schedules**
* 📌 Mark completed modules or tests
* 🎯 Based on topics discussed in chat

---

## 📋 5. Whiteboard (Tablet Only)

* Draw/write ideas
* AI will read content on the whiteboard

  * → Generate flashcards
  * → Create questions
  * → Add relevant YouTube suggestions

---

## 🎙️ 6. AI Voice Interaction

* Continuous speech-to-text for conversation
* Use the mic icon within the chat input box
* Use Expo's `Speech`, `SpeechToText`, or native SDKs

---

## ✅ Example App Flow

1. **User opens StudyChampAI**
2. Sees Login/Signup → Authenticated → Avatar replaces buttons
3. Enters **Chat** tab
4. Types or speaks: "I want to study Newton's Laws"
5. AI responds with:

   * Notes in PDF
   * YouTube links
   * Flashcards
   * Practice questions
   * Doubtnut links
   * Button: "Switch to Courses & Doubts"
6. User clicks → Goes to `Courses & Doubts` screen
7. Explores tabs with all resources (skeleton loaders while loading)
8. Opens planner from avatar → Adds Newton's laws to roadmap

---

## 🧩 Additional Notes

* Use `AsyncStorage` or **Firebase Firestore** to persist:

  * User progress
  * Flashcard status
  * Planner data
* Keep state management light using **Zustand** or **Redux Toolkit**
* Use `expo-av` or `expo-speech` for voice features
* Use `react-native-tab-view` for smooth tab transitions in `Courses & Doubts`

---


## 📦 Goal

Produce a **signed APK** for Android using:

```bash
npx expo export --platform android
```

or via [EAS Build](https://docs.expo.dev/build/android/).

---

## 🧭 App Folder Structure (Using Expo Router)

```bash
/app
├── (auth)
│   ├── login.tsx
│   └── signup.tsx
├── (chat)
│   ├── index.tsx               # Default Chat interface
│   └── interface-1.tsx         # Alternate Chat Style 1
│   └── interface-2.tsx         # Alternate Chat Style 2
├── (coursedoubts)
│   ├── index.tsx               # Tabbed UI: YouTube, Notes, Flashcards, etc.
├── splash.tsx                  # Splash screen with logo
├── planner.tsx
├── whiteboard.tsx
/components
└── ...
```

## 🛠️ Supabase Tables (Minimum Required)

| Table        | Purpose                       |
| ------------ | ----------------------------- |
| `users`      | Auth + profile                |
| `chats`      | Chat message history          |
| `flashcards` | Flashcard content             |
| `planners`   | Schedule and roadmap          |
| `uploads`    | PDFs/images uploaded by user  |
| `notes`      | PDF links generated per topic |
| `questions`  | MCQs/LAQs saved               |

---

## 🎯 Final Deployment (Build APK)

After app is ready:

### Option 1: EAS Build (Recommended)

```bash
npx expo install eas-cli
eas build:configure
eas build -p android
```

### Option 2: Expo CLI

```bash
npx expo export --platform android
```

Sign & download APK → test on physical Android devices.

---

## 🧭 App Flow (Step-by-Step)

1. **Splash Screen**
   - App opens with a branded logo splash screen for a smooth introduction.

2. **Authentication**
   - User is presented with **Login** and **Signup** buttons at the top right.
   - After authentication, these are replaced by the user's **avatar icon**.
   - Clicking the avatar opens a tooltip menu with:
     - `📅 Smart Planner` (calendar/roadmap)
     - `🧻 Whiteboard` (only visible on tablets)

3. **Chat UI (Default Landing)**
   - After splash/auth, user lands on a **ChatGPT-style chat interface**.
   - Chat input supports:
     - Text
     - Voice (AI voice interaction via mic icon)
     - Image/PDF uploads for context
   - Chat is powered by **Gemini 2.5 Flash** and **DeepSeek v1/R1** models for answers and study material generation.
   - Chat asks: _"What do you want to study today?"_
   - User's study intent is analyzed and tracked for roadmap/planner.

4. **Toggle: Chat ↔ Courses & Doubts**
   - At the top, a toggle allows switching between **Chat** and **Courses & Doubts**.
   - When the user is ready, chat suggests switching to the Courses & Doubts page and provides a button for it.

5. **Courses & Doubts Page**
   - Features a **tabbed interface** with:
     - `🎥 YouTube` (relevant videos)
     - `📄 Notes (PDF)` (AI-generated notes)
     - `🧠 Flashcards` (swipeable)
     - `❓ Practice Questions` (MCQs, LAQs, numericals)
     - `🔎 Doubtnut Answers` (search integration)
   - **Skeleton loading** is shown while fetching data for each tab.
   - All resources are tailored to the user's current study topic/roadmap.

6. **Smart Planner & Whiteboard**
   - Accessed via avatar tooltip menu.
   - **Smart Planner:**
     - Calendar view for tracking study roadmap, deadlines, and completed modules.
     - Integrates with chat to auto-add topics.
   - **Whiteboard:**
     - Available only on tablets.
     - Draw/write ideas; AI reads content to generate flashcards, questions, and video suggestions.

7. **Persistent Personalization**
   - User's progress, flashcard status, planner data, and uploads are saved (via Supabase/Firebase/AsyncStorage).
   - State management is handled with Zustand or Redux Toolkit.

8. **AI Voice Interaction**
   - Continuous speech-to-text in chat for hands-free study.
   - Voice features powered by Expo's `Speech`, `SpeechToText`, or native SDKs.

9. **Final Flow**
   - User can freely switch between chat and resources, plan their study, and use voice or text as preferred.
   - All features are designed for a seamless, AI-powered, personalized study experience.

---
