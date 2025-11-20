import { StationData, ProcessedStation, StationStats } from '@/types/station';

export class DataProcessor {
  static processStationData(rawData: StationData[]): ProcessedStation[] {
    return rawData.map((station) => ({
      id: station.Telemetry_UID,
      name: `${station.Village} Station`,
      state: station.State,
      district: station.District,
      village: station.Village,
      latitude: station.Latitude,
      longitude: station.Longitude,
      waterLevel: station['Water Level (m)'],
      temperature: station['Water Temperature (°C)'],
      battery: station['Battery (V)'],
      pressure: station['Barometric Pressure (mH2O)'],
      status: this.determineStatus(station),
      lastUpdate: this.formatLastUpdate(station['Date & Time']),
      anomaly: station.Anomaly,
    }));
  }

  static determineStatus(station: StationData): 'normal' | 'warning' | 'critical' | 'offline' {
    const waterLevel = station['Water Level (m)'];
    const battery = station['Battery (V)'];
    const lastUpdate = new Date(station['Date & Time']);
    const now = new Date();
    const hoursSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);

    // Check if station is offline (no data for more than 2 hours)
    if (hoursSinceUpdate > 2) {
      return 'offline';
    }

    // Check for critical conditions
    if (waterLevel < -6 || battery < 3.0) {
      return 'critical';
    }

    // Check for warning conditions
    if (waterLevel < -4 || battery < 3.5) {
      return 'warning';
    }

    return 'normal';
  }

  static formatLastUpdate(dateTime: string): string {
    const date = new Date(dateTime);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  }

  static calculateStats(stations: ProcessedStation[]): StationStats {
    const total = stations.length;
    const active = stations.filter(s => s.status !== 'offline').length;
    const normal = stations.filter(s => s.status === 'normal').length;
    const warning = stations.filter(s => s.status === 'warning').length;
    const critical = stations.filter(s => s.status === 'critical').length;
    const alerts = warning + critical;

    return {
      totalStations: total,
      activeStations: active,
      alertStations: alerts,
      normalPercentage: Math.round((normal / total) * 100),
      warningPercentage: Math.round((warning / total) * 100),
      criticalPercentage: Math.round((critical / total) * 100),
    };
  }

  static detectAnomalies(stations: ProcessedStation[]): any[] {
    const anomalies = [];

    for (const station of stations) {
      // Sudden water level drop detection
      if (station.waterLevel < -5.5) {
        anomalies.push({
          stationId: station.id,
          type: 'sudden_drop',
          severity: 'high',
          message: `Sudden water level drop detected: ${station.waterLevel}m`,
          timestamp: new Date().toISOString(),
        });
      }

      // Low battery detection
      if (station.battery < 3.2) {
        anomalies.push({
          stationId: station.id,
          type: 'low_battery',
          severity: station.battery < 3.0 ? 'critical' : 'medium',
          message: `Low battery warning: ${station.battery}V`,
          timestamp: new Date().toISOString(),
        });
      }

      // Temperature anomaly detection
      if (station.temperature > 35 || station.temperature < 10) {
        anomalies.push({
          stationId: station.id,
          type: 'temperature_anomaly',
          severity: 'medium',
          message: `Unusual temperature reading: ${station.temperature}°C`,
          timestamp: new Date().toISOString(),
        });
      }
    }

    return anomalies;
  }

  static generateTrendData(stations: ProcessedStation[], days: number = 7) {
    // Mock trend data generation
    const trendData = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      const avgLevel = stations.reduce((sum, station) => sum + station.waterLevel, 0) / stations.length;
      const variation = (Math.random() - 0.5) * 0.5; // Random variation
      
      trendData.push({
        date: date.toISOString().split('T')[0],
        averageLevel: avgLevel + variation,
        normalCount: stations.filter(s => s.status === 'normal').length,
        warningCount: stations.filter(s => s.status === 'warning').length,
        criticalCount: stations.filter(s => s.status === 'critical').length,
      });
    }

    return trendData;
  }

  static predictWaterLevels(historicalData: any[], weatherData: any) {
    // Simple prediction algorithm (in real app, this would use ML models)
    const predictions = [];
    const lastLevel = historicalData[historicalData.length - 1]?.averageLevel || -3.5;
    
    for (let i = 1; i <= 7; i++) {
      let predictedLevel = lastLevel;
      
      // Factor in weather (rainfall increases water level)
      if (weatherData?.rainfall > 10) {
        predictedLevel += 0.2 * (weatherData.rainfall / 10);
      }
      
      // Add seasonal variation
      const seasonalFactor = Math.sin((Date.now() / (1000 * 60 * 60 * 24 * 365)) * 2 * Math.PI) * 0.3;
      predictedLevel += seasonalFactor;
      
      // Add some randomness
      predictedLevel += (Math.random() - 0.5) * 0.2;
      
      predictions.push({
        day: i,
        predictedLevel: Math.round(predictedLevel * 100) / 100,
        confidence: Math.max(0.6, 1 - (i * 0.1)), // Confidence decreases over time
      });
    }
    
    return predictions;
  }
}