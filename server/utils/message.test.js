const expect = require('expect');
const {generateMessage} = require('./message');

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
})