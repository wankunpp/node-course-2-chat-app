const socket = io();

socket.emit('newuser-login',$('input[name="name"]').val());

socket.on('updateActivatedRoom',(rooms) =>{
    $('.room__list .row').empty();
    
    if(rooms.length >0){
        rooms.forEach((room) =>{
            let acitve_room = $(` 
            <div class="active_room col-md-3">
                <div class="card mb-4 box-shadow border-bottom">
                    <img class="card-img-top" src="./files/room-chat.png" alt="Card image cap">
                     <div class="card-body">
                        <h4 class="card-title">${room}</h4><small class="text-muted">(user number)</small>
                        <p class="card-text">room description</p>
                        <div class="d-flex justify-content-center align-items-center">
                            <button type="button" class="btn btn-outline-success" name="button__${room}">Join</button>
                        </div>
                    </div>
                </div>
            </div>
            `);
            $('.room__list .row').append(acitve_room);
        })
    }

    $('.active_room button').on('click', function(){
        const text = $(this).attr('name');
        const index = text.indexOf('_');
        const room = text.substring(index+1);
       
        $('input[name="room"]').val(room);
        $('#join__room').submit();
    }) 
})

socket.on('updateOnlineUsers',(users) =>{
    const allUsers = users.allusers;
    const onlineUsers = users.onlineUsers.map(user => user.name);
    const offlineUsers = allUsers.filter((user) =>{
       if(onlineUsers.indexOf(user.username) === -1){
           return true;
       }
       return false;
    })
    console.log(offlineUsers);
    $('.online__users__list').empty();

    onlineUsers.forEach(user => {
        $('.online__users__list').append(`
        <li class="allusers__online">
            <div class="d-flex justify-content-start align-items-center py-2">
                <img src="./files/IMG_3912.jpg" class="avatar rounded-circle d-flex  mr-2 z-depth-1">
                <strong>${user}</strong>
                <label class="ml-auto">
                    <i class="fa fa-circle" style="color:green"></i>
                </label>
            </div>
        </li>`)
    });
    
    offlineUsers.forEach(user => {
        $('.online__users__list').append(`
        <li class="allusers__offline">
            <div class="d-flex justify-content-start align-items-center text-muted py-2">
                <img src="./files/IMG_3912.jpg" class="avatar rounded-circle d-flex  mr-2 z-depth-1">
                <strong>${user.username}</strong>
                <label class="ml-auto">
                    <i class="fa fa-circle" style="color:grey"></i>
                </label>
            </div>
        </li>`)
    })
})

 
