const expect = require('expect');

const {Users} = require('./users');

describe('Users', () =>{
    beforeEach(() =>{
        users = new Users();
        users.users = [{
            id:'1',
            name: 'mkie',
            room: 'node course'
        },{
            id:'2',
            name: 'luke',
            room: 'js course'
        },{
            id:'3',
            name:'lolo',
            room:'node course'
        }]
    })

    it('should add new User', () =>{
        let users = new Users();
        const user = {
            id:'123',
            name: 'Andrew',
            room: 'The Office fans'
        };

        users.addUser('123','Andrew','The Office fans');
        expect(users.users).toEqual([user]);
    });

    it('should remove a user', () =>{
        const id = '1';
        const user = users.removeUser(id);

        expect(user.id).toBe(id);
        expect(users.users.length).toBe(2);
    });

    it('should not remove user', () =>{
        const id = '4';
        const user = users.removeUser(id);

        expect(user).toBeUndefined();
        expect(users.users.length).toBe(3);
    });

    it('should find user', ()=>{
        const id = '1';
        const user =users.getUser(id);
        expect(user).toEqual({id:'1',name:'mkie',room:'node course'});
    });

    it('should not find user', ()=>{
        const id ='4';
        const user = users.getUser(id);
        expect(user).toBeUndefined();
    });

    it('should return names for node course', () =>{
        var userlist = users.getUserList('node course');

        expect(userlist).toEqual(['mkie','lolo']);
    })
})