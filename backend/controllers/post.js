const Post = require('../models/Post')
const User = require('../models/User')

exports.createPost = async (req, res) => {
    try {
        const newPostData = {
            caption: req.body.caption,
            image: {
                public_id: 'req.body.public_id',
                url: 'req.body.url'
            },
            owner: req.user._id
        }
        const post = await Post.create(newPostData)
        const user = await User.findById(req.user._id)
        user.posts.push(post)
        await user.save()

        res.status(201).json({
            success: true,
            message: 'new post added',
            post
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if(!post){
            return res.status(404).json({success: false, message: 'post not found'})
        }
        // authorize
        if(req.user._id.toString() !== post.owner.toString()){
            return res.status(401).json({success: false, message: 'UnAuthorized'})
        }
        await post.remove()
        // remove from user posts
        const user = await User.findById(req.user._id)
        const indexOfpostInUserPosts = user.posts.indexOf(post._id)
        user.posts.splice(indexOfpostInUserPosts, 1)
        await user.save()
        res.status(200).json({success: true, message: 'post deleted'})
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}

exports.likeAndUnlikePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if(!post){
            return res.status(404).json({success: false, message: 'post not found'})
        }
        // unlike
        if(post.likes.includes(req.user._id)){
            const index = post.likes.indexOf(req.user._id)
            post.likes.splice(index, 1)
            await post.save()
            
            return res.status(200).json({success: true, message: 'Post Unliked'})
        }
        // like
        post.likes.push(req.user._id)
        await post.save()
        res.status(200).json({success: true, message: 'Post Liked'})
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}


exports.getPostOfFollowing = async (req, res) => {
    try {
        // const user = await User.findById(req.user._id).populate('following', 'posts')
        // res.status(200).json({success: true, posts: user.following})
        const user = await User.findById(req.user._id)
        // $in operator takes an array and compare with database model uses || between elements
        const posts = await Post.find({ owner: {$in: user.following} })
        res.status(200).json({success: true, posts})
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}



exports.updatePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if(!post) return res.status(404).json({success: false, message: 'Post not found'})
        // authorize
        if(req.user._id.toString() !== post.owner.toString()){
            return res.status(401).json({success: false, message: 'UnAuthorized'})
        }
        if(!req.body.caption) return res.status(400).json({success: false, message: 'Major feilds are empty'})
        post.caption = req.body.caption
        await post.save()
        res.status(200).json({success: true, message: 'Post updated'})
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}



exports.addOrUpdateComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if(!post) return res.status(404).json({success: false, message: 'Post not found'})
        
        // update comment
        let commentIndex = -1;
        post.comments.forEach((comment, index) => {
            if(comment.user.toString() === req.user._id.toString()){
                commentIndex = index
            }
        })
        if(commentIndex !== -1){
            post.comments[commentIndex].comment = req.body.comment
            await post.save()
            res.status(200).json({success: true, message: 'Comment updated'})
        }else{
            post.comments.push({user: req.user._id, comment: req.body.comment})
            await post.save()
            res.status(200).json({success: true, message: 'Comment added'})
        }
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}



exports.deleteComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if(!post) return res.status(404).json({success: false, message: 'Post not found'})
        // when owner delete one's comment
        if(post.owner.toString() === req.user._id.toString()){
            if(req.body.commentId == undefined){
                return res.status(400).json({success: false, message: 'Comment ID is undefined'})
            }
            post.comments.forEach((comment, index) => {
                if(comment._id.toString() === req.body.commentId.toString()){
                    return post.comments.splice(index, 1)
                }
            })
            await post.save()
        }
        // when user deletes his comment
        else{
            post.comments.forEach((comment, index) => {
                if(comment.user.toString() === req.user._id.toString()){
                    return post.comments.splice(index, 1)
                }
            })
            await post.save()
        }
        res.status(200).json({success: true, message: 'Comment deleted'})
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}