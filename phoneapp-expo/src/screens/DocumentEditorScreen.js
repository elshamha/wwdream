import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { documentsAPI } from '../services/api';

const DocumentEditorScreen = ({ route, navigation }) => {
  const { document } = route.params;
  const [title, setTitle] = useState(document?.title || '');
  const [content, setContent] = useState(document?.content || '');
  const [saving, setSaving] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    updateWordCount(content);
  }, [content]);

  const updateWordCount = (text) => {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a document title');
      return;
    }

    setSaving(true);
    try {
      if (document?.id) {
        await documentsAPI.updateDocument(document.id, {
          title: title.trim(),
          content: content,
        });
        Alert.alert('Success', 'Document saved successfully!');
      }
    } catch (error) {
      console.log('Error saving document:', error);
      Alert.alert('Error', 'Failed to save document');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (title !== document?.title || content !== document?.content) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. What would you like to do?',
        [
          { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
          { text: 'Save', onPress: async () => { await handleSave(); navigation.goBack(); } },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Editor</Text>
          <Text style={styles.wordCount}>{wordCount} words</Text>
        </View>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Ionicons name="save-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardView}
      >
        <View style={styles.editorContainer}>
          <TextInput
            style={styles.titleInput}
            placeholder="Document Title"
            value={title}
            onChangeText={setTitle}
            fontSize={20}
            fontWeight="bold"
          />
          
          <ScrollView style={styles.contentContainer}>
            <TextInput
              style={styles.contentInput}
              placeholder="Start writing your story..."
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
              autoFocus={!document?.content}
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.toolbarButton}>
          <Ionicons name="text-outline" size={20} color="#7F8C8D" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolbarButton}>
          <Ionicons name="list-outline" size={20} color="#7F8C8D" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolbarButton}>
          <Ionicons name="link-outline" size={20} color="#7F8C8D" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolbarButton}>
          <Ionicons name="image-outline" size={20} color="#7F8C8D" />
        </TouchableOpacity>
        <View style={styles.toolbarSpacer} />
        <TouchableOpacity style={styles.toolbarButton} onPress={() => Alert.alert('Coming Soon', 'AI writing assistance coming soon!')}>
          <Ionicons name="bulb-outline" size={20} color="#F39C12" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  backButton: {
    padding: 5,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  wordCount: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 2,
  },
  saveButton: {
    backgroundColor: '#27AE60',
    borderRadius: 8,
    padding: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#BDC3C7',
  },
  keyboardView: {
    flex: 1,
  },
  editorContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  titleInput: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  contentContainer: {
    flex: 1,
  },
  contentInput: {
    flex: 1,
    fontSize: 16,
    color: '#2C3E50',
    lineHeight: 24,
    minHeight: 400,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#F8F9FA',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  toolbarButton: {
    padding: 8,
    marginHorizontal: 5,
  },
  toolbarSpacer: {
    flex: 1,
  },
});

export default DocumentEditorScreen;