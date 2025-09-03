import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  FAB,
  ActivityIndicator,
  Chip,
  Menu,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../services/api';
import { theme, gradients } from '../theme/theme';

const ChapterListScreen = ({ route, navigation }) => {
  const { project } = route.params;
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: project.title });
    loadChapters();
  }, [project]);

  const loadChapters = async () => {
    try {
      console.log('Loading chapters for project:', project.id);
      const response = await ApiService.getProjectChapters(project.id);
      console.log('Chapters API response:', response);
      console.log('Chapters count:', response.chapters ? response.chapters.length : 'No chapters array');
      setChapters(response.chapters || []);
    } catch (error) {
      console.log('Error loading chapters:', error);
      console.log('Error details:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to load chapters. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadChapters();
    setRefreshing(false);
  }, []);

  const handleCreateChapter = async () => {
    try {
      console.log('Creating new chapter for project:', project.id);
      const newChapter = {
        title: `Chapter ${chapters.length + 1}`,
        content: '',
        order: chapters.length,
      };
      
      console.log('Sending chapter data:', newChapter);
      const response = await ApiService.createChapter(project.id, newChapter);
      console.log('Create chapter response:', response);
      
      if (response.success) {
        await loadChapters(); // Refresh the list
        navigation.navigate('Editor', { 
          chapter: response.chapter, 
          project: project 
        });
      } else {
        Alert.alert('Error', response.error || 'Failed to create chapter');
      }
    } catch (error) {
      console.log('Error creating chapter:', error);
      console.log('Error details:', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.error || 'Failed to create new chapter');
    }
  };

  const formatDate = (dateString) => {
    // Handle invalid or empty date strings
    if (!dateString) return 'Never';
    
    // Try to parse the date
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      // If parsing fails, return a fallback
      return 'Recently';
    }
    
    // Format valid date
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    
    // For older dates, show the actual date
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
  };

  const getWordCountColor = (wordCount) => {
    if (wordCount === 0) return theme.colors.outline;
    if (wordCount < 500) return '#e74c3c';
    if (wordCount < 1500) return '#f39c12';
    if (wordCount < 3000) return '#f1c40f';
    return '#27ae60';
  };

  const renderChapter = ({ item, index }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('Editor', { 
        chapter: item, 
        project: project 
      })}
      activeOpacity={0.8}
    >
      <Card style={styles.chapterCard}>
        <Card.Content>
          <View style={styles.chapterHeader}>
            <View style={styles.chapterInfo}>
              <Text style={styles.chapterTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <View style={styles.chapterMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="create-outline" size={14} color={getWordCountColor(item.word_count)} />
                  <Text style={[styles.metaText, { color: getWordCountColor(item.word_count) }]}>
                    {item.word_count?.toLocaleString() || '0'} words
                  </Text>
                </View>
                <Text style={styles.metaText}>
                  Updated {formatDate(item.updated_at)}
                </Text>
              </View>
            </View>
            <View style={styles.chapterActions}>
              <Chip 
                mode="outlined"
                textStyle={styles.orderText}
                style={styles.orderChip}
              >
                #{item.order + 1}
              </Chip>
            </View>
          </View>
          
          {item.content && item.content.length > 0 && (
            <Text style={styles.chapterPreview} numberOfLines={3}>
              {item.content.replace(/<[^>]*>/g, '').trim() || 'No content yet...'}
            </Text>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <LinearGradient colors={gradients.primary} style={styles.emptyGradient}>
        <Ionicons name="document-text-outline" size={60} color="rgba(255,255,255,0.8)" />
        <Text style={styles.emptyTitle}>No Chapters Yet</Text>
        <Text style={styles.emptyDescription}>
          Start writing by creating your first chapter!
        </Text>
        <TouchableOpacity style={styles.emptyButton} onPress={handleCreateChapter}>
          <Text style={styles.emptyButtonText}>Create First Chapter</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <LinearGradient colors={gradients.primary} style={styles.headerGradient}>
        <Text style={styles.projectTitle}>{project.title}</Text>
        <Text style={styles.projectDescription} numberOfLines={3}>
          {project.description || 'No description available'}
        </Text>
        
        <View style={styles.projectStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{chapters.length}</Text>
            <Text style={styles.statLabel}>Chapters</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {chapters.reduce((sum, ch) => sum + (ch.word_count || 0), 0).toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Total Words</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {Math.round(project.progress_percentage || 0)}%
            </Text>
            <Text style={styles.statLabel}>Complete</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading chapters...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={renderHeader}
        data={chapters}
        renderItem={renderChapter}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={!loading ? renderEmpty : null}
        showsVerticalScrollIndicator={false}
      />
      
      {chapters.length > 0 && (
        <FAB
          style={styles.fab}
          icon="plus"
          onPress={handleCreateChapter}
          label="New Chapter"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
  },
  projectTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  projectDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 22,
    marginBottom: 25,
  },
  projectStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: theme.roundness,
    minWidth: 70,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  chapterCard: {
    marginBottom: 12,
    elevation: 3,
    borderRadius: theme.roundness,
  },
  chapterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  chapterInfo: {
    flex: 1,
    marginRight: 12,
  },
  chapterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    marginBottom: 8,
  },
  chapterMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: theme.colors.onSurface,
    opacity: 0.7,
    marginLeft: 4,
  },
  chapterActions: {
    alignItems: 'flex-end',
  },
  orderChip: {
    backgroundColor: theme.colors.surfaceVariant,
    borderColor: theme.colors.outline,
  },
  orderText: {
    fontSize: 12,
    color: theme.colors.onSurface,
  },
  chapterPreview: {
    fontSize: 14,
    color: theme.colors.onSurface,
    opacity: 0.7,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  emptyContainer: {
    marginHorizontal: 16,
    marginTop: 40,
  },
  emptyGradient: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 30,
    borderRadius: theme.roundness,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 12,
  },
  emptyDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 25,
  },
  emptyButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: theme.roundness,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  emptyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
});

export default ChapterListScreen;