const path = require('path');
const http = require('http');
const express = require('express');
const socketID = require('socket.io');

const publicPath = path.join(__dirname, '..', 'public');
const port = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = socketID(server);

app.use(express.static(publicPath));

io.on('connection',(socket) => {
    console.log('new user connected');

    socket.on('createMessage',(message) =>{
        console.log('createMessage', message);
        io.emit('newMessage',{
            from: message.from,
            text: message.text,
            createdAt: new Date().getTime()
        })
    })

    socket.on('disconnect',() => {
        console.log('user disconnected')
    })
});

server.listen(port, () =>{
    console.log(`Started up at port ${port}`);
})