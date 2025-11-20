import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { 
  Droplets, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Zap, 
  Activity, 
  Shield, 
  Target,
  Thermometer,
  Gauge,
  CheckCircle,
  Clock
} from 'lucide-react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// --- Configuration ---
const CHART_PADDING = 40;
const CHART_WIDTH = screenWidth - CHART_PADDING;
const CHART_HEIGHT = 220;
const DAYS_TO_DISPLAY = 60;

// Mock data for stations
const mockStations = [
  { id: 'CGWKOL0165', name: 'Agar-Malwa District', district: 'Agarmalwa', state: 'MP' },
  { id: 'CGWKOL0232', name: 'Bhopal Central Site', district: 'Bhopal', state: 'MP' },
  { id: 'CGWKOL0189', name: 'Indore Monitoring Well', district: 'Indore', state: 'MP' },
  { id: 'CGWKOL0145', name: 'Gwalior North Basin', district: 'Gwalior', state: 'MP' },
];

// Default data structure to prevent undefined errors
const getDefaultData = () => ({
  dates: [],
  waterLevels: [],
  rainfall: [],
  recharge: [],
  waterQuality: [],
  temperature: []
});

/**
 * Generates realistic mock data with minimal daily fluctuations for professional monitoring
 */
const generateMockData = () => {
  try {
    const dates = [];
    const waterLevels = [];
    const rainfall = [];
    const recharge = [];
    const waterQuality = [];
    const temperature = [];
    
    const baseLevel = -6.2; // Starting at -6.2m below ground level
    const minFluctuation = 0.01; // Minimal daily fluctuation (1cm)
    const maxFluctuation = 0.03; // Maximum daily fluctuation (3cm)
    const seasonalTrend = 0.001; // Very gradual seasonal change
    let currentLevel = baseLevel;
    let currentQuality = 7.2; // pH starting value
    let currentTemp = 22.5; // Temperature in Celsius

    for (let i = 0; i < DAYS_TO_DISPLAY; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (DAYS_TO_DISPLAY - 1 - i));
      dates.push(`${date.getDate()}/${(date.getMonth() + 1)}`);
      
      const dayFactor = i / DAYS_TO_DISPLAY;
      
      // Realistic rainfall pattern with seasonal variation
      let dailyRain = 0;
      if (dayFactor > 0.3 && dayFactor < 0.7) { // Monsoon season simulation
        dailyRain = Math.random() < 0.4 ? Math.random() * 25 + 5 : Math.random() * 2;
      } else {
        dailyRain = Math.random() < 0.15 ? Math.random() * 8 : Math.random() * 0.8;
      }
      rainfall.push(Math.round(dailyRain * 10) / 10);
      
      // Minimal recharge calculation with realistic efficiency
      let rechargeEffect = 0;
      if (dailyRain > 5) {
        rechargeEffect = dailyRain * 0.008; // 0.8% efficiency
      }
      
      // Very small daily fluctuation (1-3cm max)
      const randomNoise = (Math.random() - 0.5) * (maxFluctuation - minFluctuation) + minFluctuation;
      const seasonalEffect = Math.sin(dayFactor * Math.PI) * seasonalTrend;
      
      const netChange = rechargeEffect - 0.002 + randomNoise + seasonalEffect; // 2mm daily decline
      currentLevel += netChange;
      
      // Keep within realistic bounds
      currentLevel = Math.min(-4.5, Math.max(-8.5, currentLevel));
      waterLevels.push(Math.round(currentLevel * 1000) / 1000); // 1mm precision
      
      recharge.push(Math.max(0, Math.round(rechargeEffect * 1000) / 10));
      
      // Water quality (pH) with minimal variation
      currentQuality += (Math.random() - 0.5) * 0.1;
      currentQuality = Math.min(8.2, Math.max(6.8, currentQuality));
      waterQuality.push(Math.round(currentQuality * 100) / 100);
      
      // Temperature with seasonal variation
      const tempVariation = Math.sin(dayFactor * Math.PI * 2) * 3 + (Math.random() - 0.5) * 0.5;
      currentTemp = 22.5 + tempVariation;
      temperature.push(Math.round(currentTemp * 10) / 10);
    }

    return { dates, waterLevels, rainfall, recharge, waterQuality, temperature };
  } catch (error) {
    console.error('Error generating mock data:', error);
    return getDefaultData();
  }
};

