const express = require('express');
const validate = require('../../middlewares/validate');
const { feedbackValidation } = require('../../validations');
const { feedbackController } = require('../../controllers');

const router = express.Router();

router
  .route('/')
  .post(validate(feedbackValidation.createFeedback), feedbackController.createFeedback)
  .get(validate(feedbackValidation.getFeedbacks), feedbackController.getFeedbacks);

router
  .route('/:feedbackId')
  .get(validate(feedbackValidation.getFeedback), feedbackController.getFeedback)
  .patch(validate(feedbackValidation.updateFeedback), feedbackController.updateFeedback)
  .delete(validate(feedbackValidation.deleteFeedback), feedbackController.deleteFeedback);

module.exports = router;


/**
 * @swagger
 * tags:
 *   name: feedback
 *   description: Feedback management and retrieval
 */

/**
 * @swagger
 * /feedback:
 *   post:
 *     summary: Create a Feedback
 *     description: Only admins can create a Feedback.
 *     tags: [feedback]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Feedback'
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Feedback created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Feedback'
 *
 *   get:
 *     summary: Get all feeback
 *     description: Only admins can retrieve all feeback.
 *     tags: [feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *      - in: query
 *        name: name
 *        schema:
 *          type: string
 *          description: Feedback name
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Feedback'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /feedback/{id}:
 *   get:
 *     summary: Get a Feedback
 *     description: Only admins can fetch feeback.
 *     tags: [feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Feedback id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Feedback'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a Feedback
 *     description: Only admins can update feeback.
 *     tags: [feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Feedback id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Feedback'
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Crime updated successfully
 * 
 *
 *   delete:
 *     summary: Delete a Feedback
 *     description: Only admins can delete feeback.
 *     tags: [feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Feedback id
 *     responses:
 *       "204":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */