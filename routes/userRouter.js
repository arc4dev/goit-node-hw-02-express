const express = require('express');
const {
  signup,
  logout,
  login,
  protect,
  verify,
  requestVerify,
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
router.get('/verify/:verificationToken', verify);
router.post('/verify', requestVerify);

module.exports = router;
