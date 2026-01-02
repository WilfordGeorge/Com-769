import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { photoAPI } from '../../services/api';
import '../../styles/Creator.css';

const UploadPhoto = () => {
  const [formData, setFormData] = useState({
    title: '',
    caption: '',
    location: '',
    people_present: '',
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      // Validate file size (10MB max)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setFile(selectedFile);
      setError('');

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!file) {
      setError('Please select a photo to upload');
      return;
    }

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);

    try {
      const uploadData = new FormData();
      uploadData.append('photo', file);
      uploadData.append('title', formData.title);
      uploadData.append('caption', formData.caption);
      uploadData.append('location', formData.location);

      // Parse people_present as comma-separated values
      if (formData.people_present.trim()) {
        const peopleArray = formData.people_present
          .split(',')
          .map((name) => name.trim())
          .filter((name) => name.length > 0);
        uploadData.append('people_present', JSON.stringify(peopleArray));
      }

      await photoAPI.uploadPhoto(uploadData);

      setSuccess(true);
      setFormData({ title: '', caption: '', location: '', people_present: '' });
      setFile(null);
      setPreview(null);

      setTimeout(() => {
        navigate('/creator/my-photos');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload photo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-card">
        <h1>Upload New Photo</h1>
        <p className="subtitle">Share your amazing photography with the world</p>

        {error && <div className="error-message">{error}</div>}
        {success && (
          <div className="success-message">
            Photo uploaded successfully! Redirecting to your photos...
          </div>
        )}

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-group">
            <label htmlFor="photo">Select Photo *</label>
            <input
              type="file"
              id="photo"
              accept="image/*"
              onChange={handleFileChange}
              required
            />
            {preview && (
              <div className="preview-container">
                <img src={preview} alt="Preview" className="preview-image" />
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Give your photo a descriptive title"
            />
          </div>

          <div className="form-group">
            <label htmlFor="caption">Caption</label>
            <textarea
              id="caption"
              name="caption"
              value={formData.caption}
              onChange={handleChange}
              rows="4"
              placeholder="Tell a story about this photo..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Where was this photo taken?"
            />
          </div>

          <div className="form-group">
            <label htmlFor="people_present">People Present</label>
            <input
              type="text"
              id="people_present"
              name="people_present"
              value={formData.people_present}
              onChange={handleChange}
              placeholder="Enter names separated by commas (e.g., John, Jane, Bob)"
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/creator')}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Uploading...' : 'Upload Photo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadPhoto;
