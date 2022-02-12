const express = require('express')
const app = require('./app')
const {connectDatabase} = require('./config/database')
const cookieParser = require('cookie-parser')

connectDatabase()

// middlewares
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(cookieParser())


// routes
const postRouter = require('./routes/post')
const userRouter = require('./routes/user')

app.use('/api/v1', postRouter)
app.use('/api/v1', userRouter)


app.listen(process.env.PORT, () => {
    console.log(`serving at ${process.env.PORT}`)
})