import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiHeart, FiHome, FiActivity, FiCalendar, FiCpu, FiUser, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { GiMedicines } from 'react-icons/gi';
import { useAuth } from '../../hooks/useAuth';
import InitialsAvatar from './InitialsAvatar';
import './Sidebar.css';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: FiHome },
  { path: '/medications', label: 'Medications', icon: GiMedicines },
  { path: '/symptoms', label: 'Symptoms', icon: FiActivity },
  { path: '/visits', label: 'Doctor Visits', icon: FiCalendar },
  { path: '/ai', label: 'AI Insights', icon: FiCpu },
  { path: '/profile', label: 'Profile', icon: FiUser },
];

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      <button className="hamburger-btn" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
      </button>

      <div className={`sidebar-overlay ${isOpen ? 'visible' : ''}`} onClick={closeSidebar} />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <FiHeart size={22} />
            <span>MediTrack</span>
          </div>
          <div className="sidebar-user">
            <InitialsAvatar name={user?.name || ''} size={36} />
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name || 'User'}</div>
              <div className="sidebar-user-email">{user?.email || ''}</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-logout" onClick={handleLogout}>
            <FiLogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
