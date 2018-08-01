const socket = io();

const scollToBottom = () =>{
    const messages = jQuery('#messages');
    const newMessage = messages.children('li:last-child');

    let clientHeight = messages.prop('clientHeight');
    let scrollTop = messages.prop('scrollTop');
    let scrollHeight = messages.prop('scrollHeight');
    let newMessageHeight = newMessage.innerHeight();
    let lastMessageHeight = newMessage.prev().innerHeight();

    if(clientHeight + scrollTop +newMessageHeight +lastMessageHeight >= scrollHeight){
       messages.scrollTop(scrollHeight);
    }

}

socket.on('connect',() =>{
    const room = jQuery.deparam(window.location.search).room.toUpperCase();

    socket.emit('join-room', {userName,room}, (err) =>{
        if(err){
            alert(err);
            window.location.href = '/home';
        }
    })
})

socket.on('renderRoomName', (roomName) =>{
    $('#room__name').html(roomName);
})

renderNavbar(socket);
renderFriendList(socket);

socket.on('newMessage',(message) => {
    var template = jQuery('#message-template').html();
    var formattedTime = moment(message.createdAt).format('h:mm a');
    var html = Mustache.render(template,{
        text: message.text,
        from: message.from,
        createdAt: formattedTime
    });

    jQuery('#messages').append(html);
    scollToBottom();
})

socket.on('updateUserList', ({roomUserNames,dbusers}) =>{
    $('.room__users__list').empty();
    const roomUsers = dbusers.filter(user => roomUserNames.includes(user.username));
    roomUsers.forEach((user) =>{
        $('.room__users__list').append(`
            <li class="room__users__online">
                <div class="d-flex justify-content-start align-items-center py-2">
                    <img src="${user.userImage}" class="avatar rounded-circle d-flex  mr-2 z-depth-1">
                    <strong>${user.username}</strong>
                    <label class="ml-auto">
                        <i class="fa fa-circle" style="color:green"></i>
                    </label>
                </div>
            </li>`);
    });
})

$('#message-form').on('submit', (e) =>{
    e.preventDefault();
    var messageTextbox = '[name=message]';

    socket.emit('createMessage', {
        text: $(messageTextbox).val()
    }, function(){
        $(messageTextbox).val('');
    })
})
