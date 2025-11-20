import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  PanResponder,
} from 'react-native';
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BarChart3,
  Battery,
  Calendar,
  Database,
  Droplets,
  Eye,
  Filter,
  Globe,
  MapPin,
  Minus,
  Search,
  Target,
  Thermometer,
  TrendingDown,
  TrendingUp,
  Zap,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Users,
  Layers,
  Info,
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface DWLRData {
  "S.No": number;
  "Telemetry_UID": string;
  "State": string;
  "District": string;
  "Tahsil": string;
  "Block": string;
  "Village": string;
  "Latitude": number;
  "Longitude": number;
  "Date & Time": string;
  "Battery (V)": number;
  "Water Temperature (°C)": number;
  "Water Level (m)": number;
  "Barometric Pressure (mH2O)": number;
}

interface ProcessedStation {
  telemetryUID: string;
  state: string;
  district: string;
  village: string;
  latitude: number;
  longitude: number;
  latestReading: DWLRData;
  readings: DWLRData[];
  trend: 'rising' | 'falling' | 'stable';
  avgWaterLevel: number;
  criticalStatus: 'excellent' | 'good' | 'moderate' | 'poor' | 'critical';
}

interface ResearchAnalytics {
  averageRechargeRate: number;
  seasonalVariation: number;
  depletionRate: number;
  criticalStations: number;
  dataQuality: number;
  stateWiseDistribution: Record<string, any>;
  temporalTrends: any[];
  rechargePotential: number;
  groundwaterStress: number;
}

// Mock dataset for demonstration (comment this and uncomment API call if needed)
const mockDataset: DWLRData[] = [
  {
    "S.No": 1, "Telemetry_UID": "CGWKQL0165", "State": "Madhya Pradesh", "District": "Agarmalwa", "Tahsil": "Agar", "Block": "Agar", "Village": "Daabadiya", "Latitude": 23.775793, "Longitude": 76.005447, "Date & Time": "2023-12-08 18:00:00", "Battery (V)": 3.59, "Water Temperature (°C)": 26.36, "Water Level (m)": -5.28, "Barometric Pressure (mH2O)": 957.99
  },
  {
    "S.No": 2, "Telemetry_UID": "CGWKQL0165", "State": "Madhya Pradesh", "District": "Agarmalwa", "Tahsil": "Agar", "Block": "Agar", "Village": "Daabadiya", "Latitude": 23.775793, "Longitude": 76.005447, "Date & Time": "2023-12-08 22:00:00", "Battery (V)": 3.61, "Water Temperature (°C)": 25.12, "Water Level (m)": -5.15, "Barometric Pressure (mH2O)": 958.12
  },
  {
    "S.No": 3, "Telemetry_UID": "CGWRAJ0892", "State": "Rajasthan", "District": "Jaipur", "Tahsil": "Jaipur", "Block": "Jaipur", "Village": "Kanota", "Latitude": 26.8467, "Longitude": 75.7794, "Date & Time": "2023-12-08 18:00:00", "Battery (V)": 3.45, "Water Temperature (°C)": 28.45, "Water Level (m)": -12.75, "Barometric Pressure (mH2O)": 950.25
  },
  {
    "S.No": 4, "Telemetry_UID": "CGWRAJ0892", "State": "Rajasthan", "District": "Jaipur", "Tahsil": "Jaipur", "Block": "Jaipur", "Village": "Kanota", "Latitude": 26.8467, "Longitude": 75.7794, "Date & Time": "2023-12-08 22:00:00", "Battery (V)": 3.42, "Water Temperature (°C)": 27.89, "Water Level (m)": -12.92, "Barometric Pressure (mH2O)": 951.15
  },
  {
    "S.No": 5, "Telemetry_UID": "CGWGUJ1234", "State": "Gujarat", "District": "Ahmedabad", "Tahsil": "Ahmedabad", "Block": "Ahmedabad", "Village": "Sarkhej", "Latitude": 23.0225, "Longitude": 72.5714, "Date & Time": "2023-12-08 18:00:00", "Battery (V)": 3.78, "Water Temperature (°C)": 29.15, "Water Level (m)": -2.45, "Barometric Pressure (mH2O)": 962.45
  },
  {
    "S.No": 6, "Telemetry_UID": "CGWGUJ1234", "State": "Gujarat", "District": "Ahmedabad", "Tahsil": "Ahmedabad", "Block": "Ahmedabad", "Village": "Sarkhej", "Latitude": 23.0225, "Longitude": 72.5714, "Date & Time": "2023-12-08 22:00:00", "Battery (V)": 3.82, "Water Temperature (°C)": 28.67, "Water Level (m)": -2.35, "Barometric Pressure (mH2O)": 963.12
  },
  {
    "S.No": 7, "Telemetry_UID": "CGWHAR5678", "State": "Haryana", "District": "Gurugram", "Tahsil": "Gurugram", "Block": "Gurugram", "Village": "Sector-15", "Latitude": 28.4595, "Longitude": 77.0266, "Date & Time": "2023-12-08 18:00:00", "Battery (V)": 3.25, "Water Temperature (°C)": 24.78, "Water Level (m)": -18.45, "Barometric Pressure (mH2O)": 945.78
  },
  {
    "S.No": 8, "Telemetry_UID": "CGWHAR5678", "State": "Haryana", "District": "Gurugram", "Tahsil": "Gurugram", "Block": "Gurugram", "Village": "Sector-15", "Latitude": 28.4595, "Longitude": 77.0266, "Date & Time": "2023-12-08 22:00:00", "Battery (V)": 3.23, "Water Temperature (°C)": 24.45, "Water Level (m)": -18.67, "Barometric Pressure (mH2O)": 946.12
  },
  {
    "S.No": 9, "Telemetry_UID": "CGWUP9012", "State": "Uttar Pradesh", "District": "Noida", "Tahsil": "Noida", "Block": "Noida", "Village": "Sector-62", "Latitude": 28.6139, "Longitude": 77.2090, "Date & Time": "2023-12-08 18:00:00", "Battery (V)": 3.67, "Water Temperature (°C)": 25.89, "Water Level (m)": -8.95, "Barometric Pressure (mH2O)": 955.34
  },
  {
    "S.No": 10, "Telemetry_UID": "CGWUP9012", "State": "Uttar Pradesh", "District": "Noida", "Tahsil": "Noida", "Block": "Noida", "Village": "Sector-62", "Latitude": 28.6139, "Longitude": 77.2090, "Date & Time": "2023-12-08 22:00:00", "Battery (V)": 3.69, "Water Temperature (°C)": 25.45, "Water Level (m)": -8.87, "Barometric Pressure (mH2O)": 955.78
  },
];

