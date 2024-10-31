// utils/messages.js
const moment = require('moment');
const Message = require('./models/message');

function formatMessage(username, text, time = moment().format('HH:mm')) {
  return {
    username,
    text,
    time,
  };
}

async function saveMessage(username, text, room) {
  const message = new Message({
    username,
    text,
    time: moment().format('HH:mm'),
    room,
  });

  await message.save();
}

// getMessagesByRoom fonksiyonu burada tanımlanmalı
async function getMessagesByRoom(room) {
  return await Message.find({ room });
}

module.exports = {
  formatMessage,
  saveMessage,
  getMessagesByRoom,
};
