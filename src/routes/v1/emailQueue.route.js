const express = require('express');
const auth = require('../../middlewares/auth');
const { emailQueueController } = require('../../controllers');

const router = express.Router();

router
  .route('/status')
  .get(auth(), emailQueueController.getEmailQueueStatus);

router
  .route('/clear')
  .post(auth(), emailQueueController.clearEmailQueue);

module.exports = router;
