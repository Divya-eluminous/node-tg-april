const mongoose = require('mongoose');
const validate  = require('mongoose-validator');

const UserSchema = new mongoose.Schema({
    first_name:{
        type:String,
        required:[true,'Please enter first name'],
        validate:[
           {
                validator:function(value){
                    return value.length >= 2 && value.length <= 10;
                },
                message: 'First name should be between 2 and 10 characters long.',
            },
            {
                validator: function(value) {
                  return /^[a-zA-Z]+$/.test(value);
                },
                message: 'First name should contain only letters.',
            }            
        ]
    },
    last_name:{
        type:String,
        required:[true,'Please enter last name'],
        validate:[
           {
                validator:function(value){
                    return value.length >= 2 && value.length <= 10;
                },
                message: 'Last name should be between 2 and 10 characters long.',
            },
            {
                validator: function(value) {
                  return /^[a-zA-Z]+$/.test(value);
                },
                message: 'Last name should contain only letters.',
            }            
        ]
    },
    email:{
        type:String,
        required:[true,'Please enter email'],
        unique:true,
        validate: validate({
            validator: 'isEmail',
            message: 'Email field should be a valid email address',
        }),
    },
    password:{
        type:String,
        required:[true,'Please enter password']      
    },
    profile_photo:{
        type:String,
        required:true
    },
    profile_photo_path:{
        type:String,
        required:true
    },
    status:{
        type:Number,
        default:1
    },
    api_access_token:{
        type:String,
        required:false
    }
   
},
{ timestamps: false, toJSON: { virtuals: true } } // Added virutal true to set the user roles

);

// Added virutal true to set the user roles in populate function user model and path as roleslist
UserSchema.virtual('roleslist',{
    ref: 'user_role',
    localField: '_id',
    foreignField: 'user_id',
})


//custom validation for validating user id
const validateUserId = async function(userId){
  const user = await this.model('User').findOne({ _id: userId });
  if (!user) {
    throw new Error('Invalid user ID');
  }
}

UserSchema.statics.validateUserId = validateUserId;

const User = new mongoose.model('User',UserSchema);
module.exports = User;

