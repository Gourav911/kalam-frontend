// screens/writer/MyStoriesScreen.js
import React, { useState, useCallback } from 'react';
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
import Feather from 'react-native-vector-icons/Feather';
import apiService from '../../services/apiService';
import { BASE_URL } from '../../constants/api';
import { useLanguage } from '../../contexts/LanguageContext';

const MyStoriesScreen = ({ navigation, isInline = false }) => {
  const { t } = useLanguage();
  const [stories, setStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, published, draft

  const loadStories = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const filters = filter !== 'all' ? { status: filter } : {};
      const result = await apiService.getWriterStories(filters);
      
      if (result.success) {
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
  }, [filter]);

  useFocusEffect(
    useCallback(() => {
      loadStories();
    }, [loadStories])
  );

  const handleDeleteStory = (story) => {
    Alert.alert(
      t('deleteStory'),
      `${t('deleteConfirmPart1')} "${story.title}"? ${t('deleteConfirmPart2')}`,
      [
        { text: 'Cancel', style: 'cancel' },
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

  const getStatusStyle = (status) => {
    switch (status) {
      case 'published':
        return { bg: 'rgba(52, 211, 153, 0.12)', text: '#34D399' };
      case 'draft':
        return { bg: 'rgba(251, 191, 36, 0.12)', text: '#FBBF24' };
      case 'pending':
        return { bg: 'rgba(96, 165, 250, 0.12)', text: '#60A5FA' };
      default:
        return { bg: 'rgba(156, 163, 175, 0.12)', text: '#9CA3AF' };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const FilterButton = ({ title, isActive, onPress }) => (
    <TouchableOpacity
      style={[styles.filterButton, isActive && styles.filterButtonActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.filterButtonText, isActive && styles.filterButtonTextActive]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const StoryCard = ({ story }) => {
    const statusStyle = getStatusStyle(story.status);
    return (
      <View style={styles.storyCard}>
        <View style={styles.storyHeader}>
          <Image
            source={{ 
              uri: story.cover_image ? BASE_URL + story.cover_image : 'https://via.placeholder.com/60x80' 
            }}
            style={styles.storyCover}
            resizeMode="cover"
          />
          <View style={styles.storyInfo}>
            <View style={styles.storyTitleRow}>
              <Text style={styles.storyTitle} numberOfLines={2}>
                {story.title}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                <View style={[styles.statusDot, { backgroundColor: statusStyle.text }]} />
                <Text style={[styles.statusText, { color: statusStyle.text }]}>
                  {story.status.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.metadataRow}>
              <Text style={styles.storyDate}>
                {t('created')}: {formatDate(story.created_at)}
              </Text>
              {story.published_at && (
                <Text style={styles.storyDate}>
                 {t('published')}: {formatDate(story.published_at)}
                </Text>
              )}
            </View>

            {/* Inline Stats Row */}
            <View style={styles.inlineStatsRow}>
              <View style={styles.inlineStat}>
                <Feather name="eye" size={13} color="rgba(255, 255, 255, 0.4)" />
                <Text style={styles.inlineStatVal}>{story.views_count}</Text>
              </View>
              <View style={styles.inlineStat}>
                <Feather name="heart" size={12} color="rgba(255, 255, 255, 0.4)" />
                <Text style={styles.inlineStatVal}>{story.likes_count}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Story Actions */}
        <View style={styles.storyActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('CreateEditStory', { story })}
            activeOpacity={0.75}
          >
            <Feather name="edit-2" size={12} color="#C4B5FD" />
            <Text style={[styles.actionButtonText, { color: '#C4B5FD' }]}>{t('edit')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('StoryPreview', { story })}
            activeOpacity={0.75}
          >
            <Feather name="eye" size={12} color="#93C5FD" />
            <Text style={[styles.actionButtonText, { color: '#93C5FD' }]}>{t('preview')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteStory(story)}
            activeOpacity={0.75}
          >
            <Feather name="trash-2" size={12} color="#FCA5A5" />
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>{t('delete')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const Container = isInline ? View : SafeAreaView;
  const ListWrapper = isInline ? View : ScrollView;

  if (isLoading && !refreshing) {
    return (
      <Container style={[styles.container, isInline && styles.inlineContainer]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#A855F7" />
          <Text style={styles.loadingText}>{t('loadingYourStories')}</Text>
        </View>
      </Container>
    );
  }

  return (
    <Container style={[styles.container, isInline && styles.inlineContainer]}>
      {/* Header */}
      {!isInline && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('myStories')}</Text>
        </View>
      )}

      {/* Filters */}
      <View style={[styles.filtersContainer, isInline && styles.inlineFilters]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <View style={styles.filtersList}>
            <FilterButton
              title="All"
              isActive={filter === 'all'}
              onPress={() => setFilter('all')}
            />
            <FilterButton
              title="Published"
              isActive={filter === 'published'}
              onPress={() => setFilter('published')}
            />
            <FilterButton
              title="Drafts"
              isActive={filter === 'draft'}
              onPress={() => setFilter('draft')}
            />
          </View>
        </ScrollView>
      </View>

      {/* Stories List */}
      <ListWrapper
        style={!isInline && styles.storiesList}
        refreshControl={
          !isInline ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadStories(true)}
              tintColor="#A855F7"
            />
          ) : undefined
        }
      >
        {stories.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={styles.emptyTitle}>{t('noStoriesYet')}</Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'all' ? t('startFirstStory') : t('noFilteredStories')}
            </Text>
            {filter === 'all' && (
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => navigation.navigate('CreateEditStory')}
                activeOpacity={0.8}
              >
                <Text style={styles.emptyButtonText}>{t('createFirstStory')}</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.storiesContainer}>
            {stories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </View>
        )}
      </ListWrapper>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0A1E',
  },
  inlineContainer: {
    backgroundColor: 'transparent',
    marginTop: 0,
  },
  loadingContainer: {
    paddingVertical: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: 'rgba(255,255,255,0.45)',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#12082A',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(124, 58, 237, 0.15)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  filtersContainer: {
    paddingVertical: 8,
    backgroundColor: '#0F0A1E',
  },
  inlineFilters: {
    backgroundColor: 'transparent',
    paddingVertical: 4,
    marginBottom: 4,
  },
  filterScroll: {
    paddingHorizontal: 20,
  },
  filtersList: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#160F2B',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.1)',
  },
  filterButtonActive: {
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    borderColor: '#A855F7',
  },
  filterButtonText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  storiesList: { 
    flex: 1 
  },
  storiesContainer: { 
    paddingHorizontal: 20,
    paddingVertical: 4,
  },

  // Story card
  storyCard: {
    backgroundColor: '#160F2B',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.08)',
  },
  storyHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  storyCover: {
    width: 60,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#2D1B69',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  storyInfo: { 
    flex: 1,
    justifyContent: 'space-between',
  },
  storyTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  storyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
    marginRight: 8,
    lineHeight: 18,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 4,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  statusText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  metadataRow: {
    marginBottom: 4,
  },
  storyDate: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.4)',
    marginBottom: 1,
  },

  // Inline stats row
  inlineStatsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 2,
  },
  inlineStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  inlineStatVal: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
  },

  // Action buttons
  storyActions: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 10,
    height: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  actionButtonText: {
    fontSize: 11,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: 'rgba(248, 113, 113, 0.08)',
    borderColor: 'rgba(248, 113, 113, 0.15)',
  },
  deleteButtonText: { 
    color: '#F87171' 
  },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyIcon: { 
    fontSize: 48, 
    marginBottom: 12 
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
});

export default MyStoriesScreen;