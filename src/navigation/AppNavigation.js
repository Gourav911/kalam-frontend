// navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import Feather Icons for the clean, professional outline style
import Feather from 'react-native-vector-icons/Feather';

// Import your screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Placeholder screens for main app
import HomeScreen from '../screens/main/HomeScreen';
import WriterDashboardScreen from '../screens/writer/WriterDashboardScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import CreateEditStoryScreen from '../screens/writer/CreateEditStoryScreen';
import { useAuth } from '../contexts/AuthContext';
import MyStoriesScreen from '../screens/writer/MyStoriesScreen';
import StoryPreviewScreen from '../screens/writer/StoryPreviewScreen';
import StoryPreviewScreenReader from '../screens/reader/StoryPreviewScreenReader';
import StoryReaderScreen from '../screens/reader/StoryReaderScreen';
import EarningsDashboardScreen from '../screens/writer/EarningsDashboardScreen';
import EarningsHistoryScreen from '../screens/writer/EarningsHistoryScreen';
import WithdrawalRequestScreen from '../screens/writer/WithdrawalRequestScreen';
import WithdrawalHistoryScreen from '../screens/writer/WithdrawalHistoryScreen';

import EditProfileScreen from '../screens/profile/EditProfileScreen';
import UserProfileScreen from '../screens/social/UserProfileScreen';
import CommentsScreen from '../screens/social/CommentsScreen';
import WriterStoriesScreen from '../screens/social/WriterStoriesScreen';
import FollowersListScreen from '../screens/social/FollowersListScreen';
import NotificationsScreen from '../screens/social/NotificationsScreen';
import TermsScreen from '../screens/profile/TermsScreen';
import PrivacyPolicyScreen from '../screens/profile/PrivacyPolicyScreen';
import { useLanguage } from '../contexts/LanguageContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Loading Screen Component
const LoadingScreen = () => { 
  const { t } = useLanguage();
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#A855F7" />
      <Text style={styles.loadingText}>{t('loading')}</Text>
    </View>
  );
};

// Main Stack Navigator
const ReaderNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={ReaderTabs} />
      <Stack.Screen
        name="StoryPreviewScreenReader"
        component={StoryPreviewScreenReader}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="UserProfile" component={UserProfileScreen} />
      <Stack.Screen name="Comments" component={CommentsScreen} />
      <Stack.Screen name="WriterStories" component={WriterStoriesScreen} />
      <Stack.Screen name="FollowersList" component={FollowersListScreen} />
      <Stack.Screen name="StoryPreview" component={StoryPreviewScreen} />
      <Stack.Screen
        name="StoryReader"
        component={StoryReaderScreen}
        options={{ presentation: 'fullScreenModal', gestureEnabled: false }}
      />
      <Stack.Screen name="Terms" component={TermsScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
};

