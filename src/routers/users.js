const express = require('express')
const User = require('../models/users')
const auth = require('../middleware/auth')
const multer = require('multer');
const sharp = require('sharp')
const sendEmail = require('../emails/account')
const router = new express.Router()
const upload = multer({
    limits:{
        fileSize: 1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/))
        return cb(new Error("file type not allowed"));

        return cb(undefined,true)
    }
    
});

router.post('/users',async (req,res)=>{
    
    const user = new User(req.body)
    try{
    await user.save()
    sendEmail(user.email,user.name,'Thanks for joining in!','welcome')
    const token = await user.authenticateUser();
    res.status(201).send({user,token})
}
catch(e){
    res.status(400).send(e)
}
})

router.get('/users/me',auth,async (req,res)=>{
    try{
        res.send({"user":req.user})
    }
    catch(e){
        res.status(500).send(e)
    }
    
})

router.patch('/updateUser/me',auth, async (req,res)=>{
    try{
        //update and findOneand Update bypasses and mongoose and directly updates db
        //so middleware is not able to work directly for that we add the following code

        const allowedFields = ["name","age","email","password"]
        const updates = Object.keys(req.body)
        const isValid = updates.every(update => allowedFields.includes(update))
      
        if(isValid){
        
        updates.forEach((update) => req.user[update]= req.body[update])
        await req.user.save();

       return res.status(200).send(req.user)
        }
        res.status(400).send({"error":"Invalid updates!!!"})
    }catch(e){
        
        res.status(500).send(e)
    }
})

router.delete('/deleteUser/me',auth,async (req,res)=>{
    try{
       console.log("in delete user api")
       await req.user.deleteOne()
       sendEmail(req.user.email,req.user.name,'Sorry to see you go!','remove account')
       res.send(req.user)
    }
    catch(e){
        res.status(500).send(e);
    }
})

router.post('/user/login', async (req,res)=>{
    console.log("calling user login api")
    try{
        const user = await User.findUserByCredentials(req.body.email,req.body.password);
        const token = await user.authenticateUser();
        const userProfile = await user.publicProfile()
        console.log(userProfile)
        res.send({userProfile,token})
    }
    catch(e){
        res.status(500).send({"error":"Unable to login"})
    }
    

})

router.get('/user/logout',auth,async(req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token!==req.token
        })
        
        await req.user.save()
        res.send();
    }
    catch(e){
        res.status(500).send();
    }
})

router.get('/user/logoutAll',auth,async(req,res)=>{
    try{
        req.user.tokens = []
        console.log(req.user.email);
        await req.user.save();
        res.send("LoggedOut of all devices.")
    }
    catch(e){
        res.status(500).send()
    }
})

router.post('/user/me/avatar',auth,upload.single('avatar'), async(req,res)=>{
    try{
       const buffer = await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer();
       req.user.avatar = buffer
       await req.user.save();
        res.send();

    }
    catch(e){//this is for error thrown in try block of route handler
        
        res.status(500).send(e.message)
        
    }
},(error,req,res,next)=>{
    res.status(400).send({"error":error.message})
})//this error handler is only for error thrown from the middleware

router.delete('/user/me/avatar/delete',auth,async(req,res)=>{
    try{
       req.user.avatar = undefined
       await req.user.save();
        res.send();

    }
    catch(e){
        
        res.status(500).send(e.message)
        
    }
})

router.get('/user/:id/avatar', async(req,res)=>{
    try{
        const user = await User.findById(req.params.id);

        if(!user || !user.avatar)
        throw new Error

        res.set('Content-Type','images/png')
        res.send(user.avatar)
    }
    catch(e){
        res.status(404).send()
    }
})

module.exports = router;