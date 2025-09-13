// screens/writer/MyStoriesScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import apiService from '../../services/apiService';

const MyStoriesScreen = ({ navigation }) => {
  const [stories, setStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, published, draft

  useFocusEffect(
    useCallback(() => {
      loadStories();
    }, [filter])
  );

  const loadStories = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const filters = filter !== 'all' ? { status: filter } : {};
      const result = await apiService.getWriterStories(filters);
      
      if (result.success) {
        // console.log(result.data.data.data)
        setStories(result.data.data.data || []);
        
      } else {
        Alert.alert('Error', 'Failed to load stories');
      }
    } catch (error) {
      console.error('Error loading stories:', error);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleDeleteStory = (story) => {
    Alert.alert(
      'Delete Story',
      `Are you sure you want to delete "${story.title}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => confirmDelete(story.id),
        },
      ]
    );
  };

  const confirmDelete = async (storyId) => {
    try {
      const result = await apiService.deleteStory(storyId);
      if (result.success) {
        setStories(prev => prev.filter(story => story.id !== storyId));
        Alert.alert('Success', 'Story deleted successfully');
      } else {
        Alert.alert('Error', result.error.message || 'Failed to delete story');
      }
    } catch (error) {
      console.error('Error deleting story:', error);
      Alert.alert('Error', 'Something went wrong');
    }
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'published':
        return '✅';
      case 'draft':
        return '📝';
      case 'pending':
        return '⏳';
      default:
        return '❓';
    }
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const FilterButton = ({ title, value, isActive, onPress }) => (
    <TouchableOpacity
      style={[styles.filterButton, isActive && styles.filterButtonActive]}
      onPress={onPress}
    >
      <Text style={[
        styles.filterButtonText,
        isActive && styles.filterButtonTextActive
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const StoryCard = ({ story }) => (
    <View style={styles.storyCard}>
      <View style={styles.storyHeader}>
        <Image
          source={{ 
            uri: story.cover_image_url || 'https://via.placeholder.com/60x80' 
          }}
          style={styles.storyCover}
        />
        <View style={styles.storyInfo}>
          <View style={styles.storyTitleRow}>
            <Text style={styles.storyTitle} numberOfLines={2}>
              {story.title}
            </Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(story.status) }
            ]}>
              <Text style={styles.statusIcon}>{getStatusIcon(story.status)}</Text>
              <Text style={styles.statusText}>{story.status.toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.storyDate}>
            Created: {formatDate(story.created_at)}
          </Text>
          {story.published_at && (
            <Text style={styles.storyDate}>
              Published: {formatDate(story.published_at)}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.storyStats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{story.views_count}</Text>
          <Text style={styles.statLabel}>Views</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{story.likes_count}</Text>
          <Text style={styles.statLabel}>Likes</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{formatCurrency(story.price)}</Text>
          <Text style={styles.statLabel}>Price</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{story.reading_time}m</Text>
          <Text style={styles.statLabel}>Read Time</Text>
        </View>
      </View>

      <View style={styles.storyActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('CreateEditStory', { story })}
        >
          <Text style={styles.actionButtonText}>✏️ Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('StoryPreview', { story })}
        >
          <Text style={styles.actionButtonText}>👁️ Preview</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteStory(story)}
        >
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>🗑️ Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading your stories...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Stories</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateEditStory')}
        >
          <Text style={styles.createButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filtersList}>
            <FilterButton
              title="All"
              value="all"
              isActive={filter === 'all'}
              onPress={() => setFilter('all')}
            />
            <FilterButton
              title="Published"
              value="published"
              isActive={filter === 'published'}
              onPress={() => setFilter('published')}
            />
            <FilterButton
              title="Drafts"
              value="draft"
              isActive={filter === 'draft'}
              onPress={() => setFilter('draft')}
            />
          </View>
        </ScrollView>
      </View>

      {/* Stories List */}
      <ScrollView
        style={styles.storiesList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadStories(true)}
          />
        }
      >
        {stories.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={styles.emptyTitle}>No stories yet</Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'all' 
                ? "Start writing your first story!"
                : `No ${filter} stories found.`
              }
            </Text>
            {filter === 'all' && (
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => navigation.navigate('CreateEditStory')}
              >
                <Text style={styles.emptyButtonText}>Create Your First Story</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.storiesContainer}>
            {console.log(typeof(stories))}
    {Array.isArray(stories) && stories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  createButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  filtersList: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f3f4',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  storiesList: {
    flex: 1,
  },
  storiesContainer: {
    padding: 16,
  },
  storyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  storyHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  storyCover: {
    width: 60,
    height: 80,
    borderRadius: 6,
    backgroundColor: '#e1e8ed',
    marginRight: 12,
  },
  storyInfo: {
    flex: 1,
  },
  storyTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  storyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  statusIcon: {
    fontSize: 10,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  storyDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  storyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f1f3f4',
    marginVertical: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  storyActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#f1f3f4',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#ffebee',
  },
  deleteButtonText: {
    color: '#d32f2f',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MyStoriesScreen;