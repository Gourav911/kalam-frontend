// hooks/usePayment.js
import { useState } from 'react';
import RazorpayCheckout from 'react-native-razorpay';
import apiService from '../services/apiService';
import { Alert } from 'react-native';

export const usePayment = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Initiate and process payment
   */
  const processPayment = async (story, onSuccess, onFailure) => {
    setIsProcessing(true);
    try {
      // Step 1: Create payment order on backend
      const orderResult = await apiService.initiatePayment(story.id, 5);

      if (!orderResult.success) {
        throw new Error(orderResult.error?.message || 'Failed to create payment order');
      }

      const { order_id, amount, currency, key } = orderResult.data;

      // Step 2: Open Razorpay checkout
      const options = {
        description: `Unlock "${story.title}"`,
        image: story.cover_image_url || 'https://via.placeholder.com/150',
        currency: currency,
        key: key,
        amount: amount * 100, // Amount in paise
        order_id: order_id,
        name: 'Story Platform',
        prefill: {
          email: '', // Will be filled from user data if available
          contact: '',
          name: '',
        },
        theme: {
          color: '#007AFF',
        },
      };

      // Step 3: Open Razorpay and wait for payment
      const paymentResponse = await RazorpayCheckout.open(options);

      // Step 4: Verify payment on backend
      const verifyResult = await apiService.verifyPayment({
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature: paymentResponse.razorpay_signature,
      });

      setIsProcessing(false);

      if (verifyResult.success) {
        // Payment successful!
        if (onSuccess) {
          onSuccess(verifyResult.data);
        }
        return { success: true, data: verifyResult.data };
      } else {
        throw new Error('Payment verification failed');
      }

    } catch (error) {
      setIsProcessing(false);

      console.error('Payment error:', error);

      // Handle different error scenarios
      let errorMessage = 'Payment failed. Please try again.';

      if (error.code === RazorpayCheckout.PAYMENT_CANCELLED) {
        errorMessage = 'Payment cancelled';
      } else if (error.code === RazorpayCheckout.PAYMENT_ERROR) {
        errorMessage = error.description || 'Payment failed';
      } else if (error.message) {
        errorMessage = error.message;
      }

      if (onFailure) {
        onFailure(errorMessage);
      }

      return { success: false, error: errorMessage };
    }
  };

  /**
   * Check if story is already unlocked
   */
  const checkUnlockStatus = async (storyId) => {
    try {
      const result = await apiService.checkStoryUnlock(storyId);
      return result.success ? result.data.is_unlocked : false;
    } catch (error) {
      console.error('Error checking unlock status:', error);
      return false;
    }
  };

  return {
    processPayment,
    checkUnlockStatus,
    isProcessing,
  };
};