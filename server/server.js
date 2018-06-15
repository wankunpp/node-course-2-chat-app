const path = require('path');
const http = require('http');
const express = require('express');
const socketID = require('socket.io');

const {generateMessage, generateLocaitonMessage} = require('./utils/message');
const {isRealString} = require('./utils/validation');
const {Users} =require('./utils/users');

const publicPath = path.join(__dirname, '..', 'public');
const port = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const io = socketID(server);

const users = new Users();

app.use(express.static(publicPath));

io.on('connection',(socket) => {
    console.log('new user connected');  
    
    socket.on('join', (params, callback) =>{
        if(!isRealString(params.name) || !isRealString(params.room)){
            return callback('name and room name are required')
        }

        socket.join(params.room);

        users.removeUser(socket.id);
        users.addUser(socket.id, params.name,params.room);

        io.to(params.room).emit('updateUserList', users.getUserList(params.room));

        socket.emit('newMessage',generateMessage('Admin','Welcome to the chat app'))
        socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin',`${params.name} has joined`)) 

        callback();
    })

    socket.on('createMessage',(message, callback) =>{
        callback();
        console.log('createMessage', message);
        io.emit('newMessage',generateMessage(message.from,message.text));
    })

    socket.on('createLocationMessage',(coords) =>{
        io.emit('newLocationMessage', generateLocaitonMessage('admin',coords.latitude,coords.longtitude))
    })

    socket.on('disconnect',() => {
        const user = users.removeUser(socket.id);

        if(user){
            io.to(user.room).emit('updateUserList', users.getUserList(user.room));
            io.to(user.room).emit('newMessage',generateMessage('Admin',`${user.name} has left the room`));
        }
    })
});

server.listen(port, () =>{
    console.log(`Started up at port ${port}`);
})