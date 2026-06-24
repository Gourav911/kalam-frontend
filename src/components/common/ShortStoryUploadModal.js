// src/components/common/ShortStoryUploadModal.js
// Bottom-sheet style modal for uploading a new Short Story.
// Supports: pick image from gallery, optional caption, bg color for text-only.

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import ApiService from '../../services/apiService';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// Preset background colors for text-only stories
const BG_COLORS = [
  ['#7C3AED', '#4C1D95'],
  ['#DB2777', '#831843'],
  ['#0EA5E9', '#0C4A6E'],
  ['#10B981', '#064E3B'],
  ['#F59E0B', '#78350F'],
  ['#EF4444', '#7F1D1D'],
];

const ShortStoryUploadModal = ({ visible, onClose, onSuccess }) => {
  const [selectedImage, setSelectedImage] = useState(null); // { uri, type, name }
  const [caption, setCaption] = useState('');
  const [bgColorPair, setBgColorPair] = useState(BG_COLORS[0]);
  const [isUploading, setIsUploading] = useState(false);
  const [mode, setMode] = useState('image'); // 'image' | 'text'

  const resetState = () => {
    setSelectedImage(null);
    setCaption('');
    setBgColorPair(BG_COLORS[0]);
    setIsUploading(false);
    setMode('image');
  };

  const handleClose = () => {
    resetState();
    onClose && onClose();
  };

  // ── Pick image from library ───────────────────────────────────
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow access to your photo library to upload a story.',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],   // portrait for stories
      quality: 0.85,
    });

    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      const uriParts = asset.uri.split('.');
      const ext = uriParts[uriParts.length - 1];
      setSelectedImage({ 
        uri: asset.uri,
        type: `image/${ext}`,
        name: `story_${Date.now()}.${ext}`,
      });
      setMode('image');
    }
  };

  // ── Post the short story ─────────────────────────────────────
  const handlePost = async () => {
    if (mode === 'image' && !selectedImage) {
      Alert.alert('No image selected', 'Please pick an image first.');
      return;
    }
    if (mode === 'text' && !caption.trim()) {
      Alert.alert('Empty story', 'Please write something for your story.');
      return;
    }

    setIsUploading(true);

    const formData = new FormData();

    if (mode === 'image' && selectedImage) {
      formData.append('media', {
        uri: selectedImage.uri,
        type: selectedImage.type,
        name: selectedImage.name,
      });
      formData.append('media_type', 'image');
    } else {
      formData.append('media_type', 'text');
      formData.append('bg_color', bgColorPair[0]);
    }

    if (caption.trim()) {
      formData.append('caption', caption.trim());
    }

    const result = await ApiService.createShortStory(formData);
    setIsUploading(false);

    if (result.success) {
      Alert.alert('✅ Posted!', 'Your story is live for 24 hours.');
      resetState();
      onSuccess && onSuccess();
      onClose && onClose();
    } else {
      Alert.alert(
        'Upload failed',
        result.error?.message || 'Something went wrong. Please try again.',
      );
    }
  };

  // ── Preview pane ──────────────────────────────────────────────
  const renderPreview = () => {
    if (mode === 'image' && selectedImage) {
      return (
        <View style={styles.previewBox}>
          <Image
            source={{ uri: selectedImage.uri }}
            style={styles.previewImage}
            resizeMode="contain"
          />
          {caption.trim() ? (
            <View style={styles.previewCaptionOverlay}>
              <Text style={styles.previewCaptionText}>{caption}</Text>
            </View>
          ) : null}
        </View>
      );
    }

    // Text mode preview
    return (
      <LinearGradient colors={bgColorPair} style={styles.previewBox}>
        <Text style={styles.textPreview}>
          {caption || 'Your story text will appear here…'}
        </Text>
      </LinearGradient>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose} />

        <View style={styles.sheet}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Title Row */}
          <View style={styles.titleRow}>
            <Text style={styles.title}>Add to Your Story</Text>
            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Mode Toggle */}
          <View style={styles.modeToggle}>
            <TouchableOpacity
              style={[styles.modeBtn, mode === 'image' && styles.modeBtnActive]}
              onPress={() => setMode('image')}
            >
              <Text style={[styles.modeBtnText, mode === 'image' && styles.modeBtnTextActive]}>
                📷 Image
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeBtn, mode === 'text' && styles.modeBtnActive]}
              onPress={() => setMode('text')}
            >
              <Text style={[styles.modeBtnText, mode === 'text' && styles.modeBtnTextActive]}>
                ✏️ Text
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Preview */}
            {renderPreview()}

            {/* Image picker button */}
            {mode === 'image' && (
              <TouchableOpacity style={styles.pickBtn} onPress={pickImage} activeOpacity={0.8}>
                <Text style={styles.pickBtnText}>
                  {selectedImage ? '🔄 Change Image' : '🖼️  Choose from Gallery'}
                </Text>
              </TouchableOpacity>
            )}

            {/* Background color picker (text mode) */}
            {mode === 'text' && (
              <View style={styles.colorRow}>
                <Text style={styles.colorLabel}>Background</Text>
                <View style={styles.colorSwatches}>
                  {BG_COLORS.map((pair) => (
                    <TouchableOpacity
                      key={pair[0]}
                      onPress={() => setBgColorPair(pair)}
                      activeOpacity={0.85}
                    >
                      <LinearGradient
                        colors={pair}
                        style={[
                          styles.swatch,
                          bgColorPair[0] === pair[0] && styles.swatchActive,
                        ]}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Caption input */}
            <View style={styles.captionBox}>
              <Text style={styles.captionLabel}>
                {mode === 'text' ? 'Story Text *' : 'Caption (optional)'}
              </Text>
              <TextInput
                style={styles.captionInput}
                placeholder={
                  mode === 'text'
                    ? 'Write something inspiring…'
                    : 'Add a caption…'
                }
                placeholderTextColor="rgba(255,255,255,0.35)"
                value={caption}
                onChangeText={setCaption}
                multiline
                maxLength={200}
              />
              <Text style={styles.charCount}>{caption.length}/200</Text>
            </View>

            {/* Expires note */}
            <Text style={styles.expiresNote}>⏱ Your story will expire in 24 hours</Text>

            {/* Post button */}
            <TouchableOpacity
              style={[styles.postBtn, isUploading && styles.postBtnDisabled]}
              onPress={handlePost}
              disabled={isUploading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={isUploading ? ['#3A2060', '#3A2060'] : ['#7C3AED', '#A855F7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.postBtnGradient}
              >
                {isUploading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.postBtnText}>Share Story →</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={{ height: 24 }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: '#12082A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_H * 0.9,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(124,58,237,0.3)',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  closeBtn: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 18,
    fontWeight: '700',
  },

  // Mode toggle
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: '#1E1440',
    borderRadius: 12,
    padding: 3,
    marginBottom: 16,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  modeBtnActive: {
    backgroundColor: '#7C3AED',
  },
  modeBtnText: {
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
    fontSize: 14,
  },
  modeBtnTextActive: {
    color: '#fff',
  },

  // Preview
  previewBox: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
    backgroundColor: '#1E1440',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewCaptionOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  previewCaptionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  textPreview: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 24,
    lineHeight: 26,
  },

  // Pick button
  pickBtn: {
    borderWidth: 1.5,
    borderColor: '#7C3AED',
    borderRadius: 12,
    borderStyle: 'dashed',
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  pickBtnText: {
    color: '#A855F7',
    fontSize: 15,
    fontWeight: '600',
  },

  // Color picker
  colorRow: {
    marginBottom: 16,
  },
  colorLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    marginBottom: 10,
    fontWeight: '600',
  },
  colorSwatches: {
    flexDirection: 'row',
    gap: 10,
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  swatchActive: {
    borderWidth: 3,
    borderColor: '#fff',
  },

  // Caption
  captionBox: {
    marginBottom: 10,
  },
  captionLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    marginBottom: 8,
    fontWeight: '600',
  },
  captionInput: {
    backgroundColor: '#1E1440',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2D1B69',
    color: '#fff',
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 11,
    textAlign: 'right',
    marginTop: 4,
  },

  // Expires note
  expiresNote: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 18,
  },

  // Post button
  postBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  postBtnDisabled: {
    opacity: 0.6,
  },
  postBtnGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});

export default ShortStoryUploadModal;
