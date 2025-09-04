import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { View, ActivityIndicator } from 'react-native';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import BookshelfScreen from './src/screens/BookshelfScreen';
import NewProjectScreen from './src/screens/NewProjectScreen';
import EditorScreen from './src/screens/EditorScreen';
import ChapterListScreen from './src/screens/ChapterListScreen';

const Stack = createStackNavigator();

function AuthStack() {
  const { theme } = useTheme();
  
  return (
    <Stack.Navigator 
      initialRouteName="Login"
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen} 
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function MainStack() {
  const { theme } = useTheme();
  
  return (
    <Stack.Navigator 
      initialRouteName="Bookshelf"
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="Bookshelf" 
        component={BookshelfScreen}
        options={{ 
          title: 'My Bookshelf',
          headerLeft: null,
          gestureEnabled: false
        }}
      />
      <Stack.Screen 
        name="NewProject" 
        component={NewProjectScreen}
        options={{ title: 'New Book' }}
      />
      <Stack.Screen 
        name="ChapterList" 
        component={ChapterListScreen}
        options={{ title: 'Chapters' }}
      />
      <Stack.Screen 
        name="Editor" 
        component={EditorScreen}
        options={{ title: 'Editor' }}
      />
    </Stack.Navigator>
  );
}

function NavigationStack() {
  const { theme, isDarkMode } = useTheme();
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }
  
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer theme={theme}>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} backgroundColor={theme.colors.primary} />
        {isAuthenticated ? <MainStack /> : <AuthStack />}
      </NavigationContainer>
    </PaperProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NavigationStack />
      </AuthProvider>
    </ThemeProvider>
  );
}