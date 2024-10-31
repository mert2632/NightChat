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

connectDB(); // Veritabanına bağlantıyı

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'NightChat Bot';

io.on('connection', async (socket) => {
  socket.on('joinRoom', async ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);

    // Welcome current user
    socket.emit('message', formatMessage(botName, `${user.username} NightChat'e hoşgeldin`));

    // Broadcast when a user connects
    socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} adlı kullanıcı giriş yaptı`));

    // Send user and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room),
      activeUserCount: getActiveUserCount(),
    });
     //deneme2
  socket.on('yaziyor', function (data) {
    io.to(user.room).emit('yaziyor', data);
  });


    // Get and emit previous messages
    const messages = await getMessagesByRoom(user.room);
    messages.forEach((message) => {
      socket.emit('message', formatMessage(message.username, message.text, message.time));
    });
  });
 

  socket.on('chatMessage', async (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit('message', formatMessage(user.username, msg));

    // Emit "typing" event
   

    await saveMessage(user.username, msg, user.room);
  });

  socket.on('disconnect', () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit('message', formatMessage(botName, `${user.username} adli kullanici sohbetten ayrıldı`));
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room),
        activeUserCount: getActiveUserCount(),
      });
    }
  });
});

const PORT = 3000 || process.env.PORT;
server.listen(PORT, () => console.log(`3000 PORT DİNLENİYOR ${PORT}`));
