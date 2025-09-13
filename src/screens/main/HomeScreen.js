// // screens/main/HomeScreen.js
// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   StyleSheet,
//   TouchableOpacity,
//   Image,
//   RefreshControl,
//   TextInput,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useAuth } from '../../contexts/AuthContext';

// const HomeScreen = () => {
//   const { user } = useAuth();
//   const [refreshing, setRefreshing] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
  
//   // Mock data for stories (you'll replace this with API calls in Chunk 5)
//   const [stories] = useState([
//     {
//       id: 1,
//       title: 'The Midnight Adventure',
//       author: 'Sarah Johnson',
//       category: 'Adventure',
//       cover_image: 'https://via.placeholder.com/150x200',
//       excerpt: 'A thrilling tale of courage and discovery...',
//       likes: 42,
//       views: 156,
//     },
//     {
//       id: 2,
//       title: 'Love in the Time of Coffee',
//       author: 'Mike Chen',
//       category: 'Romance',
//       cover_image: 'https://via.placeholder.com/150x200',
//       excerpt: 'When two coffee lovers meet at a small cafe...',
//       likes: 28,
//       views: 89,
//     },
//     {
//       id: 3,
//       title: 'The Digital Detective',
//       author: 'Emma Wilson',
//       category: 'Mystery',
//       cover_image: 'https://via.placeholder.com/150x200',
//       excerpt: 'In a world where crimes happen online...',
//       likes: 67,
//       views: 234,
//     },
//   ]);

//   const onRefresh = async () => {
//     setRefreshing(true);
//     // TODO: Fetch latest stories from API
//     setTimeout(() => {
//       setRefreshing(false);
//     }, 2000);
//   };

//   const handleStoryPress = (story) => {
//     // TODO: Navigate to story reading screen
//     console.log('Opening story:', story.title);
//   };

//   const categories = ['All', 'Romance', 'Adventure', 'Mystery', 'Drama', 'Comedy'];

//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//         }
//       >
//         {/* Header */}
//         <View style={styles.header}>
//           <Text style={styles.greeting}>
//             Hello, {user?.name || 'Reader'}! 👋
//           </Text>
//           <Text style={styles.subtitle}>Discover amazing stories</Text>
//         </View>

//         {/* Search Bar */}
//         <View style={styles.searchContainer}>
//           <TextInput
//             style={styles.searchInput}
//             placeholder="Search stories..."
//             value={searchQuery}
//             onChangeText={setSearchQuery}
//           />
//         </View>

//         {/* Categories */}
//         <View style={styles.categoriesContainer}>
//           <Text style={styles.sectionTitle}>Categories</Text>
//           <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//             <View style={styles.categoriesList}>
//               {categories.map((category) => (
//                 <TouchableOpacity key={category} style={styles.categoryChip}>
//                   <Text style={styles.categoryText}>{category}</Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
//           </ScrollView>
//         </View>

