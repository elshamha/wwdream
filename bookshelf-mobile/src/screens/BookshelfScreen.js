import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
  Alert,
  Share,
  Linking,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  Text,
  Card,
  FAB,
  Chip,
  ActivityIndicator,
  Menu,
  Divider,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ApiService from '../services/api';

const { width } = Dimensions.get('window');

const BookshelfScreen = ({ navigation }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [focusRefreshing, setFocusRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const { user, logout } = useAuth();
  const { theme, gradients, isDarkMode, toggleTheme } = useTheme();
  
  const styles = createStyles(theme);

  useEffect(() => {
    loadBookshelfProjects();
  }, []);

  // Refresh projects when screen comes into focus (after editing chapters or creating projects)
  useFocusEffect(
    useCallback(() => {
      console.log('BookshelfScreen focused - reloading projects to show latest changes');
      // Only show focus refresh indicator if not in initial loading state
      if (!loading) {
        setFocusRefreshing(true);
      }
      loadBookshelfProjects().finally(() => {
        setFocusRefreshing(false);
      });
    }, [loading])
  );

  const loadBookshelfProjects = async () => {
    try {
      console.log('Loading bookshelf projects...');
      const response = await ApiService.getBookshelfProjects();
      console.log('API Response:', response);
      console.log('Projects count:', response.projects ? response.projects.length : 'No projects array');
      setProjects(response.projects || []);
    } catch (error) {
      console.log('Error loading bookshelf projects:', error);
      console.log('Error details:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to load your bookshelf projects. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBookshelfProjects();
    setRefreshing(false);
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          onPress: async () => {
            await logout();
            navigation.replace('Login');
          }
        },
      ]
    );
  };

  const handleOpenWebApp = () => {
    const webAppUrl = 'http://192.168.0.34:8000';
    Linking.openURL(webAppUrl).catch((err) => {
      Alert.alert('Error', 'Failed to open web dashboard');
      console.error('Failed to open URL:', err);
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Updated today';
    if (diffDays <= 7) return `Updated ${diffDays} days ago`;
    return `Updated on ${date.toLocaleDateString()}`;
  };

  const getProgressColor = (percentage) => {
    if (percentage < 25) return '#e74c3c';
    if (percentage < 50) return '#f39c12';
    if (percentage < 75) return '#f1c40f';
    return '#27ae60';
  };

  const handleShare = async (project) => {
    try {
      const message = `Check out my book "${project.title}"!\n\n` +
        `Genre: ${project.genre || 'Unspecified'}\n` +
        `Progress: ${Math.round(project.progress_percentage || 0)}% complete\n` +
        `Chapters: ${project.chapter_count}\n` +
        `Words: ${project.word_count?.toLocaleString() || '0'}\n\n` +
        `${project.description || 'No description available'}`;
      
      const result = await Share.share({
        message: message,
        title: project.title,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
          console.log('Shared via', result.activityType);
        } else {
          // shared
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
        console.log('Share dismissed');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share the book');
      console.error('Share error:', error);
    }
  };

  const renderProject = ({ item, index }) => {
    const cardMargin = index % 2 === 0 ? { marginRight: 8 } : { marginLeft: 8 };
    const progressColor = getProgressColor(item.progress_percentage || 0);
    
    return (
      <TouchableOpacity
        style={[styles.projectCard, cardMargin]}
        onPress={() => navigation.navigate('ChapterList', { project: item })}
        activeOpacity={0.8}
      >
        <Card style={styles.card}>
          <LinearGradient
            colors={gradients.primary}
            style={styles.cardHeader}
          >
            <View style={styles.headerContent}>
              <Text style={styles.projectTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <View style={styles.headerMeta}>
                <Chip 
                  mode="outlined" 
                  textStyle={styles.genreText}
                  style={styles.genreChip}
                >
                  {item.genre || 'Unspecified'}
                </Chip>
              </View>
            </View>
          </LinearGradient>
          
          <Card.Content style={styles.cardContent}>
            <Text style={styles.description} numberOfLines={3}>
              {item.description || 'No description available'}
            </Text>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Ionicons name="document-text-outline" size={16} color={theme.colors.primary} />
                <Text style={styles.statText}>{item.chapter_count} chapters</Text>
              </View>
              
              <View style={styles.statItem}>
                <Ionicons name="create-outline" size={16} color={theme.colors.primary} />
                <Text style={styles.statText}>
                  {item.word_count?.toLocaleString() || '0'} words
                </Text>
              </View>
              
              <TouchableOpacity 
                style={styles.shareButton}
                onPress={() => handleShare(item)}
              >
                <Ionicons name="share-social-outline" size={18} color={theme.colors.primary} />
                <Text style={styles.shareText}>Share</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${Math.min(item.progress_percentage || 0, 100)}%`,
                      backgroundColor: progressColor 
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {Math.round(item.progress_percentage || 0)}%
              </Text>
            </View>
            
            <Text style={styles.updateDate}>
              {formatDate(item.updated_at)}
            </Text>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <LinearGradient colors={gradients.primary} style={styles.emptyGradient}>
        <Ionicons name="library-outline" size={80} color="rgba(255,255,255,0.8)" />
        <Text style={styles.emptyTitle}>Your Bookshelf is Empty</Text>
        <Text style={styles.emptyDescription}>
          Projects marked for display on your bookshelf will appear here.
          Visit your web dashboard to add books to your shelf!
        </Text>
      </LinearGradient>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <LinearGradient colors={gradients.primary} style={styles.headerGradient}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userNameText}>{user?.username || 'Writer'}!</Text>
          </View>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <TouchableOpacity onPress={() => setMenuVisible(true)}>
                <Ionicons name="person-circle-outline" size={32} color="#ffffff" />
              </TouchableOpacity>
            }
          >
            <Menu.Item 
              onPress={handleOpenWebApp} 
              title="Web Dashboard"
              leadingIcon="web"
            />
            <Divider />
            <Menu.Item 
              onPress={toggleTheme} 
              title={isDarkMode ? "Light Mode" : "Dark Mode"}
              leadingIcon={isDarkMode ? "white-balance-sunny" : "moon-waning-crescent"}
            />
            <Divider />
            <Menu.Item 
              onPress={handleLogout} 
              title="Sign Out" 
              leadingIcon="logout"
            />
          </Menu>
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{projects.length}</Text>
            <Text style={styles.statLabel}>Books</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {projects.reduce((sum, p) => sum + (p.chapter_count || 0), 0)}
            </Text>
            <Text style={styles.statLabel}>Chapters</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {Math.round(projects.reduce((sum, p) => sum + (p.word_count || 0), 0) / 1000)}k
            </Text>
            <Text style={styles.statLabel}>Words</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading your bookshelf...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={renderHeader}
        data={projects}
        renderItem={renderProject}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.row}
        refreshControl={
          <RefreshControl refreshing={refreshing || focusRefreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={!loading ? renderEmpty : null}
        showsVerticalScrollIndicator={false}
      />
      
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('NewProject')}
        label="New Book"
        labelStyle={{ color: '#ffffff', fontWeight: '600' }}
        color="#ffffff"
      />
    </View>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.onBackground,
  },
  headerContainer: {
    marginBottom: 20,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    paddingTop: 50,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  userNameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: theme.roundness,
    minWidth: 80,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
  },
  projectCard: {
    flex: 1,
    marginBottom: 16,
  },
  card: {
    elevation: 4,
    borderRadius: theme.roundness,
    overflow: 'hidden',
  },
  cardHeader: {
    height: 120,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
  },
  headerMeta: {
    marginTop: 8,
  },
  genreChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  genreText: {
    color: '#ffffff',
    fontSize: 12,
  },
  cardContent: {
    paddingVertical: 16,
  },
  description: {
    fontSize: 14,
    color: theme.colors.onSurface,
    lineHeight: 20,
    marginBottom: 16,
    opacity: 0.8,
  },
  statsContainer: {
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statText: {
    fontSize: 14,
    color: theme.colors.onSurface,
    marginLeft: 8,
    opacity: 0.7,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryContainer,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  shareText: {
    fontSize: 14,
    color: theme.colors.primary,
    marginLeft: 6,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: theme.colors.outline,
    borderRadius: 3,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    minWidth: 35,
  },
  updateDate: {
    fontSize: 12,
    color: theme.colors.onSurface,
    opacity: 0.6,
    fontStyle: 'italic',
  },
  emptyContainer: {
    marginHorizontal: 16,
    marginTop: 40,
  },
  emptyGradient: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
    borderRadius: theme.roundness,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 20,
    marginBottom: 16,
  },
  emptyDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
});

export default BookshelfScreen;