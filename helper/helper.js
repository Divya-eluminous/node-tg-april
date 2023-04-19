const user = require('../schemas/userSchema');
const role = require('../schemas/roleSchema');
async function getUserRoles(roleslist)
{
    if(roleslist){
        for(var j in roleslist)
        {
            var roleName = ''; var roleInfo = [];
            var getRoleName= await role.findOne({_id:roleslist[j]['role_id']});
                var roleName = getRoleName.name?getRoleName.name:'';
               
               var roleData={};
               roleData = {
                _id:roleslist[j]['_id'],
                role_id :roleslist[j]['role_id'],
                user_id : roleslist[j]['user_id'],
                role_name :roleName
               }
               
            roleslist[j] = roleData;
        }//for loop
    }//if roleListArr
    return roleslist;
}
module.exports={
    getUserRoles
}