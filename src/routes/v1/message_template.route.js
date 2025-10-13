const express = require('express');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const { messageTemplateValidation } = require('../../validations');
const { messageTemplateController } = require('../../controllers');

const router = express.Router();

router
  .route('/')
  .post(
    auth('message_templates.manage'),
    validate(messageTemplateValidation.createMessageTemplate),
    messageTemplateController.createMessageTemplate
  )
  .get(
    auth('message_templates.view'),
    validate(messageTemplateValidation.getMessageTemplates),
    messageTemplateController.getMessageTemplates
  );

router
  .route('/:messageTemplateId')
  .get(
    auth('message_templates.view'),
    validate(messageTemplateValidation.getMessageTemplateById),
    messageTemplateController.getMessageTemplateById
  )
  .patch(
    auth('message_templates.manage'),
    validate(messageTemplateValidation.updateMessageTemplateById),
    messageTemplateController.updateMessageTemplateById
  )
  .delete(
    auth('message_templates.manage'),
    validate(messageTemplateValidation.deleteMessageTemplateById),
    messageTemplateController.deleteMessageTemplateById
  );

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Message Templates
 *   description: Message Templates management and retrieval
 */

/**
 * @swagger
 * /message-templates:
 *   post:
 *     summary: Create a message template
 *     description: Only admins can create message templates.
 *     tags: [Message Templates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               messageTemplate:
 *                 $ref: '#/components/schemas/MessageTemplate'
 *               variables:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Variable'
 *           example:
 *             messageTemplate:
 *               title: Welcome Email
 *               description: Welcome email to new users
 *               emailSubject: Welcome to the platform
 *               emailBody: Hello {{username}}, welcome to the platform
 *               smsSubject: Welcome to the platform
 *               smsBody: Hello {{username}}, welcome to the platform
 *             variables:
 *              - name: username
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/MessageTemplate'
 *       "400":
 *         $ref: '#/components/responses/VariableNotFound'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all message templates
 *     description: Only admins can retrieve all message templates.
 *     tags: [Message Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *      - in: query
 *        name: title
 *        schema:
 *          type: string
 *          description: Message template title
 *      - in: query
 *        name: page
 *        schema:
 *          type: string
 *          description: page number
 *      - in: query
 *        name: limit
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
 *                     $ref: '#/components/schemas/MessageTemplate'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /message-templates/{id}:
 *   get:
 *     summary: Get a message template
 *     description: Only admins can fetch a message template.
 *     tags: [Message Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Message template id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/MessageTemplate'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a message template
 *     description: Only admins can update message templates.
 *     tags: [Message Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Message template id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               messageTemplate:
 *                 $ref: '#/components/schemas/MessageTemplate'
 *               variables:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Variable'
 *           example:
 *             messageTemplate:
 *               title: Welcome Email
 *               description: Welcome email to new users
 *               emailSubject: Welcome to the platform
 *               emailBody: Hello {{username}}, welcome to the platform
 *               smsSubject: Welcome to the platform
 *               smsBody: Hello {{username}}, welcome to the platform
 *             variables:
 *              - name: username
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/MessageTemplate'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a message template
 *     description: Only admins can delete message templates.
 *     tags: [Message Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Message template id
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
