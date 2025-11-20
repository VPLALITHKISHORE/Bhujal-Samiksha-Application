import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Modal,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useLocalSearchParams } from "expo-router";

// Import local JSON
import districtData from "./district_telemetry_data1 (1).json";

type DWLRData = {
  Telemetry_UID: string;
  State: string;
  District: string;
  Village: string;
  Latitude: number;
  Longitude: number;
  avg_water_level?: number;
};

export default function Mapview() {
  const { state } = useLocalSearchParams();
  const [stations, setStations] = useState<DWLRData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState<DWLRData | null>(null);
  const [filter, setFilter] = useState<"all" | "high" | "low">("all");
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data: DWLRData[] = Object.entries(districtData)
          .flatMap(([districtName, districtObj]: any) =>
            districtObj.telemetries.map((t: any) => ({
              Telemetry_UID: t.uid,
              State: state,
              District: districtName,
              Village: t.uid, // replace with real village if available
              Latitude: t.latitude,
              Longitude: t.longitude,
              avg_water_level: t.avg_water_level,
            }))
          );

        setStations(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [state]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading stations...</Text>
      </View>
    );
  }

  // Apply filter
  let filteredStations = stations;
  if (filter === "high") {
    filteredStations = stations.filter((s) => (s.avg_water_level ?? 0) >= -5); // high water
  } else if (filter === "low") {
    filteredStations = stations.filter((s) => (s.avg_water_level ?? 0) < -5); // low water
  }

  const getPinColor = (wl: number) => {
    if (wl < -7) return "red";
    if (wl < -5) return "yellow";
    return "blue";
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: filteredStations[0]?.Latitude || 22.9734,
          longitude: filteredStations[0]?.Longitude || 78.6569,
          latitudeDelta: 5,
          longitudeDelta: 5,
        }}
      >
        {filteredStations.map((station) => (
          <Marker
            key={station.Telemetry_UID}
            coordinate={{
              latitude: station.Latitude,
              longitude: station.Longitude,
            }}
            pinColor={station.avg_water_level && station.avg_water_level < -5 ? "red" : "blue"}
            onPress={() => setSelectedStation(station)}
          />
        ))}
      </MapView>

      {/* Station Details Card */}
      <View style={styles.details}>
        <Text style={styles.title}>{state}</Text>
        <Text>Total Stations: {filteredStations.length}</Text>

        {selectedStation ? (
          <ScrollView style={{ maxHeight: 150, marginTop: 10 }}>
            <Text>{JSON.stringify(selectedStation, null, 2)}</Text>
          </ScrollView>
        ) : (
          <Text style={{ marginTop: 10, fontStyle: "italic" }}>
            Tap on a station to view its details
          </Text>
        )}
      </View>

      {/* Bottom-right Filter Button */}
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={{ color: "#fff", fontWeight: "bold" }}>Filter</Text>
      </TouchableOpacity>

      {/* Modal for Filter Options */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Filter</Text>

            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => {
                setFilter("all");
                setModalVisible(false);
              }}
            >
              <Text>All Stations</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => {
                setFilter("high");
                setModalVisible(false);
              }}
            >
              <Text>High Water Level</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => {
                setFilter("low");
                setModalVisible(false);
              }}
            >
              <Text>Low Water Level</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: "#ddd" }]}
              onPress={() => setModalVisible(false)}
            >
              <Text>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  details: {
    position: "absolute",
    bottom: 50,
    left: 10,
    right: 10,
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    elevation: 3,
  },
  title: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },

  filterButton: {
    position: "absolute",
    bottom: 80,
    right: 20,
    backgroundColor: "#2196f3",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 50,
    elevation: 5,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    width: 250,
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },
  modalBtn: {
    width: "100%",
    padding: 12,
    backgroundColor: "#eee",
    marginVertical: 5,
    borderRadius: 5,
    alignItems: "center",
  },
});
