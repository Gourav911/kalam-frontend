// screens/social/UserProfileScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import apiService from '../../services/apiService';
import { BASE_URL } from '../../constants/api';

const UserProfileScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    const result = await apiService.getUserProfile(userId);
    if (result.success) {
      setProfile(result.data);
      setIsFollowing(result.data.is_following);
    }
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleFollowToggle = async () => {
    setIsProcessing(true);
    const result = isFollowing
      ? await apiService.unfollowUser(userId)
      : await apiService.followUser(userId);
    setIsProcessing(false);

    if (result.success) {
      setIsFollowing(!isFollowing);
      setProfile((prev) => ({
        ...prev,
        followers_count: isFollowing
          ? prev.followers_count - 1
          : prev.followers_count + 1,
      }));
    } else {
      Alert.alert('Error', result.error?.message || 'Action failed');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <Text style={styles.loadingText}>Loading profile…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.center}>
          <Text style={styles.errorText}>Profile not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const avatarUri = profile.profile_image
    ? { uri: BASE_URL + profile.profile_image }
    : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Back button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {/* Avatar + gradient banner */}
        <LinearGradient colors={['#2D1B69', '#0F0A1E']} style={styles.banner}>
          <TouchableOpacity 
            style={styles.avatarRing}
            onPress={() => setIsImageViewerVisible(true)}
            activeOpacity={0.8}
          >
            {avatarUri ? (
              <Image source={avatarUri} style={styles.avatarImage} />
            ) : (
              <LinearGradient colors={['#A855F7', '#7C3AED']} style={styles.avatarImage}>
                <Text style={styles.avatarInitial}>
                  {profile.name?.[0]?.toUpperCase() ?? '?'}
                </Text>
              </LinearGradient>
            )}
          </TouchableOpacity>

          <Text style={styles.name}>{profile.name}</Text>

          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {profile.role === 'writer' ? '✍️ Writer' : '📖 Reader'}
            </Text>
          </View>

          {profile.bio ? (
            <Text style={styles.bio}>{profile.bio}</Text>
          ) : null}
        </LinearGradient>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <TouchableOpacity
            style={styles.statItem}
            onPress={() => navigation.navigate('FollowersList', { userId, type: 'followers' })}
          >
            <Text style={styles.statNumber}>{profile.followers_count ?? 0}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </TouchableOpacity>

          <View style={styles.statDivider} />

          <TouchableOpacity
            style={styles.statItem}
            onPress={() => navigation.navigate('FollowersList', { userId, type: 'following' })}
          >
            <Text style={styles.statNumber}>{profile.following_count ?? 0}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </TouchableOpacity>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profile.stories_count ?? 0}</Text>
            <Text style={styles.statLabel}>Stories</Text>
          </View>
        </View>

        {/* Action button */}
        {!profile.is_own_profile ? (
          <TouchableOpacity
            style={[styles.actionBtn, isFollowing && styles.actionBtnFollowing]}
            onPress={handleFollowToggle}
            disabled={isProcessing}
            activeOpacity={0.85}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color={isFollowing ? '#A855F7' : '#fff'} />
            ) : isFollowing ? (
              <Text style={[styles.actionBtnText, styles.actionBtnTextFollowing]}>
                ✓ Following
              </Text>
            ) : (
              <LinearGradient
                colors={['#7C3AED', '#A855F7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.actionBtnGradient}
              >
                <Text style={styles.actionBtnText}>+ Follow</Text>
              </LinearGradient>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        )}

        {/* Writer's stories link */}
        {profile.role === 'writer' && profile.stories_count > 0 && (
          <TouchableOpacity
            style={styles.storiesLink}
            onPress={() =>
              navigation.navigate('WriterStories', {
                writerId: userId,
                writerName: profile.name,
              })
            }
          >
            <Text style={styles.storiesLinkText}>
              📚 View all {profile.stories_count} stories →
            </Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
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
                  {profile.name?.[0]?.toUpperCase() ?? '?'}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0A1E',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'rgba(255,255,255,0.5)',
    marginTop: 12,
    fontSize: 14,
  },
  errorText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
  },

  // Back
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backText: {
    color: '#A855F7',
    fontSize: 15,
    fontWeight: '600',
  },

  // Banner
  banner: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  avatarRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#7C3AED',
    overflow: 'hidden',
    marginBottom: 14,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: '#fff',
    fontSize: 38,
    fontWeight: '800',
  },
  name: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: 'rgba(124,58,237,0.35)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#7C3AED',
    marginBottom: 10,
  },
  roleText: {
    color: '#C4B5FD',
    fontSize: 12,
    fontWeight: '600',
  },
  bio: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 4,
    paddingHorizontal: 10,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#1A1030',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    marginTop: -16,
    borderWidth: 1,
    borderColor: '#2D1B69',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#2D1B69',
  },
  statNumber: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 3,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
    fontWeight: '500',
  },

  // Follow button
  actionBtn: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 14,
    overflow: 'hidden',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnFollowing: {
    borderWidth: 1.5,
    borderColor: '#7C3AED',
    backgroundColor: 'transparent',
  },
  actionBtnGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  actionBtnTextFollowing: {
    color: '#A855F7',
  },

  // Edit button
  editBtn: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 14,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#7C3AED',
  },
  editBtnText: {
    color: '#A855F7',
    fontSize: 16,
    fontWeight: '600',
  },

  // Stories link
  storiesLink: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: '#1A1030',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2D1B69',
  },
  storiesLinkText: {
    color: '#C4B5FD',
    fontSize: 14,
    fontWeight: '600',
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

export default UserProfileScreen;