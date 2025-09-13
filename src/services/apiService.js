// // services/ApiService.js
// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { API_BASE_URL } from '../constants/api';
// const BASE_URL = API_BASE_URL; // Replace with your Laravel API URL

// class ApiService {
//   constructor() {
//     this.api = axios.create({
//       baseURL: BASE_URL,
//       timeout: 10000,
//       headers: {
//         'Content-Type': 'application/json',
//         'Accept': 'application/json',
//       },
//     });

//     // Request interceptor to add token
//     this.api.interceptors.request.use(
//       async (config) => {
//         const token = await AsyncStorage.getItem('auth_token');
//         if (token) {
//           config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//       },
//       (error) => {
//         return Promise.reject(error);
//       }
//     );

//     // Response interceptor for error handling
//     this.api.interceptors.response.use(
//       (response) => response,
//       async (error) => {
//         if (error.response?.status === 401) {
//           // Token expired, clear storage
//           await AsyncStorage.removeItem('auth_token');
//           await AsyncStorage.removeItem('user_data');
//           // You can dispatch a logout action here
//         }
//         return Promise.reject(error);
//       }
//     );
//   }

//   // Authentication APIs
//   async login(credentials) {
//     try {
//       const response = await this.api.post('/login',  credentials );
//       const { token, user } = response.data;
      
//       // Store token and user data
//       // await AsyncStorage.setItem('auth_token', token);
//       // await AsyncStorage.setItem('user_data', JSON.stringify(user));
      
//       return { success: true, data: response.data };
//       // return { success: true, data: { token, user } };
//     } catch (error) {
//       // console.log(error)
//       // console.log('error--------------/', error.response.data.message);
//       return this.handleError(error.response.data.message);
//     }
//   }

//   async register(userData) {
//     try {
//       const response = await this.api.post('/register', userData);
//       const { token, user } = response.data;
//       console.log(response)
//       // Store token and user data
//       // await AsyncStorage.setItem('auth_token', token);
//       // await AsyncStorage.setItem('user_data', JSON.stringify(user));
      
//       return { success: true, data:response.data };
//     } catch (error) {
//       // console.log('error--------------/', error);
//       return this.handleError(error.response.data.errors);
//     }
//   }

//   async forgotPassword(email) {
//     try {
//       const response = await this.api.post('/forgot-password', { email });
//       return { success: true, data: response.data };
//     } catch (error) {
//       return this.handleError(error);
//     }
//   }

//   async resetPassword(token, email, password, passwordConfirmation) {
//     try {
//       const response = await this.api.post('/reset-password', {
//         token,
//         email,
//         password,
//         password_confirmation: passwordConfirmation,
//       });
//       return { success: true, data: response.data };
//     } catch (error) {
//       return this.handleError(error);
//     }
//   }

//   async logout() {
//     try {
//       await this.api.post('/logout');
//       // Clear storage
//       await AsyncStorage.removeItem('auth_token');
//       await AsyncStorage.removeItem('user_data');
//       return { success: true };
//     } catch (error) {
//       // Even if API call fails, clear local storage
//       await AsyncStorage.removeItem('auth_token');
//       await AsyncStorage.removeItem('user_data');
//       return { success: true };
//     }
//   }

//   async getCurrentUser() {
//     try {
//       const response = await this.api.get('/user');
//       return { success: true, data: response.data };
//     } catch (error) {
//       return this.handleError(error);
//     }
//   }

//   // Helper method for error handling
//   handleError(error) {
//     let message = error || 'An unexpected error occurred';
//     let status = 500;

//     if (error.response ) {
//       // Server responded with error status
//       message = error.response.data?.message || error.response.statusText;
//       status = error.response.status;
//     } else if (error.request) {
//       // Request was made but no response received
//       message = 'Network error. Please check your connection.';
//     }else if(error){
//       message = error;
//     }


//     return {
//       success: false,
//       error: {
//         message,
//         status,
//         details: error.response?.data?.errors || null,
//       },
//     };
//   }

//   // Story management APIs
//   async getStories(filters = {}) {
//     try {
//       const params = new URLSearchParams(filters).toString();
//       const response = await this.api.get(`/stories?${params}`);
//       return { success: true, data: response.data };
//     } catch (error) {
//       return this.handleError(error);
//     }
//   }

