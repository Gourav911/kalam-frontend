import {RazorpayCheckout} from 'react-native-razorpay';

console.log('test')
export const testRazorpay = () => {
  console.log('Razorpay SDK loaded:', !!RazorpayCheckout);
  return !!RazorpayCheckout;
};