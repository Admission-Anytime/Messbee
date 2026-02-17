const express = require('express');
const router = express.Router();
const { getLabels, createLabel, updateLabel, deleteLabel } = require('../controllers/labelController');

// Define Routes
router.get('/', getLabels);
router.post('/', createLabel);
router.put('/:id', updateLabel);
router.delete('/:id', deleteLabel);

module.exports = router;