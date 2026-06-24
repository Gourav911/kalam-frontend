// src/components/common/StoryViewersModal.js
// Instagram-style bottom-sheet modal showing viewers & likes with profile links.

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import ApiService from '../../services/apiService';
import { BASE_URL } from '../../constants/api';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_H * 0.55;

const TABS = [
  { key: 'viewers', label: 'Viewers',  icon: '👁' },
  { key: 'likes',   label: 'Likes',    icon: '❤️' },
];

const StoryViewersModal = ({ visible, storyId, onClose, navigation, onNavigateToProfile }) => {
  const [activeTab, setActiveTab] = useState('viewers');
  const [viewers, setViewers]     = useState([]);
  const [likers, setLikers]       = useState([]);
  const [loading, setLoading]     = useState(false);

  const fetchData = useCallback(async () => {
    if (!storyId) return;
    setLoading(true);
    try {
      const [viewersRes, likersRes] = await Promise.all([
        ApiService.getShortStoryViewers(storyId),
        ApiService.getShortStoryLikers(storyId),
      ]);
      if (viewersRes.success) setViewers(viewersRes.data?.data ?? []);
      if (likersRes.success)  setLikers(likersRes.data?.data ?? []);
    } catch (e) {
      console.error('StoryViewersModal fetch error:', e);
    }
    setLoading(false);
  }, [storyId]);

  useEffect(() => {
    if (visible && storyId) {
      fetchData();
    } else {
      setViewers([]);
      setLikers([]);
      setActiveTab('viewers');
    }
  }, [visible, storyId]);

  const handleProfilePress = (userId) => {
    if (onNavigateToProfile) {
      onNavigateToProfile(userId);
    } else if (navigation) {
      onClose?.();
      setTimeout(() => {
        navigation.navigate('UserProfile', { userId });
      }, 200);
    }
  };

  const getAvatarSource = (profileImage) => {
    if (!profileImage) return null;
    return { uri: profileImage.startsWith('http') ? profileImage : BASE_URL + profileImage };
  };

  const activeList = activeTab === 'viewers' ? viewers : likers;

  const renderUserRow = ({ item }) => {
    const avatarSrc = getAvatarSource(item.profile_image);
    const timeText = activeTab === 'viewers'
      ? formatRelativeTime(item.viewed_at)
      : formatRelativeTime(item.liked_at);

    return (
      <TouchableOpacity
        style={styles.userRow}
        onPress={() => handleProfilePress(item.id)}
        activeOpacity={0.7}
      >
        {avatarSrc ? (
          <Image source={avatarSrc} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.avatarInitial}>
              {item.name?.[0]?.toUpperCase() ?? '?'}
            </Text>
          </View>
        )}
        <View style={styles.userInfo}>
          <Text style={styles.userName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.timeText}>{timeText}</Text>
        </View>
        <Text style={styles.arrowIcon}>›</Text>
      </TouchableOpacity>
    );
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <View />
      </TouchableOpacity>

      <View style={styles.sheet}>
        {/* Handle bar */}
        <View style={styles.handleBar} />

        {/* Tabs */}
        <View style={styles.tabRow}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
                {tab.label}
              </Text>
              <View style={[styles.tabBadge, activeTab === tab.key && styles.tabBadgeActive]}>
                <Text style={[styles.tabBadgeText, activeTab === tab.key && styles.tabBadgeTextActive]}>
                  {tab.key === 'viewers' ? viewers.length : likers.length}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* List */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color="#7C3AED" size="large" />
          </View>
        ) : activeList.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyIcon}>{activeTab === 'viewers' ? '👁' : '❤️'}</Text>
            <Text style={styles.emptyText}>
              {activeTab === 'viewers' ? 'No viewers yet' : 'No likes yet'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={activeList}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderUserRow}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </Modal>
  );
};

// ─── helpers ──────────────────────────────────────────────────────────────────
function formatRelativeTime(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: MODAL_HEIGHT,
    backgroundColor: '#1A1A2E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  handleBar: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginTop: 10,
    marginBottom: 12,
  },
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 16,
    marginBottom: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#7C3AED',
  },
  tabIcon: {
    fontSize: 14,
  },
  tabLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: '#fff',
  },
  tabBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  tabBadgeActive: {
    backgroundColor: '#7C3AED',
  },
  tabBadgeText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '700',
  },
  tabBadgeTextActive: {
    color: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  emptyIcon: {
    fontSize: 36,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  avatarFallback: {
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
    gap: 3,
  },
  userName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  timeText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
  },
  arrowIcon: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 22,
    fontWeight: '300',
    marginLeft: 8,
  },
});

export default StoryViewersModal;
