// screens/reader/StoryPreviewScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/apiService';

const StoryPreviewScreenReader = ({ route, navigation }) => {
  const { story } = route.params;
  const { user } = useAuth();
  const [storyDetails, setStoryDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paragraphs, setParagraphs] = useState([]);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    loadStoryDetails();
    checkUnlockStatus();
    trackView();
  }, []);

  const loadStoryDetails = async () => {
    setIsLoading(true);
    const result = await apiService.getStory(story.id);
    if (result.success) {
      setStoryDetails(result.data);
      // Split content into paragraphs
      const content = result.data.content || '';
      const paragraphList = content.split('\n\n').filter(p => p.trim() !== '');
      setParagraphs(paragraphList);
      setHasLiked(result.data.has_liked);
    }
    setIsLoading(false);
  };

  const checkUnlockStatus = async () => {
    const result = await apiService.checkStoryUnlock(story.id);
    if (result.success) {
      setIsUnlocked(result.data.is_unlocked);
    }
  };

  const trackView = async () => {
    await apiService.trackStoryView(story.id);
  };

  const handleLike = async () => {
    const result = hasLiked 
      ? await apiService.unlikeStory(story.id)
      : await apiService.likeStory(story.id);
    
    if (result.success) {
      setHasLiked(!hasLiked);
      // Update story details with new like count
      setStoryDetails(prev => ({
        ...prev,
        likes_count: hasLiked ? prev.likes_count - 1 : prev.likes_count + 1
      }));
    }
  };

  const handleUnlock = () => {
    navigation.navigate('PaymentScreen', { 
      story: storyDetails,
      onPaymentSuccess: () => {
        setIsUnlocked(true);
      }
    });
  };

  const handleReadFull = () => {
    navigation.navigate('StoryReader', { 
      story: storyDetails,
      isUnlocked: true 
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading story...</Text>
      </SafeAreaView>
    );
  }

  const freeParagraphs = paragraphs.slice(0, 3);
  const lockedParagraphs = paragraphs.slice(3);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>

        {/* Story Cover & Info */}
        <View style={styles.storyHeader}>
          <Image
            source={{ 
              uri: storyDetails?.cover_image_url || 'https://via.placeholder.com/300x400' 
            }}
            style={styles.coverImage}
          />
          <View style={styles.storyInfo}>
            <Text style={styles.title}>{storyDetails?.title}</Text>
            <Text style={styles.author}>by {storyDetails?.author?.name}</Text>
            <Text style={styles.category}>{storyDetails?.category?.name}</Text>
            
            <View style={styles.stats}>
              <TouchableOpacity style={styles.statButton} onPress={handleLike}>
                <Text style={[styles.statText, hasLiked && styles.likedText]}>
                  {hasLiked ? '❤️' : '🤍'} {storyDetails?.likes_count || 0}
                </Text>
              </TouchableOpacity>
              <Text style={styles.statText}>👁️ {storyDetails?.views_count || 0}</Text>
            </View>
          </View>
        </View>

        {/* Story Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.sectionTitle}>Story Preview</Text>
          
          {/* Free Paragraphs */}
          {freeParagraphs.map((paragraph, index) => (
            <Text key={index} style={styles.paragraph}>
              {paragraph.trim()}
            </Text>
          ))}

          {/* Paywall for Locked Content */}
          {lockedParagraphs.length > 0 && !isUnlocked && (
            <View style={styles.paywall}>
              <View style={styles.paywallGradient}>
                <Text style={styles.paywallTitle}>Continue Reading</Text>
                <Text style={styles.paywallDescription}>
                  Unlock this complete story for just ₹5
                </Text>
                <Text style={styles.paywallBenefit}>
                  • Read all {paragraphs.length} paragraphs
                  {'\n'}• Support the writer
                  {'\n'}• Unlimited access forever
                </Text>
                <TouchableOpacity style={styles.unlockButton} onPress={handleUnlock}>
                  <Text style={styles.unlockButtonText}>Unlock for ₹5</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Unlocked Content or Read Full Button */}
          {isUnlocked && (
            <View style={styles.unlockedSection}>
              <Text style={styles.unlockedText}>✅ Story Unlocked!</Text>
              <TouchableOpacity style={styles.readFullButton} onPress={handleReadFull}>
                <Text style={styles.readFullButtonText}>Read Full Story</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 16,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  storyHeader: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 0,
  },
  coverImage: {
    width: 120,
    height: 160,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  storyInfo: {
    flex: 1,
    marginLeft: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  author: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 12,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statButton: {
    marginRight: 16,
  },
  statText: {
    fontSize: 14,
    color: '#666',
  },
  likedText: {
    color: '#FF3B30',
  },
  contentContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 16,
    textAlign: 'justify',
  },
  paywall: {
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  paywallGradient: {
    backgroundColor: '#f8f9fa',
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 12,
  },
  paywallTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  paywallDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  paywallBenefit: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  unlockButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
  },
  unlockButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  unlockedSection: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f8f0',
    borderRadius: 12,
    marginTop: 20,
  },
  unlockedText: {
    fontSize: 16,
    color: '#28a745',
    fontWeight: '600',
    marginBottom: 12,
  },
  readFullButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  readFullButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default StoryPreviewScreenReader;