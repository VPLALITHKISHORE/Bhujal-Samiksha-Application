import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  User,
  Bell,
  FileText,
  MessageSquare,
  Settings,
  Shield,
  HelpCircle,
  Globe,
  LogOut,
  ChevronRight,
  Edit,
  Key,
  Download,
  Share,
  Moon,
  Smartphone,
  Database,
  Lock,
  Info,
} from 'lucide-react-native';

export default function MoreScreen() {
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => router.replace('/auth') },
      ]
    );
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['#1E3A8A', '#3B82F6']}
      style={styles.header}
    >
      <SafeAreaView edges={['top']}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Profile & Settings</Text>
        </View>
        
        <View style={styles.profileSection}>
          <View style={styles.profileAvatar}>
            <User size={32} color="#1E3A8A" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Dr. Rajesh Kumar</Text>
            <Text style={styles.profileRole}>Groundwater Researcher</Text>
            <Text style={styles.profileEmail}>rajesh.kumar@gov.in</Text>
          </View>
          <TouchableOpacity style={styles.editProfile}>
            <Edit size={20} color="white" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );

  const renderMenuSection = (title: string, items: any[]) => (
    <View style={styles.menuSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.menuItems}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.menuItem,
              index === items.length - 1 && styles.lastMenuItem,
            ]}
            onPress={item.onPress}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: item.iconBg }]}>
                <item.icon size={20} color={item.iconColor} />
              </View>
              <View style={styles.menuItemText}>
                <Text style={styles.menuItemTitle}>{item.title}</Text>
                {item.subtitle && (
                  <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                )}
              </View>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const accountItems = [
    {
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      icon: User,
      iconBg: '#EBF8FF',
      iconColor: '#3B82F6',
      onPress: () => Alert.alert('Edit Profile', 'Feature coming soon'),
    },
    {
      title: 'Change Password',
      subtitle: 'Update your account password',
      icon: Key,
      iconBg: '#FEF3C7',
      iconColor: '#F59E0B',
      onPress: () => Alert.alert('Change Password', 'Feature coming soon'),
    },
    {
      title: 'Notification Settings',
      subtitle: 'Manage alerts and notifications',
      icon: Bell,
      iconBg: '#ECFDF5',
      iconColor: '#10B981',
      onPress: () => Alert.alert('Notifications', 'Feature coming soon'),
    },
    {
      title: 'Language',
      subtitle: 'English, हिंदी',
      icon: Globe,
      iconBg: '#F3E8FF',
      iconColor: '#8B5CF6',
      onPress: () => Alert.alert('Language', 'Feature coming soon'),
    },
  ];

  const appItems = [
    {
      title: 'Data Sync Frequency',
      subtitle: 'Real-time updates',
      icon: Database,
      iconBg: '#EBF8FF',
      iconColor: '#3B82F6',
      onPress: () => Alert.alert('Data Sync', 'Feature coming soon'),
    },
    {
      title: 'Offline Mode',
      subtitle: 'Download data for offline use',
      icon: Download,
      iconBg: '#ECFDF5',
      iconColor: '#10B981',
      onPress: () => Alert.alert('Offline Mode', 'Feature coming soon'),
    },
    {
      title: 'Cache Management',
      subtitle: 'Clear app cache and data',
      icon: Smartphone,
      iconBg: '#FEF3C7',
      iconColor: '#F59E0B',
      onPress: () => Alert.alert('Cache', 'Feature coming soon'),
    },
    {
      title: 'Export Preferences',
      subtitle: 'Default export formats',
      icon: Share,
      iconBg: '#F0FDF4',
      iconColor: '#22C55E',
      onPress: () => Alert.alert('Export', 'Feature coming soon'),
    },
  ];

  const securityItems = [
    {
      title: 'Biometric Login',
      subtitle: 'Use fingerprint or face ID',
      icon: Shield,
      iconBg: '#ECFDF5',
      iconColor: '#10B981',
      onPress: () => Alert.alert('Biometric', 'Feature coming soon'),
    },
    {
      title: 'Auto Lock',
      subtitle: 'Lock app after inactivity',
      icon: Lock,
      iconBg: '#FEF2F2',
      iconColor: '#EF4444',
      onPress: () => Alert.alert('Auto Lock', 'Feature coming soon'),
    },
    {
      title: 'Privacy Settings',
      subtitle: 'Control data sharing',
      icon: Settings,
      iconBg: '#F3F4F6',
      iconColor: '#6B7280',
      onPress: () => Alert.alert('Privacy', 'Feature coming soon'),
    },
  ];

  const supportItems = [
    {
      title: 'Reports',
      subtitle: 'Generate and download reports',
      icon: FileText,
      iconBg: '#EBF8FF',
      iconColor: '#3B82F6',
      onPress: () => router.push('/reports/generate'),
    },
    {
      title: 'Complaints',
      subtitle: 'Report issues and track status',
      icon: MessageSquare,
      iconBg: '#FEF3C7',
      iconColor: '#F59E0B',
      onPress: () => Alert.alert('Complaints', 'Feature coming soon'),
    },
    {
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      icon: HelpCircle,
      iconBg: '#F0FDF4',
      iconColor: '#22C55E',
      onPress: () => Alert.alert('Help', 'Feature coming soon'),
    },
    {
      title: 'About',
      subtitle: 'App version 1.0.0',
      icon: Info,
      iconBg: '#F3F4F6',
      iconColor: '#6B7280',
      onPress: () => Alert.alert('About', 'Bhujal Samiksha v1.0.0\nGroundwater Monitoring System'),
    },
  ];

  return (
    <View style={styles.container}>
      {renderHeader()}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderMenuSection('👤 ACCOUNT', accountItems)}
        {renderMenuSection('⚙️ APP SETTINGS', appItems)}
        {renderMenuSection('🔒 SECURITY', securityItems)}
        {renderMenuSection('ℹ️ SUPPORT & ABOUT', supportItems)}
        
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
        
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
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 14,
    color: '#E5E7EB',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 12,
    color: '#D1D5DB',
  },
  editProfile: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  menuSection: {
    marginTop: 24,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  menuItems: {
    backgroundColor: 'white',
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  logoutSection: {
    marginTop: 32,
    marginHorizontal: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  bottomPadding: {
    height: 40,
  },
});