// screens/payment/PaymentScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PaymentScreen = ({ route, navigation }) => {
  const { story, onPaymentSuccess } = route.params;
  const [isProcessing, setIsProcessing] = useState(false);

  // This is a placeholder for actual Google Pay integration
  const handleGooglePayment = async () => {
    setIsProcessing(true);
    
    try {
      // TODO: Implement actual Google Pay integration in Chunk 7
      // For now, we'll simulate a payment
      await simulatePayment();
      
      Alert.alert(
        'Payment Successful! 🎉',
        `You have successfully unlocked "${story.title}" for ₹5. You can now read the complete story.`,
        [
          {
            text: 'Read Story',
            onPress: () => {
              if (onPaymentSuccess) {
                onPaymentSuccess();
              }
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Payment Failed',
        'There was an error processing your payment. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const simulatePayment = () => {
    return new Promise((resolve) => {
      // Simulate API call delay
      setTimeout(() => {
        resolve();
      }, 2000);
    });
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Payment',
      'Are you sure you want to cancel the payment?',
      [
        { text: 'Continue Payment', style: 'default' },
        { 
          text: 'Cancel', 
          style: 'destructive',
          onPress: () => navigation.goBack()
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Unlock Story</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {/* Story Info */}
        <View style={styles.storySection}>
          <Image
            source={{ 
              uri: story.cover_image_url || 'https://via.placeholder.com/120x160' 
            }}
            style={styles.storyCover}
          />
          <View style={styles.storyInfo}>
            <Text style={styles.storyTitle}>{story.title}</Text>
            <Text style={styles.storyAuthor}>by {story.author?.name}</Text>
            <Text style={styles.storyCategory}>{story.category?.name}</Text>
          </View>
        </View>

        {/* Payment Details */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>Payment Details</Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Story Price</Text>
            <Text style={styles.priceValue}>₹5.00</Text>
          </View>
          
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Taxes & Fees</Text>
            <Text style={styles.priceValue}>₹0.00</Text>
          </View>
          
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₹5.00</Text>
          </View>

          <Text style={styles.benefitsTitle}>What you get:</Text>
          <View style={styles.benefitsList}>
            <Text style={styles.benefitItem}>• Complete story access</Text>
            <Text style={styles.benefitItem}>• Unlimited reading</Text>
            <Text style={styles.benefitItem}>• Support the writer</Text>
            <Text style={styles.benefitItem}>• No ads while reading</Text>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.paymentMethodsSection}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          
          <TouchableOpacity 
            style={styles.paymentMethod}
            onPress={handleGooglePayment}
            disabled={isProcessing}
          >
            <View style={styles.paymentMethodContent}>
              <View style={styles.paymentMethodIcon}>
                <Text style={styles.paymentMethodEmoji}>📱</Text>
              </View>
              <View style={styles.paymentMethodText}>
                <Text style={styles.paymentMethodTitle}>Google Pay</Text>
                <Text style={styles.paymentMethodSubtitle}>
                  Pay with UPI, Cards, & more
                </Text>
              </View>
              <Text style={styles.paymentMethodArrow}>→</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Pay Button */}
        <TouchableOpacity 
          style={[styles.payButton, isProcessing && styles.payButtonDisabled]}
          onPress={handleGooglePayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payButtonText}>Pay ₹5 & Unlock Story</Text>
          )}
        </TouchableOpacity>

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          By proceeding, you agree to unlock this story for ₹5. 
          Payment will be processed securely through Google Pay.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cancelButton: {
    padding: 4,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  storySection: {
    flexDirection: 'row',
    marginBottom: 30,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  storyCover: {
    width: 80,
    height: 100,
    borderRadius: 8,
  },
  storyInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  storyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  storyAuthor: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  storyCategory: {
    fontSize: 12,
    color: '#007AFF',
  },
  paymentSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 16,
    color: '#666',
  },
  priceValue: {
    fontSize: 16,
    color: '#333',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  benefitsList: {
    marginLeft: 8,
  },
  benefitItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  paymentMethodsSection: {
    marginBottom: 30,
  },
  paymentMethod: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentMethodEmoji: {
    fontSize: 20,
  },
  paymentMethodText: {
    flex: 1,
    marginLeft: 12,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  paymentMethodSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  paymentMethodArrow: {
    fontSize: 18,
    color: '#ccc',
  },
  payButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disclaimer: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default PaymentScreen;