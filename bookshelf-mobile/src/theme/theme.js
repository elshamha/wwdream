import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#667eea',
    secondary: '#764ba2',
    tertiary: '#2ebf91',
    background: '#f8f9fa',
    surface: '#ffffff',
    surfaceVariant: '#f1f3f4',
    onSurface: '#2c3e50',
    onBackground: '#2c3e50',
    outline: '#e9ecef',
    primaryContainer: 'rgba(102, 126, 234, 0.1)',
  },
  roundness: 12,
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#8b9ff7',
    secondary: '#9b6fc7',
    tertiary: '#4dd4a7',
    background: '#121212',
    surface: '#1e1e1e',
    surfaceVariant: '#2a2a2a',
    onSurface: '#e0e0e0',
    onBackground: '#e0e0e0',
    outline: '#3a3a3a',
    primaryContainer: 'rgba(139, 159, 247, 0.15)',
  },
  roundness: 12,
};

// Keep the old export for backward compatibility
export const theme = lightTheme;

export const gradients = {
  primary: ['#667eea', '#764ba2'],
  ocean: ['#1e3c72', '#2a5298'],
  forest: ['#134e5e', '#71b280'],
  sunset: ['#ff6b35', '#f7931e'],
  lavender: ['#8360c3', '#2ebf91'],
};

export const darkGradients = {
  primary: ['#4a5fc1', '#5d3f85'],
  ocean: ['#152a52', '#1e3c6e'],
  forest: ['#0e3542', '#4a7556'],
  sunset: ['#cc5429', '#c56118'],
  lavender: ['#654a96', '#1e8062'],
};