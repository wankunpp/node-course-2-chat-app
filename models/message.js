const mongoose = require("mongoose");
const {User} = require('./user');

const MessageSchema = new mongoose.Schema({
    room:{
        type:String
    },
    from:{
        type: mongoose.Schema.Types.ObjectId, ref: 'User',
        required: true
    },
    to: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User',
        required:true
    },
    text: {
        type: String,
        required: true
    },
    createAt:{
        type: String
    }
})

const Message = mongoose.model("Message", MessageSchema);

module.exports = { Message };