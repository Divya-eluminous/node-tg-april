const jwt = require('jsonwebtoken');

function generateToken(result)
{
    var token = jwt.sign({ result }, 'JsonSecretKey');
    return token;
}
function verifyToken(req,res,next)
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
       req.user = decode;
       return next();
       //return res.status(401).send(req.user);
   }catch(err){
       return res.status(401).send({message:'Invalid token'});
   }
   return next();

}
async function verifyToken1(req,res,next)
{
   console.log('in verifytoken');

   var loginId = req.body.login_id;
   const authHeader = req.headers.authorization;
   console.log(loginId);
   var headToken;
   if(authHeader)
   {
        headToken = authHeader.split(' ')[1];
    }
   if(!headToken){
        res.status(403).send({message:'Token is required'});
   } 
   if(!loginId){
    res.status(403).send({message:'Login id is required'});
   }  
   try{
       var getLoginUserToken = await user.findOne({_id:loginId})
       .then((data)=>{
      
            var dbAccessToken = data.api_access_token;
            console.log(dbAccessToken);
            if(dbAccessToken!=headToken && loginId==data._id)
            {
                console.log('in invalid token');
                res.status(401).send({message:'Invalid token'});
                return next();
            }
            else
            {
                console.log('out valid token');
                const decode = jwt.verify(headToken,'JsonSecretKey');
                req.user = decode;
                console.log(req.user);
                return next();
                //return res.status(401).send(req.user);
            }//else
           
       }).catch((error)=>{
         res.status(401).send({message:'User token mismatched.'});
         return next();
       }); 
      
   }catch(err){
        res.status(401).send({message:'Invalid token'});
        return next();
   }
   //return next();
}//verifyToken1

module.exports={
    generateToken,
    verifyToken
}