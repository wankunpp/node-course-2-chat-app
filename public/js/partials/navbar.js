function renderNavbar(socket){
    socket.on('renderRequest', (friendRequests) =>{
        const requests = friendRequests.map(friendRequest => friendRequest.from);
        renderRequest(requests);

        $(document).ready(function() {
            $('#request__dropdown li button').on('click', function(){
                const friendId = $(this).attr('id').substring(18);
                if($(this).attr('id').includes('confirm')){
                    socket.emit('confirmRequest', {userId, friendId});
                }else{
                   socket.emit('declineRequest',{userId, friendId});
                }
                const amount = parseInt($('#request__amount span').text())-1;
                $('#request__amount span').text(amount);
                $(this).closest('li').remove();
            })
        })
    })
    
    socket.on('renderUnreadMessages', messages =>{
        renderUnreadMessages(messages);

        $(document).ready(function() {
            $('#message__dropdown li button').on('click', function(){
                const messageId = $(this).closest('li').attr('id').split('+');
                const messageFrom = messageId[0];
                const messageType = messageId[1];
                socket.emit('releaseMessage', {messageFrom, messageType});

                const amount = parseInt($('#message__amount span').text())-1;
                $('#message__amount span').text(amount);
                $(this).closest('li').remove();
            })
        })  
    })
}
