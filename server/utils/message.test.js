const expect = require('expect');
const {generateMessage, generateLocaitonMessage} = require('./message');

describe('generateMessage', () => {
    it('should generate correct message object', (done) => {
        const message = generateMessage('kun','hi');
        expect(message).toMatchObject({
            'from': 'kun',
            'text': 'hi',
        });
        expect(typeof message.createdAt).toBe('number');
        done();
    })
});

describe('generaateLocationMessage', () =>{
    it('should generate correct location object', () =>{
        const locationMessage = generateLocaitonMessage('kun',33,44);
        expect(locationMessage).toMatchObject({
            'from': 'kun',
            'url': 'https://www.google.com/maps?q=33,44'
        });
        expect(typeof locationMessage.createdAt).toBe('number');
    })
})
