// app/_layout.tsx
import { BundleInspector } from '../.rorkai/inspector';
import { RorkErrorBoundary } from '../.rorkai/rork-error-boundary';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react"; // Ensure React is imported here
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();
const statusBarStyle = 'light' as const;
const statusBarBg = '#3B82F6'; // Updated to match Bhujal Samiksha blue

function RootLayoutNav() {
  return (
    <>
      <StatusBar style={statusBarStyle} backgroundColor={statusBarBg} />
      <Stack screenOptions={styles.stackOptions}>
        <Stack.Screen name="splash" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="home" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="features/dashboard" options={styles.modalOptions} />
        <Stack.Screen name="features/mapview" options={styles.modalOptions} />
        <Stack.Screen name="features/recharge-pattern" options={styles.modalOptions} />
        <Stack.Screen name="features/report-generation" options={styles.modalOptions} />
        <Stack.Screen name="features/comparison" options={styles.modalOptions} />
        <Stack.Screen name="features/alerts" options={styles.modalOptions} />
        <Stack.Screen name="features/anomaly-detection" options={styles.modalOptions} />
        <Stack.Screen name="features/chatbot" options={styles.modalOptions} />
        <Stack.Screen name="features/overview" options={styles.modalOptions} />
        <Stack.Screen name="profile" options={styles.modalOptions} />
        <Stack.Screen name="search" options={styles.modalOptions} />
        <Stack.Screen name="station/[id]" options={styles.modalOptions} />
        <Stack.Screen name="alerts/detail" options={styles.modalOptions} />
        <Stack.Screen name="reports/generate" options={styles.modalOptions} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={styles.container}>
        <BundleInspector>
          <RorkErrorBoundary>
            <RootLayoutNav />
          </RorkErrorBoundary>
        </BundleInspector>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stackOptions: {
    headerShown: false,
  },
  modalOptions: {
    presentation: 'modal' as const,
  },
});