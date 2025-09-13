// // screens/writer/WriterDashboardScreen.js
// import React, { useState, useCallback } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   StyleSheet,
//   TouchableOpacity,
//   RefreshControl,
//   ActivityIndicator,
//   Alert,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useFocusEffect } from '@react-navigation/native';
// import { useAuth } from '../../contexts/AuthContext';
// import ApiService from '../../services/ApiService';

// const WriterDashboardScreen = ({ navigation }) => {
//   const { user } = useAuth();
//   const [refreshing, setRefreshing] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
  
//   // Stats data
//   const [stats, setStats] = useState({
//     totalStories: 0,
//     totalViews: 0,
//     totalLikes: 0,
//     totalEarnings: 0,
//     thisMonthEarnings: 0,
//   });

//   // Recent stories data
//   const [recentStories, setRecentStories] = useState([]);

//   useFocusEffect(
//     useCallback(() => {
//       loadDashboardData();
//     }, [])
//   );

//   const loadDashboardData = async (isRefresh = false) => {
//     if (isRefresh) {
//       setRefreshing(true);
//     } else {
//       setIsLoading(true);
//     }

//     try {
//       // Load writer's stories (recent 5)
//       const storiesResult = await ApiService.getWriterStories({ per_page: 5 });
//       if (storiesResult.success) {
//         const stories = storiesResult.data.data || [];
//         setRecentStories(stories);
        
//         // Calculate stats from stories
//         const totalStories = storiesResult.data.total || stories.length;
//         const totalViews = stories.reduce((sum, story) => sum + (story.views_count || 0), 0);
//         const totalLikes = stories.reduce((sum, story) => sum + (story.likes_count || 0), 0);
        
//         // Mock earnings calculation (you'll implement real earnings in Chunk 8)
//         const totalEarnings = totalViews * 0.10; // Mock: ₹0.10 per view
//         const thisMonthEarnings = totalEarnings * 0.3; // Mock: 30% this month
        
//         setStats({
//           totalStories,
//           totalViews,
//           totalLikes,
//           totalEarnings,
//           thisMonthEarnings,
//         });
//       }
//     } catch (error) {
//       console.error('Error loading dashboard data:', error);
//       Alert.alert('Error', 'Failed to load dashboard data');
//     } finally {
//       setIsLoading(false);
//       setRefreshing(false);
//     }
//   };

//   const handleCreateStory = () => {
//     navigation.navigate('CreateEditStory');
//   };

//   const handleStoryPress = (story) => {
//     navigation.navigate('StoryPreview', { story });
//   };

//   const handleViewAllStories = () => {
//     navigation.navigate('MyStories');
//   };

