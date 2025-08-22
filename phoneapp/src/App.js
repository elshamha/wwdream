
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
import CompactSection from './CompactSection';

function App() {
  const [showFax, setShowFax] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');
  const [templateContent, setTemplateContent] = useState('');
  const [darkMode, setDarkMode] = useState(true); // Default to dark mode for better text visibility

  useEffect(() => {
    document.body.className = darkMode ? 'dark-mode' : '';
  }, [darkMode]);
  const [token, setToken] = useState(localStorage.getItem('token') || 'demo-token');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isDemoMode = !localStorage.getItem('token');
  const [userInfo, setUserInfo] = useState({ username: '', email: '', first_name: '', last_name: '' });
  const [projects, setProjects] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [editingProject, setEditingProject] = useState(null);
  const [editingDocument, setEditingDocument] = useState(null);

  useEffect(() => {
    if (!token) return;
    
    if (isDemoMode) {
      // Demo mode with mock data
      setTimeout(() => {
        setUserInfo({
          username: 'demo_user',
          email: 'demo@example.com',
          first_name: 'Demo',
          last_name: 'User'
        });
        setProjects([
          { id: 1, title: 'My First Novel', description: 'A thrilling adventure story' },
          { id: 2, title: 'Poetry Collection', description: 'Personal poems and thoughts' }
        ]);
        setDocuments([
          { id: 1, title: 'Chapter 1: The Beginning', is_published: false },
          { id: 2, title: 'Character Outline', is_published: true }
        ]);
        setData({ message: 'Demo mode active', status: 'connected' });
        setLoading(false);
      }, 1000);
      return;
    }
    
    const controller = new AbortController();
    
    Promise.all([
      fetch('http://127.0.0.1:8000/api/endpoint/', {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal
      }),
      fetch('http://127.0.0.1:8000/api/users/', {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal
      })
    ])
    .then(async ([endpointResponse, usersResponse]) => {
      if (!endpointResponse.ok) {
        if (endpointResponse.status === 401) {
          handleLogout();
          throw new Error('Session expired. Please log in again.');
        }
        console.warn('API endpoint not available');
      }
      
      if (!usersResponse.ok) {
        throw new Error('Failed to fetch user info');
      }
      
      const [endpointData, userData] = await Promise.all([
        endpointResponse.ok ? endpointResponse.json() : null,
        usersResponse.json()
      ]);
      
      if (endpointData) {
        setData(endpointData);
      }
      
      setUserInfo({
        username: userData.username || '',
        email: userData.email || '',
        first_name: userData.first_name || '',
        last_name: userData.last_name || ''
      });
      
      setLoading(false);
      fetchProjects();
      fetchDocuments();
    })
    .catch((err) => {
      if (err.name === 'AbortError') return;
      console.warn('API request failed:', err.message);
      setError(`Unable to connect to server. ${err.message.includes('Failed to fetch') ? 'Please check if the server is running at http://127.0.0.1:8000' : err.message}`);
      setLoading(false);
      setUserInfo({ username: '', email: '', first_name: '', last_name: '' });
    });
    
    return () => controller.abort();
  }, [token, isDemoMode]);

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
                    <button 
                      className="theme-toggle"
                      style={{
                        position:'absolute',
                        top:20,
                        right:20,
                        background: 'var(--surface)',
                        color: 'var(--text)',
                        border:'1px solid var(--glass-border)',
                        borderRadius: 'var(--border-radius)',
                        padding:'10px 18px',
                        fontSize:'0.9em',
                        zIndex:10,
                        backdropFilter: 'var(--backdrop-blur)',
                        fontWeight: 500
                      }} 
                      onClick={()=>setDarkMode(dm=>!dm)}
                    >
                      {darkMode ? '○ Light' : '● Dark'}
                    </button>
                    {userInfo.username && (
                      <div className="card" style={{margin:'18px 0',padding:'16px',textAlign:'left'}}>
                        <span style={{fontWeight:600}}>Logged in as <strong>{userInfo.username}</strong></span>
                        <button className="danger" style={{marginLeft:20}} onClick={handleLogout}>Logout</button>
                        <div style={{marginTop:10, fontSize:'0.95em'}}>
                          <div>Email: {userInfo.email}</div>
                          <div>Name: {userInfo.first_name} {userInfo.last_name}</div>
                        </div>
                      </div>
                    )}
                  </header>
                  {/* Tab content */}
                  {activeTab === 'Home' && (
                    <div style={{padding:'12px'}}>
                      <div style={{textAlign:'center',marginBottom:16}}>
                        <a href="https://elshamha.pythonanywhere.com" target="_blank" rel="noopener noreferrer" className="web-app-link">
                          ◉ Open Full Web App
                        </a>
                      </div>
                      
                      <CompactSection title="Profile" icon="⬟" defaultExpanded={true}>
                        <ProfileEdit token={token} userInfo={userInfo} onUpdated={updated => setUserInfo({...userInfo, ...updated})} />
                      </CompactSection>
                      
                      <CompactSection title="Writing Progress" icon="▣" >
                        <ProgressTracker token={token} />
                      </CompactSection>
                      
                      <CompactSection title="Statistics" icon="◪">
                        <AdvancedStats token={token} />
                      </CompactSection>
                      
                      <CompactSection title="Analytics Dashboard" icon="▦">
                        <AnalyticsDashboard token={token} />
                      </CompactSection>
                      
                      <CompactSection title="Fax Services" icon="◯">
                        <FaxPanel token={token} />
                      </CompactSection>
                    </div>
                  )}
                  {activeTab === 'Reminders' && (
                    <div style={{padding:'12px'}}>
                      <CompactSection title="Writing Reminders" icon="◈" defaultExpanded={true}>
                        <Reminders token={token} />
                      </CompactSection>
                    </div>
                  )}
                  {activeTab === 'AI' && (
                    <div style={{padding:'12px'}}>
                      <CompactSection title="AI Assistant" icon="◇" defaultExpanded={true}>
                        <AIAssistantPanel />
                      </CompactSection>
                      
                      <CompactSection title="Advanced AI Tools" icon="◎">
                        <AdvancedAIPanel />
                      </CompactSection>
                      
                      <CompactSection title="Custom AI Prompts" icon="◐">
                        <CustomAIPromptPanel />
                      </CompactSection>
                      
                      <CompactSection title="Advanced Custom Prompts" icon="◑">
                        <AdvancedCustomAIPromptPanel />
                      </CompactSection>
                      
                      <CompactSection title="More AI Features" icon="◒">
                        <MoreAIFeaturesPanel />
                      </CompactSection>
                    </div>
                  )}
                  {activeTab === 'Projects' && (
                    <div style={{padding:'12px'}}>
                      <CompactSection title="Create New Project" icon="◊" defaultExpanded={true}>
                        <ProjectForm token={token} onCreated={handleProjectCreate} />
                      </CompactSection>
                      
                      {editingProject && (
                        <CompactSection title="Edit Project" icon="◈" defaultExpanded={true}>
                          <EditProjectForm
                            project={editingProject}
                            onUpdate={handleProjectUpdate}
                            onCancel={() => setEditingProject(null)}
                          />
                        </CompactSection>
                      )}
                      
                      <CompactSection title={`Your Projects (${projects.length})`} icon="⬢" defaultExpanded={true}>
                        {projects.length === 0 ? (
                          <div style={{textAlign:'center',color:'var(--text-muted)',padding:'20px'}}>
                            No projects yet. Create your first project above!
                          </div>
                        ) : (
                          <ul>
                            {projects.map((proj) => (
                              <li key={proj.id} style={{marginBottom:12}}>
                                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'8px'}}>
                                  <div>
                                    <strong>{proj.title}</strong>
                                    <div style={{fontSize:'0.9em',color:'var(--text-muted)'}}>{proj.description}</div>
                                  </div>
                                  <div style={{display:'flex',gap:'4px'}}>
                                    <button className="secondary" style={{padding:'6px 12px',fontSize:'0.8em'}} onClick={() => handleProjectEdit(proj)}>Edit</button>
                                    <button className="danger" style={{padding:'6px 12px',fontSize:'0.8em'}} onClick={() => handleProjectDelete(proj.id)}>Delete</button>
                                  </div>
                                </div>
                                
                                <CompactSection title="Chapters & Comments" icon="▤" defaultExpanded={false}>
                                  <ChapterForm token={token} projectId={proj.id} onCreated={() => {}} />
                                  <CommentPanel token={token} chapterId={proj.first_chapter_id || ''} />
                                </CompactSection>
                              </li>
                            ))}
                          </ul>
                        )}
                      </CompactSection>
                    </div>
                  )}
                  {activeTab === 'Documents' && (
                    <div style={{padding:'12px'}}>
                      <CompactSection title="Document Templates" icon="▥">
                        <DocumentTemplateSelector onSelect={setTemplateContent} />
                      </CompactSection>
                      
                      <CompactSection title="Create New Document" icon="◊" defaultExpanded={true}>
                        <DocumentForm token={token} projects={projects} onCreated={handleDocumentCreate} initialContent={templateContent} />
                      </CompactSection>
                      
                      {editingDocument && (
                        <CompactSection title="Edit Document" icon="◈" defaultExpanded={true}>
                          <EditDocumentForm
                            document={editingDocument}
                            projects={projects}
                            onUpdate={handleDocumentUpdate}
                            onCancel={() => setEditingDocument(null)}
                          />
                        </CompactSection>
                      )}
                      
                      <CompactSection title={`Your Documents (${documents.length})`} icon="⬛" defaultExpanded={true}>
                        {documents.length === 0 ? (
                          <div style={{textAlign:'center',color:'var(--text-muted)',padding:'20px'}}>
                            No documents yet. Create your first document above!
                          </div>
                        ) : (
                          <ul>
                            {documents.map((doc) => (
                              <li key={doc.id} style={{marginBottom:12}}>
                                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'8px'}}>
                                  <div>
                                    <strong>{doc.title}</strong>
                                    <div style={{fontSize:'0.9em',color:'var(--text-muted)'}}>
                                      {doc.is_published ? '● Published' : '○ Draft'}
                                    </div>
                                  </div>
                                  <div style={{display:'flex',gap:'4px'}}>
                                    <button className="secondary" style={{padding:'6px 12px',fontSize:'0.8em'}} onClick={() => handleDocumentEdit(doc)}>Edit</button>
                                    <button className="danger" style={{padding:'6px 12px',fontSize:'0.8em'}} onClick={() => handleDocumentDelete(doc.id)}>Delete</button>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </CompactSection>
                    </div>
                  )}
                  {activeTab === 'Profile' && (
                    <div style={{padding:'12px'}}>
                      <CompactSection title="Profile Settings" icon="⬟" defaultExpanded={true}>
                        <ProfileEdit token={token} userInfo={userInfo} onUpdated={updated => setUserInfo({...userInfo, ...updated})} />
                      </CompactSection>
                    </div>
                  )}
                  <MobileTabBar active={activeTab} onTab={setActiveTab} />
                  <FloatingActionButton onClick={()=>alert('Quick Create! (Implement action)')} label="Create" icon="◊" />
                  {loading && (
                    <div className="card" style={{textAlign:'center',margin:'24px 20px'}}>
                      <div style={{fontSize:'1.2em',marginBottom:'12px'}}>◯</div>
                      <p style={{margin:0,color:'var(--text-secondary)'}}>Loading your data...</p>
                    </div>
                  )}
                  {error && (
                    <div className="card" style={{margin:'24px 20px',background:'#fef2f2',border:'1px solid #fecaca',color:'#dc2626'}}>
                      <div style={{fontSize:'1.2em',marginBottom:'8px'}}>△ Connection Issue</div>
                      <p style={{margin:0,fontSize:'0.95em'}}>{error}</p>
                      <button 
                        className="danger"
                        style={{marginTop:'12px',padding:'8px 16px',fontSize:'0.9em'}} 
                        onClick={() => window.location.reload()}
                      >
                        Retry Connection
                      </button>
                    </div>
                  )}
                  {data && (
                    <div className="card" style={{margin:'24px 20px',fontSize:'0.9em'}}>
                      <details>
                        <summary style={{cursor:'pointer',fontWeight:600,marginBottom:'8px'}}>▣ API Response Data</summary>
                        <pre style={{fontSize:'0.8em',background:'var(--card)',padding:'12px',borderRadius:'8px',overflow:'auto'}}>{JSON.stringify(data, null, 2)}</pre>
                      </details>
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
