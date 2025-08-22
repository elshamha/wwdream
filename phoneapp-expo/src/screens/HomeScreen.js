import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { projectsAPI, documentsAPI } from '../services/api';

const HomeScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    projects: 0,
    documents: 0,
    totalWords: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [projectsResponse, documentsResponse] = await Promise.all([
        projectsAPI.getProjects(),
        documentsAPI.getDocuments(),
      ]);

      const projects = projectsResponse.results || projectsResponse || [];
      const documents = documentsResponse.results || documentsResponse || [];

      setStats({
        projects: projects.length,
        documents: documents.length,
        totalWords: documents.reduce((sum, doc) => sum + (doc.word_count || 0), 0),
      });
    } catch (error) {
      console.log('Error loading stats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  const quickActions = [
    {
      id: 'new-project',
      title: 'New Project',
      icon: 'folder-outline',
      color: '#4A90E2',
      onPress: () => navigation.navigate('Projects', { screen: 'NewProject' }),
    },
    {
      id: 'new-document',
      title: 'New Document',
      icon: 'document-outline',
      color: '#27AE60',
      onPress: () => navigation.navigate('Documents', { screen: 'NewDocument' }),
    },
    {
      id: 'continue-writing',
      title: 'Continue Writing',
      icon: 'create-outline',
      color: '#E67E22',
      onPress: () => navigation.navigate('Documents'),
    },
    {
      id: 'export',
      title: 'Export Work',
      icon: 'share-outline',
      color: '#9B59B6',
      onPress: () => navigation.navigate('Profile'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.userName}>{user?.first_name || user?.username || 'Writer'}</Text>
            </View>
            <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Profile')}>
              <Ionicons name="person-circle-outline" size={40} color="#4A90E2" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Your Writing Stats</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Ionicons name="folder-outline" size={24} color="#4A90E2" />
              <Text style={styles.statNumber}>{stats.projects}</Text>
              <Text style={styles.statLabel}>Projects</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="document-outline" size={24} color="#27AE60" />
              <Text style={styles.statNumber}>{stats.documents}</Text>
              <Text style={styles.statLabel}>Documents</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="create-outline" size={24} color="#E67E22" />
              <Text style={styles.statNumber}>{stats.totalWords.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Words</Text>
            </View>
          </View>
        </View>

        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.actionCard, { borderColor: action.color }]}
                onPress={action.onPress}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                  <Ionicons name={action.icon} size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.motivationContainer}>
          <View style={styles.motivationCard}>
            <Ionicons name="bulb-outline" size={30} color="#F39C12" />
            <Text style={styles.motivationTitle}>Today's Writing Tip</Text>
            <Text style={styles.motivationText}>
              "The first draft of anything is shit. But you have to write that first draft to get to the good stuff." - Ernest Hemingway
            </Text>
          </View>
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
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 4,
  },
  profileButton: {
    padding: 5,
  },
  statsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 4,
  },
  quickActionsContainer: {
    padding: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '48%',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
  },
  motivationContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  motivationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  motivationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 10,
    marginBottom: 10,
  },
  motivationText: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
});

export default HomeScreen;