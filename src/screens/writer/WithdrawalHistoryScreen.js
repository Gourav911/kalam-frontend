// screens/writer/WithdrawalHistoryScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiService from '../../services/apiService';

const WithdrawalHistoryScreen = ({ navigation }) => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setIsLoading(true);
    const result = await apiService.getWithdrawalRequests();
    if (result.success) {
      setRequests(result.data);
    }
    setIsLoading(false);
    setRefreshing(false);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadRequests();
  };

  const handleCancel = (request) => {
    Alert.alert(
      'Cancel Request',
      `Are you sure you want to cancel this withdrawal request of ₹${request.amount}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => cancelRequest(request.id),
        },
      ]
    );
  };

  const cancelRequest = async (requestId) => {
    const result = await apiService.cancelWithdrawalRequest(requestId);
    if (result.success) {
      Alert.alert('Success', 'Withdrawal request cancelled');
      loadRequests();
    } else {
      Alert.alert('Error', result.error?.message || 'Failed to cancel request');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#ffc107';
      case 'approved':
        return '#28a745';
      case 'completed':
        return '#007AFF';
      case 'rejected':
        return '#dc3545';
      default:
        return '#666';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return '⏳ Pending';
      case 'approved':
        return '✅ Approved';
      case 'completed':
        return '✅ Completed';
      case 'rejected':
        return '❌ Rejected';
      default:
        return status;
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <View>
          <Text style={styles.amount}>₹{parseFloat(item.amount).toFixed(2)}</Text>
          <Text style={styles.method}>{item.payment_method === 'upi' ? 'UPI' : 'Bank Transfer'}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>

      <View style={styles.requestDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Requested</Text>
          <Text style={styles.detailValue}>
            {new Date(item.requested_at).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </Text>
        </View>

        {item.processed_at && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Processed</Text>
            <Text style={styles.detailValue}>
              {new Date(item.processed_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>
        )}

        {item.payment_details && (
          <View style={styles.paymentDetailsSection}>
            <Text style={styles.paymentDetailsTitle}>Payment Details:</Text>
            {item.payment_method === 'upi' ? (
              <Text style={styles.paymentDetailsText}>UPI: {item.payment_details.upi_id}</Text>
            ) : (
              <>
                <Text style={styles.paymentDetailsText}>
                  A/C: ****{item.payment_details.account_number?.slice(-4)}
                </Text>
                <Text style={styles.paymentDetailsText}>
                  IFSC: {item.payment_details.ifsc_code}
                </Text>
              </>
            )}
          </View>
        )}

        {item.writer_note && (
          <View style={styles.noteSection}>
            <Text style={styles.noteLabel}>Your Note:</Text>
            <Text style={styles.noteText}>{item.writer_note}</Text>
          </View>
        )}

        {item.admin_note && (
          <View style={[styles.noteSection, styles.adminNoteSection]}>
            <Text style={styles.noteLabel}>Admin Note:</Text>
            <Text style={styles.noteText}>{item.admin_note}</Text>
          </View>
        )}
      </View>

      {item.status === 'pending' && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => handleCancel(item)}
        >
          <Text style={styles.cancelButtonText}>Cancel Request</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>📋</Text>
      <Text style={styles.emptyTitle}>No Withdrawal Requests</Text>
      <Text style={styles.emptyText}>
        You haven't made any withdrawal requests yet.
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading requests...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Withdrawal Requests</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={requests}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={requests.length === 0 && styles.emptyList}
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
  requestCard: {
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
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  method: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  requestDetails: {
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
  paymentDetailsSection: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  paymentDetailsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  paymentDetailsText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  noteSection: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  adminNoteSection: {
    backgroundColor: '#fff3cd',
  },
  noteLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  noteText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  cancelButton: {
    marginTop: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#dc3545',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#dc3545',
    fontSize: 14,
    fontWeight: '600',
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

export default WithdrawalHistoryScreen;