// import { StatusBar } from 'expo-status-bar';
// import React from 'react';
// import { StyleSheet, Text, View } from 'react-native';

// export default function App() {
//   return (
//     <View style={styles.container}>
//       <Text>dalle</Text>
//       <StatusBar style="auto" />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });

// App.js - Replace your current App.js content with this
// import React, { useState } from 'react';
// import { 
//   StyleSheet, 
//   Text, 
//   View, 
//   TouchableOpacity, 
//   ScrollView,
//   Alert,
//   ActivityIndicator
// } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { StatusBar } from 'expo-status-bar';
// import apiService from './src/services/apiService';

// export default function App() {
//   const [loading, setLoading] = useState(false);
//   const [testResult, setTestResult] = useState(null);
//   const [connectionStatus, setConnectionStatus] = useState('Not tested');

//   const testApiConnection = async () => {
//     setLoading(true);
//     setTestResult(null);
    
//     try {
//       console.log('Testing API connection...');
//       const response = await apiService.testApi();
//       console.log('API Response:', response);
      
//       setConnectionStatus('✅ Connected');
//       setTestResult(JSON.stringify(response, null, 2));
//       Alert.alert('Success!', 'API connection successful');
//     } catch (error) {
//       console.error('API Test Error:', error);
//       setConnectionStatus('❌ Failed');
//       setTestResult(`Error: ${error.message}`);
//       Alert.alert('Connection Failed', error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const testLogin = async () => {
//     setLoading(true);
//     setTestResult(null);
    
//     try {
//       console.log('Testing login...');
//       const response = await apiService.login({
//         email: 'admin@kalam.com',
//         password: 'password'
//       });
//       console.log('Login Response:', response);
      
//       setConnectionStatus('✅ Login works');
//       setTestResult(JSON.stringify(response, null, 2));
//       Alert.alert('Success!', 'Login test successful');
//     } catch (error) {
//       console.error('Login Test Error:', error);
//       setConnectionStatus('❌ Login failed');
//       setTestResult(`Login Error: ${error.message}`);
//       Alert.alert('Login Failed', error.response?.data?.message || error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <LinearGradient
//       colors={['#1F1B2E', '#2D2438', '#6B46C1']}
//       style={styles.container}
//     >
//       <StatusBar style="light" />
      
//       {/* Kalam Logo */}
//       <View style={styles.logoContainer}>
//         <Text style={styles.logoText}>Kalam</Text>
//         <Text style={styles.tagline}>A PEOPLE'S STORY</Text>
//       </View>

//       {/* Connection Status */}
//       <View style={styles.statusContainer}>
//         <Text style={styles.statusLabel}>Connection Status:</Text>
//         <Text style={styles.statusText}>{connectionStatus}</Text>
//         <Text style={styles.apiUrl}>API: http://192.168.32.241:8000/api</Text>
//       </View>

//       {/* Test Buttons */}
//       <View style={styles.buttonContainer}>
//         <TouchableOpacity 
//           style={styles.button} 
//           onPress={testApiConnection}
//           disabled={loading}
//         >
//           {loading ? (
//             <ActivityIndicator color="#FFFFFF" size="small" />
//           ) : (
//             <Text style={styles.buttonText}>Test API Connection</Text>
//           )}
//         </TouchableOpacity>

//         <TouchableOpacity 
//           style={[styles.button, styles.secondaryButton]} 
//           onPress={testLogin}
//           disabled={loading}
//         >
//           {loading ? (
//             <ActivityIndicator color="#FFFFFF" size="small" />
//           ) : (
//             <Text style={styles.buttonText}>Test Login</Text>
//           )}
//         </TouchableOpacity>
//       </View>

//       {/* Result Display */}
//       {testResult && (
//         <ScrollView style={styles.resultContainer}>
//           <Text style={styles.resultTitle}>Response:</Text>
//           <Text style={styles.resultText}>{testResult}</Text>
//         </ScrollView>
//       )}
//     </LinearGradient>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 20,
//   },
//   logoContainer: {
//     alignItems: 'center',
//     marginBottom: 40,
//   },
//   logoText: {
//     fontSize: 48,
//     fontWeight: 'bold',
//     color: '#F59E0B',
//     textShadowColor: 'rgba(0, 0, 0, 0.5)',
//     textShadowOffset: { width: 2, height: 2 },
//     textShadowRadius: 4,
//   },
//   tagline: {
//     fontSize: 14,
//     color: '#F59E0B',
//     letterSpacing: 2,
//     marginTop: 8,
//     fontWeight: '600',
//   },
//   statusContainer: {
//     backgroundColor: 'rgba(255, 255, 255, 0.1)',
//     padding: 20,
//     borderRadius: 12,
//     alignItems: 'center',
//     marginBottom: 30,
//     width: '100%',
//   },
//   statusLabel: {
//     fontSize: 16,
//     color: '#D1D5DB',
//     marginBottom: 8,
//   },
//   statusText: {
//     fontSize: 18,
//     color: '#FFFFFF',
//     fontWeight: 'bold',
//     marginBottom: 8,
//   },
//   apiUrl: {
//     fontSize: 12,
//     color: '#9CA3AF',
//     textAlign: 'center',
//   },
//   buttonContainer: {
//     width: '100%',
//     gap: 16,
//   },
//   button: {
//     backgroundColor: '#6B46C1',
//     paddingVertical: 16,
//     paddingHorizontal: 32,
//     borderRadius: 12,
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   secondaryButton: {
//     backgroundColor: '#F59E0B',
//   },
//   buttonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   resultContainer: {
//     backgroundColor: 'rgba(0, 0, 0, 0.3)',
//     marginTop: 20,
//     padding: 16,
//     borderRadius: 8,
//     maxHeight: 200,
//     width: '100%',
//   },
//   resultTitle: {
//     color: '#F59E0B',
//     fontSize: 14,
//     fontWeight: 'bold',
//     marginBottom: 8,
//   },
//   resultText: {
//     color: '#FFFFFF',
//     fontSize: 12,
//     fontFamily: 'monospace',
//   },
// });
  

// App.js
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// import { AuthProvider } from './contexts/AuthContext';
import { AuthProvider } from './src/contexts/AuthContext';
// import AppNavigator from './src/navigation/AppNavigator';
import AppNavigator from './src/navigation/AppNavigation';
export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}