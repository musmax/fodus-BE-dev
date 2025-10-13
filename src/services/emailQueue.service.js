const logger = require('../config/logger');
const { sendOrderConfirmationEmail, sendOrderNotificationToOwner } = require('./email.service');

/**
 * Simple in-memory email queue with retry logic
 */
class EmailQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.maxRetries = 3;
    this.retryDelay = 5000; // 5 seconds
  }

  /**
   * Add email job to queue
   * @param {Object} emailJob - Email job data
   * @param {string} emailJob.type - Type of email ('order_confirmation', 'owner_notification')
   * @param {Object} emailJob.data - Email data (order data, etc.)
   * @param {number} emailJob.attempts - Number of attempts (default: 0)
   */
  add(emailJob) {
    const job = {
      id: Date.now() + Math.random(),
      type: emailJob.type,
      data: emailJob.data,
      attempts: emailJob.attempts || 0,
      createdAt: new Date(),
      nextAttempt: new Date()
    };

    this.queue.push(job);
    logger.info(`Email job added to queue: ${job.type} (ID: ${job.id})`);
    
    // Start processing if not already processing
    this.process();
  }

  /**
   * Process email queue
   */
  async process() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;
    logger.info(`Starting email queue processing. Jobs in queue: ${this.queue.length}`);

    while (this.queue.length > 0) {
      const job = this.queue.shift();
      
      // Check if job is ready for processing
      if (job.nextAttempt > new Date()) {
        // Put job back at the end of queue
        this.queue.push(job);
        continue;
      }

      try {
        await this.executeJob(job);
        logger.info(`Email job completed successfully: ${job.type} (ID: ${job.id})`);
      } catch (error) {
        logger.error(`Email job failed: ${job.type} (ID: ${job.id})`, error);
        
        // Retry logic
        if (job.attempts < this.maxRetries) {
          job.attempts++;
          job.nextAttempt = new Date(Date.now() + (this.retryDelay * job.attempts));
          this.queue.push(job);
          logger.info(`Email job queued for retry: ${job.type} (ID: ${job.id}, attempt: ${job.attempts})`);
        } else {
          logger.error(`Email job failed permanently after ${this.maxRetries} attempts: ${job.type} (ID: ${job.id})`);
        }
      }
    }

    this.processing = false;
    logger.info('Email queue processing completed');
  }

  /**
   * Execute individual email job
   * @param {Object} job - Email job
   */
  async executeJob(job) {
    switch (job.type) {
      case 'order_confirmation':
        await sendOrderConfirmationEmail(job.data);
        break;
      
      case 'owner_notification':
        await sendOrderNotificationToOwner(job.data);
        break;
      
      default:
        throw new Error(`Unknown email job type: ${job.type}`);
    }
  }

  /**
   * Get queue status
   * @returns {Object} Queue status
   */
  getStatus() {
    return {
      queueLength: this.queue.length,
      processing: this.processing,
      jobs: this.queue.map(job => ({
        id: job.id,
        type: job.type,
        attempts: job.attempts,
        nextAttempt: job.nextAttempt
      }))
    };
  }

  /**
   * Clear queue (for testing)
   */
  clear() {
    this.queue = [];
    logger.info('Email queue cleared');
  }
}

// Create singleton instance
const emailQueue = new EmailQueue();

// Process queue every 30 seconds as backup
setInterval(() => {
  emailQueue.process();
}, 30000);

module.exports = emailQueue;
