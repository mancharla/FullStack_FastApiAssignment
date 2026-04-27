import { useState, useEffect } from 'react';
import API from '../services/api';

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, []);

  // ✅ Filter doctors when search changes
  useEffect(() => {
    if (search.trim() === '') {
      setFiltered(doctors);
    } else {
      const result = doctors.filter(d =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.specialization.toLowerCase().includes(search.toLowerCase()) ||
        d.email.toLowerCase().includes(search.toLowerCase())
      );
      setFiltered(result);
    }
  }, [search, doctors]);

  const fetchDoctors = async () => {
    try {
      const response = await API.get('/doctors/');
      setDoctors(response.data);
      setFiltered(response.data);
    } catch (err) {
      console.log('Error:', err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name || !specialization || !email) {
      setMessage('⚠️ Please fill all fields!');
      return;
    }
    try {
      await API.post('/doctors/', {
        name, specialization, email, is_active: true
      });
      setMessage('✅ Doctor added successfully!');
      setName(''); setSpecialization(''); setEmail('');
      fetchDoctors();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('❌ Error: ' + JSON.stringify(err.response?.data?.detail));
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/doctors/${id}`);
      setMessage('✅ Doctor deleted!');
      fetchDoctors();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('❌ Error deleting doctor!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleToggle = async (id) => {
    try {
      await API.patch(`/doctors/${id}/activate`);
      fetchDoctors();
    } catch (err) {
      setMessage('❌ Error updating doctor!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>👨‍⚕️ Doctors</h2>

      {/* ✅ Search Bar */}
      <div style={styles.searchBox}>
        <input
          style={styles.searchInput}
          placeholder="🔍 Search by name, specialization or email..."
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
          Found <strong>{filtered.length}</strong> doctor(s) for "{search}"
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

      {/* ✅ Add Doctor Form */}
      <div style={styles.card}>
        <h3>Add New Doctor</h3>
        <form onSubmit={handleCreate} style={styles.form}>
          <input style={styles.input} placeholder="Name"
            value={name} onChange={(e) => setName(e.target.value)} />
          <input style={styles.input} placeholder="Specialization"
            value={specialization} onChange={(e) => setSpecialization(e.target.value)} />
          <input style={styles.input} placeholder="Email"
            value={email} onChange={(e) => setEmail(e.target.value)} />
          <button style={styles.button} type="submit">
            ➕ Add Doctor
          </button>
        </form>
      </div>

      {/* ✅ Doctors List */}
      <div style={styles.grid}>
        {filtered.length === 0 && (
          <p style={{ color: '#888' }}>No doctors found.</p>
        )}
        {filtered.map((doctor) => (
          <div key={doctor.id} style={styles.doctorCard}>
            <h3 style={{ color: '#1a73e8' }}>{doctor.name}</h3>
            <p>🔬 {doctor.specialization}</p>
            <p>📧 {doctor.email}</p>
            <p>Status: <span style={{
              color: doctor.is_active ? 'green' : 'red',
              fontWeight: 'bold'
            }}>
              {doctor.is_active ? '✅ Active' : '❌ Inactive'}
            </span></p>
            <div style={styles.btnRow}>
              <button style={styles.toggleBtn}
                onClick={() => handleToggle(doctor.id)}>
                {doctor.is_active ? 'Deactivate' : 'Activate'}
              </button>
              <button style={styles.deleteBtn}
                onClick={() => handleDelete(doctor.id)}>
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '30px', background: '#f0f2f5', minHeight: '100vh' },
  title: { color: '#1a73e8', marginBottom: '20px' },
  searchBox: {
    display: 'flex', gap: '10px', alignItems: 'center',
    marginBottom: '10px'
  },
  searchInput: {
    flex: 1, padding: '12px 16px',
    borderRadius: '8px', border: '1px solid #ddd',
    fontSize: '14px', outline: 'none',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  clearBtn: {
    padding: '10px 16px', background: '#ea4335',
    color: 'white', border: 'none',
    borderRadius: '8px', cursor: 'pointer'
  },
  resultCount: {
    color: '#555', fontSize: '13px', marginBottom: '12px'
  },
  messageBox: {
    padding: '12px 16px', borderRadius: '8px',
    marginBottom: '16px', fontWeight: '500', fontSize: '14px'
  },
  card: {
    background: 'white', padding: '20px',
    borderRadius: '12px', marginBottom: '20px'
  },
  form: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  input: {
    padding: '10px', borderRadius: '8px',
    border: '1px solid #ddd', fontSize: '14px'
  },
  button: {
    padding: '10px 20px', background: '#1a73e8',
    color: 'white', border: 'none',
    borderRadius: '8px', cursor: 'pointer'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px'
  },
  doctorCard: {
    background: 'white', padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
  },
  btnRow: { display: 'flex', gap: '10px', marginTop: '10px' },
  toggleBtn: {
    padding: '8px 14px', background: '#fbbc04',
    border: 'none', borderRadius: '6px', cursor: 'pointer'
  },
  deleteBtn: {
    padding: '8px 14px', background: '#ea4335',
    color: 'white', border: 'none',
    borderRadius: '6px', cursor: 'pointer'
  }
};