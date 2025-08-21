import { saveAs } from 'file-saver';

export async function exportEPUB(documentId, token) {
  // Fetch EPUB from Django backend
  const res = await fetch(`http://127.0.0.1:8000/writer/api/documents/${documentId}/export_epub/`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    alert('Failed to export EPUB');
    return;
  }
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'document.epub';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
