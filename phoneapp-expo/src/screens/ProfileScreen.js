import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const profileSections = [
    {
      title: 'Account',
      items: [
        {
          icon: 'person-outline',
          label: 'Edit Profile',
          onPress: () => Alert.alert('Coming Soon', 'Profile editing will be available soon!'),
        },
        {
          icon: 'settings-outline',
          label: 'Settings',
          onPress: () => Alert.alert('Coming Soon', 'Settings will be available soon!'),
        },
        {
          icon: 'notifications-outline',
          label: 'Notifications',
          onPress: () => Alert.alert('Coming Soon', 'Notification settings will be available soon!'),
        },
      ],
    },
    {
      title: 'Writing',
      items: [
        {
          icon: 'download-outline',
          label: 'Export Options',
          onPress: () => Alert.alert('Coming Soon', 'Export features will be available soon!'),
        },
        {
          icon: 'cloud-outline',
          label: 'Backup & Sync',
          onPress: () => Alert.alert('Coming Soon', 'Cloud backup will be available soon!'),
        },
        {
          icon: 'stats-chart-outline',
          label: 'Writing Analytics',
          onPress: () => Alert.alert('Coming Soon', 'Advanced analytics will be available soon!'),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: 'help-circle-outline',
          label: 'Help & FAQ',
          onPress: () => Alert.alert('Coming Soon', 'Help section will be available soon!'),
        },
        {
          icon: 'mail-outline',
          label: 'Contact Support',
          onPress: () => Alert.alert('Coming Soon', 'Contact support will be available soon!'),
        },
        {
          icon: 'information-circle-outline',
          label: 'About',
          onPress: () => Alert.alert('Atticus Writer Mobile', 'Version 1.0.0\n\nYour mobile writing companion for creating amazing stories and documents.'),
        },
      ],
    },
  ];

  const renderMenuItem = (item) => (
    <TouchableOpacity key={item.label} style={styles.menuItem} onPress={item.onPress}>
      <View style={styles.menuItemLeft}>
        <Ionicons name={item.icon} size={24} color="#4A90E2" />
        <Text style={styles.menuItemText}>{item.label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#BDC3C7" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.userSection}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle" size={80} color="#4A90E2" />
          </View>
          <Text style={styles.userName}>
            {user?.first_name && user?.last_name 
              ? `${user.first_name} ${user.last_name}`
              : user?.username || 'User'
            }
          </Text>
          <Text style={styles.userEmail}>{user?.email || 'No email'}</Text>
        </View>

        {profileSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map(renderMenuItem)}
            </View>
          </View>
        ))}

        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#E74C3C" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Made with ❤️ for writers everywhere
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  scrollView: {
    flex: 1,
  },
  userSection: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 20,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: '#2C3E50',
    marginLeft: 15,
  },
  logoutSection: {
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  logoutText: {
    fontSize: 16,
    color: '#E74C3C',
    marginLeft: 15,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 14,
    color: '#95A5A6',
    fontStyle: 'italic',
  },
});

export default ProfileScreen;