import { Redirect } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Index() {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Redirect href="/splash" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});