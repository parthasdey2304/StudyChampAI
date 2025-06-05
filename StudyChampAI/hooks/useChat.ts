import { useState, useEffect } from 'react';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { api } from '../utils/api';
import { aiService, AIMessage } from '../utils/aiService';
import { ChatMessage } from '../types';

export const useChat = () => {
  const { messages, isLoading, addMessage, setLoading } = useChatStore();
  const { user } = useAuthStore();
  const [input, setInput] = useState('');

  useEffect(() => {
    if (user) {
      loadChatHistory();
    }
  }, [user]);

  const loadChatHistory = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await api.getChats(user.id);
      if (data) {
        data.forEach((msg: any) => {
          addMessage({
            id: msg.id,
            user_id: msg.user_id,
            message: msg.message,
            role: msg.role,
            context: msg.context,
            created_at: new Date(msg.created_at),
          });
        });
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setLoading(false);
    }
  };
  const sendMessage = async (message: string) => {
    if (!user || !message.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      user_id: user.id,
      message: message.trim(),
      role: 'user',
      created_at: new Date(),
    };

    addMessage(userMessage);
    setInput('');
    setLoading(true);

    try {
      // Save user message to database
      await api.addChat(userMessage);      // Prepare conversation context for AI
      const recentMessages = messages.slice(-5); // Get last 5 messages for context
      const aiMessages: AIMessage[] = [
        ...recentMessages.map((msg: ChatMessage) => ({
          role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.message
        })),
        {
          role: 'user' as const,
          content: message.trim()
        }
      ];

      // Get AI response
      const aiResponse = await aiService.generateResponse(aiMessages);
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        user_id: user.id,
        message: aiResponse.content,
        role: 'ai',
        context: {
          suggestions: aiResponse.suggestions,
          studyMaterials: aiResponse.studyMaterials
        },
        created_at: new Date(),
      };

      addMessage(aiMessage);
      await api.addChat(aiMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message for user feedback
      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        user_id: user.id,
        message: 'I apologize, but I encountered an issue processing your request. Please try again or rephrase your question.',
        role: 'ai',
        created_at: new Date(),
      };
      
      addMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    input,
    setInput,
    sendMessage,
  };
};
