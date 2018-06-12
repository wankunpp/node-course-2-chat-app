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

    socket.emit('newMessage',{
        from: 'mike@gmail.com',
        text: 'hey , what is going on',
        crateAt: 123
    });

    socket.on('createMessage',(message) =>{
        console.log('createEmail', message);
    })

    socket.on('disconnect',() => {
        console.log('user disconnected')
    })
});

server.listen(port, () =>{
    console.log(`Started up at port ${port}`);
})