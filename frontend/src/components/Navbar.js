import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem('role');
  const username = localStorage.getItem('username');
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const getRoleColor = () => {
    if (role === 'admin') return '#f59e0b';
    if (role === 'doctor') return '#10b981';
    return ;
  };

  const getRoleBadge = () => {
    if (role === 'admin') return '👑 Admin';
    if (role === 'doctor') return '👨‍⚕️ Doctor';
    return ;
  };

  return (
    <nav style={styles.nav}>

      {/* ✅ Left — Logo */}
      <div style={styles.logoSection}>
        <div style={styles.logoIconBox}>🏥</div>
        <div>
          <div style={styles.logoText}>MediCare Pro</div>
          <div style={styles.logoSub}>Hospital Management</div>
        </div>
      </div>

      

      {/* ✅ Right — User Profile */}
      <div style={styles.rightSection}>

        {/* ✅ Role Badge */}
        <div style={{
          ...styles.roleBadge,
          background: getRoleColor() + '20',
          border: `1px solid ${getRoleColor()}40`,
          color: getRoleColor()
        }}>
          {getRoleBadge()}
        </div>

        {/* ✅ User Dropdown */}
        <div
          style={styles.userBtn}
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <div style={styles.avatar}>
            {username?.charAt(0).toUpperCase()}
          </div>
          <div style={styles.userDetails}>
            <span style={styles.userName}>{username}</span>
            <span style={styles.userRole}>{role}</span>
          </div>
          <span style={styles.chevron}>
            {showDropdown ? '▲' : '▼'}
          </span>
        </div>

        {/* ✅ Dropdown Menu */}
        {showDropdown && (
          <div style={styles.dropdown}>
            <div style={styles.dropdownHeader}>
              <div style={styles.dropdownAvatar}>
                {username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={styles.dropdownName}>{username}</div>
                <div style={{ ...styles.dropdownRole, color: getRoleColor() }}>
                  {getRoleBadge()}
                </div>
              </div>
            </div>
            <div style={styles.dropdownDivider} />
            <Link
              to="/doctors"
              style={styles.dropdownItem}
              onClick={() => setShowDropdown(false)}
            >
              👨‍⚕️ Doctors
            </Link>
            <Link
              to="/patients"
              style={styles.dropdownItem}
              onClick={() => setShowDropdown(false)}
            >
              🧑 Patients
            </Link>
            <Link
              to="/appointments"
              style={styles.dropdownItem}
              onClick={() => setShowDropdown(false)}
            >
              📅 Appointments
            </Link>
            <div style={styles.dropdownDivider} />
            <button
              style={styles.logoutItem}
              onClick={handleLogout}
            >
              🚪 Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 32px',
    height: '68px',
    background: '#0f0f1a',
    borderBottom: '1px solid #1e1e2e',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    backdropFilter: 'blur(10px)'
  },

  // ✅ Logo
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    minWidth: '200px'
  },
  logoIconBox: {
    width: '40px',
    height: '40px',
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px'
  },
  logoText: {
    fontSize: '16px',
    fontWeight: '700',
    color: 'white',
    lineHeight: 1.2
  },
  logoSub: {
    fontSize: '11px',
    color: '#475569',
    lineHeight: 1.2
  },

  // ✅ Nav Links
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    background: '#1e1e2e',
    padding: '4px',
    borderRadius: '12px',
    border: '1px solid #2d2d3d'
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '8px',
    color: '#64748b',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: '500',
    position: 'relative',
    transition: 'all 0.2s'
  },
  navLinkActive: {
    color: 'white',
    background: 'linear-gradient(135deg, #3b82f620, #1d4ed820)',
    borderBottom: '2px solid #3b82f6'
  },
  navIcon: { fontSize: '14px' },
  activeDot: {
    position: 'absolute',
    bottom: '-2px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    background: '#3b82f6'
  },

  // ✅ Right Section
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    minWidth: '200px',
    justifyContent: 'flex-end',
    position: 'relative'
  },
  roleBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    letterSpacing: '0.3px'
  },
  userBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '6px 12px',
    background: '#1e1e2e',
    border: '1px solid #2d2d3d',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '14px',
    fontWeight: '700',
    flexShrink: 0
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column'
  },
  userName: {
    color: 'white',
    fontSize: '13px',
    fontWeight: '500',
    lineHeight: 1.2
  },
  userRole: {
    color: '#475569',
    fontSize: '11px',
    textTransform: 'capitalize',
    lineHeight: 1.2
  },
  chevron: {
    color: '#475569',
    fontSize: '9px',
    marginLeft: '2px'
  },

  // ✅ Dropdown
  dropdown: {
    position: 'absolute',
    top: '52px',
    right: 0,
    width: '220px',
    background: '#1e1e2e',
    border: '1px solid #2d2d3d',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
    zIndex: 1001
  },
  dropdownHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px'
  },
  dropdownAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '16px',
    fontWeight: '700',
    flexShrink: 0
  },
  dropdownName: {
    color: 'white',
    fontSize: '14px',
    fontWeight: '600'
  },
  dropdownRole: {
    fontSize: '12px',
    marginTop: '2px'
  },
  dropdownDivider: {
    height: '1px',
    background: '#2d2d3d',
    margin: '4px 0'
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 16px',
    color: '#94a3b8',
    textDecoration: 'none',
    fontSize: '13px',
    transition: 'all 0.15s',
    cursor: 'pointer'
  },
  logoutItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 16px',
    width: '100%',
    background: 'transparent',
    border: 'none',
    color: '#ef4444',
    fontSize: '13px',
    cursor: 'pointer',
    textAlign: 'left'
  }
};