import React, { useEffect, useMemo } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image"; // still works with local PNG
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ✅ Import local asset
import EmblemOfIndia from "../assets/images/Emblem_of_India.png";

export default function SplashScreen() {
  const fadeAnim = useMemo(() => new Animated.Value(0), []);
  const scaleAnim = useMemo(() => new Animated.Value(0.8), []);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      router.replace("/onboarding");
    }, 3000);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim]);

  return (
    <LinearGradient
      colors={["#1E3A8A", "#3B82F6", "#10B981"]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.logoCircle}>
          <Image
            source={EmblemOfIndia} // ✅ use local asset
            style={styles.emblem}
            contentFit="contain"
          />
        </View>

        <Text style={styles.title}>BHUJAL SAMIKSHA</Text>
        <Text style={styles.subtitle}>भुजल समीक्षा</Text>
        <Text style={styles.tagline}>Groundwater Monitoring System</Text>

        <View style={styles.loadingContainer}>
          <View style={styles.loadingBar}>
            <Animated.View style={[styles.loadingFill, { width: "100%" }]} />
          </View>
          <Text style={styles.loadingText}>
            Initializing Real-time Monitoring...
          </Text>
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: { alignItems: "center" },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 50,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  emblem: { width: 100, height: 100 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 50,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 20,
    color: "#E5E7EB",
    textAlign: "center",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: "#D1D5DB",
    textAlign: "center",
    marginBottom: 50,
  },
  loadingContainer: { alignItems: "center", width: "60%" },
  loadingBar: {
    width: "100%",
    height: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 10,
  },
  loadingFill: { height: "100%", backgroundColor: "white", borderRadius: 2 },
  loadingText: { color: "white", fontSize: 12, opacity: 0.8 },
});
