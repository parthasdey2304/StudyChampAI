// Practice Questions Service
// Generates various types of practice questions for studying

export interface PracticeQuestion {
  id: string;
  question: string;
  type: 'mcq' | 'short-answer' | 'long-answer' | 'numerical';
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  options?: string[]; // For MCQ
  correctAnswer: string;
  explanation?: string;
  points: number;
  timeLimit?: number; // in minutes
}

export interface QuizSession {
  id: string;
  questions: PracticeQuestion[];
  currentQuestionIndex: number;
  answers: { [questionId: string]: string };
  score: number;
  totalPoints: number;
  startTime: Date;
  endTime?: Date;
  isCompleted: boolean;
}

export interface QuizResult {
  session: QuizSession;
  correctAnswers: number;
  totalQuestions: number;
  scorePercentage: number;
  timeTaken: number; // in minutes
  categoryBreakdown: { [category: string]: { correct: number; total: number } };
}

class PracticeQuestionsService {
  // Sample questions for demonstration
  private sampleQuestions: PracticeQuestion[] = [
    {
      id: '1',
      question: 'What is the derivative of sin(x) with respect to x?',
      type: 'mcq',
      subject: 'Mathematics',
      topic: 'Calculus',
      difficulty: 'easy',
      options: ['cos(x)', '-cos(x)', 'sin(x)', '-sin(x)'],
      correctAnswer: 'cos(x)',
      explanation: 'The derivative of sin(x) is cos(x). This is a fundamental trigonometric derivative.',
      points: 5,
      timeLimit: 2,
    },
    {
      id: '2',
      question: 'A ball is thrown upward with an initial velocity of 20 m/s. Calculate the maximum height reached. (g = 10 m/s²)',
      type: 'numerical',
      subject: 'Physics',
      topic: 'Kinematics',
      difficulty: 'medium',
      correctAnswer: '20',
      explanation: 'Using v² = u² + 2as, at maximum height v = 0. So 0 = 400 - 2×10×h, therefore h = 20m',
      points: 10,
      timeLimit: 5,
    },
    {
      id: '3',
      question: 'Explain the process of photosynthesis in plants.',
      type: 'short-answer',
      subject: 'Biology',
      topic: 'Plant Biology',
      difficulty: 'easy',
      correctAnswer: 'Photosynthesis is the process by which plants convert light energy, carbon dioxide, and water into glucose and oxygen using chlorophyll.',
      explanation: 'This process occurs in chloroplasts and is essential for plant survival and oxygen production.',
      points: 8,
      timeLimit: 3,
    },
    {
      id: '4',
      question: 'What is the chemical formula for water?',
      type: 'mcq',
      subject: 'Chemistry',
      topic: 'Basic Chemistry',
      difficulty: 'easy',
      options: ['H2O', 'CO2', 'NaCl', 'CH4'],
      correctAnswer: 'H2O',
      explanation: 'Water consists of two hydrogen atoms and one oxygen atom.',
      points: 3,
      timeLimit: 1,
    },
    {
      id: '5',
      question: 'Solve the quadratic equation: x² - 5x + 6 = 0',
      type: 'numerical',
      subject: 'Mathematics',
      topic: 'Algebra',
      difficulty: 'medium',
      correctAnswer: 'x = 2, 3',
      explanation: 'Factoring: (x-2)(x-3) = 0, so x = 2 or x = 3',
      points: 8,
      timeLimit: 4,
    },
    {
      id: '6',
      question: 'Describe Newton\'s three laws of motion and provide real-world examples for each.',
      type: 'long-answer',
      subject: 'Physics',
      topic: 'Laws of Motion',
      difficulty: 'hard',
      correctAnswer: '1. First Law (Inertia): Objects at rest stay at rest, objects in motion stay in motion unless acted upon by an external force. Example: A book on a table stays put until someone pushes it. 2. Second Law: F = ma. The acceleration of an object is directly proportional to the net force and inversely proportional to its mass. Example: Pushing a car vs pushing a bicycle with same force. 3. Third Law: For every action, there is an equal and opposite reaction. Example: Walking - you push back on the ground, ground pushes forward on you.',
      explanation: 'These laws form the foundation of classical mechanics and explain motion in everyday life.',
      points: 15,
      timeLimit: 10,
    },
  ];

  // Generate questions by topic/subject
  async generateQuestionsByTopic(topic: string, difficulty?: string, count: number = 5): Promise<PracticeQuestion[]> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Filter questions based on criteria
      let filteredQuestions = this.sampleQuestions.filter(q => 
        q.topic.toLowerCase().includes(topic.toLowerCase()) ||
        q.subject.toLowerCase().includes(topic.toLowerCase())
      );

      if (difficulty) {
        filteredQuestions = filteredQuestions.filter(q => q.difficulty === difficulty);
      }

