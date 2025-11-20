import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BarChart3,
  Battery,
  Calendar,
  ChevronRight,
  Database,
  Droplets,
  Filter,
  Globe,
  Languages,
  MapPin,
  Minus,
  RefreshCw,
  Search,
  Thermometer,
  TrendingDown,
  TrendingUp,
  Zap
} from 'lucide-react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import {
  BarChart as RNBarChart,
  LineChart as RNLineChart,
} from 'react-native-chart-kit';

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

// Language texts
const texts = {
  en: {
    title: 'DWLR Groundwater Monitoring',
    subtitle: 'Real-time resource evaluation system',
    organization: 'Ministry of Jal Shakti | CGWB',
    allStates: 'All States',
    stationsNationwide: 'stations nationwide',
    comprehensiveView: 'Comprehensive national view',
    monitoringStations: 'monitoring stations',
    criticalAlerts: 'critical alerts',
    beginMonitoring: 'Begin Monitoring',
    nationalDashboard: 'National Dashboard',
    groundwaterResourceMonitoring: 'Groundwater Resource Monitoring',
    lastUpdated: 'Last updated',
    activeStations: 'Active Stations',
    avgWaterLevel: 'Avg Water Level',
    avgTemperature: 'Avg Temperature',
    avgBattery: 'Avg Battery',
    searchPlaceholder: 'Search stations, districts, UIDs...',
    analytics: 'Analytics',
    overview: 'Overview',
    waterLevelDistribution: 'Water Level Distribution',
    waterLevelTrendOverTime: 'Water Level Trend Over Time',
    stateWiseAverageWaterLevel: 'State-wise Average Water Level',
    stationTrends: 'Station Trends',
    systemAlerts: 'System Alerts',
    criticalWaterLevels: 'Critical Water Levels',
    stationsBelowThreshold: 'stations below -15m threshold',
    lowBatteryWarning: 'Low Battery Warning',
    stationsRequireMaintenance: 'stations require maintenance',
    monitoringStationsLabel: 'Monitoring Stations',
    excellent: 'Excellent',
    good: 'Good',
    moderate: 'Moderate',
    poor: 'Poor',
    critical: 'Critical',
    rising: 'Rising',
    falling: 'Falling',
    stable: 'Stable',
    live: 'LIVE',
    states: 'States',
    advancedFilters: 'Advanced Filters',
    quickFilters: 'Quick Filters',
    allStations: 'All Stations',
    criticalLevels: 'Critical Levels',
    lowBattery: 'Low Battery',
    highTemperature: 'High Temperature',
    lowWaterLevel: 'Low Water Level',
    risingTrend: 'Rising Trend',
    excellentStatus: 'Excellent Status',
    searchByStationUID: 'Search by Station UID',
    clearAllFilters: 'Clear All Filters',
    selectLanguage: 'Select Language',
    stationDetails: 'Station Details',
    active: 'Active',
    lowBatteryStatus: 'Low Battery',
    waterLevel: 'Water Level',
    temperature: 'Temperature',
    batteryStatus: 'Battery Status',
    pressure: 'Pressure',
    high: 'High',
    normal: 'Normal',
    low: 'Low',
    good: 'Good',
    needsMaintenance: 'Needs Maintenance',
    mH2O: 'mH2O',
    waterLevelTrend: 'Water Level Trend',
    recentReadings: 'Recent Readings',
    connecting: 'Connecting to DWLR network...',
    loadingData: 'Loading real-time groundwater data',
  },
  hi: {
    title: 'डीडब्ल्यूएलआर भूजल निगरानी',
    subtitle: 'वास्तविक-समय संसाधन मूल्यांकन प्रणाली',
    organization: 'जल शक्ति मंत्रालय | सीजीडब्ल्यूबी',
    allStates: 'सभी राज्य',
    stationsNationwide: 'राष्ट्रव्यापी स्टेशन',
    comprehensiveView: 'व्यापक राष्ट्रीय दृश्य',
    monitoringStations: 'निगरानी स्टेशन',
    criticalAlerts: 'महत्वपूर्ण अलर्ट',
    beginMonitoring: 'निगरानी शुरू करें',
    nationalDashboard: 'राष्ट्रीय डैशबोर्ड',
    groundwaterResourceMonitoring: 'भूजल संसाधन निगरानी',
    lastUpdated: 'अंतिम अपडेट',
    activeStations: 'सक्रिय स्टेशन',
    avgWaterLevel: 'औसत जल स्तर',
    avgTemperature: 'औसत तापमान',
    avgBattery: 'औसत बैटरी',
    searchPlaceholder: 'स्टेशन, जिलों, यूआईडी खोजें...',
    analytics: 'विश्लेषण',
    overview: 'अवलोकन',
    waterLevelDistribution: 'जल स्तर वितरण',
    waterLevelTrendOverTime: 'समय के साथ जल स्तर प्रवृत्ति',
    stateWiseAverageWaterLevel: 'राज्य-वार औसत जल स्तर',
    stationTrends: 'स्टेशन प्रवृत्तियां',
    systemAlerts: 'सिस्टम अलर्ट',
    criticalWaterLevels: 'महत्वपूर्ण जल स्तर',
    stationsBelowThreshold: '-15m थ्रेशोल्ड से नीचे स्टेशन',
    lowBatteryWarning: 'कम बैटरी चेतावनी',
    stationsRequireMaintenance: 'रखरखाव की आवश्यकता वाले स्टेशन',
    monitoringStationsLabel: 'निगरानी स्टेशन',
    excellent: 'उत्कृष्ट',
    good: 'अच्छा',
    moderate: 'मध्यम',
    poor: 'खराब',
    critical: 'महत्वपूर्ण',
    rising: 'बढ़ रहा है',
    falling: 'गिर रहा है',
    stable: 'स्थिर',
    live: 'लाइव',
    states: 'राज्य',
    advancedFilters: 'उन्नत फिल्टर',
    quickFilters: 'त्वरित फिल्टर',
    allStations: 'सभी स्टेशन',
    criticalLevels: 'महत्वपूर्ण स्तर',
    lowBattery: 'कम बैटरी',
    highTemperature: 'उच्च तापमान',
    lowWaterLevel: 'निम्न जल स्तर',
    risingTrend: 'बढ़ती प्रवृत्ति',
    excellentStatus: 'उत्कृष्ट स्थिति',
    searchByStationUID: 'स्टेशन यूआईडी द्वारा खोजें',
    clearAllFilters: 'सभी फिल्टर साफ़ करें',
    selectLanguage: 'भाषा चुनें',
    stationDetails: 'स्टेशन विवरण',
    active: 'सक्रिय',
    lowBatteryStatus: 'कम बैटरी',
    waterLevel: 'जल स्तर',
    temperature: 'तापमान',
    batteryStatus: 'बैटरी स्थिति',
    pressure: 'दबाव',
    high: 'उच्च',
    normal: 'सामान्य',
    low: 'निम्न',
    good: 'अच्छा',
    needsMaintenance: 'रखरखाव की आवश्यकता',
    mH2O: 'mH2O',
    waterLevelTrend: 'जल स्तर प्रवृत्ति',
    recentReadings: 'हाल की रीडिंग',
    connecting: 'डीडब्ल्यूएलआर नेटवर्क से कनेक्ट हो रहा है...',
    loadingData: 'रीयल-टाइम भूजल डेटा लोड हो रहा है',
  }
};

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
  const [activeView, setActiveView] = useState('analytics');
  const [hoveredVisualization, setHoveredVisualization] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const lang = selectedLanguage === 'English' ? 'en' : 'hi';

  const getCriticalStatusColor = (status: string): string => {
    switch (status) {
      case 'excellent': return '#10B981';
      case 'good': return '#3B82F6';
      case 'moderate': return '#F59E0B';
      case 'poor': return '#EF4444';
      case 'critical': return '#7C2D12';
      default: return '#6B7280';
    }
  };

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const chartAnim = useRef(new Animated.Value(0)).current;

  const processData = (data: DWLRData[]): ProcessedStation[] => {
    const stationMap = new Map<string, DWLRData[]>();
    
    data.forEach(reading => {
      const uid = reading.Telemetry_UID;
      if (!stationMap.has(uid)) {
        stationMap.set(uid, []);
      }
      stationMap.get(uid)!.push(reading);
    });

    const stations: ProcessedStation[] = [];
    stationMap.forEach((readings, uid) => {
      const sortedReadings = readings.sort((a, b) => 
        new Date(b["Date & Time"]).getTime() - new Date(a["Date & Time"]).getTime()
      );
      
      const latestReading = sortedReadings[0];
      
      const waterLevels = readings.map(r => r["Water Level (m)"]);
      const avgWaterLevel = waterLevels.reduce((sum, level) => sum + level, 0) / waterLevels.length;
      
      let trend: 'rising' | 'falling' | 'stable' = 'stable';
      if (sortedReadings.length > 1) {
        const diff = sortedReadings[0]["Water Level (m)"] - sortedReadings[1]["Water Level (m)"];
        if (diff > 0.1) trend = 'rising';
        else if (diff < -0.1) trend = 'falling';
      }
      
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

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const response = await fetch('https://mock-api-jsia.onrender.com/DWLR_DATA');
      const result = await response.json();
      setRawData(result);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to fetch data. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const processedStationsMemo = useMemo(() => processData(rawData), [rawData]);

  useEffect(() => {
    setProcessedStations(processedStationsMemo);
    setFilteredStations(processedStationsMemo);
  }, [processedStationsMemo]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

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
        useNativeDriver: false,
      }),
    ]).start();

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

  const allIndianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
    'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
    'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  const getUniqueStates = () => {
    const dataStates = [...new Set(processedStations.map(station => station.state))].sort();
    const otherStates = allIndianStates.filter(s => !dataStates.includes(s)).sort();
    return dataStates.concat(otherStates);
  };

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

    const criticalStations = filteredStations.filter(station => station.criticalStatus === 'critical').length;
    const excellentStations = filteredStations.filter(station => station.criticalStatus === 'excellent').length;
    const risingStations = filteredStations.filter(station => station.trend === 'rising').length;
    const lowBatteryCount = filteredStations.filter(station => station.latestReading["Battery (V)"] < 3.5).length;
    const highTempCount = filteredStations.filter(station => station.latestReading["Water Temperature (°C)"] > 30).length;

    const excellent = filteredStations.filter(station => station.criticalStatus === 'excellent').length;
    const good = filteredStations.filter(station => station.criticalStatus === 'good').length;
    const moderate = filteredStations.filter(station => station.criticalStatus === 'moderate').length;
    const poor = filteredStations.filter(station => station.criticalStatus === 'poor').length;
    const critical = filteredStations.filter(station => station.criticalStatus === 'critical').length;

    const stateDistribution = filteredStations.reduce((acc, station) => {
      acc[station.state] = (acc[station.state] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

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

  const statistics = useMemo(() => getStatistics(), [filteredStations]);

  const getWaterLevelTrend = (level: number, trend: string) => {
    if (trend === 'rising') return { icon: ArrowUp, color: '#10B981', trend: texts[lang].rising };
    if (trend === 'falling') return { icon: ArrowDown, color: '#EF4444', trend: texts[lang].falling };
    return { icon: Minus, color: '#F59E0B', trend: texts[lang].stable };
  };

  const getTrendData = useMemo(() => (stations: ProcessedStation[]) => {
    const allReadings = stations.flatMap(s => s.readings);
    const grouped = allReadings.reduce((acc, reading) => {
      const date = new Date(reading["Date & Time"]).toLocaleDateString();
      if (!acc[date]) acc[date] = { sum: 0, count: 0 };
      acc[date].sum += reading["Water Level (m)"];
      acc[date].count++;
      return acc;
    }, {} as Record<string, { sum: number; count: number }>);

    const sortedDates = Object.keys(grouped).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    const data = sortedDates.map(date => grouped[date].sum / grouped[date].count);

    return {
      labels: sortedDates.map(date => date.substring(0, 5)),
      datasets: [{ data }]
    };
  }, []);

  const getStateAverages = useMemo(() => (stations: ProcessedStation[]) => {
    const stateAvgs = stations.reduce((acc, station) => {
      if (!acc[station.state]) acc[station.state] = { sum: 0, count: 0 };
      acc[station.state].sum += station.latestReading["Water Level (m)"];
      acc[station.state].count++;
      return acc;
    }, {} as Record<string, { sum: number; count: number }>);

    const labels = Object.keys(stateAvgs).sort();
    const data = labels.map(label => stateAvgs[label].sum / stateAvgs[label].count);

    return {
      labels,
      datasets: [{ data }]
    };
  }, []);

  const getStationHistoricalData = (station: ProcessedStation) => {
    const sortedReadings = station.readings.sort((a, b) => new Date(a["Date & Time"]).getTime() - new Date(b["Date & Time"]).getTime());
    const labels = sortedReadings.map(r => new Date(r["Date & Time"]).toLocaleTimeString().substring(0, 5));
    const data = sortedReadings.map(r => r["Water Level (m)"]);

    return {
      labels,
      datasets: [{ data }]
    };
  };

  const WaterLevelVisualization = ({ data, onHover }: any) => {
    const chartData = {
      labels: [texts[lang].excellent, texts[lang].good, texts[lang].moderate, texts[lang].poor, texts[lang].critical],
      datasets: [{
        data: [data.excellent, data.good, data.moderate, data.poor, data.critical]
      }]
    };

    return (
      <View style={styles.visualizationContainer}>
        <Text style={styles.visualizationTitle}>{texts[lang].waterLevelDistribution}</Text>
        <RNBarChart
          data={chartData}
          width={width - 60}
          height={220}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: '#FFFFFF',
            backgroundGradientFrom: '#F8FAFC',
            backgroundGradientTo: '#F8FAFC',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
            style: { borderRadius: 16 },
            propsForDots: { r: '6', strokeWidth: '2', stroke: '#4F46E5' },
            barPercentage: 0.7,
          }}
          style={{ marginVertical: 8, borderRadius: 16 }}
          onDataPointClick={({value, index}) => {
            setHoveredVisualization({ title: chartData.labels[index], count: value });
          }}
        />
      </View>
    );
  };

  const WaterLevelTrendChart = React.memo(({ stations }: { stations: ProcessedStation[] }) => {
    const trendData = getTrendData(stations);

    return (
      <View style={styles.visualizationContainer}>
        <Text style={styles.visualizationTitle}>{texts[lang].waterLevelTrendOverTime}</Text>
        <RNLineChart
          data={trendData}
          width={width - 60}
          height={220}
          yAxisLabel=""
          yAxisSuffix="m"
          chartConfig={{
            backgroundColor: '#FFFFFF',
            backgroundGradientFrom: '#F8FAFC',
            backgroundGradientTo: '#F8FAFC',
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
            style: { borderRadius: 16 },
            propsForDots: { r: '4', strokeWidth: '2', stroke: '#FF0000' },
            fillShadowGradientOpacity: 0,
          }}
          bezier
          style={{ marginVertical: 8, borderRadius: 16 }}
          onDataPointClick={({value, index}) => {
            setHoveredVisualization({ title: texts[lang].waterLevelTrendOverTime, value: value.toFixed(2) + 'm', date: trendData.labels[index] });
          }}
        />
      </View>
    );
  });

  const StateWiseAverageChart = React.memo(({ stations }: { stations: ProcessedStation[] }) => {
    const stateData = getStateAverages(stations);

    return (
      <View style={styles.visualizationContainer}>
        <Text style={styles.visualizationTitle}>{texts[lang].stateWiseAverageWaterLevel}</Text>
        <RNLineChart
          data={stateData}
          width={width - 60}
          height={220}
          yAxisLabel=""
          yAxisSuffix="m"
          chartConfig={{
            backgroundColor: '#FFFFFF',
            backgroundGradientFrom: '#F8FAFC',
            backgroundGradientTo: '#F8FAFC',
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
            style: { borderRadius: 16 },
            propsForDots: { r: '4', strokeWidth: '2', stroke: '#FF0000' },
            fillShadowGradientOpacity: 0,
          }}
          bezier={false}
          style={{ marginVertical: 8, borderRadius: 16 }}
          onDataPointClick={({value, index}) => {
            setHoveredVisualization({ title: stateData.labels[index], value: value.toFixed(2) + 'm' });
          }}
        />
      </View>
    );
  });

  if (showStateSelection) {
    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <View style={styles.gradientContainer}>
          <View style={styles.stateSelectionContainer}>
            {/* --- UPDATED STATE SELECTION HEADER --- */}
            <View style={styles.stateSelectionHeader}>
              <TouchableOpacity
                onPress={() => setShowLanguageModal(true)}
                style={styles.languageButtonAbsolute}
              >
                <Languages color="#4F46E5" size={24} />
              </TouchableOpacity>

              <Animated.View style={{ transform: [{ scale: scaleAnim }], alignItems: 'center' }}>
                <Image
                    source={require('../assets/images/WhatsApp Image 2025-09-21 at 22.54.09_d3871fbb.png')} 
                    style={styles.stateSelectionLogo}
                />
                <Text style={styles.title}>{texts[lang].title}</Text>
                <Text style={styles.subtitle}>{texts[lang].subtitle}</Text>
                <Text style={styles.organizationText}>{texts[lang].organization}</Text>
              </Animated.View>
            </View>
            
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
                <Text style={styles.stateCardTitle}>{texts[lang].allStates}</Text>
                <Text style={styles.stateCardCount}>{processedStations.length} {texts[lang].stationsNationwide}</Text>
                <Text style={styles.stateCardSubtext}>{texts[lang].comprehensiveView}</Text>
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
                      <Text style={styles.stateCardCount}>{stateStations.length} {texts[lang].monitoringStations}</Text>
                      {criticalCount > 0 && (
                        <Text style={styles.criticalAlert}>{criticalCount} {texts[lang].criticalAlerts}</Text>
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
              <Text style={styles.getStartedText}>{texts[lang].beginMonitoring}</Text>
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
        <Text style={styles.loadingText}>{texts[lang].connecting}</Text>
        <Text style={styles.loadingSubtext}>{texts[lang].loadingData}</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.gradientContainer}>
        {/* --- UPDATED DASHBOARD HEADER --- */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image
              source={require('../assets/images/WhatsApp Image 2025-09-21 at 22.54.09_d3871fbb.png')} 
              style={styles.logo}
            />
          </View>

          <View style={styles.headerRight}>
            <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
              {selectedState === 'all' ? texts[lang].nationalDashboard : selectedState}
            </Text>
            <Text style={styles.headerSubtitle}>{texts[lang].groundwaterResourceMonitoring}</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity 
                onPress={() => setShowStateSelection(true)}
                style={styles.backButton}
              >
                <Text style={styles.backText}>← {texts[lang].states}</Text>
              </TouchableOpacity>
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
                  <Text style={styles.liveText}>{texts[lang].live}</Text>
                </View>
              </Animated.View>
               <TouchableOpacity
                onPress={() => setShowLanguageModal(true)}
                style={styles.languageButton}
              >
                <Languages color="#4F46E5" size={20} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {statistics && (
          <View style={styles.topMetricsContainer}>
            <View style={styles.topMetricsRow}>
              <Animated.View style={[styles.topMetricCard, { transform: [{ scale: scaleAnim }] }]}>
                <Database color="#4F46E5" size={20} />
                <Text style={styles.topMetricValue}>{statistics.activeStations}</Text>
                <Text style={styles.topMetricLabel}>{texts[lang].activeStations}</Text>
              </Animated.View>

              <View style={styles.topMetricCard}>
                <Droplets color="#3B82F6" size={20} />
                <Text style={styles.topMetricValue}>{statistics.avgWaterLevel}m</Text>
                <Text style={styles.topMetricLabel}>{texts[lang].avgWaterLevel}</Text>
              </View>

              <View style={styles.topMetricCard}>
                <Thermometer color="#F59E0B" size={20} />
                <Text style={styles.topMetricValue}>{statistics.avgTemperature}°C</Text>
                <Text style={styles.topMetricLabel}>{texts[lang].avgTemperature}</Text>
              </View>

              <View style={styles.topMetricCard}>
                <Battery color="#10B981" size={20} />
                <Text style={styles.topMetricValue}>{statistics.avgBattery}V</Text>
                <Text style={styles.topMetricLabel}>{texts[lang].avgBattery}</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Search color="#6B7280" size={20} />
            <TextInput
              style={styles.searchInput}
              placeholder={texts[lang].searchPlaceholder}
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

        <View style={styles.tabContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              { key: 'analytics', label: texts[lang].analytics, icon: BarChart3 },
              { key: 'overview', label: texts[lang].overview, icon: Activity },
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
          {statistics && activeView === 'analytics' && (
            <View style={styles.visualizationSection}>
              <WaterLevelVisualization 
                data={statistics.waterLevelDistribution}
                onHover={setHoveredVisualization}
              />
              <WaterLevelTrendChart stations={filteredStations} />
              {selectedState === 'all' && <StateWiseAverageChart stations={filteredStations} />}
              
              <View style={styles.trendChart}>
                <Text style={styles.visualizationTitle}>{texts[lang].stationTrends}</Text>
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
                            outputRange: [0, (statistics.trendDistribution.rising / statistics.totalStations) * 280],
                          }),
                          borderRadius: 6,
                        }
                      ]}
                    />
                    <Text style={styles.trendValue}>
                      {((statistics.trendDistribution.rising / statistics.totalStations) * 100).toFixed(1)}%
                    </Text>
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
                            outputRange: [0, (statistics.trendDistribution.falling / statistics.totalStations) * 280],
                          }),
                          borderRadius: 6,
                        }
                      ]}
                    />
                    <Text style={styles.trendValue}>
                      {((statistics.trendDistribution.falling / statistics.totalStations) * 100).toFixed(1)}%
                    </Text>
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
                            outputRange: [0, (statistics.trendDistribution.stable / statistics.totalStations) * 280],
                          }),
                          borderRadius: 6,
                        }
                      ]}
                    />
                    <Text style={styles.trendValue}>
                      {((statistics.trendDistribution.stable / statistics.totalStations) * 100).toFixed(1)}%
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {statistics && (statistics.lowBatteryCount > 0 || statistics.criticalStations > 0) && (
            <View style={styles.alertsContainer}>
              <Text style={styles.sectionTitle}>{texts[lang].systemAlerts}</Text>
              
              {statistics.criticalStations > 0 && (
                <TouchableOpacity 
                  style={[styles.alertCard, styles.criticalAlertCard]}
                  onPress={() => setSelectedFilter('critical')}
                >
                  <AlertTriangle color="#EF4444" size={20} />
                  <View style={styles.alertContent}>
                    <Text style={styles.alertTitle}>{texts[lang].criticalWaterLevels}</Text>
                    <Text style={styles.alertText}>
                      {statistics.criticalStations} {texts[lang].stationsBelowThreshold}
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
                    <Text style={styles.alertTitle}>{texts[lang].lowBatteryWarning}</Text>
                    <Text style={styles.alertText}>
                      {statistics.lowBatteryCount} {texts[lang].stationsRequireMaintenance}
                    </Text>
                  </View>
                  <ChevronRight color="#F59E0B" size={16} />
                </TouchableOpacity>
              )}
            </View>
          )}

          <View style={styles.stationList}>
            <View style={styles.stationListHeader}>
              <Text style={styles.sectionTitle}>
                {texts[lang].monitoringStationsLabel} ({filteredStations.length})
              </Text>
            </View>
            
            {filteredStations.slice(0, 20).map((station, index) => {
              const trend = getWaterLevelTrend(station.latestReading["Water Level (m)"], station.trend);
              
              return (
                <TouchableOpacity
                  key={`${station.telemetryUID}-${index}`}
                  style={styles.stationCard}
                  onPress={() => setSelectedStation(station)}
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
                            {texts[lang][station.criticalStatus]}
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
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <Modal
          animationType="slide"
          transparent={true}
          visible={showFilters}
          onRequestClose={() => setShowFilters(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.filterModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{texts[lang].advancedFilters}</Text>
                <TouchableOpacity onPress={() => setShowFilters(false)}>
                  <Text style={styles.closeButton}>×</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView>
                <Text style={styles.filterSectionTitle}>{texts[lang].quickFilters}</Text>
                <View style={styles.quickFilters}>
                  {[
                    { key: 'all', title: texts[lang].allStations, icon: Database, color: '#6B7280' },
                    { key: 'critical', title: texts[lang].criticalLevels, icon: AlertTriangle, color: '#EF4444' },
                    { key: 'low_battery', title: texts[lang].lowBattery, icon: Battery, color: '#F59E0B' },
                    { key: 'high_temp', title: texts[lang].highTemperature, icon: Thermometer, color: '#DC2626' },
                    { key: 'low_water', title: texts[lang].lowWaterLevel, icon: TrendingDown, color: '#7C2D12' },
                    { key: 'recharged', title: texts[lang].risingTrend, icon: TrendingUp, color: '#10B981' },
                    { key: 'excellent', title: texts[lang].excellentStatus, icon: Droplets, color: '#059669' },
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
                    placeholder={texts[lang].searchByStationUID}
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
                <Text style={styles.clearFiltersText}>{texts[lang].clearAllFilters}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal
          animationType="slide"
          transparent={true}
          visible={showLanguageModal}
          onRequestClose={() => setShowLanguageModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.filterModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{texts[lang].selectLanguage}</Text>
                <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                  <Text style={styles.closeButton}>×</Text>
                </TouchableOpacity>
              </View>
              <ScrollView>
                {['English', 'Hindi'].map(langOption => (
                  <TouchableOpacity
                    key={langOption}
                    style={styles.languageOption}
                    onPress={() => {
                      setSelectedLanguage(langOption);
                      setShowLanguageModal(false);
                    }}
                  >
                    <Text style={styles.languageText}>{langOption}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

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
                    {hoveredVisualization.title || hoveredVisualization.level || hoveredVisualization.state}
                  </Text>
                  <Text style={styles.hoveredValue}>
                    {hoveredVisualization.value || hoveredVisualization.count}
                  </Text>
                  {hoveredVisualization.date && (
                    <Text style={styles.hoveredDescription}>
                      Date: {hoveredVisualization.date}
                    </Text>
                  )}
                </>
              )}
            </View>
          </TouchableOpacity>
        </Modal>

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
                  <Text style={styles.modalTitle}>{texts[lang].stationDetails}</Text>
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
                        {selectedStation.latestReading["Battery (V)"] > 3.5 ? texts[lang].active : texts[lang].lowBatteryStatus}
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
                      <Text style={styles.detailMetricLabel}>{texts[lang].waterLevel}</Text>
                      <Text style={[
                        styles.detailMetricValue,
                        { color: getWaterLevelTrend(selectedStation.latestReading["Water Level (m)"], selectedStation.trend).color }
                      ]}>
                        {selectedStation.latestReading["Water Level (m)"].toFixed(2)}m
                      </Text>
                      <Text style={styles.detailMetricSubtext}>
                        {texts[lang][selectedStation.criticalStatus]}
                      </Text>
                    </View>

                    <View style={styles.detailMetricCard}>
                      <Thermometer color="#F59E0B" size={24} />
                      <Text style={styles.detailMetricLabel}>{texts[lang].temperature}</Text>
                      <Text style={styles.detailMetricValue}>
                        {selectedStation.latestReading["Water Temperature (°C)"].toFixed(1)}°C
                      </Text>
                      <Text style={styles.detailMetricSubtext}>
                        {selectedStation.latestReading["Water Temperature (°C)"] > 30 ? texts[lang].high : 
                          selectedStation.latestReading["Water Temperature (°C)"] > 25 ? texts[lang].normal : texts[lang].low}
                      </Text>
                    </View>

                    <View style={styles.detailMetricCard}>
                      <Battery color="#10B981" size={24} />
                      <Text style={styles.detailMetricLabel}>{texts[lang].batteryStatus}</Text>
                      <Text style={styles.detailMetricValue}>
                        {selectedStation.latestReading["Battery (V)"].toFixed(2)}V
                      </Text>
                      <Text style={styles.detailMetricSubtext}>
                        {selectedStation.latestReading["Battery (V)"] > 3.5 ? texts[lang].good : texts[lang].needsMaintenance}
                      </Text>
                    </View>

                    <View style={styles.detailMetricCard}>
                      <Zap color="#8B5CF6" size={24} />
                      <Text style={styles.detailMetricLabel}>{texts[lang].pressure}</Text>
                      <Text style={styles.detailMetricValue}>
                        {selectedStation.latestReading["Barometric Pressure (mH2O)"].toFixed(1)}
                      </Text>
                      <Text style={styles.detailMetricSubtext}>{texts[lang].mH2O}</Text>
                    </View>
                  </View>

                  <View style={styles.historicalPreview}>
                    <Text style={styles.detailSectionTitle}>{texts[lang].waterLevelTrend}</Text>
                    <RNLineChart
                      data={getStationHistoricalData(selectedStation)}
                      width={width - 80}
                      height={200}
                      yAxisLabel=""
                      yAxisSuffix="m"
                      chartConfig={{
                        backgroundColor: '#FFFFFF',
                        backgroundGradientFrom: '#F8FAFC',
                        backgroundGradientTo: '#F8FAFC',
                        decimalPlaces: 2,
                        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
                        style: { borderRadius: 16 },
                        propsForDots: { r: '6', strokeWidth: '2', stroke: '#3B82F6' },
                        fillShadowGradientOpacity: 0,
                      }}
                      bezier
                      style={{ marginVertical: 8, borderRadius: 16 }}
                    />
                  </View>

                  <View style={styles.historicalPreview}>
                    <Text style={styles.detailSectionTitle}>{texts[lang].recentReadings}</Text>
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
              </View>
            </View>
          )}
        </Modal>
      </View>
    </Animated.View>
  );
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
    backgroundColor: '#FFFFFF',
  },
  // --- NEW: Styles for the redesigned state selection header
  stateSelectionHeader: {
    paddingHorizontal: 24,
    paddingTop: 80, 
    paddingBottom: 40,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  languageButtonAbsolute: {
    position: 'absolute',
    top: 50,
    right: 24,
    padding: 8,
  },
  stateSelectionLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 20,
  },
  // --- END NEW STYLES
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  organizationText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 20,
  },
  stateList: {
    flex: 1,
    paddingHorizontal: 24,
  },
  stateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  stateCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  stateCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  stateCardCount: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  stateCardSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  criticalAlert: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
    marginTop: 4,
  },
  getStartedButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    margin: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  getStartedText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // --- UPDATED: Styles for the main dashboard header
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  languageButton: {
    padding: 8,
    borderRadius: 25,
    backgroundColor: '#F3F4F6',
  },
  headerRight: {
    flex: 1,
    marginLeft: 16,
  },
  backButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  backText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '500',
  },
  // --- END UPDATED STYLES
  topMetricsContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 16,
    padding: 12,
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
    fontSize: 16,
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
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#1F2937',
  },
  filterButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
    marginTop: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
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
    marginBottom: 20,
  },
  visualizationContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
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
    marginBottom: 12,
    textAlign: 'center',
  },
  trendChart: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  trendBars: {
    gap: 16,
  },
  trendBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  trendBarFill: {
    height: 12,
    // flex: 1, // width is now animated
  },
  trendValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    minWidth: 50,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    marginTop: 0,
  },
  alertsContainer: {
    marginBottom: 20,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
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
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  alertText: {
    fontSize: 12,
    color: '#6B7280',
  },
  stationList: {
    marginBottom: 40,
  },
  stationListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  stationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  stationInfo: {
    flex: 1,
  },
  stationId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  stationLocation: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  stationStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  criticalStatusBadge: {
    paddingHorizontal: 6,
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
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stationMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginTop: 8,
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
    padding: 20,
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
    padding: 20,
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
    padding: 16,
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 12,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
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
    gap: 8,
  },
  quickFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
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
    fontSize: 14,
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
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  clearFiltersButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  clearFiltersText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
  languageOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  languageText: {
    fontSize: 16,
    color: '#1F2937',
  },
  stationDetailHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  detailStationId: {
    fontSize: 20,
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
    padding: 12,
    marginBottom: 16,
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
    marginBottom: 16,
  },
  detailMetricCard: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
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
    fontSize: 18,
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
    marginBottom: 16,
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
});