// Auth Stack Navigation
const AuthStack = () => {
  const { t } = useLanguage(); 
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#12082A',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(124,58,237,0.2)',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '800',
          fontSize: 17,
        },
        cardStyle: { backgroundColor: '#0F0A1E' },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: t('signIn') }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: t('signUp') }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: t('resetPassword') }} />
      <Stack.Screen name="Terms" component={TermsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

// Writer Stack Navigation
const WriterStack = () => {
  const { t } = useLanguage();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WriterTabs" component={WriterTabs} />
      <Stack.Screen name="CreateEditStory" component={CreateEditStoryScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="MyStories" component={MyStoriesScreen} />
      <Stack.Screen name="StoryPreview" component={StoryPreviewScreen} />
      <Stack.Screen name="StoryPreviewScreenReader" component={StoryPreviewScreenReader} />
      <Stack.Screen
        name="StoryReader"
        component={StoryReaderScreen}
        options={{ presentation: 'fullScreenModal', gestureEnabled: false }}
      />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="EarningsDashboard" component={EarningsDashboardScreen} options={{ title: t('myEarnings') }} />
      <Stack.Screen name="EarningsHistory" component={EarningsHistoryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="WithdrawalRequest" component={WithdrawalRequestScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="UserProfile" component={UserProfileScreen} />
      <Stack.Screen name="Comments" component={CommentsScreen} />
      <Stack.Screen name="WriterStories" component={WriterStoriesScreen} />
      <Stack.Screen name="FollowersList" component={FollowersListScreen} />
      <Stack.Screen name="WithdrawalHistory" component={WithdrawalHistoryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Terms" component={TermsScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
};

// Global Configuration for Tab Bars — uses safe area insets so the bar
// never hides behind the Android system navigation bar (gesture or button).
const useTabOptions = () => {
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom;
  return {
    headerShown: false,
    tabBarStyle: {
      backgroundColor: '#0A0518',
      borderTopColor: 'rgba(168, 85, 247, 0.15)',
      borderTopWidth: 1,
      // Add bottom inset so the bar sits above the system nav bar
      height: (Platform.OS === 'ios' ? 60 : 56) + bottomInset,
      paddingBottom: (Platform.OS === 'ios' ? 0 : 4) + bottomInset,
      paddingTop: 8,
      elevation: 0,
      shadowOpacity: 0,
    },
    tabBarActiveTintColor: '#A855F7',
    tabBarInactiveTintColor: '#64748B',
    tabBarLabelStyle: {
      fontSize: 11,
      fontWeight: '600',
      marginTop: 2,
    },
  };
};

// Reader Tab Navigation
const ReaderTabs = () => {
  const { t } = useLanguage();
  const tabOptions = useTabOptions();
  return (
    <Tab.Navigator screenOptions={tabOptions}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: t('home'),
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: t('profile'),
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={22} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Writer Tab Navigation
const WriterTabs = () => {
  const { t } = useLanguage();
  const tabOptions = useTabOptions();
  return (
    <Tab.Navigator screenOptions={tabOptions}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: t('home'),
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="CreateStoryTab"
        component={View}
        options={{
          tabBarLabel: t('write') ?? 'Write',
          tabBarIcon: ({ color }) => (
            <Feather name="plus-circle" size={24} color={color} />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('CreateEditStory');
          },
        })}
      />
      <Tab.Screen
        name="Dashboard"
        component={WriterDashboardScreen}
        options={{
          tabBarLabel: t('myStories'),
          tabBarIcon: ({ color, size }) => (
            <Feather name="book-open" size={22} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Admin Tab Navigation
const AdminTabs = () => {
  const { t } = useLanguage();
  const tabOptions = useTabOptions();
  return (
    <Tab.Navigator screenOptions={tabOptions}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: t('home'),
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="CreateStoryTab"
        component={View}
        options={{
          tabBarLabel: t('write') ?? 'Write',
          tabBarIcon: ({ color }) => (
            <Feather name="plus-circle" size={24} color={color} />
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('CreateEditStory');
          },
        })}
      />
      <Tab.Screen
        name="Dashboard"
        component={WriterDashboardScreen}
        options={{
          tabBarLabel: t('admin'),
          tabBarIcon: ({ color, size }) => (
            <Feather name="sliders" size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: t('profile'),
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={22} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Admin Stack Navigation
const AdminStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminTabs" component={AdminTabs} />
      <Stack.Screen name="CreateEditStory" component={CreateEditStoryScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="MyStories" component={MyStoriesScreen} />
      <Stack.Screen name="StoryPreview" component={StoryPreviewScreen} />
      <Stack.Screen name="StoryPreviewScreenReader" component={StoryPreviewScreenReader} />
      <Stack.Screen
        name="StoryReader"
        component={StoryReaderScreen}
        options={{ presentation: 'fullScreenModal', gestureEnabled: false }}
      />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="UserProfile" component={UserProfileScreen} />
      <Stack.Screen name="Comments" component={CommentsScreen} />
      <Stack.Screen name="WriterStories" component={WriterStoriesScreen} />
      <Stack.Screen name="FollowersList" component={FollowersListScreen} />
      <Stack.Screen name="Terms" component={TermsScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
};

// Main App Navigator with Role-based Navigation
const MainAppNavigator = () => {
  const { user } = useAuth();
  switch (user?.role) {
    case 'writer':
      return <WriterStack />;
    case 'admin':
      return <AdminStack />;
    case 'reader':
    default:
      return <ReaderNavigator />;
  }
};

const linking = {
  prefixes: ['kalam://'],
  config: {
    screens: {
      StoryPreview: { path: 'story/:id' },
      StoryPreviewScreenReader: { path: 'reader/story/:id' },
    },
  },
};

// Root Navigator
const AppNavigator = () => {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer linking={linking}> 
      {isAuthenticated ? <MainAppNavigator /> : <AuthStack />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F0A1E',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
  },
});

export default AppNavigator;