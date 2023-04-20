const bcrypt = require('bcrypt');
const user = require('../schemas/userSchema');
const { isValidObjectId } = require('mongoose');
const fs = require('fs');
const path = require('path');
const role = require('../schemas/roleSchema');
const jwtToken = require('../middleware/auth');
const userRoles = require('../schemas/userRoleSchema');
const helper = require('../helper/helper');

async function createUser(req,res)
{
    var first_name= req.body.first_name;
    var last_name= req.body.last_name;
    var email= req.body.email;
    var password= req.body.password;
    if(password)
    {
        password = await bcrypt.hash(password,10);
    }
    
    //If profile photo not found show error
    if(!req.file){
        return res.send({
            status:"error",
            message:'Please select profile photo',
            error:'Profile photo is required',
            data:null
        });
    }

    var userData = {
        first_name : req.body.first_name,
        last_name : req.body.last_name,
        email : req.body.email,
        password:password,
        profile_photo:req.file.filename,
        profile_photo_path:req.file.destination.replace('.','')+req.file.filename,
        status:1
    }
    
    const User = new user(userData);
    User.save().then(async(result)=>{
        if(result)
        {
            //Assing multiple role to user here
            var roleArr = req.body.role_id;
            console.log(roleArr);

            if(roleArr)
            {
                var roles = roleArr[0].split(',');
                console.log(roles);
                for(var i=0;i<roles.length;i++)
                {
                    var userRoleData={
                        user_id:result._id,
                        role_id:roles[i]
                    }
                    await userRoles.create(userRoleData)
                    .then((insertedUser) => {
                        console.log(insertedUser);
                    })
                    .catch((error) => {
                        console.error(error);
                    });
                }//for
            }//if roleArr


            var data = {
                first_name:result.first_name,
                last_name:result.last_name,
                email:result.email,
                profile_photo:result.profile_photo,
                profile_photo_path:result.profile_photo_path,
            }
            return res.send({
                status:'success',
                message:'User saved successfully.',
                error:null,
                data:data
               });
        }
        else
        {
            return res.send({
                status:'error',
                message:'User not created.',
                error:null,
                data:null
            });
        }
    }).catch((error)=>{
        if (error.code === 11000) {
            return res.send({
                status:'error',
                message:'User not created.',
                error:'email must be unique',
                data:null
            });
        }else
        {
            return res.send({
                status:'error',
                message:'User not created.',
                error:error.message,
                data:null
            });  
        } 
    });

}//createUser

async function updateUser(req,res)
{
    var userId = req.params.id;
    if(isValidObjectId(userId))
    {
     const updateUser = user.updateOne(
        {
            _id:userId
        },
        {
            $set:{
                first_name:req.body.first_name,
                last_name:req.body.last_name,
                email:req.body.email
            }
        },
        { runValidators: true } // apply validation at the time of update which are in schema
    ).then((result)=>{       
        if(result.modifiedCount==1 || result.matchedCount==1)
        {
            res.send({
                status:'success',
                message:'User updated successfully.',
                error:null,
                data:null
            });
        }
        else{
            res.send({
                status:'error',
                message:'Unable to update the user.',
                error:null,
                data:null
            });
        }       
    }).catch((error)=>{
        res.send({
            status:'error',
            message:'Unable to update the user.',
            error:error.message,
            data:null
        });
    });
  }else
  {
    res.send({
        message:'User id is not valid.',
        error:null,
        data:null
    });
  }

}//update-user

async function deleteUser(req,res){
    const userId = req.params.id;
    await user.validateUserId(userId).then((data)=>{
        const deleteUser = user.deleteOne({_id:userId}).then((result)=>{
            if(result.deletedCount==1){
               res.send({
                 status:'error',
                 message:'User deleted successfully.',
                 error:null,
                 data:null
             });
            }else
            {
               res.send({
                 status:'error',
                 message:'User not deleted.',
                 error:'Unable to delete the user.',
                 data:null
              });
            }
         }).catch((error)=>{
              res.send({
                 status:'error',
                 message:'User not deleted.',
                 error:error.message,
                 data:null
             });
         });
    }).catch((error)=>{
        res.send({
            status:'error',
            message:'User not found.',
            error:error.message,
            data:null
        });    
    });  

}//deleteUser