//         {/* Featured Stories */}
//         <View style={styles.storiesContainer}>
//           <Text style={styles.sectionTitle}>Featured Stories</Text>
//           {stories.map((story) => (
//             <TouchableOpacity
//               key={story.id}
//               style={styles.storyCard}
//               onPress={() => handleStoryPress(story)}
//             >
//               <Image
//                 source={{ uri: story.cover_image }}
//                 style={styles.storyCover}
//               />
//               <View style={styles.storyInfo}>
//                 <Text style={styles.storyTitle}>{story.title}</Text>
//                 <Text style={styles.storyAuthor}>by {story.author}</Text>
//                 <Text style={styles.storyExcerpt}>{story.excerpt}</Text>
//                 <View style={styles.storyStats}>
//                   <Text style={styles.statText}>❤️ {story.likes}</Text>
//                   <Text style={styles.statText}>👁️ {story.views}</Text>
//                   <View style={styles.categoryBadge}>
//                     <Text style={styles.categoryBadgeText}>{story.category}</Text>
//                   </View>
//                 </View>
//               </View>
//             </TouchableOpacity>
//           ))}
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// screens/main/HomeScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/apiService';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [stories, setStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    await fetchCategories();
    await fetchStories();
    setIsLoading(false);
  };

  const fetchCategories = async () => {
    const result = await apiService.getCategories();
    if (result.success) {
      setCategories([{ id: 'All', name: 'All' }, ...result.data.data]);
    }
  };

  const fetchStories = async (category = null, search = '') => {
    const filters = { per_page: 10 };
    if (category && category !== 'All') filters.category = category;
    if (search) filters.search = search;

    const result = await apiService.getStories(filters);
    if (result.success) {
      setStories(result.data.data.data || []);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStories(selectedCategory, searchQuery);
    setRefreshing(false);
  };

  const handleCategoryPress = (category) => {
    setSelectedCategory(category.name);
    fetchStories(category.id, searchQuery);
  };

  const handleSearch = () => {
    fetchStories(selectedCategory, searchQuery);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ textAlign: 'center', marginTop: 10 }}>Loading stories...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Hello, {user?.name || 'Reader'}! 👋
          </Text>
          <Text style={styles.subtitle}>Discover amazing stories</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search stories..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
        </View>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoriesList}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    selectedCategory === cat.name && styles.categoryChipActive,
                  ]}
                  onPress={() => handleCategoryPress(cat)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === cat.name && styles.categoryTextActive,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Featured Stories */}
        <View style={styles.storiesContainer}>
          <Text style={styles.sectionTitle}>Featured Stories</Text>
          {stories.map((story) => (
            <TouchableOpacity
              key={story.id}
              style={styles.storyCard}
              onPress={() => navigation.navigate(user.role=="reader"?"StoryPreviewScreenReader":"StoryPreview", { story })}
            >
              <Image
                source={{ uri: story.cover_image_url || 'https://via.placeholder.com/150x200' }}
                style={styles.storyCover}
              />
              <View style={styles.storyInfo}>
                <Text style={styles.storyTitle}>{story.title}</Text>
                <Text style={styles.storyAuthor}>by {story.author?.name}</Text>
                <Text style={styles.storyExcerpt} numberOfLines={2}>{story.excerpt}</Text>
                <View style={styles.storyStats}>
                  <Text style={styles.statText}>❤️ {story.likes_count}</Text>
                  <Text style={styles.statText}>👁️ {story.views_count}</Text>
                  {story.category && (
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>{story.category.name}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f8f9fa',
//   },
//   header: {
//     padding: 20,
//     backgroundColor: '#fff',
//     borderBottomWidth: 1,
//     borderBottomColor: '#e1e8ed',
//   },
//   greeting: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   subtitle: {
//     fontSize: 16,
//     color: '#666',
//     marginTop: 5,
//   },
//   searchContainer: {
//     padding: 20,
//     backgroundColor: '#fff',
//   },
//   searchInput: {
//     backgroundColor: '#f1f3f4',
//     borderRadius: 25,
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     fontSize: 16,
//   },
//   categoriesContainer: {
//     backgroundColor: '#fff',
//     paddingBottom: 20,
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#333',
//     paddingHorizontal: 20,
//     marginBottom: 15,
//   },
//   categoriesList: {
//     flexDirection: 'row',
//     paddingHorizontal: 20,
//     gap: 10,
//   },
//   categoryChip: {
//     backgroundColor: '#6B46C1',
//     borderRadius: 20,
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//   },
//   categoryText: {
//     color: '#fff',
//     fontWeight: '500',
//   },
//   storiesContainer: {
//     padding: 20,
//   },
//   storyCard: {
//     flexDirection: 'row',
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     marginBottom: 15,
//     overflow: 'hidden',
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 1,
//     },
//     shadowOpacity: 0.22,
//     shadowRadius: 2.22,
//   },
//   storyCover: {
//     width: 100,
//     height: 120,
//     backgroundColor: '#e1e8ed',
//   },
//   storyInfo: {
//     flex: 1,
//     padding: 15,
//   },
//   storyTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 5,
//   },
//   storyAuthor: {
//     fontSize: 14,
//     color: '#666',
//     marginBottom: 8,
//   },
//   storyExcerpt: {
//     fontSize: 14,
//     color: '#555',
//     lineHeight: 20,
//     marginBottom: 10,
//   },
//   storyStats: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 15,
//   },
//   statText: {
//     fontSize: 12,
//     color: '#666',
//   },
//   categoryBadge: {
//     backgroundColor: '#e3f2fd',
//     borderRadius: 10,
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     marginLeft: 'auto',
//   },
//   categoryBadgeText: {
//     fontSize: 10,
//     color: '#6B46C1',
//     fontWeight: '500',
//   },
// });

// Add these styles to your existing HomeScreen.js

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  searchInput: {
    height: 44,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 22,
    paddingHorizontal: 20,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  categoriesList: {
    flexDirection: 'row',
    paddingRight: 20,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  categoryChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#fff',
  },
  storiesContainer: {
    paddingHorizontal: 20,
  },
  storyCard: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  storyCover: {
    width: 80,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  storyInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  storyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  storyAuthor: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  storyExcerpt: {
    fontSize: 13,
    color: '#888',
    lineHeight: 18,
    marginBottom: 8,
  },
  storyStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statText: {
    fontSize: 12,
    color: '#666',
    marginRight: 12,
  },
  categoryBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  categoryBadgeText: {
    fontSize: 11,
    color: '#1976d2',
    fontWeight: '500',
  },
});
export default HomeScreen;