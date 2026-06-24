// screens/writer/WithdrawalRequestScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiService from '../../services/apiService';

const WithdrawalRequestScreen = ({ route, navigation }) => {
  const { summary } = route.params;
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' or 'bank_transfer'
  const [upiId, setUpiId] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [accountName, setAccountName] = useState('');
  const [bankName, setBankName] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const maxAmount = summary?.withdrawable_balance || 0;

  const handleSubmit = async () => {
    // Validation
    const withdrawAmount = parseFloat(amount);

    if (!amount || isNaN(withdrawAmount)) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (withdrawAmount < 100) {
      Alert.alert('Error', 'Minimum withdrawal amount is ₹100');
      return;
    }

    if (withdrawAmount > maxAmount) {
      Alert.alert('Error', `Maximum withdrawable amount is ₹${maxAmount.toFixed(2)}`);
      return;
    }

    // Payment details validation
    let paymentDetails = {};

    if (paymentMethod === 'upi') {
      if (!upiId) {
        Alert.alert('Error', 'Please enter your UPI ID');
        return;
      }
      paymentDetails = { upi_id: upiId };
    } else {
      if (!accountNumber || !ifscCode || !accountName || !bankName) {
        Alert.alert('Error', 'Please fill all bank details');
        return;
      }
      paymentDetails = {
        account_number: accountNumber,
        ifsc_code: ifscCode,
        account_name: accountName,
        bank_name: bankName,
      };
    }

    // Confirm
    Alert.alert(
      'Confirm Withdrawal',
      `Request withdrawal of ₹${withdrawAmount.toFixed(2)} via ${paymentMethod === 'upi' ? 'UPI' : 'Bank Transfer'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => submitRequest(withdrawAmount, paymentDetails),
        },
      ]
    );
  };

  const submitRequest = async (withdrawAmount, paymentDetails) => {
    setIsSubmitting(true);

    const result = await apiService.createWithdrawalRequest(
      withdrawAmount,
      paymentMethod,
      paymentDetails,
      note || null
    );

    setIsSubmitting(false);

    if (result.success) {
      Alert.alert(
        'Request Submitted! ✅',
        'Your withdrawal request has been submitted successfully. We will process it within 3-5 business days.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      Alert.alert('Error', result.error?.message || 'Failed to submit request');
    }
  };

  const handleMaxAmount = () => {
    setAmount(maxAmount.toFixed(2));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request Withdrawal</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Available Balance */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available for Withdrawal</Text>
          <Text style={styles.balanceAmount}>₹{maxAmount.toFixed(2)}</Text>
        </View>

        {/* Amount Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Withdrawal Amount</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
            <TouchableOpacity style={styles.maxButton} onPress={handleMaxAmount}>
              <Text style={styles.maxButtonText}>MAX</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.helpText}>
            Minimum: ₹100 • Maximum: ₹{maxAmount.toFixed(2)}
          </Text>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.methodButtons}>
            <TouchableOpacity
              style={[
                styles.methodButton,
                paymentMethod === 'upi' && styles.methodButtonActive,
              ]}
              onPress={() => setPaymentMethod('upi')}
            >
              <Text
                style={[
                  styles.methodButtonText,
                  paymentMethod === 'upi' && styles.methodButtonTextActive,
                ]}
              >
                UPI
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.methodButton,
                paymentMethod === 'bank_transfer' && styles.methodButtonActive,
              ]}
              onPress={() => setPaymentMethod('bank_transfer')}
            >
              <Text
                style={[
                  styles.methodButtonText,
                  paymentMethod === 'bank_transfer' && styles.methodButtonTextActive,
                ]}
              >
                Bank Transfer
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment Details */}
        {paymentMethod === 'upi' ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>UPI Details</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter UPI ID (e.g., yourname@paytm)"
              value={upiId}
              onChangeText={setUpiId}
              autoCapitalize="none"
            />
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bank Details</Text>
            <TextInput
              style={styles.input}
              placeholder="Account Holder Name"
              value={accountName}
              onChangeText={setAccountName}
            />
            <TextInput
              style={styles.input}
              placeholder="Account Number"
              keyboardType="numeric"
              value={accountNumber}
              onChangeText={setAccountNumber}
            />
            <TextInput
              style={styles.input}
              placeholder="IFSC Code"
              value={ifscCode}
              onChangeText={(text) => setIfscCode(text.toUpperCase())}
              autoCapitalize="characters"
            />
            <TextInput
              style={styles.input}
              placeholder="Bank Name"
              value={bankName}
              onChangeText={setBankName}
            />
          </View>
        )}

        {/* Note */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Note (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add any additional notes..."
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Request</Text>
          )}
        </TouchableOpacity>

        {/* Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>ℹ️ Important Information</Text>
          <Text style={styles.infoText}>
            • Withdrawals are processed within 3-5 business days{'\n'}
            • Minimum amount: ₹100{'\n'}
            • You'll be notified once processed{'\n'}
            • Make sure payment details are correct
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  content: {
    flex: 1,
  },
  balanceCard: {
    backgroundColor: '#007AFF',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    paddingVertical: 12,
  },
  maxButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  maxButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  methodButtons: {
    flexDirection: 'row',
  },
  methodButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  methodButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  methodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  methodButtonTextActive: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#28a745',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: '#fff3cd',
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#856404',
    lineHeight: 18,
  },
});

export default WithdrawalRequestScreen;