const express = require('express');
const validate = require('../../middlewares/validate');
const { productValidation } = require('../../validations');
const { productController } = require('../../controllers');
const auth = require('../../middlewares/auth');

const router = express.Router();

router
  .route('/')
  .post(auth(), validate(productValidation.createProduct), productController.createProduct)
  .get(auth('optional'), validate(productValidation.getProducts), productController.getProducts);

router
  .route('/:id')
  .get(validate(productValidation.getProductById), productController.getProductById)
  .patch(auth(), validate(productValidation.updateProductById), productController.updateProductById)
  .delete(auth(), validate(productValidation.getProductById), productController.deleteProductById);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management and retrieval
 */


/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a Product
 *     description: Only admins can create a Product.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
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
 *                   example: Product created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *
 *   get:
 *     summary: Get all Products musa
 *     description: Only admins can retrieve all Products.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *      - in: query
 *        name: name
 *        schema:
 *          type: string
 *          description: Product name
 *      - in: query
 *        name: availableColors
 *        schema:
 *          type: string
 *          description: Product availableColors
 *      - in: query
 *        name: availableSizes
 *        schema:
 *          type: string
 *          description: Product availableSizes
 *      - in: query
 *        name: section
 *        schema:
 *          type: string
 *          description: Product section
 *      - in: query
 *        name: category
 *        schema:
 *          type: string
 *          description: Product category
 *      - in: query
 *        name: isOutOfStock
 *        schema:
 *          type: boolean
 *          description: Product isOutOfStock
 *      - in: query
 *        name: price
 *        schema:
 *          type: integer
 *          description: Product price
 *      - in: query
 *        name: page
 *        schema:
 *          type: integer
 *          description: page number
 *      - in: query
 *        name: paginate
 *        schema:
 *          type: integer
 *          minimum: 1
 *        default: 25
 *        description: Maximum number of message templates to return. Default is 25.
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
 *                     $ref: '#/components/schemas/Product'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get a Product
 *     description: Only admins can fetch Products.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Product'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a Product
 *     description: Only admins can update Products.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProduct'
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
 *   delete:
 *     summary: Delete a product
 *     description: Only admins can delete a product.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product id
 *     responses:
 *       "200":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