async function getDetails(req,res){
 const userId = req.params.id;
    await user.validateUserId(userId).then(async(data)=>{
        const userData = await user.find({_id:userId}).populate([
            {
                model:'User',
                path:'roleslist'
            }
        ]).then(async(result)=>{
           
            // Folder path of profile photo
            const folderPath = './uploads/profile_photo/';

            // File name to check
            const fileName = result[0]['profile_photo'];
            
            // Full path of the file
            const filePath = path.join(folderPath, fileName);

            // Check if file exists
            profilePhoto = profilePhotoPath ='';
            fs.access(filePath, fs.constants.F_OK, (err) => {
                if (err) {
                 // console.error(`File ${fileName} does not exist`);
                profilePhoto = '';
                profilePhotoPath = '';
                } else {
                 //console.log(`File ${fileName} exists`);
                  profilePhoto = result[0]['profile_photo']?result[0]['profile_photo']:'';
                  profilePhotoPath = result[0]['profile_photo_path']?result[0]['profile_photo_path']:'';
                }
            });

            var getRolesList=[];
            if(result[0]['roleslist']){
                var getRolesList = await helper.getUserRoles(result[0]['roleslist']);
            }

            res.send({
                status:'success',
                message:'User details found successfully.',
                error:null,
                data:{
                    first_name:result[0]['first_name']?result[0]['first_name']:'',
                    last_name:result[0]['last_name']?result[0]['last_name']:'',
                    email:result[0]['email']?result[0]['email']:'',
                    profile_photo:profilePhoto?profilePhoto:'',
                    profile_photo_path:profilePhotoPath?profilePhotoPath:'',
                    status:result[0]['status']?result[0]['status']:'',
                    roles:getRolesList?getRolesList:[]
                }
            });  

        }).catch((error)=>{
            res.send({
                status:'error',
                message:'User details not found.',
                error:error.message,
                data:null
            });  
        });
    }).catch((error)=>{
        res.send({
            status:'error',
            message:'User not found.',
            error:error.message,
            data:null
        });    
    });      
}//getDetails

async function getUserList(req,res){
    const pageno = req.body.page_no;
    const limit = req.body.limit;
    const firstName = req.body.first_name;
    const lastName = req.body.last_name;
    var totalCount=0;
    var totalPages=0;
    const filter = {};

    if (req.body.email) {
        filter.email = req.body.email ? req.body.email : null;
    }
    if (req.body.status) {
        filter.status = req.body.status ? req.body.status : null;
    }
    if (req.body.name) {
        const regex = new RegExp(req.body.name, 'i');
        filter.$expr = {
          $regexMatch: {
            input: { $concat: ['$first_name', ' ', '$last_name'] },
            regex: regex
          }
        };
      } 

    user.countDocuments(filter)
    .then((count) => {
        console.log(`There are ${count} documents in the model.`);
        totalCount = `${count}`;
    })
    .catch((err) => {
        console.error(err);
    });
    const userData = await user.find(filter)
    .select('_id first_name last_name email status profile_photo profile_photo_path')
    .populate([
        {
            path:'roleslist',
            model:'User'                 
        },       
    ])
    //.populate('roles')
    .skip((pageno-1)*limit)
    .limit(limit)
    .then(async(result)=>{
        if(result.length>0)
        {  
            // Folder path
            const folderPath = './uploads/profile_photo/';    
            for (var i in result) 
            {           
                
                //console.log(result[i]['roleslist'])   
                var roleListArr =  result[i]['roleslist'];

                if(roleListArr){
                    for(var j in roleListArr)
                    {
                       var roleName = ''; var roleInfo = [];
                        var getRoleName= await role.findOne({_id:roleListArr[j]['role_id']});
                            var roleName = getRoleName.name?getRoleName.name:'';
                            console.log(roleName);
                           var roleData={};
                            roleData = {
                                _id:roleListArr[j]['_id'],
                                role_id : roleListArr[j]['role_id'],
                                user_id : roleListArr[j]['user_id'],
                                role_name :roleName
                            }
                          result[i].roleslist[j] =roleData;
                    }//for loop
                }//if roleListArr
              

                var fileName = result[i]['profile_photo'];    
                var filePath = path.join(folderPath, fileName);                    
                    
                if (fs.existsSync(filePath)) {
                    result[i]['profile_photo'] = result[i]['profile_photo']?result[i]['profile_photo']:'';
                    result[i]['profile_photo_path'] = result[i]['profile_photo_path']?result[i]['profile_photo_path']:'';
                }else{
                    result[i]['profile_photo'] ='NA';
                    result[i]['profile_photo_path'] ='NA'; 
                }               

            }//for loop
                      
            totalPages = Math.ceil(totalCount/limit);
            res.send({
                status:'success',
                message:'User details found successfully.',
                error:null,
                data:result,
                count:totalCount,
                totalPages:totalPages
            });  
        }//if 
        else
        { 
            res.send({
                status:'error',
                message:'User details not found.',
                error:null,
                data:null
            });  
        }//else

    }).catch((error)=>{
        res.send({
            status:'error',
            message:'User details not found.',
            error:error.message,
            data:null
        });  
    });
}//getUserList

