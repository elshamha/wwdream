import React, { useState, useEffect, useRef, useCallback } from 'react';
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
    
    // First, decode HTML entities
    let text = html
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, '/')
      .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
      .replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)));

    // Handle line breaks and paragraphs properly
    text = text
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<p[^>]*>/gi, '')
      .replace(/<div[^>]*>/gi, '\n')
      .replace(/<\/div>/gi, '')
      .replace(/<h[1-6][^>]*>/gi, '\n')
      .replace(/<\/h[1-6]>/gi, '\n\n');

    // Remove all remaining HTML tags
    text = text.replace(/<[^>]*>/g, '');

    // Clean up multiple spaces and formatting artifacts
    text = text
      .replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, ' ') // Replace various Unicode spaces
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n\s+/g, '\n') // Remove spaces at beginning of lines
      .replace(/\s+\n/g, '\n') // Remove spaces at end of lines
      .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newline
      .trim();

    return text;
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
    // Only reset if we're actually switching to a different chapter
    if (initialChapter.id !== chapter.id) {
      setChapter(initialChapter);
      setContent(htmlToText(initialChapter.content || ''));
      setTitle(initialChapter.title || '');
      setHasUnsavedChanges(false);
    }
  }, [initialChapter.id, chapter.id]);

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
    // Only set up auto-save, don't do other heavy operations on every content change
    setHasUnsavedChanges(true);
    
    console.log('Setting up auto-save timer - content:', content.length, 'title:', title);
    
    // Clear existing timeout
    if (autoSaveRef.current) {
      clearTimeout(autoSaveRef.current);
      console.log('Cleared existing auto-save timer');
    }
    
    // Set up auto-save after 1 second of inactivity for quick saving
    autoSaveRef.current = setTimeout(() => {
      console.log('Auto-save timer triggered');
      handleAutoSave();
    }, 1000);

    return () => {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current);
      }
    };
  }, [content, title, handleAutoSave]);

  // Separate effect for word count to avoid interference
  useEffect(() => {
    updateWordCount();
  }, [content]);

  useEffect(() => {
    // Save on component unmount if there are unsaved changes
    return () => {
      if (hasUnsavedChanges) {
        // Create a one-time save function to avoid dependency issues
        ApiService.updateChapter(chapter.id, {
          title: title,
          content: textToHtml(content),
        }).catch(error => {
          console.log('Unmount save failed:', error);
        });
      }
    };
  }, [hasUnsavedChanges, chapter.id, title, content]);

  const updateWordCount = () => {
    const words = content.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  };

  const handleContentChange = useCallback((text) => {
    console.log('Text changed, length:', text.length);
    setContent(text);
  }, []);

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

  const handleAutoSave = useCallback(async () => {
    // Capture current values to avoid stale closures
    const currentTitle = title;
    const currentContent = content;
    const currentChapterId = chapter.id;
    
    // Check if there are actual changes compared to initial chapter data
    const originalTitle = initialChapter.title || '';
    const originalContent = htmlToText(initialChapter.content || '');
    const titleChanged = currentTitle !== originalTitle;
    const contentChanged = originalContent !== currentContent;
    const hasActualChanges = titleChanged || contentChanged;
    
    console.log('Auto-save comparison:');
    console.log('  Current title:', currentTitle);
    console.log('  Original title:', originalTitle);
    console.log('  Current content:', currentContent);
    console.log('  Original content:', originalContent);
    console.log('  Title changed:', titleChanged);
    console.log('  Content changed:', contentChanged);
    
    if (!hasActualChanges) {
      console.log('Skipping auto-save - no actual changes detected');
      return;
    }
    
    try {
      console.log('Auto-saving chapter:', currentChapterId);
      console.log('Content length:', currentContent.length);
      console.log('Content preview:', currentContent.substring(0, 100));
      console.log('Title:', currentTitle);
      
      const response = await ApiService.updateChapter(currentChapterId, {
        title: currentTitle,
        content: textToHtml(currentContent),
      });
      
      console.log('Auto-save successful:', response);
      
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.log('Auto-save failed:', error);
    }
  }, [title, content, chapter.id, initialChapter]); // Add dependencies to get fresh values

  const handleManualSave = async () => {
    setSaving(true);
    
    try {
      console.log('Manual save - Chapter:', chapter.id);
      console.log('Manual save - Content length:', content.length);
      console.log('Manual save - Title:', title);
      
      const response = await ApiService.updateChapter(chapter.id, {
        title: title,
        content: textToHtml(content),
      });
      
      console.log('Manual save response:', response);
      
      if (response && (response.success || response.id)) {
        // Don't update chapter state here to avoid triggering navigation effects
        // The data is already saved to the backend, and will be refreshed on next load
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        console.log('Manual save completed successfully');
      }
    } catch (error) {
      console.log('Manual save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  const formatText = (format) => {
    const selection = contentInputRef.current?.selectionStart || content.length;
    let newContent = content;
    
    switch (format) {
      case 'bullet':
        // Add bullet point at cursor position
        const beforeCursor = content.slice(0, selection);
        const afterCursor = content.slice(selection);
        
        // If we're at the beginning of a line or after a newline, don't add extra newline
        const needsNewline = beforeCursor.length > 0 && !beforeCursor.endsWith('\n');
        newContent = beforeCursor + (needsNewline ? '\n• ' : '• ') + afterCursor;
        break;
    }
    
    setContent(newContent);
    showToolbar();
  };

  const renderMinimalToolbar = () => (
    <View style={[styles.toolbar, { opacity: isToolbarVisible ? 1 : 0 }]}>
      <TouchableOpacity
        style={styles.toolbarButton}
        onPress={() => formatText('bullet')}
      >
        <Ionicons name="list" size={20} color={theme.colors.onSurface} />
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.toolbarButton}
        onPress={handleManualSave}
      >
        <Ionicons name="save" size={20} color={theme.colors.onSurface} />
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
              key={`chapter-${chapter.id}`}
              ref={contentInputRef}
              style={[styles.contentInput, isFullscreen && styles.fullscreenContent]}
              value={content}
              onChangeText={handleContentChange}
              placeholder={isFullscreen ? "Just write..." : "Start writing your chapter..."}
              placeholderTextColor={theme.colors.outline}
              multiline={true}
              textAlignVertical="top"
              autoCorrect={true}
              spellCheck={true}
              onFocus={showToolbar}
              onBlur={hideToolbar}
              scrollEnabled={true}
              editable={true}
              selectTextOnFocus={false}
              blurOnSubmit={false}
              returnKeyType="default"
              clearTextOnFocus={false}
              enablesReturnKeyAutomatically={false}
              keyboardType="default"
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