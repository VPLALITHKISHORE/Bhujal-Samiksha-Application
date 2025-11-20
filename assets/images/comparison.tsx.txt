import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Platform,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { BarChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";

type WaterRecord = {
  state: string;
  city: string;
  latitude: number;
  longitude: number;
  water_level: number;
  date: string;
  time: string;
  Method_of_water_checking: string;
};

const { width } = Dimensions.get("window");
const CHART_WIDTH = width - 40;

// --- EXPANDED DATASET ---
const STATES_AND_CITIES = [
  {
    state: "Maharashtra",
    cities: [
      { name: "Mumbai", lat: 19.076, lon: 72.8777 },
      { name: "Pune", lat: 18.5204, lon: 73.8567 },
      { name: "Nagpur", lat: 21.1458, lon: 79.0882 },
    ],
  },
  {
    state: "Karnataka",
    cities: [
      { name: "Bengaluru", lat: 12.9716, lon: 77.5946 },
      { name: "Mysuru", lat: 12.2958, lon: 76.6394 },
      { name: "Mangalore", lat: 12.9141, lon: 74.856 },
    ],
  },
  {
    state: "Tamil Nadu",
    cities: [
      { name: "Chennai", lat: 13.0827, lon: 80.2707 },
      { name: "Coimbatore", lat: 11.0168, lon: 76.9558 },
      { name: "Madurai", lat: 9.9252, lon: 78.1198 },
    ],
  },
  {
    state: "Gujarat",
    cities: [
      { name: "Ahmedabad", lat: 23.0225, lon: 72.5714 },
      { name: "Surat", lat: 21.1702, lon: 72.8311 },
      { name: "Vadodara", lat: 22.3072, lon: 73.1812 },
    ],
  },
  {
    state: "West Bengal",
    cities: [
      { name: "Kolkata", lat: 22.5726, lon: 88.3639 },
      { name: "Howrah", lat: 22.5958, lon: 88.2636 },
      { name: "Durgapur", lat: 23.5350, lon: 87.3117 },
    ],
  },
  {
    state: "Telangana",
    cities: [
      { name: "Hyderabad", lat: 17.3850, lon: 78.4867 },
      { name: "Warangal", lat: 17.9689, lon: 79.5941 },
      { name: "Karimnagar", lat: 18.4344, lon: 79.1288 },
    ],
  },
];
// --- END EXPANDED DATASET ---

const METHODS = [
  "Manual Dip",
  "Ultrasonic Sensor",
  "Pressure Transducer",
  "Visual Gauge",
];

const randomBetween = (min: number, max: number) =>
  Math.random() * (max - min) + min;
const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);

