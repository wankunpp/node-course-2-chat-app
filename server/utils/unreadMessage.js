const renderUnreadMessages = (socket, dbUsers,username) =>{
    dbUsers.findOne({username: username})
            .populate("messages.from")
            .then(user =>{
                socket.emit('renderUnreadMessages',user.messages)
            })

    socket.on('releaseMessage',({messageFrom, messageType}) =>{
        dbUsers.findOneAndUpdate({
            username: username
        },{
            $pull:{"messages":{"from":messageFrom,"type":messageType}}
        }).then(user=> {
            user.save()
        })
    })
}

module.exports = {renderUnreadMessages};