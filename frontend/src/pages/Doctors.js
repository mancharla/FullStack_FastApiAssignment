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

  // ✅ Appointment states
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [showAppointments, setShowAppointments] = useState(false);
  const [aptMessage, setAptMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, []);

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
      const data = response.data.data || response.data;
      setDoctors(Array.isArray(data) ? data : []);
      setFiltered(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log('Error:', err);
      setDoctors([]);
      setFiltered([]);
    }
  };

  // ✅ Fetch appointments for selected doctor
  const fetchDoctorAppointments = async (doctorId, status = '') => {
    try {
      const url = status
        ? `/appointments/?doctor_id=${doctorId}&status=${status}`
        : `/appointments/?doctor_id=${doctorId}`;
      const response = await API.get(url);
      const data = response.data.data || response.data;
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      setAppointments([]);
    }
  };

  // ✅ Handle view appointments
  const handleViewAppointments = (doctor) => {
    setSelectedDoctor(doctor);
    setShowAppointments(true);
    setFilterStatus('');
    fetchDoctorAppointments(doctor.id);
  };

  // ✅ Handle approve appointment
  const handleApprove = async (appointmentId) => {
    try {
      await API.put(`/appointments/${appointmentId}`, {
        status: 'Approved'
      });
      setAptMessage('✅ Appointment Approved!');
      fetchDoctorAppointments(selectedDoctor.id, filterStatus);
      setTimeout(() => setAptMessage(''), 3000);
    } catch (err) {
      setAptMessage('❌ ' + (err.response?.data?.detail || 'Error'));
      setTimeout(() => setAptMessage(''), 3000);
    }
  };

  // ✅ Handle reject appointment
  const handleReject = async (appointmentId) => {
    try {
      await API.put(`/appointments/${appointmentId}`, {
        status: 'Rejected'
      });
      setAptMessage('✅ Appointment Rejected!');
      fetchDoctorAppointments(selectedDoctor.id, filterStatus);
      setTimeout(() => setAptMessage(''), 3000);
    } catch (err) {
      setAptMessage('❌ ' + (err.response?.data?.detail || 'Error'));
      setTimeout(() => setAptMessage(''), 3000);
    }
  };

  // ✅ Handle complete appointment
  const handleComplete = async (appointmentId) => {
    try {
      await API.put(`/appointments/${appointmentId}`, {
        status: 'Completed'
      });
      setAptMessage('✅ Appointment Completed!');
      fetchDoctorAppointments(selectedDoctor.id, filterStatus);
      setTimeout(() => setAptMessage(''), 3000);
    } catch (err) {
      setAptMessage('❌ ' + (err.response?.data?.detail || 'Error'));
      setTimeout(() => setAptMessage(''), 3000);
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
      if (selectedDoctor?.id === id) {
        setSelectedDoctor(null);
        setShowAppointments(false);
      }
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
    }
  };

  const getStatusColor = (status) => {
    if (status === 'Pending') return '#ff9800';
    if (status === 'Approved') return '#4caf50';
    if (status === 'Rejected') return '#f44336';
    if (status === 'Completed') return '#1a73e8';
    if (status === 'Cancelled') return '#9e9e9e';
    return '#333';
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
          <button style={styles.clearBtn} onClick={() => setSearch('')}>
            ✕ Clear
          </button>
        )}
      </div>
      {search && (
        <p style={styles.resultCount}>
          Found <strong>{filtered.length}</strong> doctor(s)
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
        <h3>➕ Add New Doctor</h3>
        <form onSubmit={handleCreate} style={styles.form}>
          <input style={styles.input} placeholder="Name"
            value={name} onChange={(e) => setName(e.target.value)} />
          <input style={styles.input} placeholder="Specialization"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)} />
          <input style={styles.input} placeholder="Email"
            value={email} onChange={(e) => setEmail(e.target.value)} />
          <button style={styles.button} type="submit">
            ➕ Add Doctor
          </button>
        </form>
      </div>

      {/* ✅ Main Content */}
      <div style={styles.mainContent}>

        {/* ✅ Doctors List */}
        <div style={styles.doctorsList}>
          <h3 style={{ marginBottom: '12px', color: '#555' }}>
            👥 All Doctors ({filtered.length})
          </h3>
          {filtered.length === 0 && (
            <p style={{ color: '#888' }}>No doctors found.</p>
          )}
          {filtered.map((doctor) => (
            <div
              key={doctor.id}
              style={{
                ...styles.doctorCard,
                border: selectedDoctor?.id === doctor.id
                  ? '2px solid #1a73e8'
                  : '0.5px solid #e0e0e0'
              }}
            >
              <div>
                <h3 style={{ color: '#1a73e8', marginBottom: '4px' }}>
                  {doctor.name}
                </h3>
                <p style={styles.doctorInfo}>🔬 {doctor.specialization}</p>
                <p style={styles.doctorInfo}>📧 {doctor.email}</p>
                <p style={styles.doctorInfo}>
                  Status: <span style={{
                    color: doctor.is_active ? 'green' : 'red',
                    fontWeight: 'bold'
                  }}>
                    {doctor.is_active ? '✅ Active' : '❌ Inactive'}
                  </span>
                </p>
              </div>
              <div style={styles.doctorActions}>
                <button
                  style={styles.apptBtn}
                  onClick={() => handleViewAppointments(doctor)}
                >
                  📅 Appointments
                </button>
                <button
                  style={styles.toggleBtn}
                  onClick={() => handleToggle(doctor.id)}
                >
                  {doctor.is_active ? '🔴' : '🟢'}
                </button>
                <button
                  style={styles.deleteBtn}
                  onClick={() => handleDelete(doctor.id)}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ✅ Appointments Panel */}
        {showAppointments && selectedDoctor && (
          <div style={styles.apptPanel}>
            <div style={styles.apptPanelHeader}>
              <div>
                <h3 style={{ color: '#1a73e8' }}>
                  📅 {selectedDoctor.name}'s Appointments
                </h3>
                <p style={{ fontSize: '12px', color: '#888' }}>
                  {selectedDoctor.specialization}
                </p>
              </div>
              <button
                style={styles.closeBtn}
                onClick={() => setShowAppointments(false)}
              >
                ✕
              </button>
            </div>

            {/* ✅ Filter by Status */}
            <div style={styles.filterRow}>
              <span style={{ fontSize: '13px', color: '#555' }}>
                Filter:
              </span>
              {['', 'Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled'].map(s => (
                <button
                  key={s}
                  style={{
                    ...styles.filterBtn,
                    background: filterStatus === s ? '#1a73e8' : '#f0f2f5',
                    color: filterStatus === s ? 'white' : '#555'
                  }}
                  onClick={() => {
                    setFilterStatus(s);
                    fetchDoctorAppointments(selectedDoctor.id, s);
                  }}
                >
                  {s || 'All'}
                </button>
              ))}
            </div>

            {/* ✅ Apt Message */}
            {aptMessage && (
              <div style={{
                ...styles.messageBox,
                background: aptMessage.startsWith('✅') ? '#e6f4ea' : '#fce8e6',
                color: aptMessage.startsWith('✅') ? 'green' : 'red',
                border: `1px solid ${aptMessage.startsWith('✅') ? 'green' : 'red'}`
              }}>
                {aptMessage}
              </div>
            )}

            {/* ✅ Appointments List */}
            {appointments.length === 0 ? (
              <p style={{ color: '#888', fontSize: '13px', padding: '10px' }}>
                No appointments found.
              </p>
            ) : (
              <div style={styles.apptList}>
                {appointments.map(apt => (
                  <div key={apt.id} style={styles.apptCard}>
                    <div style={styles.apptCardTop}>
                      <span style={{
                        ...styles.statusBadge,
                        background: getStatusColor(apt.status) + '22',
                        color: getStatusColor(apt.status)
                      }}>
                        {apt.status}
                      </span>
                      <span style={styles.apptDate}>
                        📅 {new Date(apt.appointment_date).toLocaleString()}
                      </span>
                    </div>
                    <div style={styles.apptInfo}>
                      <p>🧑 Patient ID: {apt.patient_id}</p>
                      {apt.notes && <p>📝 {apt.notes}</p>}
                    </div>

                    {/* ✅ Action Buttons based on status */}
                    <div style={styles.apptActions}>
                      {apt.status === 'Pending' && (
                        <>
                          <button
                            style={styles.approveBtn}
                            onClick={() => handleApprove(apt.id)}
                          >
                            ✅ Approve
                          </button>
                          <button
                            style={styles.rejectBtn}
                            onClick={() => handleReject(apt.id)}
                          >
                            ❌ Reject
                          </button>
                        </>
                      )}
                      {apt.status === 'Approved' && (
                        <button
                          style={styles.completeBtn}
                          onClick={() => handleComplete(apt.id)}
                        >
                          🏁 Complete
                        </button>
                      )}
                      {(apt.status === 'Rejected' ||
                        apt.status === 'Completed' ||
                        apt.status === 'Cancelled') && (
                        <span style={{ fontSize: '12px', color: '#888' }}>
                          No actions available
                        </span>
                      )}
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
  card: { background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px' },
  form: { display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' },
  input: { padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' },
  button: { padding: '10px 20px', background: '#1a73e8', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  mainContent: { display: 'flex', gap: '20px', alignItems: 'flex-start' },
  doctorsList: { flex: 1 },
  doctorCard: { background: 'white', padding: '16px', borderRadius: '12px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  doctorInfo: { fontSize: '13px', color: '#555', margin: '2px 0' },
  doctorActions: { display: 'flex', gap: '8px', alignItems: 'center' },
  apptBtn: { padding: '8px 12px', background: '#1a73e8', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
  toggleBtn: { padding: '8px 12px', background: '#f0f2f5', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
  deleteBtn: { padding: '8px 12px', background: '#ea4335', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  apptPanel: { flex: 1.2, background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', maxHeight: '80vh', overflowY: 'auto' },
  apptPanelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' },
  closeBtn: { padding: '4px 10px', background: '#f0f2f5', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  filterRow: { display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' },
  filterBtn: { padding: '4px 10px', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '11px', fontWeight: '500' },
  apptList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  apptCard: { background: '#f8f9fa', borderRadius: '8px', padding: '12px', border: '0.5px solid #e0e0e0' },
  apptCardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  statusBadge: { fontSize: '11px', padding: '2px 8px', borderRadius: '10px', fontWeight: '500' },
  apptDate: { fontSize: '11px', color: '#888' },
  apptInfo: { fontSize: '12px', color: '#555', marginBottom: '8px' },
  apptActions: { display: 'flex', gap: '8px' },
  approveBtn: { padding: '5px 12px', background: '#4caf50', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
  rejectBtn: { padding: '5px 12px', background: '#f44336', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
  completeBtn: { padding: '5px 12px', background: '#1a73e8', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }
};