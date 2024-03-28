// config/websoket.config.js

const socketIo = require('socket.io');

// Function to set up Socket.IO
function setupSocket(server) {
    const io = socketIo(server, {
        cors: {
          origin: '*',
          methods: ['GET', 'POST']
        }
      });

  // Socket.IO event handler
  io.on('connection', (socket) => {
    console.log('A new client connected');
    
    // Event listener for messages from the client
    socket.on('message', (message) => {
      console.log('Received: ', message);
      
      // Echo the message back to the client
      socket.send(message);
    });
    
    // Event listener for disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  return io;
}

module.exports = setupSocket;
