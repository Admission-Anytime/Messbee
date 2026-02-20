const express = require('express');
const router = express.Router();
const { 
    getLabels, 
    createLabel, 
    updateLabel, 
    deleteLabel,
    initializeSystemLabels
} = require('../controllers/labelController');

/**
 * @swagger
 * tags:
 *   name: Labels
 *   description: Label management endpoints
 */

/**
 * @swagger
 * /api/labels:
 *   get:
 *     summary: Get all labels
 *     tags: [Labels]
 *     responses:
 *       200:
 *         description: List of all labels
 */
router.get('/', getLabels);

/**
 * @swagger
 * /api/labels:
 *   post:
 *     summary: Create a new label
 *     tags: [Labels]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               desc:
 *                 type: string
 *               color:
 *                 type: string
 *     responses:
 *       201:
 *         description: Label created successfully
 */
router.post('/', createLabel);

/**
 * @swagger
 * /api/labels/{id}:
 *   put:
 *     summary: Update a label
 *     tags: [Labels]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Label updated successfully
 */
router.put('/:id', updateLabel);

/**
 * @swagger
 * /api/labels/{id}:
 *   delete:
 *     summary: Delete a label
 *     tags: [Labels]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Label deleted successfully
 */
router.delete('/:id', deleteLabel);

/**
 * @swagger
 * /api/labels/initialize/system:
 *   post:
 *     summary: Initialize system labels
 *     tags: [Labels]
 *     responses:
 *       201:
 *         description: System labels initialized
 */
router.post('/initialize/system', initializeSystemLabels);

module.exports = router;
