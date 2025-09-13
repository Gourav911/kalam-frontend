// navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

// Import your screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Placeholder screens for main app (you'll replace these later)
import HomeScreen from '../screens/main/HomeScreen';
import WriterDashboardScreen from '../screens/writer/WriterDashboardScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import CreateEditStoryScreen from '../screens/writer/CreateEditStoryScreen';
import { useAuth } from '../contexts/AuthContext';
import MyStoriesScreen from '../screens/writer/MyStoriesScreen';
import StoryPreviewScreen from '../screens/writer/StoryPreviewScreen';
import StoryPreviewScreenReader from '../screens/reader/StoryPreviewScreenReader';
import StoryReaderScreen from '../screens/reader/StoryReaderScreen';
import PaymentScreen from '../screens/payment/PaymentScreen';
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Loading Screen Component
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#6B46C1" />
    <Text style={styles.loadingText}>Loading...</Text>
  </View>
);

// Main Stack Navigator
const ReaderNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Tab Navigator as the main screen */}
      <Stack.Screen 
        name="MainTabs" 
        component={ReaderTabs} 
      />
          
      {/* Modal/Full-screen screens */}
      <Stack.Screen 
        name="StoryPreviewScreenReader" 
        component={StoryPreviewScreenReader}
        options={{
          presentation: 'card',
        }}
      />
      
      <Stack.Screen 
        name="StoryReader" 
        component={StoryReaderScreen}
        options={{
          presentation: 'fullScreenModal',
          gestureEnabled: false,
        }}
      />
      
      <Stack.Screen 
        name="PaymentScreen" 
        component={PaymentScreen}
        options={{
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
};
// Auth Stack Navigation
const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: '#6B46C1',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}
  >
    <Stack.Screen 
      name="Login" 
      component={LoginScreen}
      options={{ title: 'Sign In' }}
    />
    <Stack.Screen 
      name="Register" 
      component={RegisterScreen}
      options={{ title: 'Sign Up' }}
    />
    <Stack.Screen 
      name="ForgotPassword" 
      component={ForgotPasswordScreen}
      options={{ title: 'Reset Password' }}
    />
  </Stack.Navigator>
);
// Writer Stack Navigation
const WriterStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="WriterTabs" component={WriterTabs} />
    <Stack.Screen 
      name="CreateEditStory" 
      component={CreateEditStoryScreen}
      options={{ presentation: 'modal' }}
    />
    <Stack.Screen name="MyStories" component={MyStoriesScreen} />
    <Stack.Screen name="StoryPreview" component={StoryPreviewScreen} />
  </Stack.Navigator>
);

// Reader Tab Navigation
const ReaderTabs = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: '#6B46C1',
      tabBarInactiveTintColor: '#666',
      headerShown: false,
    }}
  >
    <Tab.Screen 
      name="Home" 
      component={HomeScreen}
      options={{
        tabBarLabel: 'Home',
        tabBarIcon: ({ color, size }) => (
          <Text style={{ color, fontSize: size }}>🏠</Text>
        ),
      }}
    />
    <Tab.Screen 
      name="Profile" 
      component={ProfileScreen}
      options={{
        tabBarLabel: 'Profile',
        tabBarIcon: ({ color, size }) => (
          <Text style={{ color, fontSize: size }}>👤</Text>
        ),
      }}
    />
    
  </Tab.Navigator>
);

// Writer Tab Navigation
const WriterTabs = () => (
  <Tab.Navigator
    screenOptions={{  
      tabBarActiveTintColor: '#6B46C1',
      tabBarInactiveTintColor: '#666',
      headerShown: false,
    }}
  >
    <Tab.Screen 
      name="Home" 
      component={HomeScreen}
      options={{
        tabBarLabel: 'Home',
        tabBarIcon: ({ color, size }) => (
          <Text style={{ color, fontSize: size }}>🏠</Text>
        ),
      }}
    />
    <Tab.Screen 
      name="Dashboard" 
      component={WriterDashboardScreen}
      options={{
        tabBarLabel: 'My Stories',
        tabBarIcon: ({ color, size }) => (
          <Text style={{ color, fontSize: size }}>✍️</Text>
        ),
      }}
    />
    <Tab.Screen 
      name="Profile" 
      component={ProfileScreen}
      options={{
        tabBarLabel: 'Profile',
        tabBarIcon: ({ color, size }) => (
          <Text style={{ color, fontSize: size }}>👤</Text>
        ),
      }}
    />
  </Tab.Navigator>
);

// Admin Tab Navigation
const AdminTabs = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: '#6B46C1',
      tabBarInactiveTintColor: '#666',
      headerShown: false,
    }}
  >
    <Tab.Screen 
      name="Home" 
      component={HomeScreen}
      options={{
        tabBarLabel: 'Home',
        tabBarIcon: ({ color, size }) => (
          <Text style={{ color, fontSize: size }}>🏠</Text>
        ),
      }}
    />
    <Tab.Screen 
      name="Dashboard" 
      component={WriterDashboardScreen}
      options={{
        tabBarLabel: 'Admin',
        tabBarIcon: ({ color, size }) => (
          <Text style={{ color, fontSize: size }}>⚙️</Text>
        ),
      }}
    />
    <Tab.Screen 
      name="Profile" 
      component={ProfileScreen}
      options={{
        tabBarLabel: 'Profile',
        tabBarIcon: ({ color, size }) => (
          <Text style={{ color, fontSize: size }}>👤</Text>
        ),
      }}
    />
  </Tab.Navigator>
);

// Main App Navigator with Role-based Navigation
const MainAppNavigator = () => {
  const { user } = useAuth();
  
  // Determine which navigation to show based on user role
  const getUserNavigation = () => {
    switch (user?.role) {
      case 'writer':
        return <WriterStack />;
      case 'admin':
        return <AdminTabs />;
      case 'reader':
      default:
        return <ReaderNavigator />;
    }
  };

  return getUserNavigation();
};

// Root Navigator
const AppNavigator = () => {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainAppNavigator /> : <AuthStack />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

export default AppNavigator;