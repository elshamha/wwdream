import { MD3LightTheme } from 'react-native-paper';

export const theme = {
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
  },
  roundness: 12,
};

export const gradients = {
  primary: ['#667eea', '#764ba2'],
  ocean: ['#1e3c72', '#2a5298'],
  forest: ['#134e5e', '#71b280'],
  sunset: ['#ff6b35', '#f7931e'],
  lavender: ['#8360c3', '#2ebf91'],
};