      // If not enough questions, add some from same subject
      if (filteredQuestions.length < count) {
        const subjectQuestions = this.sampleQuestions.filter(q => 
          !filteredQuestions.includes(q) &&
          filteredQuestions.some(fq => fq.subject === q.subject)
        );
        filteredQuestions.push(...subjectQuestions.slice(0, count - filteredQuestions.length));
      }

      // Shuffle and return requested count
      return this.shuffleArray(filteredQuestions).slice(0, count);
    } catch (error) {
      console.error('Error generating questions:', error);
      return [];
    }
  }

  // Create a new quiz session
  createQuizSession(questions: PracticeQuestion[]): QuizSession {
    return {
      id: Date.now().toString(),
      questions: this.shuffleArray([...questions]),
      currentQuestionIndex: 0,
      answers: {},
      score: 0,
      totalPoints: questions.reduce((sum, q) => sum + q.points, 0),
      startTime: new Date(),
      isCompleted: false,
    };
  }

  // Submit answer for current question
  submitAnswer(session: QuizSession, answer: string): QuizSession {
    const currentQuestion = session.questions[session.currentQuestionIndex];
    const updatedAnswers = { ...session.answers, [currentQuestion.id]: answer };
    
    // Calculate score
    let score = 0;
    Object.entries(updatedAnswers).forEach(([questionId, userAnswer]) => {
      const question = session.questions.find(q => q.id === questionId);
      if (question && this.isAnswerCorrect(question, userAnswer)) {
        score += question.points;
      }
    });

    return {
      ...session,
      answers: updatedAnswers,
      score,
    };
  }

  // Move to next question
  nextQuestion(session: QuizSession): QuizSession {
    const nextIndex = session.currentQuestionIndex + 1;
    const isCompleted = nextIndex >= session.questions.length;

    return {
      ...session,
      currentQuestionIndex: nextIndex,
      isCompleted,
      endTime: isCompleted ? new Date() : session.endTime,
    };
  }

  // Check if answer is correct
  private isAnswerCorrect(question: PracticeQuestion, userAnswer: string): boolean {
    const correctAnswer = question.correctAnswer.toLowerCase().trim();
    const userAnswerNormalized = userAnswer.toLowerCase().trim();

    if (question.type === 'mcq') {
      return correctAnswer === userAnswerNormalized;
    } else if (question.type === 'numerical') {
      // For numerical answers, check if the numbers match
      const correctNumbers = correctAnswer.match(/\d+(\.\d+)?/g) || [];
      const userNumbers = userAnswerNormalized.match(/\d+(\.\d+)?/g) || [];
      return correctNumbers.length === userNumbers.length && 
             correctNumbers.every((num, index) => Math.abs(parseFloat(num) - parseFloat(userNumbers[index])) < 0.01);
    } else {
      // For text answers, check for key words (simplified)
      const correctWords = correctAnswer.split(' ').filter(word => word.length > 3);
      const userWords = userAnswerNormalized.split(' ');
      const matchedWords = correctWords.filter(word => 
        userWords.some(userWord => userWord.includes(word) || word.includes(userWord))
      );
      return matchedWords.length >= Math.ceil(correctWords.length * 0.6); // 60% match
    }
  }

  // Generate quiz results
  generateQuizResults(session: QuizSession): QuizResult {
    const correctAnswers = Object.entries(session.answers).filter(([questionId, answer]) => {
      const question = session.questions.find(q => q.id === questionId);
      return question && this.isAnswerCorrect(question, answer);
    }).length;

    const totalQuestions = session.questions.length;
    const scorePercentage = (session.score / session.totalPoints) * 100;
    const timeTaken = session.endTime 
      ? (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60)
      : 0;

    // Category breakdown
    const categoryBreakdown: { [category: string]: { correct: number; total: number } } = {};
    session.questions.forEach(question => {
      const category = question.subject;
      if (!categoryBreakdown[category]) {
        categoryBreakdown[category] = { correct: 0, total: 0 };
      }
      categoryBreakdown[category].total++;
      
      const userAnswer = session.answers[question.id];
      if (userAnswer && this.isAnswerCorrect(question, userAnswer)) {
        categoryBreakdown[category].correct++;
      }
    });

    return {
      session,
      correctAnswers,
      totalQuestions,
      scorePercentage,
      timeTaken,
      categoryBreakdown,
    };
  }

  // Get available subjects
  getAvailableSubjects(): string[] {
    return [...new Set(this.sampleQuestions.map(q => q.subject))];
  }

  // Get available topics
  getAvailableTopics(): string[] {
    return [...new Set(this.sampleQuestions.map(q => q.topic))];
  }

  // Get questions by difficulty
  getQuestionsByDifficulty(difficulty: string): PracticeQuestion[] {
    return this.sampleQuestions.filter(q => q.difficulty === difficulty);
  }

  // Utility function to shuffle array
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Get sample practice questions for demo
  async getSampleQuestions(): Promise<PracticeQuestion[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.sampleQuestions.slice(0, 4);
  }
}

export const practiceQuestionsService = new PracticeQuestionsService();
