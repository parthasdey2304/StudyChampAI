import { useState, useEffect } from 'react';
import { 
  practiceQuestionsService, 
  PracticeQuestion, 
  QuizSession, 
  QuizResult 
} from '../utils/practiceQuestionsService';

export const usePracticeQuestions = () => {
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [currentSession, setCurrentSession] = useState<QuizSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInQuizMode, setIsInQuizMode] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    loadSampleQuestions();
  }, []);

  const loadSampleQuestions = async () => {
    setIsLoading(true);
    try {
      const sampleQuestions = await practiceQuestionsService.getSampleQuestions();
      setQuestions(sampleQuestions);
    } catch (error) {
      console.error('Error loading sample questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateQuestionsByTopic = async (topic: string, difficulty?: string, count: number = 5) => {
    setIsLoading(true);
    try {
      const topicQuestions = await practiceQuestionsService.generateQuestionsByTopic(topic, difficulty, count);
      setQuestions(topicQuestions);
    } catch (error) {
      console.error('Error generating questions by topic:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startQuiz = (questionsToUse?: PracticeQuestion[]) => {
    const quizQuestions = questionsToUse || questions;
    if (quizQuestions.length === 0) return;

    const session = practiceQuestionsService.createQuizSession(quizQuestions);
    setCurrentSession(session);
    setIsInQuizMode(true);
    setQuizResult(null);
  };

  const submitAnswer = (answer: string) => {
    if (!currentSession) return;

    const updatedSession = practiceQuestionsService.submitAnswer(currentSession, answer);
    setCurrentSession(updatedSession);
  };

  const nextQuestion = () => {
    if (!currentSession) return;

    const updatedSession = practiceQuestionsService.nextQuestion(currentSession);
    setCurrentSession(updatedSession);

    if (updatedSession.isCompleted) {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    if (!currentSession) return;

    const result = practiceQuestionsService.generateQuizResults(currentSession);
    setQuizResult(result);
    setIsInQuizMode(false);
  };

  const resetQuiz = () => {
    setCurrentSession(null);
    setIsInQuizMode(false);
    setQuizResult(null);
  };

  const getCurrentQuestion = (): PracticeQuestion | null => {
    if (!currentSession || currentSession.currentQuestionIndex >= currentSession.questions.length) {
      return null;
    }
    return currentSession.questions[currentSession.currentQuestionIndex];
  };

  const getProgress = (): { current: number; total: number; percentage: number } => {
    if (!currentSession) {
      return { current: 0, total: 0, percentage: 0 };
    }
    
    const current = currentSession.currentQuestionIndex;
    const total = currentSession.questions.length;
    const percentage = total > 0 ? (current / total) * 100 : 0;
    
    return { current, total, percentage };
  };

  const hasAnswered = (questionId: string): boolean => {
    return currentSession ? questionId in currentSession.answers : false;
  };

  const getUserAnswer = (questionId: string): string | undefined => {
    return currentSession?.answers[questionId];
  };

  // Get available subjects and topics
  const availableSubjects = practiceQuestionsService.getAvailableSubjects();
  const availableTopics = practiceQuestionsService.getAvailableTopics();

  return {
    // State
    questions,
    currentSession,
    isLoading,
    isInQuizMode,
    quizResult,
    availableSubjects,
    availableTopics,
    
    // Actions
    loadSampleQuestions,
    generateQuestionsByTopic,
    startQuiz,
    submitAnswer,
    nextQuestion,
    finishQuiz,
    resetQuiz,
    
    // Computed values
    getCurrentQuestion,
    getProgress,
    hasAnswered,
    getUserAnswer,
  };
};
