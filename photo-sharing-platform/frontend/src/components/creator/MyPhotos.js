import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { photoAPI } from '../../services/api';
import '../../styles/Creator.css';

const MyPhotos = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchMyPhotos();
  }, []);

  const fetchMyPhotos = async () => {
    try {
      setLoading(true);
      const response = await photoAPI.getMyPhotos();
      setPhotos(response.data.photos);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load photos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (photoId) => {
    try {
      await photoAPI.deletePhoto(photoId);
      setPhotos(photos.filter((photo) => photo.id !== photoId));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete photo');
    }
  };

  const getImageUrl = (path) => {
    if (!path) {
      return '';
    }

    if (/^https?:\/\//i.test(path)) {
      return path;
    }

    const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    const apiOrigin = apiBaseUrl.replace(/\/api\/?$/, '');
    const normalized = path.replace(/\\/g, '/');
    const uploadsIndex = normalized.indexOf('/uploads/');
    const publicPath = uploadsIndex >= 0
      ? normalized.slice(uploadsIndex)
      : normalized.startsWith('uploads/')
        ? `/${normalized}`
        : normalized.startsWith('/uploads/')
          ? normalized
          : `/${normalized}`;

    return `${apiOrigin}${publicPath}`;
  };

  if (loading) {
    return <div className="loading">Loading your photos...</div>;
  }

  return (
    <div className="my-photos-container">
      <div className="page-header">
        <div>
          <h1>My Photos</h1>
          <p>Manage all your uploaded photos</p>
        </div>
        <Link to="/creator/upload" className="btn btn-primary">
          Upload New Photo
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      {photos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📸</div>
          <h2>No photos yet</h2>
          <p>Upload your first photo to get started!</p>
          <Link to="/creator/upload" className="btn btn-primary">
            Upload Photo
          </Link>
        </div>
      ) : (
        <div className="photos-grid">
          {photos.map((photo) => (
            <div key={photo.id} className="photo-card">
              <div className="photo-image-container">
                <img
                  src={getImageUrl(photo.thumbnail_path || photo.file_path)}
                  alt={photo.title}
                  className="photo-image"
                />
              </div>
              <div className="photo-info">
                <h3>{photo.title}</h3>
                {photo.caption && <p className="caption">{photo.caption}</p>}
                {photo.location && (
                  <p className="location">📍 {photo.location}</p>
                )}
                {photo.people_present && photo.people_present.length > 0 && (
                  <p className="people">👥 {photo.people_present.join(', ')}</p>
                )}

                <div className="photo-stats">
                  <span>👁️ {photo.view_count || 0} views</span>
                  <span>⭐ {photo.average_rating || 0} ({photo.rating_count || 0} ratings)</span>
                </div>

                <div className="photo-actions">
                  {deleteConfirm === photo.id ? (
                    <>
                      <button
                        onClick={() => handleDelete(photo.id)}
                        className="btn btn-danger btn-small"
                      >
                        Confirm Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="btn btn-secondary btn-small"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(photo.id)}
                      className="btn btn-danger btn-small"
                    >
                      Delete
                    </button>
                  )}
                </div>

                <div className="photo-meta">
                  <small>Uploaded: {new Date(photo.created_at).toLocaleDateString()}</small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPhotos;
