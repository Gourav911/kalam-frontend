// screens/writer/CreateEditStoryScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Alert, Image, KeyboardAvoidingView,
  Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import apiService from '../../services/apiService';
import { API_BASE_URL, BASE_URL } from '../../constants/api';
import { useLanguage } from '../../contexts/LanguageContext';

const STATUS_OPTIONS = [
  { label: '📝 Draft',     value: 'draft' },
  { label: '🌐 Published', value: 'published' },
];

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'pb', label: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'ur', label: 'اردو', flag: '🇵🇰' },
  { code: 'bn', label: 'বাংলা', flag: '🇧🇩' },
];

const CreateEditStoryScreen = ({ route, navigation }) => {
  const { t } = useLanguage();
  const { story: editStory } = route.params || {};
  const isEditing = !!editStory;

  const [formData, setFormData] = useState({
    title:       '',
    content:     '',
    excerpt:     '',
    category_id: '',
    status:      'draft',
    price:       '5.00',
    cover_image: null,
    is_featured: false,
    language:    'en',
  });

  const [categories,          setCategories]          = useState([]);
  const [errors,              setErrors]              = useState({});
  const [isLoading,           setIsLoading]           = useState(false);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);

  useEffect(() => {
    loadCategories();
    if (isEditing && editStory) populateFormData(editStory);
  }, []);

  const loadCategories = async () => {
    try {
      const res    = await fetch(`${API_BASE_URL}/categories`);
      const result = await res.json();
      if (result.success) setCategories(result.data);
    } catch (e) {
      console.error('loadCategories:', e);
    } finally {
      setIsCategoriesLoading(false);
    }
  };

  const populateFormData = (story) => {
    setFormData({
      title:       story.title        ?? '',
      content:     story.content      ?? '',
      excerpt:     story.excerpt      ?? '',
      category_id: story.category_id?.toString() ?? '',
      status:      story.status       ?? 'draft',
      price:       story.price?.toString() ?? '5.00',
      cover_image: story.cover_image  ? { uri: BASE_URL + story.cover_image } : null,
      is_featured: story.is_featured  ?? false,
      language:    story.language     ?? 'en',
    });
  };

  const update = (field, value) => {
    setFormData(p => ({ ...p, [field]: value }));
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }));
  };

  const validateForm = () => {
    const e = {};
    if (!formData.title.trim())                           e.title       = t('titleRequiredError')   ?? 'Title is required.';
    if (!formData.content.trim())                         e.content     = t('contentRequiredError') ?? 'Content is required.';
    else if (formData.content.trim().length < 5)          e.content     = t('contentLengthError')   ?? 'Content must be at least 5 characters.';
    if (!formData.category_id)                            e.category_id = t('categoryRequiredError') ?? 'Please select a category.';
    if (!formData.language)                               e.language    = 'Please select a language.';
    return e;
  };

  const handleImagePicker = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission Required', 'Allow gallery access to add a cover image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.85,
    });
    if (!result.canceled) update('cover_image', result.assets[0]);
  };

  const handleSave = async (saveAsDraft = false) => {
    setErrors({});
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }

    setIsLoading(true);
    try {
      const fd = new FormData();
      fd.append('title',       formData.title.trim());
      fd.append('content',     formData.content.trim());
      fd.append('excerpt',     formData.excerpt.trim());
      fd.append('category_id', formData.category_id);
      fd.append('status',      saveAsDraft ? 'draft' : formData.status);
      fd.append('price',       formData.price);
      fd.append('is_featured', formData.is_featured.toString());
      fd.append('language',    formData.language);

      if (formData.cover_image?.uri && !formData.cover_image.uri.startsWith('http')) {
        const uri  = formData.cover_image.uri;
        const ext  = uri.includes('.') ? uri.split('.').pop().toLowerCase() : 'jpg';
        fd.append('cover_image', { uri, name: `cover.${ext}`, type: `image/${ext}` });
      }

      const result = isEditing
        ? await apiService.updateStory(editStory.id, fd)
        : await apiService.createStory(fd);

      if (result.success) {
        Alert.alert(
          '✅ ' + (t('success') ?? 'Success'),
          `Story ${saveAsDraft ? 'saved as draft' : (isEditing ? 'updated' : 'published')} successfully!`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        if (result.error?.details) setErrors(result.error.details);
        else Alert.alert('Error', result.error?.message ?? 'Failed to save story.');
      }
    } catch (err) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const wordCount = formData.content.trim().split(/\s+/).filter(w => w).length;
  const charCount = formData.content.length;

  // ── Loading ───────────────────────────────────────────────
  if (isCategoriesLoading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#A855F7" />
        <Text style={styles.loadingText}>Loading…</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
          {/* ── Header ─────────────────────────────────────── */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {isEditing ? (t('editStory') ?? 'Edit Story') : (t('newStory') ?? 'New Story')}
            </Text>
            <TouchableOpacity
              style={styles.draftBtn}
              onPress={() => handleSave(true)}
              disabled={isLoading}
            >
              <Text style={styles.draftBtnText}>{t('saveDraft') ?? 'Draft'}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* ── Cover image picker ──────────────────────── */}
            <TouchableOpacity style={styles.coverPicker} onPress={handleImagePicker} activeOpacity={0.85}>
              {formData.cover_image ? (
                <Image source={{ uri: formData.cover_image.uri }} style={styles.coverImg} resizeMode="cover" />
              ) : (
                <LinearGradient colors={['#1A1030', '#12082A']} style={styles.coverPlaceholder}>
                  <Text style={styles.coverIcon}>🖼️</Text>
                  <Text style={styles.coverHint}>{t('tapToAddCover') ?? 'Tap to add cover image'}</Text>
                  <Text style={styles.coverDim}>Square, 9:16, or Landscape supported</Text>
                </LinearGradient>
              )}
              <View style={styles.coverEditBadge}>
                <Text style={styles.coverEditIcon}>📷</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.form}>
              {/* ── Title ─────────────────────────────────── */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>{t('titleRequiredLabel') ?? 'Title *'}</Text>
                <TextInput
                  style={[styles.titleInput, errors.title && styles.inputError]}
                  value={formData.title}
                  onChangeText={v => update('title', v)}
                  placeholder="Give your story a compelling title…"
                  placeholderTextColor="rgba(255,255,255,0.22)"
                  maxLength={255}
                />
                {errors.title ? <Text style={styles.errText}>{errors.title}</Text> : null}
              </View>

              {/* ── Category chips ────────────────────────── */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>{t('categoryRequiredLabel') ?? 'Category *'}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.chipRow}>
                    {categories.map(cat => (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.chip,
                          formData.category_id === cat.id.toString() && styles.chipActive,
                        ]}
                        onPress={() => update('category_id', cat.id.toString())}
                        activeOpacity={0.75}
                      >
                        <Text style={[
                          styles.chipText,
                          formData.category_id === cat.id.toString() && styles.chipTextActive,
                        ]}>
                          {t(cat.slug) || cat.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
                {errors.category_id ? <Text style={styles.errText}>{errors.category_id}</Text> : null}
              </View>

              {/* ── Language chips ────────────────────────── */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Language *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.chipRow}>
                    {LANGUAGES.map(lang => (
                      <TouchableOpacity
                        key={lang.code}
                        style={[
                          styles.chip,
                          formData.language === lang.code && styles.chipActive,
                        ]}
                        onPress={() => update('language', lang.code)}
                        activeOpacity={0.75}
                      >
                        <Text style={[
                          styles.chipText,
                          formData.language === lang.code && styles.chipTextActive,
                        ]}>
                          {lang.flag} {lang.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
                {errors.language ? <Text style={styles.errText}>{errors.language}</Text> : null}
              </View>

              {/* ── Status toggle ─────────────────────────── */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>{t('status') ?? 'Status'}</Text>
                <View style={styles.statusRow}>
                  {STATUS_OPTIONS.map(opt => (
                    <TouchableOpacity
                      key={opt.value}
                      style={[styles.statusChip, formData.status === opt.value && styles.statusChipActive]}
                      onPress={() => update('status', opt.value)}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.statusChipText, formData.status === opt.value && styles.statusChipTextActive]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* ── Story content ─────────────────────────── */}
              <View style={styles.fieldGroup}>
                <View style={styles.contentLabelRow}>
                  <Text style={styles.fieldLabel}>{t('storyContentLabel') ?? 'Story Content *'}</Text>
                  <View style={styles.stats}>
                    <Text style={styles.statText}>{wordCount} words</Text>
                    <View style={styles.statDot} />
                    <Text style={styles.statText}>{charCount} chars</Text>
                  </View>
                </View>
                <TextInput
                  style={[styles.contentInput, errors.content && styles.inputError]}
                  value={formData.content}
                  onChangeText={v => update('content', v)}
                  placeholder={t('storyContentPlaceholder') ?? 'Write your story here…\n\nSeparate paragraphs with a blank line.\nFirst 3 paragraphs are shown as preview.'}
                  placeholderTextColor="rgba(255,255,255,0.22)"
                  multiline
                  textAlignVertical="top"
                />
                {errors.content
                  ? <Text style={styles.errText}>{errors.content}</Text>
                  : <Text style={styles.tipText}>💡 Separate paragraphs with a blank line. First 3 shown as preview.</Text>}
              </View>

              {/* ── Excerpt ───────────────────────────────── */}
              <View style={styles.fieldGroup}>
                <View style={styles.contentLabelRow}>
                  <Text style={styles.fieldLabel}>{t('excerptOptional') ?? 'Excerpt (optional)'}</Text>
                  <Text style={styles.statText}>{formData.excerpt.length}/500</Text>
                </View>
                <TextInput
                  style={styles.excerptInput}
                  value={formData.excerpt}
                  onChangeText={v => update('excerpt', v)}
                  placeholder="Short description readers see before opening…"
                  placeholderTextColor="rgba(255,255,255,0.22)"
                  multiline
                  maxLength={500}
                  textAlignVertical="top"
                />
              </View>

            </View>
          </ScrollView>

          {/* ── Bottom publish bar ───────────────────────── */}
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={[styles.publishBtn, isLoading && { opacity: 0.6 }]}
              onPress={() => handleSave(false)}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#A855F7', '#7C3AED']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.publishGradient}
              >
                {isLoading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.publishText}>
                      {isEditing ? (t('updateStory') ?? 'Update Story') : (t('publishStory') ?? 'Publish Story')}
                    </Text>}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

export default CreateEditStoryScreen;

// ── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root:          { flex: 1, backgroundColor: '#0F0A1E' },
  loadingScreen: { flex: 1, backgroundColor: '#0F0A1E', justifyContent: 'center', alignItems: 'center' },
  loadingText:   { color: 'rgba(255,255,255,0.5)', fontSize: 14, marginTop: 12 },

  // header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
    backgroundColor: '#12082A',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(124,58,237,0.2)',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(124,58,237,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  backArrow:    { color: '#C4B5FD', fontSize: 20, fontWeight: '700' },
  headerTitle:  { color: '#fff', fontSize: 17, fontWeight: '800' },
  draftBtn: {
    paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 20, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  draftBtnText: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '600' },

  scroll:        { flex: 1 },
  scrollContent: { paddingBottom: 24 },

  // cover image
  coverPicker: {
    height: 200,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#2D1B69',
  },
  coverImg:     { width: '100%', height: '100%' },
  coverPlaceholder: {
    flex: 1, justifyContent: 'center', alignItems: 'center', gap: 6,
  },
  coverIcon:    { fontSize: 36 },
  coverHint:    { color: 'rgba(255,255,255,0.55)', fontSize: 14, fontWeight: '600' },
  coverDim:     { color: 'rgba(255,255,255,0.25)', fontSize: 11 },
  coverEditBadge: {
    position: 'absolute', top: 12, right: 12,
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(124,58,237,0.85)',
    justifyContent: 'center', alignItems: 'center',
  },
  coverEditIcon: { fontSize: 15 },

  // form
  form:       { padding: 16 },
  fieldGroup: { marginBottom: 22 },
  fieldLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11, fontWeight: '700',
    letterSpacing: 0.9, textTransform: 'uppercase',
    marginBottom: 10,
  },

  // title
  titleInput: {
    backgroundColor: '#1A1030',
    borderRadius: 14, borderWidth: 1, borderColor: '#2D1B69',
    color: '#fff', fontSize: 18, fontWeight: '700',
    paddingHorizontal: 16, paddingVertical: 14,
  },

  // category chips
  chipRow: { flexDirection: 'row', gap: 8, paddingVertical: 2 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 9,
    borderRadius: 20, backgroundColor: '#1A1030',
    borderWidth: 1, borderColor: '#2D1B69',
  },
  chipActive:     { backgroundColor: 'rgba(124,58,237,0.3)', borderColor: '#A855F7' },
  chipText:       { color: 'rgba(255,255,255,0.45)', fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: '#C4B5FD' },

  // status
  statusRow: { flexDirection: 'row', gap: 12 },
  statusChip: {
    flex: 1, paddingVertical: 12, borderRadius: 14,
    backgroundColor: '#1A1030', borderWidth: 1, borderColor: '#2D1B69',
    alignItems: 'center',
  },
  statusChipActive:     { backgroundColor: 'rgba(124,58,237,0.25)', borderColor: '#A855F7' },
  statusChipText:       { color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: '600' },
  statusChipTextActive: { color: '#C4B5FD' },

  // content
  contentLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  stats:    { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: '600' },
  statDot:  { width: 3, height: 3, borderRadius: 1.5, backgroundColor: 'rgba(255,255,255,0.2)' },

  contentInput: {
    backgroundColor: '#1A1030',
    borderRadius: 14, borderWidth: 1, borderColor: '#2D1B69',
    color: '#fff', fontSize: 15, lineHeight: 24,
    paddingHorizontal: 16, paddingVertical: 14,
    minHeight: 240,
  },
  excerptInput: {
    backgroundColor: '#1A1030',
    borderRadius: 14, borderWidth: 1, borderColor: '#2D1B69',
    color: '#fff', fontSize: 14, lineHeight: 21,
    paddingHorizontal: 16, paddingVertical: 12,
    minHeight: 90,
  },

  inputError: { borderColor: '#F87171' },
  errText:    { color: '#F87171', fontSize: 12, marginTop: 6 },
  tipText:    { color: 'rgba(255,255,255,0.25)', fontSize: 11, marginTop: 8, fontStyle: 'italic' },

  // bottom bar
  bottomBar: {
    padding: 14,
    backgroundColor: '#12082A',
    borderTopWidth: 1,
    borderTopColor: 'rgba(124,58,237,0.2)',
  },
  publishBtn:      { borderRadius: 16, overflow: 'hidden' },
  publishGradient: { paddingVertical: 16, alignItems: 'center' },
  publishText:     { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
});