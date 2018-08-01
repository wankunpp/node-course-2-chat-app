let sockets = {};
const socketIO = require('socket.io');
const _ = require('lodash');
const moment = require('moment');
const {Users} =require('./utils/users');
const {generateMessage} = require('./utils/message');
const {isRealString} = require('./utils/validation');
const{renderFriendListAndRequest} = require('./utils/friendListAndRequest');

const dbUsers = require('../models/user').User;
const dbMessages = require('../models/message').Message;
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
            renderFriendListAndRequest(socket, dbUsers, users, username);
        })
        
        socket.on("join-room", ({userName,room}, callback) => {
            if (!isRealString(room)) {
            return callback("room name are required");
            } else if (users.getUserList(room).includes(userName)) {
            return callback(
                "this name is already used in this room, please use another name"
            );
            }

            socket.join(room);

            socket.emit('renderRoomName',room);

            users.removeUser(socket.id);
            users.addUser(socket.id, userName, room);

            renderFriendListAndRequest(socket, dbUsers, users, userName);

            dbUsers.find({}).then((dbusers) =>{
                io.to(room).emit("updateUserList", {roomUserNames:users.getUserList(room),dbusers});
            })

            io.emit("updateActivatedRoom", users.getRoomList());

            socket.emit("newMessage",generateMessage("Admin", `Welcome to Room ${room}`));
            socket.broadcast.to(room).emit("newMessage",generateMessage("Admin", `${userName} has joined`));

            callback();
        });

        socket.on('private-chat',({userName,chatWithId}) => {
            users.removeUser(socket.id);
            users.addUser(socket.id,userName);   

            renderFriendListAndRequest(socket, dbUsers, users, userName);

            dbUsers.findOne({username: userName}).then(user =>{
                const privateRoom = [user._id,chatWithId].sort().join();
                socket.join(privateRoom);
                // console.log(Object.keys(io.sockets.adapter.rooms[privateRoom].sockets) );

                dbMessages.find({room: privateRoom})
                            .sort({createAt:1})
                            .populate('from')
                            .then(messages =>{
                                socket.emit('renderChatHistory', messages)
                            })

                socket.on("privateMessage", (message, callback) => {
                    callback();
                    if (isRealString(message.text)) {
                        socket.emit("newMessage", generateMessage("Me", message.text));
                        socket.broadcast.to(privateRoom).emit("newMessage", generateMessage(userName, message.text));
                        if(Object.keys(io.sockets.adapter.rooms[privateRoom].sockets).length === 1){
                            dbUsers.findByIdAndUpdate(chatWithId,{
                                $push: {
                                    messages:{
                                        from: user._id,
                                        text: message.text,
                                        createAt: moment().format('MM/DD ddd HH:mm:ss')
                                    }
                                }
                            }).then(chatUser =>{
                                const requestOnline = users.users.find(ele => ele.name === chatUser.username);
                                if(requestOnline != undefined){
                                    socket.to(requestOnline.id).emit('receiveNewPrivateMessage', {user, message:chatUser.messages});
                                }
                            });
                        }

                        dbMessages.create({
                            room: privateRoom,
                            from: user._id,
                            to: chatWithId,
                            text: message.text,
                            createAt: moment().format('MM/DD ddd HH:mm:ss')
                        })
                    }
                });
            })
        })


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

        socket.on("viewProfile",(userName) =>{
            users.removeUser(socket.id);
            users.addUser(socket.id, userName);

            renderFriendListAndRequest(socket, dbUsers, users, userName);
        })

        socket.on("disconnect", () => {
            const user = users.removeUser(socket.id);
            if(user){
                io.emit('updateActivatedRoom', users.getRoomList());
                dbUsers.find({}).then((dbusers) =>{
                    io.to(user.room).emit("updateUserList", {roomUserNames:users.getUserList(user.room),dbusers});
                })
                io.to(user.room).emit('newMessage',generateMessage('Admin',`${user.name} has left the room`));
            }

            //render online user list when user log out
            // const onlineUsers = users.getUsers();
            // dbUsers.find({}).then((dbusers) =>{
            //     io.emit('updateOnlineUsers',{dbusers,onlineUsers});
            // })

            //user's friend should see user offline when user log out
            // dbUsers.findOne({username: user.name})
            //     .populate('friendsList.friendId')
            //     .then(user =>{
            //         if(user.friendsList.length >0){
            //             const userFriends = user.friendsList.map(friend => friend.friendId);
            //             userFriends.forEach(friend => {
            //                 const friendOnline = onlineUsers.find(user=> user.name === friend.username)
            //                 if(friendOnline != undefined){
            //                     socket.to(friendOnline.id).emit('renderFriendBackOffline',user);
            //                 }
            //             })
            //         }
            //     })
        });
    })
}

module.exports = sockets;