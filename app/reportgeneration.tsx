import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Linking,
  Alert,
  StatusBar,
  Dimensions,
  ScrollView,
  Image,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";


// Import your JSON
import groundwaterData from "./groundwater.json";

const { width, height } = Dimensions.get('window');

export default function GroundwaterScreen() {
  const [selectedState, setSelectedState] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedType, setSelectedType] = useState("All");

  // Dropdown values
  const states = ["All", ...groundwaterData.states_data.map((s) => s.state_name)];
  const years = ["All", ...groundwaterData.years_available];
  const dataTypes = ["All", ...groundwaterData.data_types];

  // Filtered data
  const filteredData = [];
  groundwaterData.states_data.forEach((state) => {
    if (selectedState !== "All" && state.state_name !== selectedState) return;

    state.bulletins.forEach((bulletin) => {
      if (selectedYear !== "All" && bulletin.year !== selectedYear) return;
      if (selectedType !== "All" && bulletin.data_type !== selectedType) return;

      filteredData.push({ state: state.state_name, ...bulletin });
    });
  });

  // Open PDF in browser
  const handleOpenPDF = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "Cannot open PDF. Server may be unavailable.");
      }
    } catch (error) {
      console.error("Open PDF error:", error);
      Alert.alert("Error", "Failed to open PDF.");
    }
  };

  const renderFilterPicker = (label, selectedValue, onValueChange, items, icon) => (
    <View style={styles.filterItem}>
      <View style={styles.filterLabelContainer}>
        {/* <Text style={styles.filterIcon}>{icon}</Text> */}
        <Text style={styles.filterLabel}>{label}</Text>
      </View>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedValue}
          style={styles.picker}
          onValueChange={onValueChange}
          dropdownIconColor="#4A90E2"
        >
          {items.map((item, idx) => (
            <Picker.Item key={idx} label={item} value={item} />
          ))}
        </Picker>
      </View>
    </View>
  );

  const renderItem = ({ item, index }) => (
    <View style={[styles.card, { marginLeft: index % 2 === 0 ? 0 : 8 }]}>
      <View style={styles.cardHeader}>
        <View style={styles.stateContainer}>
          <Text style={styles.stateIcon}>🏛️</Text>
          <Text style={styles.state}>{item.state}</Text>
        </View>
        <View style={styles.yearBadge}>
          <Text style={styles.yearText}>{item.year}</Text>
        </View>
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.filenameContainer}>
          {/* <Text style={styles.filenameIcon}>📄</Text> */}
          <Text style={styles.filename} numberOfLines={2}>{item.filename}</Text>
        </View>
        
        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>🏷️</Text>
            <Text style={styles.metaText}>{item.data_type}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => handleOpenPDF(item.pdf_download_link)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#4A90E2', '#357ABD']}
          style={styles.buttonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {/* <Text style={styles.buttonIcon}>📱</Text> */}
          <Text style={styles.buttonText}>Download</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.ourLogo}>
                            <Image
                              source={require("../assets/images/cgwb.png")}
                              style={{ width: 300, height: 120 }}
                              resizeMode="contain"
                            />
                          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.header}>{groundwaterData.title}</Text>
            <Text style={styles.subHeader}>
              {groundwaterData.source} 
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#667eea" />
        
        {renderHeader()}

        {/* Filters */}
        <View style={styles.filterBox}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Groundwater Level and Quality Bulletin</Text>
            <Text style={styles.resultCount}>{filteredData.length} results</Text>
          </View>
          
          {renderFilterPicker("State", selectedState, setSelectedState, states, "🗺️")}
          {renderFilterPicker("Year", selectedYear, setSelectedYear, years, "📅")}
          {renderFilterPicker("Data Type", selectedType, setSelectedType, dataTypes, "📊")}
        </View>

        {/* PDF List */}
        <FlatList
          data={filteredData}
          keyExtractor={(item, index) => `${item.state}-${item.filename}-${index}`}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          style={styles.flatList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>No Results Found</Text>
              <Text style={styles.emptySubtitle}>Try adjusting your filters</Text>
            </View>
          }
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#ffffffff",
  },
  safeArea: {
    flex: 1,
    paddingBottom: 40,
  },
  
  // Header Styles
  headerContainer: {
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerGradient: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop:0,
  },
  headerIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  ourLogo: {
    width: 110,
    height: 50,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    marginTop:10,
  },
  headerTextContainer: {
    flex: 1,
  },
  header: { 
    fontSize: 24, 
    fontWeight: "800", 
    color: "#ffffff",
    marginBottom: 4,
  },
  subHeader: { 
    fontSize: 14, 
    color: "#e8eaf6",
    opacity: 0.9,
  },

  // Filter Styles
  filterBox: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2c3e50",
  },
  resultCount: {
    fontSize: 14,
    color: "#4A90E2",
    fontWeight: "600",
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  filterItem: {
    marginBottom: 16,
  },
  filterLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  filterLabel: { 
    fontWeight: "600", 
    color: "#34495e",
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  picker: { 
    backgroundColor: "transparent",
  },

  // List Styles
  flatList: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 12,
    paddingBottom: 40,
    flexGrow: 1,
  },
  row: {
    justifyContent: 'space-around',
    paddingHorizontal: 4,
  },

  // Card Styles
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    width: (width - 40) / 2,
    maxWidth: 180,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    paddingBottom: 8,
  },
  stateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stateIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  state: { 
    fontSize: 16, 
    fontWeight: "700", 
    color: "#2c3e50",
    flex: 1,
  },
  yearBadge: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  yearText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  filenameContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  filenameIcon: {
    fontSize: 14,
    marginRight: 6,
    marginTop: 2,
  },
  filename: { 
    fontSize: 14, 
    color: "#2c3e50",
    flex: 1,
    lineHeight: 20,
  },
  metaContainer: {
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  metaText: { 
    fontSize: 12, 
    color: "#7f8c8d",
    fontWeight: "500",
  },

  // Button Styles
  button: {
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  buttonIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  buttonText: { 
    color: "#ffffff", 
    fontWeight: "700",
    fontSize: 14,
  },

  // Empty State Styles
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    minHeight: height * 0.3,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: 'center',
  },
});


















// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   StyleSheet,
//   SafeAreaView,
// } from "react-native";
// import { Picker } from "@react-native-picker/picker";
// import * as FileSystem from "expo-file-system";
// import * as Sharing from "expo-sharing";

// // JSON data
// import groundwaterData from "./groundwater.json";

// export default function GroundwaterScreen() {
//   const [selectedState, setSelectedState] = useState("All");
//   const [selectedYear, setSelectedYear] = useState("All");
//   const [selectedType, setSelectedType] = useState("All");
//   const [downloading, setDownloading] = useState(false);

//   // Dropdown values
//   const states = ["All", ...groundwaterData.states_data.map((s) => s.state_name)];
//   const years = ["All", ...groundwaterData.years_available];
//   const dataTypes = ["All", ...groundwaterData.data_types];

//   // Filter
//   const filteredData = [];
//   groundwaterData.states_data.forEach((state) => {
//     if (selectedState !== "All" && state.state_name !== selectedState) return;

//     state.bulletins.forEach((bulletin) => {
//       if (selectedYear !== "All" && bulletin.year !== selectedYear) return;
//       if (selectedType !== "All" && bulletin.data_type !== selectedType) return;

//       filteredData.push({
//         state: state.state_name,
//         ...bulletin,
//       });
//     });
//   });

//   // Download + open in viewer
//   const handleDownload = async (url, filename) => {
//     try {
//       setDownloading(true);
//       const fileUri = FileSystem.documentDirectory + filename.replace(/\s/g, "_");

//       const { uri } = await FileSystem.downloadAsync(url, fileUri);

//       if (await Sharing.isAvailableAsync()) {
//         await Sharing.shareAsync(uri);
//       } else {
//         alert("PDF saved but sharing is not available on this device.");
//       }
//     } catch (error) {
//       console.error("Download error:", error);
//       alert("Failed to download file");
//     } finally {
//       setDownloading(false);
//     }
//   };

