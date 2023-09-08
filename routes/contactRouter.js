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

router.route('/').get(listContacts).post(addContact);

router
  .route('/:contactId')
  .get(protect, getContactById)
  .delete(removeContact)
  .put(updateContact);

router.patch('/:contactId/favourite', updateStatusContact);

module.exports = router;
