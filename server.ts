import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { addUserToRoom, deleteUser, getOrCreateRoomById } from './services';
import { text } from 'stream/consumers';
import { generateRandomParagraph } from './word-generator';

const GLOBALROOMID = '';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const gameNamespace = io.of('/game');

gameNamespace.on('connection', (socket) => {
  console.log('A user connected to the game namespace');

  socket.on('disconnect', async () => {
    console.log('user disconnected from /game', socket.id);

    await deleteUser(socket.id);

    // get room
    gameNamespace.to(GLOBALROOMID).emit('playerDisconnect', {
      userId: socket.id
    });
  });

  socket.on('joinRoom', async (roomId) => {
    //TODO: capacity of 4 players
    const room = await getOrCreateRoomById(roomId);

    if (room.players.length >= 4) {
      return;
    }

    await addUserToRoom(roomId, socket.id);

    socket.join(GLOBALROOMID);

    // pings player with room code -- confirms joined.
    socket.emit('joinedLobby', {
      roomId: GLOBALROOMID,
      playerIds: room.players.map((player) => player.socketId)
    });

    gameNamespace.to(roomId).emit('newUser', {
      userId: socket.id
    });
  });

  socket.on('startGame', (roomId) => {
    gameNamespace.to(roomId).emit('startGame', {
      text: generateRandomParagraph()
    });
  });

  socket.on('speakUpdate', (data) => {
    const { roomId, currentIndex } = data;
    gameNamespace
      .to(roomId)
      .emit('speakUpdate', { userId: socket.id, currentIndex });
  });

  socket.on('finished', () => {
    gameNamespace.to(GLOBALROOMID).emit('finished', {
      userId: socket.id
    });
  });
});

// const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

// wss.on('connection', (ws) => {
//   console.log('Client connected');
//   const connection = deepgram.listen.live({
//     model: 'nova-2',
//     language: 'en-US',
//     smart_format: true
//   });

//   connection.on(LiveTranscriptionEvents.Open, () => {
//     console.log('Deepgram Connection opened.');
//     setInterval(() => {
//       const keepAliveMsg = JSON.stringify({ type: "KeepAlive" });
//       connection.send(keepAliveMsg);
//       console.log("Sent KeepAlive message");
//   }, 3000); // Sending KeepAlive messages every 3 seconds
//   });

//   connection.on(LiveTranscriptionEvents.Transcript, (data) => {
//     console.log(data.channel.alternatives[0].transcript);
//     ws.send(data.channel.alternatives[0].transcript);
//   });

//   connection.on(LiveTranscriptionEvents.Close, (data) => {
//     console.log('Connection closed.');
//   });

//   connection.on(LiveTranscriptionEvents.Error, (err) => {
//     console.error(err);
//   });

//   ws.on('open', () => {
//     console.log('Socket connection opened');
//   });

//   ws.on('close', () => {
//     console.log('Socket connection closed');
//   });

//   ws.on('error', (error) => {
//     console.error('Socket error:', error);
//   });

//   ws.on('message', (message) => {
//     // Assume message is a binary audio stream
//     connection.send(message);
//   });

//   ws.on('disconnect', () => {
//     console.log('Client disconnected');
//   });

//   ws.on('error', (error) => {
//     console.error('WebSocket error:', error);
//   });
// });

server.listen(8080, () => {
  console.log('WebSocket server listening on ws://localhost:8080');
});
