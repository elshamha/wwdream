import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  TextInput as RNTextInput,
  Modal,
  Share,
  ScrollView,
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
  const [editingChapter, setEditingChapter] = useState(null);
  const [tempChapterOrder, setTempChapterOrder] = useState('');
  const [showCollaborationModal, setShowCollaborationModal] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [onlineCollaborators, setOnlineCollaborators] = useState([]);

  useEffect(() => {
    navigation.setOptions({ 
      title: project.title,
      headerRight: () => (
        <TouchableOpacity 
          onPress={() => {
            setShowCollaborationModal(true);
            loadCollaborators();
          }}
          style={{ marginRight: 16 }}
        >
          <Ionicons name="people-outline" size={24} color="#fff" />
        </TouchableOpacity>
      ),
    });
    loadChapters();
  }, [project]);

  // Refresh chapters when screen comes into focus (user navigates back from editor)
  useFocusEffect(
    useCallback(() => {
      loadChapters();
      checkOnlineCollaborators();
    }, [])
  );

  // Check for online collaborators periodically
  useEffect(() => {
    const interval = setInterval(() => {
      checkOnlineCollaborators();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [project.id]);

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

  const handleChapterOrderChange = async (chapter, newOrderText) => {
    try {
      const newOrder = parseInt(newOrderText.trim());
      
      // Validate the new order
      if (isNaN(newOrder) || newOrder < 1 || newOrder > chapters.length) {
        Alert.alert(
          'Invalid Chapter Number',
          `Please enter a number between 1 and ${chapters.length}`
        );
        return;
      }
      
      // Convert to 0-based index for API
      const newOrderIndex = newOrder - 1;
      
      // Don't do anything if the order hasn't changed
      if (newOrderIndex === chapter.order) {
        setEditingChapter(null);
        setTempChapterOrder('');
        return;
      }
      
      console.log(`Reordering chapter "${chapter.title}" from position ${chapter.order + 1} to ${newOrder}`);
      
      // Call the API to reorder
      await ApiService.reorderChapter(project.id, chapter.id, newOrderIndex);
      
      // Reload the chapters to show the new order
      await loadChapters();
      
      // Reset editing state
      setEditingChapter(null);
      setTempChapterOrder('');
      
    } catch (error) {
      console.log('Error reordering chapter:', error);
      Alert.alert('Error', 'Failed to reorder chapter. Please try again.');
    }
  };

  const startEditingChapterOrder = (chapter) => {
    setEditingChapter(chapter.id);
    setTempChapterOrder((chapter.order + 1).toString());
  };

  const cancelEditingChapterOrder = () => {
    setEditingChapter(null);
    setTempChapterOrder('');
  };

  const handleInviteCollaborator = async () => {
    if (!inviteEmail.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    try {
      console.log(`Inviting collaborator: ${inviteEmail} to project ${project.id}`);
      await ApiService.inviteCollaborator(project.id, inviteEmail);
      
      Alert.alert('Success', `Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
      loadCollaborators();
    } catch (error) {
      console.log('Error inviting collaborator:', error);
      Alert.alert('Error', 'Failed to send invitation');
    }
  };

  const handleRemoveCollaborator = async (collaboratorId) => {
    Alert.alert(
      'Remove Collaborator',
      'Are you sure you want to remove this collaborator?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await ApiService.removeCollaborator(project.id, collaboratorId);
              loadCollaborators();
            } catch (error) {
              Alert.alert('Error', 'Failed to remove collaborator');
            }
          },
        },
      ]
    );
  };

  const loadCollaborators = async () => {
    try {
      const response = await ApiService.getCollaborators(project.id);
      setCollaborators(response.collaborators || []);
    } catch (error) {
      console.log('Error loading collaborators:', error);
    }
  };

  const checkOnlineCollaborators = async () => {
    try {
      // In a real implementation, this would check who's currently online
      // For now, we'll simulate some online collaborators based on recent activity
      const response = await ApiService.getCollaborators(project.id);
      const allCollaborators = response.collaborators || [];
      
      // Simulate: show collaborators who were active in last 5 minutes as "online"
      const onlineOnes = allCollaborators.filter(c => {
        // Simulate random online status for demo
        return Math.random() > 0.7 && c.role !== 'owner';
      });
      
      setOnlineCollaborators(onlineOnes);
    } catch (error) {
      console.log('Error checking online collaborators:', error);
    }
  };

  const handleShareProject = async () => {
    try {
      const shareUrl = `https://atticuswriter.com/project/${project.id}/collaborate`;
      await Share.share({
        message: `Join me in writing "${project.title}" on Atticus Writer!\n\n${shareUrl}`,
        title: `Collaborate on ${project.title}`,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
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
              {editingChapter === item.id ? (
                <View style={styles.orderInputContainer}>
                  <Text style={styles.orderHashtag}>#</Text>
                  <RNTextInput
                    value={tempChapterOrder}
                    onChangeText={setTempChapterOrder}
                    keyboardType="numeric"
                    style={styles.orderInput}
                    onSubmitEditing={() => handleChapterOrderChange(item, tempChapterOrder)}
                    onBlur={cancelEditingChapterOrder}
                    autoFocus={true}
                    maxLength={2}
                    selectTextOnFocus={true}
                  />
                </View>
              ) : (
                <TouchableOpacity onPress={() => startEditingChapterOrder(item)}>
                  <Chip 
                    mode="outlined"
                    textStyle={styles.orderText}
                    style={styles.orderChip}
                  >
                    #{item.order + 1}
                  </Chip>
                </TouchableOpacity>
              )}
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
        
        {/* Online Collaborators Indicator */}
        {onlineCollaborators.length > 0 && (
          <View style={styles.onlineIndicator}>
            <View style={styles.onlineIcon}>
              <Ionicons name="people" size={16} color="#27ae60" />
            </View>
            <Text style={styles.onlineText}>
              {onlineCollaborators.length} collaborator{onlineCollaborators.length !== 1 ? 's' : ''} online
            </Text>
          </View>
        )}
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

      {/* Collaboration Modal */}
      <Modal
        visible={showCollaborationModal}
        onRequestClose={() => setShowCollaborationModal(false)}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Project Collaboration</Text>
            <TouchableOpacity 
              onPress={() => setShowCollaborationModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={theme.colors.onBackground} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Share Project Section */}
            <View style={styles.shareSection}>
              <Text style={styles.sectionTitle}>Share Project</Text>
              <Text style={styles.sectionDescription}>
                Share "{project.title}" with others for collaboration
              </Text>
              <TouchableOpacity style={styles.shareButton} onPress={handleShareProject}>
                <Ionicons name="share-outline" size={20} color="#fff" />
                <Text style={styles.shareButtonText}>Share Project Link</Text>
              </TouchableOpacity>
            </View>

            {/* Invite Collaborators Section */}
            <View style={styles.inviteSection}>
              <Text style={styles.sectionTitle}>Invite Collaborators</Text>
              <Text style={styles.sectionDescription}>
                Enter email addresses to invite others to collaborate
              </Text>
              
              <View style={styles.inviteInputContainer}>
                <RNTextInput
                  style={styles.emailInput}
                  placeholder="Enter email address"
                  value={inviteEmail}
                  onChangeText={setInviteEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TouchableOpacity 
                  style={styles.inviteButton}
                  onPress={handleInviteCollaborator}
                >
                  <Text style={styles.inviteButtonText}>Invite</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Current Collaborators Section */}
            <View style={styles.collaboratorsSection}>
              <Text style={styles.sectionTitle}>Current Collaborators</Text>
              {collaborators.length === 0 ? (
                <Text style={styles.noCollaboratorsText}>
                  No collaborators yet. Invite someone to get started!
                </Text>
              ) : (
                collaborators.map((collaborator) => (
                  <View key={collaborator.id} style={styles.collaboratorItem}>
                    <View style={styles.collaboratorInfo}>
                      <Text style={styles.collaboratorName}>
                        {collaborator.name || collaborator.email}
                      </Text>
                      <Text style={styles.collaboratorRole}>
                        {collaborator.role === 'owner' ? 'Owner' : 'Collaborator'}
                      </Text>
                    </View>
                    {collaborator.role !== 'owner' && (
                      <TouchableOpacity
                        onPress={() => handleRemoveCollaborator(collaborator.id)}
                        style={styles.removeButton}
                      >
                        <Ionicons name="remove-circle-outline" size={20} color="#e74c3c" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>
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
  orderInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 12,
    paddingLeft: 8,
    paddingRight: 4,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    height: 28,
    maxWidth: 60,
  },
  orderHashtag: {
    fontSize: 12,
    color: theme.colors.onSurface,
    marginRight: 2,
  },
  orderInput: {
    width: 30,
    height: 24,
    backgroundColor: 'transparent',
    fontSize: 12,
    textAlign: 'center',
    padding: 0,
    margin: 0,
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
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
    backgroundColor: theme.colors.surface,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.onBackground,
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  shareSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.onBackground,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: theme.colors.onBackground,
    opacity: 0.7,
    marginBottom: 16,
    lineHeight: 20,
  },
  shareButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: theme.roundness,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  inviteSection: {
    marginBottom: 30,
  },
  inviteInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emailInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    borderRadius: theme.roundness,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: theme.colors.surface,
    color: theme.colors.onSurface,
  },
  inviteButton: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: theme.roundness,
  },
  inviteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  collaboratorsSection: {
    marginBottom: 20,
  },
  noCollaboratorsText: {
    fontSize: 14,
    color: theme.colors.onBackground,
    opacity: 0.6,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  collaboratorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  collaboratorInfo: {
    flex: 1,
  },
  collaboratorName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  collaboratorRole: {
    fontSize: 12,
    color: theme.colors.onSurface,
    opacity: 0.6,
    marginTop: 2,
  },
  removeButton: {
    padding: 4,
  },
  onlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(39, 174, 96, 0.2)',
    borderRadius: 20,
    alignSelf: 'center',
  },
  onlineIcon: {
    marginRight: 6,
  },
  onlineText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default ChapterListScreen;