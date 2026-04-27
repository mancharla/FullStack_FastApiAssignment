import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <nav style={styles.nav}>
      <span style={styles.logo}>🏥 Hospital App</span>
      <div style={styles.links}>
        <Link style={styles.link} to="/doctors">Doctors</Link>
        <Link style={styles.link} to="/patients">Patients</Link>
        <Link style={styles.link} to="/appointments">Appointments</Link>
        <button style={styles.logout} onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '15px 30px',
    background: '#1a73e8', color: 'white'
  },
  logo: { fontSize: '20px', fontWeight: 'bold' },
  links: { display: 'flex', gap: '20px', alignItems: 'center' },
  link: { color: 'white', textDecoration: 'none', fontSize: '16px' },
  logout: {
    background: 'white', color: '#1a73e8',
    border: 'none', padding: '8px 16px',
    borderRadius: '6px', cursor: 'pointer',
    fontWeight: 'bold'
  }
};