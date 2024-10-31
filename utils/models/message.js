// utils/models/message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    room: {
        type: String,
        required: true
    }
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
