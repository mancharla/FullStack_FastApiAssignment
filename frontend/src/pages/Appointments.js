import { useState, useEffect, useRef } from 'react';
import API from '../services/api';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [doctorId, setDoctorId] = useState('');
  const [patientId, setPatientId] = useState('');
  const [date, setDate] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState('');
  const wsRef = useRef(null);
  const reconnectRef = useRef(null);

  useEffect(() => {
    fetchAppointments();
    connectWebSocket();

    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    const ws = new WebSocket('ws://localhost:8000/ws/doctor/1');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('✅ WebSocket Connected!');
      addNotification('🟢 Connected to live updates!');
    };

    ws.onmessage = (event) => {
      console.log('📩 Message:', event.data);
      addNotification(event.data);
      fetchAppointments();
    };

    ws.onerror = (error) => {
      console.log('❌ WebSocket Error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket closed, reconnecting in 3s...');
      reconnectRef.current = setTimeout(() => {
        connectWebSocket();
      }, 3000);
    };
  };

  const addNotification = (msg) => {
    setNotifications(prev => [
      { id: Date.now(), message: msg, time: new Date().toLocaleTimeString() },
      ...prev.slice(0, 4)
    ]);
  };

  const fetchAppointments = async () => {
    try {
      const response = await API.get('/appointments/');
      setAppointments(response.data);
    } catch (err) {
      console.log('Error fetching appointments:', err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    // ✅ Validate fields
    if (!doctorId || !patientId || !date) {
      setMessage('⚠️ Please fill all fields!');
      return;
    }

    try {
      await API.post('/appointments/', {
        doctor_id: parseInt(doctorId),
        patient_id: parseInt(patientId),
        appointment_date: new Date(date).toISOString(),
        status: 'Scheduled'
      });
      setMessage('✅ Appointment booked successfully!');
      setDoctorId('');
      setPatientId('');
      setDate('');
      fetchAppointments();

      // ✅ Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);

    } catch (err) {
      if (err.response?.status === 429) {
        setMessage('⚠️ Too many requests! Please wait a minute.');
      } else if (err.response?.status === 404) {
        setMessage('❌ Doctor or Patient not found! Check IDs.');
      } else if (err.response?.status === 422) {
        setMessage('❌ Invalid data! Check all fields.');
      } else {
        setMessage('❌ Error: ' + JSON.stringify(err.response?.data?.detail));
      }
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleCancel = async (id) => {
    try {
      await API.put(`/appointments/${id}/cancel`);
      setMessage('✅ Appointment cancelled!');
      fetchAppointments();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('❌ Error cancelling appointment!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const statusColor = (status) => {
    if (status === 'Scheduled') return '#1a73e8';
    if (status === 'Completed') return 'green';
    if (status === 'Cancelled') return 'red';
    return '#333';
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📅 Appointments</h2>

      {/* ✅ Live Notifications Panel */}
      <div style={styles.notifPanel}>
        <h3 style={styles.notifTitle}>🔔 Live Notifications</h3>
        {notifications.length === 0 && (
          <p style={styles.noNotif}>No notifications yet...</p>
        )}
        {notifications.map((n) => (
          <div key={n.id} style={styles.notifItem}>
            <span>{n.message}</span>
            <span style={styles.notifTime}>{n.time}</span>
          </div>
        ))}
      </div>

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

      {/* ✅ Book Appointment Form */}
      <div style={styles.card}>
        <h3>Book New Appointment</h3>
        <form onSubmit={handleCreate} style={styles.form}>
          <input
            style={styles.input}
            placeholder="Doctor ID"
            type="number"
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
          />
          <input
            style={styles.input}
            placeholder="Patient ID"
            type="number"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
          />
          <input
            style={styles.input}
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <button style={styles.button} type="submit">
            📅 Book Appointment
          </button>
        </form>
      </div>

      {/* ✅ Appointments List */}
      <div style={styles.grid}>
        {appointments.length === 0 && (
          <p style={{ color: '#888' }}>No appointments found.</p>
        )}
        {appointments.map((apt) => (
          <div key={apt.id} style={styles.aptCard}>
            <h3 style={{ color: statusColor(apt.status) }}>
              {apt.status}
            </h3>
            <p>👨‍⚕️ Doctor ID: {apt.doctor_id}</p>
            <p>🧑 Patient ID: {apt.patient_id}</p>
            <p>📅 {new Date(apt.appointment_date).toLocaleString()}</p>
            {apt.status === 'Scheduled' && (
              <button
                style={styles.cancelBtn}
                onClick={() => handleCancel(apt.id)}
              >
                ❌ Cancel
              </button>
            )}
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
  notifPanel: {
    background: '#1a1a2e',
    borderRadius: '12px',
    padding: '16px 20px',
    marginBottom: '20px',
    border: '1px solid #0066cc'
  },
  notifTitle: {
    color: '#49cc90',
    marginBottom: '10px',
    fontSize: '16px'
  },
  noNotif: {
    color: '#888',
    fontSize: '13px'
  },
  notifItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #333',
    color: 'white',
    fontSize: '13px'
  },
  notifTime: {
    color: '#888',
    fontSize: '11px',
    marginLeft: '10px'
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
    cursor: 'pointer',
    fontSize: '14px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px'
  },
  aptCard: {
    background: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
  },
  cancelBtn: {
    padding: '8px 14px',
    background: '#ea4335',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    marginTop: '10px'
  }
};