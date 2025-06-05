import { useState, useEffect } from 'react';
import * as Speech from 'expo-speech';
import { Platform, Alert } from 'react-native';

// Note: expo-audio API is different from expo-av
// For now, we'll implement voice functionality without audio recording
// In a production app, you would integrate with a speech-to-text service

export interface UseVoiceReturn {
  isListening: boolean;
  isPlaying: boolean;
  startListening: () => Promise<void>;
  stopListening: () => void;
  speak: (text: string) => Promise<void>;
  stopSpeaking: () => void;
  transcript: string;
  clearTranscript: () => void;
}

export const useVoice = (): UseVoiceReturn => {
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    // No audio permissions needed for speech synthesis only
  }, []);

  const startListening = async () => {
    try {
      if (Platform.OS === 'web') {
        // Web-based speech recognition
        startWebSpeechRecognition();
        return;
      }

      // For mobile platforms, simulate voice input for now
      // In a production app, you would integrate with a speech-to-text service
      setIsListening(true);
      simulateTranscription();
    } catch (error) {
      console.error('Error starting voice recording:', error);
      Alert.alert('Error', 'Failed to start voice recording. Please try again.');
    }
  };

  const stopListening = () => {
    try {
      if (Platform.OS === 'web') {
        stopWebSpeechRecognition();
        return;
      }

      setIsListening(false);
    } catch (error) {
      console.error('Error stopping voice recording:', error);
      setIsListening(false);
    }
  };

  const speak = async (text: string) => {
    try {
      setIsPlaying(true);
      
      await Speech.speak(text, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.85,
        onDone: () => setIsPlaying(false),
        onError: () => setIsPlaying(false),
      });
    } catch (error) {
      console.error('Error during text-to-speech:', error);
      setIsPlaying(false);
    }
  };

  const stopSpeaking = () => {
    Speech.stop();
    setIsPlaying(false);
  };

  const clearTranscript = () => {
    setTranscript('');
  };

  // Web Speech Recognition (for web platform)
  const startWebSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      (window as any).currentRecognition = recognition;
    } else {
      Alert.alert('Not Supported', 'Speech recognition is not supported in this browser.');
    }
  };

  const stopWebSpeechRecognition = () => {
    if ((window as any).currentRecognition) {
      (window as any).currentRecognition.stop();
    }
    setIsListening(false);
  };

  // Simulate transcription for demo purposes
  const simulateTranscription = () => {
    // Simulate a delay for voice recording
    setTimeout(() => {
      const samplePhrases = [
        "Help me understand calculus",
        "Explain Newton's laws of motion", 
        "I want to study biology",
        "Create flashcards for chemistry",
        "What is photosynthesis?"
      ];
      
      const randomPhrase = samplePhrases[Math.floor(Math.random() * samplePhrases.length)];
      setTranscript(randomPhrase);
      setIsListening(false);
    }, 2000); // 2 second delay to simulate recording
  };

  return {
    isListening,
    isPlaying,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    transcript,
    clearTranscript,
  };
};
