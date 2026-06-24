// screens/writer/StoryPreviewScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Image, Share, Alert, ActivityIndicator, Dimensions, StatusBar, Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { BASE_URL } from '../../constants/api';
import { useLanguage } from '../../contexts/LanguageContext';
import apiService from '../../services/apiService';

const { height: SCREEN_H } = Dimensions.get('window');
const COVER_H = SCREEN_H * 0.42;

const STATUS_META = {
  published: { label: 'Published', color: '#22C55E' },
  draft:     { label: 'Draft',     color: '#F59E0B' },
  pending:   { label: 'Pending',   color: '#3B82F6' },
};

const StoryPreviewScreen = ({ route, navigation }) => {
  const { t }  = useLanguage();
  const insets = useSafeAreaInsets();
  const { story, id } = route.params || {};

  const [currentStory, setCurrentStory] = useState(story ?? null);
  const [loading, setLoading]           = useState(!story);
  const [showFull, setShowFull]         = useState(false);
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);

  useEffect(() => {
    if (!story && id) {
      setLoading(true);
      apiService.getStoryById(id)
        .then(res => { if (res.success) setCurrentStory(res.data); })
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading || !currentStory) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#A855F7" />
        <Text style={styles.loadingText}>Loading story…</Text>
      </View>
    );
  }

  // ── helpers ────────────────────────────────────────────────
  const fmt = (d) => new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const paragraphs    = currentStory.content?.split('\n\n').filter(p => p.trim()) ?? [];
  const previewParas  = paragraphs.slice(0, 3);
  const hasMoreParas  = paragraphs.length > 3;
  const displayParas  = showFull ? paragraphs : previewParas;

  const coverUri      = currentStory.cover_image ? BASE_URL + currentStory.cover_image : null;
  const statusMeta    = STATUS_META[currentStory.status] ?? STATUS_META.draft;
  const wordCount     = currentStory.content?.trim().split(/\s+/).filter(Boolean).length ?? 0;
  const readTime      = currentStory.reading_time ?? Math.ceil(wordCount / 200);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `📖 "${currentStory.title}" by ${currentStory.author?.name ?? 'Me'}\n\nkalam://story/${currentStory.id}`,
      });
    } catch (_) {}
  };

  const handlePublish = () => {
    Alert.alert(
      'Publish Story',
      'Readers will be able to discover this story once published.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Publish',
          onPress: () => navigation.navigate('CreateEditStory', {
            story: { ...currentStory, status: 'published' },
          }),
        },
      ]
    );
  };

  // ── render ─────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>

        {/* ── Hero cover ───────────────────────────────────── */}
        <View style={[styles.hero, { height: COVER_H }]}>
          {coverUri ? (
            <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={0.9} onPress={() => setIsImageViewerVisible(true)}>
              <Image source={{ uri: coverUri }} style={styles.heroImg} resizeMode="cover" />
            </TouchableOpacity>
          ) : (
            <LinearGradient colors={['#4C1D95', '#2D1B69', '#0F0A1E']} style={styles.heroImg} />
          )}
          <LinearGradient
            colors={['transparent', 'rgba(15,10,30,0.75)', '#0F0A1E']}
            style={styles.heroFade}
            pointerEvents="none"
          />

          {/* Back + Share */}
          <SafeAreaView style={styles.heroActions} edges={['top']}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
              <Feather name="chevron-left" size={26} color="#fff" style={{ marginLeft: -2 }} />
            </TouchableOpacity>
            <TouchableOpacity >
              {/* <Text style={styles.iconBtnText}>↗</Text> */}
            </TouchableOpacity>
          </SafeAreaView>

          {/* Status pill */}
          <View style={[styles.statusPill, { backgroundColor: statusMeta.color + '22', borderColor: statusMeta.color }]}>
            <View style={[styles.statusDot, { backgroundColor: statusMeta.color }]} />
            <Text style={[styles.statusText, { color: statusMeta.color }]}>{statusMeta.label}</Text>
          </View>
        </View>

        {/* ── Info card ─────────────────────────────────────── */}
        <View style={styles.infoCard}>

          {/* Category */}
          {currentStory.category?.name && (
            <Text style={styles.categoryTag}>{t(currentStory.category.slug) || currentStory.category.name}</Text>
          )}

          {/* Title */}
          <Text style={styles.title}>{currentStory.title}</Text>

          {/* Author + date row */}
          <View style={styles.metaRow}>
            {currentStory.author?.profile_image ? (
              <Image source={{ uri: BASE_URL + currentStory.author.profile_image }} style={styles.authorAvatar} />
            ) : (
              <LinearGradient colors={['#A855F7', '#7C3AED']} style={styles.authorAvatar}>
                <Text style={styles.authorInitial}>
                  {currentStory.author?.name?.[0]?.toUpperCase() ?? 'Y'}
                </Text>
              </LinearGradient>
            )}
            <View>
              <Text style={styles.authorName}>
                {currentStory.author?.name ?? 'You'}
                {currentStory.author?.is_verified ? ' ✓' : ''}
              </Text>
              <Text style={styles.dateText}>
                {currentStory.published_at
                  ? `Published ${fmt(currentStory.published_at)}`
                  : `Created ${fmt(currentStory.created_at)}`}
              </Text>
            </View>
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            {[
              { icon: '👁️', value: currentStory.views_count ?? 0, label: 'Views' },
              { icon: '❤️', value: currentStory.likes_count ?? 0, label: 'Likes' },
              { icon: '💬', value: currentStory.comments_count ?? 0, label: 'Comments' },
              { icon: '⏱',  value: `${readTime}m`, label: 'Read time' },
            ].map((s, i) => (
              <View key={i} style={styles.statBox}>
                <Text style={styles.statIcon}>{s.icon}</Text>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Excerpt */}
          {currentStory.excerpt ? (
            <Text style={styles.excerpt}>{currentStory.excerpt}</Text>
          ) : null}
        </View>

        {/* ── Story content ─────────────────────────────────── */}
        <View style={styles.contentSection}>
          <View style={styles.contentLabelRow}>
            <View style={styles.accentBar} />
            <Text style={styles.contentLabel}>Story Content</Text>
          </View>

          {displayParas.map((para, i) => (
            <Text key={i} style={styles.paragraph}>{para.trim()}</Text>
          ))}

          {/* Toggle more/less */}
          {hasMoreParas && (
            <TouchableOpacity
              style={styles.toggleBtn}
              onPress={() => setShowFull(p => !p)}
            >
              <Text style={styles.toggleBtnText}>
                {showFull
                  ? '↑ Show preview only'
                  : `↓ Show full story (${paragraphs.length - 3} more sections)`}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Writing tips ──────────────────────────────────── */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>✍️ {t('writingTipsTitle') ?? 'Writing Tips'}</Text>
          {[t('tip1'), t('tip2'), t('tip3'), t('tip4')].filter(Boolean).map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <View style={styles.tipDot} />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        {/* ── Action buttons ────────────────────────────────── */}
        <View style={[styles.actions, { paddingBottom: insets.bottom + 24 }]}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate('CreateEditStory', { story: currentStory })}
            activeOpacity={0.85}
          >
            <Text style={styles.editBtnText}>✏️  Edit Story</Text>
          </TouchableOpacity>

          {currentStory.status === 'draft' && (
            <TouchableOpacity
              style={styles.publishBtn}
              onPress={handlePublish}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#A855F7', '#7C3AED']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.publishGradient}
              >
                <Text style={styles.publishBtnText}>
                  {t('publishStory') ?? '🌐  Publish Story'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>

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

export default StoryPreviewScreen;

// ── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root:          { flex: 1, backgroundColor: '#0F0A1E' },
  loadingScreen: { flex: 1, backgroundColor: '#0F0A1E', justifyContent: 'center', alignItems: 'center' },
  loadingText:   { color: 'rgba(255,255,255,0.5)', fontSize: 14, marginTop: 12 },

  // hero
  hero:     { width: '100%', position: 'relative' },
  heroImg:  { ...StyleSheet.absoluteFillObject },
  heroFade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: SCREEN_H * 0.26 },
  heroActions: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 4,
  },
  iconBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(15,10,30,0.55)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },

  // status pill — bottom right of hero
  statusPill: {
    position: 'absolute', bottom: 16, right: 16,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  statusDot:  { width: 7, height: 7, borderRadius: 3.5 },
  statusText: { fontSize: 12, fontWeight: '700' },

  // info card
  infoCard: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 8 },
  categoryTag: {
    color: '#A855F7', fontSize: 12, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8,
  },
  title: {
    fontSize: 24, fontWeight: '800', color: '#fff',
    lineHeight: 32, marginBottom: 16,
  },

  // author
  metaRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 12, marginBottom: 18,
  },
  authorAvatar: {
    width: 42, height: 42, borderRadius: 21,
    justifyContent: 'center', alignItems: 'center',
  },
  authorInitial: { color: '#fff', fontSize: 18, fontWeight: '800' },
  authorName:    { color: '#E9D5FF', fontSize: 14, fontWeight: '700' },
  dateText:      { color: 'rgba(255,255,255,0.38)', fontSize: 11, marginTop: 2 },

  // stats
  statsRow: {
    flexDirection: 'row', gap: 8, marginBottom: 16,
  },
  statBox: {
    flex: 1, backgroundColor: '#1A1030',
    borderRadius: 14, paddingVertical: 12,
    alignItems: 'center', borderWidth: 1, borderColor: '#2D1B69',
  },
  statIcon:  { fontSize: 16, marginBottom: 3 },
  statValue: { color: '#C4B5FD', fontSize: 14, fontWeight: '700' },
  statLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 10, marginTop: 2 },

  // excerpt
  excerpt: {
    color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 21,
    fontStyle: 'italic', borderLeftWidth: 3, borderLeftColor: '#7C3AED',
    paddingLeft: 12, marginTop: 4,
  },

  // content section
  contentSection:   { paddingHorizontal: 20, paddingVertical: 8 },
  contentLabelRow:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18 },
  accentBar:        { width: 4, height: 20, borderRadius: 2, backgroundColor: '#A855F7' },
  contentLabel:     {
    color: 'rgba(255,255,255,0.38)', fontSize: 11, fontWeight: '700',
    letterSpacing: 1.5, textTransform: 'uppercase',
  },
  paragraph: {
    fontSize: 16, lineHeight: 28, color: 'rgba(255,255,255,0.82)',
    marginBottom: 18, textAlign: 'justify', letterSpacing: 0.2,
  },
  toggleBtn: {
    alignSelf: 'center', marginTop: 4, marginBottom: 16,
    paddingVertical: 10, paddingHorizontal: 20,
    backgroundColor: 'rgba(124,58,237,0.15)',
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(124,58,237,0.35)',
  },
  toggleBtnText: { color: '#C4B5FD', fontSize: 13, fontWeight: '600' },

  // tips
  tipsCard: {
    marginHorizontal: 20, marginVertical: 8,
    backgroundColor: '#1A1030', borderRadius: 16,
    padding: 18, borderWidth: 1, borderColor: '#2D1B69',
  },
  tipsTitle: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 14 },
  tipRow:    { flexDirection: 'row', gap: 10, marginBottom: 10, alignItems: 'flex-start' },
  tipDot:    { width: 6, height: 6, borderRadius: 3, backgroundColor: '#A855F7', marginTop: 7, flexShrink: 0 },
  tipText:   { color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 20, flex: 1 },

  // actions
  actions: { paddingHorizontal: 20, paddingTop: 12, gap: 12 },
  editBtn: {
    borderRadius: 16, paddingVertical: 15, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(124,58,237,0.5)',
    backgroundColor: 'rgba(124,58,237,0.12)',
  },
  editBtnText: { color: '#C4B5FD', fontSize: 15, fontWeight: '700' },

  publishBtn:      { borderRadius: 16, overflow: 'hidden' },
  publishGradient: { paddingVertical: 16, alignItems: 'center' },
  publishBtnText:  { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },

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