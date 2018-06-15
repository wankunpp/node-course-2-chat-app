const socket = io();

socket.on('connect',() =>{
    console.log('Connected to server');
})

socket.on('newMessage',(message) => {
    var formattedTime = moment(message.createdAt).format('h:mm a');

    var li =jQuery('<li></li>');
    li.text(`${message.from} ${formattedTime}: ${message.text}`)

    jQuery('#messages').append(li);
})

socket.on('disconnect',() =>{
    console.log('Disconnected to server');
})

socket.on('newLocationMessage', (message) =>{
    var li =jQuery('<li></li>');
    var a = jQuery('<a target="_blank">current location</a>');
    var formattedTime = moment(message.createdAt).format('h:mm a');

    li.text(`${message.from} ${formattedTime}: `)
    a.attr('href', message.url);
    li.append(a);

    jQuery('#messages').append(li);
})

jQuery('#message-form').on('submit', (e) =>{
    e.preventDefault();
    var messageTextbox = '[name=message]';

    socket.emit('createMessage', {
        from: 'User',
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
