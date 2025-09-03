import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider } from './src/context/AuthContext';
import { theme } from './src/theme/theme';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import BookshelfScreen from './src/screens/BookshelfScreen';
import EditorScreen from './src/screens/EditorScreen';
import ChapterListScreen from './src/screens/ChapterListScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="auto" backgroundColor="#667eea" />
          <Stack.Navigator 
            initialRouteName="Login"
            screenOptions={{
              headerStyle: {
                backgroundColor: '#667eea',
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
        </NavigationContainer>
      </AuthProvider>
    </PaperProvider>
  );
}