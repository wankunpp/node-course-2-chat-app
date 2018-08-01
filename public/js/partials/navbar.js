function renderNavbar(socket){
    socket.on('renderRequest', (friendRequests) =>{
        const requests = friendRequests.map(friendRequest => friendRequest.from);
        renderRequest(requests);
    
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
    
    socket.on('renderMessage',(messages) =>{
        renderMessage(messages);
    })
}
