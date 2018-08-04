const env = process.env.NODE_ENV || 'development';

if(env === 'development'){
    process.env.PORT = 3000;
    process.env.MONGODB_URI ='mongodb://localhost:27017/ChatApp';
    process.env.JWT_SECRET = 'dakldsjalkjd1231sad';
    process.env.AWS_ACCESS_KEY_ID = 'AKIAJUY62OP2AH5TCB6A';
    process.env.AWS_SECRET_ACCESS_KEY = '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'
}