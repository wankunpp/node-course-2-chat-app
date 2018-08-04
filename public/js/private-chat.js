const socket = io();

const chatWithId = window.location.pathname.split('/')[2];

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

socket.emit('private-chat',{userName,chatWithId});

renderNavbar(socket);
renderFriendList(socket);

socket.on('renderChatTitle', (chatUser) =>{
    const title = `
        <div class ="row justify-content-md-center">
            <img class="img-responsive rounded-circle" style="width:60px ;height:60px" src="${chatUser.userImage}"></img>
            <span class="pl-3 pt-3">${chatUser.username}</span>
        </div>
    `
    $('#room__name').html(title);
})

socket.on('renderChatHistory', messages =>{
    const template = $('#message-template').html();
    messages.forEach(message =>{
        const html = Mustache.render(template,{
            text: message.text,
            from: message.from.username === userName ? 'Me' : message.from.username,
            createdAt: message.createAt
        })
        $('#messages').append(html);
    })
    scollToBottom();
})

socket.on('newMessage',(message) => {
    var template = jQuery('#message-template').html();
    var formattedTime = moment(message.createdAt).format('MM/DD ddd HH:mm:ss');
    var html = Mustache.render(template,{
        text: message.text,
        from: message.from,
        createdAt: formattedTime
    });

    jQuery('#messages').append(html);
    scollToBottom();
})

$('#message-form').on('submit', (e) =>{
    e.preventDefault();
    var messageTextbox = '[name=message]';

    socket.emit('privateMessage', {
        to: chatWithId,
        text: $(messageTextbox).val()
    }, function(){
        $(messageTextbox).val('');
    })
})