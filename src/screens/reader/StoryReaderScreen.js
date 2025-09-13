// screens/reader/StoryReaderScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const StoryReaderScreen = ({ route, navigation }) => {
  const { story, isUnlocked } = route.params;
  const [fontSize, setFontSize] = useState(16);
  const [showControls, setShowControls] = useState(true);
  const [readingProgress, setReadingProgress] = useState(0);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    // Hide controls after 3 seconds
    const timer = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const paragraphs = story.content ? story.content.split('\n\n').filter(p => p.trim() !== '') : [];

  const handleScroll = (event) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const progress = contentOffset.y / (contentSize.height - layoutMeasurement.height);
    setReadingProgress(Math.min(Math.max(progress, 0), 1));
  };

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  const increaseFontSize = () => {
    if (fontSize < 24) {
      setFontSize(fontSize + 2);
    }
  };

  const decreaseFontSize = () => {
    if (fontSize > 12) {
      setFontSize(fontSize - 2);
    }
  };

  if (!isUnlocked) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Access Denied</Text>
          <Text style={styles.errorText}>You need to unlock this story to read it.</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden={!showControls} />
      
      {/* Header Controls */}
      {showControls && (
        <SafeAreaView>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.headerButtonText}>← Back</Text>
            </TouchableOpacity>
            
            <View style={styles.fontControls}>
              <TouchableOpacity 
                style={styles.fontButton}
                onPress={decreaseFontSize}
                disabled={fontSize <= 12}
              >
                <Text style={styles.fontButtonText}>A-</Text>
              </TouchableOpacity>
              <Text style={styles.fontSizeText}>{fontSize}</Text>
              <TouchableOpacity 
                style={styles.fontButton}
                onPress={increaseFontSize}
                disabled={fontSize >= 24}
              >
                <Text style={styles.fontButtonText}>A+</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${readingProgress * 100}%` }]} />
          </View>
        </SafeAreaView>
      )}

      {/* Story Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <TouchableOpacity 
          style={styles.contentContainer}
          activeOpacity={1}
          onPress={toggleControls}
        >
          {/* Story Title */}
          <Text style={[styles.storyTitle, { fontSize: fontSize + 8 }]}>
            {story.title}
          </Text>
          
          <Text style={[styles.storyAuthor, { fontSize: fontSize - 2 }]}>
            by {story.author?.name}
          </Text>
          
          <View style={styles.divider} />

          {/* Story Content */}
          {paragraphs.map((paragraph, index) => (
            <Text 
              key={index} 
              style={[styles.paragraph, { fontSize: fontSize }]}
            >
              {paragraph.trim()}
            </Text>
          ))}

          {/* End of Story */}
          <View style={styles.endSection}>
            <View style={styles.endDivider} />
            <Text style={styles.endText}>— End of Story —</Text>
            <Text style={styles.thankYouText}>
              Thank you for reading "{story.title}"
            </Text>
            
            <TouchableOpacity 
              style={styles.backToStoriesButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.backToStoriesButtonText}>Discover More Stories</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Footer Controls */}
      {showControls && (
        <View style={styles.footer}>
          <Text style={styles.progressText}>
            {Math.round(readingProgress * 100)}% Complete
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerButton: {
    padding: 8,
  },
  headerButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  fontControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fontButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  fontButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  fontSizeText: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 8,
  },
  progressBarContainer: {
    height: 3,
    backgroundColor: '#eee',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  storyTitle: {
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 1.3,
  },
  storyAuthor: {
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 24,
    marginHorizontal: 40,
  },
  paragraph: {
    lineHeight: 1.6,
    color: '#333',
    marginBottom: 20,
    textAlign: 'justify',
  },
  endSection: {
    alignItems: 'center',
    marginTop: 40,
    paddingTop: 24,
  },
  endDivider: {
    height: 2,
    width: 100,
    backgroundColor: '#ddd',
    marginBottom: 20,
  },
  endText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 16,
  },
  thankYouText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 24,
  },
  backToStoriesButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  backToStoriesButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default StoryReaderScreen;