let sockets = {};
const socketIO = require('socket.io');
const _ = require('lodash');
const {Users} =require('./utils/users');
const {generateMessage} = require('./utils/message');
const {isRealString} = require('./utils/validation');

const dbUsers = require('../models/user').User;
const users = new Users();

sockets.init = function (server){
    const io = socketIO(server);

    io.on("connection", socket => {
    console.log("new user connected");

    socket.on('newuser-login', (username) =>{
        io.emit('updateActivatedRoom', users.getRoomList());

        if(!users.hasUser(username)){
            users.removeUser(socket.id);
            users.addUser(socket.id, username);
        }
        
        const onlineUsers = users.getUsers();
        dbUsers.find({}).then((dbusers) =>{
            io.emit('updateOnlineUsers',{dbusers,onlineUsers});
        })

        //render friend requests
        dbUsers.findOne({username: username})
            .populate('friendRequest.from')
            .then(user =>{
                socket.emit('renderRequest', user.friendRequest);
            })
    })

     //send friend requests
     socket.on('sendFriendRequest',({userId,friendId}) =>{
        dbUsers.findById(friendId).then(user =>{
            if(user.friendRequest.length === 0 || !user.friendRequest.map(request =>request.from.toString()).includes(userId)){
                user.friendRequest.push({from: userId});
                user.save().then(friend => {
                    //if the user who got the request is online , should see the request immediately
                    const requestOnline = users.users.find(ele=> ele.name = user.username);
                    if(requestOnline != undefined){
                        dbUsers.findById(friend._id)
                        .populate('friendRequest.from')
                        .then(user =>{
                            socket.to(requestOnline.id).emit('renderRequest', user.friendRequest);
                        })
                    }
                })
            }
        })
    })

    socket.on("join-room", (params, callback) => {
        const room = params.room.toUpperCase();

        if (!isRealString(params.name) || !isRealString(room)) {
        return callback("name and room name are required");
        } else if (users.getUserList(room).includes(params.name)) {
        return callback(
            "this name is already used in this room, please use another name"
        );
        }

        socket.join(room);

        socket.emit('renderRoomName',room);

        users.removeUser(socket.id);
        users.addUser(socket.id, params.name, room);

        io.to(room).emit("updateUserList", users.getUserList(room));
        io.emit("updateActivatedRoom", users.getRoomList());

        socket.emit("newMessage",generateMessage("Admin", `Welcome to Room ${room}`));
        socket.broadcast.to(room).emit("newMessage",generateMessage("Admin", `${params.name} has joined`));

        callback();
    });

    socket.on("createMessage", (message, callback) => {
        callback();
        const user = users.getUser(socket.id);

        if (user && isRealString(message.text)) {
        socket.emit("newMessage", generateMessage("Me", message.text));
        socket.broadcast
            .to(user.room)
            .emit("newMessage", generateMessage(user.name, message.text));
        }
    });

    socket.on("disconnect", () => {
        const user = users.removeUser(socket.id);

        if (user) {
        io.to(user.room).emit("updateUserList", users.getUserList(user.room));
        io.emit('updateActivatedRoom', users.getRoomList());
        io.to(user.room).emit(
            "newMessage",
            generateMessage("Admin", `${user.name} has left the room`)
        );

        const onlineUsers = users.getUsers();
        dbUsers.find({}).then((dbusers) =>{
            io.emit('updateOnlineUsers',{dbusers,onlineUsers});
        })
        }
    });
    });
}

module.exports = sockets;