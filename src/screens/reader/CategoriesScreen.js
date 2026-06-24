// screens/reader/CategoriesScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiService from '../../services/apiService';
import { useLanguage } from '../../contexts/LanguageContext';

const CategoriesScreen = ({ navigation }) => {
  const { t } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [stories, setStories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStories, setIsLoadingStories] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setIsLoading(true);
    const result = await apiService.getCategories();
    if (result.success) {
      setCategories(result.data.data);
    }
    setIsLoading(false);
  };

  const loadStoriesByCategory = async (categoryId) => {
    setIsLoadingStories(true);
    const filters = { 
      category: categoryId,
      per_page: 20,
      search: searchQuery 
    };
    
    const result = await apiService.getStories(filters);
    if (result.success) {
      setStories(result.data.data.data || []);
    }
    setIsLoadingStories(false);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    loadStoriesByCategory(category.id);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setStories([]);
    setSearchQuery('');
  };

  const handleSearch = () => {
    if (selectedCategory) {
      loadStoriesByCategory(selectedCategory.id);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (selectedCategory) {
      await loadStoriesByCategory(selectedCategory.id);
    } else {
      await loadCategories();
    }
    setRefreshing(false);
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => handleCategorySelect(item)}
    >
      <View style={styles.categoryIcon}>
        <Text style={styles.categoryEmoji}>
          {getCategoryEmoji(item.name)}
        </Text>
      </View>
      <Text style={styles.categoryName}>{t(item.slug) || item.name}</Text>
      <Text style={styles.categoryCount}>
        {item.stories_count || 0} {t('storiesCount') || 'stories'}
      </Text>
    </TouchableOpacity>
  );

  const renderStoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.storyCard}
      onPress={() => navigation.navigate('StoryPreview', { story: item })}
    >
      <Image
        source={{ 
          uri: item.cover_image_url || 'https://via.placeholder.com/120x160' 
        }}
        style={styles.storyCover}
      />
      <View style={styles.storyInfo}>
        <Text style={styles.storyTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.storyAuthor}>by {item.author?.name}</Text>
        <Text style={styles.storyExcerpt} numberOfLines={2}>
          {item.excerpt}
        </Text>
        <View style={styles.storyStats}>
          <Text style={styles.statText}>❤️ {item.likes_count || 0}</Text>
          <Text style={styles.statText}>👁️ {item.views_count || 0}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const getCategoryEmoji = (categoryName) => {
    const emojiMap = {
      'Romance': '💕',
      'Adventure': '⚔️',
      'Mystery': '🔍',
      'Fantasy': '🌟',
      'Horror': '👻',
      'Comedy': '😂',
      'Drama': '🎭',
      'Sci-Fi': '🚀',
      'Science Fiction': '🚀',
      'Thriller': '😱',
      'Historical': '🏛️',
      'Young Adult': '🌈',
      'Crime': '🕵️',
      'Biography': '👤',
      'Fiction': '📚',
      'Non-Fiction': '📖',
      'Social': '👥',
      'Religious': '🙏',
      'Educational': '💡',
    };
    
    return emojiMap[categoryName] || '📘';
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading categories...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {selectedCategory ? (
          <View style={styles.headerWithBack}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleBackToCategories}
            >
              <Text style={styles.backButtonText}>← {t('categories') || 'Categories'}</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t(selectedCategory.slug) || selectedCategory.name}</Text>
          </View>
        ) : (
          <Text style={styles.headerTitle}>{t('storyCategories') || 'Story Categories'}</Text>
        )}
      </View>

      {/* Search Bar (only when viewing stories) */}
      {selectedCategory && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder={`${t('searchStories') || 'Search'} (${t(selectedCategory.slug) || selectedCategory.name})...`}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
        </View>
      )}

      {/* Content */}
      {!selectedCategory ? (
        // Categories Grid
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.categoriesGrid}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        // Stories List
        <View style={styles.storiesContainer}>
          {isLoadingStories ? (
            <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
          ) : (
            <FlatList
              data={stories}
              renderItem={renderStoryItem}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.storiesList}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyTitle}>{t('noStoriesFound') || 'No Stories Found'}</Text>
                  <Text style={styles.emptyText}>
                    {searchQuery 
                      ? (t('noStoriesWithSearch') || 'No stories found for "{{search}}" in {{category}}')
                          .replace('{{search}}', searchQuery)
                          .replace('{{category}}', t(selectedCategory.slug) || selectedCategory.name)
                      : (t('noStoriesInCategory') || 'No stories available in {{category}} category yet.')
                          .replace('{{category}}', t(selectedCategory.slug) || selectedCategory.name)
                    }
                  </Text>
                </View>
              )}
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerWithBack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContainer: {
    padding: 16,
    paddingTop: 8,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  categoriesGrid: {
    padding: 16,
  },
  categoryCard: {
    flex: 1,
    margin: 8,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 12,
    color: '#666',
  },
  storiesContainer: {
    flex: 1,
  },
  loader: {
    marginTop: 50,
  },
  storiesList: {
    padding: 16,
  },
  storyCard: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  storyCover: {
    width: 80,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  storyInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  storyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  storyAuthor: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  storyExcerpt: {
    fontSize: 13,
    color: '#888',
    lineHeight: 18,
    marginBottom: 8,
  },
  storyStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginRight: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default CategoriesScreen;