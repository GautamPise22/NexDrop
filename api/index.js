require('dotenv').config();

const { buildApp } = require('../app');

let app;

module.exports = async (req, res) => {
  if (!app) {
    app = await buildApp();
    await app.ready();
  }
  app.server.emit('request', req, res);
};
