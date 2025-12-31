const express = require('express');
const router = express.Router();
const photoController = require('../controllers/photoController');
const { authenticateToken, requireCreator, requireConsumer } = require('../middleware/auth');
const { uploadPhoto } = require('../middleware/upload');

// Public routes (can be accessed without authentication, but some features require auth)
router.get('/', photoController.getPhotos);
router.get('/:id', photoController.getPhotoById);
router.get('/:id/comments', photoController.getComments);

// Creator-only routes
router.post('/', authenticateToken, requireCreator, uploadPhoto, photoController.uploadPhoto);
router.get('/my/uploads', authenticateToken, requireCreator, photoController.getMyPhotos);
router.put('/:id', authenticateToken, requireCreator, photoController.updatePhoto);
router.delete('/:id', authenticateToken, requireCreator, photoController.deletePhoto);

// Consumer-only routes
router.post('/:id/comment', authenticateToken, requireConsumer, photoController.addComment);
router.post('/:id/rate', authenticateToken, requireConsumer, photoController.ratePhoto);

module.exports = router;