//   // UI card for each item
//   const renderItem = ({ item }) => (
//     <View style={styles.card}>
//       <Text style={styles.state}>{item.state}</Text>
//       <Text style={styles.filename}>📂 {item.filename}</Text>
//       <Text style={styles.meta}>📌 {item.data_type}</Text>
//       <Text style={styles.meta}>📅 {item.year}</Text>

//       <TouchableOpacity
//         style={styles.button}
//         onPress={() => handleDownload(item.pdf_download_link, item.filename)}
//       >
//         <Text style={styles.buttonText}>
//           {downloading ? "⏳ Downloading..." : "⬇ Download PDF"}
//         </Text>
//       </TouchableOpacity>
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <Text style={styles.header}>{groundwaterData.title}</Text>
//       <Text style={styles.subHeader}>
//         Source: {groundwaterData.source}
//         {"\n"}Last Updated: {groundwaterData.last_updated}
//       </Text>

//       {/* Filters */}
//       <View style={styles.filterBox}>
//         <Text style={styles.filterLabel}>Filter by State:</Text>
//         <Picker
//           selectedValue={selectedState}
//           style={styles.picker}
//           onValueChange={(val) => setSelectedState(val)}
//         >
//           {states.map((s, idx) => (
//             <Picker.Item key={idx} label={s} value={s} />
//           ))}
//         </Picker>

//         <Text style={styles.filterLabel}>Filter by Year:</Text>
//         <Picker
//           selectedValue={selectedYear}
//           style={styles.picker}
//           onValueChange={(val) => setSelectedYear(val)}
//         >
//           {years.map((y, idx) => (
//             <Picker.Item key={idx} label={y} value={y} />
//           ))}
//         </Picker>

//         <Text style={styles.filterLabel}>Filter by Data Type:</Text>
//         <Picker
//           selectedValue={selectedType}
//           style={styles.picker}
//           onValueChange={(val) => setSelectedType(val)}
//         >
//           {dataTypes.map((d, idx) => (
//             <Picker.Item key={idx} label={d} value={d} />
//           ))}
//         </Picker>
//       </View>

//       {/* List */}
//       <FlatList
//         data={filteredData}
//         keyExtractor={(item, index) => index.toString()}
//         renderItem={renderItem}
//         ListEmptyComponent={
//           <Text style={styles.noData}>🚫 No results found</Text>
//         }
//       />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 14, backgroundColor: "#f5f6fa" },
//   header: { fontSize: 20, fontWeight: "bold", marginBottom: 6, color: "#2c3e50" },
//   subHeader: { fontSize: 12, marginBottom: 12, color: "#7f8c8d" },

//   filterBox: {
//     backgroundColor: "#fff",
//     padding: 12,
//     borderRadius: 10,
//     marginBottom: 12,
//     elevation: 3,
//   },
//   filterLabel: { fontWeight: "600", marginTop: 8, marginBottom: 2, color: "#34495e" },
//   picker: { backgroundColor: "#ecf0f1", borderRadius: 8 },

//   card: {
//     backgroundColor: "#fff",
//     padding: 14,
//     borderRadius: 12,
//     marginBottom: 12,
//     elevation: 3,
//   },
//   state: { fontSize: 16, fontWeight: "bold", color: "#2980b9", marginBottom: 4 },
//   filename: { fontSize: 14, marginBottom: 2, color: "#2c3e50" },
//   meta: { fontSize: 12, color: "#7f8c8d" },

//   button: {
//     marginTop: 10,
//     backgroundColor: "#27ae60",
//     paddingVertical: 10,
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   buttonText: { color: "#fff", fontWeight: "bold" },

//   noData: { textAlign: "center", marginTop: 20, color: "gray" },
// });











// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   StyleSheet,
//   Linking,
//   SafeAreaView,
// } from "react-native";
// import { Picker } from "@react-native-picker/picker"; // dropdown filter

// // Your JSON data (shortened example)
// import groundwaterData from "./groundwater.json"; // put your big JSON in a file

