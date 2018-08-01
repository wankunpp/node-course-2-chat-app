function renderFriendList(socket){
    socket.on('renderFriendsList',({userFriends, onlineUsers}) =>{
        renderFriendsList(userFriends, onlineUsers);
    
        $('.friends__list__friends li').hover(function(){
            $(this).find('.friend__icons').css({display:'block'});
        },function(){
            $(this).find('.friend__icons').css({display:'none'});
        })
    
        $('.friend__icons button:nth-child(3)').on('click', function() {
            const friendId = $(this).attr('id').substring(14);
            socket.emit('deleteFriend',{userId,friendId});
        })
    })
    
    socket.on('renderFriendBackOnline',(friend) =>{
        friendBackToOnline(friend);
    })
    
    socket.on('renderNewFriend',({onlineUsers,friend}) =>{
        renderNewFriend(onlineUsers, friend);
    });
    
    socket.on('renderFriendBackOffline',(friend) => {
        friendBackToOffline(friend);
    })
    
    socket.on('renderDeleteFriend', friend =>{
        $(`#friend__${friend.username}`).remove();
    })
}