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
} from 'react-native';
// Corrected import from 'lucide-react-native'
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
  Zap
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

interface ResearchAnalytics {
  averageRechargeRate: number;
  seasonalVariation: number;
  depletionRate: number;
  criticalStations: number;
  dataQuality: number;
}

export default function GroundwaterDashboard() {
  const [data, setData] = useState<DWLRData[]>([]);
  const [filteredData, setFilteredData] = useState<DWLRData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState<string>('');
  const [showStateSelection, setShowStateSelection] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStation, setSelectedStation] = useState<DWLRData | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [activeView, setActiveView] = useState('overview');
  const [comparisonStations, setComparisonStations] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Fetch data from API
  const fetchData = async () => {
    try {
      const response = await fetch('https://mock-api-jsia.onrender.com/DWLR_DATA');
      const result = await response.json();
      
      // FIX 1: Use the full result from the API without removing entries
      setData(result);
      setFilteredData(result);
      
      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to fetch data. Please check your connection.');
      setLoading(false);
    }
  };

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
    let filtered = data;

    if (selectedState && selectedState !== 'all') {
      filtered = filtered.filter(item => item.State === selectedState);
    }

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.Telemetry_UID.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.State.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.District.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.Village.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedFilter !== 'all') {
      switch (selectedFilter) {
        case 'low_battery':
          filtered = filtered.filter(item => item["Battery (V)"] < 3.5);
          break;
        case 'high_temp':
          filtered = filtered.filter(item => item["Water Temperature (°C)"] > 30);
          break;
        case 'low_water':
          filtered = filtered.filter(item => item["Water Level (m)"] < -10);
          break;
        case 'critical':
          filtered = filtered.filter(item => 
            item["Battery (V)"] < 3.5 || item["Water Level (m)"] < -15
          );
          break;
        case 'recharged':
          filtered = filtered.filter(item => item["Water Level (m)"] > -5);
          break;
      }
    }

    setFilteredData(filtered);
  }, [data, selectedState, searchQuery, selectedFilter]);

  // Get unique states for selection
  const getUniqueStates = () => {
    return [...new Set(data.map(item => item.State))].sort();
  };

  // Enhanced statistics with research analytics
  const getStatistics = () => {
    if (filteredData.length === 0) return null;

    const waterLevels = filteredData.map(item => item["Water Level (m)"]);
    const temperatures = filteredData.map(item => item["Water Temperature (°C)"]);
    const batteryLevels = filteredData.map(item => item["Battery (V)"]);
    const pressures = filteredData.map(item => item["Barometric Pressure (mH2O)"]);

    const avgWaterLevel = waterLevels.reduce((sum, level) => sum + level, 0) / waterLevels.length;
    const avgTemperature = temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length;
    const avgBattery = batteryLevels.reduce((sum, battery) => sum + battery, 0) / batteryLevels.length;
    const avgPressure = pressures.reduce((sum, pressure) => sum + pressure, 0) / pressures.length;

    // Research-specific calculations
    const criticalStations = filteredData.filter(item => item["Water Level (m)"] < -15).length;
    const rechargedStations = filteredData.filter(item => item["Water Level (m)"] > -5).length;
    const lowBatteryCount = filteredData.filter(item => item["Battery (V)"] < 3.5).length;
    const highTempCount = filteredData.filter(item => item["Water Temperature (°C)"] > 30).length;

    // Water level distribution
    const excellent = filteredData.filter(item => item["Water Level (m)"] > 0).length;
    const good = filteredData.filter(item => item["Water Level (m)"] <= 0 && item["Water Level (m)"] > -5).length;
    const moderate = filteredData.filter(item => item["Water Level (m)"] <= -5 && item["Water Level (m)"] > -10).length;
    const poor = filteredData.filter(item => item["Water Level (m)"] <= -10 && item["Water Level (m)"] > -15).length;
    const critical = filteredData.filter(item => item["Water Level (m)"] <= -15).length;

    // State-wise distribution
    const stateDistribution = filteredData.reduce((acc, item) => {
      acc[item.State] = (acc[item.State] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalStations: filteredData.length,
      avgWaterLevel: avgWaterLevel.toFixed(2),
      avgTemperature: avgTemperature.toFixed(1),
      avgBattery: avgBattery.toFixed(2),
      avgPressure: avgPressure.toFixed(1),
      lowBatteryCount,
      highTempCount,
      criticalStations,
      rechargedStations,
      activeStations: filteredData.length,
      dataQuality: ((filteredData.length - lowBatteryCount) / filteredData.length * 100).toFixed(1),
      waterLevelDistribution: { excellent, good, moderate, poor, critical },
      stateDistribution,
      minWaterLevel: Math.min(...waterLevels).toFixed(2),
      maxWaterLevel: Math.max(...waterLevels).toFixed(2),
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
      dataQuality: 0
    };

    return {
      averageRechargeRate: ((statistics.rechargedStations / statistics.totalStations) * 100),
      seasonalVariation: 15.2, // Mock calculation
      depletionRate: ((statistics.criticalStations / statistics.totalStations) * 100),
      criticalStations: statistics.criticalStations,
      dataQuality: parseFloat(statistics.dataQuality)
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
  const getWaterLevelTrend = (level: number) => {
    if (level > -5) return { icon: ArrowUp, color: '#10B981', trend: 'Rising' };
    if (level < -15) return { icon: ArrowDown, color: '#EF4444', trend: 'Falling' };
    return { icon: Minus, color: '#F59E0B', trend: 'Stable' };
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
                <Text style={styles.stateCardCount}>{data.length} stations nationwide</Text>
                <Text style={styles.stateCardSubtext}>Comprehensive national view</Text>
              </TouchableOpacity>

              {getUniqueStates().map((state, index) => {
                const stateStations = data.filter(item => item.State === state);
                const criticalCount = stateStations.filter(item => item["Water Level (m)"] < -15).length;
                
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
                        <Text style={styles.criticalAlertText}>{criticalCount} critical alerts</Text>
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
            
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            </Animated.View>
          </View>
          
          <Text style={styles.headerTitle}>
            {selectedState === 'all' ? 'National Dashboard' : selectedState}
          </Text>
          <Text style={styles.headerSubtitle}>Groundwater Resource Monitoring</Text>
          <Text style={styles.lastUpdate}>
            Last updated: {lastUpdate.toLocaleTimeString()} • {statistics?.totalStations} stations active
          </Text>
        </View>

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
          {/* Key Metrics Dashboard */}
          {statistics && (
            <View style={styles.metricsContainer}>
              {/* Primary Metrics */}
              <View style={styles.primaryMetrics}>
                <Animated.View style={[styles.primaryCard, { transform: [{ scale: scaleAnim }] }]}>
                  <View style={styles.primaryCardContent}>
                    <View style={styles.metricHeader}>
                      <Database color="#FFFFFF" size={24} />
                      <Text style={styles.primaryMetricTitle}>Active Stations</Text>
                    </View>
                    <Text style={styles.primaryMetricValue}>{statistics.totalStations}</Text>
                    <Text style={styles.primaryMetricChange}>
                      Data Quality: {statistics.dataQuality}%
                    </Text>
                  </View>
                </Animated.View>

                <View style={styles.secondaryCards}>
                  <View style={styles.secondaryCard}>
                    <View style={styles.metricIcon}>
                      <Droplets color="#3B82F6" size={20} />
                    </View>
                    <Text style={styles.secondaryValue}>{statistics.avgWaterLevel}m</Text>
                    <Text style={styles.secondaryLabel}>Avg Water Level</Text>
                  </View>

                  <View style={styles.secondaryCard}>
                    <View style={styles.metricIcon}>
                      <Thermometer color="#F59E0B" size={20} />
                    </View>
                    <Text style={styles.secondaryValue}>{statistics.avgTemperature}°C</Text>
                    <Text style={styles.secondaryLabel}>Avg Temperature</Text>
                  </View>

                  <View style={styles.secondaryCard}>
                    <View style={styles.metricIcon}>
                      <Battery color="#10B981" size={20} />
                    </View>
                    <Text style={styles.secondaryValue}>{statistics.avgBattery}V</Text>
                    <Text style={styles.secondaryLabel}>Avg Battery</Text>
                  </View>

                  <View style={styles.secondaryCard}>
                    <View style={styles.metricIcon}>
                      <Zap color="#8B5CF6" size={20} />
                    </View>
                    <Text style={styles.secondaryValue}>{statistics.avgPressure}</Text>
                    <Text style={styles.secondaryLabel}>Avg Pressure</Text>
                  </View>
                </View>
              </View>

              {/* Research Analytics Cards */}
              {activeView === 'research' && (
                <View style={styles.researchMetrics}>
                  <Text style={styles.sectionTitle}>Research Analytics</Text>
                  
                  <View style={styles.researchGrid}>
                    <View style={styles.researchCard}>
                      <TrendingUp color="#10B981" size={24} />
                      <Text style={styles.researchValue}>{researchAnalytics.averageRechargeRate.toFixed(1)}%</Text>
                      <Text style={styles.researchLabel}>Recharge Rate</Text>
                    </View>

                    <View style={styles.researchCard}>
                      <TrendingDown color="#EF4444" size={24} />
                      <Text style={styles.researchValue}>{researchAnalytics.depletionRate.toFixed(1)}%</Text>
                      <Text style={styles.researchLabel}>Depletion Risk</Text>
                    </View>

                    <View style={styles.researchCard}>
                      <Calendar color="#8B5CF6" size={24} />
                      <Text style={styles.researchValue}>{researchAnalytics.seasonalVariation.toFixed(1)}%</Text>
                      <Text style={styles.researchLabel}>Seasonal Variation</Text>
                    </View>

                    <View style={styles.researchCard}>
                      <AlertTriangle color="#F59E0B" size={24} />
                      <Text style={styles.researchValue}>{researchAnalytics.criticalStations}</Text>
                      <Text style={styles.researchLabel}>Critical Zones</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Alert Summary */}
          {statistics && (statistics.lowBatteryCount > 0 || statistics.criticalStations > 0) && (
            <View style={styles.alertsContainer}>
              <Text style={styles.sectionTitle}>System Alerts</Text>
              
              {statistics.criticalStations > 0 && (
                <View style={[styles.alertCard, styles.criticalAlert]}>
                  <AlertTriangle color="#EF4444" size={20} />
                  <View style={styles.alertContent}>
                    <Text style={styles.alertTitle}>Critical Water Levels</Text>
                    <Text style={styles.alertText}>
                      {statistics.criticalStations} stations below -15m threshold
                    </Text>
                  </View>
                </View>
              )}

              {statistics.lowBatteryCount > 0 && (
                <View style={[styles.alertCard, styles.warningAlert]}>
                  <Battery color="#F59E0B" size={20} />
                  <View style={styles.alertContent}>
                    <Text style={styles.alertTitle}>Low Battery Warning</Text>
                    <Text style={styles.alertText}>
                      {statistics.lowBatteryCount} stations require maintenance
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Water Level Distribution Chart */}
          {activeView === 'analytics' && statistics && (
            <View style={styles.chartContainer}>
              <Text style={styles.sectionTitle}>Water Level Distribution</Text>
              <View style={styles.distributionChart}>
                {Object.entries(statistics.waterLevelDistribution).map(([category, count], index) => {
                  const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#7C2D12'];
                  const labels = ['Excellent (>0m)', 'Good (0 to -5m)', 'Moderate (-5 to -10m)', 'Poor (-10 to -15m)', 'Critical (<-15m)'];
                  const percentage = ((count / statistics.totalStations) * 100).toFixed(1);
                  
                  return (
                    <View key={category} style={styles.distributionBar}>
                      <View style={styles.distributionInfo}>
                        <View style={[styles.distributionColor, { backgroundColor: colors[index] }]} />
                        <Text style={styles.distributionLabel}>{labels[index]}</Text>
                      </View>
                      <Text style={styles.distributionValue}>{count} ({percentage}%)</Text>
                    </View>
                  );
                })}
              </View>
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
                    const station = filteredData.find(s => s.Telemetry_UID === stationId);
                    if (!station) return null;
                    
                    const trend = getWaterLevelTrend(station["Water Level (m)"]);
                    
                    return (
                      <View key={stationId} style={styles.comparisonCard}>
                        <TouchableOpacity 
                          style={styles.removeComparison}
                          onPress={() => toggleComparison(stationId)}
                        >
                          <Text style={styles.removeText}>×</Text>
                        </TouchableOpacity>
                        
                        <Text style={styles.comparisonStationId}>{station.Telemetry_UID}</Text>
                        <Text style={styles.comparisonLocation}>
                          {station.District}, {station.State}
                        </Text>
                        
                        <View style={styles.comparisonMetrics}>
                          <View style={styles.comparisonMetric}>
                            <Droplets color="#3B82F6" size={16} />
                            <Text style={styles.comparisonValue}>
                              {station["Water Level (m)"].toFixed(2)}m
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
                Monitoring Stations ({filteredData.length})
              </Text>
              {activeView === 'comparison' && (
                <Text style={styles.comparisonHelper}>
                  Tap stations to compare ({comparisonStations.length}/4)
                </Text>
              )}
            </View>
            
            {filteredData.slice(0, 20).map((station, index) => {
              const trend = getWaterLevelTrend(station["Water Level (m)"]);
              const isSelected = comparisonStations.includes(station.Telemetry_UID);
              
              return (
                <TouchableOpacity
                  // FIX 2: Create a unique key by combining UID and timestamp
                  key={`${station.Telemetry_UID}-${station["Date & Time"]}`}
                  style={[
                    styles.stationCard,
                    isSelected && styles.selectedStationCard,
                    showComparison && styles.selectableCard
                  ]}
                  onPress={() => {
                    if (showComparison) {
                      toggleComparison(station.Telemetry_UID);
                    } else {
                      setSelectedStation(station);
                    }
                  }}
                >
                  <View style={styles.stationHeader}>
                    <View style={styles.stationInfo}>
                      <Text style={styles.stationId}>{station.Telemetry_UID}</Text>
                      <Text style={styles.stationLocation}>
                        {station.Village}, {station.District}
                      </Text>
                    </View>
                    <View style={styles.stationStatus}>
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: station["Battery (V)"] > 3.5 ? '#10B981' : '#EF4444' }
                        ]}
                      />
                      <trend.icon color={trend.color} size={16} />
                    </View>
                  </View>
                  
                  <View style={styles.stationMetrics}>
                    <View style={styles.metric}>
                      <Droplets color="#3B82F6" size={14} />
                      <Text style={[styles.metricValue, { color: trend.color }]}>
                        {station["Water Level (m)"].toFixed(2)}m
                      </Text>
                    </View>
                    <View style={styles.metric}>
                      <Thermometer color="#F59E0B" size={14} />
                      <Text style={styles.metricValue}>
                        {station["Water Temperature (°C)"].toFixed(1)}°C
                      </Text>
                    </View>
                    <View style={styles.metric}>
                      <Battery 
                        color={station["Battery (V)"] > 3.5 ? '#10B981' : '#EF4444'} 
                        size={14} 
                      />
                      <Text style={styles.metricValue}>
                        {station["Battery (V)"].toFixed(2)}V
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
                    { key: 'recharged', title: 'Recently Recharged', icon: TrendingUp, color: '#10B981' },
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
                    <Text style={styles.detailStationId}>{selectedStation.Telemetry_UID}</Text>
                    <View style={styles.detailStatusBadge}>
                      <View style={[
                        styles.detailStatusDot,
                        { backgroundColor: selectedStation["Battery (V)"] > 3.5 ? '#10B981' : '#EF4444' }
                      ]} />
                      <Text style={styles.detailStatusText}>
                        {selectedStation["Battery (V)"] > 3.5 ? 'Active' : 'Low Battery'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailLocationCard}>
                    <MapPin color="#4F46E5" size={20} />
                    <View style={styles.locationInfo}>
                      <Text style={styles.detailLocation}>
                        {selectedStation.Village}, {selectedStation.Block}
                      </Text>
                      <Text style={styles.detailSubLocation}>
                        {selectedStation.District}, {selectedStation.State}
                      </Text>
                      <Text style={styles.detailCoordinates}>
                        {selectedStation.Latitude.toFixed(6)}, {selectedStation.Longitude.toFixed(6)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailMetricsGrid}>
                    <View style={styles.detailMetricCard}>
                      <Droplets color="#3B82F6" size={24} />
                      <Text style={styles.detailMetricLabel}>Water Level</Text>
                      <Text style={[
                        styles.detailMetricValue,
                        { color: getWaterLevelTrend(selectedStation["Water Level (m)"]).color }
                      ]}>
                        {selectedStation["Water Level (m)"].toFixed(2)}m
                      </Text>
                      <Text style={styles.detailMetricSubtext}>
                        {selectedStation["Water Level (m)"] < -15 ? 'Critical Level' : 
                         selectedStation["Water Level (m)"] < -10 ? 'Below Average' : 
                         selectedStation["Water Level (m)"] < -5 ? 'Moderate Level' : 'Good Level'}
                      </Text>
                    </View>

                    <View style={styles.detailMetricCard}>
                      <Thermometer color="#F59E0B" size={24} />
                      <Text style={styles.detailMetricLabel}>Temperature</Text>
                      <Text style={styles.detailMetricValue}>
                        {selectedStation["Water Temperature (°C)"].toFixed(1)}°C
                      </Text>
                      <Text style={styles.detailMetricSubtext}>
                        {selectedStation["Water Temperature (°C)"] > 30 ? 'High' : 
                         selectedStation["Water Temperature (°C)"] > 25 ? 'Normal' : 'Low'}
                      </Text>
                    </View>

                    <View style={styles.detailMetricCard}>
                      <Battery color="#10B981" size={24} />
                      <Text style={styles.detailMetricLabel}>Battery Status</Text>
                      <Text style={styles.detailMetricValue}>
                        {selectedStation["Battery (V)"].toFixed(2)}V
                      </Text>
                      <Text style={styles.detailMetricSubtext}>
                        {selectedStation["Battery (V)"] > 3.5 ? 'Good' : 'Needs Maintenance'}
                      </Text>
                    </View>

                    <View style={styles.detailMetricCard}>
                      <Zap color="#8B5CF6" size={24} />
                      <Text style={styles.detailMetricLabel}>Pressure</Text>
                      <Text style={styles.detailMetricValue}>
                        {selectedStation["Barometric Pressure (mH2O)"].toFixed(1)}
                      </Text>
                      <Text style={styles.detailMetricSubtext}>mH2O</Text>
                    </View>
                  </View>

                  <View style={styles.detailTimeInfo}>
                    <Calendar color="#6B7280" size={16} />
                    <Text style={styles.detailTimeText}>
                      Last reading: {new Date(selectedStation["Date & Time"]).toLocaleString()}
                    </Text>
                  </View>
                </ScrollView>

                <TouchableOpacity
                  style={styles.addToComparisonButton}
                  onPress={() => {
                    toggleComparison(selectedStation.Telemetry_UID);
                    setSelectedStation(null);
                  }}
                >
                  <Text style={styles.addToComparisonText}>
                    {comparisonStations.includes(selectedStation.Telemetry_UID) 
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
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
  criticalAlertText: {
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '600',
    marginTop: 4,
  },
  getStartedButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  getStartedText: {
    color: '#FFFFFF',
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
  metricsContainer: {
    marginBottom: 24,
  },
  primaryMetrics: {
    marginBottom: 20,
  },
  primaryCard: {
    backgroundColor: '#4F46E5',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryCardContent: {
    alignItems: 'center',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryMetricTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  primaryMetricValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  primaryMetricChange: {
    fontSize: 14,
    color: '#E0E7FF',
  },
  secondaryCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  secondaryCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  secondaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  secondaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  researchMetrics: {
    marginTop: 20,
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
  alertsContainer: {
    marginBottom: 24,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  criticalAlert: {
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
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  distributionChart: {
    marginTop: 16,
  },
  distributionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  distributionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  distributionColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  distributionLabel: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  distributionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
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
  detailTimeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  detailTimeText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 8,
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