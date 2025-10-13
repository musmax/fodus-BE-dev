const express = require('express');
const validate = require('../../middlewares/validate');
const { variableValidation } = require('../../validations');
const { variableController } = require('../../controllers');

const router = express.Router();

router
  .route('/')
  .post(validate(variableValidation.createVariable), variableController.createVariable)
  .get(validate(variableValidation.getVariables), variableController.getVariables);

router
  .route('/:variableId')
  .get(validate(variableValidation.getVariable), variableController.getVariableById)
  .patch(validate(variableValidation.updateVariableById), variableController.updateVariableById)
  .delete(validate(variableValidation.deleteVariableById), variableController.deleteVariableById);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Variables
 *   description: Variable management and retrieval
 */

/**
 * @swagger
 * /variables:
 *   post:
 *     summary: Create a variable
 *     description: Only admins can create variables.
 *     tags: [Variables]
 *     security:
 *       - bearerAuth: []
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
 *             example:
 *               name: username
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Variable'
 *       "400":
 *         $ref: '#/components/responses/NotFound'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all variables
 *     description: Only admins can retrieve all variables.
 *     tags: [Variables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *      - in: query
 *        name: name
 *        schema:
 *          type: string
 *          description: Variable name
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
 *                     $ref: '#/components/schemas/Variable'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /variables/{id}:
 *   get:
 *     summary: Get a variable
 *     description: Only admins can fetch variables.
 *     tags: [Variables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Variable id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Variable'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a variable
 *     description: Only admins can update variables.
 *     tags: [Variables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Variable id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *             example:
 *               name: lastName
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Variable'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a Variable
 *     description: Only admins can delete variables.
 *     tags: [Variables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Variable id
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
