import {
  Activity,
  AlertTriangle,
  Battery,
  CheckCircle,
  Download,
  Droplets,
  Eye,
  Filter,
  Gauge,
  RefreshCw,
  Thermometer,
  TrendingDown,
  TrendingUp
} from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Add logo import - set the path to your asset file here (e.g., place logo.png in the assets folder)
import Logo from '../assets/images/WhatsApp Image 2025-09-21 at 22.54.09_d3871fbb.png'; // Adjust the path as needed for your project structure

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface SensorData {
  Battery_V: number;
  Water_Temperature: number;
  Water_Level: number;
  Barometric_Pressure: number;
  Date_Time: string;
  Anomaly: 'Yes' | 'No';
}

interface ProcessedDataPoint {
  id: string;
  timestamp: string;
  batteryV: number;
  waterTemp: number;
  waterLevel: number;
  pressure: number;
  isAnomaly: boolean;
  anomalyMetrics: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface SensorStats {
  totalReadings: number;
  anomalies: number;
  batteryStatus: 'good' | 'warning' | 'critical';
  avgTemp: number;
  avgWaterLevel: number;
  avgPressure: number;
  tempTrend: number;
  pressureTrend: number;
  waterLevelTrend: number;
}

const COLORS = {
  primary: '#2563EB',
  secondary: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  critical: '#DC2626',
  success: '#059669',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#1F2937',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  gradient: ['#3B82F6', '#1D4ED8'],
};

const SEVERITY_COLORS = {
  low: '#10B981',
  medium: '#F59E0B',
  high: '#EF4444',
  critical: '#DC2626',
};

// Sensor thresholds for anomaly severity classification
const SENSOR_THRESHOLDS = {
  battery: { critical: 3.2, warning: 3.4, good: 3.6 },
  temperature: { min: 15, max: 35, extreme: 40 },
  waterLevel: { critical: -10, warning: -5, normal: 0 },
  pressure: { min: 900, max: 1100, extreme: 50 }
};

export default function EnhancedAnomalyDetection() {
  const [data, setData] = useState<ProcessedDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('24h');
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState<SensorStats | null>(null);
  const [selectedChart, setSelectedChart] = useState('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch('https://api-creation-1hfb.onrender.com/data');
      const rawData: SensorData[] = await response.json();
      
      // Process real API data
      const processedData: ProcessedDataPoint[] = rawData.map((item, index) => {
        const anomalyMetrics = [];
        let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';

        // Analyze each sensor for anomalies
        if (item.Battery_V < SENSOR_THRESHOLDS.battery.critical) {
          anomalyMetrics.push('Critical Battery');
          severity = 'critical';
        } else if (item.Battery_V < SENSOR_THRESHOLDS.battery.warning) {
          anomalyMetrics.push('Low Battery');
          if (severity === 'low') severity = 'medium';
        }

        if (item.Water_Temperature > SENSOR_THRESHOLDS.temperature.extreme || 
            item.Water_Temperature < SENSOR_THRESHOLDS.temperature.min) {
          anomalyMetrics.push('Extreme Temperature');
          severity = 'critical';
        } else if (item.Water_Temperature > SENSOR_THRESHOLDS.temperature.max) {
          anomalyMetrics.push('High Temperature');
          if (severity === 'low') severity = 'medium';
        }

        if (item.Water_Level < SENSOR_THRESHOLDS.waterLevel.critical) {
          anomalyMetrics.push('Critical Water Level');
          severity = 'critical';
        } else if (item.Water_Level < SENSOR_THRESHOLDS.waterLevel.warning) {
          anomalyMetrics.push('Low Water Level');
          if (severity === 'low') severity = 'high';
        }

        const pressureDeviation = Math.abs(item.Barometric_Pressure - 1013.25);
        if (pressureDeviation > SENSOR_THRESHOLDS.pressure.extreme) {
          anomalyMetrics.push('Extreme Pressure');
          severity = 'critical';
        }

        return {
          id: `sensor-${index}`,
          timestamp: item.Date_Time,
          batteryV: item.Battery_V,
          waterTemp: item.Water_Temperature,
          waterLevel: item.Water_Level,
          pressure: item.Barometric_Pressure,
          isAnomaly: item.Anomaly === 'Yes' || anomalyMetrics.length > 0,
          anomalyMetrics,
          severity,
        };
      });

      setData(processedData);
      calculateStats(processedData);
      setLastUpdated(new Date().toLocaleString());
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch sensor data. Please try again.');
      console.error('Data fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const calculateStats = (data: ProcessedDataPoint[]) => {
    if (data.length === 0) return;

    const anomalies = data.filter(d => d.isAnomaly);
    const latestBattery = data[data.length - 1]?.batteryV || 0;
    
    // Calculate trends (comparing last 5 vs previous 5 readings)
    const recent = data.slice(-5);
    const previous = data.slice(-10, -5);
    
    const calculateTrend = (metric: keyof ProcessedDataPoint, recent: ProcessedDataPoint[], previous: ProcessedDataPoint[]) => {
      if (recent.length === 0 || previous.length === 0) return 0;
      const recentAvg = recent.reduce((sum, d) => sum + (d[metric] as number), 0) / recent.length;
      const previousAvg = previous.reduce((sum, d) => sum + (d[metric] as number), 0) / previous.length;
      return ((recentAvg - previousAvg) / previousAvg) * 100;
    };

    const stats: SensorStats = {
      totalReadings: data.length,
      anomalies: anomalies.length,
      batteryStatus: latestBattery < SENSOR_THRESHOLDS.battery.critical ? 'critical' :
                    latestBattery < SENSOR_THRESHOLDS.battery.warning ? 'warning' : 'good',
      avgTemp: data.reduce((sum, d) => sum + d.waterTemp, 0) / data.length,
      avgWaterLevel: data.reduce((sum, d) => sum + d.waterLevel, 0) / data.length,
      avgPressure: data.reduce((sum, d) => sum + d.pressure, 0) / data.length,
      tempTrend: calculateTrend('waterTemp', recent, previous),
      pressureTrend: calculateTrend('pressure', recent, previous),
      waterLevelTrend: calculateTrend('waterLevel', recent, previous),
    };
    
    setStats(stats);
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const filteredData = data.filter(item => {
    if (selectedMetric !== 'all') {
      if (selectedMetric === 'battery' && !item.anomalyMetrics.some(m => m.includes('Battery'))) return false;
      if (selectedMetric === 'temperature' && !item.anomalyMetrics.some(m => m.includes('Temperature'))) return false;
      if (selectedMetric === 'water' && !item.anomalyMetrics.some(m => m.includes('Water'))) return false;
      if (selectedMetric === 'pressure' && !item.anomalyMetrics.some(m => m.includes('Pressure'))) return false;
    }
    return true;
  });

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.headerLeft}>
          <Image source={Logo} style={styles.logo} />
          <View>
            <Text style={styles.headerTitle}>Sensor Monitoring</Text>
            <Text style={styles.headerSubtitle}>Real-time anomaly detection</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={[styles.actionButton, autoRefresh && styles.actionButtonActive]}
            onPress={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw size={16} color={autoRefresh ? COLORS.primary : COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowFilters(true)}
          >
            <Filter size={16} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => Alert.alert('Download', 'Downloading data... (Implement export logic here)')}
          >
            <Download size={16} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
      {lastUpdated && (
        <Text style={styles.lastUpdated}>Last updated: {lastUpdated}</Text>
      )}
    </View>
  );

  const renderStatsCards = () => {
    if (!stats) return null;

    const cards = [
      {
        title: 'Total Anomalies',
        value: stats.anomalies,
        total: stats.totalReadings,
        icon: AlertTriangle,
        color: stats.anomalies > 5 ? COLORS.danger : COLORS.warning,
        subtitle: `of ${stats.totalReadings} readings`,
      },
      {
        title: 'Battery Status',
        value: `${data[data.length - 1]?.batteryV.toFixed(2)}V`,
        icon: Battery,
        color: stats.batteryStatus === 'critical' ? COLORS.critical :
               stats.batteryStatus === 'warning' ? COLORS.warning : COLORS.success,
        subtitle: stats.batteryStatus,
      },
      {
        title: 'Water Temp',
        value: `${stats.avgTemp.toFixed(1)}°C`,
        icon: Thermometer,
        color: COLORS.primary,
        trend: stats.tempTrend,
        subtitle: 'Average',
      },
      {
        title: 'Water Level',
        value: `${stats.avgWaterLevel.toFixed(1)}m`,
        icon: Droplets,
        color: stats.avgWaterLevel < -5 ? COLORS.danger : COLORS.secondary,
        trend: stats.waterLevelTrend,
        subtitle: 'Average',
      },
    ];

    return (
      <View style={styles.statsContainer}>
        {cards.map((card, index) => (
          <View key={index} style={styles.statCard}>
            <View style={styles.statCardHeader}>
              <card.icon size={20} color={card.color} />
              {card.trend !== undefined && (
                <View style={styles.trendContainer}>
                  {card.trend > 0 ? (
                    <TrendingUp size={14} color={card.trend > 5 ? COLORS.danger : COLORS.success} />
                  ) : (
                    <TrendingDown size={14} color={card.trend < -5 ? COLORS.danger : COLORS.success} />
                  )}
                  <Text style={[
                    styles.trendText,
                    { color: Math.abs(card.trend) > 5 ? COLORS.danger : COLORS.textSecondary }
                  ]}>
                    {Math.abs(card.trend).toFixed(1)}%
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.statValue}>{card.value}</Text>
            <Text style={styles.statTitle}>{card.title}</Text>
            <Text style={styles.statSubtitle}>{card.subtitle}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderChartSelector = () => (
    <View style={styles.chartSelector}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {[
          { id: 'overview', label: 'Overview', icon: Activity },
          { id: 'temperature', label: 'Temperature', icon: Thermometer },
          { id: 'battery', label: 'Battery', icon: Battery },
          { id: 'pressure', label: 'Pressure', icon: Gauge },
          { id: 'waterlevel', label: 'Water Level', icon: Droplets },
        ].map((chart) => (
          <TouchableOpacity
            key={chart.id}
            style={[
              styles.chartTab,
              selectedChart === chart.id && styles.chartTabActive
            ]}
            onPress={() => setSelectedChart(chart.id)}
          >
            <chart.icon 
              size={16} 
              color={selectedChart === chart.id ? COLORS.primary : COLORS.textSecondary} 
            />
            <Text style={[
              styles.chartTabText,
              selectedChart === chart.id && styles.chartTabTextActive
            ]}>
              {chart.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderSensorChart = (metric: keyof ProcessedDataPoint, label: string, color: string, unit: string) => {
    const chartHeight = 200;
    const chartWidth = screenWidth - 80;
    const recentData = data.slice(-20);
    
    if (recentData.length === 0) return null;

    const values = recentData.map(d => d[metric] as number);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal || 1;

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{label} Trend</Text>
        <View style={[styles.chart, { height: chartHeight }]}>
          <View style={styles.chartAxis}>
            <View style={styles.yAxis}>
              {[maxVal, (maxVal + minVal) / 2, minVal].map((val, idx) => (
                <Text key={idx} style={styles.axisLabel}>
                  {val.toFixed(1)}{unit}
                </Text>
              ))}
            </View>
            
            <View style={styles.chartArea}>
              {recentData.map((item, index) => {
                const value = item[metric] as number;
                const normalizedValue = (value - minVal) / range;
                const yPosition = (1 - normalizedValue) * (chartHeight - 40) + 10;
                
                return (
                  <View key={item.id}>
                    <View
                      style={[
                        styles.dataPoint,
                        {
                          left: (index / Math.max(recentData.length - 1, 1)) * (chartWidth - 60),
                          top: yPosition,
                          backgroundColor: item.isAnomaly ? COLORS.danger : color,
                        }
                      ]}
                    />
                    {index > 0 && (
                      <View
                        style={[
                          styles.connectingLine,
                          {
                            position: 'absolute',
                            left: ((index - 1) / Math.max(recentData.length - 1, 1)) * (chartWidth - 60) + 4,
                            top: ((1 - (recentData[index - 1][metric] as number - minVal) / range) * (chartHeight - 40) + 14),
                            width: Math.sqrt(
                              Math.pow((chartWidth - 60) / Math.max(recentData.length - 1, 1), 2) +
                              Math.pow(yPosition - ((1 - (recentData[index - 1][metric] as number - minVal) / range) * (chartHeight - 40) + 10), 2)
                            ),
                            height: 2,
                            backgroundColor: color + '60',
                            transform: [{
                              rotate: `${Math.atan2(
                                yPosition - ((1 - (recentData[index - 1][metric] as number - minVal) / range) * (chartHeight - 40) + 10),
                                (chartWidth - 60) / Math.max(recentData.length - 1, 1)
                              )}rad`
                            }],
                            transformOrigin: '0 0',
                          }
                        ]}
                      />
                    )}
                  </View>
                );
              })}
            </View>
          </View>
          <View style={styles.xAxis}>
            {recentData.map((item, index) => {
              if (index % 5 !== 0 && index !== recentData.length - 1) return null;
              return (
                <Text
                  key={index}
                  style={[
                    styles.axisLabel,
                    {
                      position: 'absolute',
                      left: (index / Math.max(recentData.length - 1, 1)) * (chartWidth - 60) - 20,
                      bottom: -30,
                      width: 80,
                      textAlign: 'center',
                    }
                  ]}
                >
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  const renderOverviewChart = () => {
    const anomaliesOverTime = data.slice(-20);
    const chartHeight = 200;
    
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Anomaly Overview</Text>
        <View style={styles.overviewChart}>
          {anomaliesOverTime.map((item, index) => (
            <View key={item.id} style={styles.overviewBar}>
              <View style={styles.overviewBarContainer}>
                <View
                  style={[
                    styles.overviewBarSegment,
                    {
                      height: `${Math.min((item.batteryV / 4) * 100, 100)}%`,
                      backgroundColor: item.batteryV < 3.4 ? COLORS.danger : COLORS.success + '60',
                    }
                  ]}
                />
                <View
                  style={[
                    styles.overviewBarSegment,
                    {
                      height: `${Math.min((item.waterTemp / 40) * 100, 100)}%`,
                      backgroundColor: item.waterTemp > 30 ? COLORS.danger : COLORS.primary + '60',
                    }
                  ]}
                />
                <View
                  style={[
                    styles.overviewBarSegment,
                    {
                      height: `${Math.min(Math.abs(item.waterLevel) / 10 * 100, 100)}%`,
                      backgroundColor: item.waterLevel < -5 ? COLORS.danger : COLORS.secondary + '60',
                    }
                  ]}
                />
              </View>
              {item.isAnomaly && (
                <View style={[styles.anomalyIndicator, { backgroundColor: SEVERITY_COLORS[item.severity] }]} />
              )}
            </View>
          ))}
        </View>
        
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: COLORS.success + '60' }]} />
            <Text style={styles.legendText}>Battery</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: COLORS.primary + '60' }]} />
            <Text style={styles.legendText}>Temperature</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: COLORS.secondary + '60' }]} />
            <Text style={styles.legendText}>Water Level</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderAnomalyList = () => {
    const recentAnomalies = filteredData
      .filter(d => d.isAnomaly)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    return (
      <View style={styles.anomalyListContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Recent Anomalies ({recentAnomalies.length})</Text>
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={() => Alert.alert('View All', 'Showing all anomalies... (Implement full list modal here)')}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <Eye size={14} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        
        {recentAnomalies.map((anomaly) => (
          <TouchableOpacity 
            key={anomaly.id} 
            style={styles.anomalyItem}
            onPress={() => Alert.alert(
              'Anomaly Details',
              `Timestamp: ${new Date(anomaly.timestamp).toLocaleString()}\nMetrics: ${anomaly.anomalyMetrics.join(', ')}\nBattery: ${anomaly.batteryV.toFixed(2)}V\nTemp: ${anomaly.waterTemp.toFixed(1)}°C\nLevel: ${anomaly.waterLevel.toFixed(1)}m\nPressure: ${anomaly.pressure.toFixed(1)} hPa\nSeverity: ${anomaly.severity.toUpperCase()}`
            )}
          >
            <View style={styles.anomalyItemLeft}>
              <View style={[
                styles.severityIndicator,
                { backgroundColor: SEVERITY_COLORS[anomaly.severity] }
              ]} />
              <View style={styles.anomalyInfo}>
                <Text style={styles.anomalyTime}>
                  {new Date(anomaly.timestamp).toLocaleDateString()} {new Date(anomaly.timestamp).toLocaleTimeString()}
                </Text>
                <Text style={styles.anomalyMetrics}>
                  {anomaly.anomalyMetrics.join(', ')}
                </Text>
                <View style={styles.sensorValues}>
                  <Text style={styles.sensorValue}>🔋 {anomaly.batteryV.toFixed(2)}V</Text>
                  <Text style={styles.sensorValue}>🌡️ {anomaly.waterTemp.toFixed(1)}°C</Text>
                  <Text style={styles.sensorValue}>💧 {anomaly.waterLevel.toFixed(1)}m</Text>
                </View>
              </View>
            </View>
            <View style={styles.anomalyItemRight}>
              <Text style={[
                styles.severityBadge,
                { 
                  backgroundColor: SEVERITY_COLORS[anomaly.severity] + '20',
                  color: SEVERITY_COLORS[anomaly.severity]
                }
              ]}>
                {anomaly.severity.toUpperCase()}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
        
        {recentAnomalies.length === 0 && (
          <View style={styles.noAnomalies}>
            <CheckCircle size={48} color={COLORS.success} />
            <Text style={styles.noAnomaliesText}>No Recent Anomalies</Text>
            <Text style={styles.noAnomaliesSubtext}>All sensors are operating normally</Text>
          </View>
        )}
      </View>
    );
  };

  const renderFilterModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filters</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Text style={styles.modalClose}>Done</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Time Period</Text>
            <View style={styles.filterOptions}>
              {['1h', '6h', '24h', '7d', '30d'].map(period => (
                <TouchableOpacity
                  key={period}
                  style={[
                    styles.filterOption,
                    selectedPeriod === period && styles.filterOptionActive
                  ]}
                  onPress={() => setSelectedPeriod(period)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    selectedPeriod === period && styles.filterOptionTextActive
                  ]}>
                    {period}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Sensor Type</Text>
            <View style={styles.filterOptions}>
              {['all', 'battery', 'temperature', 'water', 'pressure'].map(metric => (
                <TouchableOpacity
                  key={metric}
                  style={[
                    styles.filterOption,
                    selectedMetric === metric && styles.filterOptionActive
                  ]}
                  onPress={() => setSelectedMetric(metric)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    selectedMetric === metric && styles.filterOptionTextActive
                  ]}>
                    {metric.charAt(0).toUpperCase() + metric.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading sensor data...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {renderHeader()}
      {renderStatsCards()}
      {renderChartSelector()}
      
      {selectedChart === 'overview' && renderOverviewChart()}
      {selectedChart === 'temperature' && renderSensorChart('waterTemp', 'Water Temperature', COLORS.primary, '°C')}
      {selectedChart === 'battery' && renderSensorChart('batteryV', 'Battery Voltage', COLORS.success, 'V')}
      {selectedChart === 'pressure' && renderSensorChart('pressure', 'Barometric Pressure', COLORS.warning, ' hPa')}
      {selectedChart === 'waterlevel' && renderSensorChart('waterLevel', 'Water Level', COLORS.secondary, 'm')}
      
      {renderAnomalyList()}
      {renderFilterModal()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  header: {
    backgroundColor: COLORS.surface,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 12,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  lastUpdated: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionButtonActive: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: (screenWidth - 52) / 2,
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  statSubtitle: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  chartSelector: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  chartTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  chartTabActive: {
    backgroundColor: COLORS.primary + '15',
    borderColor: COLORS.primary,
  },
  chartTabText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  chartTabTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  chartContainer: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  chart: {
    position: 'relative',
  },
  chartAxis: {
    flexDirection: 'row',
    height: '100%',
  },
  yAxis: {
    width: 50,
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  axisLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textAlign: 'right',
  },
  chartArea: {
    flex: 1,
    position: 'relative',
    marginLeft: 10,
  },
  xAxis: {
    position: 'absolute',
    bottom: 0,
    left: 60,
    width: '100%',
    height: 20,
  },
  dataPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  connectingLine: {
    position: 'absolute',
  },
  overviewChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  overviewBar: {
    alignItems: 'center',
    flex: 1,
    maxWidth: 15,
    position: 'relative',
  },
  overviewBarContainer: {
    width: 12,
    height: 120,
    backgroundColor: COLORS.border,
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    flexDirection: 'column',
  },
  overviewBarSegment: {
    width: '100%',
    borderRadius: 2,
    marginBottom: 1,
  },
  anomalyIndicator: {
    position: 'absolute',
    top: -8,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  anomalyListContainer: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  anomalyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + '50',
  },
  anomalyItemLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  severityIndicator: {
    width: 4,
    height: 60,
    borderRadius: 2,
    marginRight: 12,
  },
  anomalyInfo: {
    flex: 1,
  },
  anomalyTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  anomalyMetrics: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  sensorValues: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sensorValue: {
    fontSize: 11,
    color: COLORS.textSecondary,
    backgroundColor: COLORS.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  anomalyItemRight: {
    alignItems: 'flex-end',
  },
  severityBadge: {
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  noAnomalies: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noAnomaliesText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 12,
  },
  noAnomaliesSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  modalClose: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterOptionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  filterOptionTextActive: {
    color: COLORS.surface,
    fontWeight: '600',
  },
});