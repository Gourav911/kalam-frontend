// screens/reader/StoryPreviewScreenReader.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Image, ActivityIndicator, StatusBar, Dimensions, Modal,
  KeyboardAvoidingView, Platform, TextInput, FlatList,
  Animated, Keyboard,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import apiService from '../../services/apiService';
import { BASE_URL } from '../../constants/api';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const COVER_H = SCREEN_H * 0.42;

// ─────────────────────────────────────────────────────────────
// Inline Comments Bottom Sheet
// ─────────────────────────────────────────────────────────────
const CommentsSheet = ({ visible, storyId, onClose, user, navigation }) => {
  const [comments, setComments]       = useState([]);
  const [loading, setLoading]         = useState(false);
  const [text, setText]               = useState('');
  const [replyTo, setReplyTo]         = useState(null);
  const [submitting, setSubmitting]   = useState(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_H)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) {
      loadComments();
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_H,
        duration: 260,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const loadComments = async () => {
    setLoading(true);
    const result = await apiService.getComments(storyId);
    if (result.success) setComments(result.data?.data ?? result.data ?? []);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    const result = await apiService.addComment(storyId, text.trim(), replyTo?.id ?? null);
    setSubmitting(false);
    if (result.success) {
      setText('');
      setReplyTo(null);
      Keyboard.dismiss();
      loadComments();
    }
  };

  const renderComment = ({ item }) => {
    const commentUserId = item.user_id || item.user?.id;
    return (
      <View style={cs.commentRow}>
        <TouchableOpacity
          onPress={() => {
            if (commentUserId && navigation) {
              onClose && onClose();
              navigation.navigate('UserProfile', { userId: commentUserId });
            }
          }}
          activeOpacity={0.75}
        >
          {item.user?.profile_image ? (
            <Image
              source={{ uri: BASE_URL + item.user.profile_image }}
              style={cs.avatar}
            />
          ) : (
            <LinearGradient colors={['#A855F7', '#7C3AED']} style={cs.avatar}>
              <Text style={cs.avatarText}>{item.user?.name?.[0]?.toUpperCase() ?? '?'}</Text>
            </LinearGradient>
          )}
        </TouchableOpacity>
        <View style={cs.bubble}>
          <View style={cs.bubbleHeader}>
            <TouchableOpacity
              onPress={() => {
                if (commentUserId && navigation) {
                  onClose && onClose();
                  navigation.navigate('UserProfile', { userId: commentUserId });
                }
              }}
              activeOpacity={0.75}
            >
              <Text style={cs.uname}>{item.user?.name ?? 'User'}</Text>
            </TouchableOpacity>
            <Text style={cs.ts}>
              {new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </Text>
          </View>
          <Text style={cs.content}>{item.content}</Text>
          <TouchableOpacity onPress={() => setReplyTo(item)}>
            <Text style={cs.replyBtn}>↩ Reply</Text>
          </TouchableOpacity>
          {item.replies?.map(r => {
            const replyUserId = r.user_id || r.user?.id;
            return (
              <View key={r.id} style={cs.replyRow}>
                <TouchableOpacity
                  onPress={() => {
                    if (replyUserId && navigation) {
                      onClose && onClose();
                      navigation.navigate('UserProfile', { userId: replyUserId });
                    }
                  }}
                  activeOpacity={0.75}
                >
                  {r.user?.profile_image ? (
                    <Image
                      source={{ uri: BASE_URL + r.user.profile_image }}
                      style={cs.avatarSm}
                    />
                  ) : (
                    <LinearGradient colors={['#9333EA', '#6D28D9']} style={cs.avatarSm}>
                      <Text style={cs.avatarTextSm}>{r.user?.name?.[0]?.toUpperCase() ?? '?'}</Text>
                    </LinearGradient>
                  )}
                </TouchableOpacity>
                <View style={cs.bubbleSm}>
                  <TouchableOpacity
                    onPress={() => {
                      if (replyUserId && navigation) {
                        onClose && onClose();
                        navigation.navigate('UserProfile', { userId: replyUserId });
                      }
                    }}
                    activeOpacity={0.75}
                  >
                    <Text style={cs.uname}>{r.user?.name}</Text>
                  </TouchableOpacity>
                  <Text style={cs.content}>{r.content}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      {/* Backdrop */}
      <TouchableOpacity style={cs.backdrop} activeOpacity={1} onPress={onClose} />

      <Animated.View style={[cs.sheet, { transform: [{ translateY: slideAnim }] }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
          keyboardVerticalOffset={0}
        >
          {/* Handle + title */}
          <View style={cs.sheetHeader}>
            <View style={cs.handle} />
            <Text style={cs.sheetTitle}>💬 Comments</Text>
            <TouchableOpacity onPress={onClose} style={cs.closeBtn}>
              <Text style={cs.closeTxt}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* List */}
          {loading ? (
            <View style={cs.loadingBox}>
              <ActivityIndicator color="#A855F7" />
            </View>
          ) : (
            <FlatList
              data={comments}
              renderItem={renderComment}
              keyExtractor={item => item.id.toString()}
              contentContainerStyle={{ padding: 16, flexGrow: 1 }}
              ListEmptyComponent={
                <View style={cs.emptyBox}>
                  <Text style={cs.emptyEmoji}>💬</Text>
                  <Text style={cs.emptyText}>Be first to comment!</Text>
                </View>
              }
              showsVerticalScrollIndicator={false}
            />
          )}

          {/* Reply banner */}
          {replyTo && (
            <View style={cs.replyBanner}>
              <Text style={cs.replyBannerTxt}>↩ Replying to {replyTo.user?.name}</Text>
              <TouchableOpacity onPress={() => setReplyTo(null)}>
                <Text style={cs.replyBannerClose}>✕</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Input */}
          <View style={[cs.inputRow, { paddingBottom: insets.bottom + 8 }]}>
            <TextInput
              style={cs.input}
              placeholder={replyTo ? 'Write a reply…' : 'Add a comment…'}
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={text}
              onChangeText={setText}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              style={[cs.sendBtn, (!text.trim() || submitting) && { opacity: 0.4 }]}
              onPress={handleSubmit}
              disabled={!text.trim() || submitting}
            >
              {submitting
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={cs.sendTxt}>↑</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
};

// ─────────────────────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────────────────────
const StoryPreviewScreenReader = ({ route, navigation }) => {
  const { story } = route.params;
  const { user }  = useAuth();
  const { t }     = useLanguage();
  const insets    = useSafeAreaInsets();

  const [storyDetails, setStoryDetails] = useState(null);
  const [isLoading, setIsLoading]       = useState(true);
  const [paragraphs, setParagraphs]     = useState([]);
  const [hasLiked, setHasLiked]         = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);

  useEffect(() => {
    loadStoryDetails();
    apiService.trackStoryView(story.id).catch(() => {});
  }, []);

  const loadStoryDetails = async () => {
    setIsLoading(true);
    const result = await apiService.getStory(story.id);
    if (result.success) {
      const d = result.data.data;
      setStoryDetails(d);
      const content = d.story?.content ?? '';
      setParagraphs(content.split('\n\n').filter(p => p.trim()));
      setHasLiked(d.has_liked ?? false);
    }
    setIsLoading(false);
  };

  const handleLike = async () => {
    const result = hasLiked
      ? await apiService.unlikeStory(story.id)
      : await apiService.likeStory(story.id);
    if (result.success) {
      setHasLiked(p => !p);
      setStoryDetails(prev => ({
        ...prev,
        story: {
          ...prev.story,
          likes_count: hasLiked
            ? (prev.story.likes_count ?? 1) - 1
            : (prev.story.likes_count ?? 0) + 1,
        },
      }));
    }
  };

  const handleReadFull = () =>
    navigation.navigate('StoryReader', { story: storyDetails, isUnlocked: true });

  if (isLoading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#A855F7" />
        <Text style={styles.loadingText}>Loading story…</Text>
      </View>
    );
  }

  const s          = storyDetails?.story ?? story;
  const author     = s?.author ?? {};
  const category   = s?.category ?? {};
  const coverUri   = s?.cover_image ? BASE_URL + s.cover_image : null;
  const preview    = paragraphs.slice(0, 3);
  const readTime   = s?.reading_time ?? Math.ceil(paragraphs.length * 0.5);
  const commCount  = s?.comments_count ?? 0;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} bounces={false}>
        {/* ── Hero ── */}
        <View style={[styles.hero, { height: COVER_H }]}>
          {coverUri
            ? <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={0.9} onPress={() => setIsImageViewerVisible(true)}><Image source={{ uri: coverUri }} style={styles.heroImg} resizeMode="cover" /></TouchableOpacity>
            : <LinearGradient colors={['#4C1D95', '#2D1B69', '#0F0A1E']} style={styles.heroImg} />}
          <LinearGradient
            colors={['transparent', 'rgba(15,10,30,0.7)', '#0F0A1E']}
            style={styles.heroFade}
            pointerEvents="none"
          />
          <SafeAreaView style={styles.backArea} edges={['top']}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
              <Feather name="chevron-left" size={26} color="#fff" style={{ marginLeft: -2 }} />
            </TouchableOpacity>
          </SafeAreaView>
          {category?.name && (
            <View style={[styles.catPill, { backgroundColor: category.color ?? '#7C3AED' }]}>
              <Text style={styles.catText}>{t(category.slug) || category.name}</Text>
            </View>
          )}
        </View>

        {/* ── Info ── */}
        <View style={styles.infoCard}>
          <Text style={styles.title}>{s?.title ?? ''}</Text>

          {/* Author row */}
          <TouchableOpacity
            style={styles.authorRow}
            onPress={() => author?.id && navigation.navigate('UserProfile', { userId: author.id })}
            activeOpacity={0.75}
          >
            {author?.profile_image ? (
              <Image source={{ uri: BASE_URL + author.profile_image }} style={styles.authorAvatar} />
            ) : (
              <LinearGradient colors={['#A855F7', '#7C3AED']} style={styles.authorAvatar}>
                <Text style={styles.authorInitial}>{author?.name?.[0]?.toUpperCase() ?? '?'}</Text>
              </LinearGradient>
            )}
            <View>
              <Text style={styles.authorName}>{author?.name ?? 'Unknown'}</Text>
              <Text style={styles.authorSub}>Tap to view profile →</Text>
            </View>
          </TouchableOpacity>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <TouchableOpacity style={styles.statChip} onPress={handleLike} activeOpacity={0.75}>
              <Text style={styles.statIcon}>{hasLiked ? '❤️' : '🤍'}</Text>
              <Text style={[styles.statValue, hasLiked && styles.statLiked]}>
                {s?.likes_count ?? 0}
              </Text>
            </TouchableOpacity>
            <View style={styles.statChip}>
              <Text style={styles.statIcon}>👁️</Text>
              <Text style={styles.statValue}>{s?.views_count ?? 0}</Text>
            </View>
            <View style={styles.statChip}>
              <Text style={styles.statIcon}>⏱</Text>
              <Text style={styles.statValue}>{readTime}m</Text>
            </View>
            {/* Comments chip → opens inline sheet */}
            <TouchableOpacity
              style={[styles.statChip, styles.statChipActive]}
              onPress={() => setShowComments(true)}
              activeOpacity={0.75}
            >
              <Text style={styles.statIcon}>💬</Text>
              <Text style={styles.statValue}>{commCount}</Text>
            </TouchableOpacity>
          </View>

          {s?.excerpt ? <Text style={styles.excerpt}>{s.excerpt}</Text> : null}
        </View>

        {/* ── Preview paragraphs ── */}
        <View style={styles.previewSection}>
          <View style={styles.previewLabelRow}>
            <View style={styles.previewAccent} />
            <Text style={styles.previewLabel}>Preview</Text>
          </View>
          {preview.map((para, i) => (
            <Text key={i} style={styles.paragraph}>{para.trim()}</Text>
          ))}
          <LinearGradient colors={['transparent', '#0F0A1E']} style={styles.fadeOut} pointerEvents="none" />
        </View>

        {/* ── CTA ── */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaHint}>
            {paragraphs.length > 3
              ? `${paragraphs.length - 3} more section${paragraphs.length - 3 > 1 ? 's' : ''} waiting`
              : 'Enjoy the full story'}
          </Text>
          <TouchableOpacity style={styles.ctaBtn} onPress={handleReadFull} activeOpacity={0.85}>
            <LinearGradient
              colors={['#A855F7', '#7C3AED']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.ctaGradient}
            >
              <Text style={styles.ctaBtnText}>Read Full Story  →</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Inline comments trigger — secondary button */}
          <TouchableOpacity
            style={styles.commentsBtn}
            onPress={() => setShowComments(true)}
          >
            <Text style={styles.commentsBtnText}>💬  Comments ({commCount})</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: insets.bottom + 24 }} />
      </ScrollView>

      {/* ── Inline Comments Sheet ── */}
      <CommentsSheet
        visible={showComments}
        storyId={story.id}
        user={user}
        navigation={navigation}
        onClose={() => setShowComments(false)}
      />

      {/* ── Image Viewer Modal ── */}
      <Modal
        visible={isImageViewerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsImageViewerVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setIsImageViewerVisible(false)}
        >
          {coverUri && (
            <Image 
              source={{ uri: coverUri }} 
              style={styles.fullScreenImage} 
              resizeMode="contain" 
            />
          )}
          <TouchableOpacity 
            style={styles.closeModalBtn} 
            onPress={() => setIsImageViewerVisible(false)}
          >
            <Text style={styles.closeModalText}>✕</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────
// Styles — main screen
// ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root:          { flex: 1, backgroundColor: '#0F0A1E' },
  scroll:        { flex: 1 },
  loadingScreen: { flex: 1, backgroundColor: '#0F0A1E', justifyContent: 'center', alignItems: 'center' },
  loadingText:   { marginTop: 12, color: 'rgba(255,255,255,0.5)', fontSize: 14 },

  hero:     { width: '100%', position: 'relative' },
  heroImg:  { ...StyleSheet.absoluteFillObject },
  heroFade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: COVER_H * 0.55 },
  backArea: { position: 'absolute', top: 0, left: 0, right: 0 },
  backBtn:  {
    margin: 16, width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(15,10,30,0.55)', 
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  catPill:   { position: 'absolute', bottom: 16, right: 16, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  catText:   { color: '#fff', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

  infoCard:   { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 16 },
  title:      { fontSize: 24, fontWeight: '800', color: '#fff', lineHeight: 32, marginBottom: 16 },

  authorRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18,
    backgroundColor: 'rgba(124,58,237,0.12)', borderRadius: 16, padding: 12,
    borderWidth: 1, borderColor: 'rgba(124,58,237,0.25)',
  },
  authorAvatar:  { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  authorInitial: { color: '#fff', fontSize: 18, fontWeight: '800' },
  authorName:    { color: '#E9D5FF', fontSize: 14, fontWeight: '700' },
  authorSub:     { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 },

  statsRow:      { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statChip:      {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, backgroundColor: '#1A1030', borderRadius: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: '#2D1B69',
  },
  statChipActive: { borderColor: 'rgba(124,58,237,0.5)', backgroundColor: 'rgba(124,58,237,0.1)' },
  statIcon:       { fontSize: 14 },
  statValue:      { color: '#C4B5FD', fontSize: 13, fontWeight: '700' },
  statLiked:      { color: '#F87171' },

  excerpt: {
    color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 21, fontStyle: 'italic',
    borderLeftWidth: 3, borderLeftColor: '#7C3AED', paddingLeft: 12, marginTop: 4,
  },

  previewSection:  { paddingHorizontal: 20, paddingTop: 8, position: 'relative' },
  previewLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 },
  previewAccent:   { width: 4, height: 20, borderRadius: 2, backgroundColor: '#A855F7' },
  previewLabel:    { color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
  paragraph:       { fontSize: 16, lineHeight: 28, color: 'rgba(255,255,255,0.82)', marginBottom: 18, textAlign: 'justify', letterSpacing: 0.2 },
  fadeOut:         { height: 80, marginTop: -80, marginHorizontal: -20 },

  ctaSection:     { paddingHorizontal: 20, paddingTop: 32, alignItems: 'center' },
  ctaHint:        { color: 'rgba(255,255,255,0.35)', fontSize: 13, marginBottom: 14, textAlign: 'center' },
  ctaBtn:         { width: '100%', borderRadius: 16, overflow: 'hidden', marginBottom: 12 },
  ctaGradient:    { paddingVertical: 17, alignItems: 'center' },
  ctaBtnText:     { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },
  commentsBtn:    {
    paddingVertical: 13, paddingHorizontal: 24, borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    width: '100%', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)',
  },
  commentsBtnText: { color: 'rgba(255,255,255,0.55)', fontSize: 15, fontWeight: '600' },

  // modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '80%',
  },
  closeModalBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeModalText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
});

// ─────────────────────────────────────────────────────────────
// Styles — comments sheet
// ─────────────────────────────────────────────────────────────
const cs = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: SCREEN_H * 0.72,
    backgroundColor: '#12082A',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderTopWidth: 1, borderTopColor: 'rgba(124,58,237,0.3)',
  },
  sheetHeader: {
    paddingTop: 12, paddingHorizontal: 16, paddingBottom: 12,
    flexDirection: 'row', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center',
    position: 'absolute', top: 8, left: '50%', marginLeft: -20,
  },
  sheetTitle: { flex: 1, color: '#fff', fontSize: 15, fontWeight: '700', textAlign: 'center' },
  closeBtn:   { padding: 4 },
  closeTxt:   { color: 'rgba(255,255,255,0.45)', fontSize: 18, fontWeight: '700' },

  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyBox:   { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 48 },
  emptyEmoji: { fontSize: 44, marginBottom: 12 },
  emptyText:  { color: 'rgba(255,255,255,0.4)', fontSize: 14 },

  commentRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  avatar:     { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  avatarText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  avatarSm:   { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  avatarTextSm:{ color: '#fff', fontSize: 11, fontWeight: '700' },

  bubble: { flex: 1, backgroundColor: '#1A1030', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  bubbleSm:{ flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 10 },
  bubbleHeader:{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  uname:  { color: '#E9D5FF', fontSize: 12, fontWeight: '700' },
  ts:     { color: 'rgba(255,255,255,0.3)', fontSize: 11 },
  content:{ color: 'rgba(255,255,255,0.78)', fontSize: 13, lineHeight: 19 },
  replyBtn:{ color: '#A855F7', fontSize: 12, fontWeight: '600', marginTop: 8 },

  replyRow:   { flexDirection: 'row', gap: 8, marginTop: 10 },

  replyBanner: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: 'rgba(124,58,237,0.2)', paddingHorizontal: 16, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: 'rgba(124,58,237,0.3)',
  },
  replyBannerTxt:  { color: '#C4B5FD', fontSize: 13, fontWeight: '500' },
  replyBannerClose:{ color: '#A855F7', fontSize: 18, fontWeight: '700' },

  inputRow: {
    flexDirection: 'row', padding: 12, gap: 10,
    backgroundColor: '#12082A',
    borderTopWidth: 1, borderTopColor: 'rgba(124,58,237,0.2)',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1, minHeight: 42, maxHeight: 100,
    backgroundColor: '#1A1030', borderRadius: 21,
    borderWidth: 1, borderColor: '#2D1B69',
    color: '#fff', paddingHorizontal: 16, paddingVertical: 10, fontSize: 14,
  },
  sendBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#7C3AED', justifyContent: 'center', alignItems: 'center',
  },
  sendTxt: { color: '#fff', fontSize: 20, fontWeight: '800' },
});

export default StoryPreviewScreenReader;