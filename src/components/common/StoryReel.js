// src/components/common/StoryReel.js
// Horizontal avatar strip at the top of HomeScreen.
// - Tapping your OWN avatar → opens upload modal (via onAddStory prop)
// - Tapping others → opens viewer (via onSelectGroup prop)
// - Always shows your own "Add Story" bubble even if you have no active stories.

import React, { useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import ApiService from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';
import { BASE_URL } from '../../constants/api';

const AVATAR_SIZE = 62;
const RING_SIZE = AVATAR_SIZE + 6;

/**
 * StoryReel
 * Props:
 *  onSelectGroup(group)  — called when tapping another user's stories
 *  onAddStory()          — called when tapping your own "Add Story" bubble
 */
const StoryReel = forwardRef(({ onSelectGroup, onAddStory }, ref) => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFeed = useCallback(async () => {
    setLoading(true);
    const result = await ApiService.getShortStoriesFeed();
    if (result.success && result.data) {
      setGroups(result.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  // Allow parent to refresh the reel after an upload
  useImperativeHandle(ref, () => ({ refresh: loadFeed }));

  // ── Build the display list ─────────────────────────────────────
  // Always prepend the "Your Story" bubble for the current user.
  // If the user already has stories in the feed, replace that entry with
  // the real group so the ring colour reflects viewed status.
  const ownGroupFromFeed = groups.find((g) => Number(g.user?.id) === Number(user?.id));

  const ownEntry = {
    _isOwn: true,
    user: {
      id: user?.id,
      name: user?.name,
      profile_image: user?.profile_image,
    },
    stories: ownGroupFromFeed?.stories ?? [],
    all_viewed: ownGroupFromFeed?.all_viewed ?? true,
    count: ownGroupFromFeed?.count ?? 0,
  };

  const othersGroups = groups
    .filter((g) => Number(g.user?.id) !== Number(user?.id))
    .sort((a, b) => {
      if (a.all_viewed && !b.all_viewed) return 1;
      if (!a.all_viewed && b.all_viewed) return -1;
      return 0;
    });
  const displayList = [ownEntry, ...othersGroups];

  // ── Render a single avatar ─────────────────────────────────────
  const renderItem = ({ item: group }) => {
    const isOwn = !!group._isOwn;
    const hasStories = group.count > 0;
    const seen = group.all_viewed;

    const avatarUri = group.user?.profile_image
      ? { uri: group.user.profile_image.startsWith('http')
            ? group.user.profile_image
            : BASE_URL + group.user.profile_image }
      : null;

    const handlePress = () => {
      if (isOwn) {
        // If they have stories AND tap the bubble, open viewer for their own stories
        // If no stories, go straight to upload
        if (hasStories) {
          onSelectGroup && onSelectGroup(group);
        } else {
          onAddStory && onAddStory();
        }
      } else {
        onSelectGroup && onSelectGroup(group);
      }
    };

    // Ring colour logic
    const showGradient = isOwn ? false : !seen; // own avatar = dashed purple, others = gradient / grey

    return (
      <TouchableOpacity
        style={[styles.avatarWrapper, !isOwn && seen && styles.avatarWrapperSeen]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        {/* Ring */}
        {isOwn ? (
            // Own: dashed purple border, always
            <View style={[styles.ring, styles.ringOwn]}>
              <View style={styles.avatarInner}>
                <AvatarContent avatarUri={avatarUri} name={group.user?.name} />
              </View>
            </View>
          ) : showGradient ? (
            <LinearGradient
              colors={['#7C3AED', '#EC4899', '#F59E0B']}
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 0 }}
              style={styles.ring}
            >
              <View style={styles.avatarInner}>
                <AvatarContent avatarUri={avatarUri} name={group.user?.name} />
              </View>
            </LinearGradient>
          ) : (
            <View style={[styles.ring, styles.ringViewed]}>
              <View style={styles.avatarInner}>
                <AvatarContent avatarUri={avatarUri} name={group.user?.name} />
              </View>
            </View>
          )}

        {/* "+" badge — always on own bubble */}
        {isOwn && (
          <TouchableOpacity
            style={styles.addBadge}
            onPress={() => onAddStory && onAddStory()}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Feather name="plus" size={14} color="#fff" style={styles.addBadgeIcon} />
          </TouchableOpacity>
        )}

        <Text style={styles.label} numberOfLines={1}>
          {isOwn ? 'Your Story' : group.user?.name?.split(' ')[0] ?? ''}
        </Text>
        {!isOwn && seen && (
          <Text style={styles.seenLabel}>Seen</Text>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingRow}>
        <ActivityIndicator size="small" color="#7C3AED" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={displayList}
        keyExtractor={(item) => String(item.user?.id ?? 'own')}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
});

// ── Small helper ─────────────────────────────────────────────────
const AvatarContent = ({ avatarUri, name }) => {
  if (avatarUri) {
    return <Image source={avatarUri} style={styles.avatar} />;
  }
  return (
    <View style={[styles.avatar, styles.avatarPlaceholder]}>
      <Text style={styles.avatarInitial}>
        {name?.[0]?.toUpperCase() ?? '?'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F0A1E',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#1E1440',
  },
  loadingRow: {
    height: 96,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F0A1E',
  },
  listContent: {
    paddingHorizontal: 14,
    gap: 14,
  },
  avatarWrapper: {
    alignItems: 'center',
    width: RING_SIZE + 8,
    position: 'relative',
  },
  ring: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringOwn: {
    borderWidth: 2,
    borderColor: '#7C3AED',
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
  },
  ringViewed: {
    backgroundColor: '#3A3A5C',
  },
  avatarInner: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 2,
    borderColor: '#0F0A1E',
    overflow: 'hidden',
    backgroundColor: '#1E1440',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2D1B69',
  },
  avatarInitial: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  addBadge: {
    position: 'absolute',
    bottom: 18,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0F0A1E',
  },
  addBadgeIcon: {
    marginTop: Platform.OS === 'ios' ? 0 : 0,
    marginLeft: Platform.OS === 'ios' ? 0 : 0,
  },
  label: {
    color: '#C4B5FD',
    fontSize: 11,
    marginTop: 4,
    maxWidth: RING_SIZE + 8,
    textAlign: 'center',
  },
  // Dimmed wrapper for already-seen story groups
  avatarWrapperSeen: {
    opacity: 0.45,
  },
  // Tiny 'Seen' indicator below the name
  seenLabel: {
    color: 'rgba(196,181,253,0.55)',
    fontSize: 9,
    marginTop: 1,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});

export default StoryReel;
