import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Card,
  ActivityIndicator,
  Chip,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import ApiService from '../services/api';

const GENRES = [
  'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Sci-Fi', 'Fantasy',
  'Thriller', 'Biography', 'History', 'Self-Help', 'Poetry', 'Drama'
];

const NewProjectScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [targetWordCount, setTargetWordCount] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme, gradients } = useTheme();

  const styles = createStyles(theme);

  const handleCreateProject = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for your book');
      return;
    }

    setLoading(true);
    try {
      const projectData = {
        title: title.trim(),
        description: description.trim(),
        genre: selectedGenre,
        target_word_count: targetWordCount ? parseInt(targetWordCount) : 50000,
        show_on_dashboard: true,
      };

      const newProject = await ApiService.createProject(projectData);
      
      Alert.alert(
        'Success!', 
        'Your new book project has been created.',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error creating project:', error);
      Alert.alert('Error', 'Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient colors={gradients.primary} style={styles.header}>
        <Text style={styles.headerTitle}>Create New Book</Text>
        <Text style={styles.headerSubtitle}>Start your writing journey</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.formCard}>
          <Card.Content style={styles.cardContent}>
            <TextInput
              label="Book Title *"
              value={title}
              onChangeText={setTitle}
              style={styles.input}
              mode="outlined"
              placeholder="Enter your book title"
            />

            <TextInput
              label="Description"
              value={description}
              onChangeText={setDescription}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={4}
              placeholder="Describe your book (optional)"
            />

            <Text style={styles.sectionTitle}>Genre</Text>
            <View style={styles.genreContainer}>
              {GENRES.map((genre) => (
                <Chip
                  key={genre}
                  mode={selectedGenre === genre ? 'flat' : 'outlined'}
                  selected={selectedGenre === genre}
                  onPress={() => setSelectedGenre(genre)}
                  style={styles.genreChip}
                  textStyle={styles.genreText}
                >
                  {genre}
                </Chip>
              ))}
            </View>

            <TextInput
              label="Target Word Count"
              value={targetWordCount}
              onChangeText={setTargetWordCount}
              style={styles.input}
              mode="outlined"
              keyboardType="numeric"
              placeholder="e.g., 50000 (optional)"
            />

            <Button
              mode="contained"
              onPress={handleCreateProject}
              style={styles.createButton}
              loading={loading}
              disabled={loading}
              contentStyle={styles.buttonContent}
            >
              {loading ? 'Creating...' : 'Create Book'}
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  formCard: {
    margin: 20,
    elevation: 4,
    borderRadius: theme.roundness,
  },
  cardContent: {
    padding: 24,
  },
  input: {
    marginBottom: 20,
    backgroundColor: theme.colors.surface,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: 12,
  },
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 8,
  },
  genreChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  genreText: {
    fontSize: 14,
  },
  createButton: {
    marginTop: 20,
    backgroundColor: theme.colors.primary,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});

export default NewProjectScreen;