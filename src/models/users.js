const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./tasks')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim:true
    },
    email:{
        type: String,
        required: true,
        unique:true,
        trim:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value))
            throw new Error("Email entered is invalid")
        }
    },
    age:{
        type: Number,
        default:0,
        validate(value){
            if(value<0)
            throw new Error("Age cannot be negative")
        }
    },
    password:{
        type:String,
        required:true,
        trim:true,
        minlength:7,
        validate(value){
            if(value.toLowerCase().includes("password"))
            throw new Error("pasword cannot contain password")
        }
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
    avatar:{
        type: Buffer
    }
},
{
    timestamps:true
})

//to add virtual property
userSchema.virtual('tasks',{
    ref:'task',
    localField:'_id',
    foreignField:'owner'
})

//to add instance methods
userSchema.methods.authenticateUser = async function(){
    const token = jwt.sign({_id:this._id.toString()},"thisismynewappusedassecret")
    this.tokens.push({token})
    await this.save()
    return token
}

userSchema.methods.publicProfile= async function(){
    const user = this.toObject();
    delete user.password
    delete user.tokens
    delete user.avatar
    return user
}
userSchema.methods.toJSON=  function(){
    const user = this.toObject();
    delete user.password
    delete user.tokens
    delete user.avatar
    return user
}
//to add model methods
userSchema.statics.findUserByCredentials = async (email,password)=>{
    const user = await User.findOne({email})

    if(!user)
    throw new Error("Unable to login!")
    const isMatch = await bcrypt.compare(password,user.password)
    if(!isMatch)
    throw new Error("Unable to login!")

    return user
}

//adding middleware

userSchema.pre('save',async function(next){

    if(this.isModified('password'))
    this.password = await bcrypt.hash(this.password,8)
    
    next();
})

//to delete all the tasks associated with user in case of user deletion
userSchema.pre('deleteOne',{document:true},async function(next){
    await Task.deleteMany({owner:this._id});
    next()
})
//model creation
//mongoose takes these model name you provided and convert it to lower case and pluralizes it 
//meaning User will be saved as a collection users
const User = mongoose.model('User', userSchema)

module.exports = User