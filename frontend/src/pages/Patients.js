import { useState, useEffect } from 'react';
import API from '../services/api';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  // ✅ File upload states
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState('report');
  const [files, setFiles] = useState([]);
  const [fileMessage, setFileMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showFiles, setShowFiles] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (search.trim() === '') {
      setFiltered(patients);
    } else {
      const result = patients.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.phone.includes(search)
      );
      setFiltered(result);
    }
  }, [search, patients]);

  const fetchPatients = async () => {
    try {
      const response = await API.get('/patients/');
      const data = response.data.data || response.data;
      setPatients(Array.isArray(data) ? data : []);
      setFiltered(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log('Error:', err);
      setPatients([]);
      setFiltered([]);
    }
  };

  const fetchFiles = async (patientId, cat = '') => {
    try {
      const url = cat
        ? `/patients/${patientId}/files?category=${cat}`
        : `/patients/${patientId}/files`;
      const response = await API.get(url);
      const data = response.data.data || response.data;
      setFiles(Array.isArray(data) ? data : []);
    } catch (err) {
      setFiles([]);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name || !age || !phone) {
      setMessage('⚠️ Please fill all fields!');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    if (parseInt(age) <= 0) {
      setMessage('⚠️ Age must be greater than 0!');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    try {
      const response = await API.post('/patients/', {
        name, age: parseInt(age), phone
      });
      setMessage('✅ Patient added successfully!');
      setName(''); setAge(''); setPhone('');
      fetchPatients();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('❌ Error: ' + JSON.stringify(err.response?.data?.detail));
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/patients/${id}`);
      setMessage('✅ Patient deleted!');
      if (selectedPatient?.id === id) {
        setSelectedPatient(null);
        setShowFiles(false);
      }
      fetchPatients();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('❌ Error deleting patient!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // ✅ Open files section for a patient
  const handleManageFiles = (patient) => {
    setSelectedPatient(patient);
    setShowFiles(true);
    setFiles([]);
    setFilterCategory('');
    fetchFiles(patient.id);
  };

  // ✅ Upload file
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setFileMessage('⚠️ Please select a file!');
      setTimeout(() => setFileMessage(''), 3000);
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      // ✅ Fixed URL
      let url = '';
      if (category === 'prescription') {
        url = `/patients/${selectedPatient.id}/upload/prescription`;
      } else {
        url = `/patients/${selectedPatient.id}/upload`;
      }

      const response = await API.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      console.log('Upload response:', response.data);
      setFileMessage('✅ File uploaded successfully!');
      setFile(null);
      document.getElementById('fileInput').value = '';
      fetchFiles(selectedPatient.id, filterCategory);
      setTimeout(() => setFileMessage(''), 3000);

    } catch (err) {
      console.log('Upload error:', err.response?.data);
      const errorMsg = err.response?.data?.detail || 'Upload failed';
      setFileMessage('❌ ' + JSON.stringify(errorMsg));
      setTimeout(() => setFileMessage(''), 5000);
    }
    setLoading(false);
  };

  // ✅ Download file
  const handleDownload = async (fileId, filename) => {
    try {
      const response = await API.get(
        `/patients/${selectedPatient.id}/files/${fileId}/download`,
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setFileMessage('✅ File downloaded!');
      setTimeout(() => setFileMessage(''), 3000);
    } catch (err) {
      setFileMessage('❌ Download failed!');
      setTimeout(() => setFileMessage(''), 3000);
    }
  };

  // ✅ Delete file
  const handleDeleteFile = async (fileId) => {
    try {
      await API.delete(`/patients/${selectedPatient.id}/files/${fileId}`);
      setFileMessage('✅ File deleted!');
      fetchFiles(selectedPatient.id, filterCategory);
      setTimeout(() => setFileMessage(''), 3000);
    } catch (err) {
      setFileMessage('❌ Delete failed!');
      setTimeout(() => setFileMessage(''), 3000);
    }
  };

  const getCategoryColor = (cat) => {
    if (cat === 'prescription') return '#9c27b0';
    return '#1a73e8';
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🧑‍🤝‍🧑 Patients</h2>

      {/* ✅ Search Bar */}
      <div style={styles.searchBox}>
        <input
          style={styles.searchInput}
          placeholder="🔍 Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button style={styles.clearBtn} onClick={() => setSearch('')}>
            ✕ Clear
          </button>
        )}
      </div>
      {search && (
        <p style={styles.resultCount}>
          Found <strong>{filtered.length}</strong> patient(s)
        </p>
      )}

      {/* ✅ Status Message */}
      {message && (
        <div style={{
          ...styles.messageBox,
          background: message.startsWith('✅') ? '#e6f4ea' : '#fce8e6',
          color: message.startsWith('✅') ? 'green' : 'red',
          border: `1px solid ${message.startsWith('✅') ? 'green' : 'red'}`
        }}>
          {message}
        </div>
      )}

      {/* ✅ Add Patient Form */}
      <div style={styles.card}>
        <h3>➕ Add New Patient</h3>
        <form onSubmit={handleCreate} style={styles.form}>
          <input style={styles.input} placeholder="Name"
            value={name} onChange={(e) => setName(e.target.value)} />
          <input style={styles.input} placeholder="Age" type="number"
            value={age} onChange={(e) => setAge(e.target.value)} />
          <input style={styles.input} placeholder="Phone"
            value={phone} onChange={(e) => setPhone(e.target.value)} />
          <button style={styles.button} type="submit">
            ➕ Add Patient
          </button>
        </form>
      </div>

      <div style={styles.mainContent}>
        {/* ✅ Patients List */}
        <div style={styles.patientsList}>
          <h3 style={{ marginBottom: '12px', color: '#555' }}>
            👥 All Patients ({filtered.length})
          </h3>
          {filtered.length === 0 && (
            <p style={{ color: '#888' }}>No patients found.</p>
          )}
          {filtered.map((patient) => (
            <div
              key={patient.id}
              style={{
                ...styles.patientCard,
                border: selectedPatient?.id === patient.id
                  ? '2px solid #1a73e8'
                  : '0.5px solid #e0e0e0'
              }}
            >
              <div>
                <h3 style={{ color: '#1a73e8', marginBottom: '4px' }}>
                  {patient.name}
                </h3>
                <p style={styles.patientInfo}>🎂 Age: {patient.age}</p>
                <p style={styles.patientInfo}>📱 {patient.phone}</p>
                <p style={styles.patientId}>ID: {patient.id}</p>
              </div>
              <div style={styles.patientActions}>
                <button
                  style={styles.filesBtn}
                  onClick={() => handleManageFiles(patient)}
                >
                  📁 Files
                </button>
                <button
                  style={styles.deleteBtn}
                  onClick={() => handleDelete(patient.id)}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ✅ File Management Section */}
        {showFiles && selectedPatient && (
          <div style={styles.filesSection}>
            <div style={styles.filesSectionHeader}>
              <h3 style={{ color: '#1a73e8' }}>
                📁 Files — {selectedPatient.name}
              </h3>
              <button
                style={styles.closeBtn}
                onClick={() => setShowFiles(false)}
              >
                ✕
              </button>
            </div>

            {/* ✅ Upload Form */}
            <div style={styles.uploadCard}>
              <h4 style={{ marginBottom: '10px' }}>📤 Upload File</h4>

              {fileMessage && (
                <div style={{
                  ...styles.messageBox,
                  background: fileMessage.startsWith('✅') ? '#e6f4ea' : '#fce8e6',
                  color: fileMessage.startsWith('✅') ? 'green' : 'red',
                  border: `1px solid ${fileMessage.startsWith('✅') ? 'green' : 'red'}`
                }}>
                  {fileMessage}
                </div>
              )}

              <form onSubmit={handleUpload} style={styles.uploadForm}>
                <select
                  style={styles.select}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="report">📋 Report</option>
                  <option value="prescription">💊 Prescription</option>
                </select>

                <input
                  id="fileInput"
                  type="file"
                  style={styles.fileInput}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => setFile(e.target.files[0])}
                />

                <button
                  style={{
                    ...styles.uploadBtn,
                    background: loading ? '#ccc' : '#1a73e8'
                  }}
                  type="submit"
                  disabled={loading}
                >
                  {loading ? '⏳ Uploading...' : '📤 Upload'}
                </button>
              </form>

              {file && (
                <div style={styles.fileInfo}>
                  <span>📄 {file.name}</span>
                  <span style={{ color: '#888', fontSize: '12px' }}>
                    ({(file.size / 1024).toFixed(2)} KB)
                  </span>
                </div>
              )}
            </div>

            {/* ✅ Files Filter */}
            <div style={styles.filterRow}>
              <span style={{ fontSize: '13px', color: '#555' }}>
                Filter:
              </span>
              <select
                style={styles.filterSelect}
                value={filterCategory}
                onChange={(e) => {
                  setFilterCategory(e.target.value);
                  fetchFiles(selectedPatient.id, e.target.value);
                }}
              >
                <option value="">All Files</option>
                <option value="report">📋 Reports</option>
                <option value="prescription">💊 Prescriptions</option>
              </select>
            </div>

            {/* ✅ Files List */}
            {files.length === 0 ? (
              <p style={{ color: '#888', fontSize: '13px', padding: '10px' }}>
                No files uploaded yet.
              </p>
            ) : (
              <div style={styles.filesList}>
                {files.map(f => (
                  <div key={f.id} style={styles.fileItem}>
                    <div style={styles.fileItemLeft}>
                      <span style={{ fontSize: '20px' }}>
                        {f.file_category === 'prescription' ? '💊' : '📋'}
                      </span>
                      <div>
                        <div style={styles.fileName}>{f.original_name}</div>
                        <div style={styles.fileMeta}>
                          <span style={{
                            fontSize: '10px',
                            padding: '1px 6px',
                            borderRadius: '10px',
                            background: getCategoryColor(f.file_category) + '22',
                            color: getCategoryColor(f.file_category)
                          }}>
                            {f.file_category}
                          </span>
                          <span style={styles.fileMetaText}>
                            {f.file_size} KB
                          </span>
                          <span style={styles.fileMetaText}>
                            {f.file_type?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={styles.fileItemActions}>
                      <button
                        style={styles.downloadBtn}
                        onClick={() => handleDownload(f.id, f.original_name)}
                      >
                        ⬇️
                      </button>
                      <button
                        style={styles.deleteFileBtn}
                        onClick={() => handleDeleteFile(f.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '30px', background: '#f0f2f5', minHeight: '100vh' },
  title: { color: '#1a73e8', marginBottom: '20px' },
  searchBox: { display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' },
  searchInput: { flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' },
  clearBtn: { padding: '10px 16px', background: '#ea4335', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  resultCount: { color: '#555', fontSize: '13px', marginBottom: '12px' },
  messageBox: { padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontWeight: '500', fontSize: '14px' },
  card: { background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
  form: { display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' },
  input: { padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' },
  button: { padding: '10px 20px', background: '#1a73e8', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  mainContent: { display: 'flex', gap: '20px', alignItems: 'flex-start' },
  patientsList: { flex: 1 },
  patientCard: { background: 'white', padding: '16px', borderRadius: '12px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  patientInfo: { fontSize: '13px', color: '#555', margin: '2px 0' },
  patientId: { fontSize: '11px', color: '#aaa', marginTop: '4px' },
  patientActions: { display: 'flex', gap: '8px', alignItems: 'center' },
  filesBtn: { padding: '8px 14px', background: '#1a73e8', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
  deleteBtn: { padding: '8px 12px', background: '#ea4335', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  filesSection: { flex: 1.2, background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
  filesSectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  closeBtn: { padding: '4px 10px', background: '#f0f2f5', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
  uploadCard: { background: '#f8f9fa', padding: '16px', borderRadius: '8px', marginBottom: '16px' },
  uploadForm: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' },
  select: { padding: '8px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px', cursor: 'pointer' },
  fileInput: { padding: '6px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px' },
  uploadBtn: { padding: '8px 16px', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' },
  fileInfo: { display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px', fontSize: '12px', color: '#555' },
  filterRow: { display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' },
  filterSelect: { padding: '6px 10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '12px', cursor: 'pointer' },
  filesList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  fileItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#f8f9fa', borderRadius: '8px', border: '0.5px solid #e0e0e0' },
  fileItemLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  fileName: { fontSize: '12px', fontWeight: '500', color: '#333', marginBottom: '3px' },
  fileMeta: { display: 'flex', gap: '6px', alignItems: 'center' },
  fileMetaText: { fontSize: '11px', color: '#888' },
  fileItemActions: { display: 'flex', gap: '6px' },
  downloadBtn: { padding: '5px 10px', background: '#1a73e8', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
  deleteFileBtn: { padding: '5px 10px', background: '#ea4335', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }
};