//   async getStory(slug) {
//     try {
//       const response = await this.api.get(`/stories/${slug}`);
//       return { success: true, data: response.data };
//     } catch (error) {
//       return this.handleError(error);
//     }
//   }
  
//   async createStory(formData) {
//     try {
//       const response = await this.api.post('/stories', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });
//       return { success: true, data: response.data };
//     } catch (error) {
//       return this.handleError(error);
//     }
//   }

//   async updateStory(storyId, formData) {
//     try {
//           formData.append('_method', 'PUT');

//       const response = await this.api.post(`/stories/${storyId}`, formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });
//       return { success: true, data: response.data };x
//     } catch (error) {
//       return this.handleError(error);
//     }
//   }

//   async deleteStory(storyId) {
//     try {
//       const response = await this.api.delete(`/stories/${storyId}`);
//       return { success: true, data: response.data };
//     } catch (error) {
//       return this.handleError(error);
//     }
//   }

//   async getWriterStories(filters = {}) {
//     try {
//       const params = new URLSearchParams(filters).toString();
//       const response = await this.api.get(`/writer/stories?${params}`);
//       console.log(response.data)
//       return { success: true, data: response.data };
//     } catch (error) {
//       return this.handleError(error);
//     }
//   }

//   async trackStoryView(storySlug) {
//     try {
//       const response = await this.api.post(`/stories/${storySlug}/view`);
//       return { success: true, data: response.data };
//     } catch (error) {
//       return this.handleError(error);
//     }
//   }

//   async getCategories() {
//     try {
//       const response = await this.api.get('/categories');
//       return { success: true, data: response.data };
//     } catch (error) {
//       return this.handleError(error);
//     }
//   }

//   // Writer dashboard stats
//   async getWriterStats() {
//     try {
//       const response = await this.api.get('/writer/stats');
//       return { success: true, data: response.data };
//     } catch (error) {
//       return this.handleError(error);
//     }
//   }

//   // Token management helpers
//   async getToken() {
//     return await AsyncStorage.getItem('auth_token');
//   }

//   async getUserData() {
//     const userData = await AsyncStorage.getItem('user_data');
//     return userData ? JSON.parse(userData) : null;
//   }

//   async isAuthenticated() {
//     const token = await this.getToken();
//     return !!token;
//   }
// }

// export default new ApiService();

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
        'Content-Type': 'application/json',
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
      const response = await this.api.post('/login',  credentials );
      const { token, user } = response.data;
      
      // Store token and user data
      // await AsyncStorage.setItem('auth_token', token);
      // await AsyncStorage.setItem('user_data', JSON.stringify(user));
      
      return { success: true, data: response.data };
      // return { success: true, data: { token, user } };
    } catch (error) {
      // console.log(error)
      // console.log('error--------------/', error.response.data.message);
      return this.handleError(error.response.data.message);
    }
  }

  async register(userData) {
    try {
      const response = await this.api.post('/register', userData);
      const { token, user } = response.data;
      console.log(response)
      // Store token and user data
      // await AsyncStorage.setItem('auth_token', token);
      // await AsyncStorage.setItem('user_data', JSON.stringify(user));
      
      return { success: true, data:response.data };
    } catch (error) {
      // console.log('error--------------/', error);
      return this.handleError(error.response.data.errors);
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

  async resetPassword(token, email, password, passwordConfirmation) {
    try {
      const response = await this.api.post('/reset-password', {
        token,
        email,
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
  
  async createStory(formData) {
    try {
      const response = await this.api.post('/stories', formData, {
        headers: {
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
      console.log(response.data)
      return { success: true, data: response.data };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async trackStoryView(storySlug) {
    try {
      const response = await this.api.post(`/stories/${storySlug}/view`);
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

  // Helper method for error handling
  handleError(error) {
    let message = error || 'An unexpected error occurred';
    let status = 500;

    if (error.response ) {
      // Server responded with error status
      message = error.response.data?.message || error.response.statusText;
      status = error.response.status;
    } else if (error.request) {
      // Request was made but no response received
      message = 'Network error. Please check your connection.';
    }else if(error){
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
}

export default new ApiService();