// screens/writer/WriterDashboardScreen.js
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import apiService from '../../services/apiService';
import { useLanguage } from '../../contexts/LanguageContext';
import MyStoriesScreen from './MyStoriesScreen';

const WriterDashboardScreen = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState({
    totalStories: 0,
    totalViews: 0,
    totalLikes: 0,
    followers: 0,
  });

  const fetchUnreadCount = async () => {
    try {
      const result = await apiService.getUnreadNotificationsCount();
      if (result.success) {
        setUnreadCount(result.data?.count ?? 0);
      }
    } catch (e) {
      console.error("fetchUnreadCount error:", e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUnreadCount();
    }, [])
  );

  const loadStats = useCallback(async () => {
    if (!user?.id) return;
    const result = await apiService.getUserProfile(user.id);
    if (result.success) {
      setStats({
        totalStories: result.data.stories_count ?? 0,
        totalViews: result.data.total_views ?? 0,
        totalLikes: result.data.total_likes ?? 0,
        followers: result.data.followers_count ?? 0,
      });
    }
  }, [user?.id]);

  useEffect(() => { loadStats(); }, [loadStats]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    await fetchUnreadCount();
    setRefreshing(false);
  };

  const STAT_CARDS = [
    { 
      key: 'stories', 
      label: t('stories') || 'Stories', 
      value: stats.totalStories, 
      iconName: 'book-open', 
      iconColor: '#C084FC' 
    },
    { 
      key: 'views', 
      label: t('views') || 'Views', 
      value: stats.totalViews, 
      iconName: 'eye', 
      iconColor: '#60A5FA' 
    },
    { 
      key: 'likes', 
      label: t('likes') || 'Likes', 
      value: stats.totalLikes, 
      iconName: 'heart', 
      iconColor: '#F87171' 
    },
    { 
      key: 'followers', 
      label: t('followers') || 'Followers', 
      value: stats.followers, 
      iconName: 'users', 
      iconColor: '#34D399',
      onPress: () => navigation.navigate('FollowersList', { userId: user.id, type: 'followers' })
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#A855F7"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ─────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <LinearGradient colors={['#A855F7', '#7C3AED']} style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.[0]?.toUpperCase() ?? 'W'}
              </Text>
            </LinearGradient>
            <View style={styles.headerTextContainer}>
              <Text style={styles.greeting} numberOfLines={1}>
                {t('writerWelcome') ?? 'Welcome back'},
              </Text>
              <Text style={styles.username} numberOfLines={1}>
                {user?.name ?? 'Writer'}
              </Text>
            </View>
          </View>
          
          <View style={styles.headerRightActions}>
            <TouchableOpacity
              style={styles.bellBtn}
              onPress={() => navigation.navigate('Notifications')}
              activeOpacity={0.75}
            >
              <Feather name="bell" size={20} color="#C4B5FD" />
              {unreadCount > 0 && (
                <View style={styles.bellBadge}>
                  <Text style={styles.bellBadgeText}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.ctaBtn}
              onPress={() => navigation.navigate('CreateEditStory')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#7C3AED', '#A855F7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaGradient}
              >
                <Feather name="plus" size={14} color="#fff" style={styles.ctaIcon} />
                <Text style={styles.ctaText}>{t('newStory') || 'New'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Stats Hub Panel ────────────────────────────── */}
        <View style={styles.statsContainer}>
          <LinearGradient
            colors={['#1E1236', '#100725']}
            style={styles.statsCard}
          >
            {STAT_CARDS.map((s, index) => {
              const ColumnComponent = s.onPress ? TouchableOpacity : View;
              return (
                <React.Fragment key={s.key}>
                  {index > 0 && <View style={styles.divider} />}
                  <ColumnComponent
                    style={styles.statCol}
                    onPress={s.onPress}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.iconWrapper, { backgroundColor: s.iconColor + '12' }]}>
                      <Feather name={s.iconName} size={15} color={s.iconColor} />
                    </View>
                    <Text style={styles.statValue}>{s.value}</Text>
                    <Text style={styles.statLabel} numberOfLines={1}>{s.label}</Text>
                    
                    {s.onPress && (
                      <View style={styles.interactiveIndicator}>
                        <Feather name="chevron-right" size={10} color="#34D399" />
                      </View>
                    )}
                  </ColumnComponent>
                </React.Fragment>
              );
            })}
          </LinearGradient>
        </View>

        {/* ── Section label ──────────────────────────────── */}
        <Text style={styles.sectionLabel}>{t('myStories') || 'My Stories'}</Text>

        {/* ── Stories list (inline component) ───────────── */}
        <MyStoriesScreen navigation={navigation} isInline={true} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default WriterDashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0A1E',
  },
  scrollContent: {
    paddingBottom: 48,
  },

  // header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#A855F7',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  headerTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  greeting: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.45)',
    fontWeight: '500',
  },
  username: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
    marginTop: 2,
  },
  ctaBtn: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  ctaIcon: {
    marginRight: 4,
  },
  ctaText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bellBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(124, 58, 237, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bellBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  bellBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },

  // Stats Hub Panel
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 26,
  },
  statsCard: {
    flexDirection: 'row',
    borderRadius: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.15)',
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 4,
  },
  divider: {
    width: 1,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    height: '70%',
    alignSelf: 'center',
  },
  iconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.45)',
    marginTop: 3,
    fontWeight: '600',
  },
  interactiveIndicator: {
    position: 'absolute',
    top: 2,
    right: 4,
  },

  // section label
  sectionLabel: {
    color: '#A855F7',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginLeft: 20,
    marginBottom: 8,
    marginTop: 8,
  },
});
