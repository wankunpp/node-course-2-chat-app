const expect = require('expect');

const {isRealString} = require('./validation');

describe('isRealString', () => {
    it('should reject non-string values', ()=>{
        const res = isRealString(98);
        expect(res).toBeFalsy();
    });

    it('should reject string with only spaces', ()=>{
        const res = isRealString('  ');
        expect(res).toBeFalsy();
    });

    it('should allow string with non-space characters', () => {
        const res = isRealString(' ada a ');
        expect(res).toBeTruthy();
    })
})