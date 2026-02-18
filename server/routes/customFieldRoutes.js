const express = require('express');
const router = express.Router();
const { createField, getFields, updateField, deleteField } = require('../controllers/customFieldController');

router.post('/', createField);
router.get('/', getFields);
router.put('/:id', updateField); // Edit aur Toggle
router.delete('/:id', deleteField); // Delete 

module.exports = router;