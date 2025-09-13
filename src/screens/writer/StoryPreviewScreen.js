    // screens/writer/StoryPreviewScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const StoryPreviewScreen = ({ route, navigation }) => {
  const { story } = route.params;
  const [showFullContent, setShowFullContent] = useState(false);

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleShare = async () => {
    try {
      const shareMessage = `Check out this amazing story: "${story.title}" by ${story.author?.name || 'Anonymous'}\n\nRead it on our Story Platform!`;
      
      await Share.share({
        message: shareMessage,
        title: story.title,
      });
    } catch (error) {
      console.error('Error sharing story:', error);
    }
  };

  const getContentToShow = () => {
    if (showFullContent) {
      return story.content;
    }
    
    // Show only free paragraphs (first 3)
    const paragraphs = story.content.split('\n\n');
    const freeParagraphs = paragraphs.slice(0, 3);
    return freeParagraphs.join('\n\n');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return '#4caf50';
      case 'draft':
        return '#ff9800';
      case 'pending':
        return '#2196f3';
      default:
        return '#666';
    }
  };

  const isPremiumContentAvailable = () => {
    const paragraphs = story.content.split('\n\n');
    return paragraphs.length > 3;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Preview</Text>
        <TouchableOpacity onPress={handleShare}>
          <Text style={styles.shareButton}>Share</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Story Header */}
        <View style={styles.storyHeader}>
          {story.cover_image_url && (
            <Image
              source={{ uri: story.cover_image_url }}
              style={styles.coverImage}
            />
          )}
          
          <View style={styles.storyMeta}>
            <View style={styles.statusContainer}>
              <View style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(story.status) }
              ]}>
                <Text style={styles.statusText}>{story.status.toUpperCase()}</Text>
              </View>
              <Text style={styles.categoryName}>{story.category?.name}</Text>
            </View>

            <Text style={styles.storyTitle}>{story.title}</Text>
            
            <View style={styles.authorInfo}>
              <Image
                source={{ 
                  uri: story.author?.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(story.author?.name || 'Author') 
                }}
                style={styles.authorAvatar}
              />
              <View style={styles.authorDetails}>
                <Text style={styles.authorName}>
                  {story.author?.name || 'You'} 
                  {story.author?.is_verified && ' ✓'}
                </Text>
                <Text style={styles.publishDate}>
                  {story.published_at 
                    ? `Published ${formatDate(story.published_at)}`
                    : `Created ${formatDate(story.created_at)}`
                  }
                </Text>
              </View>
            </View>

            {story.excerpt && (
              <Text style={styles.excerpt}>{story.excerpt}</Text>
            )}
          </View>
        </View>

        {/* Story Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{story.views_count}</Text>
            <Text style={styles.statLabel}>Views</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{story.likes_count}</Text>
            <Text style={styles.statLabel}>Likes</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{story.reading_time}m</Text>
            <Text style={styles.statLabel}>Read Time</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{formatCurrency(story.price)}</Text>
            <Text style={styles.statLabel}>Price</Text>
          </View>
        </View>

        {/* Story Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.sectionTitle}>Story Content</Text>
          
          {!showFullContent && (
            <View style={styles.previewNotice}>
              <Text style={styles.previewText}>
                📖 Free Preview - First 3 paragraphs
              </Text>
            </View>
          )}

          <View style={styles.storyContent}>
            <Text style={styles.contentText}>
              {getContentToShow()}
            </Text>
            
            {!showFullContent && isPremiumContentAvailable() && (
              <View style={styles.paywallContainer}>
                <View style={styles.paywallOverlay}>
                  <Text style={styles.paywallTitle}>Premium Content</Text>
                  <Text style={styles.paywallSubtitle}>
                    Continue reading for {formatCurrency(story.price)}
                  </Text>
                  <TouchableOpacity
                    style={styles.unlockButton}
                    onPress={() => setShowFullContent(true)}
                  >
                    <Text style={styles.unlockButtonText}>
                      Preview Full Content
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.paywallNote}>
                    (As the author, you can see the full content)
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('CreateEditStory', { story })}
          >
            <Text style={styles.editButtonText}>✏️ Edit Story</Text>
          </TouchableOpacity>
          
          {story.status === 'draft' && (
            <TouchableOpacity
              style={styles.publishButton}
              onPress={() => {
                Alert.alert(
                  'Publish Story',
                  'Are you ready to publish this story? Readers will be able to discover and purchase it.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                      text: 'Publish', 
                      onPress: () => {
                        // Navigate to edit screen with publish intent
                        navigation.navigate('CreateEditStory', { 
                          story: { ...story, status: 'published' }
                        });
                      }
                    },
                  ]
                );
              }}
            >
              <Text style={styles.publishButtonText}>🚀 Publish Story</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Writing Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Writing Tips</Text>
          <View style={styles.tipsList}>
            <Text style={styles.tipText}>
              • Make your first 3 paragraphs engaging to hook readers
            </Text>
            <Text style={styles.tipText}>
              • End the preview on a cliffhanger to encourage purchases
            </Text>
            <Text style={styles.tipText}>
              • Use descriptive language to paint vivid scenes
            </Text>
            <Text style={styles.tipText}>
              • Keep paragraphs concise for mobile reading
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  backButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  shareButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  content: {
    flex: 1,
  },
  storyHeader: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  coverImage: {
    width: 120,
    height: 160,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: 16,
  },
  storyMeta: {
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  categoryName: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  storyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 30,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  publishDate: {
    fontSize: 14,
    color: '#666',
  },
  excerpt: {
    fontSize: 16,
    color: '#555',
    lineHeight: 22,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  contentContainer: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  previewNotice: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  previewText: {
    fontSize: 14,
    color: '#1976d2',
    textAlign: 'center',
    fontWeight: '500',
  },
  storyContent: {
    position: 'relative',
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  paywallContainer: {
    marginTop: 20,
  },
  paywallOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
  },
  paywallTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  paywallSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  unlockButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 8,
  },
  unlockButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  paywallNote: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  actionButtons: {
    padding: 16,
    gap: 12,
  },
  editButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  editButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  publishButton: {
    backgroundColor: '#4caf50',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  publishButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  tipsContainer: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 20,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  tipsList: {
    gap: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
});

export default StoryPreviewScreen;