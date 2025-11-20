import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Dimensions } from "react-native";
import { useRouter } from "expo-router";
// Note: Removed LinearGradient as the original uses flat colors, not gradients.
// If you want a slight gradient, you can re-add it.

const { width } = Dimensions.get("window");

// All states of India
const states = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

// Custom colors inspired by the DigiLocker language selection screen
const colors = [
//   "#FFC98E", // Light Orange/Cream (English) - Primary Selection
  "#D9EFFF", // Light Blue (Hindi)
//   "#E0F7D4", // Light Green (Bangla/Assamiya)
//   "#FAE9F2", // Light Pink/Peach (Malayalam)
//   "#FFDED4", // Light Salmon (Kannada/Marathi)
//   "#FFEFC3", // Light Yellow (Oriya/Punjabi)
];

// Function to cycle through the colors for the boxes
const getColor = (index: number) => {
  return colors[index % colors.length];
};

export default function StateSelection() {
  const router = useRouter();
  const [selectedState, setSelectedState] = useState<string | null>(null);

  const handleStateSelect = (state: string) => {
    setSelectedState(state);
    // You can navigate immediately or wait for the "Continue" button
    // For now, let's just select it and show the checkmark style
  };

  const handleContinue = () => {
    if (selectedState) {
      router.push({
        pathname: "/mapview1",
        params: { state: selectedState },
      });
    } else {
      // Handle case where no state is selected, e.g., show a toast/alert
    }
  };

  const renderItem = ({ item, index }: { item: string, index: number }) => {
    const isSelected = item === selectedState;
    const boxColor = isSelected ? "#FFC98E" : getColor(index); // Use primary color for selected

    return (
      <TouchableOpacity
        style={[
          styles.stateBox,
          { backgroundColor: boxColor },
          isSelected && styles.selectedBox, // Optional subtle selection style
        ]}
        onPress={() => handleStateSelect(item)}
      >
        <Text style={[styles.stateText, isSelected && styles.selectedText]}>
          {item}
        </Text>
        {/* Simple Text-based checkmark to mimic the image */}
        {isSelected && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.fullContainer}>
      {/* Top Header Section */}
      <View style={styles.headerContainer}>
        {/* Placeholder for an Icon/Logo on the left */}
        <View style={styles.iconPlaceholder} />
        <Text style={styles.digiLockerText}>BHUJAL SAMIKSHA</Text>
      </View>

      {/* Language/State Selection Prompt */}
      <View style={styles.promptContainer}>
        {/* <Text style={styles.languageIcon}>{'Aअ'}</Text> */}
        <Text style={styles.heading}>Choose the state</Text>
      </View>

      {/* State Selection Grid */}
      <FlatList
        data={states}
        keyExtractor={(item) => item}
        numColumns={2}
        contentContainerStyle={styles.grid}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />

      {/* Bottom Continue Button */}
      <TouchableOpacity
        style={[
          styles.continueButton,
          !selectedState && styles.disabledButton // Style for disabled state
        ]}
        onPress={handleContinue}
        disabled={!selectedState}
      >
        <Text style={styles.continueButtonText}>
          {selectedState ? `Continue with ${selectedState}` : "Select a State to Continue"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
    backgroundColor: "#fff", // White background like the image
    paddingTop: 40, // Space for the top bar
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    marginBottom: 10,
  },
  iconPlaceholder: {
    // This is where a cloud/document icon would go
    width: 24,
    height: 24,
    backgroundColor: '#007bff', // Blue color for the cloud
    borderRadius: 5,
    marginRight: 8,
  },
  digiLockerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007bff', // DigiLocker blue
  },
  promptContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  languageIcon: {
    fontSize: 20,
    marginRight: 10,
    color: '#333',
  },
  heading: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  grid: {
    paddingHorizontal: 10,
  },
  stateBox: {
    flex: 1,
    height: width * 0.25, // Size similar to the language boxes
    margin: 8,
    borderRadius: 8, // Slightly rounded corners like the image
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    // Remove elevation/shadow for a flatter look like the image
  },
  selectedBox: {
    borderWidth: 2, // Optional: A slight border to enhance selection
    borderColor: '#E77400',
  },
  stateText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
  },
  selectedText: {
    fontWeight: "700",
  },
  checkmark: {
    position: 'absolute',
    top: 5,
    right: 10,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#38761D', // Green checkmark
  },
  continueButton: {
    backgroundColor: "#007bff", // Blue color like the image
    paddingVertical: 15,
    marginHorizontal: 20,
    marginBottom: 50,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  disabledButton: {
    backgroundColor: "#a0cfff", // Lighter blue for disabled state
  }
});