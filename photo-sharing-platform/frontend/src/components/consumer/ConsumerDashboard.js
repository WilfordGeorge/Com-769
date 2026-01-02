import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { photoAPI } from '../../services/api';
import '../../styles/Consumer.css';

const ConsumerDashboard = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchPhotos();
  }, [searchTerm, location, sortBy, page]);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const response = await photoAPI.getPhotos({
        page,
        limit: 12,
        search: searchTerm,
        location,
        sortBy,
        sortOrder: 'DESC',
      });
      setPhotos(response.data.photos);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load photos');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchPhotos();
  };

  const handlePhotoClick = (photoId) => {
    navigate(`/consumer/photo/${photoId}`);
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

  return (
    <div className="consumer-dashboard">
      <div className="dashboard-header">
        <h1>Discover Photos</h1>
        <p>Browse, search, and explore amazing photography</p>
      </div>

      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-inputs">
            <input
              type="text"
              placeholder="Search by title, caption, people..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <input
              type="text"
              placeholder="Filter by location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="search-input"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="created_at">Latest First</option>
              <option value="average_rating">Highest Rated</option>
              <option value="view_count">Most Viewed</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading photos...</div>
      ) : photos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h2>No photos found</h2>
          <p>Try adjusting your search filters</p>
        </div>
      ) : (
        <>
          <div className="photos-grid">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="photo-card"
                onClick={() => handlePhotoClick(photo.id)}
              >
                <div className="photo-image-container">
                  <img
                    src={getImageUrl(photo.thumbnail_path || photo.file_path)}
                    alt={photo.title}
                    className="photo-image"
                  />
                  <div className="photo-overlay">
                    <div className="overlay-stats">
                      <span>👁️ {photo.view_count || 0}</span>
                      <span>⭐ {photo.average_rating || 0}</span>
                    </div>
                  </div>
                </div>
                <div className="photo-info">
                  <h3>{photo.title}</h3>
                  <p className="creator">By {photo.creator_name || photo.username}</p>
                  {photo.location && (
                    <p className="location">📍 {photo.location}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="btn btn-secondary"
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === pagination.totalPages}
                className="btn btn-secondary"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ConsumerDashboard;
