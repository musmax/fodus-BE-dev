const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const userValidation = require('../../validations/user.validation');
const userController = require('../../controllers/user.controller');

const router = express.Router();

router
  .route('/')
  .post(auth('users.add'), validate(userValidation.createUser), userController.createUser)
  .get(auth('users.view'), validate(userValidation.getUsers), userController.getUsers);
router
  .route('/add-more-role')
  .post(auth(), validate(userValidation.assignNewRoleToAnExistingUser), userController.createANewRoleForAnExistingUser);

router.route('/me').get(auth('users.view'), userController.getMe);
router.route('/validate/email').get(validate(userValidation.validateEmail), userController.validateEmail);
router.route('/validate/username').get(validate(userValidation.validateUsername), userController.validateUsername);

router
  .route('/password')
  .patch(auth('users.manage'), validate(userValidation.updatePassword), userController.updateUserPassword);

router
  .route('/:userId')
  .get(auth('users.view'), validate(userValidation.getUser), userController.getUser)
  .patch(auth('users.manage'), validate(userValidation.updateUser), userController.updateUser)
  .delete(auth('users.delete'), validate(userValidation.deleteUser), userController.deleteUser);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and retrieval
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a user
 *     description: Only admins can create other users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fisrtName
 *               - lastName
 *               - email
 *               - username
 *               - password
 *               - role
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                  type: string
 *               username:
 *                  type: string
 *               phoneNumber:
 *                  type: string
 *               email:
 *                 type: string
 *                 format: email
 *                 description: must be unique
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: At least one number and one letter
 *               role:
 *                 type: array
 *                 items:
 *                   type: number
 *                 description: Role id
 *                 example: [1, 2]
 *               userType:
 *                 type: string
 *                 enum: [admin, user]
 *                 description: User type
 *                 example: user
 *             example:
 *               firstName: fake name
 *               lastName: name
 *               email: fake@example.com
 *               username: fakeuser
 *               phoneNumber: "1234567890"
 *               role: ['user']
 *               userType: user
 *               password: password1
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/User'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all users
 *     description: Only admins can retrieve all users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: firstName
 *         schema:
 *           type: string
 *         description: First name
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 25
 *         description: Maximum number of users
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
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
 *                     $ref: '#/components/schemas/User'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 totalResults:
 *                   type: integer
 *                   example: 1
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */
/**
 * @swagger
 * /users/add-more-role:
 *   post:
 *     summary: Update a user role
 *     description: Only admins can create other users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fisrtName
 *               - lastName
 *               - email
 *               - username
 *               - password
 *               - role
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                  type: string
 *               username:
 *                  type: string
 *               phoneNumber:
 *                  type: string
 *               email:
 *                 type: string
 *                 format: email
 *                 description: must be unique
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: At least one number and one letter
 *               role:
 *                 type: array
 *                 items:
 *                   type: number
 *                 description: Role id
 *                 example: [1, 2]
 *               userType:
 *                 type: string
 *                 enum: [admin, user]
 *                 description: User type
 *                 example: user
 *             example:
 *               roleId: 1
 *               userId: 2
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/User'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 */

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get signed in user details
 *     description: Get currently signed in user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/User'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /users/validate/email:
 *   get:
 *     summary: Validate unique emails
 *     description: Validate unique emails
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: User email
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                type: boolean
 *         example: true
 */

/**
 * @swagger
 * /users/validate/username:
 *   get:
 *     summary: Validate unique usernames
 *     description: Validate unique usernames
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: User's username
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                type: boolean
 *         example: true
 */

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user
 *     description: Logged in users can fetch only their own user information. Only admins can fetch other users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/User'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a user
 *     description: Logged in users can only update their own information. Only admins can update other users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdateBody'
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                type: object
 *                properties:
 *                  success:
 *                    type: boolean
 *                    example: true
 *                  message:
 *                    type: string
 *                    example: User updated successfully
 *                  data:
 *                   type: string
 *                   example: sbdubowbeuwoehwe9832ik4p94jfn3ip...
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a user
 *     description: Logged in users can delete only themselves. Only admins can delete other users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User id
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

/**
 * @swagger
 * /users/password/:
 *   patch:
 *     summary: Update a user's password
 *     description: Logged in users can update their passwords.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: At least one number and one letter
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: At least one number and one letter
 *             example:
 *               oldPassword: password1
 *               newPassword: password2
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                type: object
 *                properties:
 *                  status:
 *                    type: boolean
 *                    example: true
 *                  message:
 *                    type: string
 *                    example: Password updated
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
