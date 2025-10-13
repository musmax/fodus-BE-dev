const express = require('express');
const validate = require('../../middlewares/validate');
const { countryValidation } = require('../../validations');
const { countryController } = require('../../controllers');

const router = express.Router();

router.route('/').get(validate(countryValidation.queryCountries), countryController.fetchAllCountries);

router.route('/:countryId').get(validate(countryValidation.getCountryById), countryController.fetchCountryById);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Countries
 *   description: Country management and retrieval
 */

/**
 * @swagger
 * /countries:
 *   get:
 *     summary: Get all countries
 *     description: All users can get list of countries.
 *     tags: [Countries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Country name
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
 *                   example: Countries fetched successfully
 *                 data:
 *                   $ref: '#/components/schemas/CountryList'
 */

/**
 * @swagger
 * /countries/{id}:
 *   get:
 *     summary: Get a country
 *     description: Get a country by ID.
 *     tags: [Countries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Country id
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
 *                   example: Country fetched successfully
 *                 data:
 *                   $ref: '#/components/schemas/Country'
 *
 */
