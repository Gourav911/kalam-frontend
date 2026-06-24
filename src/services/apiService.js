// services/ApiService.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/api';
const BASE_URL = API_BASE_URL; // Replace with your Laravel API URL

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: {
        // 'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Request interceptor to add token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired, clear storage
          await AsyncStorage.removeItem('auth_token');
          await AsyncStorage.removeItem('user_data');
          // You can dispatch a logout action here
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication APIs
  async login(credentials) {
    try {
      const response = await this.api.post('/login', credentials);
      const { token, user } = response.data;

      // Store token and user data
      // await AsyncStorage.setItem('auth_token', token);
      // await AsyncStorage.setItem('user_data', JSON.stringify(user));

      return { success: true, data: response.data };
      // return { success: true, data: { token, user } };
    } catch (error) {
      return this.handleError(error?.response?.data?.message ||error.message);
    }
  }

  async register(userData) {
    try {
      const response = await this.api.post('/register', userData);
      // Store token and user data
      // await AsyncStorage.setItem('auth_token', token);
      // await AsyncStorage.setItem('user_data', JSON.stringify(user));

      return { success: true, data: response.data };
    } catch (error) {
      // console.log('error--------------/', error);
      return this.handleError(error?.response?.data?.errors || error.message);
    }
  }

  async forgotPassword(email) {
    try {
      const response = await this.api.post('/forgot-password', { email });
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async verifyForgotPasswordOtp(email, otp) {
    try {
      const response = await this.api.post('/verify-otp', { email, otp });
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async resetPassword(email, otp, password, passwordConfirmation) {
    try {
      const response = await this.api.post('/reset-password', {
        email,
        otp,
        password,
        password_confirmation: passwordConfirmation,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async logout() {
    try {
      await this.api.post('/logout');
      // Clear storage
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');
      return { success: true };
    } catch (error) {
      // Even if API call fails, clear local storage
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');
      return { success: true };
    }
  }

  async getCurrentUser() {
    try {
      const response = await this.api.get('/user');
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Story management APIs
  async getStories(filters = {}) {
    try {
      // Updated to handle filters properly like in my additional methods
      const params = new URLSearchParams();

      // Add filters to params
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });

      const response = await this.api.get(`/stories?${params.toString()}`);
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getStory(slug) {
    try {
      const response = await this.api.get(`/stories/${slug}`);
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }
  // Get profile
async getProfile() {
  try {
    const response = await this.api.get('/profile');
    return { success: true, data: response.data.data };
  } catch (error) {
    return this.handleError(error);
  }
}

// Update profile (multipart)
async updateProfile(formData) {
  try {
    const response = await this.api.post('/profile/update', formData, {
      headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',

        },
    });
    return { success: true, data: response.data };
  } catch (error) {
    return this.handleError(error?.response?.data?.message || error.message);
  }
}

  async createStory(formData) {
    try {
      const response = await this.api.post('/stories', formData, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',

        },
      });
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateStory(storyId, formData) {
    try {
      formData.append('_method', 'PUT');


      const response = await this.api.post(`/stories/${storyId}`, formData, {
        headers: {
          Accept: 'application/json',

          'Content-Type': 'multipart/form-data',
        },
      });
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deleteStory(storyId) {
    try {
      const response = await this.api.delete(`/stories/${storyId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getWriterStories(filters = {}) {
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await this.api.get(`/writer/stories?${params}`);
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async trackStoryView(storySlug) {
    try {
      const response = await this.api.post(`/stories/${storySlug}/view`);
      // console.log(response.data)
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getCategories() {
    try {
      const response = await this.api.get('/categories');
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Writer dashboard stats
  async getWriterStats() {
    try {
      const response = await this.api.get('/writer/stats');
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ========== NEW METHODS FOR CHUNK 5 ==========

  // Check if user has unlocked a story
  async checkStoryUnlock(storyId) {
    try {
      const response = await this.api.get(`/stories/${storyId}/unlock-status`);
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Like a story
  async likeStory(storyId) {
    try {
      const response = await this.api.post(`/stories/${storyId}/like`);
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Unlike a story
  async unlikeStory(storyId) {
    try {
      const response = await this.api.delete(`/stories/${storyId}/unlike`);
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Search stories (helper method)
  async searchStories(query, filters = {}) {
    try {
      const searchFilters = { ...filters, search: query };
      return await this.getStories(searchFilters);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Unified search for stories and writers preview
  async searchUnified(query, limit = 5) {
    try {
      const response = await this.api.get(`/search?q=${encodeURIComponent(query)}&limit=${limit}`);
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Helper method for error handling
  handleError(error) {
    let message = error || 'An unexpected error occurred';
    let status = 500;

    if (error.response) {
      // Server responded with error status
      message = error.response.data?.message || error.response.statusText;
      status = error.response.status;
    } else if (error.request) {
      // Request was made but no response received
      message = 'Network error. Please check your connection.';
    } else if (error) {
      message = error;
    }

    return {
      success: false,
      error: {
        message,
        status,
        details: error.response?.data?.errors || null,
      },
    };
  }

  // Token management helpers
  async getToken() {
    return await AsyncStorage.getItem('auth_token');
  }

  async getUserData() {
    const userData = await AsyncStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }

  async isAuthenticated() {
    const token = await this.getToken();
    return !!token;
  }

  /**
   * Initiate payment for story unlock
   */
  async initiatePayment(storyId, amount = 5) {
    try {
      const response = await this.api.post('/payments/initiate', {
        story_id: storyId,
        amount: amount,
      });
      return { success: true, data: response.data.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Verify payment after completion
   */
  async verifyPayment(paymentData) {
    try {
      const response = await this.api.post('/payments/verify', {
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature,
      });
      return { success: true, data: response.data.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId) {
    try {
      const response = await this.api.get(`/payments/status/${paymentId}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get user's unlocked stories
   */
  async getUnlockedStories() {
    try {
      const response = await this.api.get('/user/unlocked-stories');
      return { success: true, data: response.data.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get user's payment history
   */
  async getPaymentHistory(status = null) {
    try {
      const url = status ? `/user/payments?status=${status}` : '/user/payments';
      const response = await this.api.get(url);
      return { success: true, data: response.data.data };
    } catch (error) {
      return this.handleError(error);
    }
  }
  /**
 * Get writer's earnings summary
 */
  async getEarningsSummary() {
    try {
      const response = await this.api.get('/writer/earnings/summary');
      return { success: true, data: response.data.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get writer's earnings history
   */
  async getEarningsHistory(page = 1, perPage = 15) {
    try {
      const response = await this.api.get(`/writer/earnings?page=${page}&per_page=${perPage}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get earnings for specific story
   */
  async getStoryEarnings(storyId) {
    try {
      const response = await this.api.get(`/writer/earnings/story/${storyId}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Create withdrawal request
   */
  async createWithdrawalRequest(amount, paymentMethod, paymentDetails, note = null) {
    try {
      const response = await this.api.post('/writer/withdraw-request', {
        amount,
        payment_method: paymentMethod,
        payment_details: paymentDetails,
        writer_note: note,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get withdrawal requests
   */
  async getWithdrawalRequests(status = null) {
    try {
      const url = status ? `/writer/withdrawals?status=${status}` : '/writer/withdrawals';
      const response = await this.api.get(url);
      return { success: true, data: response.data.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Cancel withdrawal request
   */
  async cancelWithdrawalRequest(requestId) {
    try {
      const response = await this.api.delete(`/writer/withdrawals/${requestId}/cancel`);
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get writer statistics
   */
  async getWriterStatistics() {
    try {
      const response = await this.api.get('/writer/statistics');
      return { success: true, data: response.data.data };
    } catch (error) {
      return this.handleError(error);
    }
  }
  // ========== LIKES ==========

  /**
   * Like a story (already implemented, just update if needed)
   */
  async likeStory(storyId) {
    try {
      const response = await this.api.post(`/stories/${storyId}/like`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Unlike a story (already implemented, just update if needed)
   */
  async unlikeStory(storyId) {
    try {
      const response = await this.api.delete(`/stories/${storyId}/unlike`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ========== COMMENTS ==========

  /**
   * Get comments for a story
   */
  async getComments(storyId, page = 1, perPage = 20) {
    try {
      const response = await this.api.get(`/stories/${storyId}/comments?page=${page}&per_page=${perPage}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Add a comment to a story
   */
  async addComment(storyId, content, parentId = null) {
    try {
      const response = await this.api.post(`/stories/${storyId}/comments`, {
        content,
        parent_id: parentId,
      });
      return { success: true, data: response.data.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId) {
    try {
      const response = await this.api.delete(`/comments/${commentId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ========== FOLLOW SYSTEM ==========

  /**
   * Follow a user
   */
  async followUser(userId) {
    try {
      const response = await this.api.post(`/users/${userId}/follow`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Unfollow a user
   */
  async unfollowUser(userId) {
    try {
      const response = await this.api.delete(`/users/${userId}/unfollow`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get user's followers
   */
  async getFollowers(userId, page = 1, perPage = 20) {
    try {
      const response = await this.api.get(`/users/${userId}/followers?page=${page}&per_page=${perPage}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get user's following
   */
  async getFollowing(userId, page = 1, perPage = 20) {
    try {
      const response = await this.api.get(`/users/${userId}/following?page=${page}&per_page=${perPage}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get user profile with social stats
   */
  async getUserProfile(userId) {
    try {
      const response = await this.api.get(`/users/${userId}/profile`);
      return { success: true, data: response.data.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ========== NOTIFICATIONS ==========

  /**
   * Get notifications
   */
  async getNotifications(page = 1, perPage = 20, unreadOnly = false) {
    try {
      const url = unreadOnly
        ? `/notifications?page=${page}&per_page=${perPage}&unread_only=true`
        : `/notifications?page=${page}&per_page=${perPage}`;
      const response = await this.api.get(url);
      return { success: true, data: response.data.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId) {
    try {
      const response = await this.api.put(`/notifications/${notificationId}/read`);
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsAsRead() {
    try {
      const response = await this.api.put('/notifications/read-all');
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get unread notifications count
   */
  async getUnreadNotificationsCount() {
    try {
      const response = await this.api.get('/notifications/unread-count');
      return { success: true, data: response.data.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId) {
    try {
      const response = await this.api.delete(`/notifications/${notificationId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ========== SHORT STORIES (Status Feature) ==========

  /**
   * Get active short stories feed (grouped by user, from followed users + self)
   */
  async getShortStoriesFeed() {
    try {
      const response = await this.api.get('/short-stories');
      return { success: true, data: response.data.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get the current user's own active short stories
   */
  async getMyShortStories() {
    try {
      const response = await this.api.get('/short-stories/my');
      return { success: true, data: response.data.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Upload a new short story (image/video/text)
   * @param {FormData} formData - includes 'media', 'caption', 'bg_color', 'media_type'
   */
  async createShortStory(formData) {
    try {
      const response = await this.api.post('/short-stories', formData, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });
      return { success: true, data: response.data.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Mark a short story as viewed by the current user
   */
  async viewShortStory(shortStoryId) {
    try {
      const response = await this.api.post(`/short-stories/${shortStoryId}/view`);
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Delete one of the current user's short stories
   */
  async deleteShortStory(shortStoryId) {
    try {
      const response = await this.api.delete(`/short-stories/${shortStoryId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Toggle like on a short story (like ↔ unlike)
   */
  async toggleShortStoryLike(shortStoryId) {
    try {
      const response = await this.api.post(`/short-stories/${shortStoryId}/like`);
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get viewers of a short story (owner only)
   */
  async getShortStoryViewers(shortStoryId) {
    try {
      const response = await this.api.get(`/short-stories/${shortStoryId}/viewers`);
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get users who liked a short story
   */
  async getShortStoryLikers(shortStoryId) {
    try {
      const response = await this.api.get(`/short-stories/${shortStoryId}/likes`);
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }
}

export default new ApiService();