const jwt = require('jsonwebtoken');
const user = require('../schemas/userSchema');
const role = require('../schemas/roleSchema');

function generateToken(result)
{
    var token = jwt.sign({ result }, 'JsonSecretKey');
    return token;
}
async function verifyToken(req,res,next)
{
   var loginId = req.body.login_id;
   const authHeader = req.headers.authorization;
   console.log(loginId);
   var headToken;
   if(authHeader)
   {
        headToken = authHeader.split(' ')[1];
    }

    if(!loginId){
        return res.status(403).send({message:'Login id is required'});
    }  

   if(!headToken){
       return res.status(403).send({message:'Token is required'});
   }  
   try{
    
       const decode = jwt.verify(headToken,'JsonSecretKey');
       console.log("===========");
       console.log(decode.result);
       var userDataWithRoles = await user.findOne({_id:loginId})
       .populate([
           {
               path:'roleslist',
               model:'User'                 
           },       
       ]).then(async(results)=>{

            if(results.api_access_token!=headToken)
            {
                return res.status(401).send({message:'Invalid user access token does not match with login user.'});
            }
           
            if(results.roleslist){
                for(var j in results.roleslist)
                {
                    var roleName = ''; var roleInfo = [];
                    var getRoleName= await role.findOne({_id:results.roleslist[j]['role_id']});
                        var roleName = getRoleName.name?getRoleName.name:'';
                        console.log(roleName);
                       var roleData={};
                        roleData = {
                            roleName
                        }
                       
                    results.roleslist[j] = roleName.toString();
                }//for loop
                req.user = results;
                  // return next();
            }//if roleListArr
            else
            {
                return res.status(401).send({message:'Invalid user'});
            }
          
       }).catch((error)=>{      
            console.log(error.message);
            return res.status(401).send({message:'Invalid user'});
       });
      
       //return res.status(401).send(req.user);
   }catch(err){
       return res.status(401).send({message:'Invalid token'});
   }
   return next();
}

const checkRole = (roles) => {
    return (req, res, next) => {
         console.log(req.user.roleslist);
         console.log(roles);
        if (roles.some(role => req.user.roleslist.includes(role))) {
            next();
        } else {
            res.status(401).send({message:'You do not have permission to access this route.'});
        }
    };
};



module.exports={
    generateToken,
    verifyToken,
    checkRole
}