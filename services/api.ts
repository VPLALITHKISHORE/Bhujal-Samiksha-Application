const API_BASE_URL = 'https://mock-api-jsia.onrender.com';
const WEATHER_API_KEY = 'your_weather_api_key'; // Replace with actual API key

export class ApiService {
  static async fetchDWLRData() {
    try {
      const response = await fetch(`${API_BASE_URL}/DWLR_DATA`);
      if (!response.ok) {
        throw new Error('Failed to fetch DWLR data');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching DWLR data:', error);
      throw error;
    }
  }

  static async fetchStationData(stationId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/DWLR_DATA`);
      if (!response.ok) {
        throw new Error('Failed to fetch station data');
      }
      const data = await response.json();
      return data.find((station: any) => station.Telemetry_UID === stationId);
    } catch (error) {
      console.error('Error fetching station data:', error);
      throw error;
    }
  }

  static async fetchWeatherData(latitude: number, longitude: number) {
    try {
      // Using OpenWeatherMap API as example
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching weather data:', error);
      // Return mock data if API fails
      return {
        main: { temp: 25, humidity: 60 },
        weather: [{ description: 'Clear sky' }],
        rain: { '1h': 0 },
      };
    }
  }

  static async sendAlert(alertData: {
    stationId: string;
    message: string;
    severity: string;
    phoneNumber?: string;
  }) {
    try {
      // This would integrate with Twilio API for SMS/WhatsApp alerts
      console.log('Sending alert:', alertData);
      // Mock implementation
      return { success: true, messageId: 'mock_message_id' };
    } catch (error) {
      console.error('Error sending alert:', error);
      throw error;
    }
  }

  static async generateReport(reportConfig: {
    stationIds: string[];
    dateRange: { start: string; end: string };
    parameters: string[];
    format: 'pdf' | 'excel' | 'csv';
  }) {
    try {
      // Mock report generation
      console.log('Generating report:', reportConfig);
      return {
        reportId: 'mock_report_id',
        downloadUrl: 'https://example.com/report.pdf',
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  static async submitComplaint(complaintData: {
    stationId: string;
    category: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    attachments?: string[];
  }) {
    try {
      // Mock complaint submission
      console.log('Submitting complaint:', complaintData);
      return {
        complaintId: 'COMP_' + Date.now(),
        status: 'submitted',
        submittedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error submitting complaint:', error);
      throw error;
    }
  }
}