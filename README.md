# Social media API

## Routes / Endpoints
API starts with localhost:PORT/api/v1
Endpoints after above url:


### User

_post__ /register
register a new user provide name, password, email in req.body

_post__ /login
preq.body includes email, password

_post__ /logout
for logging out

_get__ /follow/:id
for following and unfollowing user

_get__ /users
get all users

_post__ /update/profile
can update name, email

_get__ /user/:id
get user profile

_get__ /me
get own profile

_delete__ /delete/me
delete own profile

_put__ /update/password
requires oldPassword and newPassword in req.body

_post__ /forgot/password
provide an email in req.body and get reset password token on email if user were found
then within 10 min click the mail sent at email

_put__ password/reset/:token
provide password in req.body


### Post
_get__ /posts
get all posts of following users

_post__ /post/upload
preq.body includes caption

_get__ /post/:id
like and unlike a post
_put__ /post/:id
update post preq.body includes caption   
_delete__ /post/:id
delete post


_put__ /post/comment/:id
req.body: comment
_delete__ /post/comment/:id
delete the comment, commentId is required in req.body



### ENV Variables
PORT=development server port
MONGO_URL='your mongodb url'
JWT_SECRET="put your own secret here"
APP_EMAIL=your yahoo email
APP_PASSWORD=your yahoo password
