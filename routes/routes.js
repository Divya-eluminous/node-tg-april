const express = require('express');
const app = express();
const userRoutes = require('../routes/user');
const roleRoutes = require('./role');

module.exports = function(app){
  app.use('/api/user',userRoutes);
  app.use('/api/role',roleRoutes);

}