async function login(req,res)
{
    var email = req.body.email;
    var password = req.body.password;
    var getUser = await user.findOne({email:email}).populate([
        {
            model:'User',
            path:'roleslist'
        }
    ]).then(async(data)=>{
        if(data)
        {
           // console.log(data.roleslist);
            var dbPassword = data.password;
            const resPassword =  await bcrypt.compare(password,dbPassword);
            if(resPassword)
            {
                const token = jwtToken.generateToken(data._id);
                updateAccessToken = await user.updateOne({email:email},{ $set:{api_access_token :token } }).then(async(updated)=>{

                    var getUserRoleList = await helper.getUserRoles(data.roleslist);
                    const userData={
                        id:data._id,
                        name:data.name,
                        email:data.email,
                        age:data.age,
                        status:data.status,
                        profile_photo_path:data.profile_photo_path,
                        token:token,
                        roles:getUserRoleList?getUserRoleList:[]
                    }
                     res.send({
                        status:"success",
                        message:'user login successfully.',
                        error:null,
                        data:userData
                    });
                }).catch((error)=>{
                     res.send({
                        status:"error",
                        message:'User data not updated.',
                        error:error.message,
                        data:null
                    });
                });              
            }else{
                 res.send({
                    status:"error",
                    message:'Incorrect username or password.',
                    error:null,
                    data:null
                });
            }//else
        }else{
             res.send({
                status:"error",
                message:'User not found.',
                error:'Not found',
                data:null
            });
        }//else
    }).catch((error)=>{
         res.send({
            status:"error",
            message:'User not found.',
            error:error.message,
            data:null
        });
    });

}//login

async function logout(req,res)
{
    var userId = req.body.user_id;
    var getUser = await user.findOne({_id:userId}).then(async(data)=>{
        if(data)
        {
           var api_access_token = data.api_access_token;
           var updateToken = await user.updateOne({_id:userId},{$set:{api_access_token:''}}).then(async(data)=>{
             res.send({
                status:"success",
                message:'User logout successfully.',
                error:null,
                data:null
            }); 
           }).catch((error)=>{
                 res.send({
                    status:"error",
                    message:'Unable to logout.',
                    error:'Unable to logout the user.',
                    data:null
                });
           });
        }   
        else
        {
             res.send({
                status:"error",
                message:'User not found.',
                error:'Not found',
                data:null
            });
        }

    }).catch((error)=>{
         res.send({
            status:"error",
            message:'User not found.',
            error:error.message,
            data:null
        });
    });   

}//logout

module.exports = {
    createUser,
    updateUser,
    deleteUser,
    getDetails,
    getUserList,
    login,
    logout
}