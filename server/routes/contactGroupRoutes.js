const express = require('express');
const {
  getContactGroups,
  getContactGroup,
  createContactGroup,
  updateContactGroup,
  deleteContactGroup,
  addContactsToGroup
} = require('../controllers/contactGroupController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getContactGroups)
  .post(createContactGroup);

router.route('/:id')
  .get(getContactGroup)
  .put(updateContactGroup)
  .delete(deleteContactGroup);

router.post('/:id/contacts', addContactsToGroup);

module.exports = router;

