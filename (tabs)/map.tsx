import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Search,
  Filter,
  Layers,
  MapPin,
  Navigation,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react-native';

interface Station {
  id: string;
  name: string;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  status: 'normal' | 'warning' | 'critical' | 'offline';
  waterLevel: number;
  battery: number;
  temperature: number;
  lastUpdate: string;
}

export default function MapScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    normal: true,
    warning: true,
    critical: true,
    offline: true,
  });
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [stations, setStations] = useState<Station[]>([]);

  useEffect(() => {
    // Mock data for stations
    const mockStations: Station[] = [
      {
        id: 'CGWKQL0165',
        name: 'Daabadiya Station',
        state: 'Madhya Pradesh',
        district: 'Agarmalwa',
        latitude: 23.775793,
        longitude: 76.005447,
        status: 'critical',
        waterLevel: -5.28,
        battery: 3.59,
        temperature: 26.36,
        lastUpdate: '2 min ago',
      },
      {
        id: 'CGWKQL0166',
        name: 'Rajgarh Station',
        state: 'Rajasthan',
        district: 'Rajgarh',
        latitude: 24.123456,
        longitude: 75.987654,
        status: 'warning',
        waterLevel: -3.45,
        battery: 4.12,
        temperature: 28.5,
        lastUpdate: '5 min ago',
      },
      {
        id: 'CGWKQL0167',
        name: 'Indore Station',
        state: 'Madhya Pradesh',
        district: 'Indore',
        latitude: 22.719568,
        longitude: 75.857727,
        status: 'normal',
        waterLevel: -2.15,
        battery: 4.8,
        temperature: 25.2,
        lastUpdate: '1 min ago',
      },
      {
        id: 'CGWKQL0168',
        name: 'Offline Station',
        state: 'Gujarat',
        district: 'Ahmedabad',
        latitude: 23.033863,
        longitude: 72.585022,
        status: 'offline',
        waterLevel: 0,
        battery: 0,
        temperature: 0,
        lastUpdate: '2 hours ago',
      },
    ];
    setStations(mockStations);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return '#10B981';
      case 'warning':
        return '#F59E0B';
      case 'critical':
        return '#EF4444';
      case 'offline':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal':
        return <CheckCircle size={16} color="#10B981" />;
      case 'warning':
        return <AlertTriangle size={16} color="#F59E0B" />;
      case 'critical':
        return <Zap size={16} color="#EF4444" />;
      case 'offline':
        return <XCircle size={16} color="#6B7280" />;
      default:
        return <XCircle size={16} color="#6B7280" />;
    }
  };

  const filteredStations = stations.filter(station => {
    const matchesSearch = station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         station.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         station.state.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilters[station.status];
    return matchesSearch && matchesFilter;
  });

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
          <Text style={styles.headerTitle}>Station Map</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setShowFilters(true)}
            >
              <Filter size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Layers size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Search size={20} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search stations..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );

  const renderMapPlaceholder = () => (
    <View style={styles.mapContainer}>
      <View style={styles.mapPlaceholder}>
        <MapPin size={48} color="#6B7280" />
        <Text style={styles.mapPlaceholderText}>Interactive Map</Text>
        <Text style={styles.mapPlaceholderSubtext}>
          Real-time station locations and status
        </Text>
      </View>
      
      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Station Status</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.legendText}>Normal</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.legendText}>Warning</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.legendText}>Critical</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#6B7280' }]} />
            <Text style={styles.legendText}>Offline</Text>
          </View>
        </View>
      </View>

      {/* Station Pins Overlay */}
      {filteredStations.map((station, index) => (
        <TouchableOpacity
          key={station.id}
          style={[
            styles.stationPin,
            {
              top: 150 + (index * 80),
              left: 50 + (index * 60),
            },
          ]}
          onPress={() => setSelectedStation(station)}
        >
          <View style={[styles.pin, { backgroundColor: getStatusColor(station.status) }]}>
            <MapPin size={16} color="white" />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderStationList = () => (
    <View style={styles.stationList}>
      <Text style={styles.listTitle}>
        Stations ({filteredStations.length})
      </Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        {filteredStations.map((station) => (
          <TouchableOpacity
            key={station.id}
            style={styles.stationCard}
            onPress={() => setSelectedStation(station)}
          >
            <View style={styles.stationHeader}>
              <View style={styles.stationInfo}>
                <Text style={styles.stationId}>{station.id}</Text>
                <Text style={styles.stationName}>{station.name}</Text>
                <Text style={styles.stationLocation}>
                  {station.district}, {station.state}
                </Text>
              </View>
              <View style={styles.stationStatus}>
                {getStatusIcon(station.status)}
                <Text style={[styles.statusText, { color: getStatusColor(station.status) }]}>
                  {station.status.toUpperCase()}
                </Text>
              </View>
            </View>
            
            {station.status !== 'offline' && (
              <View style={styles.stationMetrics}>
                <Text style={styles.metricText}>
                  Water Level: {station.waterLevel}m
                </Text>
                <Text style={styles.metricText}>
                  Battery: {station.battery}V
                </Text>
                <Text style={styles.metricText}>
                  Temp: {station.temperature}°C
                </Text>
              </View>
            )}
            
            <Text style={styles.lastUpdate}>
              Last Update: {station.lastUpdate}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderFilterModal = () => (
    <Modal
      visible={showFilters}
      transparent
      animationType="slide"
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.filterModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Stations</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Text style={styles.closeButton}>Done</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.filterOptions}>
            {Object.entries(selectedFilters).map(([status, isSelected]) => (
              <TouchableOpacity
                key={status}
                style={styles.filterOption}
                onPress={() => setSelectedFilters(prev => ({
                  ...prev,
                  [status]: !prev[status as keyof typeof prev],
                }))}
              >
                <View style={styles.filterOptionLeft}>
                  <View style={[styles.legendDot, { backgroundColor: getStatusColor(status) }]} />
                  <Text style={styles.filterOptionText}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </View>
                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderStationModal = () => (
    <Modal
      visible={!!selectedStation}
      transparent
      animationType="slide"
      onRequestClose={() => setSelectedStation(null)}
    >
      {selectedStation && (
        <View style={styles.modalOverlay}>
          <View style={styles.stationModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedStation.name}</Text>
              <TouchableOpacity onPress={() => setSelectedStation(null)}>
                <Text style={styles.closeButton}>Close</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.stationDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Station ID:</Text>
                <Text style={styles.detailValue}>{selectedStation.id}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Location:</Text>
                <Text style={styles.detailValue}>
                  {selectedStation.district}, {selectedStation.state}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status:</Text>
                <View style={styles.statusContainer}>
                  {getStatusIcon(selectedStation.status)}
                  <Text style={[styles.statusText, { color: getStatusColor(selectedStation.status) }]}>
                    {selectedStation.status.toUpperCase()}
                  </Text>
                </View>
              </View>
              
              {selectedStation.status !== 'offline' && (
                <>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Water Level:</Text>
                    <Text style={styles.detailValue}>{selectedStation.waterLevel}m</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Battery:</Text>
                    <Text style={styles.detailValue}>{selectedStation.battery}V</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Temperature:</Text>
                    <Text style={styles.detailValue}>{selectedStation.temperature}°C</Text>
                  </View>
                </>
              )}
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Last Update:</Text>
                <Text style={styles.detailValue}>{selectedStation.lastUpdate}</Text>
              </View>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Navigation size={20} color="white" />
                <Text style={styles.actionButtonText}>Navigate</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
                <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
                  View Details
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </Modal>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderMapPlaceholder()}
      {renderStationList()}
      {renderFilterModal()}
      {renderStationModal()}
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  mapContainer: {
    flex: 0.6,
    backgroundColor: '#E5E7EB',
    margin: 16,
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
  },
  mapPlaceholderSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  legend: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  legendItems: {
    gap: 6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: '#6B7280',
  },
  stationPin: {
    position: 'absolute',
  },
  pin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  stationList: {
    flex: 0.4,
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  stationCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
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
    fontWeight: '600',
    color: '#1F2937',
  },
  stationName: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  stationLocation: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 1,
  },
  stationStatus: {
    alignItems: 'flex-end',
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  stationMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  metricText: {
    fontSize: 10,
    color: '#6B7280',
  },
  lastUpdate: {
    fontSize: 10,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  filterModal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '50%',
  },
  stationModal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  closeButton: {
    fontSize: 16,
    color: '#1E3A8A',
    fontWeight: '500',
  },
  filterOptions: {
    gap: 16,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  checkmark: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stationDetails: {
    gap: 12,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#1E3A8A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#1E3A8A',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#1E3A8A',
  },
});