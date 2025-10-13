const express = require('express');
const validate = require('../../middlewares/validate');
const { ratingValidation } = require('../../validations');
const { ratingController } = require('../../controllers');
const auth = require('../../middlewares/auth');

const router = express.Router();

router
  .route('/')
  .post(validate(ratingValidation.createRating), ratingController.createRating)
  .get(validate(ratingValidation.getRatings), ratingController.getRatings);

router
  .route('/:id')
  .get(validate(ratingValidation.getRatingById), ratingController.getRatingById)

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Ratings
 *   description: Rating management and retrieval
 */


/**
 * @swagger
 * /ratings:
 *   post:
 *     summary: Create a Rating
 *     description: Only admins can create a Rating.
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Rating'
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
 *                   example: Rating created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Rating'
 *
 *   get:
 *     summary: Get all Ratings
 *     description: Only admins can retrieve all Ratings.
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *      - in: query
 *        name: productId
 *        schema:
 *          type: integer
 *          description: Rating productId
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
 *                     $ref: '#/components/schemas/Rating'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /ratings/{id}:
 *   get:
 *     summary: Get a Rating
 *     description: Only admins can fetch Ratings.
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Rating id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Rating'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
