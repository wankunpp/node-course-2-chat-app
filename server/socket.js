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

            //render friend requests and friends list
            dbUsers.findOne({username: username})
                .populate('friendRequest.from')
                .populate('friendsList.friendId')
                .then(user =>{
                    socket.emit('renderRequest', user.friendRequest);
                    if(user.friendsList.length >0){
                        const userFriends = user.friendsList.map(friend => friend.friendId);
                        socket.emit('renderFriendsList',{userFriends,onlineUsers});
                        //if user's friend back online , should render the user's friend list
                        userFriends.forEach(friend => {
                            const friendOnline = onlineUsers.find(user=> user.name === friend.username)
                            if(friendOnline != undefined){
                                socket.to(friendOnline.id).emit('renderFriendBackOnline',user);
                            }
                        })
                    }
                })

        })
        
        //send friend requests
        socket.on('sendFriendRequest',({userId,friendId}) =>{
            dbUsers.findById(friendId).then(user =>{
                //only if the two users are not friend and the user nerver get the same request before will the new request be sent
                if((user.friendRequest.length === 0 || !user.friendRequest.map(request =>request.from.toString()).includes(userId)) && !user.friendsList.map(friend => friend.friendId.toString()).includes(userId)){
                    user.friendRequest.push({from: userId});
                    user.save().then(friend => {
                        //if the user who got the request is online , should see the request immediately
                        const requestOnline = users.getUsers().find(ele=> ele.name = friend.username);
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

        //user confirm friend request, both user and this friend will remove the friend request 
        socket.on('confirmRequest',({userId,friendId}) =>{
            const onlineUsers = users.getUsers().map(ele=> ele.name);
            dbUsers.findByIdAndUpdate(userId,{
                $push:{friendsList: {friendId: friendId}},
                $pull: {friendRequest: {from: friendId}}
            }).then(user => {
                //render new friend to user's friendList
                dbUsers.findById(friendId).then(friend =>{
                    socket.emit('renderNewFriend',{onlineUsers,friend});
                })
            });
    
        dbUsers.findByIdAndUpdate(friendId,{
            $push:{friendsList:{friendId: userId}},
            $pull: {friendRequest:{from: userId}}
        }).then(friend => {
                const requestOnline = users.users.find(ele => ele.name = friend.username);
                //the friend should not see the request from the user if the user has confirmed the request from him and render the user to his friendList
                if(requestOnline != undefined){
                    dbUsers.findById(friend._id)
                    .populate('friendRequest.from')
                    .then(friend =>{
                        socket.to(requestOnline.id).emit('renderRequest', friend.friendRequest);
                    });

                    dbUsers.findById(userId).then(friend =>{
                        socket.to(requestOnline.id).emit('renderNewFriend',{onlineUsers,friend});
                    })
                }
        });
        })
        //user decline friend request
        socket.on('declineRequest',({userId, friendId}) => {
            dbUsers.findByIdAndUpdate(userId, {
                $pull:{friendRequest:{from: friendId}}
            }).then(user => user.save());
        })

        //user delete friend 
        socket.on('deleteFriend',({userId,friendId}) => {
            dbUsers.findByIdAndUpdate(userId,{
                $pull:{friendsList: {friendId: friendId}}
            }).then(user => {
                dbUsers.findById(friendId).then(friend => {
                    socket.emit('renderDeleteFriend',friend);
                })
            });

            //friend should see he's been deleted by user immediately if he's online
            dbUsers.findByIdAndUpdate(friendId, {
                $pull: {friendsList: {friendId: userId}}
            }).then(friend =>{
                if(users.hasUser(friend.username)){
                    dbUsers.findById(userId).then(user =>{
                        socket.to(users.getUserByName(friend.username).id).emit('renderDeleteFriend',user);
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

            //render online user list when user log out
            const onlineUsers = users.getUsers();
            dbUsers.find({}).then((dbusers) =>{
                io.emit('updateOnlineUsers',{dbusers,onlineUsers});
            })

            //user's friend should see user offline when user log out
            dbUsers.findOne({username: user.name})
                .populate('friendsList.friendId')
                .then(user =>{
                    if(user.friendsList.length >0){
                        const userFriends = user.friendsList.map(friend => friend.friendId);
                        userFriends.forEach(friend => {
                            const friendOnline = onlineUsers.find(user=> user.name === friend.username)
                            if(friendOnline != undefined){
                                socket.to(friendOnline.id).emit('renderFriendBackOffline',user);
                            }
                        })
                    }
                })
            }
        });
    })
}

module.exports = sockets;