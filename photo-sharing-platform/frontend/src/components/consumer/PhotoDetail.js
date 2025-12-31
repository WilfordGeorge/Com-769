import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { photoAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Consumer.css';

const PhotoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [photo, setPhoto] = useState(null);
  const [comments, setComments] = useState([]);
  const [ratingStats, setRatingStats] = useState(null);
  const [userRating, setUserRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);

  useEffect(() => {
    fetchPhotoDetails();
  }, [id]);

  const fetchPhotoDetails = async () => {
    try {
      setLoading(true);
      const response = await photoAPI.getPhotoById(id);
      setPhoto(response.data.photo);
      setComments(response.data.comments || []);
      setRatingStats(response.data.ratingStats);
      setUserRating(response.data.userRating);
      setSelectedRating(response.data.userRating || 0);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load photo');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setCommentLoading(true);
      await photoAPI.addComment(id, newComment);
      setNewComment('');
      // Refresh comments
      const response = await photoAPI.getComments(id);
      setComments(response.data.comments);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add comment');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleRating = async (rating) => {
    try {
      const response = await photoAPI.ratePhoto(id, rating);
      setUserRating(rating);
      setSelectedRating(rating);
      setRatingStats(response.data.stats);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit rating');
    }
  };

  const getImageUrl = (path) => {
    return `http://localhost:5000/${path}`;
  };

  if (loading) {
    return <div className="loading">Loading photo...</div>;
  }

  if (error && !photo) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button onClick={() => navigate('/consumer')} className="btn btn-primary">
          Back to Photos
        </button>
      </div>
    );
  }

  if (!photo) {
    return <div className="error-message">Photo not found</div>;
  }

  return (
    <div className="photo-detail-container">
      <button onClick={() => navigate('/consumer')} className="btn btn-secondary back-btn">
        ← Back to Photos
      </button>

      <div className="photo-detail">
        <div className="photo-main">
          <img
            src={getImageUrl(photo.file_path)}
            alt={photo.title}
            className="photo-full-image"
          />
        </div>

        <div className="photo-sidebar">
          <div className="photo-header">
            <h1>{photo.title}</h1>
            <p className="creator">By {photo.creator_name || photo.username}</p>
          </div>

          {photo.caption && (
            <div className="photo-section">
              <h3>Description</h3>
              <p>{photo.caption}</p>
            </div>
          )}

          <div className="photo-metadata">
            {photo.location && (
              <div className="meta-item">
                <span className="meta-icon">📍</span>
                <span>{photo.location}</span>
              </div>
            )}
            {photo.people_present && photo.people_present.length > 0 && (
              <div className="meta-item">
                <span className="meta-icon">👥</span>
                <span>{photo.people_present.join(', ')}</span>
              </div>
            )}
            <div className="meta-item">
              <span className="meta-icon">👁️</span>
              <span>{photo.view_count || 0} views</span>
            </div>
            <div className="meta-item">
              <span className="meta-icon">📅</span>
              <span>{new Date(photo.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Rating Section */}
          <div className="photo-section rating-section">
            <h3>Rating</h3>
            {ratingStats && (
              <div className="rating-display">
                <div className="average-rating">
                  <span className="rating-number">{ratingStats.average_rating || 0}</span>
                  <div className="rating-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={star <= Math.round(ratingStats.average_rating || 0) ? 'star filled' : 'star'}
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                  <span className="rating-count">({ratingStats.rating_count || 0} ratings)</span>
                </div>
              </div>
            )}

            <div className="user-rating">
              <p>Your rating:</p>
              <div className="rating-stars interactive">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={star <= selectedRating ? 'star filled' : 'star'}
                    onClick={() => handleRating(star)}
                    onMouseEnter={() => setSelectedRating(star)}
                    onMouseLeave={() => setSelectedRating(userRating || 0)}
                  >
                    ⭐
                  </span>
                ))}
              </div>
              {userRating && <p className="rating-text">You rated this {userRating} stars</p>}
            </div>
          </div>

          {/* Comments Section */}
          <div className="photo-section comments-section">
            <h3>Comments ({comments.length})</h3>

            <form onSubmit={handleAddComment} className="comment-form">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                rows="3"
                required
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={commentLoading || !newComment.trim()}
              >
                {commentLoading ? 'Posting...' : 'Post Comment'}
              </button>
            </form>

            <div className="comments-list">
              {comments.length === 0 ? (
                <p className="no-comments">No comments yet. Be the first to comment!</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="comment">
                    <div className="comment-header">
                      <span className="comment-author">{comment.full_name || comment.username}</span>
                      <span className="comment-date">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="comment-content">{comment.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default PhotoDetail;
