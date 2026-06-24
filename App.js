// App.js
import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

// import { AuthProvider } from './contexts/AuthContext';
import { AuthProvider } from "./src/contexts/AuthContext";
// import AppNavigator from './src/navigation/AppNavigator';
import AppNavigator from "./src/navigation/AppNavigation";
import { LanguageProvider } from "./src/contexts/LanguageContext";

// Dynamically require to prevent crashes in Expo Go
let ScreenCapture = null;
try {
  ScreenCapture = require('expo-screen-capture');
} catch (e) {
  console.log("expo-screen-capture is not available in Expo Go");
}

export default function App() {
  useEffect(() => {
    const disableCapture = async () => {
      if (ScreenCapture && ScreenCapture.preventScreenCaptureAsync) {
        try {
          await ScreenCapture.preventScreenCaptureAsync();
        } catch (e) {
          console.log("Screen capture prevention not supported on this platform.");
        }
      }
    };
    disableCapture();
  }, []);

  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppNavigator />
          <StatusBar style="auto" />
        </AuthProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
