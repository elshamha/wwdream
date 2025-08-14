import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, View, Text, StyleSheet, StatusBar, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';
import { Picker } from '@react-native-picker/picker';

export default function DashboardScreen() {
	const richText = useRef();
	const [editorContent, setEditorContent] = useState('');
	const [saving, setSaving] = useState(false);
	const [loading, setLoading] = useState(false);
	const [documents, setDocuments] = useState([]);
	const [chapters, setChapters] = useState([]);
	const [selectedType, setSelectedType] = useState('document');
	const [selectedId, setSelectedId] = useState(null);

	useEffect(() => {
		fetch('http://127.0.0.1:8000/api/documents/')
			.then(res => res.json())
			.then(data => setDocuments(data));
		fetch('http://127.0.0.1:8000/api/chapters/')
			.then(res => res.json())
			.then(data => setChapters(data));
	}, []);

	useEffect(() => {
		if (!selectedId) return;
		setLoading(true);
		const url = selectedType === 'document'
			? `http://127.0.0.1:8000/api/documents/${selectedId}/`
			: `http://127.0.0.1:8000/api/chapters/${selectedId}/`;
		fetch(url)
			.then(res => res.json())
			.then(data => {
				setEditorContent(data.content || '');
				setLoading(false);
				if (richText.current) richText.current.setContentHTML(data.content || '');
			})
			.catch(() => setLoading(false));
	}, [selectedType, selectedId]);

	const saveContent = async () => {
		if (!selectedId) return;
		setSaving(true);
		const payload = {
			content: editorContent,
			title: '',
		};
		if (selectedType === 'document') payload.document_id = selectedId;
		else payload.chapter_id = selectedId;
		await fetch('http://127.0.0.1:8000/api/auto_save/', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		});
		setSaving(false);
		alert('Content saved!');
	};

	return (
		<SafeAreaView style={styles.container}>
			<StatusBar barStyle="dark-content" />
			<ScrollView contentContainerStyle={styles.scrollContent}>
				<View style={styles.header}>
					<Text style={styles.title}>Writer's Web Dream</Text>
				</View>
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Select Type</Text>
					<Picker
						selectedValue={selectedType}
						style={styles.picker}
						onValueChange={setSelectedType}
					>
						<Picker.Item label="Document" value="document" />
						<Picker.Item label="Chapter" value="chapter" />
					</Picker>
					<Text style={styles.sectionTitle}>Select {selectedType === 'document' ? 'Document' : 'Chapter'}</Text>
					<Picker
						selectedValue={selectedId}
						style={styles.picker}
						onValueChange={setSelectedId}
					>
						{(selectedType === 'document' ? documents : chapters).map(item => (
							<Picker.Item key={item.id} label={item.title || `Untitled ${selectedType}`} value={item.id} />
						))}
					</Picker>
				</View>
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Rich Text Editor</Text>
					{loading ? (
						<ActivityIndicator size="large" color="#4F8EF7" />
					) : (
						<>
							<RichEditor
								ref={richText}
								style={styles.richEditor}
								placeholder="Start writing here..."
								initialContentHTML={editorContent}
								onChange={setEditorContent}
							/>
							<RichToolbar
								editor={richText}
								actions={[actions.setBold, actions.setItalic, actions.insertBulletsList, actions.insertOrderedList, actions.insertLink]}
								style={styles.richToolbar}
							/>
							<TouchableOpacity style={styles.button} onPress={saveContent} disabled={saving || !selectedId}>
								<Text style={styles.buttonText}>{saving ? 'Saving...' : 'Save'}</Text>
							</TouchableOpacity>
						</>
					)}
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
	richEditor: {
		minHeight: 150,
		borderColor: '#ddd',
		borderWidth: 1,
		borderRadius: 8,
		marginBottom: 10,
		padding: 8,
		backgroundColor: '#fff',
	},
	richToolbar: {
		borderRadius: 8,
		backgroundColor: '#f0f0f0',
		marginBottom: 10,
	},
});