const RechargePattern = () => {
  const [selectedStation, setSelectedStation] = useState(mockStations[0]);
  const [allData, setAllData] = useState(() => generateMockData());
  const [activeTab, setActiveTab] = useState('overview');
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  
  useEffect(() => {
    // Ensure data is properly initialized
    if (!allData || !allData.waterLevels || allData.waterLevels.length === 0) {
      setAllData(generateMockData());
    }
    
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 5, useNativeDriver: true }),
    ]).start();

    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData(window);
    });
    return () => subscription?.remove();
  }, []);

  const handleStationSelect = (station) => {
    setSelectedStation(station);
    setAllData(generateMockData());
  };
  
  // Default metrics for error states
  const getDefaultMetrics = () => ({
    currentWaterLevel: '-6.200',
    totalRecharge: '0.00',
    totalRainfall: '0.0',
    rechargeEfficiency: '0.00',
    avgQuality: '7.20',
    avgTemperature: '22.5',
    systemUptime: '99.2',
    complianceRate: '100.0',
    monitoringEfficiency: '98.7',
    sustainabilityIndex: '65.0',
    levelTrend: 0,
    waterLevelStatus: { text: 'Moderate', color: '#F59E0B' },
    qualityStatus: { text: 'Compliant', color: '#10B981' },
    systemStatus: { text: 'Operational', color: '#10B981' },
  });
  
  // --- Enhanced Professional Metrics with Error Handling ---
  const metrics = (() => {
    try {
      // Ensure data exists and has required arrays
      if (!allData || 
          !Array.isArray(allData.waterLevels) || 
          !Array.isArray(allData.rainfall) || 
          !Array.isArray(allData.recharge) || 
          !Array.isArray(allData.waterQuality) || 
          !Array.isArray(allData.temperature)) {
        return getDefaultMetrics();
      }

      const last30DaysWater = allData.waterLevels.slice(-30);
      const last30Rain = allData.rainfall.slice(-30);
      const last30Recharge = allData.recharge.slice(-30);
      const last30Quality = allData.waterQuality.slice(-30);
      const last30Temp = allData.temperature.slice(-30);

      // Ensure we have data in arrays
      if (last30DaysWater.length === 0 || 
          last30Rain.length === 0 || 
          last30Recharge.length === 0 ||
          last30Quality.length === 0 || 
          last30Temp.length === 0) {
        return getDefaultMetrics();
      }

      const totalRecharge = last30Recharge.reduce((sum, val) => sum + (val || 0), 0);
      const totalRainfall = last30Rain.reduce((sum, val) => sum + (val || 0), 0);
      const rechargeEfficiency = totalRainfall > 0 ? (totalRecharge / totalRainfall) * 100 : 0;
      
      const currentWaterLevel = last30DaysWater[last30DaysWater.length - 1] || -6.2;
      const avgQuality = last30Quality.reduce((a, b) => a + (b || 7.2), 0) / Math.max(last30Quality.length, 1);
      const avgTemperature = last30Temp.reduce((a, b) => a + (b || 22.5), 0) / Math.max(last30Temp.length, 1);
      
      // Trend calculations
      const recentData = last30DaysWater.slice(-15);
      const previousData = last30DaysWater.slice(0, 15);
      
      const recentAvg = recentData.length > 0 ? 
        recentData.reduce((a, b) => a + (b || 0), 0) / recentData.length : currentWaterLevel;
      const previousAvg = previousData.length > 0 ? 
        previousData.reduce((a, b) => a + (b || 0), 0) / previousData.length : currentWaterLevel;
      
      const levelTrend = previousAvg !== 0 ? ((recentAvg - previousAvg) / Math.abs(previousAvg)) * 100 : 0;

      // Professional KPIs
      const systemUptime = 99.2; // Mock uptime percentage
      const complianceRate = avgQuality >= 6.5 && avgQuality <= 8.5 ? 100 : 95.8;
      const monitoringEfficiency = 98.7; // (Successful readings / Total attempts) * 100
      const sustainabilityIndex = Math.min(100, rechargeEfficiency * 1.2 + 60);
      
      // Status determination
      let waterLevelStatus, qualityStatus, systemStatus;
      
      if (currentWaterLevel > -5.5) {
        waterLevelStatus = { text: 'Optimal', color: '#10B981' };
      } else if (currentWaterLevel > -7.0) {
        waterLevelStatus = { text: 'Moderate', color: '#F59E0B' };
      } else {
        waterLevelStatus = { text: 'Critical', color: '#EF4444' };
      }
      
      if (complianceRate >= 99) {
        qualityStatus = { text: 'Compliant', color: '#10B981' };
      } else if (complianceRate >= 95) {
        qualityStatus = { text: 'Warning', color: '#F59E0B' };
      } else {
        qualityStatus = { text: 'Non-Compliant', color: '#EF4444' };
      }
      
      if (systemUptime >= 99) {
        systemStatus = { text: 'Operational', color: '#10B981' };
      } else if (systemUptime >= 95) {
        systemStatus = { text: 'Degraded', color: '#F59E0B' };
      } else {
        systemStatus = { text: 'Critical', color: '#EF4444' };
      }

      return {
        // Basic metrics
        currentWaterLevel: currentWaterLevel.toFixed(3),
        totalRecharge: totalRecharge.toFixed(2),
        totalRainfall: totalRainfall.toFixed(1),
        rechargeEfficiency: rechargeEfficiency.toFixed(2),
        
        // Quality metrics
        avgQuality: avgQuality.toFixed(2),
        avgTemperature: avgTemperature.toFixed(1),
        
        // Professional KPIs
        systemUptime: systemUptime.toFixed(1),
        complianceRate: complianceRate.toFixed(1),
        monitoringEfficiency: monitoringEfficiency.toFixed(1),
        sustainabilityIndex: sustainabilityIndex.toFixed(1),
        
        // Trends
        levelTrend,
        
        // Status indicators
        waterLevelStatus,
        qualityStatus,
        systemStatus,
      };
    } catch (error) {
      console.error('Error calculating metrics:', error);
      return getDefaultMetrics();
    }
  })();

  const chartWidth = screenData.width - CHART_PADDING;

  // Enhanced Chart Configurations
  const BaseChartConfig = {
    decimalPlaces: 3,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: { borderRadius: 16 },
    propsForBackgroundLines: { stroke: 'rgba(255, 255, 255, 0.1)', strokeWidth: 1 },
    propsForLabels: { fontSize: 10, fill: '#FFFFFF' },
    paddingRight: 50,
    paddingLeft: 25,
  };

  const WaterLevelChartConfig = {
    ...BaseChartConfig,
    backgroundGradientFrom: '#1E40AF',
    backgroundGradientTo: '#3B82F6',
    propsForDots: { r: '3', strokeWidth: '1', stroke: '#DBEAFE' },
  };

  const QualityChartConfig = {
    ...BaseChartConfig,
    backgroundGradientFrom: '#7C3AED',
    backgroundGradientTo: '#A855F7',
    propsForDots: { r: '3', strokeWidth: '1', stroke: '#EDE9FE' },
  };

  const RainfallChartConfig = {
    ...BaseChartConfig,
    backgroundGradientFrom: '#059669',
    backgroundGradientTo: '#10B981',
    decimalPlaces: 1,
  };

  const getChartData = (dataArray, labels) => {
    try {
      if (!Array.isArray(dataArray) || !Array.isArray(labels) || dataArray.length === 0) {
        return {
          labels: ['No Data'],
          datasets: [{ data: [0] }]
        };
      }

      const labelStep = Math.ceil(labels.length / 8);
      const filteredData = dataArray.filter((_, index) => index % labelStep === 0);
      const filteredLabels = labels.filter((_, index) => index % labelStep === 0);
      
      // Ensure we have at least one data point
      if (filteredData.length === 0) {
        return {
          labels: ['No Data'],
          datasets: [{ data: [0] }]
        };
      }

      return {
        labels: filteredLabels,
        datasets: [{
          data: filteredData,
        }],
      };
    } catch (error) {
      console.error('Error creating chart data:', error);
      return {
        labels: ['No Data'],
        datasets: [{ data: [0] }]
      };
    }
  };

  // Professional Status Card Component
  const StatusCard = ({ title, value, status, Icon, trend = null }) => (
    <View style={[styles.statusCard, { borderLeftColor: status.color }]}>
      <View style={styles.statusHeader}>
        <Icon color={status.color} size={16} />
        <Text style={styles.statusTitle}>{title}</Text>
      </View>
      <Text style={[styles.statusValue, { color: status.color }]}>{value}</Text>
      <View style={styles.statusFooter}>
        <Text style={[styles.statusText, { color: status.color }]}>{status.text}</Text>
        {trend !== null && trend !== 0 && (
          <Text style={[styles.statusTrend, { color: trend >= 0 ? '#10B981' : '#EF4444' }]}>
            {trend >= 0 ? '↗' : '↘'} {Math.abs(trend).toFixed(2)}%
          </Text>
        )}
      </View>
    </View>
  );

  // Enhanced KPI Card Component
  const KPICard = ({ title, value, unit, target, Icon, color, size = 'normal' }) => (
    <Animated.View style={[
      size === 'large' ? styles.kpiCardLarge : styles.kpiCard,
      { borderTopColor: color },
      { transform: [{ scale: scaleAnim }] }
    ]}>
      <View style={styles.kpiHeader}>
        <Icon color={color} size={18} />
        <Text style={styles.kpiTitle}>{title}</Text>
      </View>
      <View style={styles.kpiContent}>
        <View style={styles.kpiValueContainer}>
          <Text style={styles.kpiValue}>{value}</Text>
          <Text style={styles.kpiUnit}>{unit}</Text>
        </View>
        {target && (
          <Text style={styles.kpiTarget}>Target: {target}</Text>
        )}
      </View>
    </Animated.View>
  );

  // Station Card Component
  const StationCard = ({ station, isSelected, onPress }) => (
    <Animated.View style={[
      styles.stationCard, 
      isSelected && styles.selectedStationCard,
      { transform: [{ scale: isSelected ? 1.02 : 1 }] }
    ]}>
      <TouchableOpacity onPress={onPress} style={styles.stationCardContent}>
        <View style={[styles.stationIcon, { backgroundColor: isSelected ? '#EEF2FF' : '#F9FAFB' }]}>
          <Text style={styles.stationIconText}>🏭</Text>
        </View>
        <View style={styles.stationInfo}>
          <Text style={styles.stationName} numberOfLines={2}>{station.name}</Text>
          <Text style={styles.stationDetails}>{station.district}, {station.state}</Text>
          <Text style={styles.stationId}>ID: {station.id}</Text>
        </View>
        {isSelected && (
          <View style={styles.selectedIndicator}>
            <CheckCircle color="#FFFFFF" size={16} />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  const TabButton = ({ title, isActive, onPress }) => (
    <TouchableOpacity 
      style={[styles.tabButton, isActive && styles.activeTabButton]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.tabButtonText, isActive && styles.activeTabButtonText]}>
        {title}
      </Text>
      {isActive && <View style={styles.tabIndicator} />}
    </TouchableOpacity>
  );

  // Early return if data is not ready
  if (!allData || !allData.waterLevels) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1E40AF" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading monitoring data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E40AF" />
      
      {/* Enhanced Professional Header */}
      <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>💧 Groundwater Management System</Text>
            <Text style={styles.headerSubtitle}>Central Ground Water Board | Real-Time Monitoring</Text>
          </View>
          <View style={styles.headerStats}>
            <View style={styles.headerStat}>
              <Text style={styles.headerStatValue}>{metrics.systemUptime}%</Text>
              <Text style={styles.headerStatLabel}>Uptime</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Station Selection */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Active Monitoring Station</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stationList}>
            {mockStations.map((station) => (
              <StationCard
                key={station.id}
                station={station}
                isSelected={selectedStation.id === station.id}
                onPress={() => handleStationSelect(station)}
              />
            ))}
          </ScrollView>
        </Animated.View>

        {/* Professional Status Overview */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>System Status Overview</Text>
          <View style={styles.statusContainer}>
            <StatusCard 
              title="Water Level Status"
              value={`${metrics.currentWaterLevel} m BGL`}
              status={metrics.waterLevelStatus}
              Icon={Droplets}
              trend={metrics.levelTrend}
            />
            <StatusCard 
              title="Quality Compliance"
              value={`${metrics.complianceRate}%`}
              status={metrics.qualityStatus}
              Icon={Shield}
            />
            <StatusCard 
              title="System Health"
              value={`${metrics.systemUptime}%`}
              status={metrics.systemStatus}
              Icon={Activity}
            />
          </View>
        </Animated.View>

        {/* Enhanced KPI Dashboard */}
        <Animated.View style={[styles.section, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.sectionTitle}>Key Performance Indicators</Text>
          <View style={styles.kpiGrid}>
            <KPICard 
              title="Monitoring Efficiency"
              value={metrics.monitoringEfficiency}
              unit="%"
              target="≥95%"
              Icon={Target}
              color="#1E40AF"
              size="large"
            />
            <KPICard 
              title="Sustainability Index"
              value={metrics.sustainabilityIndex}
              unit="/100"
              target="≥70"
              Icon={TrendingUp}
              color="#059669"
              size="large"
            />
            <KPICard 
              title="Recharge Efficiency"
              value={metrics.rechargeEfficiency}
              unit="%"
              target="≥1.0%"
              Icon={Droplets}
              color="#3B82F6"
            />
            <KPICard 
              title="Water Quality (pH)"
              value={metrics.avgQuality}
              unit="pH"
              target="6.5-8.5"
              Icon={Gauge}
              color="#7C3AED"
            />
            <KPICard 
              title="Temperature"
              value={metrics.avgTemperature}
              unit="°C"
              target="15-30°C"
              Icon={Thermometer}
              color="#DC2626"
            />
            <KPICard 
              title="30D Rainfall"
              value={metrics.totalRainfall}
              unit="mm"
              target="≥50mm"
              Icon={Zap}
              color="#F59E0B"
            />
          </View>
        </Animated.View>

        {/* Enhanced Tabs */}
        <Animated.View style={[styles.tabContainer, { opacity: fadeAnim }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.tabScrollContent}>
              {['overview', 'levels', 'quality', 'rainfall', 'analytics'].map(tab => (
                <TabButton 
                  key={tab}
                  title={tab.charAt(0).toUpperCase() + tab.slice(1)}
                  isActive={activeTab === tab}
                  onPress={() => setActiveTab(tab)}
                />
              ))}
            </View>
          </ScrollView>
        </Animated.View>

        {/* Enhanced Charts */}
        <Animated.View style={[styles.chartsContainer, { opacity: fadeAnim }]}>
          {(activeTab === 'overview' || activeTab === 'levels') && (
            <View style={styles.chartSection}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Water Level Monitoring (Last {DAYS_TO_DISPLAY} Days)</Text>
                <Text style={styles.chartSubtitle}>Depth below ground level (m BGL)</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                <LineChart
                  data={getChartData(allData.waterLevels, allData.dates)}
                  width={Math.max(chartWidth, 800)}
                  height={CHART_HEIGHT}
                  yAxisSuffix="m"
                  chartConfig={WaterLevelChartConfig}
                  bezier
                  style={styles.chart}
                  fromZero={false}
                  withShadow={false}
                />
              </ScrollView>
            </View>
          )}

          {(activeTab === 'overview' || activeTab === 'quality') && (
            <View style={styles.chartSection}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Water Quality Monitoring (pH Levels)</Text>
                <Text style={styles.chartSubtitle}>Compliance range: 6.5 - 8.5 pH</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                <LineChart
                  data={getChartData(allData.waterQuality, allData.dates)}
                  width={Math.max(chartWidth, 800)}
                  height={CHART_HEIGHT}
                  yAxisSuffix=" pH"
                  chartConfig={QualityChartConfig}
                  bezier
                  style={styles.chart}
                  fromZero={false}
                  withShadow={false}
                />
              </ScrollView>
            </View>
          )}

          {(activeTab === 'overview' || activeTab === 'rainfall') && (
            <View style={styles.chartSection}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Precipitation Analysis</Text>
                <Text style={styles.chartSubtitle}>Daily rainfall distribution (mm)</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                <BarChart
                  data={getChartData(allData.rainfall, allData.dates)}
                  width={Math.max(chartWidth, 800)}
                  height={CHART_HEIGHT}
                  yAxisSuffix="mm"
                  chartConfig={RainfallChartConfig}
                  style={styles.chart}
                  withInnerLines={true}
                  fromZero={true}
                />
              </ScrollView>
            </View>
          )}
        </Animated.View>

        {/* Professional Summary Card */}
        <Animated.View style={[styles.summaryCard, { opacity: fadeAnim }]}>
          <View style={styles.summaryHeader}>
            <View style={styles.summaryTitleContainer}>
              <Activity color="#1E40AF" size={20} />
              <Text style={styles.summaryTitle}>System Performance Summary</Text>
            </View>
            <Text style={styles.summaryPeriod}>Last 30 Days | {selectedStation.name}</Text>
          </View>
          <View style={styles.summaryContent}>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Data Availability:</Text>
                <Text style={styles.summaryValue}>99.8%</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Quality Compliance:</Text>
                <Text style={[styles.summaryValue, { color: metrics.qualityStatus.color }]}>
                  {metrics.complianceRate}%
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Alert Events:</Text>
                <Text style={styles.summaryValue}>2 Minor</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Next Calibration:</Text>
                <Text style={styles.summaryValue}>15 Days</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Enhanced Footer */}
        <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
          <View style={styles.footerContent}>
            <Clock color="#6B7280" size={16} />
            <Text style={styles.footerText}>Last Updated: Just Now</Text>
          </View>
          <Text style={styles.footerSubtext}>
            Central Ground Water Board | Ministry of Jal Shakti | Government of India
          </Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    backgroundColor: '#1E40AF',
    paddingVertical: 24,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#BFDBFE',
    fontWeight: '500',
  },
  headerStats: {
    alignItems: 'center',
  },
  headerStat: {
    alignItems: 'center',
  },
  headerStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerStatLabel: {
    fontSize: 11,
    color: '#BFDBFE',
    marginTop: 2,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  stationList: {
    flexDirection: 'row',
  },
  stationCard: {
    backgroundColor: '#FFFFFF',
    marginRight: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    width: 240,
  },
  selectedStationCard: {
    borderWidth: 2,
    borderColor: '#1E40AF',
    shadowOpacity: 0.15,
  },
  stationCardContent: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stationIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stationIconText: {
    fontSize: 20,
  },
  stationInfo: {
    flex: 1,
  },
  stationName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  stationDetails: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  stationId: {
    fontSize: 11,
    color: '#9CA3AF',
    fontFamily: 'monospace',
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1E40AF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statusCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  statusTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  statusFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTrend: {
    fontSize: 11,
    fontWeight: '500',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  kpiCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: (screenWidth - 56) / 2,
    borderTopWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  kpiCardLarge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: screenWidth - 40,
    borderTopWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 8,
  },
  kpiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  kpiTitle: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  kpiContent: {
    flex: 1,
  },
  kpiValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  kpiUnit: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
    color: '#6B7280',
  },
  kpiTarget: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  tabContainer: {
    marginTop: 24,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  tabScrollContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 4,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    position: 'relative',
    minWidth: 90,
  },
  activeTabButton: {
    backgroundColor: 'transparent',
  },
  tabButtonText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  activeTabButtonText: {
    color: '#1E40AF',
    fontWeight: '700',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 3,
    backgroundColor: '#1E40AF',
    borderRadius: 2,
  },
  chartsContainer: {
    paddingHorizontal: 20,
  },
  chartSection: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  chartHeader: {
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  chart: {
    borderRadius: 16,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#1E40AF',
  },
  summaryHeader: {
    marginBottom: 16,
  },
  summaryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  summaryPeriod: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  summaryContent: {},
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  summaryItem: {
    width: (screenWidth - 80) / 2,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '700',
  },
  footer: {
    marginHorizontal: 20,
    marginTop: 24,
    padding: 16,
    alignItems: 'center',
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  footerSubtext: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default RechargePattern;
