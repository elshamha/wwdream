import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Appbar,
  ActivityIndicator,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import ApiService from '../services/api';
import { theme } from '../theme/theme';

const { height } = Dimensions.get('window');

const EditorScreen = ({ route, navigation }) => {
  const { chapter: initialChapter, project } = route.params;
  
  // Helper function to convert HTML to plain text
  const htmlToText = (html) => {
    if (!html) return '';
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<p[^>]*>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  };

  // Helper function to convert plain text to basic HTML
  const textToHtml = (text) => {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/\n\n+/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>');
  };

  const [chapter, setChapter] = useState(initialChapter);
  const [content, setContent] = useState(htmlToText(initialChapter.content || ''));
  const [title, setTitle] = useState(initialChapter.title || '');
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isToolbarVisible, setIsToolbarVisible] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const titleInputRef = useRef(null);
  const contentInputRef = useRef(null);
  const autoSaveRef = useRef(null);
  const toolbarTimeoutRef = useRef(null);

  // Handle when chapter changes (navigation to different chapter)
  useEffect(() => {
    setChapter(initialChapter);
    setContent(htmlToText(initialChapter.content || ''));
    setTitle(initialChapter.title || '');
    setHasUnsavedChanges(false);
  }, [initialChapter.id]);

  useEffect(() => {
    navigation.setOptions({
      headerShown: !isFullscreen,
      headerTitle: () => (
        <TouchableOpacity onPress={() => setIsFullscreen(!isFullscreen)} style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title || 'Untitled Chapter'}
          </Text>
          {hasUnsavedChanges && <View style={styles.unsavedDot} />}
        </TouchableOpacity>
      ),
      headerRight: () => (
        <View style={styles.headerActions}>
          {saving && <ActivityIndicator size="small" color="#fff" style={styles.savingIndicator} />}
          <Text style={styles.wordCountHeader}>{wordCount}</Text>
        </View>
      ),
    });
  }, [title, saving, hasUnsavedChanges, wordCount, isFullscreen]);

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

  const showToolbar = () => {
    setIsToolbarVisible(true);
    
    // Clear existing timeout
    if (toolbarTimeoutRef.current) {
      clearTimeout(toolbarTimeoutRef.current);
    }
    
    // Hide toolbar after 3 seconds of inactivity
    toolbarTimeoutRef.current = setTimeout(() => {
      setIsToolbarVisible(false);
    }, 3000);
  };

  const hideToolbar = () => {
    setIsToolbarVisible(false);
    if (toolbarTimeoutRef.current) {
      clearTimeout(toolbarTimeoutRef.current);
    }
  };

  const handleAutoSave = async () => {
    if (!hasUnsavedChanges) return;
    
    try {
      await ApiService.updateChapter(chapter.id, {
        title: title,
        content: textToHtml(content),
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
        content: textToHtml(content),
      });
      
      if (response.success) {
        setChapter(response.chapter);
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      console.log('Save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  const formatText = (format) => {
    const selection = contentInputRef.current?.selectionStart || content.length;
    let newContent = content;
    
    switch (format) {
      case 'bold':
        newContent = content.slice(0, selection) + '**bold text**' + content.slice(selection);
        break;
      case 'italic':
        newContent = content.slice(0, selection) + '*italic text*' + content.slice(selection);
        break;
      case 'bullet':
        newContent = content.slice(0, selection) + '\n• ' + content.slice(selection);
        break;
    }
    
    setContent(newContent);
    showToolbar();
  };

  const renderMinimalToolbar = () => (
    <View style={[styles.toolbar, { opacity: isToolbarVisible ? 1 : 0 }]}>
      <TouchableOpacity
        style={styles.toolbarButton}
        onPress={() => formatText('bold')}
      >
        <Ionicons name="text-outline" size={20} color={theme.colors.onSurface} />
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.toolbarButton}
        onPress={() => formatText('italic')}
      >
        <Text style={styles.toolbarButtonText}>I</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.toolbarButton}
        onPress={() => formatText('bullet')}
      >
        <Ionicons name="list" size={20} color={theme.colors.onSurface} />
      </TouchableOpacity>
      
      <View style={styles.toolbarSpacer} />
      
      <TouchableOpacity
        style={styles.toolbarButton}
        onPress={() => setIsFullscreen(!isFullscreen)}
      >
        <Ionicons 
          name={isFullscreen ? "contract" : "expand"} 
          size={20} 
          color={theme.colors.onSurface} 
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, isFullscreen && styles.fullscreen]}>
      <StatusBar 
        hidden={isFullscreen} 
        backgroundColor={isFullscreen ? '#ffffff' : theme.colors.primary} 
        barStyle={isFullscreen ? 'dark-content' : 'light-content'}
      />
      
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={isFullscreen ? 0 : (Platform.OS === 'ios' ? 64 : 0)}
      >
        <View style={styles.editorContainer}>
          {/* Minimal Title Input */}
          {!isFullscreen && (
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
                onFocus={hideToolbar}
              />
            </View>
          )}
          
          {/* Main Content Area - Fullscreen Writing */}
          <View style={styles.contentWrapper}>
            <TextInput
              ref={contentInputRef}
              style={[styles.contentInput, isFullscreen && styles.fullscreenContent]}
              value={content}
              onChangeText={setContent}
              placeholder={isFullscreen ? "Just write..." : "Start writing your chapter..."}
              placeholderTextColor={theme.colors.outline}
              multiline
              textAlignVertical="top"
              autoCorrect
              spellCheck
              onSelectionChange={showToolbar}
              onFocus={showToolbar}
              onBlur={hideToolbar}
              scrollEnabled
            />
          </View>
          
          {/* Floating Minimal Toolbar */}
          {renderMinimalToolbar()}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  fullscreen: {
    paddingTop: 0,
  },
  keyboardView: {
    flex: 1,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    maxWidth: 180,
  },
  unsavedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ff6b6b',
    marginLeft: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  savingIndicator: {
    marginRight: 4,
  },
  wordCountHeader: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
  },
  editorContainer: {
    flex: 1,
    position: 'relative',
  },
  titleContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e5e5',
  },
  titleInput: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1a1a1a',
    lineHeight: 28,
    minHeight: 28,
  },
  contentWrapper: {
    flex: 1,
  },
  contentInput: {
    flex: 1,
    fontSize: 17,
    lineHeight: 26,
    color: '#1a1a1a',
    paddingHorizontal: 24,
    paddingVertical: 20,
    fontFamily: Platform.OS === 'ios' ? 'Charter' : 'serif',
  },
  fullscreenContent: {
    paddingTop: 40,
    fontSize: 18,
    lineHeight: 28,
  },
  toolbar: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    alignItems: 'center',
  },
  toolbarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  toolbarButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    fontStyle: 'italic',
    color: theme.colors.onSurface,
  },
  toolbarSpacer: {
    flex: 1,
  },
});

export default EditorScreen;