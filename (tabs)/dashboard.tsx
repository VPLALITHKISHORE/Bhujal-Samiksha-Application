import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Bell,
  MapPin,
  Battery,
  Thermometer,
  Droplets,
  Menu,
  Search,
  User,
  BarChart3,
} from 'lucide-react-native';

interface StationData {
  id: string;
  name: string;
  state: string;
  district: string;
  waterLevel: number;
  status: 'normal' | 'warning' | 'critical';
  battery: number;
  temperature: number;
  lastUpdate: string;
  latitude: number;
  longitude: number;
}

export default function DashboardScreen() {
  const [stationsData, setStationsData] = useState<StationData[]>([]);
  const insets = useSafeAreaInsets();
  const stats = {
    totalStations: 5260,
    activeStations: 4890,
    alertStations: 370,
    normalPercentage: 78,
    warningPercentage: 15,
    criticalPercentage: 7,
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const mockStations: StationData[] = [
        {
          id: 'CGWKQL0165',
          name: 'Daabadiya Station',
          state: 'Madhya Pradesh',
          district: 'Agarmalwa',
          waterLevel: -5.28,
          status: 'critical',
          battery: 3.59,
          temperature: 26.36,
          lastUpdate: '2 min ago',
          latitude: 23.775793,
          longitude: 76.005447,
        },
        {
          id: 'CGWKQL0166',
          name: 'Rajgarh Station',
          state: 'Rajasthan',
          district: 'Rajgarh',
          waterLevel: -3.45,
          status: 'warning',
          battery: 4.12,
          temperature: 28.5,
          lastUpdate: '5 min ago',
          latitude: 24.123456,
          longitude: 75.987654,
        },
        {
          id: 'CGWKQL0167',
          name: 'Indore Station',
          state: 'Madhya Pradesh',
          district: 'Indore',
          waterLevel: -2.15,
          status: 'normal',
          battery: 4.8,
          temperature: 25.2,
          lastUpdate: '1 min ago',
          latitude: 22.719568,
          longitude: 75.857727,
        },
      ];
      setStationsData(mockStations);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal':
        return '🟢';
      case 'warning':
        return '🟡';
      case 'critical':
        return '🔴';
      default:
        return '🔘';
    }
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['#1E3A8A', '#3B82F6']}
      style={[styles.header, { paddingTop: insets.top + 10 }]}
    >
      <View style={styles.headerContent}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.menuButton}>
            <Menu size={24} color="white" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>BHUJAL SAMIKSHA</Text>
            <Text style={styles.headerSubtitle}>Real-time Monitoring</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon}>
            <Bell size={24} color="white" />
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Search size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileButton}>
            <User size={20} color="#1E3A8A" />
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );

  const renderQuickOverview = () => (
    <View style={styles.overviewContainer}>
      <Text style={styles.sectionTitle}>📊 QUICK OVERVIEW</Text>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalStations.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Total Stations</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.activeStations.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.alertStations}</Text>
          <Text style={styles.statLabel}>Alerts</Text>
        </View>
      </View>
    </View>
  );

  const renderWaterLevelStatus = () => (
    <View style={styles.statusContainer}>
      <Text style={styles.sectionTitle}>🌊 WATER LEVEL STATUS</Text>
      <View style={styles.statusBars}>
        <View style={styles.statusBar}>
          <View style={[styles.statusFill, { width: `${stats.normalPercentage}%`, backgroundColor: '#10B981' }]} />
          <Text style={styles.statusText}>{stats.normalPercentage}% Normal</Text>
        </View>
        <View style={styles.statusBar}>
          <View style={[styles.statusFill, { width: `${stats.warningPercentage}%`, backgroundColor: '#F59E0B' }]} />
          <Text style={styles.statusText}>{stats.warningPercentage}% Warning</Text>
        </View>
        <View style={styles.statusBar}>
          <View style={[styles.statusFill, { width: `${stats.criticalPercentage}%`, backgroundColor: '#EF4444' }]} />
          <Text style={styles.statusText}>{stats.criticalPercentage}% Critical</Text>
        </View>
      </View>
    </View>
  );

  const renderNearestStations = () => (
    <View style={styles.stationsContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>📍 NEAREST STATIONS</Text>
        <TouchableOpacity onPress={() => router.push('/map')}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      {stationsData.map((station) => (
        <TouchableOpacity
          key={station.id}
          style={styles.stationCard}
          onPress={() => router.push(`/station/${station.id}`)}
        >
          <View style={styles.stationHeader}>
            <View style={styles.stationInfo}>
              <Text style={styles.stationId}>📍 {station.id}</Text>
              <Text style={styles.stationLocation}>{station.state}</Text>
            </View>
            <View style={styles.stationStatus}>
              <Text style={styles.statusEmoji}>{getStatusIcon(station.status)}</Text>
            </View>
          </View>
          <View style={styles.stationDetails}>
            <View style={styles.stationMetric}>
              <Droplets size={16} color="#3B82F6" />
              <Text style={styles.metricText}>Water Level: {station.waterLevel}m</Text>
            </View>
            <View style={styles.stationMetric}>
              <Battery size={16} color="#10B981" />
              <Text style={styles.metricText}>Battery: {station.battery}V</Text>
            </View>
            <View style={styles.stationMetric}>
              <Thermometer size={16} color="#F59E0B" />
              <Text style={styles.metricText}>Temp: {station.temperature}°C</Text>
            </View>
          </View>
          <Text style={styles.lastUpdate}>Last Update: {station.lastUpdate}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.actionsContainer}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => router.push('/map')}
      >
        <MapPin size={24} color="white" />
        <Text style={styles.actionText}>View Map</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => router.push('/analytics')}
      >
        <BarChart3 size={24} color="white" />
        <Text style={styles.actionText}>Analytics</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {renderQuickOverview()}
        {renderWaterLevelStatus()}
        {renderNearestStations()}
        {renderQuickActions()}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#E5E7EB',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  headerIcon: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold' as const,
  },
  profileButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  overviewContainer: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#1F2937',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#1E3A8A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  statusContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusBars: {
    gap: 12,
  },
  statusBar: {
    height: 24,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 12,
    position: 'relative',
  },
  statusFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: '#1F2937',
    zIndex: 1,
  },
  stationsContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    color: '#1E3A8A',
    fontSize: 14,
    fontWeight: '500' as const,
  },
  stationCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 4,
  },
  stationLocation: {
    fontSize: 14,
    color: '#6B7280',
  },
  stationStatus: {
    alignItems: 'center',
  },
  statusEmoji: {
    fontSize: 20,
  },
  stationDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  stationMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricText: {
    fontSize: 12,
    color: '#6B7280',
  },
  lastUpdate: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
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
  actionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  bottomPadding: {
    height: 20,
  },
});