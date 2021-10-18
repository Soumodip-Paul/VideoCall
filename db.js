const mongoose = require('mongoose')
const {connection_string} = require('./config/_config')
const connectToMongo = () => {
    mongoose.connect(connection_string, () => {
        console.log("connected to mongo")
    })
}

module.exports = connectToMongo