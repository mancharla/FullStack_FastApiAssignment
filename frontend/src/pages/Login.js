import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await API.post('/auth/login', { username, password });
      const token = response.data.access_token;
      const role = response.data.role;
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('username', username);

      // ✅ All roles go to doctors page first
      navigate('/doctors');

    } catch (err) {
      setError('Invalid username or password');
    }
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      {/* ✅ Left Side — Branding */}
      <div style={styles.leftPanel}>
        <div style={styles.brandContent}>
          <div style={styles.logo}>🏥</div>
          <h1 style={styles.brandTitle}>MediCare Pro</h1>
          <p style={styles.brandSubtitle}>
            Advanced Hospital Management System
          </p>
          <div style={styles.features}>
            {['Doctor Management', 'Patient Records', 'Appointment Booking', 'Prescription Tracking'].map(f => (
              <div key={f} style={styles.featureItem}>
                <span style={styles.featureDot}>✦</span>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ✅ Right Side — Login Form */}
      <div style={styles.rightPanel}>
        <div style={styles.formBox}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Welcome Back</h2>
            <p style={styles.formSubtitle}>Sign in to your account</p>
          </div>

          {error && (
            <div style={styles.errorBox}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Username</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>👤</span>
                <input
                  style={styles.input}
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>🔒</span>
                <input
                  style={styles.input}
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div style={styles.forgotRow}>
              <Link to="/forgot-password" style={styles.forgotLink}>
                Forgot Password?
              </Link>
            </div>

            <button
              style={{
                ...styles.loginBtn,
                opacity: loading ? 0.7 : 1
              }}
              type="submit"
              disabled={loading}
            >
              {loading ? '⏳ Signing in...' : 'Sign In →'}
            </button>
          </form>

          <div style={styles.divider}>
            <span style={styles.dividerLine}></span>
            <span style={styles.dividerText}>New here?</span>
            <span style={styles.dividerLine}></span>
          </div>

          <Link to="/signup" style={styles.signupBtn}>
            Create Account
          </Link>

          {/* ✅ Role hints */}
          <div style={styles.roleHints}>
            <p style={styles.roleHintsTitle}>Login as:</p>
            <div style={styles.roleRow}>
              <span style={styles.roleTag}>👑 Admin</span>
              <span style={styles.roleTag}>👨‍⚕️ Doctor</span>
              <span style={styles.roleTag}>🧑 Patient</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    background: '#0a0a0f'
  },
  leftPanel: {
    flex: 1,
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    position: 'relative',
    overflow: 'hidden'
  },
  brandContent: {
    zIndex: 1,
    color: 'white'
  },
  logo: {
    fontSize: '60px',
    marginBottom: '16px',
    display: 'block'
  },
  brandTitle: {
    fontSize: '36px',
    fontWeight: '700',
    color: 'white',
    marginBottom: '8px',
    letterSpacing: '-0.5px'
  },
  brandSubtitle: {
    fontSize: '16px',
    color: '#94a3b8',
    marginBottom: '40px'
  },
  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: '#e2e8f0',
    fontSize: '15px'
  },
  featureDot: {
    color: '#3b82f6',
    fontSize: '12px'
  },
  rightPanel: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    background: '#0a0a0f'
  },
  formBox: {
    width: '100%',
    maxWidth: '400px'
  },
  formHeader: {
    marginBottom: '32px'
  },
  formTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: 'white',
    marginBottom: '6px'
  },
  formSubtitle: {
    color: '#64748b',
    fontSize: '15px'
  },
  errorBox: {
    background: '#ff000015',
    border: '1px solid #ff000040',
    color: '#ff6b6b',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px'
  },
  inputGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    color: '#94a3b8',
    fontSize: '13px',
    fontWeight: '500',
    marginBottom: '8px',
    letterSpacing: '0.5px',
    textTransform: 'uppercase'
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    background: '#1e1e2e',
    border: '1px solid #2d2d3d',
    borderRadius: '10px',
    overflow: 'hidden',
    transition: 'border-color 0.2s'
  },
  inputIcon: {
    padding: '0 14px',
    fontSize: '16px'
  },
  input: {
    flex: 1,
    padding: '14px 14px 14px 0',
    background: 'transparent',
    border: 'none',
    color: 'white',
    fontSize: '15px',
    outline: 'none'
  },
  forgotRow: {
    textAlign: 'right',
    marginBottom: '24px',
    marginTop: '-10px'
  },
  forgotLink: {
    color: '#3b82f6',
    textDecoration: 'none',
    fontSize: '13px'
  },
  loginBtn: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    letterSpacing: '0.5px'
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '24px 0'
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: '#2d2d3d'
  },
  dividerText: {
    color: '#64748b',
    fontSize: '13px'
  },
  signupBtn: {
    display: 'block',
    width: '100%',
    padding: '14px',
    background: 'transparent',
    color: '#3b82f6',
    border: '1px solid #3b82f6',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    textAlign: 'center',
    textDecoration: 'none',
    boxSizing: 'border-box'
  },
  roleHints: {
    marginTop: '32px',
    padding: '16px',
    background: '#1e1e2e',
    borderRadius: '10px',
    border: '1px solid #2d2d3d'
  },
  roleHintsTitle: {
    color: '#64748b',
    fontSize: '12px',
    marginBottom: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  roleRow: {
    display: 'flex',
    gap: '8px'
  },
  roleTag: {
    padding: '4px 12px',
    background: '#0f3460',
    color: '#94a3b8',
    borderRadius: '20px',
    fontSize: '12px'
  }
};