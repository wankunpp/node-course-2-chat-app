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
        const room = text.substring(index+2);
       
        $('input[name="room"]').val(room);
        $('#join__room').submit();
    }) 
})

socket.on('updateOnlineUsers',({dbusers,onlineUsers}) =>{
    const online_users =[];
    const offline_users =[];
    
    dbusers.forEach(user => {
        if(onlineUsers.map(user => user.name).includes(user.username)){
            online_users.push(user);
        }else{
            offline_users.push(user);
        }
    })
    
    $('.online__users__list').empty();

    if(online_users.length > 0){
        online_users.forEach(user => {
            $('.online__users__list').append(`
            <li class="allusers__online" id="user__${user._id}">
                <div class="d-flex justify-content-start align-items-center py-2">
                    <img src="${user.userImage}" class="avatar rounded-circle d-flex  mr-2 z-depth-1">
                    <strong>${user.username}</strong>
                    <label class="ml-auto">
                        <i class="fa fa-circle" style="color:green"></i>
                    </label>
                </div>
                <div class="user__icons" style="display: none">
                    <button class="mx-2 btn btn-sm btn-outline-secondary" id="view__${user._id}" style="padding-left: 10px; padding-right: 10px;" onclick="location.href='/user-profile/${user._id}'"><i class="fa fa-eye"></i></button>
                    <button class="mx-2 btn btn-sm btn-outline-primary" style="padding-left: 10px; padding-right: 10px;"><i class="fa fa-comments"></i></button>
                    <button class="mx-2 btn btn-sm btn-outline-success" id="addFriend__${user._id}" style="padding-left: 10px; padding-right: 10px;"><i class="fa fa-user-plus"></i></button>
                </div>
            </li>`)
        });
    }

    if(offline_users.length>0){
        offline_users.forEach(user => {
            $('.online__users__list').append(`
            <li class="allusers__offline"  id="user__${user._id}">
                <div class="d-flex justify-content-start align-items-center text-muted py-2">
                    <img src="${user.userImage}" class="avatar rounded-circle d-flex  mr-2 z-depth-1">
                    <strong>${user.username}</strong>
                    <label class="ml-auto">
                        <i class="fa fa-circle" style="color:grey"></i>
                    </label>
                </div>
                <div class="user__icons" style="display: none">
                    <button class="mx-2 btn btn-sm btn-outline-secondary" id="view__${user._id}" style="padding-left: 10px; padding-right: 10px;" onclick="location.href='/user-profile/${user._id}'"><i class="fa fa-eye"></i></button>
                    <button class="mx-2 btn btn-sm btn-outline-primary" style="padding-left: 10px; padding-right: 10px;"><i class="fa fa-comments"></i></button>
                    <button class="mx-2 btn btn-sm btn-outline-success" id="addFriend__${user._id}" style="padding-left: 10px; padding-right: 10px;"><i class="fa fa-user-plus"></i></button>
                </div>
            </li>`)
        })
    }

    $('.online__users__list li').hover(function(){
        //if slected user is logged user itself, nothing show
        if(!$(this).attr('id').includes(userId)){
            $(this).find('.user__icons').css({display:'block'});
            //if the selected user is firend of the logged user , hide the button 
            if(friendsList.indexOf($(this).attr('id').substring(6)) >=0){
                $(this).find('.user__icons button:nth-child(3)').css({display:'none'});
            }
        }
    }, function(){
        $(this).find('.user__icons').css({display:'none'})
    })

    $('.user__icons button:nth-child(3)').on('click', function() {
        const friendId = $(this).attr('id').substring(11);
        socket.emit('sendFriendRequest',{userId,friendId});
    })
})

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

socket.on('renderFriendsList',({userFriends, onlineUsers}) =>{
    renderFriendsList(userFriends, onlineUsers);

    $('.friends__list__friends li').hover(function(){
        $(this).find('.friend__icons').css({display:'block'});
    },function(){
        $(this).find('.friend__icons').css({display:'none'});
    })
})

socket.on('renderFriendBackOnline',(friend) =>{
    friendBackToOnline(friend);
})

socket.on('renderNewFriend',({onlineUsers,friend}) =>{
    renderNewFriend(onlineUsers, friend);
});

socket.on('renderFriendBackOffline',(friend) => {
    friendBackToOffline(friend);
})
