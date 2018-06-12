const socket = io();

socket.on('connect',() =>{
    console.log('Connected to server');

    socket.emit('createMessage', {
        from: 'jen@example.com',
        text: 'hey , this is andrew'
    })
})

socket.on('newMessage',(message) => {
    console.log('New message',message);
})

socket.on('disconnect',() =>{
    console.log('Disconnected to server');
})


