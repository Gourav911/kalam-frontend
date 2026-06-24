// screens/writer/EarningsDashboardScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiService from '../../services/apiService';

const EarningsDashboardScreen = ({ navigation }) => {
  const [summary, setSummary] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    await Promise.all([loadSummary(), loadStatistics()]);
    setIsLoading(false);
  };

  const loadSummary = async () => {
    const result = await apiService.getEarningsSummary();
    if (result.success) {
      setSummary(result.data);
    }
  };

  const loadStatistics = async () => {
    const result = await apiService.getWriterStatistics();
    if (result.success) {
      setStatistics(result.data);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleWithdraw = () => {
    if (summary && summary.withdrawable_balance < 100) {
      Alert.alert(
        'Insufficient Balance',
        'Minimum withdrawal amount is ₹100. Keep earning to reach the minimum!',
        [{ text: 'OK' }]
      );
      return;
    }
    navigation.navigate('WithdrawalRequest', { summary });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading earnings...</Text>
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
          <Text style={styles.headerTitle}>My Earnings</Text>
          <Text style={styles.headerSubtitle}>Track your revenue</Text>
        </View>

        {/* Balance Cards */}
        <View style={styles.balanceSection}>
          <View style={[styles.balanceCard, styles.primaryCard]}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceAmount}>
              ₹{summary?.available_balance?.toFixed(2) || '0.00'}
            </Text>
            <Text style={styles.balanceSubtext}>
              Withdrawable: ₹{summary?.withdrawable_balance?.toFixed(2) || '0.00'}
            </Text>
          </View>

          <View style={styles.smallCardsRow}>
            <View style={styles.smallCard}>
              <Text style={styles.smallCardLabel}>Total Earned</Text>
              <Text style={styles.smallCardAmount}>
                ₹{summary?.total_earned?.toFixed(2) || '0.00'}
              </Text>
            </View>

            <View style={styles.smallCard}>
              <Text style={styles.smallCardLabel}>Withdrawn</Text>
              <Text style={styles.smallCardAmount}>
                ₹{summary?.withdrawn?.toFixed(2) || '0.00'}
              </Text>
            </View>
          </View>

          {summary?.pending_withdrawals > 0 && (
            <View style={styles.pendingAlert}>
              <Text style={styles.pendingText}>
                ⏳ Pending: ₹{summary.pending_withdrawals.toFixed(2)}
              </Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.primaryButton,
              summary?.withdrawable_balance < 100 && styles.disabledButton,
            ]}
            onPress={handleWithdraw}
            disabled={summary?.withdrawable_balance < 100}
          >
            <Text style={styles.actionButtonText}>💰 Request Withdrawal</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            // onPress={() => navigation.navigate('EarningsHistory')}
              onPress={() => navigation.navigate('EarningsHistory')}

          >
            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
              📊 View Earnings History
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => navigation.navigate('WithdrawalHistory')}
          >
            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
              📋 Withdrawal Requests
            </Text>
          </TouchableOpacity>
        </View>

        {/* Statistics */}
        {statistics && (
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Statistics</Text>

            <View style={styles.statCard}>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Total Unlocks</Text>
                <Text style={styles.statValue}>{statistics.total_unlocks}</Text>
              </View>

              {statistics.best_performing_story && (
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Best Story</Text>
                  <Text style={styles.statValue} numberOfLines={1}>
                    {statistics.best_performing_story.story?.title}
                  </Text>
                </View>
              )}

              {statistics.best_performing_story && (
                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>Story Earnings</Text>
                  <Text style={styles.statValue}>
                    ₹{parseFloat(statistics.best_performing_story.total).toFixed(2)}
                  </Text>
                </View>
              )}
            </View>

            {/* Monthly Earnings */}
            {statistics.monthly_earnings?.length > 0 && (
              <View style={styles.monthlySection}>
                <Text style={styles.monthlyTitle}>Recent Monthly Earnings</Text>
                {statistics.monthly_earnings.slice(0, 3).map((item, index) => (
                  <View key={index} style={styles.monthlyRow}>
                    <Text style={styles.monthlyMonth}>
                      {getMonthName(item.month)} {item.year}
                    </Text>
                    <Text style={styles.monthlyAmount}>
                      ₹{parseFloat(item.total).toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoTitle}>💡 How Earnings Work</Text>
          <Text style={styles.infoText}>
            • You earn ₹1 for every ₹5 story unlock{'\n'}
            • Minimum withdrawal amount is ₹100{'\n'}
            • Withdrawals are processed within 3-5 business days{'\n'}
            • Check withdrawal status in Withdrawal Requests
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getMonthName = (month) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[month - 1] || month;
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
    padding: 20,
    backgroundColor: '#007AFF',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  balanceSection: {
    padding: 20,
  },
  balanceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryCard: {
    backgroundColor: '#007AFF',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  balanceSubtext: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  smallCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  smallCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  smallCardLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  smallCardAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  pendingAlert: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  pendingText: {
    fontSize: 14,
    color: '#856404',
    fontWeight: '600',
  },
  actionsSection: {
    padding: 20,
    paddingTop: 0,
  },
  actionButton: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#28a745',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButtonText: {
    color: '#007AFF',
  },
  statsSection: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  monthlySection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  monthlyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  monthlyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  monthlyMonth: {
    fontSize: 14,
    color: '#666',
  },
  monthlyAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#28a745',
  },
  infoBanner: {
    margin: 20,
    marginTop: 0,
    backgroundColor: '#e7f3ff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default EarningsDashboardScreen;