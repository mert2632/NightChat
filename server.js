// ./server.js
const connectDB = require('./utils/database.js');
const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const { saveMessage, getMessagesByRoom } = require('./utils/messages');
const { formatMessage } = require("./utils/messages.js");
const { userJoin, getCurrentUser, userLeave, getRoomUsers, getActiveUserCount } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);




connectDB();

// Statik dosya ayarı
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'NightChat Bot';

io.on('connection', (socket) => {
  // Kullanıcı oda ile katılınca
  socket.on('joinRoom', async ({ username, room }) => {
    if (!username || !room) {
      socket.emit('message', formatMessage(botName, "Geçersiz oda veya kullanıcı adı."));
      return;
    }

    const user = userJoin(socket.id, username, room);
    socket.join(user.room);

    // Yeni kullanıcıya hoş geldin mesajı
    socket.emit('message', formatMessage(botName, `${user.username} NightChat'e hoşgeldin!`));

    // Odaya bağlanan diğer kullanıcılara bildirim gönder
    socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} adlı kullanıcı giriş yaptı.`));

    // Kullanıcı ve oda bilgilerini gönder
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room),
      activeUserCount: getActiveUserCount(),
    });

    // Önceki mesajları al ve kullanıcıya gönder
    try {
      const messages = await getMessagesByRoom(user.room);
      messages.forEach((message) => {
        socket.emit('message', formatMessage(message.username, message.text, message.time));
      });
    } catch (error) {
      console.error("Mesajlar alınırken hata oluştu:", error);
    }
  });

  // Kullanıcı mesaj gönderdiğinde
  socket.on('chatMessage', async (msg) => {
    const user = getCurrentUser(socket.id);
    if (!user) return;

    io.to(user.room).emit('message', formatMessage(user.username, msg));

    // Mesajı veritabanına kaydet
    try {
      await saveMessage(user.username, msg, user.room);
    } catch (error) {
      console.error("Mesaj kaydedilirken hata oluştu:", error);
    }
  });

  // Yazıyor etkinliği
  socket.on('yaziyor', (data) => {
    const user = getCurrentUser(socket.id);
    if (user) {
      io.to(user.room).emit('yaziyor', data);
    }
  });

  // Kullanıcı bağlantıyı kesince
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit('message', formatMessage(botName, `${user.username} adlı kullanıcı sohbetten ayrıldı.`));
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room),
        activeUserCount: getActiveUserCount(),
      });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server ${PORT} portunda çalışıyor`));

