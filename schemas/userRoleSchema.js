const mongoose = require('mongoose');
const userRoleSchema = new mongoose.Schema({
    user_id:{
        // type:String,
        type: mongoose.Schema.Types.ObjectId,
        required:[true,'Please enter user id'],       
        ref:"User"
    },
    role_id:{
        // type:String,
        type:mongoose.Schema.Types.ObjectId,
        required:[true,'Please enter role id'],
        ref:"role"
    },
   
},{ timestamps:true},{ virtuals:true });

/*
userRoleSchema.virtual('roleInfo',{
    ref: 'role',
    localField: 'role_id',
    foreignField: 'role_id',
})*/



const userRole = new mongoose.model('user_role',userRoleSchema);
module.exports = userRole;