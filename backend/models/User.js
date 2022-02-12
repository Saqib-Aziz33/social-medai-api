const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'username is required']
    },
    avatar: {
        public_id: String,
        url: String
    },
    email: {
        type: String,
        required: [true, 'email is required'],
        unique: [true, 'Email already exists']
    },
    password: {
        type: String,
        required: [true, 'password is required'],
        minlength: [6, 'password must be atleast 6 characters'],
        select: false
    },
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post'
        }
    ],
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    resetPasswordToken: String,
    resetPasswordExpire: Date
})


// hash password before saving
userSchema.pre("save", async function(next){
    // only hash password if password field is modified
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 10)
    }
    next()
})


// compare password
userSchema.methods.matchPassword = async function(password){
    // return true or false
    return await bcrypt.compare(password, this.password)
}


// generate token
userSchema.methods.genrateToken = function(){
    // genrate JWT token fow Authentication
    return jwt.sign({_id: this._id}, process.env.JWT_SECRET)
}


// forgot password
userSchema.methods.getResetPasswordToken = function(){
    // genrate token
    const resetToken = crypto.randomBytes(20).toString('hex')
    // hash the token and save to DB
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    // 10 min expiration
    this.resetPasswordExpire = Date.now() + 10*60*1000

    return resetToken
}

module.exports = mongoose.model('User', userSchema)