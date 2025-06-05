import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useChat } from '../../hooks/useChat';
import { useVoice } from '../../hooks/useVoice';
import { useFileUpload } from '../../hooks/useFileUpload';
import { ChatMessage } from '../../types';

const { height } = Dimensions.get('window');

const Chat = () => {
  const { user, isAuthenticated } = useAuth();
  const { messages, isLoading, input, setInput, sendMessage } = useChat();
  const { 
    isListening, 
    isPlaying, 
    startListening, 
    stopListening, 
    speak, 
    stopSpeaking,
    transcript,
    clearTranscript 
  } = useVoice();
  const {
    uploadedFiles,
    isUploading,
    pickDocument,
    pickImage,
    removeFile,
    clearFiles
  } = useFileUpload();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated]);
  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  useEffect(() => {
    // Handle voice transcript
    if (transcript && transcript.trim()) {
      setInput(transcript);
      clearTranscript();
    }
  }, [transcript, setInput, clearTranscript]);  const handleSend = () => {
    if (input.trim() || uploadedFiles.length > 0) {
      const messageWithFiles = uploadedFiles.length > 0 
        ? `${input}\n\n[Attached ${uploadedFiles.length} file(s): ${uploadedFiles.map(f => f.name).join(', ')}]`
        : input;
      
      sendMessage(messageWithFiles);
      clearFiles();
    }
  };

  const handleFileUpload = () => {
    Alert.alert(
      'Upload File',
      'Choose file type',
      [
        { text: 'Document (PDF)', onPress: pickDocument },
        { text: 'Image', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleVoiceToggle = async () => {
    if (isListening) {
      stopListening();
    } else {
      await startListening();
    }
  };

  const handleSpeakResponse = (message: string) => {
    if (isPlaying) {
      stopSpeaking();
    } else {
      speak(message);
    }
  };  const renderFilePreview = () => {
    if (uploadedFiles.length === 0) return null;

    return (
      <View style={styles.filePreviewContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {uploadedFiles.map((file, index) => (
            <View key={index} style={styles.filePreviewItem}>
              {file.type === 'image' ? (
                <Image source={{ uri: file.uri }} style={styles.previewImage} />
              ) : (
                <View style={styles.documentPreview}>
                  <Text style={styles.documentIcon}>📄</Text>
                </View>
              )}
              <Text style={styles.fileName} numberOfLines={1}>
                {file.name}
              </Text>
              <TouchableOpacity 
                style={styles.removeFileButton}
                onPress={() => removeFile(file.uri)}
              >
                <Text style={styles.removeFileText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };
  const handleGoToCourses = () => {
    router.push('/coursedoubts');
  };
  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View style={[
      styles.messageContainer,
      item.role === 'user' ? styles.userMessage : styles.aiMessage
    ]}>
      <View style={[
        styles.messageBubble,
        item.role === 'user' ? styles.userBubble : styles.aiBubble
      ]}>
        <Text style={[
          styles.messageText,
          item.role === 'user' ? styles.userText : styles.aiText
        ]}>
          {item.message}
        </Text>
        {item.role === 'ai' && (
          <TouchableOpacity 
            style={styles.speakButton}
            onPress={() => handleSpeakResponse(item.message)}
          >
            <Text style={styles.speakButtonText}>
              {isPlaying ? '🔇' : '🔊'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.timestamp}>
        {new Date(item.created_at).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.headerTitle}>StudyChampAI</Text>
        <Text style={styles.headerSubtitle}>Your AI Study Assistant</Text>
      </View>
      <TouchableOpacity 
        style={styles.avatar}
        onPress={() => Alert.alert(
          'Menu',
          'Choose an option',
          [
            { text: 'Smart Planner', onPress: () => router.push('/planner') },
            { text: 'Whiteboard', onPress: () => router.push('/whiteboard') },
            { text: 'Cancel', style: 'cancel' }
          ]
        )}
      >        <Text style={styles.avatarText}>
          {(user?.name && user.name.trim() && user.name.charAt(0).toUpperCase()) || 'U'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🎓</Text>
      <Text style={styles.emptyTitle}>Welcome to StudyChampAI!</Text>
      <Text style={styles.emptySubtitle}>
        Ask me anything you'd like to study and I'll help you create personalized learning materials.
      </Text>
      <View style={styles.suggestionsContainer}>
        <TouchableOpacity 
          style={styles.suggestionButton}
          onPress={() => setInput('I want to study Newton\'s Laws of Motion')}
        >
          <Text style={styles.suggestionText}>🔬 Physics - Newton's Laws</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.suggestionButton}
          onPress={() => setInput('Help me understand calculus derivatives')}
        >
          <Text style={styles.suggestionText}>📊 Mathematics - Calculus</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.suggestionButton}
          onPress={() => setInput('Explain photosynthesis process')}
        >
          <Text style={styles.suggestionText}>🌱 Biology - Photosynthesis</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      {renderHeader()}
      
      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          style={styles.messagesList}
          contentContainerStyle={messages.length === 0 ? styles.emptyList : styles.messagesContent}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
        />
        
        {messages.length > 3 && (
          <TouchableOpacity 
            style={styles.coursesButton}
            onPress={handleGoToCourses}
          >
            <Text style={styles.coursesButtonText}>📚 View Study Materials</Text>
          </TouchableOpacity>
        )}        {renderFilePreview()}
        <View style={styles.inputContainer}>
          <TouchableOpacity 
            style={styles.attachButton}
            onPress={handleFileUpload}
            disabled={isUploading}
          >
            <Text style={styles.attachButtonText}>
              {isUploading ? '⏳' : '📎'}
            </Text>
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            value={input}
            onChangeText={setInput}
            placeholder={isListening ? "Listening..." : "What would you like to study today?"}
            placeholderTextColor="#888"
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={[styles.micButton, isListening && styles.micButtonActive]}
            onPress={handleVoiceToggle}
          >
            <Text style={styles.micButtonText}>
              {isListening ? '⏹️' : '🎤'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.sendButton, (!input.trim() && uploadedFiles.length === 0 || isLoading) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={(!input.trim() && uploadedFiles.length === 0) || isLoading}
          >
            <Text style={styles.sendButtonText}>
              {isLoading ? '⏳' : '🚀'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#888',
    fontSize: 14,
    marginTop: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubtitle: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  suggestionsContainer: {
    width: '100%',
  },
  suggestionButton: {
    backgroundColor: '#222',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  suggestionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  messageContainer: {
    marginVertical: 5,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  aiMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 18,
    marginBottom: 4,
  },
  userBubble: {
    backgroundColor: '#1DB954',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#333',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#000',
  },
  aiText: {
    color: '#fff',
  },
  timestamp: {
    color: '#666',
    fontSize: 12,
    marginHorizontal: 16,
  },
  coursesButton: {
    backgroundColor: '#1DB954',
    marginHorizontal: 20,
    marginVertical: 10,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  coursesButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#333',
    alignItems: 'flex-end',
  },  textInput: {
    flex: 1,
    backgroundColor: '#222',
    borderColor: '#444',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: '#fff',
    fontSize: 16,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#444',
  },  sendButtonText: {
    fontSize: 20,
  },
  speakButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  speakButtonText: {
    fontSize: 14,
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  micButtonActive: {
    backgroundColor: '#ff4444',
  },  micButtonText: {
    fontSize: 18,
  },
  filePreviewContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  filePreviewItem: {
    marginRight: 12,
    alignItems: 'center',
    position: 'relative',
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  documentPreview: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentIcon: {
    fontSize: 24,
  },
  fileName: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
    maxWidth: 60,
    textAlign: 'center',
  },
  removeFileButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeFileText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  attachButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  attachButtonText: {
    fontSize: 18,
  },
});

export default Chat;
