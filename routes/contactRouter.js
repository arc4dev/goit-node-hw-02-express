const express = require('express');

const {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
} = require('../controllers/contactController');

const { protect } = require('../controllers/authController');

const router = express.Router();

router.route('/').get(protect, listContacts).post(protect, addContact);

router
  .route('/:contactId')
  .get(protect, getContactById)
  .delete(protect, removeContact)
  .put(protect, updateContact);

router.patch('/:contactId/favourite', protect, updateStatusContact);

module.exports = router;
