const express = require('express')
const router = express.Router()
const {createPost, likeAndUnlikePost, deletePost, getPostOfFollowing,  updatePost, addOrUpdateComment, deleteComment} = require('../controllers/post')
const {isAuthenticated} = require('../middlewares/auth')

router.route('/post/upload')
    .post(isAuthenticated, createPost)

router.route('/post/:id')
    .get(isAuthenticated, likeAndUnlikePost)
    .put(isAuthenticated, updatePost)
    .delete(isAuthenticated, deletePost)

router.route('/posts')
    .get(isAuthenticated, getPostOfFollowing)

router.route('/post/comment/:id')
    .put(isAuthenticated, addOrUpdateComment)
    .delete(isAuthenticated, deleteComment)

module.exports = router