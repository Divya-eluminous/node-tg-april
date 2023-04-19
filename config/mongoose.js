const mongoose = require('mongoose');
const mongoDBUrl = 'mongodb://localhost:27017/Node-TG-April';
mongoose.connect(mongoDBUrl).then(()=>{
    console.log('connected to db');
}).catch((error)=>{
   console.log('error:'+error);
});
const db = mongoose.connection;
module.exports = db;