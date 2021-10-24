const { model ,Schema} = require('mongoose')

const CallerSchema = new Schema({
    sender : {
        type: String,
        required: true
    },
    reciever : {
        type: String,
        required : true
    }
})

module.exports = model('caller', CallerSchema)

