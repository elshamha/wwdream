
import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, StatusBar, ScrollView, TouchableOpacity } from 'react-native';

export default function App() {
	// Example stats, replace with API data later
	const [stats, setStats] = useState({ wordCount: 12000, streak: 5, progress: 60 });

	return (
		<SafeAreaView style={styles.container}>
			<StatusBar barStyle="dark-content" />
			<ScrollView contentContainerStyle={styles.scrollContent}>
				<View style={styles.header}>
					<Text style={styles.title}>Atticus Writer Dashboard</Text>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>My Writing Projects</Text>
					<TouchableOpacity style={styles.button}>
						<Text style={styles.buttonText}>Start New Project</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.button}>
						<Text style={styles.buttonText}>View All Projects</Text>
					</TouchableOpacity>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>My Library</Text>
					<TouchableOpacity style={styles.button}>
						<Text style={styles.buttonText}>Browse Library</Text>
					</TouchableOpacity>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Writing Stats</Text>
					<View style={styles.statsRow}>
						<View style={styles.statsItem}>
							<Text style={styles.statsLabel}>Word Count</Text>
							<Text style={styles.statsValue}>{stats.wordCount}</Text>
						</View>
						<View style={styles.statsItem}>
							<Text style={styles.statsLabel}>Streak</Text>
							<Text style={styles.statsValue}>{stats.streak} days</Text>
						</View>
						<View style={styles.statsItem}>
							<Text style={styles.statsLabel}>Goal Progress</Text>
							<Text style={styles.statsValue}>{stats.progress}%</Text>
						</View>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f8fafc',
	},
	scrollContent: {
		padding: 24,
	},
	header: {
		paddingVertical: 24,
		alignItems: 'center',
	},
	title: {
		fontSize: 28,
		fontWeight: 'bold',
		color: '#4F8EF7',
		marginBottom: 8,
	},
	section: {
		marginBottom: 32,
		backgroundColor: '#fff',
		borderRadius: 12,
		padding: 18,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.08,
		shadowRadius: 6,
		elevation: 2,
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: '600',
		color: '#333',
		marginBottom: 12,
	},
	button: {
		backgroundColor: '#4F8EF7',
		paddingVertical: 12,
		paddingHorizontal: 18,
		borderRadius: 8,
		marginBottom: 10,
		alignItems: 'center',
	},
	buttonText: {
		color: '#fff',
		fontWeight: 'bold',
		fontSize: 16,
	},
	statsRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 12,
	},
	statsItem: {
		flex: 1,
		alignItems: 'center',
	},
	statsLabel: {
		fontSize: 14,
		color: '#666',
		marginBottom: 4,
	},
	statsValue: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#4F8EF7',
	},
});
