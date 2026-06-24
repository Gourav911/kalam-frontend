// src/components/common/ShortStoryViewer.js
// Full-screen tap-to-advance story viewer modal (Instagram/WhatsApp style).
// Receives a `group` prop: { user, stories: [...], all_viewed }

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  Image,
  TouchableWithoutFeedback,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import ApiService from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';
import { BASE_URL } from '../../constants/api';
import StoryViewersModal from './StoryViewersModal';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const STORY_DURATION = 5000; // ms per story

const ShortStoryViewer = ({ visible, group, onClose, navigation, onStoryDeleted }) => {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused]         = useState(false);  // UI indicator
  const progressAnim   = useRef(new Animated.Value(0)).current;
  const progressRef    = useRef(null);   // current Animated.timing instance
  const isPausedRef    = useRef(false);  // sync ref (avoids stale closure)
  const startTimeRef   = useRef(0);     // when the current segment started
  const elapsedRef     = useRef(0);     // ms already consumed before pause

  // Like state
  const [liked, setLiked]           = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const heartScale = useRef(new Animated.Value(0)).current;
  const heartOpacity = useRef(new Animated.Value(0)).current;
  const likeScale = useRef(new Animated.Value(1)).current;
  const lastTapRef = useRef(0);

  // Viewers modal
  const [showViewers, setShowViewers] = useState(false);

  const stories = group?.stories ?? [];
  const currentStory = stories[currentIndex];
  const isOwner = Number(group?.user?.id) === Number(user?.id);

  // ── sync like state when story changes ─────────────────────────
  useEffect(() => {
    if (currentStory) {
      setLiked(!!currentStory.has_liked);
      setLikesCount(currentStory.likes_count ?? 0);
    }
  }, [currentIndex, currentStory?.id]);

  // ── mark story viewed (only for other users' stories, not own) ──
  const markViewed = useCallback(async (storyId) => {
    if (isOwner) return;
    await ApiService.viewShortStory(storyId);
  }, [isOwner]);

  // ── start (or resume) the progress bar ───────────────────────
  const startProgress = useCallback((fromElapsed = 0) => {
    const remaining = STORY_DURATION - fromElapsed;
    progressAnim.setValue(fromElapsed / STORY_DURATION);

    startTimeRef.current = Date.now();
    progressRef.current = Animated.timing(progressAnim, {
      toValue:         1,
      duration:        remaining,
      useNativeDriver: false,
    });
    progressRef.current.start(({ finished }) => {
      if (finished && !isPausedRef.current) {
        elapsedRef.current = 0;
        goNext();
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, progressAnim]);

  useEffect(() => {
    if (!visible || !currentStory) return;
    elapsedRef.current = 0;
    isPausedRef.current = false;
    setIsPaused(false);
    markViewed(currentStory.id);
    startProgress(0);
    return () => {
      progressRef.current?.stop();
    };
  }, [visible, currentIndex]);

  // ── navigation ─────────────────────────────────────────────────
  const goNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      handleClose();
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  const handleClose = () => {
    progressRef.current?.stop();
    setCurrentIndex(0);
    onClose && onClose();
  };

  const handleViewAuthorProfile = () => {
    if (!navigation || !group?.user?.id) return;
    handleClose();
    setTimeout(() => {
      navigation.navigate('UserProfile', { userId: group.user.id });
    }, 150);
  };

  const handleLongPress = () => {
    if (isPausedRef.current) return;
    isPausedRef.current = true;
    setIsPaused(true);
    elapsedRef.current += Date.now() - startTimeRef.current;
    progressRef.current?.stop();
  };

  const handlePressOut = () => {
    if (!isPausedRef.current) return;
    isPausedRef.current = false;
    setIsPaused(false);
    startProgress(elapsedRef.current);
  };

  // ── Like / Double-tap ──────────────────────────────────────────
  const animateHeart = () => {
    heartScale.setValue(0);
    heartOpacity.setValue(1);
    Animated.sequence([
      Animated.spring(heartScale, {
        toValue: 1,
        friction: 3,
        tension: 150,
        useNativeDriver: true,
      }),
      Animated.timing(heartOpacity, {
        toValue: 0,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const toggleLike = useCallback(async () => {
    if (!currentStory) return;
    // Optimistic update
    const willLike = !liked;
    setLiked(willLike);
    setLikesCount(prev => willLike ? prev + 1 : Math.max(0, prev - 1));

    // Animate the bottom-right heart button
    Animated.sequence([
      Animated.timing(likeScale, { toValue: 1.4, duration: 100, useNativeDriver: true }),
      Animated.spring(likeScale, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();

    const res = await ApiService.toggleShortStoryLike(currentStory.id);
    if (res.success) {
      setLiked(res.data.has_liked);
      setLikesCount(res.data.likes_count);
    } else {
      // Revert on failure
      setLiked(!willLike);
      setLikesCount(prev => willLike ? Math.max(0, prev - 1) : prev + 1);
    }
  }, [currentStory, liked]);

  const handleTap = (e) => {
    const now = Date.now();
    const x = e.nativeEvent.locationX;

    // Double-tap detection
    if (now - lastTapRef.current < 300) {
      // Double tap → like (only if not already liked)
      if (!liked) {
        toggleLike();
      }
      animateHeart();
      lastTapRef.current = 0;
      return;
    }

    lastTapRef.current = now;

    // Single tap → navigate (with short delay to check for double-tap)
    setTimeout(() => {
      if (lastTapRef.current !== now) return; // was consumed by double-tap
      if (x < SCREEN_W / 3) {
        goPrev();
      } else {
        goNext();
      }
    }, 300);
  };

  // ── Delete story ───────────────────────────────────────────────
  const handleDelete = () => {
    // Pause progress while the alert is showing
    isPausedRef.current = true;
    setIsPaused(true);
    elapsedRef.current += Date.now() - startTimeRef.current;
    progressRef.current?.stop();

    Alert.alert(
      'Delete Story',
      'Are you sure you want to delete this story? This cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            // Resume progress
            isPausedRef.current = false;
            setIsPaused(false);
            startProgress(elapsedRef.current);
          },
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const res = await ApiService.deleteShortStory(currentStory.id);
            if (res.success) {
              onStoryDeleted && onStoryDeleted(currentStory.id);
              // If there are more stories, go to next, else close
              if (stories.length > 1) {
                if (currentIndex >= stories.length - 1) {
                  setCurrentIndex(prev => Math.max(0, prev - 1));
                }
                // Parent should refresh stories array
              } else {
                handleClose();
              }
            } else {
              Alert.alert('Error', 'Failed to delete story. Please try again.');
              // Resume progress
              isPausedRef.current = false;
              setIsPaused(false);
              startProgress(elapsedRef.current);
            }
          },
        },
      ]
    );
  };

  // ── Viewers modal handlers ─────────────────────────────────────
  const openViewers = () => {
    isPausedRef.current = true;
    setIsPaused(true);
    elapsedRef.current += Date.now() - startTimeRef.current;
    progressRef.current?.stop();
    setShowViewers(true);
  };

  const closeViewers = () => {
    setShowViewers(false);
    isPausedRef.current = false;
    setIsPaused(false);
    startProgress(elapsedRef.current);
  };

  const handleViewerProfileNav = (userId) => {
    setShowViewers(false);
    handleClose();
    setTimeout(() => {
      navigation?.navigate('UserProfile', { userId });
    }, 200);
  };

  if (!visible || !group) return null;

  const bgStyle = currentStory?.media_type === 'text'
    ? { backgroundColor: currentStory.bg_color || '#2D1B69' }
    : { backgroundColor: '#000' };

  const avatarUri = group.user?.profile_image
    ? { uri: group.user.profile_image.startsWith('http')
          ? group.user.profile_image
          : BASE_URL + group.user.profile_image }
    : null;

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <StatusBar hidden />
      <View style={[styles.container, bgStyle]}>

        {/* Media */}
        {currentStory?.media_type === 'image' && currentStory.media_full_url ? (
          <Image
            source={{ uri: currentStory.media_full_url }}
            style={styles.media}
            resizeMode="contain"
          />
        ) : null}

        {/* Overlay for tap areas */}
        <TouchableWithoutFeedback
          onPress={handleTap}
          onLongPress={handleLongPress}
          onPressOut={handlePressOut}
          delayLongPress={200}
        >
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>

        {/* Double-tap heart animation (centered) */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.doubleTapHeart,
            {
              transform: [{ scale: heartScale }],
              opacity: heartOpacity,
            },
          ]}
        >
          <Text style={styles.doubleTapHeartIcon}>❤️</Text>
        </Animated.View>

        {/* Progress bars */}
        <SafeAreaView style={styles.safeTop}>
          <View style={styles.progressRow}>
            {stories.map((_, idx) => (
              <View key={idx} style={styles.progressTrack}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width:
                        idx < currentIndex
                          ? '100%'
                          : idx === currentIndex
                          ? progressAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0%', '100%'],
                            })
                          : '0%',
                    },
                  ]}
                />
              </View>
            ))}
          </View>

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.userInfo}
              onPress={handleViewAuthorProfile}
              activeOpacity={0.8}
            >
              {avatarUri ? (
                <Image source={avatarUri} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback]}>
                  <Text style={styles.avatarInitial}>
                    {group.user?.name?.[0]?.toUpperCase() ?? '?'}
                  </Text>
                </View>
              )}
              <View style={styles.userMeta}>
                <Text style={styles.userName}>{group.user?.name ?? ''}</Text>
                <Text style={styles.storyTime}>
                  {currentStory?.created_at
                    ? formatRelativeTime(currentStory.created_at)
                    : ''}
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.headerActions}>
              {/* Delete button — owner only */}
              {isOwner && (
                <TouchableOpacity
                  onPress={handleDelete}
                  style={styles.headerBtn}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Text style={styles.deleteIcon}>🗑</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={handleClose}
                style={styles.headerBtn}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>

        {/* Caption */}
        {currentStory?.caption ? (
          <View style={[
            styles.captionContainer,
            currentStory?.media_type === 'text' && styles.captionContainerCenter,
          ]}>
            <Text style={[
              styles.captionText,
              currentStory?.media_type === 'text' && styles.captionTextCenter,
            ]}>
              {currentStory.caption}
            </Text>
          </View>
        ) : null}

        {/* ── Bottom bar: Like (right) + Viewers (left, owner only) ── */}
        <SafeAreaView style={styles.safeBottom}>
          <View style={styles.bottomBar}>
            {/* Viewers — owner only */}
            {isOwner ? (
              <TouchableOpacity
                style={styles.viewersBtn}
                onPress={openViewers}
                activeOpacity={0.7}
              >
                <Text style={styles.viewersIcon}>👁</Text>
                <Text style={styles.viewersText}>
                  {currentStory?.views_count ?? 0}
                </Text>
              </TouchableOpacity>
            ) : (
              <View />
            )}

            {/* Like button */}
            <TouchableOpacity
              onPress={toggleLike}
              activeOpacity={0.7}
              style={styles.likeBtn}
            >
              <Animated.Text
                style={[
                  styles.likeIcon,
                  { transform: [{ scale: likeScale }] },
                ]}
              >
                {liked ? '❤️' : '🤍'}
              </Animated.Text>
              {likesCount > 0 && (
                <Text style={styles.likeCount}>{likesCount}</Text>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* Viewers Modal (owner only) */}
        <StoryViewersModal
          visible={showViewers}
          storyId={currentStory?.id}
          onClose={closeViewers}
          navigation={navigation}
          onNavigateToProfile={handleViewerProfileNav}
        />
      </View>
    </Modal>
  );
};

// ─── helpers ──────────────────────────────────────────────────────────────────
function formatRelativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: SCREEN_W,
    height: SCREEN_H,
  },
  media: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  safeTop: {
    position: 'absolute',
    top: Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 44,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 10,
  },
  progressTrack: {
    flex: 1,
    height: 2.5,
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  avatarFallback: {
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  userMeta: {
    gap: 2,
  },
  userName: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  storyTime: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerBtn: {
    padding: 6,
  },
  deleteIcon: {
    fontSize: 16,
  },
  closeIcon: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  captionContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  captionContainerCenter: {
    bottom: 0,
    top: 0,
    justifyContent: 'center',
  },
  captionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  captionTextCenter: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 34,
  },
  // ── Double-tap heart ──
  doubleTapHeart: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -40,
    marginTop: -40,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doubleTapHeartIcon: {
    fontSize: 70,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  // ── Bottom bar ──
  safeBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  viewersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  viewersIcon: {
    fontSize: 16,
  },
  viewersText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  likeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  likeIcon: {
    fontSize: 22,
  },
  likeCount: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default ShortStoryViewer;