function formatDate(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function generateData(startDate: Date, endDate: Date): WaterRecord[] {
  const data: WaterRecord[] = [];
  const dayMs = 24 * 60 * 60 * 1000;
  const days = Math.max(
    1,
    Math.round((endDate.getTime() - startDate.getTime()) / dayMs) + 1
  );

  for (const s of STATES_AND_CITIES) {
    for (const c of s.cities) {
      for (let i = 0; i < days; i++) {
        const d = new Date(startDate.getTime() + i * dayMs);
        const stateFactor = STATES_AND_CITIES.findIndex(item => item.state === s.state) * 0.1;
        const base = 0.5 + stateFactor + (Math.abs(c.lat) % 10) * 0.03;
        const fluctuation = randomBetween(-0.4, 0.8);
        const water_level = Math.max(
          0,
          parseFloat((base + fluctuation).toFixed(2))
        );
        const rec: WaterRecord = {
          state: s.state,
          city: c.name,
          latitude: c.lat,
          longitude: c.lon,
          water_level,
          date: formatDate(d),
          time: "",
          Method_of_water_checking:
            METHODS[Math.floor(Math.random() * METHODS.length)],
        };
        data.push(rec);
      }
    }
  }
  return data;
}

// --- Component Start ---

export default function WaterComparison(): JSX.Element {
  const allStates = STATES_AND_CITIES.map((s) => s.state);
  const today = useMemo(() => new Date(), []);
  const defaultStart = useMemo(
    () => new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000),
    [today]
  );

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(today);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [selectedState1, setSelectedState1] = useState(allStates[0]);
  const [selectedState2, setSelectedState2] = useState(allStates[1] || allStates[0]);
  const [data, setData] = useState<WaterRecord[]>([]);

  const [tooltip, setTooltip] = useState<{ label: string; value: number } | null>(null);

  useEffect(() => {
    const gen = generateData(startDate, endDate);
    setData(gen);
    setTooltip(null);
  }, [startDate, endDate]);

  // --- Data Calculation Logic ---
  const calculateAverageLevel = (stateName: string): number => {
    const stateRecords = data.filter((r) => r.state === stateName);
    if (stateRecords.length === 0) return 0;
    
    const totalLevel = stateRecords.reduce((sum, r) => sum + r.water_level, 0);
    return parseFloat((totalLevel / stateRecords.length).toFixed(2));
  };

  // State comparison data
  const avgLevel1 = calculateAverageLevel(selectedState1);
  const avgLevel2 = calculateAverageLevel(selectedState2);
  
  const stateChartData = {
    labels: [selectedState1, selectedState2],
    datasets: [
      {
        data: [avgLevel1, avgLevel2],
        colors: [() => "#0b3d91", () => "#e91e63"],
      },
    ],
  };

  // City drill-down data
  const primaryStateCities = STATES_AND_CITIES.find(s => s.state === selectedState1)?.cities || [];
  const cityAverages = primaryStateCities.map(city => {
    const cityRecords = data.filter(r => r.state === selectedState1 && r.city === city.name);
    const totalLevel = cityRecords.reduce((sum, r) => sum + r.water_level, 0);
    const avg = cityRecords.length > 0 ? parseFloat((totalLevel / cityRecords.length).toFixed(2)) : 0;
    return { name: city.name, avg: avg };
  });

  const cityChartData = {
    labels: cityAverages.map(c => c.name.split(' ')[0]),
    datasets: [
      {
        data: cityAverages.map(c => c.avg),
        colors: cityAverages.map((_, i) => i % 2 === 0 ? () => "#28a745" : () => "#ffc107"),
      },
    ],
  };

  // --- CHART CONFIGURATION WITH VISUAL ENHANCEMENT ---
  const chartConfig = {
    // Deep blue water gradient
    backgroundGradientFrom: "#0A2472", // Dark blue start
    backgroundGradientTo: "#1E3B70",   // Slightly lighter blue end
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity * 0.8})`, // White/Light labels
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    barPercentage: 0.7,
    propsForLabels: {
        fontSize: 10,
    }
  };

  const cityChartConfig = {
    // Green/Aqua water gradient for contrast
    backgroundGradientFrom: "#00796B", // Dark Teal
    backgroundGradientTo: "#4DB6AC",   // Aqua
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity * 0.8})`, // White/Light labels
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    barPercentage: 0.7,
    propsForLabels: {
        fontSize: 10,
    }
  };

  // --- Render Functions ---

  const renderStateComparisonChart = () => {
    if (avgLevel1 === 0 && avgLevel2 === 0) {
      return <Text style={styles.noDataText}>No data available for the selected range.</Text>;
    }
    
    return (
        <BarChart
            data={stateChartData}
            width={CHART_WIDTH}
            height={280}
            yAxisSuffix=" m"
            chartConfig={chartConfig}
            showValuesOnTopOfBars={true}
            fromZero={true}
            style={styles.chartStyle} // Apply new style
            onDataPointClick={({ value, index }) => {
                const label = stateChartData.labels[index];
                setTooltip({ label: label, value: value });
            }}
        />
    );
  };

  const renderCityDrilldownChart = () => {
    if (cityAverages.every(c => c.avg === 0)) {
        return <Text style={styles.noDataText}>No city-level data found for {selectedState1}.</Text>;
    }
    
    return (
        <BarChart
            data={cityChartData}
            width={CHART_WIDTH}
            height={250}
            yAxisSuffix=" m"
            chartConfig={cityChartConfig}
            showValuesOnTopOfBars={true}
            fromZero={true}
            style={styles.chartStyle} // Apply new style
            onDataPointClick={({ value, index }) => {
                const label = cityChartData.labels[index];
                setTooltip({ label: label, value: value });
            }}
        />
    );
  };


  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>💧 India Water Level Dashboard</Text>
      <Text style={styles.subTitle}>
        Analyze and Compare Average Water Levels by State
      </Text>

      {/* Date Inputs */}
      <View style={styles.card}>
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowStartPicker(true)}
          >
            <Ionicons name="calendar" size={18} color="#0b3d91" />
            <Text style={styles.dateText}>{formatDate(startDate)}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowEndPicker(true)}
          >
            <Ionicons name="calendar" size={18} color="#0b3d91" />
            <Text style={styles.dateText}>{formatDate(endDate)}</Text>
          </TouchableOpacity>
        </View>
      </View>
      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={(e, date) => {
            setShowStartPicker(false);
            if (date) setStartDate(date);
          }}
        />
      )}
      {showEndPicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={(e, date) => {
            setShowEndPicker(false);
            if (date) setEndDate(date);
          }}
        />
      )}

      {/* State Comparison Pickers */}
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.pickerBox}>
            <Text style={styles.label}>State A (Primary)</Text>
            <Picker
              selectedValue={selectedState1}
              onValueChange={(v) => {
                setSelectedState1(v as string);
                setTooltip(null);
              }}
              itemStyle={styles.pickerItemStyle}
            >
              {allStates.map((s) => (
                <Picker.Item key={s} label={s} value={s} />
              ))}
            </Picker>
          </View>
          <View style={styles.pickerBox}>
            <Text style={styles.label}>State B (Compare)</Text>
            <Picker
              selectedValue={selectedState2}
              onValueChange={(v) => {
                setSelectedState2(v as string);
                setTooltip(null);
              }}
              itemStyle={styles.pickerItemStyle}
            >
              {allStates.map((s) => (
                <Picker.Item key={s} label={s} value={s} />
              ))}
            </Picker>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* --- Interactive Tooltip Display --- */}
        {tooltip && (
            <View style={styles.tooltipCard}>
                <Ionicons 
                    name="water" 
                    size={24} 
                    color={tooltip.label === selectedState1 || cityAverages.some(c => c.name.split(' ')[0] === tooltip.label) ? "#0b3d91" : "#e91e63"} 
                    style={{marginRight: 8}}
                />
                <Text style={styles.tooltipText}>
                    <Text style={styles.tooltipLabel}>{tooltip.label}: </Text>
                    <Text style={styles.tooltipValue}>{tooltip.value.toFixed(2)} m</Text>
                </Text>
            </View>
        )}
        {/* --- End Tooltip Display --- */}

        {/* 1. STATE COMPARISON CHART */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 State Average Level Comparison</Text>
          {renderStateComparisonChart()}
        </View>

        {/* 2. KEY METRICS */}
        <View style={styles.card}>
            <Text style={styles.cardTitle}>💡 Key Metrics for Comparison</Text>
            <View style={styles.metricRow}>
                <View style={[styles.metricBox, {backgroundColor: '#eef3ff', borderColor: '#0b3d91'}]}>
                    <Text style={[styles.metricLabel, {color: '#0b3d91'}]}>{selectedState1}</Text>
                    <Text style={[styles.metricValue, {color: '#0b3d91'}]}>{avgLevel1.toFixed(2)} m</Text>
                    <Text style={styles.metricDesc}>Avg. Level</Text>
                </View>
                <View style={[styles.metricBox, {backgroundColor: '#ffeef4', borderColor: '#e91e63'}]}>
                    <Text style={[styles.metricLabel, {color: '#e91e63'}]}>{selectedState2}</Text>
                    <Text style={[styles.metricValue, {color: '#e91e63'}]}>{avgLevel2.toFixed(2)} m</Text>
                    <Text style={styles.metricDesc}>Avg. Level</Text>
                </View>
            </View>
        </View>
        
        {/* 3. CITY DRILL-DOWN CHART */}
        <View style={styles.card}>
            <Text style={styles.cardTitle}>🏙️ City Breakdown in {selectedState1}</Text>
            {renderCityDrilldownChart()}
        </View>
        
      </ScrollView>

      {/* Footer */}
      <Text style={styles.footer}>
        ⚡ {data.length} records simulated for analysis
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f7", // Lighter background
    padding: 16,
    paddingTop: Platform.OS === "android" ? 32 : 16,
  },
  title: { fontSize: 26, fontWeight: "900", color: "#0A2472" }, // Deeper blue title
  subTitle: { fontSize: 14, color: "#555", marginBottom: 15 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15, // Slightly more rounded corners
    padding: 15,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafc",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#dce4f0", // Subtle border color
    flex: 1,
    marginHorizontal: 5,
  },
  dateText: { marginLeft: 8, color: "#333", fontWeight: "600" },
  pickerBox: {
    flex: 1,
    backgroundColor: "#f9fafc",
    borderRadius: 10,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "#dce4f0",
    overflow: 'hidden',
    height: 60,
  },
  label: {
    fontSize: 12,
    color: "#4a4a4a", // Darker label text
    position: 'absolute',
    top: 5,
    left: 10,
    zIndex: 1,
  },
  pickerItemStyle: {
    height: 40,
    color: '#333', // Default text color for picker items
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
    color: '#0A2472', // Match title color
    borderBottomWidth: 2,
    borderBottomColor: '#f0f4f7',
    paddingBottom: 8,
  },
  chartStyle: {
      borderRadius: 12, // Match card radius
  },
  noDataText: {
    textAlign: 'center',
    color: '#999',
    paddingVertical: 40,
  },
  footer: {
    fontSize: 12,
    textAlign: "center",
    color: "#666",
    marginVertical: 10,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  metricBox: {
    flex: 1,
    marginHorizontal: 4,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1, // Added border for emphasis
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 32,
    fontWeight: "900", // Stronger weight
    marginBottom: 2,
  },
  metricDesc: {
    fontSize: 12,
    color: '#666',
  },
  // --- Tooltip Styles (Interactive Water Effect) ---
  tooltipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E1F5FE', // Light blue background for emphasis
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0b3d91',
    shadowColor: '#0b3d91',
    shadowOpacity: 0.3,
    elevation: 8,
  },
  tooltipText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0b3d91',
  },
  tooltipLabel: {
    color: '#555',
    fontWeight: '500',
  },
  tooltipValue: {
    color: '#0b3d91',
    fontWeight: '900',
  }
});