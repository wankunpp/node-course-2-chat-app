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
    const params = jQuery.deparam(window.location.search);

    socket.emit('join', params, (err) =>{
        if(err){
            alert(err);
            window.location.href = '/';
        }else{
            console.log('no error');
        }
    })
})

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

    // var formattedTime = moment(message.createdAt).format('h:mm a');

    // var li =jQuery('<li></li>');
    // li.text(`${message.from} ${formattedTime}: ${message.text}`)

    // jQuery('#messages').append(li);
})

socket.on('disconnect',() =>{
    console.log('Disconnected to server');
})

socket.on('updateUserList', (users) =>{
    var ul = jQuery('<ol></ol>');

    users.forEach((user) =>{
        ul.append(jQuery('<li></li>').text(user))
    });

    jQuery('#users').html(ul);
})

socket.on('newLocationMessage', (message) =>{
    var formattedTime = moment(message.createdAt).format('h:mm a');
    var template = jQuery('#location-message-template').html();
    var html =Mustache.render(template,{
        from: message.from,
        url: message.url,
        createdAt: formattedTime
    });

    jQuery('#messages').append(html);
    scollToBottom();
})

jQuery('#message-form').on('submit', (e) =>{
    e.preventDefault();
    var messageTextbox = '[name=message]';

    socket.emit('createMessage', {
        text: jQuery(messageTextbox).val()
    }, function(){
        jQuery(messageTextbox).val('');
    })
})

var locationButton = jQuery('#send-location');

locationButton.on('click',()=>{
    if(!navigator.geolocation){
        return alert('geolocation not supported by your browser')
    }

    locationButton.attr('disabled', 'disabled').text('Sending location...');

    navigator.geolocation.getCurrentPosition((position) =>{
        locationButton.removeAttr('disabled').text('Send Location');
        socket.emit('createLocationMessage', {
            latitude: position.coords.latitude,
            longtitude: position.coords.longitude
        })
    }, () =>{
        locationButton.removeAttr('disabled').text('Send Location');
    })
})
