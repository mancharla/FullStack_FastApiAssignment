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

  useEffect(() => {
    fetchPatients();
  }, []);

  // ✅ Filter patients when search changes
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
      setPatients(response.data);
      setFiltered(response.data);
    } catch (err) {
      console.log('Error:', err);
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
      await API.post('/patients/', {
        name,
        age: parseInt(age),
        phone
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
      fetchPatients();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('❌ Error deleting patient!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🧑‍🤝‍🧑 Patients</h2>

      {/* ✅ Search Bar */}
      <div style={styles.searchBox}>
        <input
          style={styles.searchInput}
          placeholder="🔍 Search by name or phone number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            style={styles.clearBtn}
            onClick={() => setSearch('')}
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* ✅ Search Results Count */}
      {search && (
        <p style={styles.resultCount}>
          Found <strong>{filtered.length}</strong> patient(s) for "{search}"
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
        <h3>Add New Patient</h3>
        <form onSubmit={handleCreate} style={styles.form}>
          <input
            style={styles.input}
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            style={styles.input}
            placeholder="Age"
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
          <input
            style={styles.input}
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button style={styles.button} type="submit">
            ➕ Add Patient
          </button>
        </form>
      </div>

      {/* ✅ Patients List */}
      <div style={styles.grid}>
        {filtered.length === 0 && (
          <p style={{ color: '#888' }}>No patients found.</p>
        )}
        {filtered.map((patient) => (
          <div key={patient.id} style={styles.patientCard}>
            <h3 style={{ color: '#1a73e8' }}>{patient.name}</h3>
            <p>🎂 Age: {patient.age}</p>
            <p>📱 Phone: {patient.phone}</p>
            <p style={{ color: '#888', fontSize: '12px' }}>
              ID: {patient.id}
            </p>
            <button
              style={styles.deleteBtn}
              onClick={() => handleDelete(patient.id)}
            >
              🗑️ Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '30px',
    background: '#f0f2f5',
    minHeight: '100vh'
  },
  title: {
    color: '#1a73e8',
    marginBottom: '20px'
  },
  searchBox: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    marginBottom: '10px'
  },
  searchInput: {
    flex: 1,
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '14px',
    outline: 'none',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  clearBtn: {
    padding: '10px 16px',
    background: '#ea4335',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  resultCount: {
    color: '#555',
    fontSize: '13px',
    marginBottom: '12px'
  },
  messageBox: {
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontWeight: '500',
    fontSize: '14px'
  },
  card: {
    background: 'white',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '20px'
  },
  form: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap'
  },
  input: {
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '14px'
  },
  button: {
    padding: '10px 20px',
    background: '#1a73e8',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px'
  },
  patientCard: {
    background: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
  },
  deleteBtn: {
    padding: '8px 14px',
    background: '#ea4335',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    marginTop: '10px'
  }
};