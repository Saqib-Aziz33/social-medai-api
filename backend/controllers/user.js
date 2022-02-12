const User = require('../models/User')
const Post = require('../models/Post')
const {sendEmail} = require('../middlewares/sendEmail')
const crypto = require('crypto')

exports.register = async (req, res) => {
    try {
        const {name, email, password} = req.body
        let user = await User.findOne({email})
        if(user){
            return res.status(400).json({success: false, message: 'user with same email already exists'})
        }
        user = await User.create({
            name, email, password,
            avatar: {
                public_id: 'sample id',
                url: 'sample avatar url'
            }
        })
        // res.status(201).json({success: true, user, message: 'Registered successfully'})

        // login after registrarion
        const token = await user.genrateToken()
        const cookieOptions = {
            expires: new Date(Date.now() + 45*24*60*60*1000),
            httpOnly: true
        }
        res.status(200).cookie('token', token, cookieOptions).json({success: true, user, token})
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}


exports.logout = async (req, res) => {
    try {
        // destroy the token
        res.status(200).cookie('token', null, {expires: new Date(Date.now), httpOnly: true}).json({success: true, message: 'Logged out'})
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}

exports.login = async (req, res) => {
    try {
        const {email, password} = req.body
        const user = await User.findOne({email}).select('+password')
        if(!user){
            return res.status(400).json({success: false, message: 'user does not exists'})
        }
        const isMatch = await user.matchPassword(password)
        if(!isMatch){
            return res.status(400).json({success: false, message: 'incorrect password'})
        }
        const token = await user.genrateToken()
        const cookieOptions = {
            expires: new Date(Date.now() + 45*24*60*60*1000),
            httpOnly: true
        }
        res.status(200).cookie('token', token, cookieOptions).json({success: true, user, token})
        
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}


// follow and unfollow
exports.followUser = async (req, res) => {
    try {
        const userToFollow = await User.findById(req.params.id)
        const logedinUser = await User.findById(req.user._id)
        // validations
        if(!userToFollow){
            return res.status(404).json({success: false, message: 'User not found'})
        }
        if(userToFollow.id == logedinUser.id){
            return res.status(400).json({success: false, message: 'cannot follow yourself'})
        }
        // unfollow
        if(userToFollow.followers.includes(logedinUser.id)){
            const indexFollowing = logedinUser.following.indexOf(userToFollow.id)
            const indexFollower = userToFollow.followers.indexOf(logedinUser.id)
            logedinUser.following.splice(indexFollowing, 1)
            userToFollow.followers.splice(indexFollower, 1)
            await logedinUser.save()
            await userToFollow.save()

         return res.status(200).json({success: true, message: 'User UnFollowed'})
        }

        logedinUser.following.push(userToFollow._id)
        userToFollow.followers.push(logedinUser._id)

        await logedinUser.save()
        await userToFollow.save()

        res.status(200).json({success: true, message: 'User Followed'})
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}


exports.updatePassword = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('+password')
        const {oldPassword, newPassword} = req.body
        if(!oldPassword || !newPassword){
            return res.status(400).json({success: false, message: 'Please provide old and new password'})
        }
        const isMatch = await user.matchPassword(oldPassword)
        if(!isMatch){
            return res.status(400).json({success: false, message: 'Old password is incorrect'})
        }
        user.password = newPassword
        await user.save()
        res.status(200).json({success: true, message: 'Password Updated'})
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
    
}


exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
        const {name, email, avatar} = req.body
        if(name) user.name = name;
        if(email) user.email = email;
        await user.save()
        res.status(200).json({success: true, message: 'Profile Updated'})
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}

exports.deleteMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
        const posts = user.posts
        const followers = user.followers
        const followings = user.following
        const userId = user._id
        await user.remove()
        // logout user
        res.cookie('token', null, {expires: new Date(Date.now), httpOnly: true})
        // deleting user posts
        for(let i = 0; i < posts.length; i++){
            await Post.findByIdAndDelete(posts[i])
        }
        // remove user followings
        for (let i = 0; i < followers.length; i++) {
            const follower = await User.findById(followers[i])
            const index = follower.following.indexOf(userId)
            follower.following.splice(index, 1)
            await follower.save()
        }
        // remove user from followings of others
        for (let i = 0; i < followings.length; i++) {
            const follows = await User.findById(followings[i])
            const index = follows.followers.indexOf(userId)
            follows.followers.splice(index, 1)
            await follows.save()
        }
        res.status(200).json({success: true, message: 'Profile Deleted'})
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}



exports.myProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('posts')
        res.status(200).json({success: true, user})
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}



exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('posts')
        if(!user){
            return res.status(404).json({success: false, message: 'user not found'})
        }
        res.status(200).json({success: true, user})
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}


exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).populate('posts')
        res.status(200).json({success: true, users})
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}



exports.forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({email: req.body.email})
        if(!user){
            return res.status(404).json({success: false, message: 'user not found'})
        }
        // get token from user model
        const resetPasswordToken = user.getResetPasswordToken()
        // save user resetPassToken and tokenExpiration
        await user.save()
        // create msg and url
        const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetPasswordToken}`
        const message = `Reset your password by clicking on the link below: \n\n ${resetUrl}`

        // send mail
        try {
            await sendEmail({email: user.email, subject: 'reset password', message})
            res.status(200).json({success: true, message: `Email sent to ${user.email}`})
        } catch (error) {
            user.resetPasswordToken = undefined
            user.resetPasswordExpire = undefined
            await user.save()
            res.status(500).json({success: false, message: 'Error mail not sent', messageSource: error.message})
        }

    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}



exports.resetPassword = async (req, res) => {
    try {
        // get the token and hash it with same algorithm used to hash token before saving to database
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex')
        // then find user by token and where token is not expired
        const user = await User.findOne({resetPasswordToken, resetPasswordExpire: {$gt: Date.now()}})
        console.log(resetPasswordToken)
        if(!user){
            return res.status(401).json({success: false, message: 'Token is invalid or has expired'})
        }

        user.password = req.body.password
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined
        await user.save()
        res.status(200).json({success: true, message: 'Password updated'})

    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}