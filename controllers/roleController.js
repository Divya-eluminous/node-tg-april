const { isValidObjectId } = require('mongoose');
const role = require('../schemas/roleSchema');
const userRoles = require('../schemas/userRoleSchema');

async function createRole(req,res){
    var name = req.body.name;
    var checkExists = role.findOne({name:name}).then((result)=>{
        console.log(result);
        if (result) {           
             res.send({
                status:'error',
                message:'Role already exists',
                error:'Already exists',
                data:null 
             });
        }else
        {
            var roleData={
                name:name
            }
            const Role = new role(roleData);
            Role.save().then((data)=>{
                res.send({
                    status:'success',
                    message:'User role created successfully.',
                    error:null,
                    data:null 
                });
            }).catch((error)=>{
                res.send({
                status:'error',
                message:'Unable to create role',
                error:'Role not created',
                data:null 
                });
            });
        }//else      
    });        
}//create role
async function updateRole(req,res)
{
    var name= req.body.name;
    var roleId = req.params.id;
    console.log(roleId);

    if(isValidObjectId(roleId))
    {
        var isExists = role.findOne({name:name}).then((data)=>{
          
            if(data && data._id!=roleId)
            {
                res.send({
                    status:'error',
                    message:'Unable to update, role already exists.',
                    error:'Role not updated',
                    data:null 
                 });   
            }
            else
            {
                var updateRole = role.updateOne({_id:roleId},{ $set:{name:name }}).then((result)=>{
                    res.send({
                        status:'success',
                        message:'Role updated successfully',
                        error:null,
                        data:null 
                     });
                }).catch((error)=>{
                    res.send({
                        status:'error',
                        message:'Unable to update role',
                        error:error.message,
                        data:null 
                     });
                });
            }
            
        }).catch((error)=>{
            res.send({
                status:'error',
                message:'Unable to update role',
                error:error.message,
                data:null 
             });
        });

    }else{
         res.send({
            status:'error',
            message:'Unable to update role',
            error:'Role not updated',
            data:null 
         });
    }
    
}//updateRole

async function getRoles(req,res){
    console.log('in get roles function');

    const loginId = req.body.login_id;
    const pageno = req.body.page_no || 1;
    const limit = parseInt(req.body.limit)||10;
    var totalCount=0;
    var totalPages=0;
    const filter = {};
    if (req.body.name) {
        filter.name = req.body.name ? req.body.name : null;
    }//
    role.countDocuments(filter)
    .then((count) => {
        console.log(`There are ${count} documents in the model.`);
        totalCount = `${count}`;
    })
    .catch((err) => {
        console.error(err);
    });

    const userData = await role.find(filter)
    .select('_id name')
    .skip((pageno-1)*limit)
    .limit(limit)
    .then((result)=>{
        if(result.length>0)
        {  
            totalPages = Math.ceil(totalCount/limit);
            res.send({
                status:'success',
                message:'Role found successfully.',
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
                message:'Role not found.',
                error:null,
                data:null
            });  
        }//else

    }).catch((error)=>{
        res.send({
            status:'error',
            message:'Role not found.',
            error:error.message,
            data:null
        });  
    });
}//getRoles

async function deleteRole(req,res){
    const roleId = req.params.id;
    if(isValidObjectId(roleId))
    {
        const deleteRole = role.deleteOne({_id:roleId}).then((result)=>{
            if(result.deletedCount==1){
               res.send({
                 status:'success',
                 message:'Role deleted successfully.',
                 error:null,
                 data:null
             });
            }else
            {
               res.send({
                 status:'error',
                 message:'Role not deleted.',
                 error:'Unable to delete the role.',
                 data:null
             });
            }
         }).catch((error)=>{
              res.send({
                status:'error',
                 message:'Role not deleted.',
                 error:error.message,
                 data:null
             });
         });
    }else
    {
        res.send({
            status:'error',
            message:'Role not found.',
            error:'Unable to find the role.',
            data:null
        });   
    }
}//deleteRole

async function assignRole(req,res)
{
  
  var userId = req.body.user_id;
  var roleId = req.body.role_id;
  
  var checkExists = userRoles.findOne(
        {   user_id:userId,
            role_id:roleId
        }
    ).then((result)=>{
        console.log(result);
        if (result) {           
            res.send({
                status:'error',
                message:'Role already assigned',
                error:'Already exists',
                data:null 
            });
        }else
        {
            var userRoleData={
                user_id:userId,
                role_id:roleId
            }
            const userRole = new userRoles(userRoleData);
            userRole.save().then((data)=>{
                res.send({
                    status:'success',
                    message:'User role assigned successfully.',
                    error:null,
                    data:null 
                });
            }).catch((error)=>{
                res.send({
                status:'error',
                message:'Unable to assign role',
                error:'Role not assigned',
                data:null 
                });
            });
        }//else      
    });  
}//assignRole

async function userUpdateRole(req,res)
{
    var userId = req.body.user_id;
    var roleIdArr = req.body.role_ids;   
    var login_id = req.body.login_id;
    console.log(roleIdArr);

    var checkExists = await userRoles.find({ user_id:userId})
    .then(async(data)=>{
        console.log(data);
        if(roleIdArr)
        {
            var deletePreviousRole = await userRoles.deleteMany({user_id:userId})
            .then(async(deleted)=>{ 
                    var roles = roleIdArr[0].split(','); 
                    console.log(roles);
                    for(i=0;i<roles.length;i++)
                    {
                        console.log(roles[i]);
                        var userRoleData = {
                            user_id : userId,
                            role_id : roles[i]
                        }
                        
                        await userRoles.create(userRoleData).then((result)=>{
                            console.log('user role created successfully.');
                        }).catch((error)=>{
                            console.log('error while creating user roles.');
                        });
                           
                    }//for
            }).catch((error)=>{
                console.log('error while deleting roles.');
            });
        }//if roleId

        res.send({
            status:'success',
            message:'User role added successfully.',
            error:null,
            data:null 
        });

    }).catch((error)=>{
        res.send({
            status:'error',
            message:'Unable to find user role',
            error:'User roles not found',
            data:null 
        });
    }); 
}//userUpdateRole

module.exports = {
    createRole,
    updateRole,
    getRoles,
    deleteRole,
    assignRole,
    userUpdateRole
}