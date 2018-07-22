const _ = require('lodash');

class Users {
    constructor(){
        this.users = [];
    }

    addUser(id,name) {
        const user = {id, name};
        this.users.push(user);
        return user;
    }

    addUser(id, name, room) {
        var user = {id, name, room};
        this.users.push(user);
        return user;
    }

    getUser(id){
        var user = this.users.find(user => user.id === id);
        return user;
    }

    getUserByName(name) {
        const user = this.users.find(user => user.name === name);
        return user;
    }

    getUsers(){
        return this.users.slice();
    }

    removeUser(id){
        var user = this.users.find(user => user.id === id);
        if(user){
            var index=  this.users.indexOf(user);
            this.users.splice(index,1);
        }
    
        return user;
    }

    getUserList(room){
        var users = this.users.filter(user =>user.room === room);
        var namesArray = users.map(user => user.name);

        return namesArray;
    }

    getRoomList(){
        const user_in_room = this.users.filter(user => user.room);
        const rooms = user_in_room.map(user=> user.room);
        var roomList = _.uniq(rooms);

        return roomList;
    }

    hasUser(username) {
        const user= this.users.find(user => user.name === username);
        if(user) return true;
        return false;
    }

    userLeaveRoom(id){
        const user = this.users.find(user => user.id === id);
        if(user){
            this.users.find(user => user.id === id).room = undefined;
        }
        return user;
    }
}

module.exports = {Users};