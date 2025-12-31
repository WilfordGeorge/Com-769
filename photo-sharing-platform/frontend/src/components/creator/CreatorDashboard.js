import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Creator.css';

const CreatorDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Creator Dashboard</h1>
        <p>Welcome back, {user.full_name || user.username}!</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-icon">📤</div>
          <h2>Upload New Photo</h2>
          <p>Share your latest creation with the world</p>
          <Link to="/creator/upload" className="btn btn-primary">
            Upload Photo
          </Link>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">🖼️</div>
          <h2>My Photos</h2>
          <p>View and manage all your uploaded photos</p>
          <Link to="/creator/my-photos" className="btn btn-primary">
            View My Photos
          </Link>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">📊</div>
          <h2>Analytics</h2>
          <p>Track views, ratings, and engagement</p>
          <Link to="/creator/my-photos" className="btn btn-secondary">
            View Stats
          </Link>
        </div>
      </div>

      <div className="info-section">
        <h2>Getting Started</h2>
        <div className="info-grid">
          <div className="info-item">
            <h3>1. Upload Photos</h3>
            <p>Share your photos with title, caption, location, and tag people present</p>
          </div>
          <div className="info-item">
            <h3>2. Manage Content</h3>
            <p>Edit metadata, view statistics, and delete photos as needed</p>
          </div>
          <div className="info-item">
            <h3>3. Engage</h3>
            <p>See how consumers interact with your content through views and ratings</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorDashboard;
