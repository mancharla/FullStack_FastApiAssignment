import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('patient');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters!');
      return;
    }

    setLoading(true);
    try {
      await API.post('/auth/register', { username, password, role });
      setSuccess('Account created successfully!');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed!');
    }
    setLoading(false);
  };

  const roles = [
    { value: 'patient', label: '🧑 Patient', desc: 'Book appointments, view records' },
    { value: 'doctor', label: '👨‍⚕️ Doctor', desc: 'Manage appointments, view prescriptions' },
    { value: 'admin', label: '👑 Admin', desc: 'Full system access' }
  ];

  return (
    <div style={styles.page}>
      {/* ✅ Left Side */}
      <div style={styles.leftPanel}>
        <div style={styles.brandContent}>
          <div style={styles.logo}>🏥</div>
          <h1 style={styles.brandTitle}>MediCare Pro</h1>
          <p style={styles.brandSubtitle}>Create your account to get started</p>
          <div style={styles.roleCards}>
            {roles.map(r => (
              <div key={r.value} style={styles.roleCard}>
                <span style={styles.roleIcon}>{r.label}</span>
                <span style={styles.roleDesc}>{r.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ✅ Right Side */}
      <div style={styles.rightPanel}>
        <div style={styles.formBox}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Create Account</h2>
            <p style={styles.formSubtitle}>Join MediCare Pro today</p>
          </div>

          {error && (
            <div style={styles.errorBox}>⚠️ {error}</div>
          )}
          {success && (
            <div style={styles.successBox}>✅ {success}</div>
          )}

          <form onSubmit={handleSignup}>
            {/* Username */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Username</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>👤</span>
                <input
                  style={styles.input}
                  type="text"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            {/* Role Selection */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Account Type</label>
              <div style={styles.roleSelector}>
                {roles.map(r => (
                  <button
                    key={r.value}
                    type="button"
                    style={{
                      ...styles.roleOption,
                      background: role === r.value
                        ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                        : '#1e1e2e',
                      border: role === r.value
                        ? '1px solid #3b82f6'
                        : '1px solid #2d2d3d',
                      color: role === r.value ? 'white' : '#94a3b8'
                    }}
                    onClick={() => setRole(r.value)}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Password */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>🔒</span>
                <input
                  style={styles.input}
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirm Password</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>🔒</span>
                <input
                  style={styles.input}
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              style={{
                ...styles.signupBtn,
                opacity: loading ? 0.7 : 1
              }}
              type="submit"
              disabled={loading}
            >
              {loading ? '⏳ Creating Account...' : 'Create Account →'}
            </button>
          </form>

          <div style={styles.loginRow}>
            <span style={{ color: '#64748b' }}>Already have an account? </span>
            <Link to="/" style={styles.loginLink}>Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { display: 'flex', minHeight: '100vh', background: '#0a0a0f' },
  leftPanel: {
    flex: 1,
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px'
  },
  brandContent: { color: 'white', width: '100%', maxWidth: '360px' },
  logo: { fontSize: '50px', marginBottom: '12px', display: 'block' },
  brandTitle: { fontSize: '32px', fontWeight: '700', color: 'white', marginBottom: '8px' },
  brandSubtitle: { color: '#94a3b8', fontSize: '15px', marginBottom: '32px' },
  roleCards: { display: 'flex', flexDirection: 'column', gap: '10px' },
  roleCard: {
    display: 'flex', alignItems: 'center', gap: '12px',
    background: '#ffffff10', borderRadius: '10px', padding: '12px 16px',
    border: '1px solid #ffffff15'
  },
  roleIcon: { fontSize: '14px', fontWeight: '500', color: 'white', minWidth: '100px' },
  roleDesc: { fontSize: '12px', color: '#94a3b8' },
  rightPanel: {
    flex: 1, display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: '40px', background: '#0a0a0f'
  },
  formBox: { width: '100%', maxWidth: '400px' },
  formHeader: { marginBottom: '28px' },
  formTitle: { fontSize: '28px', fontWeight: '700', color: 'white', marginBottom: '6px' },
  formSubtitle: { color: '#64748b', fontSize: '15px' },
  errorBox: {
    background: '#ff000015', border: '1px solid #ff000040',
    color: '#ff6b6b', padding: '12px 16px', borderRadius: '8px',
    marginBottom: '16px', fontSize: '14px'
  },
  successBox: {
    background: '#00ff0015', border: '1px solid #00ff0040',
    color: '#4ade80', padding: '12px 16px', borderRadius: '8px',
    marginBottom: '16px', fontSize: '14px'
  },
  inputGroup: { marginBottom: '18px' },
  label: {
    display: 'block', color: '#94a3b8', fontSize: '12px',
    fontWeight: '500', marginBottom: '8px',
    letterSpacing: '0.5px', textTransform: 'uppercase'
  },
  inputWrapper: {
    display: 'flex', alignItems: 'center',
    background: '#1e1e2e', border: '1px solid #2d2d3d',
    borderRadius: '10px', overflow: 'hidden'
  },
  inputIcon: { padding: '0 14px', fontSize: '16px' },
  input: {
    flex: 1, padding: '13px 14px 13px 0',
    background: 'transparent', border: 'none',
    color: 'white', fontSize: '14px', outline: 'none'
  },
  roleSelector: { display: 'flex', gap: '8px' },
  roleOption: {
    flex: 1, padding: '10px 8px', borderRadius: '8px',
    cursor: 'pointer', fontSize: '12px', fontWeight: '500',
    transition: 'all 0.2s'
  },
  signupBtn: {
    width: '100%', padding: '14px',
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    color: 'white', border: 'none', borderRadius: '10px',
    fontSize: '15px', fontWeight: '600', cursor: 'pointer',
    marginTop: '4px'
  },
  loginRow: { textAlign: 'center', marginTop: '24px', fontSize: '14px' },
  loginLink: { color: '#3b82f6', textDecoration: 'none', fontWeight: '500', marginLeft: '4px' }
};