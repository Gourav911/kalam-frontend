// screens/profile/EditProfileScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import apiService from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';
import { BASE_URL } from '../../constants/api';

const GENDER_OPTIONS = [
  { label: '👨 Male',   value: 'male' },
  { label: '👩 Female', value: 'female' },
  { label: '🧑 Other',  value: 'other' },
];

const EditProfileScreen = ({ navigation }) => {
  const { user, updateUser } = useAuth();

  const [name,   setName]   = useState(user?.name  ?? '');
  const [email,  setEmail]  = useState(user?.email ?? '');
  const [bio,    setBio]    = useState(user?.bio   ?? '');
  const [gender, setGender] = useState(user?.gender ?? 'male');
  const [image,  setImage]  = useState(null);
  const [loading, setLoading] = useState(false);

  // ── Avatar picker ──────────────────────────────────────────
  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission required', 'Allow gallery access to change your photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets?.length) {
      setImage(result.assets[0]);
    }
  };

  // ── Save handler ───────────────────────────────────────────
  const handleUpdate = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Required', 'Name and Email cannot be empty.');
      return;
    }

    const formData = new FormData();
    formData.append('name',   name.trim());
    formData.append('email',  email.trim());
    formData.append('bio',    bio.trim());
    formData.append('gender', gender);

    if (image?.uri && !image.uri.startsWith('http')) {
      const uri     = image.uri;
      const ext     = uri.includes('.') ? uri.split('.').pop().toLowerCase() : 'jpg';
      const mime    = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
      formData.append('profile_image', {
        uri,
        name: `profile.${ext}`,
        type: mime[ext] ?? 'image/jpeg',
      });
    }

    setLoading(true);
    const result = await apiService.updateProfile(formData);
    setLoading(false);

    if (result.success) {
      await updateUser(result.data.user);
      Alert.alert('✅ Saved', 'Your profile has been updated.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } else {
      Alert.alert('Error', result.error ?? 'Update failed. Please try again.');
    }
  };

  // ── Avatar URI ─────────────────────────────────────────────
  const avatarUri = image?.uri || (user?.profile_image ? BASE_URL + user.profile_image : null);

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* ── Header ──────────────────────────────────────── */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* ── Avatar ──────────────────────────────────── */}
            <View style={styles.avatarSection}>
              <TouchableOpacity onPress={pickImage} activeOpacity={0.85}>
                <LinearGradient
                  colors={['#A855F7', '#7C3AED', '#6D28D9']}
                  style={styles.avatarRing}
                >
                  {avatarUri ? (
                    <Image source={{ uri: avatarUri }} style={styles.avatar} />
                  ) : (
                    <LinearGradient colors={['#4C1D95', '#2D1B69']} style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarInitial}>
                        {user?.name?.[0]?.toUpperCase() ?? '?'}
                      </Text>
                    </LinearGradient>
                  )}
                </LinearGradient>
                <View style={styles.editBadge}>
                  <Text style={styles.editBadgeText}>📷</Text>
                </View>
              </TouchableOpacity>
              <Text style={styles.tapHint}>Tap to change photo</Text>
            </View>

            {/* ── Form ──────────────────────────────────────── */}
            <View style={styles.form}>

              {/* Name */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Full Name</Text>
                <View style={styles.inputBox}>
                  <Text style={styles.inputIcon}>👤</Text>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Your full name"
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    returnKeyType="next"
                  />
                </View>
              </View>

              {/* Email */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Email Address</Text>
                <View style={styles.inputBox}>
                  <Text style={styles.inputIcon}>✉️</Text>
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholder="you@example.com"
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    returnKeyType="next"
                  />
                </View>
              </View>

              {/* Bio */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Bio</Text>
                <View style={[styles.inputBox, styles.inputBoxMulti]}>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={bio}
                    onChangeText={setBio}
                    multiline
                    numberOfLines={4}
                    placeholder="Tell readers a bit about yourself…"
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    textAlignVertical="top"
                    maxLength={300}
                  />
                </View>
                <Text style={styles.charCount}>{bio.length}/300</Text>
              </View>

              {/* Gender — chip selector */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Gender</Text>
                <View style={styles.genderRow}>
                  {GENDER_OPTIONS.map(opt => (
                    <TouchableOpacity
                      key={opt.value}
                      style={[
                        styles.genderChip,
                        gender === opt.value && styles.genderChipActive,
                      ]}
                      onPress={() => setGender(opt.value)}
                      activeOpacity={0.75}
                    >
                      <Text style={[
                        styles.genderChipText,
                        gender === opt.value && styles.genderChipTextActive,
                      ]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Save button */}
              <TouchableOpacity
                style={[styles.saveBtn, loading && { opacity: 0.6 }]}
                onPress={handleUpdate}
                disabled={loading}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#A855F7', '#7C3AED']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.saveBtnGradient}
                >
                  {loading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.saveBtnText}>Save Changes</Text>}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => navigation.goBack()}
                disabled={loading}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

export default EditProfileScreen;

// ── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0F0A1E',
  },

  // header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#12082A',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(124,58,237,0.2)',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(124,58,237,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: { color: '#C4B5FD', fontSize: 20, fontWeight: '700' },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: '800' },

  // scroll
  scroll: { paddingBottom: 48 },

  // avatar
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
    position: 'relative',
  },
  avatarRing: {
    width: 108,
    height: 108,
    borderRadius: 54,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 102,
    height: 102,
    borderRadius: 51,
    backgroundColor: '#2D1B69',
  },
  avatarPlaceholder: {
    width: 102,
    height: 102,
    borderRadius: 51,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: { color: '#fff', fontSize: 38, fontWeight: '800' },
  editBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0F0A1E',
  },
  editBadgeText: { fontSize: 13 },
  tapHint: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 12,
    marginTop: 10,
    fontWeight: '500',
  },

  // form
  form: { paddingHorizontal: 20 },
  fieldGroup: { marginBottom: 20 },
  fieldLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },

  // input
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1030',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2D1B69',
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  inputBoxMulti: {
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  inputIcon: { fontSize: 16, marginRight: 10 },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    paddingVertical: 10,
  },
  textArea: {
    minHeight: 90,
    paddingTop: 0,
  },
  charCount: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 11,
    textAlign: 'right',
    marginTop: 5,
  },

  // gender chips
  genderRow: {
    flexDirection: 'row',
    gap: 10,
  },
  genderChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#1A1030',
    borderWidth: 1,
    borderColor: '#2D1B69',
    alignItems: 'center',
  },
  genderChipActive: {
    backgroundColor: 'rgba(124,58,237,0.25)',
    borderColor: '#A855F7',
  },
  genderChipText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 13,
    fontWeight: '600',
  },
  genderChipTextActive: { color: '#C4B5FD' },

  // save/cancel
  saveBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 12,
  },
  saveBtnGradient: {
    paddingVertical: 17,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  cancelBtnText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 15,
    fontWeight: '600',
  },
});
