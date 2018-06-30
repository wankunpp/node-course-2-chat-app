const socket = io();

socket.emit('newuser-login',$('input[name="name"]').val());

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

 
