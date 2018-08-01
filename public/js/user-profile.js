const socket = io();

socket.emit('viewProfile',userName);

renderNavbar(socket);
renderFriendList(socket);

// socket.on('renderFriendsList',({onlineUsersNames,allusers}) =>{
//     renderFriendsList(allusers, onlineUsersNames)
// })

$('#profile__edit__button').on('click',()=>{
    // $('<button type="button" class="btn btn-success" id="user__profile__save">save</button>').insertAfter($('#user__profile__form'));
    $('.user__profile__button button').css({ display: "block" });
    $('#profile__image__button').css({display: "block" })

    const firstName = $('#form__firstName label').text(); 
    const input_firstName =$('<input class="form-control" name="firstName" id="user__firstName">').val(firstName);
    const lastName = $('#form__lastName label').text(); 
    const input_lastName =$('<input class="form-control" name="lastName" id="user__lastName">').val(lastName);
    $('.form__info').empty();
    $('#form__firstName').append(input_firstName);
    $('#form__lastName').append(input_lastName);

    $('#user__profile__save').on('click',()=>{
        $('#user__profile__form').submit();
    })
  
})

$('#form__image__upload').on('change',function(){
    if(this.files && this.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e){
            $('#user__profile__image').attr('src', e.target.result);
        }

        reader.readAsDataURL(this.files[0]);
    }
})
