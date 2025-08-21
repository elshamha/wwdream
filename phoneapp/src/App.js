
import React, { useEffect, useState } from 'react';
import ProjectForm from './ProjectForm';
import DocumentForm from './DocumentForm';
import NotificationPanel from './NotificationPanel';
import FileUpload from './FileUpload';
import ProfileEdit from './ProfileEdit';
import ProgressTracker from './ProgressTracker';
import AdvancedStats from './AdvancedStats';
import ChapterForm from './ChapterForm';
import CommentPanel from './CommentPanel';
import './App.css';
import './modern-mobile.css';
import Login from './Login';
import Register from './Register';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';
import Reminders from './Reminders';
import AnalyticsDashboard from './AnalyticsDashboard';
import AIAssistantPanel from './AIAssistantPanel';
import AdvancedAIPanel from './AdvancedAIPanel';
import MoreAIFeaturesPanel from './MoreAIFeaturesPanel';
import CustomAIPromptPanel from './CustomAIPromptPanel';
import AdvancedCustomAIPromptPanel from './AdvancedCustomAIPromptPanel';
import MobileTabBar from './MobileTabBar';
import FloatingActionButton from './FloatingActionButton';
import FaxPanel from './FaxPanel';
import DocumentTemplateSelector from './DocumentTemplateSelector';
import EditProjectForm from './EditProjectForm';
import EditDocumentForm from './EditDocumentForm';

