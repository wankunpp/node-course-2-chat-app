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
        var rooms = this.users.map(user=> user.room);
        var roomList = Array.from(new Set(rooms));

        return roomList;
    }

    hasUser(username) {
        const usernames = this.users.slice().map(user => user.name);
        if(usernames.indexOf(username) === -1) return false;
        return true;
    }
}

module.exports = {Users};