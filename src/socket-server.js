const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// 정적 파일 서비스 (루트에 channel.html, viewer.html, steno.html 등)
app.use(express.static(path.join(__dirname, '../')));

io.on('connection', (socket) => {
  socket.on('join-room', (channelCode) => {
    socket.join(channelCode);
    socket.to(channelCode).emit('user-joined', socket.id);
  });
  socket.on('send-message', ({ channelCode, data }) => {
    socket.to(channelCode).emit('receive-message', data);
  });
  socket.on('disconnecting', () => {
    const rooms = Array.from(socket.rooms).filter(r => r !== socket.id);
    rooms.forEach(room => {
      socket.to(room).emit('user-left', socket.id);
    });
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
}); 