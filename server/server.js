const path = require('path');
const http = require('http');
const express = require('express');
const socketID = require('socket.io');

const {generateMessage, generateLocaitonMessage} = require('./utils/message');

const publicPath = path.join(__dirname, '..', 'public');
const port = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = socketID(server);

app.use(express.static(publicPath));

io.on('connection',(socket) => {
    console.log('new user connected');

    socket.emit('newMessage',generateMessage('Admin','Welcome to the chat app'))

    socket.broadcast.emit('newMessage', generateMessage('Admin','New User joined'))    

    socket.on('createMessage',(message, callback) =>{
        callback();
        console.log('createMessage', message);
        io.emit('newMessage',generateMessage(message.from,message.text));
    })

    socket.on('createLocationMessage',(coords) =>{
        io.emit('newLocationMessage', generateLocaitonMessage('admin',coords.latitude,coords.longtitude))
    })

    socket.on('disconnect',() => {
        console.log('user disconnected')
    })
});

server.listen(port, () =>{
    console.log(`Started up at port ${port}`);
})