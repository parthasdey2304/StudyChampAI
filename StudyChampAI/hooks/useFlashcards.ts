import { useState, useEffect } from 'react';
import { Flashcard } from '../types';

// Sample flashcards data - in a real app, this would come from Supabase
const sampleFlashcards: Flashcard[] = [
  {
    id: '1',
    user_id: 'sample',
    topic: 'Physics',
    question: 'What is Newton\'s First Law of Motion?',
    answer: 'An object at rest stays at rest, and an object in motion stays in motion, unless acted upon by an external force.',
    status: 'new',
    created_at: new Date(),
  },
  {
    id: '2',
    user_id: 'sample',
    topic: 'Physics',
    question: 'What is the formula for Force?',
    answer: 'Force = Mass × Acceleration (F = ma)',
    status: 'learning',
    created_at: new Date(),
  },
  {
    id: '3',
    user_id: 'sample',
    topic: 'Physics',
    question: 'What is Newton\'s Third Law?',
    answer: 'For every action, there is an equal and opposite reaction.',
    status: 'new',
    created_at: new Date(),
  },
  {
    id: '4',
    user_id: 'sample',
    topic: 'Mathematics',
    question: 'What is the derivative of x²?',
    answer: '2x',
    status: 'mastered',
    created_at: new Date(),
  },
  {
    id: '5',
    user_id: 'sample',
    topic: 'Biology',
    question: 'What process do plants use to convert sunlight to energy?',
    answer: 'Photosynthesis - the process by which plants convert light energy, carbon dioxide, and water into glucose and oxygen.',
    status: 'new',
    created_at: new Date(),
  },
];

export const useFlashcards = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadFlashcards();
  }, []);

  const loadFlashcards = async () => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setFlashcards(sampleFlashcards);
    } catch (error) {
      console.error('Error loading flashcards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFlashcardStatus = async (cardId: string, status: 'new' | 'learning' | 'mastered') => {
    try {
      setFlashcards(prev => 
        prev.map(card => 
          card.id === cardId ? { ...card, status } : card
        )
      );
      // In a real app, this would update the database
      console.log(`Updated flashcard ${cardId} status to ${status}`);
    } catch (error) {
      console.error('Error updating flashcard status:', error);
    }
  };

  const addFlashcard = async (flashcard: Omit<Flashcard, 'id' | 'created_at'>) => {
    try {
      const newFlashcard: Flashcard = {
        ...flashcard,
        id: Date.now().toString(),
        created_at: new Date(),
      };
      setFlashcards(prev => [...prev, newFlashcard]);
      // In a real app, this would save to the database
      console.log('Added new flashcard:', newFlashcard);
    } catch (error) {
      console.error('Error adding flashcard:', error);
    }
  };

  const generateFlashcardsFromTopic = async (topic: string): Promise<Flashcard[]> => {
    // This would integrate with the AI service to generate flashcards
    // For now, return filtered sample cards or generate new ones
    const topicCards = flashcards.filter(card => 
      card.topic.toLowerCase().includes(topic.toLowerCase()) ||
      card.question.toLowerCase().includes(topic.toLowerCase()) ||
      card.answer.toLowerCase().includes(topic.toLowerCase())
    );

    if (topicCards.length > 0) {
      return topicCards;
    }

    // Generate new flashcards based on topic (placeholder)
    return [
      {
        id: `generated_${Date.now()}`,
        user_id: 'sample',
        topic: topic,
        question: `What is a key concept related to ${topic}?`,
        answer: `This is an AI-generated answer about ${topic}.`,
        status: 'new',
        created_at: new Date(),
      }
    ];
  };

  return {
    flashcards,
    isLoading,
    loadFlashcards,
    updateFlashcardStatus,
    addFlashcard,
    generateFlashcardsFromTopic,
  };
};