// export default function GroundwaterScreen() {
//   const [selectedState, setSelectedState] = useState("All");
//   const [selectedYear, setSelectedYear] = useState("All");
//   const [selectedType, setSelectedType] = useState("All");

//   // All available filters from JSON
//   const states = ["All", ...groundwaterData.states_data.map(s => s.state_name)];
//   const years = ["All", ...groundwaterData.years_available];
//   const dataTypes = ["All", ...groundwaterData.data_types];

//   // Filter function
//   const filteredData = [];
//   groundwaterData.states_data.forEach(state => {
//     if (selectedState !== "All" && state.state_name !== selectedState) return;

//     state.bulletins.forEach(bulletin => {
//       if (selectedYear !== "All" && bulletin.year !== selectedYear) return;
//       if (selectedType !== "All" && bulletin.data_type !== selectedType) return;

//       filteredData.push({
//         state: state.state_name,
//         ...bulletin,
//       });
//     });
//   });

//   const handleDownload = (url) => {
//     Linking.openURL(url).catch(err =>
//       console.error("Failed to open URL:", err)
//     );
//   };

//   const renderItem = ({ item }) => (
//     <View style={styles.card}>
//       <Text style={styles.title}>{item.state}</Text>
//       <Text>📂 {item.filename}</Text>
//       <Text>📌 Type: {item.data_type}</Text>
//       <Text>📅 Year: {item.year}</Text>

//       <TouchableOpacity
//         style={styles.button}
//         onPress={() => handleDownload(item.pdf_download_link)}
//       >
//         <Text style={styles.buttonText}>⬇ Download PDF</Text>
//       </TouchableOpacity>
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <Text style={styles.header}>{groundwaterData.title}</Text>
//       <Text style={styles.subHeader}>
//         Source: {groundwaterData.source} | Last Updated:{" "}
//         {groundwaterData.last_updated}
//       </Text>

//       {/* Filter Dropdowns */}
//       <View style={styles.filters}>
//         <Picker
//           selectedValue={selectedState}
//           style={styles.picker}
//           onValueChange={(val) => setSelectedState(val)}
//         >
//           {states.map((s, idx) => (
//             <Picker.Item key={idx} label={s} value={s} />
//           ))}
//         </Picker>

//         <Picker
//           selectedValue={selectedYear}
//           style={styles.picker}
//           onValueChange={(val) => setSelectedYear(val)}
//         >
//           {years.map((y, idx) => (
//             <Picker.Item key={idx} label={y} value={y} />
//           ))}
//         </Picker>

//         <Picker
//           selectedValue={selectedType}
//           style={styles.picker}
//           onValueChange={(val) => setSelectedType(val)}
//         >
//           {dataTypes.map((d, idx) => (
//             <Picker.Item key={idx} label={d} value={d} />
//           ))}
//         </Picker>
//       </View>

//       {/* Results */}
//       <FlatList
//         data={filteredData}
//         keyExtractor={(item, index) => index.toString()}
//         renderItem={renderItem}
//         ListEmptyComponent={
//           <Text style={styles.noData}>No results found 🚫</Text>
//         }
//       />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 10, backgroundColor: "#f9f9f9" },
//   header: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
//   subHeader: { fontSize: 12, marginBottom: 10, color: "gray" },
//   filters: { marginBottom: 10 },
//   picker: { height: 50, backgroundColor: "#fff", marginVertical: 5 },
//   card: {
//     backgroundColor: "#fff",
//     padding: 12,
//     borderRadius: 8,
//     marginBottom: 10,
//     elevation: 2,
//   },
//   title: { fontWeight: "bold", fontSize: 16, marginBottom: 4 },
//   button: {
//     marginTop: 8,
//     backgroundColor: "#007AFF",
//     padding: 10,
//     borderRadius: 6,
//     alignItems: "center",
//   },
//   buttonText: { color: "#fff", fontWeight: "bold" },
//   noData: { textAlign: "center", marginTop: 20, color: "gray" },
// });

