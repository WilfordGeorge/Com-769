const Photo = require('../models/Photo');
const Comment = require('../models/Comment');
const Rating = require('../models/Rating');
const path = require('path');
const fs = require('fs').promises;

// Upload a new photo (Creator only)
exports.uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { title, caption, location, people_present } = req.body;

    if (!title) {
      // Clean up uploaded file
      await fs.unlink(req.file.path);
      return res.status(400).json({ error: 'Title is required' });
    }

    // Parse people_present if it's a JSON string
    let peoplePresentArray = [];
    if (people_present) {
      try {
        peoplePresentArray = typeof people_present === 'string'
          ? JSON.parse(people_present)
          : people_present;
      } catch (e) {
        peoplePresentArray = [people_present];
      }
    }

    const photoData = {
      creator_id: req.user.id,
      title,
      caption: caption || null,
      location: location || null,
      people_present: peoplePresentArray.length > 0 ? peoplePresentArray : null,
      file_path: req.file.path,
      thumbnail_path: req.file.thumbnailPath || null,
      file_size: req.file.size,
      mime_type: req.file.mimetype,
      width: req.file.width || null,
      height: req.file.height || null,
    };

    const photo = await Photo.create(photoData);

    res.status(201).json({
      message: 'Photo uploaded successfully',
      photo,
    });
  } catch (error) {
    console.error('Upload photo error:', error);
    // Clean up uploaded file on error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
        if (req.file.thumbnailPath) {
          await fs.unlink(req.file.thumbnailPath);
        }
      } catch (unlinkError) {
        console.error('Error cleaning up file:', unlinkError);
      }
    }
    res.status(500).json({ error: 'Failed to upload photo' });
  }
};

// Get all photos with search and pagination
exports.getPhotos = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      location = '',
      sortBy = 'created_at',
      sortOrder = 'DESC',
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const photos = await Photo.getAll({
      limit: parseInt(limit),
      offset,
      search,
      location,
      sortBy,
      sortOrder,
    });

    const totalCount = await Photo.getTotalCount(search, location);
    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      photos,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get photos error:', error);
    res.status(500).json({ error: 'Failed to get photos' });
  }
};

// Get photo by ID with details
exports.getPhotoById = async (req, res) => {
  try {
    const { id } = req.params;

    const photo = await Photo.findById(id);

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // Increment view count
    await Photo.incrementViewCount(id);

    // Get comments and rating stats
    const comments = await Comment.getByPhoto(id, { limit: 10 });
    const ratingStats = await Rating.getPhotoStats(id);

    // Get user's rating if authenticated
    let userRating = null;
    if (req.user) {
      userRating = await Rating.getUserRating(id, req.user.id);
    }

    res.json({
      photo: {
        ...photo,
        view_count: photo.view_count + 1, // Include incremented count
      },
      comments,
      ratingStats,
      userRating: userRating ? userRating.rating : null,
    });
  } catch (error) {
    console.error('Get photo by ID error:', error);
    res.status(500).json({ error: 'Failed to get photo' });
  }
};

// Get creator's own photos
exports.getMyPhotos = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const photos = await Photo.getByCreator(req.user.id, {
      limit: parseInt(limit),
      offset,
    });

    res.json({ photos });
  } catch (error) {
    console.error('Get my photos error:', error);
    res.status(500).json({ error: 'Failed to get photos' });
  }
};

// Update photo metadata (Creator only)
exports.updatePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, caption, location, people_present } = req.body;

    // Parse people_present if it's a JSON string
    let peoplePresentArray = undefined;
    if (people_present !== undefined) {
      try {
        peoplePresentArray = typeof people_present === 'string'
          ? JSON.parse(people_present)
          : people_present;
      } catch (e) {
        peoplePresentArray = [people_present];
      }
    }

    const photo = await Photo.update(id, req.user.id, {
      title,
      caption,
      location,
      people_present: peoplePresentArray,
    });

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found or unauthorized' });
    }

    res.json({
      message: 'Photo updated successfully',
      photo,
    });
  } catch (error) {
    console.error('Update photo error:', error);
    res.status(500).json({ error: 'Failed to update photo' });
  }
};

// Delete photo (Creator only)
exports.deletePhoto = async (req, res) => {
  try {
    const { id } = req.params;

    const photo = await Photo.delete(id, req.user.id);

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found or unauthorized' });
    }

    // Delete physical files
    try {
      await fs.unlink(photo.file_path);
      if (photo.thumbnail_path) {
        await fs.unlink(photo.thumbnail_path);
      }
    } catch (fileError) {
      console.error('Error deleting files:', fileError);
    }

    res.json({
      message: 'Photo deleted successfully',
      photo,
    });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
};

// Add comment to photo (Consumer only)
exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    // Verify photo exists
    const photo = await Photo.findById(id);
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    const comment = await Comment.create({
      photo_id: id,
      user_id: req.user.id,
      content: content.trim(),
    });

    res.status(201).json({
      message: 'Comment added successfully',
      comment,
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

// Rate photo (Consumer only)
exports.ratePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Verify photo exists
    const photo = await Photo.findById(id);
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    const ratingRecord = await Rating.upsert({
      photo_id: id,
      user_id: req.user.id,
      rating: parseInt(rating),
    });

    // Get updated rating stats
    const ratingStats = await Rating.getPhotoStats(id);

    res.json({
      message: 'Rating submitted successfully',
      rating: ratingRecord,
      stats: ratingStats,
    });
  } catch (error) {
    console.error('Rate photo error:', error);
    res.status(500).json({ error: 'Failed to rate photo' });
  }
};

// Get comments for a photo
exports.getComments = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const comments = await Comment.getByPhoto(id, {
      limit: parseInt(limit),
      offset,
    });

    const totalCount = await Comment.getCountByPhoto(id);

    res.json({
      comments,
      pagination: {
        currentPage: parseInt(page),
        totalCount,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Failed to get comments' });
  }
};
