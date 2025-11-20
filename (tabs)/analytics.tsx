import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Calendar,
  Filter,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  PieChart,
  Download,
  Share,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [selectedState, setSelectedState] = useState('All');

  const timeRanges = [
    { key: '24h', label: '24 Hours' },
    { key: '7d', label: '7 Days' },
    { key: '30d', label: '30 Days' },
    { key: '90d', label: '90 Days' },
  ];

  const states = ['All', 'Madhya Pradesh', 'Rajasthan', 'Gujarat', 'Maharashtra'];

  const renderHeader = () => (
    <LinearGradient
      colors={['#1E3A8A', '#3B82F6']}
      style={styles.header}
    >
      <SafeAreaView edges={['top']}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton}>
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Analytics</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <Calendar size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Filter size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Time Range:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterOptions}>
            {timeRanges.map((range) => (
              <TouchableOpacity
                key={range.key}
                style={[
                  styles.filterChip,
                  selectedTimeRange === range.key && styles.activeFilterChip,
                ]}
                onPress={() => setSelectedTimeRange(range.key)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedTimeRange === range.key && styles.activeFilterChipText,
                  ]}
                >
                  {range.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>State:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterOptions}>
            {states.map((state) => (
              <TouchableOpacity
                key={state}
                style={[
                  styles.filterChip,
                  selectedState === state && styles.activeFilterChip,
                ]}
                onPress={() => setSelectedState(state)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedState === state && styles.activeFilterChipText,
                  ]}
                >
                  {state}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );

  const renderOverviewCards = () => (
    <View style={styles.overviewContainer}>
      <Text style={styles.sectionTitle}>📊 REGIONAL OVERVIEW</Text>
      <View style={styles.overviewCards}>
        <View style={styles.overviewCard}>
          <View style={styles.cardHeader}>
            <TrendingUp size={20} color="#10B981" />
            <Text style={styles.cardTitle}>Avg Level</Text>
          </View>
          <Text style={styles.cardValue}>-3.2m</Text>
          <Text style={styles.cardChange}>+0.5m from last week</Text>
        </View>

        <View style={styles.overviewCard}>
          <View style={styles.cardHeader}>
            <Activity size={20} color="#3B82F6" />
            <Text style={styles.cardTitle}>Peak Level</Text>
          </View>
          <Text style={styles.cardValue}>-1.8m</Text>
          <Text style={styles.cardChange}>Station: CGWKQL0167</Text>
        </View>

        <View style={styles.overviewCard}>
          <View style={styles.cardHeader}>
            <TrendingDown size={20} color="#EF4444" />
            <Text style={styles.cardTitle}>Low Level</Text>
          </View>
          <Text style={styles.cardValue}>-6.5m</Text>
          <Text style={styles.cardChange}>Station: CGWKQL0165</Text>
        </View>
      </View>
    </View>
  );

  const renderTrendChart = () => (
    <View style={styles.chartContainer}>
      <View style={styles.chartHeader}>
        <Text style={styles.sectionTitle}>🌊 WATER LEVEL TRENDS</Text>
        <TouchableOpacity style={styles.chartAction}>
          <BarChart3 size={16} color="#1E3A8A" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.chartPlaceholder}>
        <View style={styles.chartArea}>
          {/* Mock chart lines */}
          <View style={styles.chartLine}>
            <View style={[styles.dataPoint, { left: '10%', bottom: '60%' }]} />
            <View style={[styles.dataPoint, { left: '25%', bottom: '45%' }]} />
            <View style={[styles.dataPoint, { left: '40%', bottom: '70%' }]} />
            <View style={[styles.dataPoint, { left: '55%', bottom: '55%' }]} />
            <View style={[styles.dataPoint, { left: '70%', bottom: '40%' }]} />
            <View style={[styles.dataPoint, { left: '85%', bottom: '65%' }]} />
          </View>
        </View>
        
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
            <Text style={styles.legendText}>Average Level</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.legendText}>Normal Range</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.legendText}>Critical Level</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderForecastChart = () => (
    <View style={styles.chartContainer}>
      <View style={styles.chartHeader}>
        <Text style={styles.sectionTitle}>🔮 FORECASTING</Text>
        <TouchableOpacity style={styles.chartAction}>
          <PieChart size={16} color="#1E3A8A" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.forecastContainer}>
        <Text style={styles.forecastTitle}>Next 7 Days Prediction</Text>
        <View style={styles.forecastChart}>
          <View style={styles.forecastBars}>
            {[65, 70, 45, 80, 55, 60, 75].map((height, index) => (
              <View key={index} style={styles.forecastBarContainer}>
                <View
                  style={[
                    styles.forecastBar,
                    { height: `${height}%`, backgroundColor: height > 60 ? '#10B981' : '#F59E0B' },
                  ]}
                />
                <Text style={styles.forecastDay}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                </Text>
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.weatherIntegration}>
          <Text style={styles.weatherTitle}>Weather Integration</Text>
          <View style={styles.weatherItems}>
            <View style={styles.weatherItem}>
              <Text style={styles.weatherEmoji}>🌧️</Text>
              <Text style={styles.weatherText}>Rain Expected: Thu-Fri</Text>
            </View>
            <View style={styles.weatherItem}>
              <Text style={styles.weatherEmoji}>📈</Text>
              <Text style={styles.weatherText}>Level Rise: +0.3m predicted</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const renderKeyMetrics = () => (
    <View style={styles.metricsContainer}>
      <Text style={styles.sectionTitle}>📈 KEY METRICS</Text>
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>-3.2m</Text>
          <Text style={styles.metricLabel}>Avg Level</Text>
          <Text style={styles.metricTrend}>↗️ +5%</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>-1.8m</Text>
          <Text style={styles.metricLabel}>Peak Level</Text>
          <Text style={styles.metricTrend}>↗️ +12%</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>-6.5m</Text>
          <Text style={styles.metricLabel}>Low Level</Text>
          <Text style={styles.metricTrend}>↘️ -8%</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>78%</Text>
          <Text style={styles.metricLabel}>Normal Status</Text>
          <Text style={styles.metricTrend}>↗️ +3%</Text>
        </View>
      </View>
    </View>
  );

  const renderActions = () => (
    <View style={styles.actionsContainer}>
      <TouchableOpacity style={styles.actionButton}>
        <Download size={20} color="white" />
        <Text style={styles.actionButtonText}>Custom Report</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.actionButton, styles.secondaryAction]}>
        <Share size={20} color="#1E3A8A" />
        <Text style={[styles.actionButtonText, styles.secondaryActionText]}>
          Export Data
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderFilters()}
        {renderOverviewCards()}
        {renderTrendChart()}
        {renderForecastChart()}
        {renderKeyMetrics()}
        {renderActions()}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  headerButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  filtersContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeFilterChip: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  filterChipText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeFilterChipText: {
    color: 'white',
  },
  overviewContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  overviewCards: {
    flexDirection: 'row',
    gap: 12,
  },
  overviewCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  cardChange: {
    fontSize: 10,
    color: '#6B7280',
  },
  chartContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartAction: {
    padding: 4,
  },
  chartPlaceholder: {
    height: 200,
  },
  chartArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    position: 'relative',
    marginBottom: 12,
  },
  chartLine: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  dataPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
  },
  forecastContainer: {
    gap: 16,
  },
  forecastTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  forecastChart: {
    height: 120,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  forecastBars: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 4,
  },
  forecastBarContainer: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
  },
  forecastBar: {
    width: '80%',
    borderRadius: 2,
    marginBottom: 8,
  },
  forecastDay: {
    fontSize: 10,
    color: '#6B7280',
  },
  weatherIntegration: {
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 8,
  },
  weatherTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 8,
  },
  weatherItems: {
    gap: 6,
  },
  weatherItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  weatherEmoji: {
    fontSize: 16,
  },
  weatherText: {
    fontSize: 12,
    color: '#374151',
  },
  metricsContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: (width - 64) / 2,
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  metricTrend: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#1E3A8A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  secondaryAction: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#1E3A8A',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryActionText: {
    color: '#1E3A8A',
  },
  bottomPadding: {
    height: 20,
  },
});