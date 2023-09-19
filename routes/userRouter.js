const express = require('express');
const {
  signup,
  logout,
  login,
  protect,
} = require('../controllers/authController');
const {
  getMe,
  uploadPhoto,
  updatePhoto,
  resizePhoto,
} = require('../controllers/userController');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', protect, getMe);

router.patch('/avatars', protect, uploadPhoto, resizePhoto, updatePhoto);

module.exports = router;
