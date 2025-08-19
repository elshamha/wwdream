import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function App() {
	return (
		<View style={styles.container}>
			<Text style={styles.title}>A Writer's Web Dream</Text>
			<Text style={styles.subtitle}>A simple starter screen</Text>
			<Button title="Get Started" onPress={() => alert('Hello!')} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#f8fafc',
	},
	title: {
		fontSize: 28,
		fontWeight: 'bold',
		color: '#4F8EF7',
		marginBottom: 12,
	},
	subtitle: {
		fontSize: 18,
		color: '#333',
		marginBottom: 24,
	},
});
