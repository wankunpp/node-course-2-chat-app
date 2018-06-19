const socket = io();

socket.on('updateActivatedRoom',(rooms) =>{
    if(rooms.length >0){
        var ul = $('<div class="form-field"></div>');

        rooms.forEach((room,index) => {
            var roomName = (index+1)+' : '+ room;
            ul.append($(`<button id="room__${room}"></button>`).text(roomName));
        });

        $('.centered-form__rooms').empty();
        $('.centered-form__rooms').append('<div class="form-field"><h3>Active Rooms List</h3></div>');
        $('.centered-form__rooms').append(ul);
    }

    $('.centered-form__rooms button').on('click', function(){
        const text = $(this).text();
        const index = text.indexOf(' ', text.indexOf(' ')+1);
        const room = text.substring(index+1);
       
        $('input[name="room"]').val(room);
        $('form').submit();
    })
    
})
