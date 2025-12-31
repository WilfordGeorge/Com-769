import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Header.css';

const Header = () => {
  const { user, logout, isCreator, isConsumer } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <Link to="/">
            📸 Photo Sharing Platform
          </Link>
        </div>

        <nav className="nav">
          {user && isCreator() && (
            <>
              <Link to="/creator" className="nav-link">Dashboard</Link>
              <Link to="/creator/upload" className="nav-link">Upload Photo</Link>
              <Link to="/creator/my-photos" className="nav-link">My Photos</Link>
            </>
          )}

          {user && isConsumer() && (
            <>
              <Link to="/consumer" className="nav-link">Browse Photos</Link>
            </>
          )}
        </nav>

        <div className="user-section">
          {user ? (
            <>
              <span className="user-info">
                {user.full_name || user.username} ({user.role})
              </span>
              <button onClick={handleLogout} className="btn btn-secondary">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-primary">Login</Link>
              <Link to="/register" className="btn btn-secondary">Register</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
