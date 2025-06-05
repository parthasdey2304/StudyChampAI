import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions,
  Image,
  Linking,
  Alert,
  RefreshControl,
  TextInput,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { youtubeService, YouTubeVideo } from '../../utils/youtubeService';
import { useFlashcards } from '../../hooks/useFlashcards';
import { useNotes } from '../../hooks/useNotes';
import { useDoubtnut } from '../../hooks/useDoubtnut';
import { usePracticeQuestions } from '../../hooks/usePracticeQuestions';
import FlashcardSwiper from '../../components/FlashcardSwiper';
import SkeletonLoader from '../../components/SkeletonLoader';

const { width } = Dimensions.get('window');

type TabType = 'youtube' | 'notes' | 'flashcards' | 'questions' | 'doubtnut';

const tabs = [
  { id: 'youtube', title: '🎥 YouTube', icon: '🎥' },
  { id: 'notes', title: '📄 Notes', icon: '📄' },
  { id: 'flashcards', title: '🧠 Flashcards', icon: '🧠' },
  { id: 'questions', title: '❓ Practice', icon: '❓' },
  { id: 'doubtnut', title: '🔎 Doubtnut', icon: '🔎' },
];

const CoursesDoubts = () => {  const [activeTab, setActiveTab] = useState<TabType>('youtube');
  const [youtubeVideos, setYoutubeVideos] = useState<YouTubeVideo[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [youtubeApiStatus, setYoutubeApiStatus] = useState<{ working: boolean; usingMockData: boolean; error?: string } | null>(null);
  const router = useRouter();
  // Flashcard hook
  const { 
    flashcards, 
    isLoading: isLoadingFlashcards, 
    updateFlashcardStatus,
    loadFlashcards 
  } = useFlashcards();
  // Notes hook
  const {
    notes,
    isLoading: isLoadingNotes,
    isGenerating: isGeneratingNotes,
    generateNotes,
    openNote,
    shareNote,
    deleteNote
  } = useNotes();
  // Doubtnut hook
  const {
    questions: doubtnutQuestions,
    isLoading: isLoadingDoubtnut,
    searchQuery: doubtnutSearchQuery,
    setSearchQuery: setDoubtnutSearchQuery,
    selectedSubject,
    availableSubjects,
    searchQuestions: searchDoubtnutQuestions,
    filterBySubject,
    getSimilarQuestions,
    clearFilters,
    loadPopularQuestions: loadPopularDoubtnutQuestions,
  } = useDoubtnut();

  // Practice Questions hook
  const {
    questions: practiceQuestions,
    currentSession,
    isLoading: isLoadingPractice,
    isInQuizMode,
    quizResult,
    availableSubjects: practiceSubjects,
    availableTopics,
    generateQuestionsByTopic,
    startQuiz,
    submitAnswer,
    nextQuestion,
    finishQuiz,
    resetQuiz,
    getCurrentQuestion,
    getProgress,
    hasAnswered,
    getUserAnswer,
  } = usePracticeQuestions();
  useEffect(() => {
    if (activeTab === 'youtube') {
      loadPopularVideos();
      checkYouTubeApiStatus();
    }
  }, [activeTab]);

  const checkYouTubeApiStatus = async () => {
    try {
      const status = await youtubeService.testApiConnection();
      setYoutubeApiStatus(status);
      console.log('YouTube API Status:', status);
    } catch (error) {
      console.error('Error checking YouTube API status:', error);
      setYoutubeApiStatus({ working: false, usingMockData: true, error: 'Connection test failed' });
    }
  };

  const loadPopularVideos = async () => {
    setIsLoadingVideos(true);
    try {
      const videos = await youtubeService.getPopularEducationalVideos();
      setYoutubeVideos(videos);
      console.log('Loaded videos:', videos.length);
    } catch (error) {
      console.error('Error loading YouTube videos:', error);
      Alert.alert('Error', 'Failed to load YouTube videos. Please check your internet connection.');
    } finally {
      setIsLoadingVideos(false);
    }
  };
  const searchVideos = async (query: string) => {
    if (!query.trim()) return;
    
    setIsLoadingVideos(true);
    try {
      console.log('🔍 Searching YouTube videos for:', query.trim());
      const videos = await youtubeService.searchVideos({
        query: query.trim(),
        maxResults: 15,
        category: 'education'
      });
      setYoutubeVideos(videos);
      console.log('📋 Search results:', videos.length, 'videos found');
      
      if (videos.length === 0) {
        Alert.alert('No Results', 'No educational videos found for this search. Try different keywords.');
      }
    } catch (error) {
      console.error('❌ Error searching YouTube videos:', error);
      Alert.alert('Search Error', 'Failed to search videos. The app will show demo content instead.');
    } finally {
      setIsLoadingVideos(false);
    }
  };

  const openVideo = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open YouTube video');
      }
    } catch (error) {
      console.error('Error opening video:', error);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {      case 'youtube':        return (
          <View style={styles.tabContent}>
            <Text style={styles.contentTitle}>📺 Educational YouTube Videos</Text>
            
            {/* YouTube API Status Indicator */}
            {youtubeApiStatus && (
              <View style={[styles.statusIndicator, youtubeApiStatus.working ? styles.statusSuccess : styles.statusWarning]}>
                <Text style={styles.statusText}>
                  {youtubeApiStatus.working 
                    ? youtubeApiStatus.usingMockData 
                      ? '⚠️ Using demo content (API issue)'
                      : '✅ Live YouTube content'
                    : '❌ YouTube API unavailable - using demo content'
                  }
                </Text>
              </View>
            )}
              
            {/* Search Input */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search YouTube videos..."
                placeholderTextColor="#888"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={() => searchVideos(searchQuery)}
              />
              <TouchableOpacity 
                style={styles.searchButton}
                onPress={() => searchVideos(searchQuery)}
              >
                <Text style={styles.searchButtonText}>🔍</Text>
              </TouchableOpacity>
            </View>

            {isLoadingVideos ? (
              <View style={styles.loadingContainer}>
                <SkeletonLoader width="100%" height={120} />
                <SkeletonLoader width="100%" height={120} />
                <SkeletonLoader width="100%" height={120} />
              </View>
            ) : youtubeVideos.length > 0 ? (
              <ScrollView 
                style={styles.videosContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={isLoadingVideos}
                    onRefresh={loadPopularVideos}
                    tintColor="#1DB954"
                  />
                }
              >
                {youtubeVideos.map((video) => (
                  <TouchableOpacity
                    key={video.id}
                    style={styles.videoCard}
                    onPress={() => openVideo(video.url)}
                  >
                    <Image source={{ uri: video.thumbnail }} style={styles.videoThumbnail} />
                    <View style={styles.videoInfo}>
                      <Text style={styles.videoTitle} numberOfLines={2}>
                        {video.title}
                      </Text>
                      <Text style={styles.videoChannel} numberOfLines={1}>
                        {video.channelTitle}
                      </Text>
                      <View style={styles.videoMeta}>
                        {video.duration && (
                          <Text style={styles.videoDuration}>{video.duration}</Text>
                        )}
                        {video.viewCount && (
                          <Text style={styles.videoViews}>{video.viewCount}</Text>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>📺</Text>
                <Text style={styles.emptyStateText}>
                  No videos found. Try searching for a specific topic!
                </Text>
              </View>
            )}
          </View>
        );      case 'notes':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.contentTitle}>📚 AI-Generated Notes</Text>
            
            {/* Generate Notes Button */}
            <View style={styles.generateContainer}>
              <TextInput
                style={styles.topicInput}
                placeholder="Enter topic for note generation..."
                placeholderTextColor="#888"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <TouchableOpacity 
                style={[styles.generateButton, isGeneratingNotes && styles.buttonDisabled]}
                onPress={() => {
                  if (searchQuery.trim()) {
                    generateNotes(searchQuery.trim());
                    setSearchQuery('');
                  }
                }}
                disabled={isGeneratingNotes || !searchQuery.trim()}
              >
                <Text style={styles.generateButtonText}>
                  {isGeneratingNotes ? '⏳ Generating...' : '📄 Generate Notes'}
                </Text>
              </TouchableOpacity>
            </View>

            {isLoadingNotes ? (
              <View style={styles.loadingContainer}>
                <SkeletonLoader width="100%" height={80} />
                <SkeletonLoader width="100%" height={80} />
              </View>
            ) : notes.length > 0 ? (
              <ScrollView style={styles.notesContainer} showsVerticalScrollIndicator={false}>
                {notes.map((note) => (
                  <View key={note.id} style={styles.noteCard}>
                    <View style={styles.noteHeader}>
                      <Text style={styles.noteTitle}>{note.topic}</Text>
                      <Text style={styles.noteDate}>
                        {note.createdAt.toLocaleDateString()}
                      </Text>
                    </View>
                    <Text style={styles.notePreview} numberOfLines={3}>
                      {note.content.substring(0, 150)}...
                    </Text>
                    <View style={styles.noteActions}>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => openNote(note)}
                      >
                        <Text style={styles.actionButtonText}>📖 Open PDF</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => shareNote(note)}
                      >
                        <Text style={styles.actionButtonText}>📤 Share</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => {
                          Alert.alert(
                            'Delete Note',
                            `Delete notes for "${note.topic}"?`,
                            [
                              { text: 'Cancel', style: 'cancel' },
                              { text: 'Delete', style: 'destructive', onPress: () => deleteNote(note.id) }
                            ]
                          );
                        }}
                      >
                        <Text style={styles.deleteButtonText}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>📄</Text>
                <Text style={styles.emptyStateText}>
                  No notes generated yet. Enter a topic above to create AI-powered study notes!
                </Text>
              </View>
            )}
          </View>
        );case 'flashcards':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.contentTitle}>🎯 Interactive Flashcards</Text>
            {isLoadingFlashcards ? (
              <View style={styles.loadingContainer}>
                <SkeletonLoader width="100%" height={200} />
                <Text style={styles.placeholderText}>Loading flashcards...</Text>
              </View>
            ) : flashcards.length > 0 ? (
              <FlashcardSwiper
                flashcards={flashcards}
                onCardSwipedLeft={(cardIndex) => {
                  // Mark as needs more practice
                  const card = flashcards[cardIndex];
                  updateFlashcardStatus(card.id, 'learning');
                  console.log('Card needs practice:', card.question);
                }}
                onCardSwipedRight={(cardIndex) => {
                  // Mark as mastered
                  const card = flashcards[cardIndex];
                  updateFlashcardStatus(card.id, 'mastered');
                  console.log('Card mastered:', card.question);
                }}
                onAllSwiped={() => {
                  console.log('All flashcards completed!');
                }}
              />
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>🃏</Text>
                <Text style={styles.emptyStateText}>
                  No flashcards available. Start a chat to generate flashcards!
                </Text>
              </View>
            )}
          </View>
        );      case 'questions':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.contentTitle}>🧩 Practice Questions</Text>
            
            {isInQuizMode ? (
              // Quiz Mode UI
              <View style={styles.quizContainer}>
                {getCurrentQuestion() ? (
                  <>
                    {/* Progress Bar */}
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${getProgress().percentage}%` }]} />
                      </View>
                      <Text style={styles.progressText}>
                        {getProgress().current + 1} / {getProgress().total}
                      </Text>
                    </View>

                    {/* Current Question */}
                    <View style={styles.questionContainer}>
                      <Text style={styles.questionNumber}>Question {getProgress().current + 1}</Text>
                      <Text style={styles.quizQuestionText}>{getCurrentQuestion()?.question || ''}</Text>
                      
                      {/* Answer Options for MCQ */}
                      {getCurrentQuestion()?.type === 'mcq' && getCurrentQuestion()?.options && (
                        <View style={styles.optionsContainer}>
                          {getCurrentQuestion()?.options?.map((option, index) => (
                            <TouchableOpacity
                              key={index}
                              style={[
                                styles.optionButton,
                                getUserAnswer(getCurrentQuestion()?.id || '') === option && styles.selectedOption
                              ]}
                              onPress={() => {
                                if (getCurrentQuestion()) {
                                  submitAnswer(option);
                                }
                              }}
                            >
                              <Text style={[
                                styles.optionText,
                                getUserAnswer(getCurrentQuestion()?.id || '') === option && styles.selectedOptionText
                              ]}>
                                {String.fromCharCode(65 + index)}. {option}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}

                      {/* Text Input for other question types */}
                      {getCurrentQuestion()?.type !== 'mcq' && (
                        <View style={styles.answerInputContainer}>
                          <TextInput
                            style={styles.answerInput}
                            placeholder={
                              getCurrentQuestion()?.type === 'numerical' 
                                ? 'Enter your numerical answer...'
                                : getCurrentQuestion()?.type === 'short-answer'
                                ? 'Enter your short answer...'
                                : 'Enter your detailed answer...'
                            }
                            placeholderTextColor="#888"
                            value={getUserAnswer(getCurrentQuestion()?.id || '') || ''}
                            onChangeText={(text) => {
                              if (getCurrentQuestion()) {
                                submitAnswer(text);
                              }
                            }}
                            multiline={getCurrentQuestion()?.type === 'long-answer'}
                            numberOfLines={getCurrentQuestion()?.type === 'long-answer' ? 6 : 1}
                          />
                        </View>
                      )}

                      {/* Question Info */}                      <View style={styles.questionInfo}>
                        <Text style={styles.questionSubject}>{getCurrentQuestion()?.subject || ''}</Text>
                        <Text style={styles.questionTopic}>{getCurrentQuestion()?.topic || ''}</Text>
                        <Text style={[styles.questionDifficulty, {
                          color: getCurrentQuestion()?.difficulty === 'easy' ? '#4CAF50' : 
                                getCurrentQuestion()?.difficulty === 'medium' ? '#FF9800' : '#F44336'
                        }]}>
                          {getCurrentQuestion()?.difficulty?.toUpperCase() || ''}
                        </Text>
                        <Text style={styles.questionPoints}>{getCurrentQuestion()?.points || 0} pts</Text>
                      </View>

                      {/* Next Button */}
                      <TouchableOpacity
                        style={[
                          styles.nextButton,
                          (!hasAnswered(getCurrentQuestion()?.id || '')) && styles.buttonDisabled
                        ]}
                        onPress={nextQuestion}
                        disabled={!hasAnswered(getCurrentQuestion()?.id || '')}
                      >
                        <Text style={styles.nextButtonText}>
                          {getProgress().current + 1 === getProgress().total ? 'Finish Quiz' : 'Next Question'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <Text style={styles.placeholderText}>Loading question...</Text>
                )}
              </View>
            ) : quizResult ? (
              // Results UI
              <View style={styles.resultsContainer}>
                <Text style={styles.resultsTitle}>🎉 Quiz Complete!</Text>
                
                <View style={styles.scoreContainer}>
                  <Text style={styles.scoreText}>{quizResult.correctAnswers} / {quizResult.totalQuestions}</Text>
                  <Text style={styles.scoreLabel}>Correct Answers</Text>
                  <Text style={styles.percentageText}>{Math.round(quizResult.scorePercentage)}%</Text>
                </View>

                <View style={styles.resultDetails}>
                  <Text style={styles.resultDetailText}>⏱️ Time: {Math.round(quizResult.timeTaken)} minutes</Text>
                  <Text style={styles.resultDetailText}>🎯 Score: {quizResult.session.score} / {quizResult.session.totalPoints} points</Text>
                </View>

                <View style={styles.categoryBreakdown}>
                  <Text style={styles.breakdownTitle}>Subject Breakdown:</Text>
                  {Object.entries(quizResult.categoryBreakdown).map(([subject, stats]) => (
                    <View key={subject} style={styles.breakdownItem}>
                      <Text style={styles.breakdownSubject}>{subject}</Text>
                      <Text style={styles.breakdownScore}>{stats.correct}/{stats.total}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity style={styles.restartButton} onPress={resetQuiz}>
                  <Text style={styles.restartButtonText}>🔄 Take Another Quiz</Text>
                </TouchableOpacity>
              </View>
            ) : (
              // Practice Mode UI
              <View style={styles.practiceContainer}>
                {/* Topic Search */}
                <View style={styles.searchContainer}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Enter topic to generate questions..."
                    placeholderTextColor="#888"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={() => {
                      if (searchQuery.trim()) {
                        generateQuestionsByTopic(searchQuery.trim());
                        setSearchQuery('');
                      }
                    }}
                  />
                  <TouchableOpacity 
                    style={styles.searchButton}
                    onPress={() => {
                      if (searchQuery.trim()) {
                        generateQuestionsByTopic(searchQuery.trim());
                        setSearchQuery('');
                      }
                    }}
                  >
                    <Text style={styles.searchButtonText}>🔍</Text>
                  </TouchableOpacity>
                </View>

                {/* Quick Start Quiz Button */}
                {practiceQuestions.length > 0 && (
                  <TouchableOpacity style={styles.startQuizButton} onPress={() => startQuiz()}>
                    <Text style={styles.startQuizButtonText}>🚀 Start Quiz ({practiceQuestions.length} questions)</Text>
                  </TouchableOpacity>
                )}

                {/* Questions Preview */}
                {isLoadingPractice ? (
                  <View style={styles.loadingContainer}>
                    <SkeletonLoader width="100%" height={100} />
                    <SkeletonLoader width="100%" height={100} />
                    <SkeletonLoader width="100%" height={100} />
                  </View>
                ) : practiceQuestions.length > 0 ? (
                  <ScrollView style={styles.questionsPreview} showsVerticalScrollIndicator={false}>
                    <Text style={styles.previewTitle}>📋 Questions Preview</Text>
                    {practiceQuestions.map((question, index) => (
                      <View key={question.id} style={styles.previewQuestionCard}>
                        <View style={styles.previewQuestionHeader}>
                          <Text style={styles.previewQuestionNumber}>Q{index + 1}</Text>
                          <Text style={styles.previewQuestionType}>{question.type.toUpperCase()}</Text>
                          <Text style={[styles.previewQuestionDifficulty, {
                            color: question.difficulty === 'easy' ? '#4CAF50' : 
                                  question.difficulty === 'medium' ? '#FF9800' : '#F44336'
                          }]}>
                            {question.difficulty.toUpperCase()}
                          </Text>
                        </View>
                        <Text style={styles.previewQuestionText} numberOfLines={2}>
                          {question.question}
                        </Text>
                        <View style={styles.previewQuestionMeta}>
                          <Text style={styles.previewQuestionSubject}>{question.subject}</Text>
                          <Text style={styles.previewQuestionPoints}>{question.points} pts</Text>
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                ) : (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateIcon}>🧩</Text>
                    <Text style={styles.emptyStateText}>
                      Enter a topic above to generate practice questions or start chatting to get personalized questions!
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        );case 'doubtnut':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.contentTitle}>🔍 Doubtnut Search</Text>
            
            {/* Search Input */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search for questions and doubts..."
                placeholderTextColor="#888"
                value={doubtnutSearchQuery}
                onChangeText={setDoubtnutSearchQuery}
                onSubmitEditing={() => searchDoubtnutQuestions(doubtnutSearchQuery)}
              />
              <TouchableOpacity 
                style={styles.searchButton}
                onPress={() => searchDoubtnutQuestions(doubtnutSearchQuery)}
              >
                <Text style={styles.searchButtonText}>🔍</Text>
              </TouchableOpacity>
            </View>

            {/* Subject Filters */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.subjectFilters}
              contentContainerStyle={styles.subjectFiltersContent}
            >
              <TouchableOpacity
                style={[styles.subjectFilter, !selectedSubject && styles.activeSubjectFilter]}
                onPress={clearFilters}
              >
                <Text style={[styles.subjectFilterText, !selectedSubject && styles.activeSubjectFilterText]}>
                  All
                </Text>
              </TouchableOpacity>
              {availableSubjects.map((subject) => (
                <TouchableOpacity
                  key={subject}
                  style={[styles.subjectFilter, selectedSubject === subject && styles.activeSubjectFilter]}
                  onPress={() => filterBySubject(subject)}
                >
                  <Text style={[styles.subjectFilterText, selectedSubject === subject && styles.activeSubjectFilterText]}>
                    {subject}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Questions List */}
            {isLoadingDoubtnut ? (
              <View style={styles.loadingContainer}>
                <SkeletonLoader width="100%" height={120} />
                <SkeletonLoader width="100%" height={120} />
                <SkeletonLoader width="100%" height={120} />
              </View>
            ) : doubtnutQuestions.length > 0 ? (
              <ScrollView 
                style={styles.questionsContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={isLoadingDoubtnut}
                    onRefresh={loadPopularDoubtnutQuestions}
                    tintColor="#1DB954"
                  />
                }
              >
                {doubtnutQuestions.map((question) => (
                  <View key={question.id} style={styles.questionCard}>
                    <View style={styles.questionHeader}>
                      <View style={styles.questionMeta}>
                        <Text style={styles.questionSubject}>{question.subject}</Text>
                        <Text style={styles.questionTopic}>{question.topic}</Text>
                        <Text style={[styles.questionDifficulty, {
                          color: question.difficulty === 'easy' ? '#4CAF50' : 
                                question.difficulty === 'medium' ? '#FF9800' : '#F44336'
                        }]}>
                          {question.difficulty.toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.questionType}>{question.type.toUpperCase()}</Text>
                    </View>
                    
                    <Text style={styles.questionText}>{question.question}</Text>
                    
                    <View style={styles.answerContainer}>
                      <Text style={styles.answerLabel}>Answer:</Text>
                      <Text style={styles.answerText}>{question.answer}</Text>
                    </View>

                    <View style={styles.questionActions}>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={async () => {
                          const similarQuestions = await getSimilarQuestions(question.id);
                          if (similarQuestions.length > 0) {
                            Alert.alert(
                              'Similar Questions',
                              `Found ${similarQuestions.length} similar questions`,
                              [
                                { text: 'OK', style: 'default' }
                              ]
                            );
                          } else {
                            Alert.alert('No Similar Questions', 'No similar questions found for this topic.');
                          }
                        }}
                      >
                        <Text style={styles.actionButtonText}>🔗 Similar</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => {
                          // Copy question to clipboard or share
                          Alert.alert(
                            'Question Copied',
                            'Question and answer have been copied for easy sharing!',
                            [{ text: 'OK', style: 'default' }]
                          );
                        }}
                      >
                        <Text style={styles.actionButtonText}>📋 Copy</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>🔍</Text>
                <Text style={styles.emptyStateText}>
                  {doubtnutSearchQuery ? 
                    'No questions found for your search. Try different keywords!' :
                    'Search for questions or browse by subject to get started.'
                  }
                </Text>
              </View>
            )}
          </View>
        );
      default:
        return null;
    }
  };
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back to Chat</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Study Materials</Text>
        <View style={styles.headerSpacer} />
      </View>      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
        bounces={false}
        scrollEventThrottle={16}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && styles.activeTab
            ]}
            onPress={() => setActiveTab(tab.id as TabType)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[
              styles.tabText,
              activeTab === tab.id && styles.activeTabText
            ]}>
              {tab.title.replace(/🎥|📄|🧠|❓|🔎 /, '')}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.content}>
        {renderTabContent()}
      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#333',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#1DB954',
    fontSize: 14,
    fontWeight: '500',
  },  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSpacer: {
    width: 70,
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    maxHeight: 60,
    flex: 0,
  },
  tabsContent: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexGrow: 0,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#222',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    minWidth: 70,
    maxWidth: 120,
  },
  activeTab: {
    backgroundColor: '#1DB954',
  },
  tabIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  tabText: {
    color: '#888',
    fontSize: 12,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#000',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  contentTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  skeleton: {
    marginBottom: 20,
  },
  skeletonItem: {
    height: 60,
    backgroundColor: '#222',
    borderRadius: 8,
    marginBottom: 12,
  },
  placeholderText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 20,
  },
  flashcardPreview: {
    alignItems: 'center',
    marginBottom: 20,
  },
  flashcard: {
    width: width * 0.8,
    height: 200,
    backgroundColor: '#333',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1DB954',
  },
  flashcardText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },  flashcardHint: {
    color: '#888',
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 15,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#222',
    borderColor: '#444',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: '#fff',
    fontSize: 16,
  },
  searchPlaceholder: {
    color: '#888',
    fontSize: 16,
  },searchButton: {
    backgroundColor: '#1DB954',
    paddingVertical: 12,
    paddingHorizontal: 16, // Reduced from 20
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 45, // Reduced from 50
    maxWidth: 60, // Add maximum width constraint
  },
  searchButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    paddingHorizontal: 20,
  },
  videosContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  videoCard: {
    flexDirection: 'row',
    backgroundColor: '#222',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  videoThumbnail: {
    width: 120,
    height: 90,
    backgroundColor: '#333',
  },
  videoInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  videoTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  videoChannel: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  videoMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  videoDuration: {
    color: '#1DB954',
    fontSize: 11,
    fontWeight: '500',
  },
  videoViews: {
    color: '#666',
    fontSize: 11,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  // Notes styles
  generateContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  topicInput: {
    flex: 1,
    backgroundColor: '#222',
    borderColor: '#444',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: '#fff',
    fontSize: 16,
  },
  generateButton: {
    backgroundColor: '#1DB954',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#444',
  },
  generateButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },
  notesContainer: {
    flex: 1,
  },
  noteCard: {
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  noteDate: {
    color: '#888',
    fontSize: 12,
  },
  notePreview: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  noteActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#333',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#FF6B6B',
    flex: 0,
    minWidth: 40,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
  },  // Doubtnut-specific styles
  subjectFilters: {
    marginBottom: 20,
    maxHeight: 60, // Add height constraint
  },
  subjectFiltersContent: {
    paddingHorizontal: 20,
    flexGrow: 0, // Prevent content expansion
  },
  subjectFilter: {
    backgroundColor: '#222',
    paddingVertical: 6, // Reduced from 8
    paddingHorizontal: 12, // Reduced from 16
    borderRadius: 16, // Reduced from 20
    marginRight: 8, // Reduced from 10
    borderWidth: 1,
    borderColor: '#444',
    alignSelf: 'flex-start', // Prevent expansion
    minWidth: 50, // Add minimum width
    maxWidth: 100, // Add maximum width constraint
  },
  activeSubjectFilter: {
    backgroundColor: '#1DB954',
    borderColor: '#1DB954',
  },
  subjectFilterText: {
    color: '#888',
    fontSize: 12, // Reduced from 14
    fontWeight: '500',
    textAlign: 'center',
  },
  activeSubjectFilterText: {
    color: '#000',
    fontWeight: 'bold',
  },
  questionsContainer: {
    flex: 1,
  },
  questionCard: {
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  questionMeta: {
    flex: 1,
  },
  questionSubject: {
    color: '#1DB954',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  questionTopic: {
    color: '#888',
    fontSize: 11,
    marginBottom: 4,
  },
  questionDifficulty: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  questionType: {
    color: '#666',
    fontSize: 10,
    fontWeight: '500',
    backgroundColor: '#333',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    textTransform: 'uppercase',
  },
  questionText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
    fontWeight: '500',
  },
  answerContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#1DB954',
  },
  answerLabel: {
    color: '#1DB954',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  answerText: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
  },
  questionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  // Practice Questions styles
  quizContainer: {
    flex: 1,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1DB954',
    borderRadius: 4,
  },
  progressText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
  questionContainer: {
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  questionNumber: {
    color: '#1DB954',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  quizQuestionText: {
    color: '#fff',
    fontSize: 18,
    lineHeight: 26,
    marginBottom: 20,
    fontWeight: '500',
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    borderColor: '#1DB954',
    backgroundColor: '#1a2e1a',
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 22,
  },
  selectedOptionText: {
    color: '#1DB954',
    fontWeight: 'bold',
  },
  answerInputContainer: {
    marginBottom: 20,
  },
  answerInput: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#444',
    textAlignVertical: 'top',
  },
  questionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  questionPoints: {
    color: '#1DB954',
    fontSize: 12,
    fontWeight: 'bold',
  },
  nextButton: {
    backgroundColor: '#1DB954',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultsContainer: {
    alignItems: 'center',
    padding: 20,
  },
  resultsTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  scoreContainer: {
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 30,
    marginBottom: 30,
    minWidth: 200,
  },
  scoreText: {
    color: '#1DB954',
    fontSize: 48,
    fontWeight: 'bold',
  },
  scoreLabel: {
    color: '#888',
    fontSize: 16,
    marginTop: 8,
  },
  percentageText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 12,
  },
  resultDetails: {
    alignItems: 'center',
    marginBottom: 30,
  },
  resultDetailText: {
    color: '#ccc',
    fontSize: 16,
    marginBottom: 8,
  },
  categoryBreakdown: {
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    width: '100%',
  },
  breakdownTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  breakdownSubject: {
    color: '#ccc',
    fontSize: 16,
  },
  breakdownScore: {
    color: '#1DB954',
    fontSize: 16,
    fontWeight: 'bold',
  },
  restartButton: {
    backgroundColor: '#1DB954',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  restartButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  practiceContainer: {
    flex: 1,
  },
  startQuizButton: {
    backgroundColor: '#1DB954',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  startQuizButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  questionsPreview: {
    flex: 1,
  },
  previewTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  previewQuestionCard: {
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  previewQuestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  previewQuestionNumber: {
    color: '#1DB954',
    fontSize: 12,
    fontWeight: 'bold',
  },
  previewQuestionType: {
    color: '#666',
    fontSize: 10,
    fontWeight: '500',
    backgroundColor: '#333',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    textTransform: 'uppercase',
  },
  previewQuestionDifficulty: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  previewQuestionText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  previewQuestionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },  previewQuestionSubject: {
    color: '#888',
    fontSize: 12,
  },
  previewQuestionPoints: {
    color: '#1DB954',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusIndicator: {
    padding: 8,
    marginVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusSuccess: {
    backgroundColor: 'rgba(29, 185, 84, 0.1)',
    borderColor: '#1DB954',
  },
  statusWarning: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderColor: '#FFC107',
  },
  statusText: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
    color: '#fff',
  },
});

export default CoursesDoubts;
