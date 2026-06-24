// screens/profile/ProfileScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Switch,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { BASE_URL } from '../../constants/api';
import { useLanguage } from '../../contexts/LanguageContext';
import apiService from '../../services/apiService';

const APP_VERSION = '1.0.0';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'pb', label: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'ur', label: 'اردو', flag: '🇵🇰' },
  { code: 'bn', label: 'বাংলা', flag: '🇧🇩' },
];

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { t, language, changeLanguage } = useLanguage();
  const { user, logout } = useAuth();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [stats, setStats] = useState({ followers: 0, following: 0, stories: 0 });

  // Load live social stats
  const loadStats = useCallback(async () => {
    if (!user?.id) return;
    const result = await apiService.getUserProfile(user.id);
    if (result.success) {
      setStats({
        followers: result.data.followers_count ?? 0,
        following: result.data.following_count ?? 0,
        stories: result.data.stories_count ?? 0,
      });
    }
  }, [user?.id]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          setIsLoggingOut(true);
          await logout();
          setIsLoggingOut(false);
        },
      },
    ]);
  };

  const currentLang = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];

  const avatarUri = user?.profile_image
    ? { uri: BASE_URL + user.profile_image }
    : null;

  const roleLabel =
    user?.role === 'writer' ? '✍️ Writer'
    : user?.role === 'admin' ? '👑 Admin'
    : '📖 Reader';

  // ── render ──────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ════════════════════════════════════════
            SECTION 1 — PROFILE
        ════════════════════════════════════════ */}
        <LinearGradient colors={['#2D1B69', '#0F0A1E']} style={styles.profileBanner}>

          {/* Edit button */}
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>

          {/* Avatar */}
          <TouchableOpacity 
            style={styles.avatarRing}
            onPress={() => setIsImageViewerVisible(true)}
            activeOpacity={0.8}
          >
            {avatarUri ? (
              <Image source={avatarUri} style={styles.avatarImg} />
            ) : (
              <LinearGradient colors={['#A855F7', '#7C3AED']} style={styles.avatarImg}>
                <Text style={styles.avatarInitial}>
                  {user?.name?.[0]?.toUpperCase() ?? '?'}
                </Text>
              </LinearGradient>
            )}
          </TouchableOpacity>

          <Text style={styles.userName}>{user?.name ?? 'Your Name'}</Text>
          <Text style={styles.userEmail}>{user?.email ?? ''}</Text>

          <View style={styles.rolePill}>
            <Text style={styles.rolePillText}>{roleLabel}</Text>
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <TouchableOpacity
              style={styles.statItem}
              onPress={() => navigation.navigate('UserProfile', { userId: user?.id })}
            >
              <Text style={styles.statNum}>{stats.followers}</Text>
              <Text style={styles.statLbl}>Followers</Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <TouchableOpacity
              style={styles.statItem}
              onPress={() => navigation.navigate('UserProfile', { userId: user?.id })}
            >
              <Text style={styles.statNum}>{stats.following}</Text>
              <Text style={styles.statLbl}>Following</Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{stats.stories}</Text>
              <Text style={styles.statLbl}>Stories</Text>
            </View>
          </View>
        </LinearGradient>


        {/* ════════════════════════════════════════
            SECTION 2 — SETTINGS
        ════════════════════════════════════════ */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionHeader}>⚙️  Settings</Text>

          {/* ── Profile settings group ── */}
          <View style={styles.group}>
            <SettingsRow
              icon="👤"
              label="Edit Profile"
              onPress={() => navigation.navigate('EditProfile')}
            />
            <RowDivider />
            <SettingsRow
              icon="🔒"
              label="Privacy Policy"
              onPress={() => navigation.navigate('PrivacyPolicy')}
            />
            <RowDivider />
            <SettingsRow
              icon="📄"
              label="Terms and Conditions"
              onPress={() => navigation.navigate('Terms')}
            />
          </View>

          {/* ── Language group ── */}
          <View style={styles.group}>
            <TouchableOpacity
              style={styles.row}
              onPress={() => setShowLangPicker((v) => !v)}
              activeOpacity={0.75}
            >
              <View style={styles.rowLeft}>
                <Text style={styles.rowIcon}>🌐</Text>
                <Text style={styles.rowLabel}>Language</Text>
              </View>
              <View style={styles.rowRight}>
                <Text style={styles.rowValue}>
                  {currentLang.flag} {currentLang.label}
                </Text>
                <Text style={styles.rowChevron}>{showLangPicker ? '▲' : '▼'}</Text>
              </View>
            </TouchableOpacity>

            {showLangPicker && (
              <View style={styles.langPicker}>
                {LANGUAGES.map((lang) => {
                  const active = lang.code === language;
                  return (
                    <TouchableOpacity
                      key={lang.code}
                      style={[styles.langItem, active && styles.langItemActive]}
                      onPress={() => {
                        changeLanguage(lang.code);
                        setShowLangPicker(false);
                      }}
                    >
                      <Text style={styles.langFlag}>{lang.flag}</Text>
                      <Text style={[styles.langLabel, active && styles.langLabelActive]}>
                        {lang.label}
                      </Text>
                      {active && <Text style={styles.langCheck}>✓</Text>}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* ── About group ── */}
          <View style={styles.group}>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Text style={styles.rowIcon}>📱</Text>
                <Text style={styles.rowLabel}>App Version</Text>
              </View>
              <Text style={styles.rowValue}>v{APP_VERSION}</Text>
            </View>
            <RowDivider />
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Text style={styles.rowIcon}>🗓</Text>
                <Text style={styles.rowLabel}>Member Since</Text>
              </View>
              <Text style={styles.rowValue}>
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString('en-IN', {
                      month: 'short',
                      year: 'numeric',
                    })
                  : '–'}
              </Text>
            </View>
          </View>

          {/* ── Danger zone ── */}
          <View style={styles.group}>
            <TouchableOpacity
              style={[styles.row, styles.rowDanger, isLoggingOut && { opacity: 0.5 }]}
              onPress={handleLogout}
              disabled={isLoggingOut}
              activeOpacity={0.75}
            >
              <View style={styles.rowLeft}>
                <Text style={styles.rowIcon}>🚪</Text>
                <Text style={[styles.rowLabel, styles.rowLabelDanger]}>
                  {isLoggingOut ? 'Logging out…' : 'Logout'}
                </Text>
              </View>
              <Text style={styles.rowChevron}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 32 }} />
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
          {avatarUri ? (
            <Image 
              source={avatarUri} 
              style={styles.fullScreenImage} 
              resizeMode="contain" 
            />
          ) : (
            <LinearGradient colors={['#A855F7', '#7C3AED']} style={styles.fullScreenImageFallback}>
                <Text style={[styles.avatarInitial, {fontSize: 120}]}>
                  {user?.name?.[0]?.toUpperCase() ?? '?'}
                </Text>
            </LinearGradient>
          )}
          <TouchableOpacity 
            style={styles.closeModalBtn} 
            onPress={() => setIsImageViewerVisible(false)}
          >
            <Text style={styles.closeModalText}>✕</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

// ── Small reusable pieces ─────────────────────────────────────────
const SettingsRow = ({ icon, label, value, onPress, disabled }) => (
  <TouchableOpacity
    style={styles.row}
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.75}
  >
    <View style={styles.rowLeft}>
      <Text style={styles.rowIcon}>{icon}</Text>
      <Text style={[styles.rowLabel, disabled && { opacity: 0.4 }]}>{label}</Text>
    </View>
    <View style={styles.rowRight}>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      {!disabled && <Text style={styles.rowChevron}>›</Text>}
    </View>
  </TouchableOpacity>
);

const RowDivider = () => <View style={styles.rowDivider} />;

// ── Styles ────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0A1E',
  },

  // ── Profile banner ──
  profileBanner: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 28,
    paddingHorizontal: 20,
    position: 'relative',
  },
  editBtn: {
    position: 'absolute',
    top: 16,
    right: 20,
    backgroundColor: 'rgba(124,58,237,0.3)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.5)',
  },
  editBtnText: {
    color: '#C4B5FD',
    fontSize: 13,
    fontWeight: '600',
  },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: '#7C3AED',
    overflow: 'hidden',
    marginBottom: 12,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '800',
  },
  userName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 3,
  },
  userEmail: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    marginBottom: 10,
  },
  rolePill: {
    backgroundColor: 'rgba(124,58,237,0.3)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.5)',
    marginBottom: 20,
  },
  rolePillText: {
    color: '#C4B5FD',
    fontSize: 12,
    fontWeight: '700',
  },

  // stats row
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    paddingVertical: 14,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  statNum: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  statLbl: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    marginTop: 3,
    fontWeight: '500',
  },

  // ── Settings section ──
  settingsSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionHeader: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginLeft: 4,
  },

  // card group
  group: {
    backgroundColor: '#1A1030',
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#2D1B69',
    overflow: 'hidden',
  },

  // row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowIcon: {
    fontSize: 18,
    marginRight: 14,
    width: 24,
    textAlign: 'center',
  },
  rowLabel: {
    color: '#E9D5FF',
    fontSize: 15,
    fontWeight: '500',
  },
  rowValue: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    fontWeight: '500',
  },
  rowChevron: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 18,
    fontWeight: '700',
  },
  rowDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: 16,
  },
  rowDanger: {
    // no extra style needed — label color handles it
  },
  rowLabelDanger: {
    color: '#F87171',
  },

  // language picker
  langPicker: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  langItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 4,
  },
  langItemActive: {
    backgroundColor: 'rgba(124,58,237,0.3)',
  },
  langFlag: {
    fontSize: 18,
    marginRight: 12,
  },
  langLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
    flex: 1,
    fontWeight: '500',
  },
  langLabelActive: {
    color: '#fff',
    fontWeight: '700',
  },
  langCheck: {
    color: '#A855F7',
    fontSize: 16,
    fontWeight: '700',
  },

  // modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '70%',
  },
  fullScreenImageFallback: {
    width: 300,
    height: 300,
    borderRadius: 150,
    justifyContent: 'center',
    alignItems: 'center',
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

export default ProfileScreen;