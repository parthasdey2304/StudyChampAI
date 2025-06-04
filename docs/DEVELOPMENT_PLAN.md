# 🛠️ StudyChampAI – Step-by-Step Development Plan

This plan breaks down the development of StudyChampAI into focused, sequential tasks. Each step builds on the previous, ensuring a smooth and maintainable workflow. Refer to CONTEXT.md for detailed requirements and architecture.

---

## 1. Project Setup & Tooling
- [ ] Initialize Expo project (if not already done)
- [ ] Set up TypeScript (if desired)
- [ ] Install core dependencies (see package.json)
- [ ] Set up version control (Git)
- [ ] Configure ESLint/Prettier for code quality
- [ ] Set up environment variable management

## 2. Folder Structure & Boilerplate
- [ ] Create folder structure as per CONTEXT.md (`/app`, `/components`, `/hooks`, `/store`, `/utils`, `/types`, `/assets`, `/env`)
- [ ] Add placeholder files for key screens and components
- [ ] Set up navigation using Expo Router

## 3. Splash Screen
- [ ] Implement branded splash screen (`/app/splash.tsx`)
- [ ] Configure app.json for splash assets

## 4. Authentication (Login/Signup)
- [ ] Build login and signup screens (`/app/(auth)/login.tsx`, `signup.tsx`)
- [ ] Integrate Supabase Auth (or Firebase Auth)
- [ ] Implement avatar menu with planner/whiteboard access

## 5. Chat Interface
- [ ] Create default chat UI (`/app/(chat)/index.tsx`)
- [ ] Implement chat input (text, voice, file upload)
- [ ] Integrate AI backend (Gemini 2.5 Flash, DeepSeek)
- [ ] Store chat history in Supabase
- [ ] Add toggle/button to switch to Courses & Doubts

## 6. Courses & Doubts Page
- [ ] Build tabbed interface (`/app/(coursedoubts)/index.tsx`)
- [ ] Implement tabs: YouTube, Notes, Flashcards, Questions, Doubtnut
- [ ] Add skeleton loaders for data fetching
- [ ] Integrate YouTube API, PDF rendering, flashcard swiper, question list, Doubtnut search

## 7. Smart Planner
- [ ] Implement planner screen (`/app/planner.tsx`)
- [ ] Calendar view, add/edit tasks, mark complete
- [ ] Sync with chat topics and Supabase

## 8. Whiteboard (Tablet Only)
- [ ] Build whiteboard UI (`/app/whiteboard.tsx`)
- [ ] Enable drawing/writing
- [ ] Integrate AI to read content and generate resources

## 9. State Management & Persistence
- [ ] Set up Zustand or Redux Toolkit
- [ ] Persist user progress, flashcards, planner data (Supabase/Firebase/AsyncStorage)

## 10. Voice Interaction
- [ ] Integrate Expo Speech/SpeechToText
- [ ] Add mic icon and continuous speech-to-text in chat

## 11. UI Polish & Responsiveness
- [ ] Use React Native Paper for UI components
- [ ] Ensure tablet/phone responsiveness
- [ ] Add skeleton loaders, error states, and accessibility features

## 12. Testing & QA
- [ ] Write unit and integration tests
- [ ] Manual QA on Android/iOS devices

## 13. Deployment
- [ ] Configure EAS Build for Android/iOS
- [ ] Build and sign APK (see CONTEXT.md)
- [ ] Final review and publish

---

> **Tip:** Tackle one section at a time. Mark tasks as complete as you progress. Refer to CONTEXT.md for details on each feature and table schema. 