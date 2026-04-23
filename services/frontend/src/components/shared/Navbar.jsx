import { Link } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <FiHeart size={24} />
        <span>MediTrack</span>
      </Link>
      <div className="navbar-actions">
        <Link to="/login" className="navbar-link">Login</Link>
        <Link to="/register" className="navbar-cta">Get Started</Link>
      </div>
    </nav>
  );
}

export default Navbar;
