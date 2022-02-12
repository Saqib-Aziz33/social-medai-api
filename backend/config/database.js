// function to connect database
const mongoose = require('mongoose')

exports.connectDatabase = () => {
    mongoose.connect(process.env.MONGO_URL)
        .then(con => console.log("Database Connected: ", con.connection.host))
        .catch(error => console.error('Database Connection Error!!! ', error))
}