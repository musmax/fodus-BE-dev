const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { permissionValidation } = require('../../validations');
const { permissionController } = require('../../controllers');

const router = express.Router();

router.route('/').get(auth('permissions.view'), permissionController.getPermissions);

router
  .route('/:permissionId')
  .get(auth('permissions.view'), validate(permissionValidation.getPermissionById), permissionController.getPermissionById);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Permissions
 *   description: Permission management and retrieval
 */

/**
 * @swagger
 * /permissions:
 *   get:
 *     summary: Get all permissions
 *     description: Only admins can get permissions.
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
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
 *                     $ref: '#/components/schemas/Permission'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /permissions/{id}:
 *   get:
 *     summary: Get a permission
 *     description: Only admins can fetch permissions by Id.
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Permission id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Permission'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
