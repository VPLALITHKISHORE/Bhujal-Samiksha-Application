import React, { useState } from "react";
import { 
  StyleSheet, 
  View, 
  SafeAreaView, 
  Text, 
  Platform, 
  ActivityIndicator,
  StatusBar 
} from "react-native";
import { WebView } from 'react-native-webview';

export default function Alert() {
  const [loading, setLoading] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4A2CFA" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Ministry of Jai Shakthi</Text>
        <Text style={styles.subHeaderText}>Official Information Portal</Text>
      </View>

      {/* Webview container with loader */}
      <View style={styles.webviewContainer}>
        {loading && (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#4A2CFA" />
            <Text style={styles.loaderText}>Loading content...</Text>
          </View>
        )}
        <WebView
          source={{ uri: "https://twilio-fn92.onrender.com/" }}
          style={styles.webview}
          onLoadEnd={() => setLoading(false)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef2ff", 
    paddingTop: Platform.OS === "ios" ? 20 : 0,
  },
  header: {
    backgroundColor: "#4A2CFA",
    paddingVertical: 18,
    paddingHorizontal: 22,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    alignItems: "center"
  },
  headerText: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "bold",
    letterSpacing: 0.8,
  },
  subHeaderText: {
    fontSize: 14,
    color: "#dcd6ff",
    marginTop: 4,
  },
  webviewContainer: {
    flex: 1,
    margin: 15,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  webview: {
    flex: 1,
  },
  loader: {
    position: "absolute",
    top: "45%",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 2,
  },
  loaderText: {
    marginTop: 10,
    color: "#4A2CFA",
    fontSize: 14,
    fontWeight: "500",
  },
});