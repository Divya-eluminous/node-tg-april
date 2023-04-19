const mongoose = require('mongoose');
const roleSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Please enter role name']
    },
   
},{ timestamps:true});



const role = new mongoose.model('role',roleSchema);
module.exports = role;