// screens/social/FollowersListScreen.js
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
import Feather from 'react-native-vector-icons/Feather';
import apiService from '../../services/apiService';
import { BASE_URL } from '../../constants/api';
import { useLanguage } from '../../contexts/LanguageContext';

const FollowersListScreen = ({ route, navigation }) => {
  const { userId, type } = route.params; // type: 'followers' or 'following'
  const { t } = useLanguage();

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadData = useCallback(async (pageNum = 1, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else if (pageNum === 1) setIsLoading(true);

    const result = type === 'followers'
      ? await apiService.getFollowers(userId, pageNum, 20)
      : await apiService.getFollowing(userId, pageNum, 20);

    if (result.success) {
      const paginationData = result.data;
      const items = paginationData?.data ?? [];
      const currentPage = paginationData?.current_page ?? pageNum;
      const lastPage = paginationData?.last_page ?? pageNum;

      setUsers(prev => (pageNum === 1 || isRefresh ? items : [...prev, ...items]));
      setHasMore(currentPage < lastPage);
      setPage(currentPage);
    }
    
    setIsLoading(false);
    setRefreshing(false);
  }, [userId, type]);

  useEffect(() => {
    loadData(1);
  }, [loadData]);

  const onRefresh = () => loadData(1, true);

  const onLoadMore = () => {
    if (hasMore && !isLoading && !refreshing) {
      loadData(page + 1);
    }
  };

  const navigateToProfile = (profileId) => {
    navigation.navigate('UserProfile', { userId: profileId });
  };

  const renderItem = ({ item }) => {
    const avatarUri = item.profile_image ? { uri: BASE_URL + item.profile_image } : null;
    return (
      <TouchableOpacity
        style={styles.userCard}
        onPress={() => navigateToProfile(item.id)}
        activeOpacity={0.8}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {avatarUri ? (
            <Image source={avatarUri} style={styles.avatarImage} />
          ) : (
            <LinearGradient colors={['#A855F7', '#7C3AED']} style={styles.avatarImage}>
              <Text style={styles.avatarInitial}>
                {item.name?.[0]?.toUpperCase() ?? '?'}
              </Text>
            </LinearGradient>
          )}
        </View>

        {/* Content info */}
        <View style={styles.userInfo}>
          <Text style={styles.userName} numberOfLines={1}>
            {item.name}
          </Text>
          {item.bio ? (
            <Text style={styles.userBio} numberOfLines={1}>
              {item.bio}
            </Text>
          ) : (
            <Text style={styles.noBio} numberOfLines={1}>
              No bio written yet
            </Text>
          )}
        </View>

        {/* Chevron Icon */}
        <Feather name="chevron-right" size={18} color="rgba(255, 255, 255, 0.25)" />
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => {
    const isFollowers = type === 'followers';
    return (
      <View style={styles.emptyBox}>
        <View style={styles.emptyIconCircle}>
          <Feather name="users" size={32} color="#A855F7" />
        </View>
        <Text style={styles.emptyTitle}>
          {isFollowers ? 'No Followers Yet' : 'Not Following Anyone'}
        </Text>
        <Text style={styles.emptyText}>
          {isFollowers
            ? "When other users follow this profile, they'll show up here."
            : "When this profile follows other users, they'll show up here."}
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    return hasMore ? (
      <ActivityIndicator color="#A855F7" style={{ marginVertical: 20 }} />
    ) : null;
  };

  const getScreenTitle = () => {
    const titleKey = type === 'followers' ? 'followers' : 'following';
    return t(titleKey) || (type === 'followers' ? 'Followers' : 'Following');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={20} color="#C4B5FD" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {getScreenTitle()}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color="#A855F7" />
        </View>
      ) : (
        <FlatList
          data={users}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.2}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#A855F7"
              colors={['#A855F7']}
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
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#12082A',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(124, 58, 237, 0.15)',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(124, 58, 237, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },

  // list
  listContent: {
    padding: 16,
    flexGrow: 1,
  },

  // user card
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#160F2B',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.1)',
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    marginRight: 12,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
    marginRight: 8,
  },
  userName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 3,
  },
  userBio: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 12,
  },
  noBio: {
    color: 'rgba(255, 255, 255, 0.25)',
    fontSize: 12,
    fontStyle: 'italic',
  },

  // empty state
  emptyBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 80,
  },
  emptyIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default FollowersListScreen;
