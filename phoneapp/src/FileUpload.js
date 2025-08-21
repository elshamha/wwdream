import React, { useState, useEffect } from 'react';

export default function FileUpload({ token, onUploaded }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploads, setUploads] = useState([]);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/importeddocuments/', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => setUploads(data.results || data))
      .catch(() => setUploads([]));
  }, [token]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
  };

  const handleUpload = (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file.');
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    fetch('http://127.0.0.1:8000/writer/upload-file/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    })
      .then((res) => {
        setUploading(false);
        if (!res.ok) throw new Error('Upload failed');
        return res.json();
      })
      .then((data) => {
        setFile(null);
        setError('');
        if (onUploaded) onUploaded(data);
        // Refresh upload history
        fetch('http://127.0.0.1:8000/api/importeddocuments/', {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then((res) => res.json())
          .then((data) => setUploads(data.results || data))
          .catch(() => setUploads([]));
      })
      .catch((err) => {
        setUploading(false);
        setError(err.message);
      });
  };

  return (
    <div style={{marginBottom:20}}>
      <form onSubmit={handleUpload}>
        <h4>Upload File</h4>
        <input type="file" onChange={handleFileChange} />
        <button type="submit" disabled={uploading} style={{marginLeft:10}}>
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
        {error && <div style={{color:'red'}}>{error}</div>}
      </form>
      <div style={{marginTop:20}}>
        <h5>Upload History</h5>
        {uploads.length === 0 ? (
          <div>No uploads found.</div>
        ) : (
          <ul>
            {uploads.map((up) => (
              <li key={up.id}>
                <strong>{up.title}</strong> ({up.import_type}) - {up.import_date ? up.import_date.split('T')[0] : ''}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
