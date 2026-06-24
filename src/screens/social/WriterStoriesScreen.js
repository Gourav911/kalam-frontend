// screens/social/WriterStoriesScreen.js
// Shows all published stories by a specific author.
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import apiService from '../../services/apiService';
import { BASE_URL } from '../../constants/api';
import { useLanguage } from '../../contexts/LanguageContext';

const WriterStoriesScreen = ({ route, navigation }) => {
  const { writerId, writerName } = route.params;
  const { t } = useLanguage();

  const [stories, setStories]     = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage]           = useState(1);
  const [hasMore, setHasMore]     = useState(true);

  const load = useCallback(async (pageNum = 1, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else if (pageNum === 1) setIsLoading(true);

    const result = await apiService.getStories({ author: writerId, page: pageNum, per_page: 15 });
    if (result.success) {
      const items  = result.data?.data?.data ?? result.data?.data ?? [];
      const total  = result.data?.data?.total ?? items.length;
      setStories(prev => (pageNum === 1 || isRefresh ? items : [...prev, ...items]));
      setHasMore(items.length > 0 && (pageNum * 15) < total);
      setPage(pageNum);
    }
    setIsLoading(false);
    setRefreshing(false);
  }, [writerId]);

  useEffect(() => { load(1); }, [load]);

  const onRefresh  = () => load(1, true);
  const onLoadMore = () => { if (hasMore && !isLoading) load(page + 1); };

  const navigateToStory = (story) => {
    navigation.navigate('StoryPreviewScreenReader', { story });
  };

  // ── Story card ───────────────────────────────────────────────
  const renderItem = ({ item }) => {
    const coverUri = item.cover_image ? BASE_URL + item.cover_image : null;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigateToStory(item)}
        activeOpacity={0.82}
      >
        {/* Cover */}
        <View style={styles.coverBox}>
          {coverUri ? (
            <Image source={{ uri: coverUri }} style={styles.cover} resizeMode="cover" />
          ) : (
            <LinearGradient colors={['#4C1D95', '#2D1B69']} style={styles.cover}>
              <Text style={styles.coverFallback}>📖</Text>
            </LinearGradient>
          )}
          {item.category?.name && (
            <View style={[styles.catBadge, { backgroundColor: item.category.color ?? '#7C3AED' }]}>
              <Text style={styles.catText}>{t(item.category.slug) || item.category.name}</Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.cardExcerpt} numberOfLines={2}>
            {item.excerpt ?? ''}
          </Text>
          <View style={styles.cardStats}>
            <Text style={styles.cardStat}>❤️ {item.likes_count ?? 0}</Text>
            <Text style={styles.cardStat}>👁️ {item.views_count ?? 0}</Text>
            {item.reading_time ? (
              <Text style={styles.cardStat}>⏱ {item.reading_time}m</Text>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyBox}>
      <Text style={styles.emptyEmoji}>📚</Text>
      <Text style={styles.emptyTitle}>No Stories Yet</Text>
      <Text style={styles.emptyText}>
        {writerName} hasn't published any stories.
      </Text>
    </View>
  );

  const renderFooter = () =>
    hasMore ? <ActivityIndicator color="#A855F7" style={{ marginVertical: 20 }} /> : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>{writerName}</Text>
          <Text style={styles.headerSub}>All Stories</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#A855F7" />
        </View>
      ) : (
        <FlatList
          data={stories}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.3}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#A855F7"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0A1E',
  },

  // header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#12082A',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(124,58,237,0.2)',
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(124,58,237,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    color: '#C4B5FD',
    fontSize: 20,
    fontWeight: '700',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  headerSub: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    marginTop: 1,
  },

  // loading
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // list
  listContent: {
    padding: 14,
    flexGrow: 1,
  },

  // card
  card: {
    height: 120,
    flexDirection: 'row',
    backgroundColor: '#1A1030',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2D1B69',
  },
  coverBox: {
    width: 100,
    position: 'relative',
  },
  cover: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverFallback: {
    fontSize: 32,
  },
  catBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  catText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  // card info
  cardInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  cardTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 5,
    lineHeight: 21,
  },
  cardExcerpt: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 8,
  },
  cardStats: {
    flexDirection: 'row',
    gap: 12,
  },
  cardStat: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontWeight: '600',
  },

  // empty
  emptyBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyEmoji: { fontSize: 52, marginBottom: 14 },
  emptyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default WriterStoriesScreen;
