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
        const room = params.room.toUpperCase();

        if(!isRealString(params.name) || !isRealString(room)){
            return callback('name and room name are required')
        }else if(users.getUserList(room).includes(params.name)){
            return callback('this name is already used in this room, please use another name');
        }
        

        socket.join(room);

        users.removeUser(socket.id);
        users.addUser(socket.id, params.name,room);

        io.to(room).emit('updateUserList', users.getUserList(room));
        io.emit('updateActivatedRoom', users.getRoomList());

        socket.emit('newMessage',generateMessage('Admin',`Welcome to Room ${room}`))
        socket.broadcast.to(room).emit('newMessage', generateMessage('Admin',`${params.name} has joined`)) 

        callback();
    })

    socket.on('createMessage',(message, callback) =>{
        callback();
        const user = users.getUser(socket.id);
    
        if(user && isRealString(message.text)){
            io.to(user.room).emit('newMessage',generateMessage(user.name,message.text));
        }
    })

    socket.on('createLocationMessage',(coords) =>{
        const user = users.getUser(socket.id);

        if(user){
            io.to(user.room).emit('newLocationMessage', generateLocaitonMessage(user.name,coords.latitude,coords.longtitude))
        }
    })

    socket.on('disconnect',() => {
        const user = users.removeUser(socket.id);

        if(user){
            io.to(user.room).emit('updateUserList', users.getUserList(user.room));
            io.to(user.room).emit('newMessage',generateMessage('Admin',`${user.name} has left the room`));
        }
    })

    
    socket.emit('updateActivatedRoom', users.getRoomList());
});

server.listen(port, () =>{
    console.log(`Started up at port ${port}`);
})