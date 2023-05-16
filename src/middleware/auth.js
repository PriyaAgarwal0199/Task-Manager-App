//we can add middleware to individual routes too and the route handler in it will only run when the middleware calls next()
const jwt = require('jsonwebtoken')
const User = require('../models/users')
const auth = async (req,res,next)=>{
    try{
       
        const token = req.header('Authorization').replace('Bearer ','');
        
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        //decoded has users _id data bcs at the time of token in creation in user model 
        //we added user's _id in payload and we used tokens.token to check weather the token is still in user's document or not
        const user = await User.findOne({_id:decoded._id,'tokens.token':token})
        req.token = token
        req.user = user
        next();
    }
    catch(e){
        res.status(401).send({"Error":"Authorization Failed"})
    }
}

module.exports = auth;