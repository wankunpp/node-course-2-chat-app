const mongoose = require("mongoose");
const {User} = require('./user')

const MessageSchema = new mongoose.Schema({
    from:{
        type: mongoose.Schema.Types.ObjectId, ref: 'User',
        required: true
    },
    to: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User',
        required:true
    },
    type:{
        type: String,
        default:''
    }
})

const Message = mongoose.model("Message", MessageSchema);

module.exports = { Message };