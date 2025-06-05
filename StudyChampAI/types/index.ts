export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: Date;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  role: 'user' | 'ai';
  context?: any;
  created_at: Date;
}

export interface Flashcard {
  id: string;
  user_id: string;
  topic: string;
  question: string;
  answer: string;
  status: 'new' | 'learning' | 'mastered';
  created_at: Date;
}

export interface PlannerTask {
  id: string;
  user_id: string;
  title: string;
  due_date: Date;
  completed: boolean;
  created_at: Date;
}

export interface Upload {
  id: string;
  user_id: string;
  file_url: string;
  file_type: string;
  context: string;
  created_at: Date;
}

export interface Note {
  id: string;
  user_id: string;
  topic: string;
  pdf_url: string;
  created_at: Date;
}

export interface Question {
  id: string;
  user_id: string;
  topic: string;
  question: string;
  answer: string;
  type: 'mcq' | 'short' | 'long';
  created_at: Date;
}

export type TabType = 'youtube' | 'notes' | 'flashcards' | 'questions' | 'doubtnut';
