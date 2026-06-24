// screens/social/NotificationsScreen.js
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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import apiService from '../../services/apiService';
import { BASE_URL } from '../../constants/api';
import { useLanguage } from '../../contexts/LanguageContext';

const NotificationsScreen = ({ navigation }) => {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  const loadNotifications = useCallback(async (pageNum = 1, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else if (pageNum === 1) setIsLoading(true);

    const result = await apiService.getNotifications(pageNum, 15);
    if (result.success) {
      const paginator = result.data;
      const items = paginator?.data ?? [];
      const currentPage = paginator?.current_page ?? pageNum;
      const lastPage = paginator?.last_page ?? pageNum;

      setNotifications(prev => (pageNum === 1 || isRefresh ? items : [...prev, ...items]));
      setHasMore(currentPage < lastPage);
      setPage(currentPage);
    }
    
    setIsLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadNotifications(1);
  }, [loadNotifications]);

  const onRefresh = () => loadNotifications(1, true);

  const onLoadMore = () => {
    if (hasMore && !isLoading && !refreshing) {
      loadNotifications(page + 1);
    }
  };

  const handleMarkAllRead = async () => {
    const result = await apiService.markAllNotificationsAsRead();
    if (result.success) {
      setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
      Alert.alert('Success', 'All notifications marked as read.');
    }
  };

  const handleNotificationPress = async (notification) => {
    // Mark as read in background/state
    if (!notification.read_at) {
      apiService.markNotificationAsRead(notification.id);
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, read_at: new Date().toISOString() } : n)
      );
    }

    const payload = typeof notification.data === 'string' 
      ? JSON.parse(notification.data) 
      : (notification.data ?? {});

    // Action routing
    if (notification.type === 'new_follower' && payload.user_id) {
      navigation.navigate('UserProfile', { userId: payload.user_id });
    } else if ((notification.type === 'story_liked' || notification.type === 'story_commented' || notification.type === 'comment_replied') && payload.story_id) {
      setIsProcessingAction(true);
      const res = await apiService.getStory(payload.story_id);
      setIsProcessingAction(false);
      
      if (res.success && res.data?.data?.story) {
        navigation.navigate('StoryPreviewScreenReader', { story: res.data.data.story });
      } else {
        Alert.alert('Unavailable', 'This story is no longer available.');
      }
    }
  };

  const handleDeleteNotification = (id) => {
    Alert.alert('Delete Notification', 'Are you sure you want to delete this notification?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive', 
        onPress: async () => {
          const result = await apiService.deleteNotification(id);
          if (result.success) {
            setNotifications(prev => prev.filter(n => n.id !== id));
          }
        }
      }
    ]);
  };

  const getNotificationIconDetails = (type) => {
    switch (type) {
      case 'story_liked':
        return { name: 'heart', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)' };
      case 'new_follower':
        return { name: 'user-plus', color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' };
      case 'story_commented':
      case 'comment_replied':
        return { name: 'message-square', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)' };
      default:
        return { name: 'bell', color: '#A855F7', bg: 'rgba(168, 85, 247, 0.1)' };
    }
  };

  const renderItem = ({ item }) => {
    const iconDetails = getNotificationIconDetails(item.type);
    const sender = item.sender;
    const avatarUri = sender?.profile_image ? { uri: BASE_URL + sender.profile_image } : null;
    const isUnread = !item.read_at;

    return (
      <TouchableOpacity
        style={[styles.notificationCard, isUnread && styles.unreadCard]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.8}
      >
        {/* Unread indicator dot */}
        {isUnread && <View style={styles.unreadDot} />}

        {/* Sender Avatar */}
        <View style={styles.avatarContainer}>
          {avatarUri ? (
            <Image source={avatarUri} style={styles.avatar} />
          ) : (
            <LinearGradient colors={['#A855F7', '#7C3AED']} style={styles.avatar}>
              <Text style={styles.avatarText}>
                {sender?.name?.[0]?.toUpperCase() ?? '?'}
              </Text>
            </LinearGradient>
          )}
          {/* Subtle overlay icon for notification type */}
          <View style={[styles.typeOverlay, { backgroundColor: iconDetails.color }]}>
            <Feather name={iconDetails.name} size={8} color="#fff" />
          </View>
        </View>

        {/* Body content */}
        <View style={styles.body}>
          <Text style={[styles.title, isUnread && styles.unreadText]}>
            {item.title}
          </Text>
          <Text style={styles.content}>
            {item.content}
          </Text>
          <Text style={styles.time}>
            {new Date(item.created_at).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        {/* Delete button */}
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDeleteNotification(item.id)}
        >
          <Feather name="trash-2" size={14} color="rgba(255, 255, 255, 0.25)" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => {
    return (
      <View style={styles.emptyBox}>
        <View style={styles.emptyIconCircle}>
          <Feather name="bell-off" size={32} color="#A855F7" />
        </View>
        <Text style={styles.emptyTitle}>No Notifications Yet</Text>
        <Text style={styles.emptyText}>
          When people like your stories, follow you, or post comments, they'll show up here.
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    return hasMore ? (
      <ActivityIndicator color="#A855F7" style={{ marginVertical: 20 }} />
    ) : null;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={20} color="#C4B5FD" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {notifications.length > 0 ? (
          <TouchableOpacity style={styles.markAllBtn} onPress={handleMarkAllRead}>
            <Feather name="check-all" size={18} color="#A855F7" style={{ marginRight: 2 }} />
            <Text style={styles.markAllText}>Read All</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      {/* Screen Loader for actions */}
      {isProcessingAction && (
        <View style={styles.actionLoader}>
          <ActivityIndicator size="large" color="#A855F7" />
        </View>
      )}

      {/* List */}
      {isLoading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color="#A855F7" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.25}
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
  actionLoader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 10, 30, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },

  // header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(168, 85, 247, 0.12)',
    borderRadius: 14,
  },
  markAllText: {
    color: '#A855F7',
    fontSize: 11,
    fontWeight: '700',
  },

  // list
  listContent: {
    padding: 16,
    flexGrow: 1,
  },

  // card
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#160F2B',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.08)',
    position: 'relative',
  },
  unreadCard: {
    backgroundColor: '#1C1236',
    borderColor: 'rgba(168, 85, 247, 0.25)',
  },
  unreadDot: {
    position: 'absolute',
    top: 18,
    left: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#A855F7',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
  },
  typeOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#160F2B',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // body
  body: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 3,
  },
  unreadText: {
    color: '#fff',
    fontWeight: '700',
  },
  content: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    lineHeight: 19,
  },
  time: {
    color: 'rgba(255, 255, 255, 0.35)',
    fontSize: 11,
  },

  // delete
  deleteBtn: {
    padding: 4,
    justifyContent: 'center',
    alignSelf: 'center',
  },

  // empty state
  emptyBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 100,
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

export default NotificationsScreen;
