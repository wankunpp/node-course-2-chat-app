const renderFriendListAndRequest = (socket, dbUsers, users, username)=>{
    const onlineUsers = users.getUsers();

    dbUsers.findOne({username: username})
    .populate('friendRequest.from')
    .populate('friendsList.friendId')
    .populate('messages.from')
    .then(user =>{
        socket.emit('renderRequest', user.friendRequest);
        socket.emit('renderMessage',user.messages);
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

    socket.on('confirmRequest',({userId,friendId}) =>{
        const onlineUsers = users.getUsers().map(ele=> ele.name);
        dbUsers.findByIdAndUpdate(userId,{
            $push:{friendsList: {friendId: friendId}},
            $pull: {friendRequest: {from: friendId}}
        }).then(user => {
            //render new friend to user's friendList
            dbUsers.findByIdAndUpdate(friendId,{
                $push:{friendsList:{friendId: userId}},
                $pull: {friendRequest:{from: userId}}
            })
            .populate('friendRequest.from')
            .then(friend =>{
                socket.emit('renderNewFriend',{onlineUsers,friend});
                const requestOnline = users.users.find(ele => ele.name === friend.username);
                if(requestOnline != undefined){
                    socket.to(requestOnline.id).emit('renderRequest', friend.friendRequest);
                    socket.to(requestOnline.id).emit('renderNewFriend',{onlineUsers,friend: user});
                }
            })
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
}

module.exports = {renderFriendListAndRequest};