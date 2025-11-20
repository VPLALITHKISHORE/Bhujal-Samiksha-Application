export interface StationData {
  'S.No': number;
  Telemetry_UID: string;
  State: string;
  District: string;
  Tahsil: string;
  Block: string;
  Village: string;
  Latitude: number;
  Longitude: number;
  'Date & Time': string;
  'Battery (V)': number;
  'Water Temperature (°C)': number;
  'Water Level (m)': number;
  'Barometric Pressure (mH2O)': number;
  Anomaly: 'Normal' | 'Warning' | 'Critical';
}

export interface ProcessedStation {
  id: string;
  name: string;
  state: string;
  district: string;
  village: string;
  latitude: number;
  longitude: number;
  waterLevel: number;
  temperature: number;
  battery: number;
  pressure: number;
  status: 'normal' | 'warning' | 'critical' | 'offline';
  lastUpdate: string;
  anomaly: string;
}

export interface StationStats {
  totalStations: number;
  activeStations: number;
  alertStations: number;
  normalPercentage: number;
  warningPercentage: number;
  criticalPercentage: number;
}

export interface AlertData {
  id: string;
  stationId: string;
  stationName: string;
  type: 'water_level' | 'battery' | 'temperature' | 'equipment' | 'data_quality';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  status: 'active' | 'acknowledged' | 'resolved';
  value?: number;
  threshold?: number;
}

export interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  forecast: {
    date: string;
    temperature: number;
    rainfall: number;
    description: string;
  }[];
}