//   const formatCurrency = (amount) => {
//     return `₹${parseFloat(amount).toFixed(2)}`;
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'published':
//         return '#4caf50';
//       case 'draft':
//         return '#ff9800';
//       case 'pending':
//         return '#2196f3';
//       default:
//         return '#666';
//     }
//   };

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString('en-IN', {
//       day: 'numeric',
//       month: 'short',
//     });
//   };

//   if (isLoading && !refreshing) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#007AFF" />
//           <Text style={styles.loadingText}>Loading dashboard...</Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={() => loadDashboardData(true)} />
//         }
//       >
//         {/* Header */}
//         <View style={styles.header}>
//           <Text style={styles.greeting}>
//             Welcome back, {user?.name || 'Writer'}! ✍️
//           </Text>
//           <Text style={styles.subtitle}>Your writing dashboard</Text>
//         </View>

//         {/* Quick Actions */}
//         <View style={styles.actionsContainer}>
//           <TouchableOpacity
//             style={styles.createButton}
//             onPress={handleCreateStory}
//           >
//             <Text style={styles.createButtonText}>+ Create New Story</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Stats Cards */}
//         <View style={styles.statsContainer}>
//           <View style={styles.statsRow}>
//             <View style={styles.statCard}>
//               <Text style={styles.statNumber}>{stats.totalStories}</Text>
//               <Text style={styles
              // screens/writer/WriterDashboardScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
const WriterDashboardScreen = () => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
    const navigation = useNavigation();

  // Mock data for writer stats (you'll replace this with API calls in Chunk 8)
  const [stats] = useState({
    totalStories: 5,
    totalViews: 1250,
    totalLikes: 89,
    totalEarnings: 125.50,
    thisMonthEarnings: 45.25,
  });

  // Mock data for writer's stories (you'll replace this with API calls in Chunk 4)
  const [myStories] = useState([
    {
      id: 1,
      title: 'The Midnight Adventure',
      status: 'published',
      views: 456,
      likes: 42,
      earnings: 35.75,
      created_at: '2024-01-15',
    },
    {
      id: 2,
      title: 'Love in the Digital Age',
      status: 'published',
      views: 234,
      likes: 28,
      earnings: 18.50,
      created_at: '2024-01-10',
    },
    {
      id: 3,
      title: 'The Unfinished Symphony',
      status: 'draft',
      views: 0,
      likes: 0,
      earnings: 0,
      created_at: '2024-01-20',
    },
  ]);

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Fetch latest stats and stories from API
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const handleCreateStory = () => {
    navigation.navigate('CreateEditStory'); // Replace 'CreateStory' with your actual screen name
    console.log('Create new story');
  };
    const handleMyStory = () => {
    navigation.navigate('MyStories'); // Replace 'MyStories' with your actual screen name
    console.log('MyStories');
  };


  const handleStoryPress = (story) => {
    // TODO: Navigate to edit story screen
    console.log('Edit story:', story.title);
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return '#4caf50';
      case 'draft':
        return '#ff9800';
      case 'pending':
        return '#2196f3';
      default:
        return '#666';
    }
  };

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
            Welcome back, {user?.name || 'Writer'}! ✍️
          </Text>
          <Text style={styles.subtitle}>Your writing dashboard</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.totalStories}</Text>
              <Text style={styles.statLabel}>Stories</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.totalViews}</Text>
              <Text style={styles.statLabel}>Total Views</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.totalLikes}</Text>
              <Text style={styles.statLabel}>Total Likes</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{formatCurrency(stats.totalEarnings)}</Text>
              <Text style={styles.statLabel}>Total Earnings</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateStory}
          >
            <Text style={styles.createButtonText}>+ Create New Story</Text>
          </TouchableOpacity>
        </View>

        {/* Earnings Summary */}
        <View style={styles.earningsContainer}>
          <Text style={styles.sectionTitle}>Earnings</Text>
          <View style={styles.earningsCard}>
            <View style={styles.earningsRow}>
              <Text style={styles.earningsLabel}>This Month</Text>
              <Text style={styles.earningsAmount}>
                {formatCurrency(stats.thisMonthEarnings)}
              </Text>
            </View>
            <View style={styles.earningsRow}>
              <Text style={styles.earningsLabel}>Total Earned</Text>
              <Text style={styles.earningsAmountTotal}>
                {formatCurrency(stats.totalEarnings)}
              </Text>
            </View>
            <TouchableOpacity style={styles.withdrawButton}>
              <Text style={styles.withdrawButtonText}>Request Withdrawal</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* My Stories */}
        {/* <View style={styles.storiesContainer}>
          <Text style={styles.sectionTitle}>My Stories</Text>
          {myStories.map((story) => (
            <TouchableOpacity
              key={story.id}
              style={styles.storyCard}
              onPress={() => handleStoryPress(story)}
            >
              <View style={styles.storyHeader}>
                <Text style={styles.storyTitle}>{story.title}</Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(story.status) }
                ]}>
                  <Text style={styles.statusText}>
                    {story.status.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={styles.storyDate}>
                Created: {new Date(story.created_at).toLocaleDateString()}
              </Text>
              <View style={styles.storyStats}>
                <Text style={styles.statText}>👁️ {story.views}</Text>
                <Text style={styles.statText}>❤️ {story.likes}</Text>
                <Text style={styles.statText}>
                  💰 {formatCurrency(story.earnings)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View> */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleMyStory}
          >
            <Text style={styles.createButtonText}>My Stories</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  statsContainer: {
    padding: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  earningsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  earningsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  earningsLabel: {
    fontSize: 16,
    color: '#666',
  },
  earningsAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4caf50',
  },
  earningsAmountTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  withdrawButton: {
    backgroundColor: '#4caf50',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 15,
  },
  withdrawButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  storiesContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  storyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  storyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  storyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  storyDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  storyStats: {
    flexDirection: 'row',
    gap: 15,
  },
  statText: {
    fontSize: 12,
    color: '#666',
  },
});

export default WriterDashboardScreen;