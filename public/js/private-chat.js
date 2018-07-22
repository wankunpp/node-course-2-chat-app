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