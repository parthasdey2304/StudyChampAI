import { useState, useEffect } from 'react';
import { doubtnutService, DoubtnutQuestion } from '../utils/doubtnutService';

export const useDoubtnut = () => {
  const [questions, setQuestions] = useState<DoubtnutQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');

  useEffect(() => {
    loadPopularQuestions();
  }, []);

  const loadPopularQuestions = async () => {
    setIsLoading(true);
    try {
      const popularQuestions = await doubtnutService.getPopularQuestions();
      setQuestions(popularQuestions);
    } catch (error) {
      console.error('Error loading popular questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const searchQuestions = async (query: string, subject?: string) => {
    if (!query.trim()) {
      await loadPopularQuestions();
      return;
    }

    setIsLoading(true);
    try {
      const result = await doubtnutService.searchQuestions(query, subject);
      setQuestions(result.questions);
    } catch (error) {
      console.error('Error searching questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterBySubject = async (subject: string) => {
    setSelectedSubject(subject);
    setIsLoading(true);
    try {
      const subjectQuestions = await doubtnutService.getQuestionsBySubject(subject);
      setQuestions(subjectQuestions);
    } catch (error) {
      console.error('Error filtering by subject:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSimilarQuestions = async (questionId: string) => {
    try {
      const similar = await doubtnutService.getSimilarQuestions(questionId);
      return similar;
    } catch (error) {
      console.error('Error getting similar questions:', error);
      return [];
    }
  };

  const clearFilters = () => {
    setSelectedSubject('');
    setSearchQuery('');
    loadPopularQuestions();
  };

  const availableSubjects = doubtnutService.getAvailableSubjects();

  return {
    questions,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedSubject,
    availableSubjects,
    searchQuestions,
    filterBySubject,
    getSimilarQuestions,
    clearFilters,
    loadPopularQuestions,
  };
};
