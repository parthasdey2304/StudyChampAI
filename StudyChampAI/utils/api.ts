import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || 'https://iqhztnoffxdkyocgncmo.supabase.co';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxaHp0bm9mZnhka3lvY2duY21vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNTQzMzQsImV4cCI6MjA2NDYzMDMzNH0.bKM_dVFWhTxEPtkiBZeLpLUvd3L4pQhs6WL8vaB8x78';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// API helper functions
export const api = {
  // Auth functions
  signUp: async (email: string, password: string) => {
    return await supabase.auth.signUp({ email, password });
  },

  signIn: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  },

  signOut: async () => {
    return await supabase.auth.signOut();
  },

  // Chat functions
  getChats: async (userId: string) => {
    return await supabase
      .from('chats')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
  },

  addChat: async (message: any) => {
    return await supabase.from('chats').insert([message]);
  },

  // Flashcard functions
  getFlashcards: async (userId: string) => {
    return await supabase
      .from('flashcards')
      .select('*')
      .eq('user_id', userId);
  },

  addFlashcard: async (flashcard: any) => {
    return await supabase.from('flashcards').insert([flashcard]);
  },

  // Planner functions
  getTasks: async (userId: string) => {
    return await supabase
      .from('planners')
      .select('*')
      .eq('user_id', userId)
      .order('due_date', { ascending: true });
  },

  addTask: async (task: any) => {
    return await supabase.from('planners').insert([task]);
  },

  updateTask: async (id: string, updates: any) => {
    return await supabase
      .from('planners')
      .update(updates)
      .eq('id', id);
  },
};
