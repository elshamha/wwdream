import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import {
  Text,
  Appbar,
  FAB,
  Portal,
  Modal,
  Button,
  Card,
  Chip,
  ActivityIndicator,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../services/api';
import { theme, gradients } from '../theme/theme';

const { height } = Dimensions.get('window');

const EditorScreen = ({ route, navigation }) => {
  const { chapter: initialChapter, project } = route.params;
  const [chapter, setChapter] = useState(initialChapter);
  const [content, setContent] = useState(initialChapter.content || '');
  const [title, setTitle] = useState(initialChapter.title || '');
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const [statsVisible, setStatsVisible] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const titleInputRef = useRef(null);
  const contentInputRef = useRef(null);
  const autoSaveRef = useRef(null);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title || 'Untitled Chapter'}
        </Text>
      ),
      headerRight: () => (
        <Appbar.Action 
          icon={saving ? "loading" : "content-save"} 
          onPress={handleManualSave}
          disabled={saving}
        />
      ),
    });
  }, [title, saving]);

  useEffect(() => {
    updateWordCount();
    setHasUnsavedChanges(true);
    
    // Clear existing timeout
    if (autoSaveRef.current) {
      clearTimeout(autoSaveRef.current);
    }
    
    // Set up auto-save after 2 seconds of inactivity
    autoSaveRef.current = setTimeout(() => {
      handleAutoSave();
    }, 2000);

    return () => {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current);
      }
    };
  }, [content, title]);

  useEffect(() => {
    // Save on component unmount if there are unsaved changes
    return () => {
      if (hasUnsavedChanges) {
        handleAutoSave();
      }
    };
  }, [hasUnsavedChanges]);

  const updateWordCount = () => {
    const words = content.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  };

  const handleAutoSave = async () => {
    if (!hasUnsavedChanges) return;
    
    try {
      await ApiService.updateChapter(chapter.id, {
        title: title,
        content: content,
      });
      
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.log('Auto-save failed:', error);
    }
  };

  const handleManualSave = async () => {
    setSaving(true);
    
    try {
      const response = await ApiService.updateChapter(chapter.id, {
        title: title,
        content: content,
      });
      
      if (response.success) {
        setChapter(response.chapter);
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        Alert.alert('Saved', 'Your chapter has been saved successfully!');
      }
    } catch (error) {
      console.log('Save failed:', error);
      Alert.alert('Error', 'Failed to save your chapter. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const formatLastSaved = () => {
    if (!lastSaved) return 'Never saved';
    const now = new Date();
    const diff = Math.floor((now - lastSaved) / 1000);
    
    if (diff < 60) return 'Saved just now';
    if (diff < 3600) return `Saved ${Math.floor(diff / 60)} minutes ago`;
    return `Saved at ${lastSaved.toLocaleTimeString()}`;
  };

  const getReadingTime = () => {
    const wordsPerMinute = 200;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

  const renderStats = () => (
    <Portal>
      <Modal
        visible={statsVisible}
        onDismiss={() => setStatsVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Card style={styles.statsCard}>
          <LinearGradient colors={gradients.primary} style={styles.statsHeader}>
            <Text style={styles.statsTitle}>Writing Statistics</Text>
          </LinearGradient>
          
          <Card.Content style={styles.statsContent}>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{wordCount.toLocaleString()}</Text>
                <Text style={styles.statLabel}>Words</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{content.length.toLocaleString()}</Text>
                <Text style={styles.statLabel}>Characters</Text>
              </View>
            </View>
            
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{getReadingTime()}</Text>
                <Text style={styles.statLabel}>Reading Time</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {content.split('\n\n').filter(p => p.trim()).length}
                </Text>
                <Text style={styles.statLabel}>Paragraphs</Text>
              </View>
            </View>
            
            <View style={styles.saveStatus}>
              <Chip
                icon={hasUnsavedChanges ? "circle" : "check-circle"}
                style={[
                  styles.statusChip,
                  { backgroundColor: hasUnsavedChanges ? '#f39c12' : '#27ae60' }
                ]}
                textStyle={styles.statusText}
              >
                {hasUnsavedChanges ? 'Unsaved Changes' : 'All Changes Saved'}
              </Chip>
              <Text style={styles.lastSavedText}>
                {formatLastSaved()}
              </Text>
            </View>
            
            <Button
              mode="contained"
              onPress={() => setStatsVisible(false)}
              style={styles.closeButton}
            >
              Close
            </Button>
          </Card.Content>
        </Card>
      </Modal>
    </Portal>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <View style={styles.editorContainer}>
        {/* Chapter Title Input */}
        <View style={styles.titleContainer}>
          <TextInput
            ref={titleInputRef}
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Chapter Title"
            placeholderTextColor={theme.colors.outline}
            multiline={false}
            returnKeyType="done"
            onSubmitEditing={() => contentInputRef.current?.focus()}
          />
        </View>
        
        {/* Content Input */}
        <ScrollView style={styles.contentContainer} keyboardShouldPersistTaps="handled">
          <TextInput
            ref={contentInputRef}
            style={styles.contentInput}
            value={content}
            onChangeText={setContent}
            placeholder="Start writing your chapter..."
            placeholderTextColor={theme.colors.outline}
            multiline
            textAlignVertical="top"
            autoCorrect
            spellCheck
          />
        </ScrollView>
        
        {/* Bottom Status Bar */}
        <View style={styles.statusBar}>
          <Text style={styles.statusText}>
            {wordCount.toLocaleString()} words
          </Text>
          <View style={styles.statusIndicator}>
            {saving && <ActivityIndicator size="small" color={theme.colors.primary} />}
            <Text style={[
              styles.statusText,
              { color: hasUnsavedChanges ? '#f39c12' : '#27ae60' }
            ]}>
              {saving ? 'Saving...' : hasUnsavedChanges ? 'Unsaved' : 'Saved'}
            </Text>
          </View>
        </View>
      </View>

      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon="chart-line"
        onPress={() => setStatsVisible(true)}
        size="small"
      />

      {renderStats()}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    maxWidth: 200,
  },
  editorContainer: {
    flex: 1,
  },
  titleContainer: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    minHeight: 40,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  contentInput: {
    fontSize: 18,
    lineHeight: 28,
    color: theme.colors.onSurface,
    paddingHorizontal: 20,
    paddingVertical: 20,
    minHeight: height - 200,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: theme.colors.surfaceVariant,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
  },
  statusText: {
    fontSize: 14,
    color: theme.colors.onSurface,
    opacity: 0.7,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 80,
    backgroundColor: theme.colors.primary,
  },
  modalContainer: {
    marginHorizontal: 20,
  },
  statsCard: {
    borderRadius: theme.roundness,
    overflow: 'hidden',
  },
  statsHeader: {
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  statsContent: {
    paddingVertical: 24,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 14,
    color: theme.colors.onSurface,
    opacity: 0.7,
    marginTop: 4,
  },
  saveStatus: {
    alignItems: 'center',
    marginVertical: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outline,
  },
  statusChip: {
    marginBottom: 8,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 14,
  },
  lastSavedText: {
    fontSize: 12,
    color: theme.colors.onSurface,
    opacity: 0.6,
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: theme.colors.primary,
  },
});

export default EditorScreen;