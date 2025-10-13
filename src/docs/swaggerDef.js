const { version } = require('../../package.json');
const config = require('../config/config');

const swaggerDef = {
  openapi: '3.0.0',
  info: {
    title: 'Fodus store  API Documentation',
    version,
    license: {
      name: 'MIT',
      url: 'kendam/node-express-boilerplate-sequelize/blob/master/LICENSE',
    },
  },
  servers: [
    {
      url: `http://localhost:${config.port}/v1`,
    },
    // {
    //   url: `https://school-ease.onrender.com/v1`,
    // },
    {
      url: `https://fodus-api-dev.onrender.com/v1`,
    },
    {
      url: `https://fodus-be-dev.onrender.com/v1`,
    },
    // {
    //   url: `https://mdbstorebe-express.onrender.com/v1`,
    // },
  ],
};

module.exports = swaggerDef;
