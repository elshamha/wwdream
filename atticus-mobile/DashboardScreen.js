import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, View, Text, StyleSheet, StatusBar, ScrollView, TouchableOpacity, ActivityIndicator, Modal, FlatList, Alert } from 'react-native';
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';
import { Picker } from '@react-native-picker/picker';
import PlumeEffect from './PlumeEffect';

let ws = null;
const notificationTimeout = useRef(null);

export default function DashboardScreen() {
	const richText = useRef();
	const [editorContent, setEditorContent] = useState('');
	const [saving, setSaving] = useState(false);
	const [loading, setLoading] = useState(false);
	const [documents, setDocuments] = useState([]);
	const [chapters, setChapters] = useState([]);
	const [selectedType, setSelectedType] = useState('document');
	const [selectedId, setSelectedId] = useState(null);
	const [showShareModal, setShowShareModal] = useState(false);
	const [users, setUsers] = useState([]);
	const [selectedUsers, setSelectedUsers] = useState([]);
	// Fetch collaborators for selected document
	const [collaborators, setCollaborators] = useState([]);
	const [presence, setPresence] = useState([]);

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

	// Fetch collaborators for selected document
	useEffect(() => {
		if (selectedType === 'document' && selectedId) {
			fetch(`http://127.0.0.1:8000/writer/documents/${selectedId}/collaborators/`)
				.then(res => res.json())
				.then(data => setCollaborators(data.collaborators || []));
		} else {
			setCollaborators([]);
		}
	}, [selectedType, selectedId, showShareModal]);

	// WebSocket for live editing and presence
	useEffect(() => {
		if (selectedType === 'document' && selectedId) {
			ws = new WebSocket(`ws://127.0.0.1:8000/ws/collab/${selectedId}/`);
			ws.onopen = () => {
				// Optionally send initial presence
			};
			ws.onmessage = (e) => {
				const data = JSON.parse(e.data);
				if (data.event === 'edit') {
					setEditorContent(data.content);
				} else if (data.event === 'presence') {
					setPresence(prev => {
						if (data.action === 'joined') return [...prev, data.user];
						if (data.action === 'left') return prev.filter(u => u !== data.user);
						return prev;
					});
					showNotification(`${data.user} has ${data.action} the document.`);
				} else if (data.event === 'save') {
					showNotification(`${data.user} saved the document.`);
				} else if (data.event === 'share') {
					showNotification(`${data.user} shared the document.`);
				}
			};
			ws.onclose = () => {
				setPresence([]);
			};
			return () => {
				ws.close();
				if (notificationTimeout.current) clearTimeout(notificationTimeout.current);
			};
		}
	}, [selectedType, selectedId]);

	// Broadcast live edits
	const handleEditorChange = (content) => {
		setEditorContent(content);
		if (ws && ws.readyState === 1) {
			ws.send(JSON.stringify({ event: 'edit', content }));
		}
	};

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

	// Fetch users for sharing
	useEffect(() => {
		if (showShareModal) {
			fetch('http://127.0.0.1:8000/api/users/')
				.then(res => res.json())
				.then(data => setUsers(data));
		}
	}, [showShareModal]);

	// Share document handler
	const shareDocument = async () => {
		if (!selectedId || selectedType !== 'document') return;
		await fetch(`http://127.0.0.1:8000/writer/documents/${selectedId}/share/`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ user_ids: selectedUsers }),
			credentials: 'include',
		});
		setShowShareModal(false);
		alert('Document shared!');
	};

	const showNotification = (message) => {
		Alert.alert('Notification', message);
		// Optionally, add custom in-app notification UI here
	};

	return (
		<SafeAreaView style={styles.container}>
			<View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 120, zIndex: 10 }} pointerEvents="none">
				<PlumeEffect />
			</View>
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
					<Text style={styles.sectionTitle}>Present Collaborators:</Text>
					{presence.length === 0 ? (
						<Text style={styles.collaboratorText}>No one else is present.</Text>
					) : (
						presence.map((username, idx) => (
							<Text key={idx} style={styles.collaboratorText}>{username}</Text>
						))
					)}
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
								onChange={handleEditorChange}
							/>
							<RichToolbar
								editor={richText}
								actions={[actions.setBold, actions.setItalic, actions.insertBulletsList, actions.insertOrderedList, actions.insertLink]}
								style={styles.richToolbar}
							/>
							<TouchableOpacity style={styles.button} onPress={saveContent} disabled={saving || !selectedId}>
								<Text style={styles.buttonText}>{saving ? 'Saving...' : 'Save'}</Text>
							</TouchableOpacity>
							{selectedType === 'document' && selectedId && (
								<>
									<TouchableOpacity style={styles.shareButton} onPress={() => setShowShareModal(true)}>
										<Text style={styles.shareButtonText}>Share</Text>
									</TouchableOpacity>
									<View style={styles.collaboratorsContainer}>
										<Text style={styles.sectionTitle}>Collaborators:</Text>
										{collaborators.length === 0 ? (
											<Text style={styles.collaboratorText}>No collaborators yet.</Text>
										) : (
											collaborators.map((username, idx) => (
												<Text key={idx} style={styles.collaboratorText}>{username}</Text>
											))
										)}
									</View>
								</>
							)}
						</>
					)}
				</View>
			</ScrollView>
			{/* Share Modal */}
			<Modal visible={showShareModal} animationType="slide" transparent={true}>
				<View style={styles.modalContainer}>
					<View style={styles.modalContent}>
						<Text style={styles.sectionTitle}>Share Document</Text>
						<FlatList
							data={users}
							keyExtractor={item => item.id.toString()}
							renderItem={({ item }) => (
								<TouchableOpacity
									style={selectedUsers.includes(item.id) ? styles.userSelected : styles.userItem}
									onPress={() => {
										setSelectedUsers(selectedUsers.includes(item.id)
											? selectedUsers.filter(id => id !== item.id)
											: [...selectedUsers, item.id]);
									}}
								>
									<Text>{item.username}</Text>
								</TouchableOpacity>
							)}
						/>
						<TouchableOpacity style={styles.button} onPress={shareDocument}>
							<Text style={styles.buttonText}>Share</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.button} onPress={() => setShowShareModal(false)}>
							<Text style={styles.buttonText}>Cancel</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
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
		backgroundColor: '#e3f2fd',
		borderBottomWidth: 1,
		borderBottomColor: '#90caf9',
		marginBottom: 16,
		shadowColor: '#1976d2',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.10,
		shadowRadius: 4,
		elevation: 3,
	},
	title: {
		fontSize: 30,
		fontWeight: 'bold',
		color: '#1976d2',
		marginBottom: 4,
		letterSpacing: 1,
	},
	section: {
		marginBottom: 32,
		backgroundColor: '#fff',
		borderRadius: 14,
		padding: 20,
		shadowColor: '#1976d2',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.07,
		shadowRadius: 6,
		elevation: 2,
		borderWidth: 1,
		borderColor: '#e3f2fd',
	},
	sectionTitle: {
		fontSize: 21,
		fontWeight: '600',
		color: '#1976d2',
		marginBottom: 14,
		letterSpacing: 0.5,
	},
	button: {
		backgroundColor: '#1976d2',
		paddingVertical: 13,
		paddingHorizontal: 20,
		borderRadius: 10,
		marginBottom: 10,
		alignItems: 'center',
		shadowColor: '#1976d2',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.10,
		shadowRadius: 2,
		elevation: 2,
	},
	buttonText: {
		color: '#fff',
		fontWeight: 'bold',
		fontSize: 17,
		letterSpacing: 0.5,
	},
	richEditor: {
		minHeight: 170,
		borderColor: '#90caf9',
		borderWidth: 1,
		borderRadius: 10,
		marginBottom: 12,
		padding: 10,
		backgroundColor: '#fff',
	},
	richToolbar: {
		borderRadius: 10,
		backgroundColor: '#e3f2fd',
		marginBottom: 12,
		borderWidth: 1,
		borderColor: '#90caf9',
	},
	shareButton: {
		backgroundColor: '#4F8EF7',
		paddingVertical: 8,
		paddingHorizontal: 16,
		borderRadius: 8,
		alignSelf: 'flex-end',
		marginTop: 8,
	},
	shareButtonText: {
		color: '#fff',
		fontWeight: 'bold',
		fontSize: 16,
	},
	modalContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0,0,0,0.3)',
	},
	modalContent: {
		backgroundColor: '#fff',
		padding: 24,
		borderRadius: 12,
		width: '80%',
		alignItems: 'center',
	},
	userItem: {
		padding: 10,
		borderRadius: 8,
		backgroundColor: '#f0f0f0',
		marginVertical: 4,
		width: '100%',
	},
	userSelected: {
		padding: 10,
		borderRadius: 8,
		backgroundColor: '#4F8EF7',
		marginVertical: 4,
		width: '100%',
	},
	collaboratorsContainer: {
		marginTop: 12,
		backgroundColor: '#f0f0f0',
		borderRadius: 8,
		padding: 10,
	},
	presenceContainer: {
		marginTop: 12,
		backgroundColor: '#e0f7fa',
		borderRadius: 8,
		padding: 10,
		flexDirection: 'row',
		flexWrap: 'wrap',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: '#b2ebf2',
		minHeight: 48,
	},
	collaboratorText: {
		fontSize: 15,
		color: '#1976d2',
		marginBottom: 6,
		marginRight: 10,
		backgroundColor: '#e3f2fd',
		borderRadius: 16,
		paddingHorizontal: 14,
		paddingVertical: 7,
		shadowColor: '#1976d2',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.12,
		shadowRadius: 2,
		elevation: 2,
		borderWidth: 1,
		borderColor: '#90caf9',
	},
});
