const Constants = {
  // App Info
  APP_NAME: 'StudyChampAI',
  VERSION: '1.0.0',
  
  // API Endpoints
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  GEMINI_API_KEY: process.env.EXPO_PUBLIC_GEMINI_API_KEY || '',
  DEEPSEEK_API_KEY: process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY || '',
  YOUTUBE_API_KEY: process.env.EXPO_PUBLIC_YOUTUBE_API_KEY || '',
  
  // UI Constants
  COLORS: {
    PRIMARY: '#1DB954',
    BACKGROUND: '#000',
    SURFACE: '#222',
    TEXT: '#fff',
    TEXT_SECONDARY: '#888',
    ERROR: '#FF6B6B',
    WARNING: '#FFE66D',
    SUCCESS: '#4ECDC4',
  },
  
  // Sizes
  SIZES: {
    BORDER_RADIUS: 8,
    SPACING: 16,
    HEADER_HEIGHT: 60,
    TAB_HEIGHT: 50,
  },
  
  // Other
  MAX_MESSAGE_LENGTH: 500,
  MAX_TASKS_PER_DAY: 10,
};

export default Constants;
