import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions,
  Alert,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

const Whiteboard = () => {
  const router = useRouter();
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeColor, setStrokeColor] = useState('#fff');
  const [strokeWidth, setStrokeWidth] = useState(3);

  const isTablet = width > 768; // Basic tablet detection

  const handleClearBoard = () => {
    Alert.alert(
      'Clear Whiteboard',
      'Are you sure you want to clear the whiteboard?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => {
          // TODO: Implement clear functionality
        }}
      ]
    );
  };

  const handleAIAnalysis = () => {
    Alert.alert(
      'AI Analysis',
      'AI will analyze your whiteboard content and generate study materials',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Analyze', onPress: () => {
          // TODO: Implement AI analysis
          Alert.alert('Coming Soon', 'AI analysis feature will be available soon!');
        }}
      ]
    );
  };
  if (!isTablet) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Whiteboard</Text>
          <View style={styles.headerSpacer} />
        </View>
        
        <View style={styles.notSupportedContainer}>
          <Text style={styles.notSupportedIcon}>📱</Text>
          <Text style={styles.notSupportedTitle}>Tablet Required</Text>
          <Text style={styles.notSupportedText}>
            The whiteboard feature is optimized for tablets and larger screens. 
            Please use a tablet device to access this feature.
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Whiteboard</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleAIAnalysis}
          >
            <Text style={styles.actionButtonText}>🧠 AI Analyze</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.clearButton]}
            onPress={handleClearBoard}
          >
            <Text style={styles.clearButtonText}>🗑️ Clear</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Drawing Tools */}
      <View style={styles.toolbar}>
        <View style={styles.toolGroup}>
          <Text style={styles.toolLabel}>Colors:</Text>
          {['#fff', '#1DB954', '#FF6B6B', '#4ECDC4', '#FFE66D'].map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorButton,
                { backgroundColor: color },
                strokeColor === color && styles.activeColorButton
              ]}
              onPress={() => setStrokeColor(color)}
            />
          ))}
        </View>
        
        <View style={styles.toolGroup}>
          <Text style={styles.toolLabel}>Size:</Text>
          {[2, 5, 8, 12].map((size) => (
            <TouchableOpacity
              key={size}
              style={[
                styles.sizeButton,
                strokeWidth === size && styles.activeSizeButton
              ]}
              onPress={() => setStrokeWidth(size)}
            >
              <Text style={styles.sizeButtonText}>{size}px</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Drawing Canvas */}
      <View style={styles.canvasContainer}>
        <View style={styles.canvas}>
          <Text style={styles.canvasPlaceholder}>
            ✏️ Start drawing here!
            {'\n\n'}
            Draw diagrams, write notes, or sketch ideas.
            {'\n'}
            AI will analyze your content and suggest study materials.
          </Text>
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>How to use:</Text>
        <Text style={styles.instructionsText}>
          • Draw or write on the canvas above
          {'\n'}• Use different colors and sizes for better organization
          {'\n'}• Tap "AI Analyze" to generate flashcards and questions
          {'\n'}• Your work will be saved automatically
        </Text>
      </View>
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
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSpacer: {
    width: 100,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#1DB954',
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: '#FF6B6B',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  notSupportedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  notSupportedIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  notSupportedTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  notSupportedText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#111',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  toolGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  toolLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 5,
  },
  colorButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#333',
  },
  activeColorButton: {
    borderColor: '#1DB954',
    borderWidth: 3,
  },
  sizeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#333',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#444',
  },
  activeSizeButton: {
    backgroundColor: '#1DB954',
    borderColor: '#1DB954',
  },
  sizeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  canvasContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  canvas: {
    flex: 1,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#444',
    borderStyle: 'dashed',
  },
  canvasPlaceholder: {
    color: '#666',
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 28,
  },
  instructions: {
    padding: 20,
    backgroundColor: '#111',
  },
  instructionsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  instructionsText: {
    color: '#888',
    fontSize: 14,
    lineHeight: 20,
  },
});

export default Whiteboard;
