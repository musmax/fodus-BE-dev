const express = require('express');
const { uploadController } = require('../../controllers');
const upload = require('../../config/multer');

const router = express.Router();

router.route('/').post(upload.single('link'), uploadController.uploadFile);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Uploads
 *   description: File uploads
 */

/**
 * @swagger
 * /uploads:
 *   post:
 *     summary: Upload a file
 *     description: Users can upload file.
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - link
 *             properties:
 *               link:
 *                 type: string
 *                 format: binary
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Upload'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */
