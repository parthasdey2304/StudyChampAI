import Constants from 'expo-constants';

// AI API Configuration
const GEMINI_API_KEY = Constants.expoConfig?.extra?.GEMINI_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const DEEPSEEK_API_KEY = Constants.expoConfig?.extra?.DEEPSEEK_API_KEY || process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY;

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com/chat/completions';

export interface AIResponse {
  content: string;
  suggestions?: string[];
  studyMaterials?: {
    topics: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedTime: string;
  };
}

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

class AIService {
    
  private async callGemini(messages: AIMessage[]): Promise<AIResponse> {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    const systemPrompt = `You are StudyChampAI, an expert educational assistant. Your role is to help students study effectively by:

1. Breaking down complex topics into digestible parts
2. Creating structured learning materials
3. Suggesting study approaches
4. Generating relevant practice questions
5. Recommending study schedules

Always provide:
- Clear explanations
- Study suggestions (topics to explore)
- Estimated learning time
- Difficulty assessment

Format your response to be engaging and educational.`;

    const prompt = messages.map(msg => 
      msg.role === 'system' ? systemPrompt : 
      `${msg.role === 'user' ? 'Student' : 'StudyChampAI'}: ${msg.content}`
    ).join('\n\n');

    try {
      const response = await fetch(`${GEMINI_BASE_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, but I couldn\'t generate a response. Please try again.';

      return this.parseAIResponse(content);
    } catch (error) {
      console.error('Gemini API error:', error);
      throw error;
    }
  }

  

  private async callDeepSeek(messages: AIMessage[]): Promise<AIResponse> {
    if (!DEEPSEEK_API_KEY) {
      throw new Error('DeepSeek API key not configured');
    }

    const systemMessage: AIMessage = {
      role: 'system',
      content: `You are StudyChampAI, an expert educational assistant. Help students study effectively by providing clear explanations, study suggestions, and learning guidance. Always be encouraging and educational.`
    };

    try {
      const response = await fetch(DEEPSEEK_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [systemMessage, ...messages],
          temperature: 0.7,
          max_tokens: 1024,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || 'I apologize, but I couldn\'t generate a response. Please try again.';

      return this.parseAIResponse(content);
    } catch (error) {
      console.error('DeepSeek API error:', error);
      throw error;
    }
  }

  private parseAIResponse(content: string): AIResponse {
    // Extract study-related suggestions and metadata
    const suggestions = this.extractSuggestions(content);
    const studyMaterials = this.extractStudyMaterials(content);

    return {
      content,
      suggestions,
      studyMaterials
    };
  }

  private extractSuggestions(content: string): string[] {
    // Simple pattern matching for suggestions
    const suggestionPatterns = [
      /(?:study|learn|explore|practice|review)\s+([^.!?]+)/gi,
      /(?:topics?|subjects?|areas?):\s*([^.!?]+)/gi,
    ];

    const suggestions: string[] = [];
    suggestionPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const clean = match.replace(/^(study|learn|explore|practice|review|topics?|subjects?|areas?):\s*/i, '').trim();
          if (clean.length > 5 && clean.length < 100) {
            suggestions.push(clean);
          }
        });
      }
    });

    return suggestions.slice(0, 3); // Limit to 3 suggestions
  }

  private extractStudyMaterials(content: string): AIResponse['studyMaterials'] {
    // Extract topics mentioned in the content
    const topicPatterns = [
      /(?:topic|subject|concept|chapter):\s*([^.!?]+)/gi,
      /(?:learn about|study)\s+([^.!?]+)/gi,
    ];

    const topics: string[] = [];
    topicPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const clean = match.replace(/^(topic|subject|concept|chapter|learn about|study):\s*/i, '').trim();
          if (clean.length > 3 && clean.length < 50) {
            topics.push(clean);
          }
        });
      }
    });

    // Simple difficulty assessment based on content complexity
    const difficulty = this.assessDifficulty(content);
    const estimatedTime = this.estimateStudyTime(content);

    return {
      topics: topics.slice(0, 5),
      difficulty,
      estimatedTime
    };
  }

  private assessDifficulty(content: string): 'beginner' | 'intermediate' | 'advanced' {
    const advancedKeywords = ['advanced', 'complex', 'sophisticated', 'intricate', 'theorem', 'proof', 'calculus', 'quantum'];
    const beginnerKeywords = ['basic', 'simple', 'introduction', 'fundamental', 'elementary', 'beginner'];

    const lowerContent = content.toLowerCase();
    
    if (advancedKeywords.some(keyword => lowerContent.includes(keyword))) {
      return 'advanced';
    } else if (beginnerKeywords.some(keyword => lowerContent.includes(keyword))) {
      return 'beginner';
    } else {
      return 'intermediate';
    }
  }

  private estimateStudyTime(content: string): string {
    const wordCount = content.split(/\s+/).length;
    
    if (wordCount < 50) return '15-30 minutes';
    if (wordCount < 150) return '30-60 minutes';
    if (wordCount < 300) return '1-2 hours';
    return '2-3 hours';
  }
  public async generateResponse(messages: AIMessage[], preferredModel: 'gemini' | 'deepseek' = 'gemini'): Promise<AIResponse> {
    try {
      if (preferredModel === 'gemini' && GEMINI_API_KEY) {
        return await this.callGemini(messages);
      } else if (preferredModel === 'deepseek' && DEEPSEEK_API_KEY) {
        return await this.callDeepSeek(messages);
      } else {
        // Fallback to available API or demo response
        return this.getFallbackResponse(messages[messages.length - 1]?.content || '');
      }
    } catch (error) {
      console.error('AI API error:', error);
      // Return fallback response on error
      return this.getFallbackResponse(messages[messages.length - 1]?.content || '');
    }
  }

  public async sendMessage(message: string, context?: any): Promise<AIResponse> {
    const messages: AIMessage[] = [
      {
        role: 'user',
        content: message
      }
    ];

    // If there's context from previous messages, include it
    if (context && Array.isArray(context)) {
      messages.unshift(...context);
    }

    return this.generateResponse(messages);
  }

  private getFallbackResponse(userMessage: string): AIResponse {
    const fallbackResponses = {
      physics: "Physics is fascinating! Let's break down the concepts step by step. I can help you understand mechanics, thermodynamics, electricity, and more. What specific area interests you?",
      mathematics: "Mathematics is the language of science! Whether it's algebra, calculus, geometry, or statistics, I'm here to help you understand and practice. What mathematical concept would you like to explore?",
      biology: "Biology is the study of life! From cells and genetics to ecosystems and evolution, there's so much to discover. What biological process or system would you like to learn about?",
      chemistry: "Chemistry is all about atoms, molecules, and reactions! I can help you understand periodic tables, chemical bonds, reactions, and more. What chemistry topic interests you?",
      default: `Great question about "${userMessage}"! I'd love to help you study this topic. Let me break it down into manageable parts and create some study materials for you. What specific aspect would you like to focus on first?`
    };

    const lowerMessage = userMessage.toLowerCase();
    let response = fallbackResponses.default;

    if (lowerMessage.includes('physics') || lowerMessage.includes('newton') || lowerMessage.includes('force')) {
      response = fallbackResponses.physics;
    } else if (lowerMessage.includes('math') || lowerMessage.includes('calculus') || lowerMessage.includes('algebra')) {
      response = fallbackResponses.mathematics;
    } else if (lowerMessage.includes('biology') || lowerMessage.includes('cell') || lowerMessage.includes('photosynthesis')) {
      response = fallbackResponses.biology;
    } else if (lowerMessage.includes('chemistry') || lowerMessage.includes('chemical') || lowerMessage.includes('atom')) {
      response = fallbackResponses.chemistry;
    }

    return {
      content: response,
      suggestions: [
        'Create flashcards for key concepts',
        'Generate practice questions',
        'Find related YouTube videos'
      ],
      studyMaterials: {
        topics: [userMessage],
        difficulty: 'intermediate',
        estimatedTime: '1-2 hours'
      }
    };
  }
}

export const aiService = new AIService();
