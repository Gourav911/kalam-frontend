// screens/social/CommentsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/apiService';
import { BASE_URL } from '../../constants/api';

const CommentsScreen = ({ route, navigation }) => {
  const { storyId, storyTitle } = route.params;
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    setIsLoading(true);
    const result = await apiService.getComments(storyId);
    if (result.success) {
      setComments(result.data.data ?? result.data);
    }
    setIsLoading(false);
  };

  const handleSubmit = async () => {
    if (!newComment.trim()) {
      Alert.alert('Empty', 'Please write something first.');
      return;
    }
    setIsSubmitting(true);
    const result = await apiService.addComment(
      storyId,
      newComment.trim(),
      replyTo?.id || null
    );
    setIsSubmitting(false);
    if (result.success) {
      setNewComment('');
      setReplyTo(null);
      loadComments();
    } else {
      Alert.alert('Error', result.error?.message || 'Failed to post comment');
    }
  };

  const handleDelete = (comment) => {
    Alert.alert('Delete Comment', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteComment(comment.id) },
    ]);
  };

  const deleteComment = async (commentId) => {
    const result = await apiService.deleteComment(commentId);
    if (result.success) loadComments();
    else Alert.alert('Error', 'Failed to delete comment');
  };

  // ── Comment card ──────────────────────────────────────────────
  const renderComment = ({ item }) => (
    <View style={styles.commentCard}>
      <View style={styles.commentHeader}>
        <TouchableOpacity
          style={styles.commentUserBtn}
          onPress={() => {
            const commentUserId = item.user_id || item.user?.id;
            console.log('Tapped comment user avatar/name:', commentUserId, item.user);
            if (commentUserId) {
              navigation.navigate('UserProfile', { userId: commentUserId });
            }
          }}
          activeOpacity={0.7}
        >
          {item.user?.profile_image ? (
            <Image
              source={{ uri: BASE_URL + item.user.profile_image }}
              style={styles.avatar}
            />
          ) : (
            <LinearGradient colors={['#A855F7', '#7C3AED']} style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.user?.name?.charAt(0)?.toUpperCase() ?? '?'}
              </Text>
            </LinearGradient>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{item.user?.name ?? 'Unknown'}</Text>
            <Text style={styles.commentTime}>
              {new Date(item.created_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
              })}
            </Text>
          </View>
        </TouchableOpacity>
        {item.user_id === user?.id && (
          <TouchableOpacity onPress={() => handleDelete(item)}>
            <Text style={styles.deleteBtn}>🗑</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.commentContent}>{item.content}</Text>

      <TouchableOpacity onPress={() => setReplyTo(item)} style={styles.replyBtn}>
        <Text style={styles.replyBtnText}>↩ Reply</Text>
      </TouchableOpacity>

      {/* Replies */}
      {item.replies?.length > 0 && (
        <View style={styles.repliesContainer}>
          {item.replies.map((reply) => (
            <View key={reply.id} style={styles.replyCard}>
              <View style={styles.commentHeader}>
                <TouchableOpacity
                  style={styles.commentUserBtn}
                  onPress={() => {
                    const replyUserId = reply.user_id || reply.user?.id;
                    console.log('Tapped reply user avatar/name:', replyUserId, reply.user);
                    if (replyUserId) {
                      navigation.navigate('UserProfile', { userId: replyUserId });
                    }
                  }}
                  activeOpacity={0.7}
                >
                  {reply.user?.profile_image ? (
                    <Image
                      source={{ uri: BASE_URL + reply.user.profile_image }}
                      style={styles.avatarSm}
                    />
                  ) : (
                    <LinearGradient colors={['#9333EA', '#6D28D9']} style={styles.avatarSm}>
                      <Text style={styles.avatarTextSm}>
                        {reply.user?.name?.charAt(0)?.toUpperCase() ?? '?'}
                      </Text>
                    </LinearGradient>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.userName}>{reply.user?.name}</Text>
                    <Text style={styles.commentTime}>
                      {new Date(reply.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
              <Text style={styles.commentContent}>{reply.content}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>💬</Text>
      <Text style={styles.emptyTitle}>No Comments Yet</Text>
      <Text style={styles.emptyText}>Be the first to share your thoughts!</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            💬 {storyTitle}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* List */}
        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#A855F7" />
          </View>
        ) : (
          <FlatList
            data={comments}
            renderItem={renderComment}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={renderEmpty}
            contentContainerStyle={comments.length === 0 && { flex: 1 }}
            onRefresh={loadComments}
            refreshing={isLoading}
          />
        )}

        {/* Reply banner */}
        {replyTo && (
          <View style={styles.replyBanner}>
            <Text style={styles.replyBannerText}>↩ Replying to {replyTo.user?.name}</Text>
            <TouchableOpacity onPress={() => setReplyTo(null)}>
              <Text style={styles.replyBannerClose}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder={replyTo ? 'Write a reply…' : 'Write a comment…'}
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={newComment}
            onChangeText={setNewComment}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendBtn, isSubmitting && { opacity: 0.5 }]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <LinearGradient
                colors={['#7C3AED', '#A855F7']}
                style={styles.sendGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.sendText}>Send</Text>
              </LinearGradient>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0A1E' },

  // header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#12082A',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(124,58,237,0.2)',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(124,58,237,0.15)',
    borderRadius: 20,
  },
  backText: { color: '#C4B5FD', fontSize: 20, fontWeight: '700' },
  headerTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginHorizontal: 8,
  },

  // loading
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // comment card
  commentCard: {
    backgroundColor: '#1A1030',
    marginHorizontal: 12,
    marginTop: 10,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  commentUserBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarSm: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  avatarTextSm: { color: '#fff', fontSize: 12, fontWeight: '700' },
  userName: { color: '#E9D5FF', fontSize: 13, fontWeight: '700' },
  commentTime: { color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 2 },
  deleteBtn: { fontSize: 16, opacity: 0.5 },

  commentContent: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 10,
  },

  replyBtn: { alignSelf: 'flex-start' },
  replyBtnText: { color: '#A855F7', fontSize: 12, fontWeight: '600' },

  // replies
  repliesContainer: {
    marginTop: 10,
    marginLeft: 12,
    paddingLeft: 14,
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(124,58,237,0.3)',
    gap: 10,
  },
  replyCard: {},

  // empty
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyEmoji: { fontSize: 56, marginBottom: 14 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 8 },
  emptyText: { fontSize: 14, color: 'rgba(255,255,255,0.45)', textAlign: 'center' },

  // reply banner
  replyBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(124,58,237,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(124,58,237,0.3)',
  },
  replyBannerText: { color: '#C4B5FD', fontSize: 13, fontWeight: '500' },
  replyBannerClose: { color: '#A855F7', fontSize: 18, fontWeight: '700' },

  // input row
  inputRow: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#12082A',
    borderTopWidth: 1,
    borderTopColor: 'rgba(124,58,237,0.2)',
    alignItems: 'flex-end',
    gap: 10,
  },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 110,
    backgroundColor: '#1A1030',
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#2D1B69',
    color: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
  },
  sendBtn: { borderRadius: 21, overflow: 'hidden' },
  sendGradient: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});

export default CommentsScreen;