const socket = io();

socket.on('connect',() =>{
    console.log('Connected to server');
})

socket.on('newMessage',(message) => {
    console.log('New message',message);
    var li =jQuery('<li></li>');
    li.text(`${message.from}: ${message.text}`)

    jQuery('#messages').append(li);
})

socket.on('disconnect',() =>{
    console.log('Disconnected to server');
})

socket.on('newLocationMessage', (message) =>{
    var li =jQuery('<li></li>');
    var a = jQuery('<a target="_blank">current location</a>');

    li.text(`${message.from}: `)
    a.attr('href', message.url);
    li.append(a);

    jQuery('#messages').append(li);
})

jQuery('#message-form').on('submit', (e) =>{
    e.preventDefault();

    socket.emit('createMessage', {
        from: 'User',
        text: jQuery('[name=message]').val()
    }, function(){

    })
})

var locationButton = jQuery('#send-location');

locationButton.on('click',()=>{
    if(!navigator.geolocation){
        return alert('geolocation not supported by your browser')
    }

    navigator.geolocation.getCurrentPosition((position) =>{
        socket.emit('createLocationMessage', {
            latitude: position.coords.latitude,
            longtitude: position.coords.longitude
        })
    }, () =>{
      
    })
})
