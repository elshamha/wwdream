import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Card,
  ActivityIndicator,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ApiService from '../services/api';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const { theme, gradients } = useTheme();

  useEffect(() => {
    if (isAuthenticated) {
      navigation.replace('Bookshelf');
    }
  }, [isAuthenticated]);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    setLoading(true);
    const result = await login(username, password);
    setLoading(false);

    if (result.success) {
      navigation.replace('Bookshelf');
    } else {
      Alert.alert('Login Failed', result.error);
    }
  };

  const testConnection = async () => {
    setLoading(true);
    const result = await ApiService.testConnection();
    setLoading(false);
    
    if (result.success) {
      Alert.alert('Connection Success', `Connected to server at ${result.url}`);
    } else {
      Alert.alert('Connection Failed', `Cannot connect to ${result.url}\n\nError: ${result.error}\n\nMake sure:\n1. Django server is running\n2. Your device can reach the server\n3. The URL is correct`);
    }
  };


  const styles = createStyles(theme);

  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <LinearGradient colors={gradients.primary} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>A Writer's</Text>
            <Text style={styles.subtitleText}>Web Dream</Text>
            <Text style={styles.descriptionText}>
              Edit your writing projects on the go
            </Text>
          </View>

          <Card style={styles.loginCard}>
            <Card.Content style={styles.cardContent}>
              <Text style={styles.welcomeText}>Welcome Back</Text>
              
              <TextInput
                label="Username"
                value={username}
                onChangeText={setUsername}
                style={styles.input}
                mode="outlined"
                autoCapitalize="none"
                autoCorrect={false}
                leftIcon="account"
              />

              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
                mode="outlined"
                leftIcon="lock"
              />

              <Button
                mode="contained"
                onPress={handleLogin}
                style={styles.loginButton}
                loading={loading}
                disabled={loading}
                contentStyle={styles.buttonContent}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>

              <Button
                mode="text"
                onPress={() => navigation.navigate('Register')}
                style={styles.registerButton}
                labelStyle={styles.registerButtonText}
              >
                Don't have an account? Create one
              </Button>

              <Button
                mode="text"
                onPress={testConnection}
                style={styles.registerButton}
                labelStyle={[styles.registerButtonText, { fontSize: 12, opacity: 0.7 }]}
              >
                Test Server Connection
              </Button>

              <Text style={styles.footerText}>
                Access your bookshelf projects and continue writing wherever you are
              </Text>
            </Card.Content>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitleText: {
    fontSize: 24,
    fontWeight: '300',
    color: '#ffffff',
    marginBottom: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  descriptionText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  loginCard: {
    elevation: 8,
    borderRadius: theme.roundness,
    backgroundColor: theme.colors.surface,
  },
  cardContent: {
    padding: 30,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.onSurface,
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    marginBottom: 20,
    backgroundColor: theme.colors.surface,
  },
  loginButton: {
    marginTop: 10,
    marginBottom: 20,
    backgroundColor: theme.colors.primary,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  registerButton: {
    marginBottom: 20,
  },
  registerButtonText: {
    color: theme.colors.primary,
    fontSize: 14,
  },
  footerText: {
    fontSize: 14,
    color: theme.colors.onSurface,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 20,
  },
});

export default LoginScreen;