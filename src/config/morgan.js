const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const config = require('./config');
const logger = require('./logger');
const { AuditTrail } = require('../models/auditTrail.model');
const { User } = require('../models/user.model');

morgan.token('message', (req, res) => res.locals.errorMessage || '');

const getIpFormat = () => (config.env === 'production' ? ':remote-addr - ' : '');
const successResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms`;
const errorResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms - message: :message`;

const successHandler = morgan(successResponseFormat, {
  skip: (req, res) => res.statusCode >= 400,
  stream: { write: (message) => logger.info(message.trim()) },
});

const errorHandler = morgan(errorResponseFormat, {
  skip: (req, res) => res.statusCode < 400,
  stream: { write: (message) => logger.error(message.trim()) },
});

const logData = async (req, res, next) => {
  let actor;

  // Log out authorization header
  if (req.headers.authorization) {
    actor = 'registered user';
    // decode token
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findByPk(decoded.sub);
    actor = user.username;
  }

  if (!req.headers.authorization) {
    actor = 'anonymous user';
  }

  // Log out response status
  if (res.statusCode < 500) {
    await AuditTrail.create({
      action: req.method,
      browser: req.headers['user-agent'],
      route: req.path,
      ip: req.socket.remoteAddress,
      module: req.path.split('/')[2],
      actor,
      status: res.statusCode,
    });
  }

  next();
};

module.exports = {
  successHandler,
  errorHandler,
  logData,
};