function App() {
  const [showFax, setShowFax] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');
  const [templateContent, setTemplateContent] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.body.className = darkMode ? 'dark-mode' : '';
  }, [darkMode]);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState({ username: '', email: '', first_name: '', last_name: '' });
  const [projects, setProjects] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [editingProject, setEditingProject] = useState(null);
  const [editingDocument, setEditingDocument] = useState(null);

  useEffect(() => {
    if (!token) return;
    fetch('http://127.0.0.1:8000/api/endpoint/', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });

    fetch('http://127.0.0.1:8000/api/users/', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => {
        if (!response.ok) throw new Error('Failed to fetch user info');
        return response.json();
      })
      .then((userData) => {
        setUserInfo({
          username: userData.username || '',
          email: userData.email || '',
          first_name: userData.first_name || '',
          last_name: userData.last_name || ''
        });
        fetchProjects();
        fetchDocuments();
      })
      .catch(() => {
        setUserInfo({ username: '', email: '', first_name: '', last_name: '' });
      });
  }, [token]);

  function fetchProjects() {
    fetch('http://127.0.0.1:8000/api/projects/', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => setProjects(data.results || data))
      .catch(() => setProjects([]));
  }

  function fetchDocuments() {
    fetch('http://127.0.0.1:8000/api/documents/', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => setDocuments(data.results || data))
      .catch(() => setDocuments([]));
  }

  function handleProjectCreate() {
    fetchProjects();
  }
  function handleProjectDelete(id) {
    fetch(`http://127.0.0.1:8000/api/projects/${id}/`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => fetchProjects());
  }
  function handleProjectEdit(project) {
    setEditingProject(project);
  }
  function handleProjectUpdate(updated) {
    fetch(`http://127.0.0.1:8000/api/projects/${updated.id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updated)
    })
      .then(() => {
        setEditingProject(null);
        fetchProjects();
      });
  }

  function handleDocumentCreate() {
    fetchDocuments();
  }
  function handleDocumentDelete(id) {
    fetch(`http://127.0.0.1:8000/api/documents/${id}/`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => fetchDocuments());
  }
  function handleDocumentEdit(doc) {
    setEditingDocument(doc);
  }
  function handleDocumentUpdate(updated) {
    fetch(`http://127.0.0.1:8000/api/documents/${updated.id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updated)
    })
      .then(() => {
        setEditingDocument(null);
        fetchDocuments();
      });
  }

  const handleLogin = (newToken) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route
            path="/login"
            element={<Login onLogin={handleLogin} />}
          />
          <Route
            path="/register"
            element={<Register />}
          />
          <Route
            path="/"
            element={
              token ? (
                <div className="App">
                  <header className="App-header">
                    <h1 style={{marginBottom:16}}>Atticus Writer Mobile</h1>
                    <button style={{position:'absolute',top:16,right:16,background:darkMode?'#222':'#fff',color:darkMode?'#fff':'#222',border:'1px solid #cce',borderRadius:8,padding:'6px 14px',fontSize:'0.95em',zIndex:10}} onClick={()=>setDarkMode(dm=>!dm)}>
                      {darkMode ? 'Light Mode' : 'Dark Mode'}
                    </button>
                    {userInfo.username && (
                      <div className="card" style={{margin:'18px 0',padding:'16px',textAlign:'left'}}>
                        <span style={{fontWeight:600}}>Logged in as <strong>{userInfo.username}</strong></span>
                        <button style={{marginLeft:20,background:'var(--danger)',color:'#fff'}} onClick={handleLogout}>Logout</button>
                        <div style={{marginTop:10, fontSize:'0.95em'}}>
                          <div>Email: {userInfo.email}</div>
                          <div>Name: {userInfo.first_name} {userInfo.last_name}</div>
                        </div>
                      </div>
                    )}
                  </header>
                  {/* Tab content */}
                  {activeTab === 'Home' && (
                    <div className="card" style={{margin:'24px 0',padding:'18px'}}>
                      <div style={{textAlign:'center',marginBottom:18}}>
                        <a href="https://your-webapp-url.com" target="_blank" rel="noopener noreferrer" style={{display:'inline-block',padding:'12px 28px',background:'var(--primary)',color:'#fff',borderRadius:12,fontWeight:700,fontSize:'1.1em',boxShadow:'0 2px 8px #cce',textDecoration:'none',transition:'background 0.2s'}}>
                          🌐 Open Full Web App
                        </a>
                      </div>
                      <ProfileEdit token={token} userInfo={userInfo} onUpdated={updated => setUserInfo({...userInfo, ...updated})} />
                      <ProgressTracker token={token} />
                      <AdvancedStats token={token} />
                      <AnalyticsDashboard token={token} />
                      <button style={{margin:'18px auto',display:'block',background:'var(--accent)',color:'#fff',border:'none',borderRadius:8,padding:'10px 24px',fontWeight:700,fontSize:'1em',boxShadow:'0 2px 8px #cce',cursor:'pointer'}} onClick={()=>setShowFax(s=>!s)}>
                        {showFax ? 'Hide Fax Panel' : 'Send a Fax'}
                      </button>
                      {showFax && <FaxPanel token={token} />}
                    </div>
                  )}
                  {activeTab === 'Reminders' && <Reminders token={token} />}
                  {activeTab === 'AI' && (
                    <>
                      <AIAssistantPanel />
                      <AdvancedAIPanel />
                      <MoreAIFeaturesPanel />
                      <CustomAIPromptPanel />
                      <AdvancedCustomAIPromptPanel />
                    </>
                  )}
                  {activeTab === 'Projects' && (
                    <div style={{marginTop:20}}>
                      <h3>Your Projects</h3>
                      <ProjectForm token={token} onCreated={handleProjectCreate} />
                      {editingProject && (
                        <EditProjectForm
                          project={editingProject}
                          onUpdate={handleProjectUpdate}
                          onCancel={() => setEditingProject(null)}
                        />
                      )}
                      {projects.length === 0 ? (
                        <div>No projects found.</div>
                      ) : (
                        <ul>
                          {projects.map((proj) => (
                            <li key={proj.id} style={{marginBottom:20}}>
                              <strong>{proj.title}</strong> - {proj.description}
                              <button style={{marginLeft:10}} onClick={() => handleProjectEdit(proj)}>Edit</button>
                              <button style={{marginLeft:5}} onClick={() => handleProjectDelete(proj.id)}>Delete</button>
                              {/* Chapter Management */}
                              <div style={{marginTop:10, marginLeft:20}}>
                                <ChapterForm token={token} projectId={proj.id} onCreated={() => {}} />
                                {/* List chapters for this project (placeholder) */}
                                {/* You can fetch and display chapters here */}
                                {/* Collaboration: Comments for first chapter (example) */}
                                <CommentPanel token={token} chapterId={proj.first_chapter_id || ''} />
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                  {activeTab === 'Documents' && (
                    <div style={{marginTop:20}}>
                      <h3>Your Documents</h3>
                      <DocumentTemplateSelector onSelect={setTemplateContent} />
                      <DocumentForm token={token} projects={projects} onCreated={handleDocumentCreate} initialContent={templateContent} />
                      {editingDocument && (
                        <EditDocumentForm
                          document={editingDocument}
                          projects={projects}
                          onUpdate={handleDocumentUpdate}
                          onCancel={() => setEditingDocument(null)}
                        />
                      )}
                      {documents.length === 0 ? (
                        <div>No documents found.</div>
                      ) : (
                        <ul>
                          {documents.map((doc) => (
                            <li key={doc.id}>
                              <strong>{doc.title}</strong> - {doc.is_published ? 'Published' : 'Draft'}
                              <button style={{marginLeft:10}} onClick={() => handleDocumentEdit(doc)}>Edit</button>
                              <button style={{marginLeft:5}} onClick={() => handleDocumentDelete(doc.id)}>Delete</button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                  {activeTab === 'Profile' && (
                    <div style={{marginTop:20}}>
                      <ProfileEdit token={token} userInfo={userInfo} onUpdated={updated => setUserInfo({...userInfo, ...updated})} />
                    </div>
                  )}
                  <MobileTabBar active={activeTab} onTab={setActiveTab} />
                  <FloatingActionButton onClick={()=>alert('Quick Create! (Implement action)')} label="Create" icon="➕" />
                  {/* ...existing code... */}
                  {loading && <p>Loading...</p>}
                  {error && <p style={{color:'red'}}>Error: {error}</p>}
                  {data && (
                    <div style={{marginTop:20}}>
                      <strong>API Response:</strong>
                      <pre>{JSON.stringify(data, null, 2)}</pre>
                    </div>
                  )}
                </div>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