export default function GroundwaterDashboard() {
  const [rawData, setRawData] = useState<DWLRData[]>([]);
  const [processedStations, setProcessedStations] = useState<ProcessedStation[]>([]);
  const [filteredStations, setFilteredStations] = useState<ProcessedStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState<string>('');
  const [showStateSelection, setShowStateSelection] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStation, setSelectedStation] = useState<ProcessedStation | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [activeView, setActiveView] = useState('overview');
  const [comparisonStations, setComparisonStations] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [hoveredVisualization, setHoveredVisualization] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const chartAnim = useRef(new Animated.Value(0)).current;

  // Process raw data to handle duplicates and create station objects
  const processData = (data: DWLRData[]): ProcessedStation[] => {
    const stationMap = new Map<string, DWLRData[]>();
    
    // Group readings by station UID
    data.forEach(reading => {
      const uid = reading.Telemetry_UID;
      if (!stationMap.has(uid)) {
        stationMap.set(uid, []);
      }
      stationMap.get(uid)!.push(reading);
    });

    // Process each station
    const stations: ProcessedStation[] = [];
    stationMap.forEach((readings, uid) => {
      // Sort readings by date to get latest
      const sortedReadings = readings.sort((a, b) => 
        new Date(b["Date & Time"]).getTime() - new Date(a["Date & Time"]).getTime()
      );
      
      const latestReading = sortedReadings[0];
      
      // Calculate average water level for trend analysis
      const waterLevels = readings.map(r => r["Water Level (m)"]);
      const avgWaterLevel = waterLevels.reduce((sum, level) => sum + level, 0) / waterLevels.length;
      
      // Determine trend (simplified - compare latest with previous)
      let trend: 'rising' | 'falling' | 'stable' = 'stable';
      if (sortedReadings.length > 1) {
        const diff = sortedReadings[0]["Water Level (m)"] - sortedReadings[1]["Water Level (m)"];
        if (diff > 0.1) trend = 'rising';
        else if (diff < -0.1) trend = 'falling';
      }
      
      // Determine critical status
      const waterLevel = latestReading["Water Level (m)"];
      let criticalStatus: 'excellent' | 'good' | 'moderate' | 'poor' | 'critical';
      if (waterLevel > 0) criticalStatus = 'excellent';
      else if (waterLevel > -5) criticalStatus = 'good';
      else if (waterLevel > -10) criticalStatus = 'moderate';
      else if (waterLevel > -15) criticalStatus = 'poor';
      else criticalStatus = 'critical';

      stations.push({
        telemetryUID: uid,
        state: latestReading.State,
        district: latestReading.District,
        village: latestReading.Village,
        latitude: latestReading.Latitude,
        longitude: latestReading.Longitude,
        latestReading,
        readings: sortedReadings,
        trend,
        avgWaterLevel,
        criticalStatus,
      });
    });

    return stations;
  };

  // Fetch data from API (commented for now, using mock data)
  const fetchData = async () => {
    setRefreshing(true);
    try {
      // Uncomment for API usage
      // const response = await fetch('https://mock-api-jsia.onrender.com/DWLR_DATA');
      // const result = await response.json();
      // setRawData(result);

      // Using mock data for demonstration
      setRawData(mockDataset);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to fetch data. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Process data when raw data changes
  useEffect(() => {
    if (rawData.length > 0) {
      const processed = processData(rawData);
      setProcessedStations(processed);
      setFilteredStations(processed);
    }
  }, [rawData]);

  // Auto-refresh data every 10 seconds
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Animate on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(chartAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for live indicator
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, []);

  // Filter data based on search and filters
  useEffect(() => {
    let filtered = processedStations;

    if (selectedState && selectedState !== 'all') {
      filtered = filtered.filter(station => station.state === selectedState);
    }

    if (searchQuery) {
      filtered = filtered.filter(station =>
        station.telemetryUID.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.village.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedFilter !== 'all') {
      switch (selectedFilter) {
        case 'low_battery':
          filtered = filtered.filter(station => station.latestReading["Battery (V)"] < 3.5);
          break;
        case 'high_temp':
          filtered = filtered.filter(station => station.latestReading["Water Temperature (°C)"] > 30);
          break;
        case 'low_water':
          filtered = filtered.filter(station => station.latestReading["Water Level (m)"] < -10);
          break;
        case 'critical':
          filtered = filtered.filter(station => station.criticalStatus === 'critical');
          break;
        case 'recharged':
          filtered = filtered.filter(station => station.trend === 'rising');
          break;
        case 'excellent':
          filtered = filtered.filter(station => station.criticalStatus === 'excellent');
          break;
      }
    }

    setFilteredStations(filtered);
  }, [processedStations, selectedState, searchQuery, selectedFilter]);

  // Get unique states for selection
  const getUniqueStates = () => {
    return [...new Set(processedStations.map(station => station.state))].sort();
  };

  // Enhanced statistics with research analytics
  const getStatistics = () => {
    if (filteredStations.length === 0) return null;

    const waterLevels = filteredStations.map(station => station.latestReading["Water Level (m)"]);
    const temperatures = filteredStations.map(station => station.latestReading["Water Temperature (°C)"]);
    const batteryLevels = filteredStations.map(station => station.latestReading["Battery (V)"]);
    const pressures = filteredStations.map(station => station.latestReading["Barometric Pressure (mH2O)"]);

    const avgWaterLevel = waterLevels.reduce((sum, level) => sum + level, 0) / waterLevels.length;
    const avgTemperature = temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length;
    const avgBattery = batteryLevels.reduce((sum, battery) => sum + battery, 0) / batteryLevels.length;
    const avgPressure = pressures.reduce((sum, pressure) => sum + pressure, 0) / pressures.length;

    // Research-specific calculations
    const criticalStations = filteredStations.filter(station => station.criticalStatus === 'critical').length;
    const excellentStations = filteredStations.filter(station => station.criticalStatus === 'excellent').length;
    const risingStations = filteredStations.filter(station => station.trend === 'rising').length;
    const lowBatteryCount = filteredStations.filter(station => station.latestReading["Battery (V)"] < 3.5).length;
    const highTempCount = filteredStations.filter(station => station.latestReading["Water Temperature (°C)"] > 30).length;

    // Water level distribution
    const excellent = filteredStations.filter(station => station.criticalStatus === 'excellent').length;
    const good = filteredStations.filter(station => station.criticalStatus === 'good').length;
    const moderate = filteredStations.filter(station => station.criticalStatus === 'moderate').length;
    const poor = filteredStations.filter(station => station.criticalStatus === 'poor').length;
    const critical = filteredStations.filter(station => station.criticalStatus === 'critical').length;

    // State-wise distribution
    const stateDistribution = filteredStations.reduce((acc, station) => {
      acc[station.state] = (acc[station.state] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Trend analysis
    const trendDistribution = {
      rising: filteredStations.filter(s => s.trend === 'rising').length,
      falling: filteredStations.filter(s => s.trend === 'falling').length,
      stable: filteredStations.filter(s => s.trend === 'stable').length,
    };

    return {
      totalStations: filteredStations.length,
      activeStations: filteredStations.filter(s => s.latestReading["Battery (V)"] > 3.5).length,
      avgWaterLevel: avgWaterLevel.toFixed(2),
      avgTemperature: avgTemperature.toFixed(1),
      avgBattery: avgBattery.toFixed(2),
      avgPressure: avgPressure.toFixed(1),
      lowBatteryCount,
      highTempCount,
      criticalStations,
      excellentStations,
      risingStations,
      dataQuality: ((filteredStations.length - lowBatteryCount) / filteredStations.length * 100).toFixed(1),
      waterLevelDistribution: { excellent, good, moderate, poor, critical },
      stateDistribution,
      trendDistribution,
      minWaterLevel: Math.min(...waterLevels).toFixed(2),
      maxWaterLevel: Math.max(...waterLevels).toFixed(2),
      rechargePotential: ((risingStations / filteredStations.length) * 100).toFixed(1),
      groundwaterStress: ((criticalStations / filteredStations.length) * 100).toFixed(1),
    };
  };

  const statistics = getStatistics();

  // Research Analytics
  const researchAnalytics: ResearchAnalytics = useMemo(() => {
    if (!statistics) return {
      averageRechargeRate: 0,
      seasonalVariation: 0,
      depletionRate: 0,
      criticalStations: 0,
      dataQuality: 0,
      stateWiseDistribution: {},
      temporalTrends: [],
      rechargePotential: 0,
      groundwaterStress: 0
    };

    return {
      averageRechargeRate: parseFloat(statistics.rechargePotential),
      seasonalVariation: 15.2, // Mock calculation
      depletionRate: parseFloat(statistics.groundwaterStress),
      criticalStations: statistics.criticalStations,
      dataQuality: parseFloat(statistics.dataQuality),
      stateWiseDistribution: statistics.stateDistribution,
      temporalTrends: [],
      rechargePotential: parseFloat(statistics.rechargePotential),
      groundwaterStress: parseFloat(statistics.groundwaterStress)
    };
  }, [statistics]);

  // Toggle comparison mode
  const toggleComparison = (stationId: string) => {
    if (comparisonStations.includes(stationId)) {
      setComparisonStations(prev => prev.filter(id => id !== stationId));
    } else {
      if (comparisonStations.length < 4) {
        setComparisonStations(prev => [...prev, stationId]);
      }
    }
  };

  // Get water level trend indicator
  const getWaterLevelTrend = (level: number, trend: string) => {
    if (trend === 'rising') return { icon: ArrowUp, color: '#10B981', trend: 'Rising' };
    if (trend === 'falling') return { icon: ArrowDown, color: '#EF4444', trend: 'Falling' };
    return { icon: Minus, color: '#F59E0B', trend: 'Stable' };
  };

  // Water Level Visualization Component
  const WaterLevelVisualization = ({ data, onHover }: any) => {
    return (
      <View style={styles.visualizationContainer}>
        <Text style={styles.visualizationTitle}>Water Level Distribution</Text>
        <View style={styles.barChart}>
          {Object.entries(data).map(([category, count], index) => {
            const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#7C2D12'];
            const labels = ['Excellent', 'Good', 'Moderate', 'Poor', 'Critical'];
            const percentage = ((count as number / statistics!.totalStations) * 100);
            
            return (
              <TouchableOpacity
                key={category}
                style={styles.barContainer}
                onPress={() => onHover && onHover({ category, count, percentage, label: labels[index] })}
              >
                <Animated.View
                  style={[
                    styles.bar,
                    {
                      backgroundColor: colors[index],
                      height: chartAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, Math.max((percentage / 100) * 120, 20)],
                      }),
                    }
                  ]}
                />
                <Text style={styles.barLabel}>{labels[index]}</Text>
                <Text style={styles.barValue}>{String(count)}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  // State Selection Screen
  if (showStateSelection) {
    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <View style={styles.gradientContainer}>
          <View style={styles.stateSelectionContainer}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Text style={styles.title}>DWLR Groundwater Monitoring</Text>
              <Text style={styles.subtitle}>Real-time resource evaluation system</Text>
            </Animated.View>

            <Text style={styles.organizationText}>Ministry of Jal Shakti | CGWB</Text>
            
            <ScrollView style={styles.stateList} showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                style={styles.stateCard}
                onPress={() => {
                  setSelectedState('all');
                  setShowStateSelection(false);
                }}
              >
                <View style={styles.stateCardIcon}>
                  <Globe color="#4F46E5" size={28} />
                </View>
                <Text style={styles.stateCardTitle}>All States</Text>
                <Text style={styles.stateCardCount}>{processedStations.length} stations nationwide</Text>
                <Text style={styles.stateCardSubtext}>Comprehensive national view</Text>
              </TouchableOpacity>

              {getUniqueStates().map((state, index) => {
                const stateStations = processedStations.filter(station => station.state === state);
                const criticalCount = stateStations.filter(station => station.criticalStatus === 'critical').length;
                
                return (
                  <Animated.View
                    key={state}
                    style={[
                      styles.stateCard,
                      {
                        transform: [{
                          translateY: slideAnim.interpolate({
                            inputRange: [0, 300],
                            outputRange: [0, 300],
                          })
                        }]
                      }
                    ]}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedState(state);
                        setShowStateSelection(false);
                      }}
                    >
                      <View style={styles.stateCardIcon}>
                        <MapPin color="#4F46E5" size={28} />
                      </View>
                      <Text style={styles.stateCardTitle}>{state}</Text>
                      <Text style={styles.stateCardCount}>{stateStations.length} monitoring stations</Text>
                      {criticalCount > 0 && (
                        <Text style={styles.criticalAlert}>{criticalCount} critical alerts</Text>
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              style={styles.getStartedButton}
              onPress={() => {
                setSelectedState('all');
                setShowStateSelection(false);
              }}
            >
              <Text style={styles.getStartedText}>Begin Monitoring</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Connecting to DWLR network...</Text>
        <Text style={styles.loadingSubtext}>Loading real-time groundwater data</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.gradientContainer}>
        {/* Enhanced Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              onPress={() => setShowStateSelection(true)}
              style={styles.backButton}
            >
              <Text style={styles.backText}>← States</Text>
            </TouchableOpacity>

            <View style={styles.headerActions}>
              <TouchableOpacity 
                onPress={fetchData}
                style={[styles.refreshButton, refreshing && styles.refreshingButton]}
              >
                <RefreshCw 
                  color="#4F46E5" 
                  size={20} 
                  style={refreshing ? { transform: [{ rotate: '180deg' }] } : {}}
                />
              </TouchableOpacity>

              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <View style={styles.liveIndicator}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              </Animated.View>
            </View>
          </View>
          
          <Text style={styles.headerTitle}>
            {selectedState === 'all' ? 'National Dashboard' : selectedState}
          </Text>
          <Text style={styles.headerSubtitle}>Groundwater Resource Monitoring</Text>
          <Text style={styles.lastUpdate}>
            Last updated: {lastUpdate.toLocaleTimeString()} • {statistics?.totalStations} stations
          </Text>
        </View>

        {/* Key Metrics Above Filters */}
        {statistics && (
          <View style={styles.topMetricsContainer}>
            <View style={styles.topMetricsRow}>
              <Animated.View style={[styles.topMetricCard, { transform: [{ scale: scaleAnim }] }]}>
                <Database color="#4F46E5" size={20} />
                <Text style={styles.topMetricValue}>{statistics.activeStations}</Text>
                <Text style={styles.topMetricLabel}>Active Stations</Text>
              </Animated.View>

              <View style={styles.topMetricCard}>
                <Droplets color="#3B82F6" size={20} />
                <Text style={styles.topMetricValue}>{statistics.avgWaterLevel}m</Text>
                <Text style={styles.topMetricLabel}>Avg Water Level</Text>
              </View>

              <View style={styles.topMetricCard}>
                <Thermometer color="#F59E0B" size={20} />
                <Text style={styles.topMetricValue}>{statistics.avgTemperature}°C</Text>
                <Text style={styles.topMetricLabel}>Avg Temperature</Text>
              </View>

              <View style={styles.topMetricCard}>
                <Battery color="#10B981" size={20} />
                <Text style={styles.topMetricValue}>{statistics.avgBattery}V</Text>
                <Text style={styles.topMetricLabel}>Avg Battery</Text>
              </View>
            </View>
          </View>
        )}

        {/* Search and Filters */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Search color="#6B7280" size={20} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search stations, districts, UIDs..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <Filter color="#4F46E5" size={20} />
          </TouchableOpacity>
        </View>

        {/* View Navigation Tabs */}
        <View style={styles.tabContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              { key: 'overview', label: 'Overview', icon: Activity },
              { key: 'analytics', label: 'Analytics', icon: BarChart3 },
              { key: 'research', label: 'Research', icon: Target },
              { key: 'comparison', label: 'Compare', icon: Eye },
            ].map(({ key, label, icon: Icon }) => (
              <TouchableOpacity
                key={key}
                style={[styles.tab, activeView === key && styles.activeTab]}
                onPress={() => setActiveView(key)}
              >
                <Icon 
                  color={activeView === key ? '#FFFFFF' : '#6B7280'} 
                  size={18} 
                />
                <Text style={[
                  styles.tabText,
                  activeView === key && styles.activeTabText
                ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
          {/* Enhanced Visualizations */}
          {statistics && activeView === 'analytics' && (
            <View style={styles.visualizationSection}>
              <WaterLevelVisualization 
                data={statistics.waterLevelDistribution}
                onHover={setHoveredVisualization}
              />
              
              {/* Trend Analysis Chart */}
              <View style={styles.trendChart}>
                <Text style={styles.visualizationTitle}>Station Trends</Text>
                <View style={styles.trendBars}>
                  <View style={styles.trendBar}>
                    <ArrowUp color="#10B981" size={20} />
                    <Animated.View 
                      style={[
                        styles.trendBarFill,
                        { 
                          backgroundColor: '#10B981',
                          width: chartAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, (statistics.trendDistribution.rising / statistics.totalStations) * 200],
                          })
                        }
                      ]}
                    />
                    <Text style={styles.trendValue}>{statistics.trendDistribution.rising}</Text>
                  </View>

                  <View style={styles.trendBar}>
                    <ArrowDown color="#EF4444" size={20} />
                    <Animated.View 
                      style={[
                        styles.trendBarFill,
                        { 
                          backgroundColor: '#EF4444',
                          width: chartAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, (statistics.trendDistribution.falling / statistics.totalStations) * 200],
                          })
                        }
                      ]}
                    />
                    <Text style={styles.trendValue}>{statistics.trendDistribution.falling}</Text>
                  </View>

                  <View style={styles.trendBar}>
                    <Minus color="#F59E0B" size={20} />
                    <Animated.View 
                      style={[
                        styles.trendBarFill,
                        { 
                          backgroundColor: '#F59E0B',
                          width: chartAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, (statistics.trendDistribution.stable / statistics.totalStations) * 200],
                          })
                        }
                      ]}
                    />
                    <Text style={styles.trendValue}>{statistics.trendDistribution.stable}</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Research Analytics Cards */}
          {activeView === 'research' && (
            <View style={styles.researchMetrics}>
              <Text style={styles.sectionTitle}>Advanced Research Analytics</Text>
              
              <View style={styles.researchGrid}>
                <TouchableOpacity 
                  style={styles.researchCard}
                  onPress={() => setHoveredVisualization({
                    title: 'Recharge Potential',
                    value: `${researchAnalytics.rechargePotential}%`,
                    description: 'Percentage of stations showing rising water levels indicating natural or artificial recharge'
                  })}
                >
                  <TrendingUp color="#10B981" size={24} />
                  <Text style={styles.researchValue}>{researchAnalytics.rechargePotential.toFixed(1)}%</Text>
                  <Text style={styles.researchLabel}>Recharge Potential</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.researchCard}
                  onPress={() => setHoveredVisualization({
                    title: 'Groundwater Stress',
                    value: `${researchAnalytics.groundwaterStress}%`,
                    description: 'Percentage of stations in critical condition indicating high groundwater stress'
                  })}
                >
                  <TrendingDown color="#EF4444" size={24} />
                  <Text style={styles.researchValue}>{researchAnalytics.groundwaterStress.toFixed(1)}%</Text>
                  <Text style={styles.researchLabel}>Groundwater Stress</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.researchCard}
                  onPress={() => setHoveredVisualization({
                    title: 'Data Quality Index',
                    value: `${researchAnalytics.dataQuality}%`,
                    description: 'Percentage of stations with optimal battery levels ensuring reliable data transmission'
                  })}
                >
                  <Database color="#8B5CF6" size={24} />
                  <Text style={styles.researchValue}>{researchAnalytics.dataQuality.toFixed(1)}%</Text>
                  <Text style={styles.researchLabel}>Data Quality</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.researchCard}
                  onPress={() => setHoveredVisualization({
                    title: 'Critical Zones',
                    value: `${researchAnalytics.criticalStations}`,
                    description: 'Number of monitoring stations reporting water levels below -15m threshold'
                  })}
                >
                  <AlertTriangle color="#F59E0B" size={24} />
                  <Text style={styles.researchValue}>{researchAnalytics.criticalStations}</Text>
                  <Text style={styles.researchLabel}>Critical Zones</Text>
                </TouchableOpacity>
              </View>

              {/* State-wise Performance */}
              <Text style={styles.sectionTitle}>State-wise Performance</Text>
              <View style={styles.statePerformance}>
                {statistics &&
                  Object.entries(statistics.stateDistribution).map(([state, count]) => {
                    const stateStations = filteredStations.filter(s => s.state === state);
                    const criticalCount = stateStations.filter(s => s.criticalStatus === 'critical').length;
                    const criticalPercentage = ((criticalCount / (count as number)) * 100);
                    
                    return (
                      <View key={state} style={styles.statePerformanceCard}>
                        <View style={styles.statePerformanceHeader}>
                          <Text style={styles.statePerformanceName}>{state}</Text>
                          <Text style={styles.statePerformanceCount}>{count} stations</Text>
                        </View>
                        <View style={styles.statePerformanceMetrics}>
                          <View style={styles.performanceMetric}>
                            <Text style={styles.performanceLabel}>Critical</Text>
                            <Text style={[styles.performanceValue, { color: '#EF4444' }]}>
                              {criticalPercentage.toFixed(1)}%
                            </Text>
                          </View>
                          <View style={styles.performanceIndicator}>
                            <View 
                              style={[
                                styles.performanceBar,
                                { 
                                  width: `${100 - criticalPercentage}%`,
                                  backgroundColor: criticalPercentage > 20 ? '#EF4444' : criticalPercentage > 10 ? '#F59E0B' : '#10B981'
                                }
                              ]} 
                            />
                          </View>
                        </View>
                      </View>
                    );
                  })}
              </View>
            </View>
          )}

          {/* Alert Summary */}
          {statistics && (statistics.lowBatteryCount > 0 || statistics.criticalStations > 0) && (
            <View style={styles.alertsContainer}>
              <Text style={styles.sectionTitle}>System Alerts</Text>
              
              {statistics.criticalStations > 0 && (
                <TouchableOpacity 
                  style={[styles.alertCard, styles.criticalAlertCard]}
                  onPress={() => setSelectedFilter('critical')}
                >
                  <AlertTriangle color="#EF4444" size={20} />
                  <View style={styles.alertContent}>
                    <Text style={styles.alertTitle}>Critical Water Levels</Text>
                    <Text style={styles.alertText}>
                      {statistics.criticalStations} stations below -15m threshold
                    </Text>
                  </View>
                  <ChevronRight color="#EF4444" size={16} />
                </TouchableOpacity>
              )}

              {statistics.lowBatteryCount > 0 && (
                <TouchableOpacity 
                  style={[styles.alertCard, styles.warningAlert]}
                  onPress={() => setSelectedFilter('low_battery')}
                >
                  <Battery color="#F59E0B" size={20} />
                  <View style={styles.alertContent}>
                    <Text style={styles.alertTitle}>Low Battery Warning</Text>
                    <Text style={styles.alertText}>
                      {statistics.lowBatteryCount} stations require maintenance
                    </Text>
                  </View>
                  <ChevronRight color="#F59E0B" size={16} />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Station Comparison View */}
          {activeView === 'comparison' && (
            <View style={styles.comparisonContainer}>
              <View style={styles.comparisonHeader}>
                <Text style={styles.sectionTitle}>Station Comparison</Text>
                <TouchableOpacity 
                  style={styles.comparisonToggle}
                  onPress={() => setShowComparison(!showComparison)}
                >
                  <Text style={styles.comparisonToggleText}>
                    {showComparison ? 'Exit' : 'Select'} Mode
                  </Text>
                </TouchableOpacity>
              </View>
              
              {comparisonStations.length > 0 && (
                <View style={styles.comparisonGrid}>
                  {comparisonStations.map(stationId => {
                    const station = filteredStations.find(s => s.telemetryUID === stationId);
                    if (!station) return null;
                    
                    const trend = getWaterLevelTrend(station.latestReading["Water Level (m)"], station.trend);
                    
                    return (
                      <View key={stationId} style={styles.comparisonCard}>
                        <TouchableOpacity 
                          style={styles.removeComparison}
                          onPress={() => toggleComparison(stationId)}
                        >
                          <Text style={styles.removeText}>×</Text>
                        </TouchableOpacity>
                        
                        <Text style={styles.comparisonStationId}>{station.telemetryUID}</Text>
                        <Text style={styles.comparisonLocation}>
                          {station.district}, {station.state}
                        </Text>
                        
                        <View style={styles.comparisonMetrics}>
                          <View style={styles.comparisonMetric}>
                            <Droplets color="#3B82F6" size={16} />
                            <Text style={styles.comparisonValue}>
                              {station.latestReading["Water Level (m)"].toFixed(2)}m
                            </Text>
                          </View>
                          
                          <View style={styles.comparisonMetric}>
                            <trend.icon color={trend.color} size={16} />
                            <Text style={[styles.comparisonTrend, { color: trend.color }]}>
                              {trend.trend}
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          )}

          {/* Enhanced Station List */}
          <View style={styles.stationList}>
            <View style={styles.stationListHeader}>
              <Text style={styles.sectionTitle}>
                Monitoring Stations ({filteredStations.length})
              </Text>
              {activeView === 'comparison' && (
                <Text style={styles.comparisonHelper}>
                  Tap stations to compare ({comparisonStations.length}/4)
                </Text>
              )}
            </View>
            
            {filteredStations.slice(0, 20).map((station, index) => {
              const trend = getWaterLevelTrend(station.latestReading["Water Level (m)"], station.trend);
              const isSelected = comparisonStations.includes(station.telemetryUID);
              
              return (
                <TouchableOpacity
                  key={`${station.telemetryUID}-${index}`}
                  style={[
                    styles.stationCard,
                    isSelected && styles.selectedStationCard,
                    showComparison && styles.selectableCard
                  ]}
                  onPress={() => {
                    if (showComparison) {
                      toggleComparison(station.telemetryUID);
                    } else {
                      setSelectedStation(station);
                    }
                  }}
                >
                  <View style={styles.stationHeader}>
                    <View style={styles.stationInfo}>
                      <Text style={styles.stationId}>{station.telemetryUID}</Text>
                      <Text style={styles.stationLocation}>
                        {station.village}, {station.district}
                      </Text>
                      <View style={styles.stationStatusRow}>
                        <View style={[
                          styles.criticalStatusBadge,
                          { backgroundColor: getCriticalStatusColor(station.criticalStatus) }
                        ]}>
                          <Text style={styles.criticalStatusText}>
                            {station.criticalStatus.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.stationStatus}>
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: station.latestReading["Battery (V)"] > 3.5 ? '#10B981' : '#EF4444' }
                        ]}
                      />
                      <trend.icon color={trend.color} size={16} />
                    </View>
                  </View>
                  
                  <View style={styles.stationMetrics}>
                    <View style={styles.metric}>
                      <Droplets color="#3B82F6" size={14} />
                      <Text style={[styles.metricValue, { color: trend.color }]}>
                        {station.latestReading["Water Level (m)"].toFixed(2)}m
                      </Text>
                    </View>
                    <View style={styles.metric}>
                      <Thermometer color="#F59E0B" size={14} />
                      <Text style={styles.metricValue}>
                        {station.latestReading["Water Temperature (°C)"].toFixed(1)}°C
                      </Text>
                    </View>
                    <View style={styles.metric}>
                      <Battery 
                        color={station.latestReading["Battery (V)"] > 3.5 ? '#10B981' : '#EF4444'} 
                        size={14} 
                      />
                      <Text style={styles.metricValue}>
                        {station.latestReading["Battery (V)"].toFixed(2)}V
                      </Text>
                    </View>
                  </View>

                  {isSelected && (
                    <View style={styles.selectedIndicator}>
                      <Text style={styles.selectedText}>Selected for Comparison</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Enhanced Filter Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showFilters}
          onRequestClose={() => setShowFilters(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.filterModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Advanced Filters</Text>
                <TouchableOpacity onPress={() => setShowFilters(false)}>
                  <Text style={styles.closeButton}>×</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView>
                <Text style={styles.filterSectionTitle}>Quick Filters</Text>
                <View style={styles.quickFilters}>
                  {[
                    { key: 'all', title: 'All Stations', icon: Database, color: '#6B7280' },
                    { key: 'critical', title: 'Critical Levels', icon: AlertTriangle, color: '#EF4444' },
                    { key: 'low_battery', title: 'Low Battery', icon: Battery, color: '#F59E0B' },
                    { key: 'high_temp', title: 'High Temperature', icon: Thermometer, color: '#DC2626' },
                    { key: 'low_water', title: 'Low Water Level', icon: TrendingDown, color: '#7C2D12' },
                    { key: 'recharged', title: 'Rising Trend', icon: TrendingUp, color: '#10B981' },
                    { key: 'excellent', title: 'Excellent Status', icon: Droplets, color: '#059669' },
                  ].map(({ key, title, icon: Icon, color }) => (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.quickFilterButton,
                        selectedFilter === key && styles.activeQuickFilter
                      ]}
                      onPress={() => {
                        setSelectedFilter(key);
                        setShowFilters(false);
                      }}
                    >
                      <Icon 
                        color={selectedFilter === key ? '#FFFFFF' : color} 
                        size={18} 
                      />
                      <Text
                        style={[
                          styles.quickFilterText,
                          selectedFilter === key && styles.activeQuickFilterText
                        ]}
                      >
                        {title}
                      </Text>
                      {selectedFilter === key && (
                        <View style={styles.activeFilterIndicator} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.filterSectionTitle}>Search Options</Text>
                <View style={styles.searchFilters}>
                  <TextInput
                    style={styles.filterInput}
                    placeholder="Search by Station UID"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </ScrollView>

              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={() => {
                  setSelectedFilter('all');
                  setSearchQuery('');
                  setShowFilters(false);
                }}
              >
                <Text style={styles.clearFiltersText}>Clear All Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Hovered Visualization Details Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={!!hoveredVisualization}
          onRequestClose={() => setHoveredVisualization(null)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            onPress={() => setHoveredVisualization(null)}
            activeOpacity={1}
          >
            <View style={styles.hoveredDetailsModal}>
              {hoveredVisualization && (
                <>
                  <Text style={styles.hoveredTitle}>
                    {hoveredVisualization.title || hoveredVisualization.label}
                  </Text>
                  <Text style={styles.hoveredValue}>
                    {hoveredVisualization.value || hoveredVisualization.count}
                  </Text>
                  {hoveredVisualization.description && (
                    <Text style={styles.hoveredDescription}>
                      {hoveredVisualization.description}
                    </Text>
                  )}
                  {hoveredVisualization.percentage && (
                    <Text style={styles.hoveredPercentage}>
                      {hoveredVisualization.percentage.toFixed(1)}% of total stations
                    </Text>
                  )}
                </>
              )}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Enhanced Station Detail Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={!!selectedStation}
          onRequestClose={() => setSelectedStation(null)}
        >
          {selectedStation && (
            <View style={styles.modalOverlay}>
              <View style={styles.detailModal}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Station Details</Text>
                  <TouchableOpacity onPress={() => setSelectedStation(null)}>
                    <Text style={styles.closeButton}>×</Text>
                  </TouchableOpacity>
                </View>
                
                <ScrollView>
                  <View style={styles.stationDetailHeader}>
                    <Text style={styles.detailStationId}>{selectedStation.telemetryUID}</Text>
                    <View style={styles.detailStatusBadge}>
                      <View style={[
                        styles.detailStatusDot,
                        { backgroundColor: selectedStation.latestReading["Battery (V)"] > 3.5 ? '#10B981' : '#EF4444' }
                      ]} />
                      <Text style={styles.detailStatusText}>
                        {selectedStation.latestReading["Battery (V)"] > 3.5 ? 'Active' : 'Low Battery'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailLocationCard}>
                    <MapPin color="#4F46E5" size={20} />
                    <View style={styles.locationInfo}>
                      <Text style={styles.detailLocation}>
                        {selectedStation.village}, {selectedStation.latestReading.Block}
                      </Text>
                      <Text style={styles.detailSubLocation}>
                        {selectedStation.district}, {selectedStation.state}
                      </Text>
                      <Text style={styles.detailCoordinates}>
                        {selectedStation.latitude.toFixed(6)}, {selectedStation.longitude.toFixed(6)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailMetricsGrid}>
                    <View style={styles.detailMetricCard}>
                      <Droplets color="#3B82F6" size={24} />
                      <Text style={styles.detailMetricLabel}>Water Level</Text>
                      <Text style={[
                        styles.detailMetricValue,
                        { color: getWaterLevelTrend(selectedStation.latestReading["Water Level (m)"], selectedStation.trend).color }
                      ]}>
                        {selectedStation.latestReading["Water Level (m)"].toFixed(2)}m
                      </Text>
                      <Text style={styles.detailMetricSubtext}>
                        {selectedStation.criticalStatus.toUpperCase()}
                      </Text>
                    </View>

                    <View style={styles.detailMetricCard}>
                      <Thermometer color="#F59E0B" size={24} />
                      <Text style={styles.detailMetricLabel}>Temperature</Text>
                      <Text style={styles.detailMetricValue}>
                        {selectedStation.latestReading["Water Temperature (°C)"].toFixed(1)}°C
                      </Text>
                      <Text style={styles.detailMetricSubtext}>
                        {selectedStation.latestReading["Water Temperature (°C)"] > 30 ? 'High' : 
                         selectedStation.latestReading["Water Temperature (°C)"] > 25 ? 'Normal' : 'Low'}
                      </Text>
                    </View>

                    <View style={styles.detailMetricCard}>
                      <Battery color="#10B981" size={24} />
                      <Text style={styles.detailMetricLabel}>Battery Status</Text>
                      <Text style={styles.detailMetricValue}>
                        {selectedStation.latestReading["Battery (V)"].toFixed(2)}V
                      </Text>
                      <Text style={styles.detailMetricSubtext}>
                        {selectedStation.latestReading["Battery (V)"] > 3.5 ? 'Good' : 'Needs Maintenance'}
                      </Text>
                    </View>

                    <View style={styles.detailMetricCard}>
                      <Zap color="#8B5CF6" size={24} />
                      <Text style={styles.detailMetricLabel}>Pressure</Text>
                      <Text style={styles.detailMetricValue}>
                        {selectedStation.latestReading["Barometric Pressure (mH2O)"].toFixed(1)}
                      </Text>
                      <Text style={styles.detailMetricSubtext}>mH2O</Text>
                    </View>
                  </View>

                  {/* Historical Data Preview */}
                  <View style={styles.historicalPreview}>
                    <Text style={styles.detailSectionTitle}>Recent Readings</Text>
                    {selectedStation.readings.slice(0, 3).map((reading, index) => (
                      <View key={index} style={styles.historicalReading}>
                        <View style={styles.historicalTime}>
                          <Calendar color="#6B7280" size={14} />
                          <Text style={styles.historicalTimeText}>
                            {new Date(reading["Date & Time"]).toLocaleString()}
                          </Text>
                        </View>
                        <Text style={styles.historicalValue}>
                          {reading["Water Level (m)"].toFixed(2)}m
                        </Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>

                <TouchableOpacity
                  style={styles.addToComparisonButton}
                  onPress={() => {
                    toggleComparison(selectedStation.telemetryUID);
                    setSelectedStation(null);
                  }}
                >
                  <Text style={styles.addToComparisonText}>
                    {comparisonStations.includes(selectedStation.telemetryUID) 
                      ? 'Remove from Comparison' 
                      : 'Add to Comparison'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Modal>
      </View>
    </Animated.View>
  );
}

// Helper function to get critical status color
function getCriticalStatusColor(status: string): string {
  switch (status) {
    case 'excellent': return '#10B981';
    case 'good': return '#3B82F6';
    case 'moderate': return '#F59E0B';
    case 'poor': return '#EF4444';
    case 'critical': return '#7C2D12';
    default: return '#6B7280';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  gradientContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  stateSelectionContainer: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#4F46E5',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#E5E7EB',
    textAlign: 'center',
    marginBottom: 8,
  },
  organizationText: {
    fontSize: 14,
    color: '#D1D5DB',
    textAlign: 'center',
    marginBottom: 40,
    fontStyle: 'italic',
  },
  stateList: {
    flex: 1,
    marginBottom: 24,
  },
  stateCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  stateCardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  stateCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  stateCardCount: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  stateCardSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  criticalAlert: {
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '600',
    marginTop: 4,
  },
  getStartedButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  getStartedText: {
    color: '#4F46E5',
    fontSize: 18,
    fontWeight: 'bold',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  backText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  refreshingButton: {
    opacity: 0.6,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    marginRight: 6,
  },
  liveText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#4F46E5',
    fontWeight: '500',
    marginBottom: 8,
  },
  lastUpdate: {
    fontSize: 14,
    color: '#6B7280',
  },
  topMetricsContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  topMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  topMetricCard: {
    alignItems: 'center',
    flex: 1,
  },
  topMetricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 4,
    marginBottom: 2,
  },
  topMetricLabel: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  filterButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  activeTab: {
    backgroundColor: '#4F46E5',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  visualizationSection: {
    marginBottom: 24,
  },
  visualizationContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  visualizationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
    paddingHorizontal: 10,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 2,
  },
  bar: {
    width: '80%',
    borderRadius: 4,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 4,
  },
  barValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
  },
  trendChart: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  trendBars: {
    gap: 12,
  },
  trendBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  trendBarFill: {
    height: 8,
    borderRadius: 4,
    flex: 1,
  },
  trendValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    minWidth: 30,
  },
  researchMetrics: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  researchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  researchCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  researchValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 4,
  },
  researchLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  statePerformance: {
    gap: 12,
  },
  statePerformanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statePerformanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statePerformanceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  statePerformanceCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  statePerformanceMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  performanceMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  performanceLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  performanceValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  performanceIndicator: {
    flex: 1,
    height: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 2,
  },
  performanceBar: {
    height: '100%',
    borderRadius: 2,
  },
  alertsContainer: {
    marginBottom: 24,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  criticalAlertCard: {
    borderLeftColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  warningAlert: {
    borderLeftColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  alertContent: {
    flex: 1,
    marginLeft: 12,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  alertText: {
    fontSize: 14,
    color: '#6B7280',
  },
  comparisonContainer: {
    marginBottom: 24,
  },
  comparisonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  comparisonToggle: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  comparisonToggleText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  comparisonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  comparisonCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  removeComparison: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  comparisonStationId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  comparisonLocation: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
  },
  comparisonMetrics: {
    gap: 8,
  },
  comparisonMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  comparisonValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  comparisonTrend: {
    fontSize: 12,
    fontWeight: '600',
  },
  stationList: {
    marginBottom: 40,
  },
  stationListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  comparisonHelper: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  stationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedStationCard: {
    borderWidth: 2,
    borderColor: '#4F46E5',
    backgroundColor: '#F0F9FF',
  },
  selectableCard: {
    opacity: 0.8,
  },
  stationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stationInfo: {
    flex: 1,
  },
  stationId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  stationLocation: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  stationStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  criticalStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  criticalStatusText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  stationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  stationMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  selectedIndicator: {
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  selectedText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  filterModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: height * 0.8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  detailModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: height * 0.9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  hoveredDetailsModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  hoveredTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  hoveredValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginBottom: 8,
  },
  hoveredDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  hoveredPercentage: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 16,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    fontSize: 24,
    color: '#9CA3AF',
    fontWeight: 'bold',
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
    marginTop: 16,
  },
  quickFilters: {
    gap: 12,
  },
  quickFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeQuickFilter: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  quickFilterText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
    fontWeight: '500',
    flex: 1,
  },
  activeQuickFilterText: {
    color: '#FFFFFF',
  },
  activeFilterIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  searchFilters: {
    gap: 12,
  },
  filterInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  clearFiltersButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  clearFiltersText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  stationDetailHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  detailStationId: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  detailStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  detailStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  detailStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  detailLocationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  locationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  detailLocation: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  detailSubLocation: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  detailCoordinates: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'monospace',
  },
  detailMetricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  detailMetricCard: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  detailMetricLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  detailMetricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
  },
  detailMetricSubtext: {
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 2,
  },
  historicalPreview: {
    marginBottom: 20,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  historicalReading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    marginBottom: 8,
  },
  historicalTime: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  historicalTimeText: {
    fontSize: 11,
    color: '#6B7280',
    marginLeft: 6,
  },
  historicalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  addToComparisonButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addToComparisonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});