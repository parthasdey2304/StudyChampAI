import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Alert, Animated, PanResponder } from 'react-native';
import { Flashcard } from '../types';

const { width, height } = Dimensions.get('window');

interface FlashcardSwiperProps {
  flashcards: Flashcard[];
  onCardSwipedLeft?: (cardIndex: number) => void;
  onCardSwipedRight?: (cardIndex: number) => void;
  onAllSwiped?: () => void;
}

interface CardProps {
  flashcard: Flashcard;
  isFlipped: boolean;
  onFlip: () => void;
}

const Card: React.FC<CardProps> = ({ flashcard, isFlipped, onFlip }) => {
  return (
    <TouchableOpacity style={[styles.card, isFlipped && styles.cardFlipped]} onPress={onFlip} activeOpacity={0.9}>
      <View style={styles.cardContent}>
        <Text style={styles.cardLabel}>
          {isFlipped ? 'Answer' : 'Question'}
        </Text>
        <Text style={styles.cardText}>
          {isFlipped ? flashcard.answer : flashcard.question}
        </Text>
        <Text style={styles.instruction}>
          {isFlipped ? 'Tap to see question' : 'Tap to reveal answer'}
        </Text>
        <View style={styles.statusIndicator}>
          <Text style={[styles.statusText, 
            flashcard.status === 'mastered' && styles.masteredStatus,
            flashcard.status === 'learning' && styles.learningStatus,
            flashcard.status === 'new' && styles.newStatus
          ]}>
            {flashcard.status === 'mastered' ? '✅ Mastered' : 
             flashcard.status === 'learning' ? '📚 Learning' : '🆕 New'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const FlashcardSwiper: React.FC<FlashcardSwiperProps> = ({
  flashcards,
  onCardSwipedLeft,
  onCardSwipedRight,
  onAllSwiped
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flippedCards, setFlippedCards] = useState<{ [key: number]: boolean }>({});
  const position = useRef(new Animated.ValueXY()).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const toggleFlip = (index: number) => {
    setFlippedCards(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleSwipeLeft = () => {
    onCardSwipedLeft?.(currentIndex);
    nextCard();
  };

  const handleSwipeRight = () => {
    onCardSwipedRight?.(currentIndex);
    nextCard();
  };

  const nextCard = () => {
    if (currentIndex >= flashcards.length - 1) {
      onAllSwiped?.();
      return;
    }
    
    setCurrentIndex(prev => prev + 1);
    setFlippedCards(prev => ({ ...prev, [currentIndex]: false }));
    
    // Reset animation values
    position.setValue({ x: 0, y: 0 });
    rotate.setValue(0);
    opacity.setValue(1);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gestureState) => {
      position.setValue({ x: gestureState.dx, y: gestureState.dy });
      
      // Rotate card based on horizontal movement
      const rotateValue = gestureState.dx / width * 30; // Max 30 degrees
      rotate.setValue(rotateValue);
      
      // Change opacity based on distance
      const distance = Math.sqrt(gestureState.dx ** 2 + gestureState.dy ** 2);
      const newOpacity = Math.max(0.3, 1 - distance / (width / 2));
      opacity.setValue(newOpacity);
    },
    onPanResponderRelease: (evt, gestureState) => {
      const swipeThreshold = width * 0.3;
      
      if (gestureState.dx > swipeThreshold) {
        // Swipe right - mastered
        Animated.timing(position, {
          toValue: { x: width, y: gestureState.dy },
          duration: 250,
          useNativeDriver: false,
        }).start(() => handleSwipeRight());
      } else if (gestureState.dx < -swipeThreshold) {
        // Swipe left - need practice
        Animated.timing(position, {
          toValue: { x: -width, y: gestureState.dy },
          duration: 250,
          useNativeDriver: false,
        }).start(() => handleSwipeLeft());
      } else {
        // Snap back to center
        Animated.parallel([
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }),
          Animated.spring(rotate, {
            toValue: 0,
            useNativeDriver: false,
          }),
          Animated.spring(opacity, {
            toValue: 1,
            useNativeDriver: false,
          }),
        ]).start();
      }
    },
  });

  if (!flashcards || flashcards.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🃏</Text>
        <Text style={styles.emptyText}>No flashcards available</Text>
        <Text style={styles.emptySubtext}>Start a chat to generate flashcards!</Text>
      </View>
    );
  }

  if (currentIndex >= flashcards.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🎉</Text>
        <Text style={styles.emptyText}>All cards completed!</Text>
        <Text style={styles.emptySubtext}>Great job studying!</Text>
      </View>
    );
  }

  const rotateInterpolate = rotate.interpolate({
    inputRange: [-30, 0, 30],
    outputRange: ['-30deg', '0deg', '30deg'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          {Math.min(currentIndex + 1, flashcards.length)} / {flashcards.length}
        </Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${((currentIndex + 1) / flashcards.length) * 100}%` }
            ]} 
          />
        </View>
      </View>

      <View style={styles.swiperContainer}>
        {/* Render next card behind current card for depth effect */}
        {currentIndex + 1 < flashcards.length && (
          <View style={[styles.card, styles.cardBehind]}>
            <Card
              flashcard={flashcards[currentIndex + 1]}
              isFlipped={false}
              onFlip={() => {}}
            />
          </View>
        )}
        
        {/* Current card */}
        <Animated.View
          style={[
            styles.cardContainer,
            {
              transform: [
                { translateX: position.x },
                { translateY: position.y },
                { rotate: rotateInterpolate },
              ],
              opacity: opacity,
            }
          ]}
          {...panResponder.panHandlers}
        >
          <Card
            flashcard={flashcards[currentIndex]}
            isFlipped={flippedCards[currentIndex] || false}
            onFlip={() => toggleFlip(currentIndex)}
          />
          
          {/* Swipe indicators */}
          <Animated.View 
            style={[
              styles.swipeIndicator,
              styles.leftIndicator,
              {
                opacity: position.x.interpolate({
                  inputRange: [-width / 2, 0],
                  outputRange: [1, 0],
                  extrapolate: 'clamp',
                }),
              }
            ]}
          >
            <Text style={styles.indicatorText}>PRACTICE</Text>
          </Animated.View>
          
          <Animated.View 
            style={[
              styles.swipeIndicator,
              styles.rightIndicator,
              {
                opacity: position.x.interpolate({
                  inputRange: [0, width / 2],
                  outputRange: [0, 1],
                  extrapolate: 'clamp',
                }),
              }
            ]}
          >
            <Text style={styles.indicatorText}>MASTERED</Text>
          </Animated.View>
        </Animated.View>
      </View>

      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionTitle}>How to use:</Text>
        <Text style={styles.instructionText}>
          • Tap card to flip between question and answer
          {'\n'}• Swipe right if you know it well (✅ Mastered)
          {'\n'}• Swipe left if you need more practice (📚 Practice)
          {'\n'}• Cards you need practice with will appear again
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: 'center',
  },
  progressText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1DB954',
    borderRadius: 4,
  },  swiperContainer: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20, // Add space for instruction box
  },  cardContainer: {
    position: 'absolute',
    width: width * 0.85,
    height: height * 0.45, // Reduced from 0.5 to avoid overlap
  },  card: {
    width: width * 0.85,
    height: height * 0.45, // Reduced from 0.5 to avoid overlap
    backgroundColor: '#333',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderWidth: 2,
    borderColor: '#444',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  cardBehind: {
    position: 'absolute',
    transform: [{ scale: 0.95 }],
    opacity: 0.7,
  },
  cardFlipped: {
    backgroundColor: '#1DB954',
    borderColor: '#1DB954',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#888',
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardText: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    color: '#fff',
    marginBottom: 20,
    lineHeight: 28,
    flex: 1,
    textAlignVertical: 'center',
  },
  instruction: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 15,
  },
  statusIndicator: {
    position: 'absolute',
    top: 15,
    right: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  masteredStatus: {
    color: '#1DB954',
  },
  learningStatus: {
    color: '#FFE66D',
  },
  newStatus: {
    color: '#4ECDC4',
  },
  swipeIndicator: {
    position: 'absolute',
    top: '50%',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 15,
    borderWidth: 3,
  },
  leftIndicator: {
    left: 20,
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
    transform: [{ rotate: '-30deg' }],
  },
  rightIndicator: {
    right: 20,
    backgroundColor: '#1DB954',
    borderColor: '#1DB954',
    transform: [{ rotate: '30deg' }],
  },
  indicatorText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },  instructionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12, // Reduced from 15
    backgroundColor: '#111',
    borderTopWidth: 1,
    borderTopColor: '#333',
    maxHeight: 100, // Limit height to prevent overlap
  },  instructionTitle: {
    color: '#fff',
    fontSize: 14, // Reduced from 16
    fontWeight: 'bold',
    marginBottom: 8, // Reduced from 10
  },
  instructionText: {
    color: '#888',
    fontSize: 12, // Reduced from 14
    lineHeight: 16, // Reduced from 20
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubtext: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default FlashcardSwiper;
