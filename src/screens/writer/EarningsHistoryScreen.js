// screens/writer/EarningsHistoryScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiService from '../../services/apiService';

const EarningsHistoryScreen = ({ navigation }) => {
  const [earnings, setEarnings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadEarnings();
  }, []);

  const loadEarnings = async (page = 1) => {
    if (page === 1) setIsLoading(true);
    
    const result = await apiService.getEarningsHistory(page);
    
    if (result.success) {
      if (page === 1) {
        setEarnings(result.data.data);
      } else {
        setEarnings([...earnings, ...result.data.data]);
      }
      setHasMore(result.data.current_page < result.data.last_page);
      setCurrentPage(page);
    }
    
    setIsLoading(false);
    setRefreshing(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadEarnings(1);
  };

  const loadMore = () => {
    if (!isLoading && hasMore) {
      loadEarnings(currentPage + 1);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.earningCard}
      onPress={() => navigation.navigate('StoryDetail', { storyId: item.story_id })}
    >
      <View style={styles.earningHeader}>
        <Text style={styles.storyTitle} numberOfLines={2}>
          {item.story?.title}
        </Text>
        <View style={[styles.statusBadge, styles[item.status]]}>
          <Text style={styles.statusText}>
            {item.status === 'available' ? 'Available' : 'Withdrawn'}
          </Text>
        </View>
      </View>

      <View style={styles.earningDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Amount Earned</Text>
          <Text style={styles.amountEarned}>₹{parseFloat(item.amount).toFixed(2)}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date</Text>
          <Text style={styles.detailValue}>
            {new Date(item.earned_at).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Platform Fee</Text>
          <Text style={styles.detailValue}>₹{parseFloat(item.platform_fee).toFixed(2)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>💰</Text>
      <Text style={styles.emptyTitle}>No Earnings Yet</Text>
      <Text style={styles.emptyText}>
        Your earnings will appear here when readers unlock your stories.
      </Text>
    </View>
  );

  if (isLoading && earnings.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading earnings...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Earnings History</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={earnings}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={earnings.length === 0 && styles.emptyList}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 60,
  },
  earningCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  earningHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  storyTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  available: {
    backgroundColor: '#d4edda',
  },
  withdrawn: {
    backgroundColor: '#f8d7da',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#155724',
  },
  earningDetails: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  amountEarned: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default EarningsHistoryScreen;