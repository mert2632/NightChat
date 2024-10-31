//public/js/main.js
const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const typingMessage = document.querySelector('.typing-message');

//get username and room from url
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

const socket = io();

// Join chatroom
socket.emit('joinRoom', { username, room });

// Listen for typing event

//get room and users
socket.on('roomUsers', ({ room, users, activeUserCount }) => {
  outputRoomName(room);
  outputUsers(users);
  //deneme
  // Update active user count
  document.getElementById('active-users').innerText = `Aktif kullanici sayisi: ${activeUserCount}`;
});

//messaga from server
socket.on('message', (message) => {
  console.log(message);
  outputMessage(message);

  //scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});
//deneme33
chatForm.addEventListener('keypress', function () {
  socket.emit('yaziyor', { username });
});
//deneme44
// Listen for yaziyor event
socket.on('yaziyor', (data) => {
  typingMessage.innerHTML = `<p>${data.username}  yaziyor...</p>`;
});
// Listen for yaziyor event

//message submit
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  //get message text
  const msg = e.target.elements.msg.value;

  //emit message to server
  socket.emit('chatMessage', msg);

  //clear input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

//output message to dom
function outputMessage(message) {
  console.log(message);
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
                    <p class="text">${message.text}</p>`;
  document.querySelector('.chat-messages').appendChild(div);
}

// Add room name to Dom
function outputRoomName(room) {
  roomName.innerText = room;
}

//Add user to Dom
function outputUsers(users) {
  userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}`;
};
